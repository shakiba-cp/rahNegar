# -*- coding: utf-8 -*-
"""تست خودکار جریان‌های اصلی سامانه با client داخلی Flask."""
import io
import sys

from openpyxl import Workbook, load_workbook

import app as A
import jalali as J

c = A.app.test_client()
ok = []


def check(name, cond, extra=""):
    if cond:
        ok.append(name)
    else:
        print(f"  ⛔ FAIL: {name} {extra}")
        sys.exit(1)


def login(user, pw):
    r = c.post("/login", data={"username": user, "password": pw},
               follow_redirects=True)
    return r


# ---------- احراز هویت
r = c.get("/")
check("redirect به login", r.status_code in (302, 301))
r = login("admin", "bad")
check("رمز اشتباه رد می‌شود", b"\xd8\xa7\xd8\xb4\xd8\xaa\xd8\xa8\xd8\xa7" in r.data)
r = login("admin", "admin123")
check("ورود مدیر", r.status_code == 200 and "داشبورد".encode() in r.data)

# ---------- داشبورد
r = c.get("/")
check("داشبورد: نمودارها", all(x.encode() in r.data for x in
      ["فعالیت‌ها به تفکیک حوزه", "سهم هر حوزه", "نمودار وضعیت",
       "روند ماهانه", "ورودهای Excel", "آخرین فعالیت‌ها"]))

# ---------- ثبت فعالیت (فرم پویا)
db = A.get_db.__wrapped__() if hasattr(A.get_db, "__wrapped__") else None
with A.app.app_context():
    dom = A.get_db().execute("SELECT * FROM domains WHERE name='ارزیابی امنیتی وب'").fetchone()
    fields = A.get_db().execute("SELECT * FROM form_fields WHERE domain_id=? ORDER BY sort_order",
                                (dom["id"],)).fetchall()
    fmap = {f["label"]: f for f in fields}
check("۱۳ حوزه موجود", True)

r = c.get(f"/activities/new?domain_id={dom['id']}")
check("فرم پویا حوزه ارزیابی وب", "کارفرما".encode() in r.data
      and "مشخصات درخواست‌دهنده فعالیت".encode() in r.data
      and "مشخصات تحویل فعالیت".encode() in r.data
      and "مدیریت فیلدهای این حوزه".encode() in r.data)

payload = {"status": "در حال انجام"}
for f in fields:
    if f["field_type"] == "date":
        payload[f"f{f['id']}__y"], payload[f"f{f['id']}__m"], payload[f"f{f['id']}__d"] = (
            "1405", "04", "29")
    elif f["field_type"] == "select":
        payload[f"f{f['id']}"] = "زیاد"
    else:
        payload[f"f{f['id']}"] = {"کارفرما": "بانک الف", "کارشناس": "مدیر سامانه",
                                  "آسیب پذیری": "SQL Injection",
                                  "شماره تیکت": "T-4321",
                                  "آدرس": "https://example.com",
                                  "توضیحات": "تست"}.get(f["label"], "مقدار تست")
r = c.post(f"/activities/new?domain_id={dom['id']}", data=payload, follow_redirects=True)
check("ثبت فعالیت", "فعالیت با موفقیت ثبت شد".encode() in r.data, r.data[:80])

with A.app.app_context():
    act = A.get_db().execute("SELECT * FROM activities ORDER BY id DESC LIMIT 1").fetchone()
check("meta: تاریخ میلادی صحیح", act["date"] == "2026-07-20", act["date"])
check("meta: عنوان از فیلد کارفرما", act["title"] == "بانک الف", act["title"])
check("meta: تیکت", act["ticket"] == "T-4321")
aid = act["id"]

# ---------- لیست/جستجو/فیلتر
r = c.get("/activities?q=بانک")
check("جستجوی عنوان", "بانک الف".encode() in r.data)
r = c.get("/activities?from__y=1405&from__m=04&from__d=01&to__y=1405&to__m=05&to__d=31")
check("فیلتر بازه شمسی", "بانک الف".encode() in r.data)
r = c.get("/activities?from__y=1400&from__m=01&from__d=01&to__y=1401&to__m=12&to__d=29")
check("بازه قدیمی خالی", "فعالیتی یافت نشد".encode() in r.data or "بانک الف".encode() not in r.data)

