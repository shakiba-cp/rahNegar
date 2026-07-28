<script>
/* صفحه ورود — «مرا به خاطر بسپار» (localStorage)، نمایش/پنهان رمز، راهنمای فراموشی
   این کامپوننت روی خودِ <form id="lg-form"> سوار می‌شود و محتوای SSR را با
   همان ساختار بازتولید می‌کند؛ ارسال فرم native باقی می‌ماند. */
const KEY = 'secman-remember-user';

export default {
  name: 'LoginForm',
  data() {
    let saved = '';
    try { saved = localStorage.getItem(KEY) || ''; } catch (e) {}
    return { u: saved, rem: true, show: false, note: false };
  },
  mounted() {
    // state اولیه از DOM سرور (تیک SSR) + ذخیره localStorage همگام می‌شود
    const ssrRem = this.$el.querySelector('#lg-rem');
    let saved = '';
    try { saved = localStorage.getItem(KEY) || ''; } catch (e) {}
    this.rem = saved ? true : (ssrRem ? ssrRem.checked : true);
    // ارسال native: روی خود <form> (پدر ریشه قالب) گوش می‌دهیم —
    // submit از فرم صادر می‌شود و به فرزندان نمی‌رسد، پس باید به closest('form') بسته شود
    const form = this.$el.closest('form');
    (form || this.$el).addEventListener('submit', () => {
      try {
        if (this.rem && this.u.trim()) localStorage.setItem(KEY, this.u.trim());
        else localStorage.removeItem(KEY);
      } catch (e) {}
    });
    if (this.u) {
      const p = this.$el.querySelector('#pass');
      if (p) p.focus();
    }
  },
};
</script>
<template>
  <div>
    <label for="lg-user">نام کاربری</label>
    <div class="lg-f">
      <svg class="ic fi"><use href="#i-user"/></svg>
      <input type="text" name="username" id="lg-user" required autofocus placeholder="نام کاربری خود را وارد کنید" v-model="u">
    </div>
    <label for="pass">رمز عبور</label>
    <div class="lg-f">
      <svg class="ic fi"><use href="#i-lock"/></svg>
      <input :type="show?'text':'password'" name="password" id="pass" required placeholder="رمز عبور خود را وارد کنید">
      <button type="button" class="peye" title="نمایش/پنهان رمز" @click="show=!show">
        <svg class="ic" :class="{hide: show}"><use href="#i-eye-off"/></svg>
        <svg class="ic" :class="{hide: !show}"><use href="#i-eye"/></svg>
      </button>
    </div>
    <div class="lg-row">
      <label class="lg-ck"><input type="checkbox" id="lg-rem" v-model="rem" checked><span>مرا به خاطر بسپار</span></label>
      <button type="button" class="lg-forgot" id="lg-forgot" @click="note=true">رمز عبور را فراموش کرده‌اید؟</button>
    </div>
    <div id="lg-note2" class="lg-note2" :class="{on: note}" v-show="note">برای بازنشانی رمز عبور با مدیر سامانه تماس بگیرید.</div>
    <button class="lgbtn" type="submit"><span>ورود به سامانه</span><svg class="ic lg-arr"><use href="#i-back"/></svg></button>
  </div>
</template>
