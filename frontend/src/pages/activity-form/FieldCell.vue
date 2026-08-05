<script>
/* فیلد تکی فرم فعالیت — پورت دقیق کامپوننت fieldc نسخهٔ global */
import TripSelects from '../../components/ui/TripSelects.vue';

const nn = v => (v == null ? '' : v);

export default {
  name: 'FieldCell',
  components: { TripSelects },
  props: { f: Object, p: Object },
  data: () => ({ fbig: '' }),
  computed: {
    faN() { return v => (+v || 0).toLocaleString('fa-IR'); },
    limTxt() { return this.p.max_mb ? `حداکثر حجم هر فایل: ${this.faN(this.p.max_mb)} مگابایت` : ''; },
    v() {
      const pv = this.p.posted || {};
      const k = 'f' + this.f.id;
      if (pv[k] !== undefined) return nn(pv[k]);
      const vals = this.p.vals || {};
      if (vals[String(this.f.id)] !== undefined) return nn(vals[String(this.f.id)]);
      return this.f.key === 'expert' ? (this.p.user_name || '') : '';
    },
    dparts() {
      const d = (this.p.dvals || {})[String(this.f.id)];
      return d || { y: '', m: '', d: '' };
    },
  },
  methods: {
    /* کنترل حجم سمت مرورگر — پیش از ارسال، خطای فارسی شفاف (به‌جای خطای nginx/413) */
    fchk(e) {
      const lim = (this.p.max_mb || 10) * 1024 * 1024;
      const f = e.target.files && e.target.files[0];
      if (f && f.size > lim) {
        this.fbig = `حجم «${f.name}» (${this.faN(Math.ceil(f.size / 1048576))} مگابایت) بیش از سقف مجاز (${this.faN(this.p.max_mb || 10)} مگابایت) است.`;
        e.target.value = '';
      } else this.fbig = '';
    },
  },
};
</script>
<template>
  <div :class="{full: f.type==='textarea' || f.type==='file'}">
    <label :class="{req: f.required}" :for="'f'+f.id">{{ f.label }}</label>
    <textarea v-if="f.type==='textarea'" :name="'f'+f.id" :id="'f'+f.id" :required="f.required" rows="3">{{ v }}</textarea>
    <select v-else-if="f.type==='select'" :name="'f'+f.id" :id="'f'+f.id" :required="f.required">
      <option value="">— انتخاب کنید —</option>
      <option v-for="o in f.options" :key="o" :value="o" :selected="v===o">{{ o }}</option>
    </select>
    <input v-else-if="f.type==='number'" type="number" step="any" :name="'f'+f.id" :id="'f'+f.id" :value="v" :required="f.required">
    <template v-else-if="f.type==='date'">
      <TripSelects :base="'f'+f.id" :parts="dparts"></TripSelects>
      <div v-if="f.required" class="req-note"><svg class="ic i14"><use href="#i-alert-tri"/></svg> این فیلد الزامی است — بدون تاریخ ثبت نمی‌شود.</div>
    </template>
    <template v-else-if="f.type==='file'">
      <input type="file" :name="'ff'+f.id" :id="'f'+f.id" :required="f.required && !v" class="upinput"
             :accept="p.accept || ''" @change="fchk">
      <input type="hidden" :name="'curf'+f.id" :value="v">
      <div v-if="fbig" class="uperr"><svg class="ic i14"><use href="#i-alert-tri"/></svg>{{ fbig }}</div>
      <div v-if="v" class="req-note"><svg class="ic i14"><use href="#i-file"/></svg> فایل فعلی: <b>{{ v }}</b> — برای جایگزینی، فایل تازه انتخاب کنید (در فهرست پیوست‌ها هم ذخیره می‌شود).</div>
      <div v-else class="req-note"><svg class="ic i14"><use href="#i-upload"/></svg> فایل همین‌جا آپلود و در پیوست‌های فعالیت ذخیره می‌شود.{{ limTxt ? ' ' + limTxt + '.' : '' }}</div>
    </template>
    <input v-else type="text" :name="'f'+f.id" :id="'f'+f.id" :value="v" :required="f.required">
  </div>
</template>