# ---------- ویرایش
payload[f"f{fmap['آدرس']['id']}"] = "https://new.example.com"
payload["status"] = "انجام شده"
r = c.post(f"/activities/{aid}/edit", data=payload, follow_redirects=True)
check("ویرایش فعالیت", "به‌روزرسانی شد".encode() in r.data
      and "new.example.com".encode() in r.data)

# کسر فیلد الزامی → خطا
bad = dict(payload)
bad[f"f{fmap['کارفرما']['id']}"] = ""
r = c.post(f"/activities/{aid}/edit", data=bad, follow_redirects=True)
check("اعتبارسنجی الزامی", "الزامی".encode() in r.data)

# ---------- پیوست
r = c.post(f"/activities/{aid}/attachments",
           data={"files": [(io.BytesIO(b"hello world"), "گزارش.pdf")]},
           content_type="multipart/form-data", follow_redirects=True)
check("آپلود پیوست", "فایل پیوست شد".encode() in r.data)
with A.app.app_context():
    att = A.get_db().execute("SELECT * FROM attachments WHERE activity_id=?",
                             (aid,)).fetchone()
r = c.get(f"/attachments/{att['id']}/download")
check("دانلود پیوست", r.data == b"hello world")
r = c.post(f"/activities/{aid}/attachments",
           data={"files": [(io.BytesIO(b"x"), "evil.exe")]},
           content_type="multipart/form-data", follow_redirects=True)
check("رد فرمت غیرمجاز", "مجاز نیست".encode() in r.data)

# ---------- ورود Excel
wb = Workbook()
ws = wb.active
hdr = [f["label"] for f in fields]
ws.append(hdr + ["وضعیت"])
def _row(**kw):
    return [kw.get(h, "") for h in hdr] + [kw["وضعیت_سیستم"]]
ws.append(_row(**{"تاریخ": "۱۴۰۵/۰۴/۱۰", "کارشناس": "رضا کریمی", "کارفرما": "شرکت ج",
                  "آسیب پذیری": "XSS", "شدت": "کم", "آدرس": "https://b.ir",
                  "شماره تیکت": "T-100", "زمان درخواست": "۱۴۰۵/۰۴/۱۰", "وضعیت_سیستم": "انجام شده"}))
ws.append(_row(**{"تاریخ": "1405/04/11", "کارشناس": "سارا احمدی", "کارفرما": "سازمان د",
                  "آسیب پذیری": "IDOR", "شدت": "بحرانی", "آدرس": "https://c.ir",
                  "شماره تیکت": "T-101", "وضعیت_سیستم": "در حال انجام"}))
ws.append(_row(**{"تاریخ": "نامعتبر!", "کارشناس": "بدون تاریخ", "شدت": "کم",
                  "کارفرما": "باید خطا بخورد", "وضعیت_سیستم": ""}))
bio = io.BytesIO()
wb.save(bio)
bio.seek(0)
r = c.post("/import", data={"domain_id": str(dom["id"]),
                            "file": (bio, "فعالیت‌ها.xlsx")},
           content_type="multipart/form-data", follow_redirects=True)
check("پیام نتیجه Excel", "فعالیت ثبت شد".encode() in r.data
      and "ردیف دارای خطا".encode() in r.data, r.data[:200])
with A.app.app_context():
    imp = A.get_db().execute("SELECT * FROM excel_imports ORDER BY id DESC").fetchone()
check("لاگ import: ۲ موفق ۱ خطا", imp["success_rows"] == 2 and imp["error_rows"] == 1,
      (imp["success_rows"], imp["error_rows"]))
r = c.get(f"/import/{imp['id']}")
check("صفحه نتیجه import", "تعداد کل ردیف‌ها".encode() in r.data)

# --- تیکت از Excel خوانده و قابل جستجو است (رفع ایراد «تیکت‌ها خونده نمی‌شوند»)
with A.app.app_context():
    t_rows = A.get_db().execute(
        "SELECT ticket FROM activities WHERE ticket LIKE 'T-1%' ORDER BY id").fetchall()
