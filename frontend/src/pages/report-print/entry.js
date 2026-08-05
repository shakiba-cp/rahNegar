/* entry گزارش چاپی — نمودارها + دکمه چاپ + چاپ خودکار (ماژول Vite، بدون وابستگی جهانی) */
import { readJson } from '@/lib/kit.js';
import { mountChart } from '@/charts/mount.js';
import { STATUS_C } from '@/lib/svgcharts.js';

const data = readJson('rp-data') || { charts: null };

const btn = document.getElementById('print-btn');
if (btn) btn.addEventListener('click', () => window.print());

const c = data.charts;
if (c) {
  if (c.domains && c.domains.length > 1) {
    mountChart('hbar', 'ch-bar', c.domains);
    mountChart('donut', 'ch-dom', c.domains);
  }
  mountChart('donut', 'ch-st', (c.status || []).map(d => ({ ...d, color: STATUS_C[d.label] || '#2563eb' })));
  mountChart('line', 'ch-month', c.monthly || []);
}
/* چاپ خودکار حذف شد: window.print خودبه‌خودی تب را قفل می‌کرد و راه بازگشت نبود؛
   کاربر با دکمه «چاپ / ذخیره PDF» هر وقت آماده بود چاپ می‌کند. */
