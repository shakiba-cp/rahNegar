<script>
/* فیلد تکی فرم فعالیت — پورت دقیق کامپوننت fieldc نسخهٔ global */
import TripSelects from '../../components/ui/TripSelects.vue';

const nn = v => (v == null ? '' : v);

export default {
  name: 'FieldCell',
  components: { TripSelects },
  props: { f: Object, p: Object },
  computed: {
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
};
</script>
<template>
  <div :class="{full: f.type==='textarea'}">
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
    <input v-else type="text" :name="'f'+f.id" :id="'f'+f.id" :value="v" :required="f.required">
  </div>
</template>
