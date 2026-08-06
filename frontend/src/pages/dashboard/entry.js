/* ============================================================
   entry داشبورد — استور واکنش‌گرا + mount کامپوننت‌ها + رفرش زنده
   ============================================================ */
import { reactive } from 'vue';
import { mountApp, readJson, toEn } from '@/lib/kit.js';
import { mountChart } from '@/charts/mount.js';
import { groupTinySlices } from '@/lib/svgcharts.js';
import KpiGrid from './KpiGrid.vue';
import RangeChips from './RangeChips.vue';
import MiniTable from './MiniTable.vue';

const initial = readJson('dash-data') || {
  last_acts: [], last_uploads: [], charts: null,
  total: 0, this_month: 0, month_delta: 0, domains_n: 0, users_c: 0, last_date: ''
};

/* ---------- استور صفحه ---------- */
const JMONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
let initRange = 12;
try { initRange = parseInt(localStorage.getItem('secman-rng') || '12', 10); } catch (e) {}

const dash = reactive({
  k: {
    total: initial.total || 0,
    this_month: initial.this_month || 0,
    month_delta: initial.month_delta || 0,
    domains_n: initial.domains_n || 0,
    users_c: initial.users_c || 0,
    last_date: initial.last_date || ''
  },
  acts: initial.last_acts || [],
  uploads: initial.last_uploads || [],
  months: (initial.charts && initial.charts.monthly) || [],
  range: initRange,
  custom: null,
  monthHref(label) {
    const parts = String(label).split(' ');
    const mi = JMONTHS.indexOf(parts[0]);
    const y = parts.length > 1 ? parseInt(toEn(parts[1]), 10) : NaN;
    if (mi < 0 || !y) return null;
    const m = String(mi + 1).padStart(2, '0');
    return '/activities?from__y=' + y + '&from__m=' + m + '&from__d=01&to__y=' + y + '&to__m=' + m + '&to__d=31';
  },
  setRange(r) {
    this.range = r;
    this.custom = null;
    try { localStorage.setItem('secman-rng', String(r)); } catch (e) {}
  },
  setCustom(i, j) {
    if (i > j) [i, j] = [j, i];
    this.custom = [i, j];
  }
});

/* ---------- mount کامپوننت‌ها ---------- */
mountApp(KpiGrid, '#dash-kpis', { store: dash });
mountApp(RangeChips, '#rng-month', { store: dash });
mountApp(MiniTable, '#dash-acts', { store: dash, kind: 'acts' });
mountApp(MiniTable, '#dash-ups', { store: dash, kind: 'ups' });

/* ---------- اعمال دادهٔ تازه ---------- */
function applyAll(p) {
  dash.k.total = p.total; dash.k.this_month = p.this_month;
  dash.k.month_delta = p.month_delta; dash.k.domains_n = p.domains_n;
  dash.k.users_c = p.users_c; dash.k.last_date = p.last_date || '';
  if (p.charts) {
    mountChart('hbar', 'ch-acts', p.charts.domains);
    if ((p.charts.experts || []).length) {
      mountChart('donut', 'ch-exp', p.charts.experts.map((x, i) => ({
        ...x, color: ['#0F766E', '#2563EB', '#7C3AED', '#0891B2', '#0D9488', '#6366F1',
                      '#9333EA', '#0EA5E9', '#14B8A6', '#4F46E5', '#8B5CF6', '#64748B'][i % 12]
      })));
    }
    dash.months = p.charts.monthly || [];
    // دونات «سهم هر حوزه»: حلقه‌های ریز و پرتعداد با هم → «سایر» تا نمودار شلوغ نشود
    mountChart('donut', 'ch-dom', groupTinySlices(p.charts.domains));
    mountChart('donut', 'ch-st', p.charts.status.map(x => ({
      ...x, color: (window.STATUS_C[x.label] || '#2563eb'),
      href: '/activities?status=' + encodeURIComponent(x.label)
    })));
  }
  dash.acts = p.last_acts || [];
  dash.uploads = p.last_uploads || [];
}

/* رسم اولیه نمودارهای دونات/میله‌ای (نمودار خطی توسط watch اپ rng رسم می‌شود) */
if (initial.charts) applyAll({ ...initial, last_acts: dash.acts, last_uploads: dash.uploads });

/* ---------- رفرش زنده ---------- */
let _lastFetch = 0;
function refresh(force) {
  if (!force && Date.now() - _lastFetch < 10000) return;  // تربت‌ل: بیش از ۱۰ ثانیه
  _lastFetch = Date.now();
  fetch('/api/dashboard', { credentials: 'same-origin', headers: { 'Accept': 'application/json' } })
    .then(r => (r.ok ? r.json() : null))
    .then(p => { if (p && typeof p.total !== 'undefined') applyAll(p); })
    .catch(() => {});
}
if (document.getElementById('dash-kpis')) {
  setInterval(refresh, 45000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  window.addEventListener('focus', () => refresh());                       // جابه‌جایی بین پنجره‌ها
  window.addEventListener('pageshow', (e) => { if (e.persisted) refresh(true); });  // بازگشت bfcache
}
