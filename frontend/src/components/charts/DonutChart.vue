<script>
/* نمودار دونات + لجند کناری (id-hostId-legend) */
import ChartBase from './ChartBase.vue';
export default {
  name: 'DonutChart',
  components: { ChartBase },
  props: { hostId: { type: String, default: '' } },
  methods: { setData(d) { this.$refs.c.d = d || []; } },
};
</script>
<template><ChartBase ref="c" kind="donut" :hostId="hostId"/></template>
