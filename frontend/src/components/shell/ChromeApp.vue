<script>
/* اپ پوسته کروم: توست + مودال تأیید + تقویم + نوار ناوبری */
import ToastStack from './ToastStack.vue';
import ConfirmModal from './ConfirmModal.vue';
import DatePopup from './DatePopup.vue';
import NavProgress from './NavProgress.vue';
import { armAutoDismiss } from '@/store/chrome.js';

export default {
  name: 'ChromeApp',
  components: { ToastStack, ConfirmModal, DatePopup, NavProgress },
  mounted() { armAutoDismiss(); },
};
</script>
<template>
  <div>
    <NavProgress/>
    <ToastStack/>
    <ConfirmModal/>
    <DatePopup/>
  </div>
</template>
