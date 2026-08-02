/* ============================================================
   سازنده‌های خالص SVG نمودار (بدون DOM) — مشترک بین کامپوننت‌های چارت
   ============================================================ */
import { faNum as fa } from './kit.js';

const _v = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const _e = t => String(t == null ? '' : t).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const PALETTE = ['#0d9488', '#0891b2', '#059669', '#d97706', '#0284c7', '#14b8a6', '#f59e0b', '#64748b', '#0f766e', '#2dd4bf', '#115e59', '#eab308', '#94a3b8'];
export const STATUS_C = { 'در حال انجام': '#d97706', 'بررسی شده': '#0284c7', 'انجام شده': '#059669' };
if (typeof window !== 'undefined') window.STATUS_C = STATUS_C;

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

export function barSVG(data, uid) {
  const W = 660, H = 260, P = { t: 22, r: 14, b: 40, l: 36 };
  const ticks = niceTicks(Math.max(...data.map(d => d.value), 1));
  const max = ticks[ticks.length - 1];
  const bw = (W - P.l - P.r) / Math.max(data.length, 1);
  const base = '#0f766e';
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  ticks.forEach(v => {
    const y = P.t + (H - P.t - P.b) * (1 - v / max);
    s += `<line x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}" stroke="#e8edf4" stroke-dasharray="3 5"${v === 0 ? ' stroke="#d3dae4" stroke-dasharray="none"' : ''}/>`;
    if (v > 0) s += `<text x="${P.l - 7}" y="${y + 4}" font-size="10.5" fill="#9aa5b6" text-anchor="end">${fa(v)}</text>`;
  });
  data.forEach((d, i) => {
    const c = d.color || shade(base, (i % 6) * 0.07);
    const h = (H - P.t - P.b) * d.value / max, x = P.l + i * bw + bw * 0.16, y = H - P.b - h;
    s += `<defs><linearGradient id="g${uid}_${i}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${shade(c, .18)}"/><stop offset="100%" stop-color="${c}"/></linearGradient></defs>`;
    s += `<rect x="${x}" y="${y}" width="${bw * 0.68}" height="${Math.max(h, d.value ? 3 : 0)}" rx="7" fill="url(#g${uid}_${i})" style="transition:opacity .15s" onmouseover="this.style.opacity=.82" onmouseout="this.style.opacity=1"><title>${_e(d.label)}: ${fa(d.value)}</title></rect>`;
    if (d.value) s += `<text x="${x + bw * 0.34}" y="${y - 6}" font-size="11.5" font-weight="bold" fill="${_v('--ink-2') || '#475569'}" text-anchor="middle">${fa(d.value)}</text>`;
    const lbl = _e(d.label.length > 11 ? d.label.slice(0, 11) + '…' : d.label);
    s += `<text x="${x + bw * 0.34}" y="${H - P.b + 17}" font-size="11.5" fill="${_v('--ink-3') || '#64748b'}" text-anchor="middle"><title>${_e(d.label)}</title>${lbl}</text>`;
  });
  return s + '</svg>';
}

export function hbarSVG(data, uid) {
  const rows = data.filter(d => d.value > 0 || data.length <= 7);
  const W = 660, rowH = 34, LBL = 215, P = { t: 8, b: 8, l: 56 }, barMax = W - LBL - P.l - 30;
  const H = P.t + P.b + rowH * Math.max(rows.length, 1);
  const max = Math.max(...data.map(d => d.value), 1);
  const base = '#0f766e';
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  rows.forEach((d, i) => {
    const c = d.color || shade(base, (i % 6) * 0.07);
    const y = P.t + i * rowH + 5, h = rowH - 10;
    const w = Math.max(barMax * d.value / max, d.value ? 6 : 0);
    s += `<defs><linearGradient id="h${uid}_${i}" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="${shade(c, .25)}"/><stop offset="100%" stop-color="${c}"/></linearGradient></defs>`;
    s += `<text x="${W - 4}" y="${y + h / 2 + 4.5}" font-size="12.5" fill="${_v('--ink-2') || '#475569'}" text-anchor="start" direction="rtl">${_e(d.label)}</text>`;
    s += `<rect x="${P.l}" y="${y}" width="${barMax}" height="${h}" rx="${h / 2}" fill="#f1f5f9"/>`;
    s += `<rect x="${W - LBL - w}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#h${uid}_${i})" style="transition:opacity .15s" onmouseover="this.style.opacity=.8" onmouseout="this.style.opacity=1"><title>${_e(d.label)}: ${fa(d.value)}</title></rect>`;
    s += `<text x="${W - LBL - w - 9}" y="${y + h / 2 + 4.5}" font-size="12" font-weight="bold" fill="${_v('--ink-2') || '#475569'}" text-anchor="end">${fa(d.value)}</text>`;
  });
  if (!rows.length) s += `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" fill="#94a3b8" font-size="13">داده‌ای نیست</text>`;
  return s + '</svg>';
}

