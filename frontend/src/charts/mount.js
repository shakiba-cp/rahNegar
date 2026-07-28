/* ============================================================
   رجیستری چارت‌ها: mountChart(kind, id, data)
   یک کامپوننت چارت Vue روی کانتینر #id سوار می‌کند یا دادهٔ آن را تازه می‌کند.
   همچنین پل‌های سراسری سازگاری: window.lineChart / barChart / donutChart / hbarChart
   ============================================================ */
import { createApp } from 'vue';
import LineChart from '@/components/charts/LineChart.vue';
import BarChart from '@/components/charts/BarChart.vue';
import DonutChart from '@/components/charts/DonutChart.vue';
import HBarChart from '@/components/charts/HBarChart.vue';

const COMPS = { line: LineChart, bar: BarChart, donut: DonutChart, hbar: HBarChart };
const REG = {};

export function mountChart(kind, id, data) {
  const el = document.getElementById(id);
  if (!el) return;
  const cur = REG[id];
  if (cur && cur.kind === kind) { cur.root.setData(data || []); return; }
  if (cur) { cur.app.unmount(); delete REG[id]; }
  el.innerHTML = '';
  const app = createApp(COMPS[kind], { hostId: id });
  const root = app.mount(el);
  root.setData(data || []);
  REG[id] = { app, kind, root };
}

if (typeof window !== 'undefined') {
  window.__mountChart = mountChart;
  window.lineChart = (id, data) => mountChart('line', id, data);
  window.barChart = (id, data) => mountChart('bar', id, data);
  window.donutChart = (id, data) => mountChart('donut', id, data);
  window.hbarChart = (id, data) => mountChart('hbar', id, data);
}
