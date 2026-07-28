<script>
/* نمودار خطی روند ماهانه (SVG) */
import ChartBase from './ChartBase.vue';
export default {
  name: 'LineChart',
  components: { ChartBase },
  props: { hostId: { type: String, default: '' } },
  computed: { base() { return this.$refs.c; } },
  methods: { setData(d) { this.$refs.c.d = d || []; } },
};
</script>
<template><ChartBase ref="c" kind="line" :hostId="hostId"/></template>