check("تیکت از Excel خوانده شد", any(r["ticket"] == "T-100" for r in t_rows),
      [r["ticket"] for r in t_rows])
r = c.get("/activities?ticket=T-100")
check("جستجوی تیکتِ واردشده از Excel", "شرکت ج".encode() in r.data)

# --- سلول عددی اکسل (4321.0) به تیکت صحیح «4321» تبدیل می‌شود
wb_n = Workbook()
ws_n = wb_n.active
ws_n.append(["تاریخ", "کارشناس", "کارفرما", "شدت", "شماره تیکت"])
ws_n.append(["1405/04/12", "تست عددی", "شرکت عددی", "کم", 4321.0])
bio_n = io.BytesIO()
wb_n.save(bio_n)
bio_n.seek(0)
r = c.post("/import", data={"domain_id": str(dom["id"]),
                            "file": (bio_n, "ticket-num.xlsx")},
           content_type="multipart/form-data", follow_redirects=True)
with A.app.app_context():
    tick = A.get_db().execute(
        "SELECT ticket FROM activities WHERE title='شرکت عددی' ORDER BY id DESC").fetchone()
check("تیکت عددی اکسل صحیح خوانده شد", tick and tick["ticket"] == "4321",
      tick["ticket"] if tick else None)

# --- فایل ناسازگار (ستون‌های بی‌ربط): هیچ فعالیتی ثبت نمی‌شود
with A.app.app_context():
    cnt_before = A.get_db().execute("SELECT COUNT(*) c FROM activities").fetchone()["c"]
wb_x = Workbook()
ws_x = wb_x.active
ws_x.append(["ستون الف", "ستون ب", "ستون ج"])
ws_x.append([1, 2, 3])
ws_x.append([4, 5, 6])
bio_x = io.BytesIO()
wb_x.save(bio_x)
bio_x.seek(0)
r = c.post("/import", data={"domain_id": str(dom["id"]),
                            "file": (bio_x, "bad.xlsx")},
           content_type="multipart/form-data", follow_redirects=True)
with A.app.app_context():
    cnt_after = A.get_db().execute("SELECT COUNT(*) c FROM activities").fetchone()["c"]
    imp_bad = A.get_db().execute("SELECT * FROM excel_imports ORDER BY id DESC").fetchone()
check("فایل ناسازگار هیچ فعالیتی ثبت نمی‌کند", cnt_before == cnt_after
      and imp_bad["success_rows"] == 0 and imp_bad["error_rows"] == 2,
      (cnt_before, cnt_after, imp_bad["success_rows"]))
check("پیام لغو ورود فایل ناسازگار", "فایل ثبت نشد".encode() in r.data)

# --- ردیف بدون هیچ مقدار معتبر (ghost) ثبت نمی‌شود
wb_g = Workbook()
ws_g = wb_g.active
ws_g.append(["کارفرما", "ستون ناشناس"])
ws_g.append(["", "داده زائد"])
ws_g.append(["شرکت سالم", "مقدار"])
bio_g = io.BytesIO()
wb_g.save(bio_g)
bio_g.seek(0)
r = c.post("/import", data={"domain_id": str(dom["id"]),
                            "file": (bio_g, "ghost.xlsx")},
           content_type="multipart/form-data", follow_redirects=True)
with A.app.app_context():
    cnt_ghost = A.get_db().execute("SELECT COUNT(*) c FROM activities").fetchone()["c"]
    titles_g = [x[0] for x in A.get_db().execute(
        "SELECT title FROM activities WHERE title IN ('شرکت سالم','داده زائد')")]
check("ردیف ghost ثبت نمی‌شود", cnt_ghost == cnt_after and "داده زائد" not in titles_g,
      (cnt_after, cnt_ghost))

# قالب نمونه
r = c.get(f"/import/template/{dom['id']}")
check("دانلود قالب نمونه xlsx", r.status_code == 200
      and r.data[:2] == b"PK")

