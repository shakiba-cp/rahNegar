<script>
/* نمودار میله‌ای افقی (SVG) */
import ChartBase from './ChartBase.vue';
export default {
  name: 'HBarChart',
  components: { ChartBase },
  props: { hostId: { type: String, default: '' } },
  methods: { setData(d) { this.$refs.c.d = d || []; } },
};
</script>
<template><ChartBase ref="c" kind="hbar" :hostId="hostId"/></template>