export function donutSVG(data, uid) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const cx = 132, cy = 132, R = 104, r = 60;
  let ang = -Math.PI / 2, s = `<svg viewBox="0 0 264 264" width="264" height="264" xmlns="http://www.w3.org/2000/svg">`;
  data.forEach((d, i) => { d.color = d.color || PALETTE[i % PALETTE.length]; });
  const real = data.filter(d => d.value > 0);
  real.forEach((d, i) => {
    const a2 = ang + 2 * Math.PI * d.value / total, large = (a2 - ang) > Math.PI ? 1 : 0;
    const x1 = cx + R * Math.cos(ang), y1 = cy + R * Math.sin(ang), x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
    const x3 = cx + r * Math.cos(a2), y3 = cy + r * Math.sin(a2), x4 = cx + r * Math.cos(ang), y4 = cy + r * Math.sin(ang);
    s += `<defs><linearGradient id="d${uid}_${i}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${shade(d.color, .3)}"/><stop offset="100%" stop-color="${d.color}"/></linearGradient></defs>`;
    let el;
    if (d.value === total) {
      el = `<circle cx="${cx}" cy="${cy}" r="${(R + r) / 2}" fill="none" stroke="url(#d${uid}_${i})" stroke-width="${R - r}"><title>${_e(d.label)}</title></circle>`;
    } else {
      el = `<path d="M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z" fill="url(#d${uid}_${i})" stroke="#fff" stroke-width="3" style="transition:transform .18s,opacity .18s;transform-box:fill-box;transform-origin:center;cursor:${d.href ? 'pointer' : 'default'}" onmouseover="this.style.transform='scale(1.045)'" onmouseout="this.style.transform='none'"><title>${_e(d.label)}: ${fa(d.value)} (${fa(Math.round(d.value / total * 100))}٪)</title></path>`;
    }
    s += d.href ? `<a href="${d.href}">${el}</a>` : el;
    ang = a2;
  });
  s += `<text x="${cx}" y="${cy - 4}" font-size="26" font-weight="800" fill="${_v('--ink-1') || '#1e293b'}" text-anchor="middle" font-family="inherit">${fa(total)}</text>`;
  s += `<text x="${cx}" y="${cy + 19}" font-size="12" fill="#94a3b8" text-anchor="middle">مجموع</text></svg>`;
  return s;
}