# ---------- گزارش‌ها و خروجی‌ها
r = c.get("/reports?ticket=4321")
check("گزارش با فیلتر تیکت", "بانک الف".encode() in r.data)
r = c.get("/reports?export=csv")
check("خروجی CSV", r.status_code == 200 and r.data.startswith(b"\xef\xbb\xbf")
      and "شماره تیکت".encode("utf-8") in r.data)
r = c.get("/reports?export=excel")
check("خروجی Excel", r.data[:2] == b"PK")
wb2 = load_workbook(io.BytesIO(r.data))
check("ستون تاریخ شمسی در Excel", "تاریخ (شمسی)" in
      [x.value for x in wb2.active[1]])
rows = list(wb2.active.iter_rows(values_only=True))
check("تاریخ‌ها در خروجی شمسی‌اند", any(str(c).startswith("۱۴۰۵/") or str(c).startswith("1405/")
      for row in rows[1:] for c in row if c), rows[1] if len(rows) > 1 else None)
r = c.get("/reports?export=pdf")
check("صفحه چاپ PDF", r.status_code == 200 and b"report-print.js" in r.data and b"print-btn" in r.data)

# ---------- کاربران
r = c.post("/users/new", data={"username": "reza", "full_name": "رضا کریمی",
                               "role": "expert", "password": "123456"},
           follow_redirects=True)
check("ایجاد کارشناس", "کاربر ایجاد شد".encode() in r.data)
r = c.post("/users/new", data={"username": "reza", "full_name": "تکراری",
                               "role": "expert", "password": "123456"},
           follow_redirects=True)
check("رد نام کاربری تکراری", "قبلاً ثبت شده".encode() in r.data)

# ---------- حوزه/فیلد
r = c.post("/domains", data={"name": "حوزه آزمایشی"}, follow_redirects=True)
check("افزودن حوزه", "حوزه جدید افزوده شد".encode() in r.data)
with A.app.app_context():
    nd = A.get_db().execute("SELECT * FROM domains WHERE name='حوزه آزمایشی'").fetchone()
r = c.post(f"/domains/{nd['id']}/fields/add",
           data={"label": "آدرس IP", "field_type": "text"},
           follow_redirects=True)
check("افزودن فیلد پویا", "فیلد افزوده شد".encode() in r.data
      and "آدرس IP".encode() in r.data)
r = c.get(f"/activities/new?domain_id={nd['id']}")
check("فیلد جدید در فرم دیده می‌شود", "آدرس IP".encode() in r.data)
# حذف حوزه بدون فعالیت
r = c.post(f"/domains/{nd['id']}/delete", follow_redirects=True)
check("حذف حوزه خالی", "حوزه حذف شد".encode() in r.data)
# حذف حوزهِ دارای فعالیت → ممنوع
r = c.post(f"/domains/{dom['id']}/delete", follow_redirects=True)
check("ممنوعیت حذف حوزه دارای فعالیت", "غیرفعال کنید".encode() in r.data)

# ---------- تنظیمات
r = c.post("/settings", data={"system_name": "سامانه تست امنیت",
                              "max_upload_mb": "5",
                              "allowed_formats": "pdf,jpg,zip"},
           follow_redirects=True)
check("ذخیره تنظیمات", "تنظیمات ذخیره شد".encode() in r.data)
with A.app.app_context():
    assert A.get_setting("system_name") == "سامانه تست امنیت"
    assert A.allowed_formats() == ["pdf", "jpg", "zip"]
    assert A.max_upload_mb() == 5
check("اعمال تنظیمات", True)

# ---------- سطح دسترسی کارشناس
c.get("/logout")
r = login("reza", "123456")
check("ورود کارشناس", r.status_code == 200)
r = c.get("/activities")
check("کارشناس فقط فعالیت خودش را می‌بیند", "بانک الف".encode() not in r.data)
r = c.get(f"/activities/{aid}")
check("کارشناس به فعالیت دیگران ۴۰۳", r.status_code == 403)
r = c.get("/users")
check("کارشناس به کاربران ۴۰۳", r.status_code == 403)
r = c.get("/settings")
check("کارشناس به تنظیمات ۴۰۳", r.status_code == 403)
r = c.post(f"/activities/{aid}/delete")
check("حذف فقط برای مدیر", r.status_code == 403)
r = c.get("/import")
check("کارشناس می‌تواند Excel وارد کند", r.status_code == 200
      and "ورود اطلاعات از Excel".encode() in r.data)

