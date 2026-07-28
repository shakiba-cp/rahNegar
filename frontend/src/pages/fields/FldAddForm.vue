<script>
/* فرم افزودن فیلد — روی <form id="fld-add-form"> سوار می‌شود.
   باکس گزینه‌ها فقط برای نوع «لیست کشویی» نمایش داده می‌شود. */
import { readJson } from '@/lib/kit.js';

export default {
  name: 'FldAddForm',
  data() {
    const p = readJson('fldadd-data') || {};
    return { p, t: p.t || 'text' };
  },
  computed: {
    choices() { return this.p.sec_choices || []; },
    example() { return this.choices.length ? this.choices[0] : ''; }
  },
};
</script>
<template>
  <div>
    <div class="form-grid">
      <div><label class="req">نام فیلد</label><input type="text" name="label" placeholder="مثلاً: آدرس IP" required></div>
      <div><label>نوع فیلد</label>
        <select name="field_type" id="ftype" v-model="t">
          <option value="text">متن کوتاه</option>
          <option value="textarea">متن بلند (توضیحات)</option>
          <option value="number">عدد</option>
          <option value="date">تاریخ (شمسی)</option>
          <option value="select">لیست کشویی</option>
        </select></div>
      <div id="opts-box" v-show="t==='select'"><label>گزینه‌های لیست (هر خط یک گزینه)</label><textarea name="options" rows="3"></textarea></div>
      <div>
        <label>بخش فرم</label>
        <input type="text" name="section" list="sec-list" placeholder="خالی = فیلدهای اصلی">
        <datalist id="sec-list">
          <option v-for="s in choices" :key="s" :value="s"></option>
        </datalist>
        <div class="mute mt-1" v-if="example">مثلاً «{{ example }}»</div>
      </div>
      <div><label>&nbsp;</label><span class="chkline"><input type="checkbox" name="required" id="req-new"><label for="req-new" class="mbz">فیلد الزامی است</label></span></div>
    </div>
    <button class="btn pri mt-4" type="submit"><svg class="ic"><use href="#i-plus"/></svg> افزودن فیلد</button>
  </div>
</template>
