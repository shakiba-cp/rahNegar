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
      if (!this.range || this.range <= 0 || this.months.length <= this.range) return this.months;
      return this.months.slice(-this.range);
    }
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
  methods: {
    dis(r) { return r !== 0 && this.months.length <= r && r !== this.range; },
    set(r) { this.store.setRange(r); }
  },
};
</script>
<template>
  <div class="rng" role="group" aria-label="بازه زمانی نمودار">
    <button type="button" class="rc" data-r="3" :class="{on: range===3}" :disabled="dis(3)" @click="set(3)">۳ ماه</button>
    <button type="button" class="rc" data-r="6" :class="{on: range===6}" :disabled="dis(6)" @click="set(6)">۶ ماه</button>
    <button type="button" class="rc" data-r="12" :class="{on: range===12}" :disabled="dis(12)" @click="set(12)">۱۲ ماه</button>
    <button type="button" class="rc" data-r="0" :class="{on: range===0}" :disabled="dis(0)" @click="set(0)">همه</button>
  </div>
</template>
