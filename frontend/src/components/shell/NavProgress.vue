<script>
/* نوار پیشرفت ناوبری بالای صفحه */
import { chrome } from '@/store/chrome.js';
export default {
  name: 'NavProgress',
  data: () => ({ st: chrome }),
};
</script>
<template>
  <div class="vnav" :class="{on: st.nav.on, done: st.nav.done}"></div>
</template>