# تخصیص تسک: مدیر برای کارشناس فعالیت ثبت می‌کند
c.get("/logout"); login("admin", "admin123")
with A.app.app_context():
    rid = A.get_db().execute("SELECT id FROM users WHERE username='reza'").fetchone()["id"]
payload3 = {"status": "انجام شده", "owner_id": str(rid)}
for f in fmap.values():
    if f["field_type"] == "date":
        payload3[f"f{f['id']}__y"], payload3[f"f{f['id']}__m"], payload3[f"f{f['id']}__d"] = ("1405", "02", "10")
    elif f["field_type"] == "select":
        payload3[f"f{f['id']}"] = "کم"
    else:
        payload3[f"f{f['id']}"] = "تسک مدیر برای رضا" if f["label"] == "کارفرما" else "تست"
r = c.post(f"/activities/new?domain_id={dom['id']}", data=payload3, follow_redirects=True)
check("تخصیص تسک توسط مدیر", "تخصیص یافت".encode() in r.data)
c.get("/logout"); login("reza", "123456")
r = c.get("/activities")
check("کارشناس تسک تخصیص‌یافته را می‌بیند", "تسک مدیر برای رضا".encode() in r.data)
r = c.get(f"/activities/new?domain_id={dom['id']}")
check("دکمه مدیریت فیلدها برای کارشناس نیست",
      "مدیریت فیلدهای این حوزه".encode() not in r.data)
# ثبت فعالیت توسط کارشناس
with A.app.app_context():
    fields2 = A.get_db().execute("SELECT * FROM form_fields WHERE domain_id=? AND field_key='date'",
                                 (dom["id"],)).fetchone()
payload2 = {"status": "در حال انجام"}
for f in fmap.values():
    if f["field_type"] == "date":
        payload2[f"f{f['id']}__y"], payload2[f"f{f['id']}__m"], payload2[f"f{f['id']}__d"] = (
            "1405", "01", "15")
    elif f["field_type"] == "select":
        payload2[f"f{f['id']}"] = "کم"
    else:
        payload2[f"f{f['id']}"] = "فعالیت رضا" if f["label"] == "کارفرما" else "تست"
r = c.post(f"/activities/new?domain_id={dom['id']}", data=payload2, follow_redirects=True)
check("ثبت فعالیت کارشناس", "موفقیت".encode() in r.data)
r = c.get("/reports")
check("گزارش کارشناس فقط مال خودش", "بانک الف".encode() not in r.data
      and "فعالیت رضا".encode() in r.data)


# ---------- خروجی: بدون شناسه + همه فیلدها + بدون تکرار تیکت
c.get("/logout"); login("admin", "admin123")
r = c.get("/reports?export=excel")
wb3 = load_workbook(io.BytesIO(r.data))
hdrs = [x.value for x in wb3.active[1]]
check("خروجی شناسه سیستمی ندارد", "شناسه" not in hdrs, hdrs)
check("تیکت فقط یک ستون", hdrs.count("شماره تیکت") == 1, hdrs)
check("همه فیلدها در خروجی‌اند", "زمان درخواست" in hdrs and "آسیب پذیری" in hdrs, hdrs)

# ---------- انتخاب ستون خروجی توسط مدیر
r = c.get("/reports", query_string=[("export", "excel"), ("col", "حوزه"), ("col", "وضعیت")])
wb4 = load_workbook(io.BytesIO(r.data))
hdrs2 = [x.value for x in wb4.active[1]]
check("انتخاب ستون خروجی مدیر", hdrs2 == ["حوزه", "وضعیت"], hdrs2)
r = c.get("/reports")
check("کارت انتخاب ستون برای مدیر", "ستون‌های خروجی".encode() in r.data)

