<script>
/* نوار فیلتر صفحه فعالیت‌ها — روی #flt-app (کارت کامل فیلترها) سوار می‌شود
   و مارک‌آپ SSR را با معادل واکنش‌گرا بازتولید می‌کند.
   داده‌های حوزه/وضعیت/کارشناس و مقادیر فعلی از جزیره JSON «flt-data» می‌آیند. */
import { readJson } from '@/lib/kit.js';
import TripSelects from '@/components/ui/TripSelects.vue';
import { todayJ, g2jjs, j2gjs, jDim } from '@/lib/jalali.js';

export default {
  name: 'FltPanel',
  components: { TripSelects },
  data: () => ({
    p: readJson('flt-data') || {},
    qv: '',
    tk: '',
    dom: '',
    org: '',
    st: '',
    exp: '',
    fp: { y: '', m: '', d: '' },
    tp: { y: '', m: '', d: '' },
    col: window.innerWidth < 1240 && (function () { try { return localStorage.getItem('flt') === '1'; } catch (e) { return false; } })()
  }),
  computed: {
    admin() { return !!this.p.admin; },
    domains() { return this.p.domains || []; },
    orgs() { return this.p.orgs || []; },
    domsInOrg() {
      if (!this.org) return this.domains;
      return this.domains.filter(d => String(d.org_id) === this.org);
    },
    statuses() { return this.p.statuses || []; },
    users() { return this.p.users || []; },
    args() { return this.p.args || {}; },
    fromParts() { return this.fp; },
    toParts() { return this.tp; },
    hasRange() { return !!(this.fp.y || this.tp.y); },
    advOpen() { return !!(this.args.ticket || this.args.from__y || this.args.to__y); }
  },
  created() {
    const a = (this.p && this.p.args) || {};
    this.qv = a.q || ''; this.tk = a.ticket || '';
    this.dom = a.domain != null ? String(a.domain) : '';
    this.org = a.org != null ? String(a.org) : '';
    this.st = a.status || '';
    this.exp = a.expert != null ? String(a.expert) : '';
    this.fp = { y: a.from__y || '', m: a.from__m || '', d: a.from__d || '' };
    this.tp = { y: a.to__y || '', m: a.to__m || '', d: a.to__d || '' };
  },
  watch: {
    org() {
      if (this.dom && !this.domsInOrg.some(d => String(d.id) === this.dom)) this.dom = '';
    },
    col: {
      immediate: true,
      handler(v) {
        // کلاس روی خودِ کانتینر #flt-app (والد ریشه قالب)
        this.$nextTick(() => {
          const host = document.getElementById('flt-app');
          if (host) host.classList.toggle('collapsed', v);
        });
      }
    }
  },
  methods: {
    qr(kind) {
      /* بازه‌های سریع تاریخ — ست کردن سه‌تکه‌ها و ارسال فرم */
      const [jy, jm] = [todayJ()[0], todayJ()[1]];
      const g0 = j2gjs(...todayJ());
      const t0 = new Date(g0.gy, g0.gm - 1, g0.gd), D = 864e5;
      const J = ms => { const x = new Date(ms); return g2jjs(x.getFullYear(), x.getMonth() + 1, x.getDate()); };
      let from, to;
      if (kind === '7')       { from = J(t0 - 6 * D);  to = J(t0); }
      else if (kind === '30') { from = J(t0 - 29 * D); to = J(t0); }
      else if (kind === 'm')  { from = [jy, jm, 1];    to = J(t0); }
      else { const pmy = jm === 1 ? jy - 1 : jy, pmm = jm === 1 ? 12 : jm - 1;
             from = [pmy, pmm, 1]; to = [pmy, pmm, jDim(pmy, pmm)]; }
      this.fp = { y: String(from[0]), m: String(from[1]), d: String(from[2]) };
      this.tp = { y: String(to[0]),   m: String(to[1]),   d: String(to[2]) };
      this.$nextTick(() => this.$el.querySelector('form.filters').submit());
    },
    cr() {
      const qs = new URLSearchParams(window.location.search);
      ['from__y','from__m','from__d','to__y','to__m','to__d'].forEach(k => qs.delete(k));
      const tail = qs.toString();
      window.location.href = (this.p.urls && this.p.urls.base || '/') + (tail ? '?' + tail : '');
    },
    toggle() {
      this.col = !this.col;
      try { localStorage.setItem('flt', this.col ? '1' : '0'); } catch (e) {}
    }
  },
};
</script>
<template>
  <div>
    <div class="flb mb-4">
      <div class="btn-row no-print">
        <a class="btn ghost" :href="p.urls && p.urls.excel"><svg class="ic"><use href="#i-download"/></svg> خروجی Excel</a>
        <a class="btn ghost" :href="p.urls && p.urls.pdf"><svg class="ic"><use href="#i-printer"/></svg> خروجی PDF</a>
      </div>
      <button type="button" class="btn ghost sm flt-tgl" @click="toggle"><svg class="ic"><use href="#i-filter"/></svg><span v-text="col ? 'نمایش فیلترها' : 'پنهان فیلترها'"></span></button>
    </div>
    <form class="filters" method="get" :action="p.urls && p.urls.base">
      <div class="f"><label>جستجو</label><div class="srch"><svg class="ic"><use href="#i-search"/></svg><input type="text" name="q" v-model="qv" placeholder="عنوان، تیکت، کارشناس..."></div></div>
      <div class="f sm"><label>مرکز</label>
        <select name="org" v-model="org">
          <option value="">همه</option>
          <option v-for="o in orgs" :key="o.id" :value="String(o.id)">{{ o.name }}</option>
        </select></div>
      <div class="f sm"><label>حوزه</label>
        <select name="domain" v-model="dom">
          <option value="">همه</option>
          <option v-for="d in domsInOrg" :key="d.id" :value="String(d.id)">{{ d.name }}</option>
        </select></div>
      <div class="f sm"><label>وضعیت</label>
        <select name="status" v-model="st">
          <option value="">همه</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select></div>
      <div class="f sm" v-if="admin"><label>کارشناس</label>
        <select name="expert" v-model="exp">
          <option value="">همه</option>
          <option v-for="u in users" :key="u.id" :value="String(u.id)">{{ u.full_name }}</option>
        </select></div>
      <div class="f sm"><label>&nbsp;</label><button class="btn pri" type="submit"><svg class="ic"><use href="#i-check"/></svg> اعمال فیلتر</button></div>
      <div class="f sm"><label>&nbsp;</label><a :href="p.urls && p.urls.clear" class="btn ghost">پاک‌سازی</a></div>
      <details class="adv full" :open="advOpen">
        <summary><svg class="ic"><use href="#i-sliders"/></svg> فیلترهای پیشرفته (تاریخ و تیکت)</summary>
        <div class="adv-body">
          <div class="f full"><label>بازه‌های سریع</label>
            <div class="rng">
              <button type="button" class="rc" @click="qr('7')">۷ روز اخیر</button>
              <button type="button" class="rc" @click="qr('30')">۳۰ روز اخیر</button>
              <button type="button" class="rc" @click="qr('m')">این ماه</button>
              <button type="button" class="rc" @click="qr('pm')">ماه قبل</button>
              <button type="button" class="rc" v-if="hasRange" @click="cr">پاک‌سازی بازه</button>
            </div></div>
          <div class="f"><label>از تاریخ</label><TripSelects base="from" :parts="fromParts"/></div>
          <div class="f"><label>تا تاریخ</label><TripSelects base="to" :parts="toParts"/></div>
          <div class="f sm"><label>شماره تیکت</label><input type="text" name="ticket" v-model="tk" placeholder="مثلأ‌ 4321"></div>
          <div class="f sm"><label>&nbsp;</label><button class="btn pri sm" type="submit"><svg class="ic"><use href="#i-check"/></svg> اعمال</button></div>
        </div>
      </details>
    </form>
  </div>
</template>
