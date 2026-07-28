<script>
/* نمودار میله‌ای عمودی (SVG) */
import ChartBase from './ChartBase.vue';
export default {
  name: 'BarChart',
  components: { ChartBase },
  props: { hostId: { type: String, default: '' } },
  methods: { setData(d) { this.$refs.c.d = d || []; } },
};
</script>
<template><ChartBase ref="c" kind="bar" :hostId="hostId"/></template>