export function lineSVG(data, uid) {
  const W = 660, H = 252, P = { t: 22, r: 16, b: 46, l: 40 };
  const ticks = niceTicks(Math.max(...data.map(d => d.value), 1));
  const max = ticks[ticks.length - 1];
  const n = data.length || 1, sx = (W - P.l - P.r) / Math.max(n - 1, 1), plotH = H - P.t - P.b;
  const many = n > 14;
  const i3 = _v('--ink-3') || '#64748b', i4 = _v('--ink-4') || '#94a3b8',
        panel = _v('--panel') || '#fff', ink1 = _v('--ink-1') || '#1e293b';
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs><linearGradient id="la${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(13,148,136,.30)"/><stop offset="88%" stop-color="rgba(13,148,136,.02)"/></linearGradient>
      <linearGradient id="ls${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0891b2"/><stop offset="100%" stop-color="#0d9488"/></linearGradient></defs>`;
  ticks.forEach(v => {
    const y = P.t + plotH * (1 - v / max);
    s += `<line x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}" stroke="#e8edf4" stroke-dasharray="3 5"${v === 0 ? ' stroke="#d3dae4" stroke-dasharray="none"' : ''}/>`;
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
    s += `<path d="${path} L ${pts[pts.length - 1][0]} ${H - P.b} L ${pts[0][0]} ${H - P.b} Z" fill="url(#la${uid})"/>`;
    s += `<path d="${path}" fill="none" stroke="url(#ls${uid})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  let maxIdx = -1, mv = -1; data.forEach((d, i) => { if (d.value > mv) { mv = d.value; maxIdx = i; } });
  const yr = l => { const p = String(l).split(' '); return p.length > 1 ? p[p.length - 1].slice(-2) : ''; };
  const hasYr = data.some(d => yr(d.label));
  let prevYr = null;
  pts.forEach((p, i) => {
    const isMin = data[i].value === 0 && mv > 0;
    const dot = `<circle class="pt-hit" cx="${p[0]}" cy="${p[1]}" r="15" fill="rgba(0,0,0,0)"/>
      <circle class="pt-ring" cx="${p[0]}" cy="${p[1]}" r="8" fill="none" stroke="rgba(13,148,136,.55)" stroke-width="1.5" opacity="0"/>
      <circle class="pt-core" cx="${p[0]}" cy="${p[1]}" r="4" fill="${isMin ? panel : panel}" stroke="${isMin ? '#94a3b8' : '#0d9488'}" stroke-width="2.6"${isMin ? ' stroke-dasharray="2 2"' : ''}/>
      <title>${_e(data[i].label)}: ${fa(data[i].value)} فعالیت</title>`;
    s += data[i].href
      ? `<a href="${data[i].href}"><g class="pt" data-x="${p[0]}" data-y="${p[1]}"
          data-l="${String(data[i].label).replace(/"/g, '')}" data-v="${data[i].value}">${dot}</g></a>`
      : `<g class="pt" data-x="${p[0]}" data-y="${p[1]}"
          data-l="${String(data[i].label).replace(/"/g, '')}" data-v="${data[i].value}">${dot}</g>`;
    if (i === maxIdx && mv > 0) {
      const ly = p[1] - 13 < P.t + 2 ? p[1] + 22 : p[1] - 13;
      s += `<text x="${p[0]}" y="${ly}" font-size="12.5" font-weight="800" fill="#0f766e" text-anchor="middle">${fa(mv)}</text>`;
    } else if (!many && data[i].value > 0) {
      s += `<text x="${p[0]}" y="${p[1] - 11}" font-size="11" font-weight="700" fill="#0f766e" text-anchor="middle">${fa(data[i].value)}</text>`;
    }
    if (!(many && i % 2)) {
      const _lp = String(data[i].label).split(' ');
      s += `<text x="${p[0]}" y="${H - P.b + 17}" font-size="10.5" fill="${i3}" text-anchor="middle">${_lp[0]}</text>`;
    }
    const y = yr(data[i].label);
    if (hasYr && y && y !== prevYr) { s += `<text x="${p[0]}" y="${H - 4}" font-size="9" font-weight="700" fill="${i4}" text-anchor="middle">${y}</text>`; prevYr = y; }
  });
  s += `<line class="xh" x1="-10" x2="-10" y1="${P.t - 2}" y2="${H - P.b}" stroke="rgba(13,148,136,.5)" stroke-width="1.2" stroke-dasharray="3 4" opacity="0"/>`;
  s += `<g class="tt" opacity="0" style="pointer-events:none">
      <rect class="tt-b" rx="9" ry="9" fill="${panel}" stroke="#d3dae4" stroke-width="1"/>
      <text class="tt-1" text-anchor="middle" font-size="12.5" font-weight="800" fill="${ink1}"></text>
      <text class="tt-2" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0d9488"></text></g>`;
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
      cur.querySelector('.pt-core').setAttribute('r', 4); cur = null;
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
    const w = Math.max(80, L.length * 11.8 + 22, V.length * 11 + 22), h = 44;
    let tx = Math.min(Math.max(x - w / 2, 34), 660 - 16 - w + 6), ty = y - h - 14 < 14 ? y + 16 : y - h - 14;
    tb.setAttribute('x', tx); tb.setAttribute('y', ty); tb.setAttribute('width', w); tb.setAttribute('height', h);
    t1.setAttribute('x', tx + w / 2); t1.setAttribute('y', ty + 19); t1.textContent = L;
    t2.setAttribute('x', tx + w / 2); t2.setAttribute('y', ty + 36); t2.textContent = V;
    tt.setAttribute('opacity', 1);
  }
  root.addEventListener('mousemove', e => {
    const g = e.target && e.target.closest ? e.target.closest('.pt') : null;
    if (!g || !root.contains(g)) { hide(); return; }
    if (g !== cur) { hide(); cur = g; show(g); }
  });
  root.addEventListener('mouseleave', () => { hide(); });
}
