<script>
/* پشته توست‌های اعلان (فلش‌های سرور) */
import { chrome, dismiss } from '@/store/chrome.js';
export default {
  name: 'ToastStack',
  data: () => ({ st: chrome }),
  methods: { dismiss },
};
</script>
<template>
  <div class="toast-stack" v-if="st.toasts.length">
    <div v-for="t in st.toasts" :key="t.id" class="toast" :class="[t.cls, {bye: t.bye}]">
      <svg class="ic" v-if="t.cat==='success'"><use href="#i-checkc"/></svg>
      <svg class="ic" v-else-if="t.cat==='error'"><use href="#i-alert"/></svg>
      <svg class="ic" v-else><use href="#i-alert-tri"/></svg>
      <span>{{ t.msg }}</span>
      <button type="button" class="tx" title="بستن" @click="dismiss(t)">✕</button>
    </div>
  </div>
</template>
