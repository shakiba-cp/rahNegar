/* ============================================================
   سازنده‌های خالص SVG نمودار (بدون DOM) — مشترک بین کامپوننت‌های چارت
   ظاهر Enterprise مدرن: رنگِ‌آسرایشی کمّی، خطوط ظریف، بدون افکت‌های سنگین
   ============================================================ */
import { faNum as fa } from './kit.js';

const _v = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const _e = t => String(t == null ? '' : t).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* پالت سازمانی — خانواده teal/blue/violet، مات و هماهنگ (بدون نئون) */
export const PALETTE = [
  '#0F766E', '#2563EB', '#7C3AED', '#0891B2', '#0D9488', '#6366F1', '#9333EA',
  '#0EA5E9', '#14B8A6', '#4F46E5', '#8B5CF6', '#64748B', '#94A3B8'
];
export const STATUS_C = { 'در حال انجام': '#D97706', 'انجام شده': '#0F766E', 'بررسی شده': '#2563EB' };
if (typeof window !== 'undefined') window.STATUS_C = STATUS_C;

/* گروه‌بندی حلقه‌های ریز دونات → «سایر»: وقتی برچسب‌ها زیاد و کم‌سهم‌اند
   (مثلاً ۱۳ حوزه با تعدادهای ۰/۱) لجند و نمودار شلوغ می‌شد — حداکثر maxs
   برش بزرگ + یک ورودی تجمیعی خاکستری با تعداد واقعی. */
export function groupTinySlices(data, maxs = 7, minShare = 0.02) {
  const arr = (data || []).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  if (arr.length <= 3) return arr;
  const total = arr.reduce((a, d) => a + d.value, 0) || 1;
  const keep = [], rest = [];
  arr.forEach(d => {
    if (keep.length < maxs && d.value / total >= minShare) keep.push(d);
    else rest.push(d);
  });
  if (rest.length >= 2) {
    keep.push({ label: 'سایر', value: rest.reduce((a, d) => a + d.value, 0), color: '#94A3B8' });
  } else {
    keep.push(...rest);
  }
  return keep;
}

export function shade(hex, p) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16), g = (n >> 8) & 255, b = n & 255;
  r = Math.min(255, Math.round(r + (255 - r) * p));
  g = Math.min(255, Math.round(g + (255 - g) * p));
  b = Math.min(255, Math.round(b + (255 - b) * p));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* پله‌های گرد محور: تیک‌ها همیشه مضرب ۱/۲/۵/۱۰ */
export function niceTicks(m) {
  if (!(m > 0)) return [0, 1, 2, 3, 4];
  if (m <= 5) return [0, 1, 2, 3, 4, 5];
  const raw = m / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
  let st; if (n <= 1) st = mag; else if (n <= 2) st = 2 * mag; else if (n <= 5) st = 5 * mag; else st = 10 * mag;
  const top = Math.ceil(m / st) * st, out = [];
  for (let v = 0; v <= top + 1e-9; v += st) out.push(v);
  return out;
}

/* ---------- چارت ستونی (عمودی) — چیدمان حداقلی ---------- */
export function barSVG(data, uid) {
  const W = 660, H = 260, P = { t: 22, r: 14, b: 40, l: 36 };
  const ticks = niceTicks(Math.max(...data.map(d => d.value), 1));
  const max = ticks[ticks.length - 1];
  const grid = _v('--line') || '#eef1f5', axis = _v('--line-2') || '#e2e8f0',
        i2 = _v('--ink-2') || '#475569', i3 = _v('--ink-3') || '#64748b';
  const bw = (W - P.l - P.r) / Math.max(data.length, 1);
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  ticks.forEach(v => {
    const y = P.t + (H - P.t - P.b) * (1 - v / max);
    s += `<line x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}" stroke="${v === 0 ? axis : grid}" stroke-width="1"/>`;
    if (v > 0) s += `<text x="${P.l - 7}" y="${y + 4}" font-size="10.5" fill="#9aa5b6" text-anchor="end">${fa(v)}</text>`;
  });
  data.forEach((d, i) => {
    const c = d.color || PALETTE[i % PALETTE.length];
    const h = (H - P.t - P.b) * d.value / max, x = P.l + i * bw + bw * 0.18, y = H - P.b - h;
    s += `<rect x="${x}" y="${y}" width="${bw * 0.64}" height="${Math.max(h, d.value ? 3 : 0)}" rx="8" fill="${c}" style="transition:opacity .15s" onmouseover="this.style.opacity=.84" onmouseout="this.style.opacity=1"><title>${_e(d.label)}: ${fa(d.value)}</title></rect>`;
    if (d.value) s += `<text x="${x + bw * 0.32}" y="${y - 7}" font-size="11.5" font-weight="700" fill="${i2}" text-anchor="middle">${fa(d.value)}</text>`;
    const lbl = _e(d.label.length > 11 ? d.label.slice(0, 11) + '…' : d.label);
    s += `<text x="${x + bw * 0.32}" y="${H - P.b + 17}" font-size="11" fill="${i3}" text-anchor="middle"><title>${_e(d.label)}</title>${lbl}</text>`;
  });
  return s + '</svg>';
}

