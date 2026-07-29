<script>
/* چیپ‌های بازهٔ زمانی نمودار روند — روی #rng-month */
import { mountChart } from '@/charts/mount.js';

export default {
  name: 'RangeChips',
  props: { store: { type: Object, required: true } },
  computed: {
    months() { return this.store.months; },
    range() { return this.store.range; },
    showChips() { return this.months.length > 6; },
    sliced() {
      if (this.store.custom) {
        const [i, j] = this.store.custom;
        return this.months.slice(i, j + 1);
      }
      if (!this.range || this.range <= 0 || this.months.length <= this.range) return this.months;
      return this.months.slice(-this.range);
    },
    monthOpts() { return this.months.map((m, i) => ({ i, label: m.label })); }
  },
  watch: {
    sliced: {
      immediate: true,
      handler(list) {
        if (!document.getElementById('ch-month')) return;
        mountChart('line', 'ch-month', list.map(x => ({ ...x, href: this.store.monthHref(x.label) })));
      }
    },
    showChips: {
      immediate: true,
      handler(v) {
        // باکس چیپ‌ها روی خودِ کانتینر #rng-month (والد ریشه قالب) پنهان/نمایان می‌شود
        this.$nextTick(() => {
          const host = document.getElementById('rng-month');
          if (host) host.style.display = v ? '' : 'none';
        });
      }
    }
  },
  data: () => ({ fi: null, ti: null }),
  methods: {
    dis(r) { return r !== 0 && this.months.length <= r && r !== this.range; },
    set(r) { this.store.setRange(r); },
    applyCustom() {
      if (this.fi === null || this.ti === null) return;
      this.store.setCustom(parseInt(this.fi, 10), parseInt(this.ti, 10));
    },
    clearCustom() { this.fi = null; this.ti = null; this.store.custom = null; this.store.setRange(this.store.range); }
  },
};
</script>
<template>
  <div>
    <div class="rng" role="group" aria-label="بازه زمانی نمودار">
      <button type="button" class="rc" data-r="3" :class="{on: !store.custom && range===3}" :disabled="dis(3)" @click="set(3)">۳ ماه</button>
      <button type="button" class="rc" data-r="6" :class="{on: !store.custom && range===6}" :disabled="dis(6)" @click="set(6)">۶ ماه</button>
      <button type="button" class="rc" data-r="12" :class="{on: !store.custom && range===12}" :disabled="dis(12)" @click="set(12)">۱۲ ماه</button>
      <button type="button" class="rc" data-r="0" :class="{on: !store.custom && range===0}" :disabled="dis(0)" @click="set(0)">همه</button>
      <span class="crng">
        <select v-model="fi" class="crs" title="از ماه" @change="applyCustom">
          <option :value="null" disabled>از ماه</option>
          <option v-for="o in monthOpts" :key="'f'+o.i" :value="o.i">{{ o.label }}</option>
        </select>
        <svg class="ic i13"><use href="#i-back"/></svg>
        <select v-model="ti" class="crs" title="تا ماه" @change="applyCustom">
          <option :value="null" disabled>تا ماه</option>
          <option v-for="o in monthOpts" :key="'t'+o.i" :value="o.i">{{ o.label }}</option>
        </select>
        <button v-if="store.custom" type="button" class="rc on" title="پاک کردن بازهٔ دلخواه" @click="clearCustom"><svg class="ic i13"><use href="#i-x"/></svg></button>
      </span>
    </div>
  </div>
</template>
