/* entry گزارش چاپی — نمودارها + دکمه چاپ (نمودار وضعیت به درخواست کاربر حذف شد) */
import { readJson } from '@/lib/kit.js';
import { mountChart } from '@/charts/mount.js';
import { groupTinySlices } from '@/lib/svgcharts.js';

const data = readJson('rp-data') || { charts: null };

const btn = document.getElementById('print-btn');
if (btn) btn.addEventListener('click', () => window.print());

const c = data.charts;
if (c) {
  if (c.domains && c.domains.length > 1) {
    mountChart('hbar', 'ch-bar', c.domains);
    // دونات: جمع کردن حلقه‌های ریز در «سایر» تا لجند شلوغ نشود
    mountChart('donut', 'ch-dom', groupTinySlices(c.domains));
  }
  mountChart('line', 'ch-month', c.monthly || []);
}
