<script>
/* کارت‌های KPI داشبورد — روی #dash-kpis سوار می‌شود و مارک‌آپ SSR را جایگزین می‌کند.
   فالبک‌های SSR (kpi-delta-fb / kpi-last-fb) صرفاً برای قبل از mount هستند و
   با رندر اولیهٔ Vue از DOM حذف می‌شوند. */
import { fa, readJson } from '@/lib/kit.js';

export default {
  name: 'KpiGrid',
  props: { store: { type: Object, required: true } },
  computed: {
    k() { return this.store.k; },
    deltaCls() {
      const n = this.k.month_delta;
      return { flat: this.k.this_month === 0 || n === 0, up: this.k.this_month !== 0 && n > 0, down: this.k.this_month !== 0 && n < 0 };
    },
    deltaHtml() {
      const n = this.k.month_delta;
      if (this.k.this_month === 0) return 'فعالیتی در ماه جاری ثبت نشده';
      if (n > 0) return '<svg class="ic"><use href="#i-up"/></svg>' + fa(n) + '+ ماه قبل';
      if (n < 0) return '<svg class="ic"><use href="#i-down"/></svg>' + fa(n) + ' ماه قبل';
      return 'بدون تغییر نسبت به ماه قبل';
    },
    lastShow() { return this.k.this_month === 0 && !!this.k.last_date; },
    lastTxt() { return this.lastShow ? 'آخرین فعالیت: ' + this.k.last_date : ''; },
  },
  methods: { fa },
  mounted() {
    ['kpi-delta-fb', 'kpi-last-fb'].forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });
  },
};
</script>
<template>
  <div class="grid c4 mb-4" id="dash-kpis-grid">
    <div class="kpi k-lg"><div class="kic g1"><svg class="ic i23"><use href="#i-doc"/></svg></div><div><div class="num" id="kpi-total" v-text="fa(k.total)"></div><div class="lbl">کل فعالیت‌ها</div></div></div>
    <div class="kpi k-lg"><div class="kic g2"><svg class="ic i23"><use href="#i-trend"/></svg></div><div><div class="num" id="kpi-month" v-text="fa(k.this_month)"></div><div class="lbl">فعالیت این ماه</div>
      <span id="kpi-delta" class="delta" :class="deltaCls" v-html="deltaHtml"></span>
      <span class="kpi-sub" id="kpi-last" v-show="lastShow" v-text="lastTxt"></span>
    </div></div>
    <div class="kpi"><div class="kic g3"><svg class="ic i23"><use href="#i-layers"/></svg></div><div><div class="num" id="kpi-doms" v-text="fa(k.domains_n)"></div><div class="lbl">حوزه‌های فعال</div></div></div>
    <div class="kpi"><div class="kic g4"><svg class="ic i23"><use href="#i-users"/></svg></div><div><div class="num" id="kpi-users" v-text="fa(k.users_c)"></div><div class="lbl">کاربران</div></div></div>
  </div>
</template>
