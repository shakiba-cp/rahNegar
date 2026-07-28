/* ============================================================
   ریاضی تقویم جلالی (الگوریتم Jalaali) + ابزار فیلد تاریخ سه‌بخشی
   ============================================================ */
import { faNum as _fa } from './kit.js';

const JT = Math.trunc, JM = (a, b) => a - b * JT(a / b);
const JBR = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
export const JMN = ['', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
function jcal(jy) { const gy = jy + 621; let l = -14, jp = JBR[0], jm, jump;
  for (let i = 1; i < JBR.length; i++) { jm = JBR[i]; jump = jm - jp; if (jy < jm) break; l += JT(jump / 33) * 8 + JT(JM(jump, 33) / 4); jp = jm; }
  let n = jy - jp; l += JT(n / 33) * 8 + JT((JM(n, 33) + 3) / 4);
  if (JM(jump, 33) === 4 && jump - n === 4) l += 1;
  const lg = JT(gy / 4) - JT((JT(gy / 100) + 1) * 3 / 4) - 150;
  let march = 20 + l - lg; if (jump - n < 6) n = n - jump + JT((jump + 4) / 33) * 33;
  let leap = JM(JM(n + 1, 33) - 1, 4); if (leap === -1) leap = 4;
  return { leap, gy, march }; }
function g2dc(gy, gm, gd) { let d = JT((gy + JT((gm - 8) / 6) + 100100) * 1461 / 4) + JT((153 * JM(gm + 9, 12) + 2) / 5) + gd - 34840408;
  d = d - JT(JT((gy + 100100 + JT((gm - 8) / 6)) / 100) * 3 / 4) + 752; return d; }
function d2gc(jdn) { let j = 4 * jdn + 139361631;
  j += JT(JT((4 * jdn + 183187720) / 146097) * 3 / 4) * 4 - 3908;
  const i = JT(JM(j, 1461) / 4) * 5 + 308;
  return { gy: JT(j / 1461) - 100100 + JT((8 - (JM(JT(i / 153), 12) + 1)) / 6), gm: JM(JT(i / 153), 12) + 1, gd: JT(JM(i, 153) / 5) + 1 }; }
function j2dc(jy, jm, jd) { const r = jcal(jy); return g2dc(r.gy, 3, r.march) + (jm - 1) * 31 - JT(jm / 7) * (jm - 7) + jd - 1; }
export function j2gjs(jy, jm, jd) { return d2gc(j2dc(jy, jm, jd)); }
export function g2jjs(gy, gm, gd) { const jdn = g2dc(gy, gm, gd), gy2 = d2gc(jdn).gy; let jy = gy2 - 621; const r = jcal(jy);
  const jdn1 = g2dc(gy2, 3, r.march); let k = jdn - jdn1;
  if (k >= 0) { if (k <= 185) return [jy, JT(k / 31) + 1, JM(k, 31) + 1]; k -= 186; }
  else { jy--; k += 179; if (r.leap === 1) k += 1; }
  return [jy, 7 + JT(k / 30), JM(k, 30) + 1]; }
export function jLeap(jy) { return jcal(jy).leap === 0; }
export function jDim(jy, jm) { if (jm <= 6) return 31; if (jm <= 11) return 30; return jLeap(jy) ? 30 : 29; }
export function todayJ() { const t = new Date(); return g2jjs(t.getFullYear(), t.getMonth() + 1, t.getDate()); }

/* ---------- فیلد تاریخ سه‌بخشی (سلکت‌های سرور-رندر) ---------- */
const J_DAYS = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
export function tripSel(t, k) { return t.querySelector('[data-k=' + k + ']') || t.querySelector('select[name$="__' + k + '"]'); }
export function fixDays(trip) {
  const m = tripSel(trip, 'm'), d = tripSel(trip, 'd');
  if (!m || !d) return;
  const cur = d.value, max = J_DAYS[+m.value] || 31;
  d.innerHTML = '<option value="">روز</option>' + Array.from({ length: max }, (_, i) => `<option value="${String(i + 1).padStart(2, '0')}">${_fa(i + 1)}</option>`).join('');
  if (cur && +cur <= max) d.value = cur;
}