/* ---------- چارت میله‌ای افقی — ردیف رتبه‌بندی: نام، تعداد، نوار، درصد ---------- */
export function hbarSVG(data, uid) {
  const rows = data.filter(d => d.value > 0 || data.length <= 7);
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const W = 660, rowH = 38, LBL = 200, VALW = 76, P = { t: 6, b: 6, l: 8 };
  const barArea = W - LBL - VALW - P.l;
  const H = P.t + P.b + rowH * Math.max(rows.length, 1);
  const max = Math.max(...data.map(d => d.value), 1);
  const i1 = _v('--ink-1') || '#1e293b', i2 = _v('--ink-2') || '#475569',
        i4 = _v('--ink-4') || '#94a3b8', track = _v('--track') || '#f1f5f9';
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  rows.forEach((d, i) => {
    const c = d.color || PALETTE[i % PALETTE.length];
    const y = P.t + i * rowH + 11, h = 15;
    const pct = Math.round(d.value / total * 100);
    const w = Math.max(barArea * d.value / max, d.value ? 5 : 0);
    const xEnd = W - LBL;                       // لبه سمت تیتر (راست در چیدمان RTL)
    const xBar = xEnd - barArea;                // لبه دیگر نوار
    s += `<text x="${W - 4}" y="${y + h / 2 + 4.5}" font-size="12" fill="${i2}" text-anchor="start" direction="rtl"><title>${_e(d.label)}</title>${_e(d.label.length > 22 ? d.label.slice(0, 22) + '…' : d.label)}</text>`;
    s += `<rect x="${xBar}" y="${y}" width="${barArea}" height="${h}" rx="${h / 2}" fill="${track}"/>`;
    if (d.value) s += `<rect x="${xEnd - w}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${c}" class="barpop" style="transition:opacity .15s" onmouseover="this.style.opacity=.82" onmouseout="this.style.opacity=1"><title>${_e(d.label)}: ${fa(d.value)} (${fa(pct)}٪)</title></rect>`;
    const vx = xBar - 10;
    s += `<text x="${vx}" y="${y + h / 2 + 4.5}" font-size="12.5" font-weight="700" fill="${i1}" text-anchor="end">${fa(d.value)}<tspan font-weight="400" font-size="10.5" fill="${i4}"> (${fa(pct)}٪)</tspan></text>`;
  });
  if (!rows.length) s += `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" fill="#94a3b8" font-size="13">داده‌ای نیست</text>`;
  return s + '</svg>';
}

/* ---------- دونات — حلقه ضخیم، برچسب مرکزی بزرگ، فاصله کم بین بخش‌ها ---------- */
export function donutSVG(data, uid) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const cx = 132, cy = 132, R = 103, r = 62;
  const panel = _v('--panel') || '#fff', ink1 = _v('--ink-1') || '#1e293b', ink4 = _v('--ink-4') || '#94a3b8';
  let ang = -Math.PI / 2, s = `<svg viewBox="0 0 264 264" width="264" height="264" xmlns="http://www.w3.org/2000/svg">`;
  data.forEach((d, i) => { d.color = d.color || PALETTE[i % PALETTE.length]; });
  const real = data.filter(d => d.value > 0);
  if (!real.length) {
    s += `<circle cx="${cx}" cy="${cy}" r="${(R + r) / 2}" fill="none" stroke="${_v('--track') || '#f1f5f9'}" stroke-width="${R - r}"/>`;
  }
  real.forEach(d => {
    const a2 = ang + 2 * Math.PI * d.value / total, large = (a2 - ang) > Math.PI ? 1 : 0;
    let el;
    if (d.value === total) {
      el = `<circle cx="${cx}" cy="${cy}" r="${(R + r) / 2}" fill="none" stroke="${d.color}" stroke-width="${R - r}"><title>${_e(d.label)}</title></circle>`;
    } else {
      const x1 = cx + R * Math.cos(ang), y1 = cy + R * Math.sin(ang), x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
      const x3 = cx + r * Math.cos(a2), y3 = cy + r * Math.sin(a2), x4 = cx + r * Math.cos(ang), y4 = cy + r * Math.sin(ang);
      el = `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z" fill="${d.color}" stroke="${panel}" stroke-width="2.5" style="transition:transform .16s,opacity .16s;transform-box:fill-box;transform-origin:center;cursor:${d.href ? 'pointer' : 'default'}" onmouseover="this.style.transform='scale(1.032)'" onmouseout="this.style.transform='none'"><title>${_e(d.label)}: ${fa(d.value)} (${fa(Math.round(d.value / total * 100))}٪)</title></path>`;
    }
    s += d.href ? `<a href="${d.href}">${el}</a>` : el;
    ang = a2;
  });
  s += `<text x="${cx}" y="${cy + 2}" font-size="34" font-weight="700" fill="${ink1}" text-anchor="middle" font-family="inherit" letter-spacing="-0.02em">${fa(total)}</text>`;
  s += `<text x="${cx}" y="${cy + 24}" font-size="11.5" fill="${ink4}" text-anchor="middle">مجموع فعالیت‌ها</text></svg>`;
  return s;
}

