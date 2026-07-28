/* ============================================================
   ره‌نگار — کیت مشترک (ESM)
   ============================================================ */
import { createApp } from 'vue';

const FA = '۰۱۲۳۴۵۶۷۸۹';
export const fa = v => String(v ?? '').replace(/\d/g, d => FA[d]);
export const faNum = fa;
export const statusClass = s => s === 'انجام شده' ? 'st-done' : (s === 'بررسی شده' ? 'st-reviewed' : 'st-doing');
export const readJson = id => {
  const el = document.getElementById(id);
  if (!el) return null;
  try { return JSON.parse(el.textContent); } catch (e) { return null; }
};
const coll = new Intl.Collator('fa');
export const cmp = (a, b) => coll.compare(String(a ?? ''), String(b ?? ''));
export const cmpNum = (a, b) => {
  const x = parseFloat(String(a).replace(/[^\d.\-]/g, '')) || 0;
  const y = parseFloat(String(b).replace(/[^\d.\-]/g, '')) || 0;
  return x - y;
};
export const toEn = s => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
export const downloadCsv = (filename, heads, rows) => {
  const esc = t => /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  const lines = [heads.join(',')].concat(rows.map(r => r.map(esc).join(',')));
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

/* mount استاندارد: ساخت اپ روی کانتینر و برداشتن v-cloak بعد از سوار شدن */
export function mountApp(component, container, props) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return null;
  const vm = createApp(component, props || {}).mount(el);
  el.removeAttribute('v-cloak');
  return vm;
}

/* mixin مرتب‌سازی مشترک */
export const sorter = {
  methods: {
    kToggleSort(key) {
      if (this.sortKey === key) { this.sortDir *= -1; }
      else { this.sortKey = key; this.sortDir = 1; }
    },
    kSortIcon(key) {
      if (this.sortKey !== key) return '⇅';
      return this.sortDir > 0 ? '▲' : '▼';
    },
    kSort(rows) {
      if (!this.sortKey) return rows;
      const k = this.sortKey, d = this.sortDir;
      const numeric = k.endsWith('_num');
      const key = numeric ? k.slice(0, -4) : k;
      return rows.slice().sort((a, b) =>
        (numeric ? cmpNum(a[key], b[key]) : (cmp(a[key], b[key]) || cmp(a.title, b.title))) * d);
    }
  }
};
