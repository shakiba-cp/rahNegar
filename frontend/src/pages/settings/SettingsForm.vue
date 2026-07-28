<script>
/* تنظیمات سامانه — روی <form id="set-app"> سوار می‌شود:
   انتخابگر لوگو (نام فایل زنده) + چیپ‌های زندهٔ فرمت‌های مجاز. */
import { readJson } from '@/lib/kit.js';

export default {
  name: 'SettingsForm',
  data() {
    const p = readJson('set-data') || {};
    return { p, logoName: 'فایلی انتخاب نشده', fmt: p.formats || '', sysname: p.sys_name || '', maxmb: p.max_mb || 10 };
  },
  computed: {
    chips() { return this.fmt.split(',').map(x => x.trim()).filter(Boolean); }
  },
  methods: {
    onLogo(e) {
      this.logoName = e.target.files.length ? e.target.files[0].name : 'فایلی انتخاب نشده';
    }
  },
};
</script>
<template>
  <div>
    <div class="mb-4">
      <label class="req">نام سامانه</label>
      <input type="text" name="system_name" v-model="sysname" required>
    </div>
    <div class="mb-4">
      <label>لوگو (PNG/JPG)</label>
      <input type="file" name="logo" id="logo-file" ref="lf" accept=".png,.jpg,.jpeg,.gif,.webp,.svg" class="hide" @change="onLogo">
      <div class="fpick">
        <button type="button" class="btn ghost sm" id="logo-btn" @click="$refs.lf.click()"><svg class="ic i14"><use href="#i-upload"/></svg> انتخاب فایل</button>
        <span class="fpick-name mute" id="logo-name" :class="{ink1: logoName !== 'فایلی انتخاب نشده'}" v-text="logoName"></span>
      </div>
      <div v-if="p.has_logo" class="fl-sm mute mt-2">لوگوی فعلی: <img :src="p.logo_url" class="logo-prev" alt="لوگوی فعلی"></div>
    </div>
    <div class="form-grid">
      <div>
        <label>حداکثر حجم هر فایل پیوست</label>
        <div class="in-unit">
          <input type="number" name="max_upload_mb" v-model="maxmb" min="1" max="100" required>
          <span class="unit">مگابایت</span>
        </div>
        <div class="mute mt-1 fs11">عددی بین ۱ تا ۱۰۰</div>
      </div>
      <div>
        <label>فرمت‌های مجاز پیوست</label>
        <input type="text" name="allowed_formats" dir="ltr" class="fmt-in" :value="p.formats || ''" spellcheck="false" v-model="fmt">
        <div class="fmt-chips" id="fmt-chips"><span class="chipfmt" v-for="c in chips" :key="c" v-text="c"></span></div>
        <div class="mute mt-1 fs11">با کامای انگلیسی (,) جدا کنید — حروف کوچک، بدون نقطه</div>
      </div>
    </div>
    <div class="btn-row mt-5">
      <button class="btn pri" type="submit"><svg class="ic"><use href="#i-check"/></svg> ذخیره تنظیمات</button>
    </div>
  </div>
</template>
