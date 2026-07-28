<script>
/* فیلد تاریخ سه‌بخشی جلالی (سال/ماه/روز) — سلکت‌های واقعی با name دلخواه
   دکمه تقویم (.dtp-btn) توسط پوسته (DatePopup) به‌صورت سراسری هندل می‌شود.
   props:
     - base: پیشوند نام فیلدها؛ نام‌ها به‌صورت `${base}__y/m/d` ساخته می‌شوند
     - parts: {y,m,d} مقدار اولیه
     - required: ستاره/اجبار
*/
import { faNum } from '@/lib/kit.js';
import { JMN, todayJ } from '@/lib/jalali.js';

const pad2 = v => (v === '' || v == null) ? '' : String(v).padStart(2, '0');

export default {
  name: 'TripSelects',
  props: {
    base: { type: String, required: true },
    parts: { type: Object, default: () => ({ y: '', m: '', d: '' }) },
    required: { type: Boolean, default: false },
  },
  methods: { fa: faNum },
  computed: {
    sel() { const d = this.parts; return { y: d.y == null ? '' : d.y, m: pad2(d.m), d: pad2(d.d) }; },
    cy() { const t = todayJ(); return t[0]; },
    years() {
      const arr = [];
      for (let y = this.cy + 3; y >= this.cy - 7; y--) arr.push(String(y));
      if (this.sel.y && !arr.includes(String(this.sel.y))) arr.unshift(String(this.sel.y));
      return arr;
    },
    months() { return JMN.slice(1).map((name, i) => ({ v: String(i + 1).padStart(2, '0'), name })); },
    days() {
      const m = pad2(this.parts.m);
      const md = m === '12' ? 29 : (['07', '08', '09', '10', '11'].includes(m) ? 30 : 31);
      const arr = [];
      for (let d = 1; d <= md; d++) arr.push(String(d).padStart(2, '0'));
      const dd = pad2(this.parts.d);
      if (dd && !arr.includes(dd)) arr.push(dd);
      return arr;
    }
  },
};
</script>
<template>
  <div class="date-trip">
    <select data-k="y" :name="base+'__y'">
      <option value="">سال</option>
      <option v-for="y in years" :key="y" :value="y" :selected="sel.y===y">{{ fa(y) }}</option>
    </select>
    <select data-k="m" :name="base+'__m'">
      <option value="">ماه</option>
      <option v-for="mo in months" :key="mo.v" :value="mo.v" :selected="sel.m===mo.v">{{ mo.name }}</option>
    </select>
    <select data-k="d" :name="base+'__d'">
      <option value="">روز</option>
      <option v-for="d in days" :key="d" :value="d" :selected="sel.d===d">{{ fa(parseInt(d,10)) }}</option>
    </select>
    <button type="button" class="dtp-btn" title="انتخاب از تقویم"><svg class="ic"><use href="#i-cal"/></svg></button>
  </div>
</template>
