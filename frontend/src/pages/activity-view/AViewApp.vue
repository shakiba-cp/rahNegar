<script>
/* صفحه جزئیات فعالیت — پورت SFC؛ داده از جزیره «aview-data» */
import { readJson, faNum as fa, statusClass } from '@/lib/kit.js';

export default {
  name: 'AViewApp',
  data() { return { p: readJson('aview-data') || {} }; },
  computed: {
    mainRows() { const s = (this.p.vals_sections || []).find(x => !x.name); return s ? s.rows : []; },
    secSections() { return (this.p.vals_sections || []).filter(x => x.name); },
    hasMain() { return this.mainRows.some(r => r.val); },
  },
  methods: { fa, stClass: statusClass },
};
</script>
<template>
  <div>
    <div class="card">
      <div v-if="p.flagged" class="vflag"><svg class="ic"><use href="#i-alert"/></svg><div><b>این فعالیت «نیازمند اصلاح» علامت خورده است.</b><div class="mute">هنگام ورود از Excel بخشی از داده‌هایش خالی یا نامعتبر بود — آن را ویرایش و تکمیل کنید تا برچسب برداشته شود.</div></div></div>
      <div class="fl mb-2">
        <div class="dtile"><svg class="ic i23"><use :href="'#'+p.icon"/></svg></div>
        <div class="nih">
          <div class="fs16 fw8 ink1">{{ p.title }}</div>
          <div class="mute"><svg class="ic dic"><use :href="'#'+p.icon"/></svg>{{ p.domain }}</div>
        </div>
      </div>
      <div class="vchips">
        <span class="badge" :class="stClass(p.status)">{{ p.status }}</span>
        <span class="vchip"><svg class="ic i14"><use href="#i-user"/></svg>{{ p.expert }}</span>
        <span class="vchip" v-if="p.creator"><svg class="ic i14"><use href="#i-pencil"/></svg>ثبت‌کننده: {{ p.creator }}</span>
        <span class="vchip" v-if="p.date_fa"><svg class="ic i14"><use href="#i-cal"/></svg>{{ p.date_fa }}</span>
        <span class="vchip" v-if="p.ticket"><svg class="ic i14"><use href="#i-ticket"/></svg>{{ p.ticket }}</span>
      </div>

      <!-- فیلدهای اصلی: کارت‌های برجسته -->
      <template v-if="mainRows.length">
        <div class="sec-kicker"><svg class="ic i14"><use href="#i-doc"/></svg> اطلاعات اصلی</div>
        <div class="dlgrid" :class="{emptyish: !hasMain}">
          <div class="vf" v-for="r in mainRows" :key="'m'+r.label" :class="{big: r.ftype==='textarea'}">
            <div class="vl">{{ r.label }}</div>
            <div class="vv prew" v-if="r.val">
              <a v-if="r.dl" :href="r.dl" class="vfile"><svg class="ic i14"><use href="#i-download"/></svg>{{ r.val }}</a>
              <template v-else>{{ r.val }}</template>
            </div>
            <div class="vv mute" v-else>—</div>
          </div>
        </div>
      </template>

      <!-- بخش‌های نام‌دار (درخواست‌دهنده/تحویل و...) -->
      <template v-for="s in secSections" :key="s.name">
        <div class="sec-kicker"><svg class="ic i14"><use :href="'#'+s.icon"/></svg> {{ s.name }}</div>
        <div class="dlgrid">
          <div class="vf" v-for="r in s.rows" :key="s.name+r.label" :class="{big: r.ftype==='textarea'}">
            <div class="vl">{{ r.label }}</div>
            <div class="vv prew" v-if="r.val">
              <a v-if="r.dl" :href="r.dl" class="vfile"><svg class="ic i14"><use href="#i-download"/></svg>{{ r.val }}</a>
              <template v-else>{{ r.val }}</template>
            </div>
            <div class="vv mute" v-else>—</div>
          </div>
        </div>
      </template>
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
