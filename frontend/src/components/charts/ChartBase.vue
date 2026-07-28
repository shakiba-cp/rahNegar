<script>
/* کامپوننت پایهٔ نمودار — رندر SVG خالص بر اساس kind
   kind: line | bar | hbar | donut */
import { barSVG, hbarSVG, donutSVG, lineSVG, attachLineHover } from '@/lib/svgcharts.js';
import { faNum } from '@/lib/kit.js';

let UID = 0;
const builders = { bar: barSVG, hbar: hbarSVG, donut: donutSVG, line: lineSVG };

export default {
  name: 'ChartBase',
  props: {
    kind: { type: String, required: true },
    hostId: { type: String, default: '' },
  },
  data: () => ({ d: [], uid: ++UID }),
  computed: {
    svg() { return builders[this.kind](this.d, this.uid); },
    legendHtml() {
      if (this.kind !== 'donut') return '';
      const data = this.d, total = data.reduce((a, d) => a + d.value, 0) || 1,
            real = data.filter(d => d.value > 0);
      return real.length
        ? real.map(d => `<span title="${faNum(Math.round(d.value / total * 100))}٪"><span class="dot" style="background:${d.color}"></span>${d.label} <b>(${faNum(d.value)})</b></span>`).join('')
        : '<span style="color:#94a3b8">داده‌ای نیست</span>';
    }
  },
  watch: {
    legendHtml: {
      immediate: true,
      handler(h) {
        if (this.kind !== 'donut') return;
        const lg = document.getElementById(this.hostId + '-legend');
        if (lg) lg.innerHTML = h;
      }
    }
  },
  mounted() { if (this.kind === 'line') attachLineHover(this.$el); },
};
</script>
<template><div v-html="svg" style="display:contents"></div></template>
