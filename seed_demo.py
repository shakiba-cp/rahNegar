# -*- coding: utf-8 -*-
"""ثبت داده‌های نمونه برای تست سامانه (اختیاری).
اجرا:  python seed_demo.py
ایجاد می‌کند: سه کاربر کارشناس + فعالیت‌های تصادفی در ۱۲ ماه اخیر.
کاربران نمونه:  ali / reza / sara   —  رمز همه: 123456
"""
import json
import random
import sqlite3
import sys

from app import DB_PATH, STATUSES, now_iso
import jalali
from werkzeug.security import generate_password_hash

random.seed(42)

EXPERTS = [("ali", "علی محمدی"), ("reza", "رضا کریمی"), ("sara", "سارا احمدی")]
SAMPLES = {
    "ارزیابی امنیتی وب": {"کارفرما": ["بانک الف", "شرکت ب", "سازمان ج"], "آسیب پذیری": ["SQL Injection", "XSS", "CSRF", "IDOR"], "شدت": ["کم", "متوسط", "زیاد", "بحرانی"], "آدرس": ["https://example.com/login", "https://app.example.ir/panel"], "پروفایل": ["پروفایل صفر", "پروفایل ۱", "پروفایل ۲"]},
    "ارزیابی امنیتی اندروید": {"کارفرما": ["همراه اول", "اپلیکیشن دولتی ج"], "برنامه": ["ir.example.app", "com.banking.app"], "آسیب پذیری": ["Insecure Storage", "No Root Detection"]},
    "بدافزار": {"بدافزار": ["Emotet", "AgentTesla", "Lokibot", "AsyncRAT"]},
    "رصد": {"عنوان": ["هشدار CERT درباره CVE-2025-1234", "کمپین فیشینگ جدید", "انتشار داده‌های لو رفته"]},
    "اخبار پورتال ماهر": {"CVE": ["CVE-2025-1234", "CVE-2025-9876"], "محصول": ["Windows Server", "Chrome", "FortiGate"]},
    "استخراج IP آسیب پذیر": {"CVE": ["CVE-2024-5555", "CVE-2025-0001"], "محصول": ["VMware ESXi", "Cisco ASA"], "حوزه": ["دیتاسنتر", "حاکمیتی غیرزیرساختی", "پایه"]},
}
GENERIC_TITLE = ["بررسی و مستندسازی", "پیگیری تیکت", "تحلیل نمونه", "هماهنگی با تیم"]


def main():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row

    uids = {}
    for un, fn in EXPERTS:
        row = db.execute("SELECT id FROM users WHERE username=?", (un,)).fetchone()
        if row:
            uids[un] = row["id"]
        else:
            cur = db.execute("INSERT INTO users(username,password_hash,full_name,role,created_at)"
                             " VALUES(?,?,?,?,?)", (un, generate_password_hash("123456"), fn,
                                                  "expert", now_iso()))
            uids[un] = cur.lastrowid

    # نمونه کارآموز برای نمایش سرپرستی نیروها در دمو (v5.7)
    sup_list = list(uids.values())
    for i, (un, fn) in enumerate((("trainee1", "نگار موسوی (کارآموز)"),
                                  ("trainee2", "امیر رستمی (کارآموز)"))):
        if not db.execute("SELECT 1 FROM users WHERE username=?", (un,)).fetchone():
            db.execute("INSERT INTO users(username,password_hash,full_name,role,"
                       "is_trainee,supervisor_id,created_at) VALUES(?,?,?,?,?,?,?)",
                       (un, generate_password_hash("123456"), fn, "expert", 1,
                        sup_list[i % len(sup_list)] if sup_list else None, now_iso()))

    admin = db.execute("SELECT id FROM users WHERE username='admin'").fetchone()["id"]
    if db.execute("SELECT COUNT(*) c FROM activities").fetchone()["c"] > 0:
        print("⛔ از قبل فعالیتی در سیستم وجود دارد؛ از ثبت تکراری جلوگیری شد.")
        sys.exit(0)

    domains = db.execute("SELECT * FROM domains").fetchall()
    ty, tm=None, None
    count = 0
    for _ in range(90):
        d = random.choice(domains)
        uid = random.choice(list(uids.values()) + [admin])
        fields = db.execute("SELECT * FROM form_fields WHERE domain_id=? AND is_active=1 "
                            "ORDER BY sort_order", (d["id"],)).fetchall()
        # تاریخ تصادفی در ۱۲ ماه اخیر (میلادی)
        import datetime as _dt
        gdate = _dt.date.today() - _dt.timedelta(days=random.randint(0, 365))
        g_iso = gdate.isoformat()
        samp = SAMPLES.get(d["name"], {})
        vals = {}
        tn = lambda: random.choice(GENERIC_TITLE)
        for f in fields:
            lab, typ = f["label"], f["field_type"]
            if typ == "date":
                vals[f["id"]] = g_iso
            elif lab in samp:
                vals[f["id"]] = random.choice(samp[lab])
            elif (f["field_key"] or "") == "expert":
                vals[f["id"]] = db.execute("SELECT full_name FROM users WHERE id=?",
                                           (uid,)).fetchone()["full_name"]
            elif (f["field_key"] or "") == "ticket":
                vals[f["id"]] = str(random.randint(3, 9) * 1000 + random.randint(11, 99))
            elif (f["field_key"] or "") == "title":
                vals[f["id"]] = (random.choice(samp[lab]) if lab in samp else tn())
            elif typ == "number":
                vals[f["id"]] = str(random.randint(1, 40))
            elif typ == "select":
                vals[f["id"]] = random.choice(json.loads(f["options"] or "[]") or [""])
            else:
                vals[f["id"]] = "توضیح نمونه" if typ == "textarea" else "مقدار نمونه"
        cur = db.execute("INSERT INTO activities(domain_id,user_id,status,created_at,"
                         "updated_at,date) VALUES(?,?,?,?,?,?)",
                         (d["id"], uid, random.choices(STATUSES, [5, 3, 2])[0],
                          g_iso + " 09:00:00", g_iso + " 09:00:00", g_iso))
        aid = cur.lastrowid
        for fid, v in vals.items():
            db.execute("INSERT INTO activity_values(activity_id,field_id,value) VALUES(?,?,?)",
                       (aid, fid, v))
        # عنوان
        title = next((vals[f["id"]] for f in fields if (f["field_key"] or "") == "title"), "")
        ticket = next((vals[f["id"]] for f in fields if (f["field_key"] or "") == "ticket"), "")
        db.execute("UPDATE activities SET title=?, ticket=? WHERE id=?", (title, ticket, aid))
        count += 1

    y, m, d2 = jalali.today_jalali()
    db.execute("INSERT INTO excel_imports(domain_id,user_id,filename,total_rows,success_rows,"
               "error_rows,errors,imported_at) VALUES(?,?,?,?,?,?,?,?)",
               (domains[0]["id"], admin, "نمونه.xlsx", 50, 48, 2,
                f"ردیف {jalali.fa(7)}: ستون «تاریخ ارزیابی»: تاریخ نامعتبر", now_iso()))
    db.commit()
    print(f"✅ {count} فعالیت نمونه + کاربران نمونه ثبت شد. (رمز کارشناسان: 123456)")


if __name__ == "__main__":
    main()
