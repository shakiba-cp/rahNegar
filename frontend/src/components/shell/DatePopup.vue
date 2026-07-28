<script>
/* پاپ‌آپ تقویم شمسی (.dtk) — یک نمونه سراسری که به date-trip فعال وصل می‌شود */
import { chrome, calTitle, calWeeks, calNav, calPick, calToday, calClear, calClose } from '@/store/chrome.js';
import { faNum } from '@/lib/kit.js';
export default {
  name: 'DatePopup',
  data: () => ({ st: chrome }),
  computed: {
    title() { return calTitle(); },
    weeks() { return calWeeks(); },
    style() {
      return {
        display: this.st.cal.on ? 'block' : 'none',
        left: this.st.cal.left + 'px',
        top: this.st.cal.top + 'px',
        right: 'auto'
      };
    }
  },
  methods: { faNum, calNav, calPick, calToday, calClear, calClose },
};
</script>
<template>
  <div class="dtk" :style="style" role="dialog" aria-label="تقویم شمسی">
    <div class="hd">
      <button type="button" class="nav" title="ماه قبل" @click="calNav(-1)">‹</button>
      <b>{{ title }}</b>
      <button type="button" class="nav" title="ماه بعد" @click="calNav(1)">›</button>
    </div>
    <table>
      <tr><th v-for="w in ['ش','ی','د','س','چ','پ','ج']" :key="w">{{ w }}</th></tr>
      <tr v-for="(wk, wi) in weeks" :key="wi">
        <td v-for="(c, ci) in wk" :key="ci"><span v-if="c" class="day" :class="{today: c.today, sel: c.sel}" @click="calPick(c)">{{ faNum(c.d) }}</span></td>
      </tr>
    </table>
    <div class="ft">
      <button type="button" @click="calToday">امروز</button>
      <button type="button" @click="calClear">پاک کردن</button>
      <button type="button" @click="calClose">✕</button>
    </div>
  </div>
</template>
