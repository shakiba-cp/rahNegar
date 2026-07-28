<script>
/* فهرست فیلدهای حوزه — باز/بسته‌شدن فرم ویرایش هر فیلد (پورت SFC) */
import { readJson, faNum as fa } from '@/lib/kit.js';

export default {
  name: 'FldsList',
  data() {
    const payload = readJson('flds-data') || { rows: [] };
    return { rows: payload.rows || [], q: '', openId: null };
  },
  computed: {
    filtered() {
      const q = this.q.trim();
      return q ? this.rows.filter(x => (x.label + ' ' + x.section).includes(q)) : this.rows;
    }
  },
  methods: {
    fa,
    opts(f) { return (f.options || []).join('\n'); },
    isFirst(f) { return this.rows[0] && this.rows[0].id === f.id; },
    isLast(f) { return this.rows[this.rows.length - 1] && this.rows[this.rows.length - 1].id === f.id; },
    toggleEdit(f) { this.openId = this.openId === f.id ? null : f.id; },
    delConfirm(f) { return "return confirm('حذف فیلد «" + f.label + "»؟')"; }
  },
};
</script>
<template>
  <div>
    <div class="vbar" v-if="rows.length > 8">
      <div class="srch vgrow"><svg class="ic"><use href="#i-search"/></svg>
        <input v-model="q" type="text" placeholder="جستجوی لحظه‌ای فیلد یا بخش...">
      </div>
      <span class="mute fs11" v-if="q">{{ fa(filtered.length) }} نتیجه</span>
    </div>
    <ul class="flist" v-if="filtered.length">
      <li v-for="f in filtered" :key="f.id" class="frow" :class="{off: !f.is_active}">
        <div class="flb wrap">
          <div class="fl-sm wrap nih"><b class="ink1">{{ f.label }}</b>
            <span class="tag">{{ f.type_fa }}</span>
            <span v-if="f.section" class="tag sec">{{ f.section }}</span>
            <span v-if="f.required" class="badge st-doing">الزامی</span>
            <span v-if="!f.is_active" class="badge st-off">غیرفعال</span>
            <span v-if="f.value_count" class="mute onum">{{ fa(f.value_count) }} مقدار</span>
          </div>
          <div class="btn-row">
            <form method="post" :action="f.move"><input type="hidden" name="direction" value="up"><button class="btn ghost icon" :disabled="isFirst(f)" title="بالا"><svg class="ic"><use href="#i-up"/></svg></button></form>
            <form method="post" :action="f.move"><input type="hidden" name="direction" value="down"><button class="btn ghost icon" :disabled="isLast(f)" title="پایین"><svg class="ic"><use href="#i-down"/></svg></button></form>
            <button type="button" class="btn ghost sm" :class="{on: openId===f.id}" @click="toggleEdit(f)"><svg class="ic"><use href="#i-pencil"/></svg> ویرایش</button>
            <form v-if="!f.value_count" method="post" :action="f.delete" :onsubmit="delConfirm(f)"><button class="btn danger icon" title="حذف"><svg class="ic"><use href="#i-trash"/></svg></button></form>
          </div>
        </div>
        <form :class="{on: openId===f.id}" method="post" :action="f.edit" class="fedit">
          <div class="form-grid">
            <div><label>نام فیلد</label><input type="text" name="label" :value="f.label" required></div>
            <div><label>گزینه‌های لیست (هر خط یک گزینه)</label><textarea name="options" rows="2">{{ opts(f) }}</textarea></div>
            <div><label>بخش فرم</label><input type="text" name="section" :value="f.section" list="sec-list"></div>
            <div><label>&nbsp;</label>
              <span class="chkline mb-2"><input type="checkbox" name="required" :id="'req-'+f.id" :checked="!!f.required"><label :for="'req-'+f.id" class="mbz">الزامی</label></span>
              <span class="chkline"><input type="checkbox" name="is_active" :id="'act-'+f.id" :checked="!!f.is_active"><label :for="'act-'+f.id" class="mbz">فعال</label></span>
            </div>
          </div>
          <button class="btn ok sm mt-3"><svg class="ic"><use href="#i-check"/></svg> ذخیره فیلد</button>
        </form>
      </li>
    </ul>
    <div v-else-if="q" class="mute" style="padding:14px">فیلدی با این جستجو یافت نشد.</div>
    <div v-else class="empty"><div class="eic"><svg class="ic i88"><use href="#i-empty"/></svg></div><div class="big">فیلدی تعریف نشده است.</div></div>
  </div>
</template>