# ---------- تیکت در فرم اصلی استخراج IP (نه فقط بخش تحویل)
with A.app.app_context():
    dom_ip = A.get_db().execute("SELECT * FROM domains WHERE name='استخراج IP آسیب پذیر'").fetchone()
r = c.get(f"/activities/new?domain_id={dom_ip['id']}")
body = r.data.decode()
check("استخراج IP تیکت در فرم اصلی دارد", "شماره تیکت" in body)
sect = body.index("مشخصات تحویل فعالیت") if "مشخصات تحویل فعالیت" in body else 10**9
main_part = body[:sect]
check("تیکت قبل از بخش تحویل است", "شماره تیکت" in main_part)

# ---------- گردش‌کار تسک: پاسخ + انجام شد
with A.app.app_context():
    task = A.get_db().execute("""SELECT a.* FROM activities a
        WHERE a.created_by <> a.user_id ORDER BY a.id DESC LIMIT 1""").fetchone()
    tid = task["id"]
c.get("/logout"); login("reza", "123456")  # رضا مالک تسک است
r = c.get("/activities")
check("بج تسک در لیست کارشناس", "تسک".encode() in r.data)
r = c.get(f"/activities/{tid}")
check("برچسب تسک در صفحه فعالیت", "تخصیص‌یافته".encode() in r.data)
r = c.post(f"/activities/{tid}/respond", data={"body": "ارزیابی انجام شد، گزارش ضمیمه شد."},
           follow_redirects=True)
check("ثبت پاسخ توسط کارشناس", "پاسخ ثبت شد".encode() in r.data
      and "ارزیابی انجام شد".encode() in r.data)
r = c.post(f"/activities/{tid}/complete", follow_redirects=True)
check("علامت انجام شد", "علامت‌گذاری شد".encode() in r.data)
with A.app.app_context():
    st = A.get_db().execute("SELECT status FROM activities WHERE id=?", (tid,)).fetchone()["status"]
check("وضعیت انجام شده شد", st == "انجام شده", st)
c.get("/logout"); login("admin", "admin123")
r = c.get(f"/activities/{tid}")
check("مدیر پاسخ کارشناس را می‌بیند", "ارزیابی انجام شد".encode() in r.data)

# ---------- PDF تک‌حوزه: فقط نمودارهای همان حوزه
r = c.get(f"/reports?export=pdf&domain={dom['id']}")
h5 = r.data.decode()
check("PDF تک‌حوزه بدون نمودار سهم", "سهم حوزه‌ها" not in h5)
check("PDF تک‌حوزه دارای وضعیت", "نمودار وضعیت" in h5)
# ساخت یک فعالیت در حوزه دوم تا نمودار سهم حوزه‌ها دیده شود
with A.app.app_context():
    dom_b = A.get_db().execute("SELECT * FROM domains WHERE name='بدافزار'").fetchone()
    fb = A.get_db().execute("SELECT * FROM form_fields WHERE domain_id=? AND is_active=1",
                            (dom_b["id"],)).fetchall()
pb = {"status": "انجام شده"}
for f in fb:
    if f["field_type"] == "date":
        pb[f"f{f['id']}__y"], pb[f"f{f['id']}__m"], pb[f"f{f['id']}__d"] = ("1405", "03", "01")
    elif f["field_type"] == "select":
        opts = __import__("json").loads(f["options"] or "[]")
        pb[f"f{f['id']}"] = opts[0] if opts else ""
    else:
        pb[f"f{f['id']}"] = "Emotet" if f["label"] == "بدافزار" else ("رضا کریمی" if f["field_key"] == "expert" else "تست")
r = c.post(f"/activities/new?domain_id={dom_b['id']}", data=pb, follow_redirects=True)
check("ثبت فعالیت حوزه دوم", "موفقیت".encode() in r.data)
r = c.get("/reports?export=pdf")
h6 = r.data.decode()
check("PDF همه حوزه‌ها نمودار سهم دارد", "سهم حوزه‌ها" in h6)

print(f"\n✅ همه {len(ok)} تست موفقیت‌آمیز بود.")