/* ---------- چارت خطی روند — grid خیلی کم‌رنگ، ناحیه زیرخط ۱۰٪، نقطه‌های کوچک ---------- */
export function lineSVG(data, uid) {
  const W = 660, H = 252, P = { t: 22, r: 16, b: 46, l: 40 };
  const ticks = niceTicks(Math.max(...data.map(d => d.value), 1));
  const max = ticks[ticks.length - 1];
  const n = data.length || 1, sx = (W - P.l - P.r) / Math.max(n - 1, 1), plotH = H - P.t - P.b;
  /* فاصله برچسب محور X: تا ۱۴ نقطه همه؛ بیشتر → حداکثر ~۱۲ برچسب با گام یکنواخت
     (ماه‌های فرد/زودتر نشان داده می‌شدند و محور به‌هم‌ریخته به نظر می‌رسید) */
  const tickEvery = n > 14 ? Math.ceil(n / 12) : 1;
  const grid = _v('--line') || '#eef1f5', axis = _v('--line-2') || '#e2e8f0',
        i3 = _v('--ink-3') || '#64748b', i4 = _v('--ink-4') || '#94a3b8',
        panel = _v('--panel') || '#fff', ink1 = _v('--ink-1') || '#1e293b';
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs><linearGradient id="la${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(15,118,110,.10)"/><stop offset="92%" stop-color="rgba(15,118,110,0)"/></linearGradient></defs>`;
  ticks.forEach(v => {
    const y = P.t + plotH * (1 - v / max);
    s += `<line x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}" stroke="${v === 0 ? axis : grid}" stroke-width="1"/>`;
    if (v > 0) s += `<text x="${P.l - 8}" y="${y + 4}" font-size="10.5" fill="#9aa5b6" text-anchor="end">${fa(v)}</text>`;
  });
  const pts = data.map((d, i) => [W - P.r - i * sx, H - P.b - plotH * d.value / max]);
  let path = '';
  if (pts.length === 1) { path = `M ${pts[0][0]} ${pts[0][1]}`; }
  else if (pts.length > 1) {
    path = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[Math.max(i - 2, 0)], p1 = pts[i - 1], p2 = pts[i], p3 = pts[Math.min(i + 1, pts.length - 1)];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
    }
  }
  if (pts.length) {
    s += `<path class="la-fade" d="${path} L ${pts[pts.length - 1][0]} ${H - P.b} L ${pts[0][0]} ${H - P.b} Z" fill="url(#la${uid})"/>`;
    s += `<path class="ln-draw" pathLength="1" d="${path}" fill="none" stroke="#0F766E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  let maxIdx = -1, mv = -1; data.forEach((d, i) => { if (d.value > mv) { mv = d.value; maxIdx = i; } });
  const yr = l => { const p = String(l).split(' '); return p.length > 1 ? p[p.length - 1].slice(-2) : ''; };
  const hasYr = data.some(d => yr(d.label));
  let prevYr = null;
  pts.forEach((p, i) => {
    const isMin = data[i].value === 0 && mv > 0;
    const dot = `<circle class="pt-hit" cx="${p[0]}" cy="${p[1]}" r="15" fill="rgba(0,0,0,0)"/>
      <circle class="pt-ring" cx="${p[0]}" cy="${p[1]}" r="8.5" fill="none" stroke="rgba(15,118,110,.4)" stroke-width="1.5" opacity="0"/>
      <circle class="pt-core" cx="${p[0]}" cy="${p[1]}" r="3" fill="${panel}" stroke="${isMin ? '#94a3b8' : '#0F766E'}" stroke-width="${isMin ? 1.4 : 1.8}"${isMin ? ' stroke-dasharray="2 2"' : ''} style="transition:r .12s"/>
      <title>${_e(data[i].label)}: ${fa(data[i].value)} فعالیت</title>`;
    s += data[i].href
      ? `<a href="${data[i].href}"><g class="pt" data-x="${p[0]}" data-y="${p[1]}"
          data-l="${String(data[i].label).replace(/"/g, '')}" data-v="${data[i].value}">${dot}</g></a>`
      : `<g class="pt" data-x="${p[0]}" data-y="${p[1]}"
          data-l="${String(data[i].label).replace(/"/g, '')}" data-v="${data[i].value}">${dot}</g>`;
    if (i === maxIdx && mv > 0) {
      const ly = p[1] - 13 < P.t + 2 ? p[1] + 22 : p[1] - 13;
      s += `<text x="${p[0]}" y="${ly}" font-size="12.5" font-weight="700" fill="#0F766E" text-anchor="middle">${fa(mv)}</text>`;
    }
    if (i % tickEvery === 0) {
      const _lp = String(data[i].label).split(' ');
      s += `<text x="${p[0]}" y="${H - P.b + 17}" font-size="10.5" fill="${i3}" text-anchor="middle">${_lp[0]}</text>`;
    }
    const y = yr(data[i].label);
    if (hasYr && y && y !== prevYr) { s += `<text x="${p[0]}" y="${H - 4}" font-size="9" font-weight="600" fill="${i4}" text-anchor="middle">${y}</text>`; prevYr = y; }
  });
  s += `<line class="xh" x1="-10" x2="-10" y1="${P.t - 2}" y2="${H - P.b}" stroke="rgba(15,118,110,.4)" stroke-width="1" stroke-dasharray="2 4" opacity="0"/>`;
  s += `<g class="tt" opacity="0" style="pointer-events:none">
      <rect class="tt-b" rx="10" ry="10" fill="${panel}" stroke="rgba(15,23,42,.08)" stroke-width="1" style="filter:drop-shadow(0 8px 20px rgba(15,23,42,.12))"/>
      <text class="tt-1" text-anchor="middle" font-size="12" font-weight="700" fill="${ink1}"></text>
      <text class="tt-2" text-anchor="middle" font-size="11" font-weight="600" fill="#0F766E"></text></g>`;
  return s + '</svg>';
}

