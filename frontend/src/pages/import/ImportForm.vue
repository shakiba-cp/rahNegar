<script>
/* ورود از Excel — روی #imp-app (دو ستون) سوار می‌شود:
   گیت دکمه، لینک قالب نمونه، دراپ‌زون، اسپینر پردازش. */
import { readJson } from '@/lib/kit.js';

export default {
  name: 'ImportForm',
  data() {
    const p = readJson('imp-data') || {};
    return { p, dom: p.dom ? String(p.dom) : '', fname: '', over: false, busy: false };
  },
  computed: {
    domains() { return this.p.domains || []; },
    ready() { return !!this.dom && !!this.fname; }
  },
  methods: {
    pick(e) { if (e.target !== this.$refs.fi) this.$refs.fi.click(); },
    onFile(e) {
      const fs = e.target.files;
      this.fname = fs && fs.length ? (fs.length > 1 ? fs.length + ' فایل انتخاب شد' : fs[0].name) : '';
    },
    onDrop(e) {
      this.over = false;
      if (e.dataTransfer && e.dataTransfer.files.length) {
        this.$refs.fi.files = e.dataTransfer.files;
        this.onFile({ target: this.$refs.fi });
      }
    }
  },
};
</script>
<template>
  <div class="card">
    <h3><svg class="ic"><use href="#i-upload"/></svg> ۱) انتخاب حوزه و فایل</h3>
    <form method="post" enctype="multipart/form-data" @submit="busy=true">
      <div class="mb-4">
        <label for="dom">حوزه امنیتی</label>
        <select name="domain_id" id="dom" required v-model="dom">
          <option value="">— انتخاب کنید —</option>
          <option v-for="d in domains" :key="d.id" :value="String(d.id)">{{ d.name }}</option>
        </select>
      </div>
      <div class="mb-5">
        <label>فایل Excel (xlsx)</label>
        <div class="dz" :class="{over: over}"
             @click="pick" @dragover.prevent="over=true" @dragenter.prevent="over=true"
             @dragleave.prevent="over=false" @drop.prevent="onDrop">
          <input type="file" name="file" id="file" accept=".xlsx,.xlsm" required class="hide" ref="fi" @change="onFile">
          <div class="dz-ic"><svg class="ic i22"><use href="#i-upload"/></svg></div>
          <div class="dz-t">فایل را اینجا رها کنید یا کلیک کنید</div>
          <div class="dz-s">فقط xlsx / xlsm — سطر اول باید عنوان ستون‌ها باشد</div>
          <div class="dz-name" v-show="fname" v-text="fname" style="display:none"></div>
        </div>
      </div>
      <div class="up-prog" id="up-prog" v-show="busy" style="display:none"><span></span></div>
      <button class="btn pri" type="submit" id="imp-btn" :disabled="!ready||busy">
        <template v-if="busy"><svg class="ic spin"><use href="#i-upload"/></svg> در حال پردازش فایل...</template>
        <template v-else><svg class="ic"><use href="#i-inbox"/></svg> ثبت و پردازش فایل</template>
      </button>
      <span class="mute fs11" id="imp-note" v-show="!ready">ابتدا حوزه و فایل را انتخاب کنید.</span>
    </form>
  </div>
  <div class="card">
    <h3><svg class="ic"><use href="#i-doc"/></svg> ۲) راهنما</h3>
    <ul class="fs12 ink2" style="padding-right:18px;line-height:2.3">
      <li>سطر اول فایل باید <b>عنوان ستون‌ها</b> (دقیقاً مطابق فیلدهای حوزه) باشد؛ هر ردیف بعدی = یک Activity.</li>
      <li>تاریخ‌ها را <b>شمسی</b> بنویسید (مثل ۱۴۰۴/۰۴/۳۰).</li>
      <li>پس از پردازش، نتیجه ثبت یا خطاهای هر ردیف نمایش داده می‌شود.</li>
      <li>برای تطبیق دقیق ستون‌ها، <b>قالب نمونه</b> همان حوزه را دانلود کنید.</li>
    </ul>
    <a class="btn pri mt-3" id="tmpl-link" v-show="dom" style="display:none" :href="dom?('/import/template/'+dom):'#'"><svg class="ic"><use href="#i-download"/></svg> دانلود قالب نمونه حوزه</a>
  </div>
</template>
