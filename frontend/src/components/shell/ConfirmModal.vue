<script>
/* مودال تأیید حذف (جایگزین confirm بومی) */
import { chrome, cfmYes, cfmNo } from '@/store/chrome.js';
export default {
  name: 'ConfirmModal',
  data: () => ({ st: chrome }),
  methods: { cfmYes, cfmNo },
};
</script>
<template>
  <div class="cmodal" :class="{on: st.cfm.on}" @click.self="cfmNo">
    <div class="cbox">
      <div class="cic"><svg class="ic i23"><use href="#i-alert"/></svg></div>
      <b class="ct">{{ st.cfm.msg }}</b><span class="cs">این عمل قابل بازگشت نیست.</span>
      <div class="cbtns"><button type="button" class="btn danger cyes" @click="cfmYes">تأیید و حذف</button>
      <button type="button" class="btn ghost cno" @click="cfmNo">انصراف</button></div>
    </div>
  </div>
</template>