/* هاور نمودار خطی: تفویض رویداد روی ریشه کامپوننت */
export function attachLineHover(root) {
  let cur = null;
  const faN = fa;
  function svg() { return root.querySelector('svg'); }
  function hide() {
    const s = svg(); if (!s) return;
    const xh = s.querySelector('.xh'), tt = s.querySelector('.tt');
    if (xh) xh.setAttribute('opacity', 0); if (tt) tt.setAttribute('opacity', 0);
    if (cur) {
      cur.querySelector('.pt-ring').setAttribute('opacity', 0);
      cur.querySelector('.pt-core').setAttribute('r', 3); cur = null;
    }
  }
  function show(g) {
    const s = svg(); if (!s) return;
    const x = +g.dataset.x, y = +g.dataset.y, L = g.dataset.l, V = faN(g.dataset.v) + ' فعالیت';
    const xh = s.querySelector('.xh'), tt = s.querySelector('.tt'),
          tb = s.querySelector('.tt-b'), t1 = s.querySelector('.tt-1'), t2 = s.querySelector('.tt-2');
    xh.setAttribute('x1', x); xh.setAttribute('x2', x); xh.setAttribute('opacity', 1);
    g.querySelector('.pt-ring').setAttribute('opacity', 1);
    g.querySelector('.pt-core').setAttribute('r', 5.5);
    const w = Math.max(84, L.length * 11.4 + 26, V.length * 10.5 + 26), h = 46;
    let tx = Math.min(Math.max(x - w / 2, 34), 660 - 16 - w + 6), ty = y - h - 14 < 14 ? y + 16 : y - h - 14;
    tb.setAttribute('x', tx); tb.setAttribute('y', ty); tb.setAttribute('width', w); tb.setAttribute('height', h);
    t1.setAttribute('x', tx + w / 2); t1.setAttribute('y', ty + 19); t1.textContent = L;
    t2.setAttribute('x', tx + w / 2); t2.setAttribute('y', ty + 37); t2.textContent = V;
    tt.setAttribute('opacity', 1);
  }
  root.addEventListener('mousemove', e => {
    const g = e.target && e.target.closest ? e.target.closest('.pt') : null;
    if (!g || !root.contains(g)) { hide(); return; }
    if (g !== cur) { hide(); cur = g; show(g); }
  });
  root.addEventListener('mouseleave', () => { hide(); });
}
