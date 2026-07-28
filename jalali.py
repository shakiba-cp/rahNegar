# -*- coding: utf-8 -*-
"""تبدیل تاریخ شمسی <-> میلادی (پیاده‌سازی خالص پایتون، بدون وابستگی).
تاریخ‌ها در پایگاه داده به‌صورت میلادی (ISO) ذخیره می‌شوند و فقط هنگام
نمایش/ورود، شمسی تبدیل می‌شوند تا مرتب‌سازی، جستجو و گزارش‌گیری دقیق باشد.
"""
import datetime
import math

MONTH_NAMES = [
    "", "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

_PERSIAN_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
_ASCII_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")


def fa(value):
    """تبدیل ارقام لاتین به فارسی."""
    return str(value).translate(_PERSIAN_DIGITS)


def to_ascii_digits(value):
    return str(value).translate(_ASCII_DIGITS)


def _div(a, b):
    # مطابق مرجع jalaali: کوتاه‌سازی به سمت صفر (~~ در جاوااسکریپت) نه floor
    q = a / b
    return math.floor(q) if q >= 0 else math.ceil(q)


def _mod(a, b):
    return a - b * _div(a, b)


_BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
           1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178]


def _jal_cal(jy):
    gy = jy + 621
    leap_j = -14
    jp = _BREAKS[0]
    jump = 0
    for i in range(1, len(_BREAKS)):
        jm = _BREAKS[i]
        jump = jm - jp
        if jy < jm:
            break
        leap_j += _div(jump, 33) * 8 + _div(_mod(jump, 33), 4)
        jp = jm
    n = jy - jp
    leap_j += _div(n, 33) * 8 + _div(_mod(n, 33) + 3, 4)
    if _mod(jump, 33) == 4 and jump - n == 4:
        leap_j += 1
    # مطابق الگوریتم مرجع jalaali (JDN-based)
    leap_g = _div(gy, 4) - _div((_div(gy, 100) + 1) * 3, 4) - 150
    march = 20 + leap_j - leap_g
    if jump - n < 6:
        n = n - jump + _div(jump + 4, 33) * 33
    leap = _mod(_mod(n + 1, 33) - 1, 4)
    if leap == -1:
        leap = 4
    return leap, gy, march


def _g2d(gy, gm, gd):
    d = _div((gy + _div(gm - 8, 6) + 100100) * 1461, 4) \
        + _div(153 * _mod(gm + 9, 12) + 2, 5) + gd - 34840408
    d = d - _div(_div(gy + 100100 + _div(gm - 8, 6), 100) * 3, 4) + 752
    return d


