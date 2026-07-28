<script>
/* صفحه جزئیات فعالیت — پورت SFC؛ داده از جزیره «aview-data» */
import { readJson, faNum as fa, statusClass } from '@/lib/kit.js';

export default {
  name: 'AViewApp',
  data() { return { p: readJson('aview-data') || {} }; },
  methods: { fa, stClass: statusClass },
};
</script>
<template>
  <div>
    <div class="card">
      <div class="fl mb-4">
        <div class="dtile"><svg class="ic i23"><use :href="'#'+p.icon"/></svg></div>
        <div class="nih">
          <div class="fs16 fw8 ink1">{{ p.title }}</div>
          <div class="mute"><svg class="ic dic"><use :href="'#'+p.icon"/></svg>{{ p.domain }}</div>
        </div>
      </div>
      <div class="tbl-wrap"><table>
        <thead><tr><th class="w220">فیلد</th><th>مقدار</th></tr></thead>
        <tbody>
        <tr><td>وضعیت</td><td><span class="badge" :class="stClass(p.status)">{{ p.status }}</span></td></tr>
        <tr><td>مالک / مسئول</td><td>{{ p.expert }}</td></tr>
        <tr v-if="p.creator"><td>ثبت‌کننده</td><td>{{ p.creator }}</td></tr>
        <template v-for="s in (p.vals_sections||[])" :key="s.name || 'main'">
          <tr v-if="s.name"><td colspan="2" class="secrow"><svg class="ic i14 va-m ml-1"><use :href="'#'+s.icon"/></svg>{{ s.name }}</td></tr>
          <tr v-for="r in s.rows" :key="s.name + r.label">
            <td>{{ r.label }}</td>
            <td class="prew"><template v-if="r.val">{{ r.val }}</template><span v-else class="mute">—</span></td>
          </tr>
        </template>
        </tbody>
      </table></div>
    </div>

    <div class="card">
      <h3><svg class="ic"><use href="#i-msg"/></svg> پاسخ‌ها ({{ fa((p.responses||[]).length) }})</h3>
      <div class="tbl-wrap" v-if="(p.responses||[]).length"><table>
        <thead><tr><th class="w170">کاربر</th><th class="w160">زمان</th><th>متن پاسخ</th></tr></thead>
        <tbody>
        <tr v-for="(r,i) in (p.responses||[])" :key="i">
          <td><b class="ink1">{{ r.user }}</b> <span class="role-chip rc-s" :class="{expert: r.role==='expert'}">{{ r.role==='admin' ? 'مدیر' : 'کارشناس' }}</span></td>
          <td class="mute">{{ r.when }}</td>
          <td class="prew">{{ r.body }}</td>
        </tr>
        </tbody>
      </table></div>
      <div v-else class="mute mb-3">هنوز پاسخی ثبت نشده است.</div>
      <form method="post" :action="p.respond_action" class="no-print mt-3">
        <label>پاسخ جدید {{ p.respond_hint ? '(جواب تسک)' : '' }}</label>
        <div class="fla">
          <textarea name="body" rows="2" placeholder="پاسخ خود را بنویسید..." required class="grow"></textarea>
          <button class="btn pri" type="submit"><svg class="ic flip"><use href="#i-send"/></svg> ارسال</button>
        </div>
      </form>
    </div>

    <div class="card no-print">
      <h3><svg class="ic"><use href="#i-clip"/></svg> فایل‌های ضمیمه ({{ fa((p.atts||[]).length) }})</h3>
      <div class="tbl-wrap" v-if="(p.atts||[]).length"><table>
        <thead><tr><th>فایل</th><th>حجم</th><th>زمان بارگذاری</th><th>عملیات</th></tr></thead>
        <tbody>
        <tr v-for="(t,i) in (p.atts||[])" :key="i">
          <td><span class="nih"><svg class="ic dic"><use href="#i-file"/></svg>{{ t.name }}</span></td>
          <td class="mute onum">{{ fa(t.kb) }} KB</td>
          <td class="mute">{{ t.when }}</td>
          <td><div class="btn-row">
            <a class="btn ghost icon" :href="t.download" title="دانلود"><svg class="ic"><use href="#i-download"/></svg></a>
            <form v-if="t.can_del" method="post" :action="t.delete" onsubmit="return confirm('حذف فایل؟')"><button class="btn danger icon" title="حذف"><svg class="ic"><use href="#i-trash"/></svg></button></form>
          </div></td>
        </tr>
        </tbody>
      </table></div>
      <div v-else class="mute mb-3">فایلی پیوست نشده است.</div>
      <form method="post" :action="p.upload_action" enctype="multipart/form-data" class="mt-3 fla wrap">
        <div class="fiw"><label>افزودن فایل (PDF, Word, Excel, JPG, PNG, ZIP)</label><input type="file" name="files" multiple></div>
        <button class="btn ok" type="submit"><svg class="ic"><use href="#i-upload"/></svg> بارگذاری</button>
      </form>
    </div>

    <div class="btn-row mt-4 no-print">
      <a class="btn ghost" :href="p.back_url"><svg class="ic"><use href="#i-back"/></svg> بازگشت به فهرست فعالیت‌ها</a>
    </div>
  </div>
</template>
