<script>
/* جدول‌های کوچک داشبورد: آخرین فعالیت‌ها (kind=acts) / آخرین ورودهای Excel (kind=ups) */
import { fa, statusClass } from '@/lib/kit.js';

export default {
  name: 'MiniTable',
  props: {
    store: { type: Object, required: true },
    kind: { type: String, required: true },   /* acts | ups */
  },
  computed: {
    rows() { return this.kind === 'acts' ? this.store.acts : this.store.uploads; }
  },
  methods: { fa, stClass: statusClass },
};
</script>
<template>
  <div v-if="kind==='acts'">
    <div v-if="rows.length" class="tbl-wrap"><table>
      <thead><tr><th>عنوان</th><th>حوزه</th><th>تاریخ</th></tr></thead>
      <tbody>
      <tr v-for="a in rows" :key="a.id">
        <td><a :href="a.view" class="fw7 ink1">{{ a.title }}</a></td>
        <td><span class="nih"><svg class="ic dic"><use :href="'#'+a.icon"/></svg>{{ a.domain }}</span></td>
        <td class="mute">{{ a.date }}</td>
      </tr>
      </tbody>
    </table></div>
    <div v-else class="empty"><div class="eic"><svg class="ic i88"><use href="#i-empty"/></svg></div><div class="fw7 ink2">هنوز فعالیتی ثبت نشده است.</div></div>
  </div>
  <div v-else>
    <div v-if="rows.length" class="tbl-wrap"><table>
      <thead><tr><th>فایل</th><th>حوزه</th><th>کاربر</th><th>نتیجه</th><th>زمان</th></tr></thead>
      <tbody>
      <tr v-for="(e,i) in rows" :key="i">
        <td><span class="nih"><svg class="ic dic"><use href="#i-file"/></svg>{{ e.file }}</span></td>
        <td>{{ e.domain }}</td>
        <td>{{ e.user }}</td>
        <td><span class="badge st-done">{{ fa(e.ok) }} موفق</span>
            <span v-if="e.err" class="badge st-doing">{{ fa(e.err) }} خطا</span></td>
        <td class="mute">{{ e.when }}</td>
      </tr>
      </tbody>
    </table></div>
    <div v-else class="empty"><div class="eic"><svg class="ic i88"><use href="#i-empty"/></svg></div><div class="fw7 ink2">هنوز فایلی وارد نشده است.</div></div>
  </div>
</template>