def _d2g(jdn):
    j = 4 * jdn + 139361631
    j += _div(_div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
    i = _div(_mod(j, 1461), 4) * 5 + 308
    gd = _div(_mod(i, 153), 5) + 1
    gm = _mod(_div(i, 153), 12) + 1
    gy = _div(j, 1461) - 100100 + _div(8 - gm, 6)
    return gy, gm, gd


def _j2d(jy, jm, jd):
    leap, gy, march = _jal_cal(jy)
    return _g2d(gy, 3, march) + (jm - 1) * 31 - _div(jm, 7) * (jm - 7) + jd - 1


def _d2j(jdn):
    gy = _d2g(jdn)[0]
    jy = gy - 621
    leap, _, march = _jal_cal(jy)
    jdn1f = _g2d(gy, 3, march)
    k = jdn - jdn1f
    if k >= 0:
        if k <= 185:
            return jy, _div(k, 31) + 1, _mod(k, 31) + 1
        k -= 186
    else:
        jy -= 1
        k += 179
        if leap == 1:
            k += 1
    return jy, 7 + _div(k, 30), _mod(k, 30) + 1


def j2g(jy, jm, jd):
    """شمسی -> (gy, gm, gd)"""
    return _d2g(_j2d(jy, jm, jd))


def g2j(gy, gm, gd):
    """میلادی -> (jy, jm, jd)"""
    return _d2j(_g2d(gy, gm, gd))


def is_jalali_leap(jy):
    return _jal_cal(jy)[0] == 0


def jalali_days_in_month(jy, jm):
    if 1 <= jm <= 6:
        return 31
    if 7 <= jm <= 11:
        return 30
    return 30 if is_jalali_leap(jy) else 29


def today_jalali():
    t = datetime.date.today()
    return g2j(t.year, t.month, t.day)


def g_str_to_j(iso):
    """'2026-07-20' یا '2026-07-20 13:45:21' -> '1405/04/29' (یا با ساعت)."""
    if not iso:
        return ""
    s = str(iso).strip()[:10]
    try:
        gy, gm, gd = int(s[0:4]), int(s[5:7]), int(s[8:10])
    except (ValueError, TypeError):
        return str(iso)
    jy, jm, jd = g2j(gy, gm, gd)
    return f"{jy:04d}/{jm:02d}/{jd:02d}"


def j_str_to_g(text):
    """'1405/04/29' یا '1405-4-29' -> (jy, jm, jd) یا None اگر نامعتبر."""
    if not text:
        return None
    s = to_ascii_digits(str(text).strip()).replace("-", "/").replace(".", "/")
    parts = [p for p in s.split("/") if p.strip() != ""]
    if len(parts) != 3:
        # فرمت فشرده yyyymmdd
        s2 = s.replace("/", "")
        if s2.isdigit() and len(s2) == 8:
            parts = [s2[:4], s2[4:6], s2[6:8]]
        else:
            return None
    try:
        jy, jm, jd = (int(p) for p in parts)
    except ValueError:
        return None
    if not (1000 <= jy <= 1600 and 1 <= jm <= 12 and
            1 <= jd <= jalali_days_in_month(jy, jm)):
        return None
    return jy, jm, jd


def j_parts_to_g_iso(jy, jm, jd):
    gy, gm, gd = j2g(jy, jm, jd)
    return f"{gy:04d}-{gm:02d}-{gd:02d}"


def guess_date_to_g(value):
    """رشته تاریخ (شمسی یا میلادی) یا datetime -> ISO میلادی. None اگر نشود."""
    if value is None or str(value).strip() == "":
        return None
    if isinstance(value, datetime.datetime) or isinstance(value, datetime.date):
        return f"{value.year:04d}-{value.month:02d}-{value.day:02d}"
    s = str(value)
    # نویسه‌های نامرئی راست‌به‌چپ/نیم‌فاصله که هنگام کپی وارد متن می‌شوند
    # (LRM RLM ZWNJ ZWJ BOM LRE RLE PDF LRO RLO)
    for _ch in ("\u200e", "\u200f", "\u200c", "\u200d", "\ufeff",
                "\u202a", "\u202b", "\u202c", "\u202d", "\u202e"):
        s = s.replace(_ch, "")
    # نرمال‌سازی ارقام و حروف عربی/کردی
    s = to_ascii_digits(s).translate(str.maketrans("\u0643\u064a\u06cc", "\u06a9\u06cc\u06cc")).strip()
    if not s:
        return None
    # جداکردن بخش ساعت اگر همراه تاریخ آمده باشد («1404/11/26 10:30» یا «2026-02-15T00:00»)
    _pp = s.replace("T", " ").split(" ", 1)
    if len(_pp) == 2 and ("/" in _pp[0] or "-" in _pp[0] or "." in _pp[0]) \
            and ":" in (_pp[0] + _pp[1]):
        s = _pp[0]
    # ۱) شمسی با جداکننده / - . یا فشرده
    j = j_str_to_g(s)
    if j:
        return j_parts_to_g_iso(*j)
    # ۱/۵) شمسی روز-اول: «۲۶/۱۲/۱۴۰۴» (رایج هنگام تایپ دستی)
    _t = s.replace("/", " ").replace("-", " ").replace(".", " ").split()
    if len(_t) == 3 and all(p.isdigit() for p in _t):
        _a, _b, _c = int(_t[0]), int(_t[1]), int(_t[2])
        if 1000 <= _c <= 1600 and 1 <= _b <= 12 \
                and 1 <= _a <= jalali_days_in_month(_c, _b):
            return j_parts_to_g_iso(_c, _b, _a)
    # ۲) با نام ماه شمسی: «۲۶ بهمن ۱۴۰۴»
    iso = _jmonth_name_to_g(s)
    if iso:
        return iso
    # ۳) میلادی انعطاف‌پذیر (padding آزاد، روز/ماه اول، فشرده)
    return _gregorian_loose_to_g(s)


def _jmonth_name_to_g(s):
    """«۲۶ اسفند ۱۴۰۴» یا «اسفند ۱۴۰۴ ۲۶» -> ISO میلادی یا None."""
    names = {n: i for i, n in enumerate(MONTH_NAMES) if n}
    month, year, day = None, None, None
    for tok in s.replace("/", " ").replace("-", " ").replace(".", " ").split():
        if tok in names and month is None:
            month = names[tok]
        elif tok.isdigit():
            v = int(tok)
            if 1000 <= v <= 1600 and year is None:
                year = v
            elif 1 <= v <= 31 and day is None:
                day = v
    if month and year and day and day <= jalali_days_in_month(year, month):
        return j_parts_to_g_iso(year, month, day)
    return None


def _gregorian_loose_to_g(s):
    """میلادی با padding آزاد («2026/2/5»), روز-اول («15.02.2026») یا فشرده («20260215»)."""
    t = s.replace("/", "-").replace(".", "-").replace("\\", "-")
    parts = [p for p in t.split("-") if p != ""]
    if len(parts) == 1 and parts[0].isdigit() and len(parts[0]) == 8:
        parts = [parts[0][:4], parts[0][4:6], parts[0][6:8]]
    if len(parts) != 3 or not all(p.isdigit() for p in parts):
        return None
    a, b, c = (int(p) for p in parts)

    def _mk(y, m, d):
        try:
            if 1800 <= y <= 2200:
                return datetime.date(y, m, d).isoformat()
        except ValueError:
            return None
        return None

    if len(parts[0]) == 4 or a > 999:        # سال اول: yyyy/m/d
        return _mk(a, b, c)
    if len(parts[2]) == 4 or c > 999:        # سال آخر
        if a > 12:                           # روز/ماه/سال
            return _mk(c, b, a)
        if b > 12:                           # ماه/روز/سال
            return _mk(c, a, b)
        return _mk(c, b, a) or _mk(c, a, b)  # مبهم: روز-اول (رایج‌تر در اینجا)
    return None
