/* ============================================================
   استور پوسته (Chrome): توست‌ها، مودال تأیید، تقویم شمسی، نوار پیشرفت ناوبری
   ماژول سطح-اپ: همه کامپوننت‌های پوسته از همین state مشترک استفاده می‌کنند.
   ============================================================ */
import { reactive } from 'vue';
import { readJson } from '@/lib/kit.js';
import { JMN, jDim, j2gjs, todayJ, tripSel, fixDays } from '@/lib/jalali.js';
import { faNum } from '@/lib/kit.js';

const flashes = readJson('flashes-data') || [];

export const chrome = reactive({
  /* توست‌ها */
  toasts: flashes.map((f, i) => ({
    id: 't' + i + Date.now(), cat: f.cat || 'success',
    cls: f.cat === 'error' ? 'err' : f.cat === 'warning' ? 'warn' : 'ok',
    msg: f.msg, bye: false
  })),
  /* مودال تأیید */
  cfm: { on: false, msg: '' },
  /* نوار پیشرفت ناوبری */
  nav: { on: false, done: false },
  /* تقویم */
  cal: { on: false, y: 0, m: 1, left: 0, top: 0, sy: '', sm: '', sd: '' },
});

/* مقاصد DOM بیرون از state واکنش‌گرا */
let pendingForm = null, curTrip = null, navTimer = null;

/* ---------- توست ---------- */
export function dismiss(t) {
  if (t.bye) return;
  t.bye = true;
  setTimeout(() => { chrome.toasts = chrome.toasts.filter(x => x !== t); }, 500);
}
export function armAutoDismiss() {
  chrome.toasts.forEach(t => setTimeout(() => dismiss(t), 5200));
}

/* ---------- مودال تأیید ---------- */
export function cfmAsk(msg, form) { pendingForm = form; chrome.cfm.msg = msg; chrome.cfm.on = true; }
export function cfmYes() { const f = pendingForm; cfmNo(); if (f) f.submit(); }
export function cfmNo() { chrome.cfm.on = false; pendingForm = null; }

/* ---------- تقویم شمسی ---------- */
export function calTitle() { return (JMN[chrome.cal.m] || '') + ' ' + faNum(chrome.cal.y); }
export function calWeeks() {
  const dim = jDim(chrome.cal.y, chrome.cal.m), tj = todayJ();
  const g = j2gjs(chrome.cal.y, chrome.cal.m, 1), w0 = (new Date(g.gy, g.gm - 1, g.gd).getDay() + 1) % 7;
  const cells = [];
  for (let i = 0; i < w0; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push({
    d,
    today: tj[0] === chrome.cal.y && tj[1] === chrome.cal.m && tj[2] === d,
    sel: +chrome.cal.sy === chrome.cal.y && +chrome.cal.sm === chrome.cal.m && +chrome.cal.sd === d
  });
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
export function calOpen(trip) {
  if (!trip || !tripSel(trip, 'y') || !tripSel(trip, 'm')) return;
  const tj = todayJ();
  curTrip = trip;
  chrome.cal.y = +tripSel(trip, 'y').value || tj[0];
  chrome.cal.m = +tripSel(trip, 'm').value || tj[1];
  chrome.cal.sy = tripSel(trip, 'y').value;
  chrome.cal.sm = tripSel(trip, 'm').value;
  chrome.cal.sd = tripSel(trip, 'd') ? tripSel(trip, 'd').value : '';
  const r = trip.getBoundingClientRect(), vw = document.documentElement.clientWidth;
  let left = r.left + window.scrollX;
  if (left + 276 > vw) left = Math.max(6, vw - 276 - 10);
  chrome.cal.left = left;
  chrome.cal.top = r.bottom + window.scrollY + 6;
  chrome.cal.on = true;
}
export function calClose() { chrome.cal.on = false; curTrip = null; }
export function calToggle(trip) { if (chrome.cal.on && curTrip === trip) calClose(); else calOpen(trip); }
export function calNav(dm) {
  let { y, m } = chrome.cal;
  m += dm; if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
  chrome.cal.y = y; chrome.cal.m = m;
}
export function calPick(c) {
  if (!c || !curTrip) return;
  const t = curTrip, yS = tripSel(t, 'y'), mS = tripSel(t, 'm'), dS = tripSel(t, 'd');
  if (!yS || !mS || !dS) { calClose(); return; }
  if (![...yS.options].some(o => o.value == String(chrome.cal.y))) {
    const o = document.createElement('option');
    o.value = String(chrome.cal.y); o.textContent = faNum(chrome.cal.y);
    yS.insertBefore(o, yS.options[1]);
  }
  yS.value = String(chrome.cal.y);
  mS.value = String(chrome.cal.m).padStart(2, '0');
  fixDays(t);
  dS.value = String(c.d).padStart(2, '0');
  calClose();
}
export function calToday() {
  const t = todayJ();
  chrome.cal.y = t[0]; chrome.cal.m = t[1];
  setTimeout(() => calPick({ d: t[2] }), 0);
}
export function calClear() {
  if (curTrip) curTrip.querySelectorAll('select').forEach(s => s.value = '');
  calClose();
}

/* ---------- ناوبری/رویدادهای سراسری پوسته ---------- */
export function installChromeGlobals() {
  /* Escape → بستن مودال */
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && chrome.cfm.on) cfmNo(); });
  /* فرم‌های data-confirm (یا onsubmit قدیمی confirm) */
  const extract = f => {
    const attr = f.getAttribute('onsubmit') || '';
    const m = attr.match(/confirm\((['"])(.*?)\1\)/);
    if (m) { f.dataset.confirm = m[2]; f.removeAttribute('onsubmit'); }
    return f.dataset.confirm || '';
  };
  document.querySelectorAll('form[onsubmit]').forEach(f => extract(f));
  document.addEventListener('submit', e => {
    const f = e.target.closest ? e.target.closest('form') : null;
    if (!f) return;
    const msg = extract(f);
    if (!msg) return;
    e.preventDefault(); e.stopImmediatePropagation();
    cfmAsk(msg, f);
  }, true);
  /* دکمه‌های تقویم (تفویض سراسری) */
  document.addEventListener('click', e => {
    const btn = e.target.closest && e.target.closest('.dtp-btn');
    if (btn) {
      e.preventDefault();
      calToggle(btn.closest('.date-trip'));
      return;
    }
    if (chrome.cal.on && !e.target.closest('.dtk')) calClose();
  });
  /* نوار پیشرفت ناوبری */
  const start = () => {
    chrome.nav.done = false; chrome.nav.on = true;
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { chrome.nav.on = false; }, 12000);
  };
  window.addEventListener('beforeunload', () => { chrome.nav.done = true; chrome.nav.on = true; });
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const h = a.getAttribute('href');
    if (a.target === '_blank' || a.download || !h || h.startsWith('#') || h.startsWith('javascript')) return;
    try { if (h.startsWith('http') && new URL(h, location.href).origin !== location.origin) return; } catch (_) {}
    start();
  });
  window.addEventListener('pageshow', () => { chrome.nav.on = false; });
  /* مقداردهی اولیهٔ سلکت‌های روز برای date-trip های SSR */
  document.querySelectorAll('.date-trip').forEach(t => fixDays(t));
  document.addEventListener('change', e => {
    if (e.target.matches && e.target.matches('.date-trip select[data-k=y],.date-trip select[data-k=m],.date-trip select[name$="__y"],.date-trip select[name$="__m"]'))
      fixDays(e.target.closest('.date-trip'));
  });
}
