<script>
/* نوار فیلتر صفحه فعالیت‌ها — روی #flt-app (کارت کامل فیلترها) سوار می‌شود
   و مارک‌آپ SSR را با معادل واکنش‌گرا بازتولید می‌کند.
   داده‌های حوزه/وضعیت/کارشناس و مقادیر فعلی از جزیره JSON «flt-data» می‌آیند. */
import { readJson } from '@/lib/kit.js';
import TripSelects from '@/components/ui/TripSelects.vue';

export default {
  name: 'FltPanel',
  components: { TripSelects },
  data: () => ({
    p: readJson('flt-data') || {},
    qv: '',
    tk: '',
    dom: '',
    st: '',
    exp: '',
    col: window.innerWidth < 1240 && (function () { try { return localStorage.getItem('flt') === '1'; } catch (e) { return false; } })()
  }),
  computed: {
    admin() { return !!this.p.admin; },
    domains() { return this.p.domains || []; },
    statuses() { return this.p.statuses || []; },
    users() { return this.p.users || []; },
    args() { return this.p.args || {}; },
    fromParts() { return { y: this.args.from__y || '', m: this.args.from__m || '', d: this.args.from__d || '' }; },
    toParts() { return { y: this.args.to__y || '', m: this.args.to__m || '', d: this.args.to__d || '' }; },
    advOpen() { return !!(this.args.ticket || this.args.from__y || this.args.to__y); }
  },
  created() {
    const a = (this.p && this.p.args) || {};
    this.qv = a.q || ''; this.tk = a.ticket || '';
    this.dom = a.domain != null ? String(a.domain) : '';
    this.st = a.status || '';
    this.exp = a.expert != null ? String(a.expert) : '';
  },
  watch: {
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
      <div class="f sm"><label>حوزه</label>
        <select name="domain" v-model="dom">
          <option value="">همه</option>
          <option v-for="d in domains" :key="d.id" :value="String(d.id)">{{ d.name }}</option>
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
          <div class="f"><label>از تاریخ</label><TripSelects base="from_" :parts="fromParts"/></div>
          <div class="f"><label>تا تاریخ</label><TripSelects base="to_" :parts="toParts"/></div>
          <div class="f sm"><label>شماره تیکت</label><input type="text" name="ticket" v-model="tk" placeholder="مثلأ‌ 4321"></div>
          <div class="f sm"><label>&nbsp;</label><button class="btn pri sm" type="submit"><svg class="ic"><use href="#i-check"/></svg> اعمال</button></div>
        </div>
      </details>
    </form>
  </div>
</template>
