<script>
/* صفحه جزئیات فعالیت — پورت SFC؛ داده از جزیره «aview-data»
   چیدمان مرتب سازمانی: ردیف‌های برچسب/مقدار + بلوک متن بلند + چیپ فایل */
import { readJson, faNum as fa, statusClass } from '@/lib/kit.js';

export default {
  name: 'AViewApp',
  data() {
    return { p: readJson('aview-data') || {}, picked: [], uperr: '', dragOn: false };
  },
  computed: {
    sections() {
      const out = [];
      for (const s of (this.p.vals_sections || [])) {
        const small = s.rows.filter(r => r.ftype !== 'textarea');
        const big = s.rows.filter(r => r.ftype === 'textarea');
        out.push({ name: s.name, icon: s.icon, small, big });
      }
      return out;
    },
    atts() { return this.p.atts || []; },
    responses() { return this.p.responses || []; },
    hasVal() {
      return this.sections.some(s => s.small.some(r => r.val) || s.big.some(r => r.val));
    },
  },
  methods: {
    fa, stClass: statusClass,
    fmtKb(kb) {
      kb = +kb || 0;
      if (kb >= 1024 * 10) return fa((kb / 1024).toFixed(1)) + ' مگابایت';
      if (kb >= 1024) return fa(Math.round(kb / 1024)) + ' مگابایت';
      return fa(Math.max(1, Math.round(kb))) + ' کیلوبایت';
    },
    onPick(e) {
      this.uperr = '';
      const lim = (this.p.max_mb || 10) * 1024 * 1024;
      const ok = [], bad = [];
      for (const f of (e.target.files || [])) (f.size > lim ? bad : ok).push(f);
      if (bad.length) this.uperr = `حجم «${bad.map(x => x.name).join('، ')}» بیش از سقف مجاز (${fa(this.p.max_mb || 10)} مگابایت) است و آپلود نمی‌شود.`;
      const dt = new DataTransfer();
      ok.forEach(f => dt.items.add(f));
      const inp = this.$refs.fi;
      if (inp) inp.files = dt.files;
      this.picked = ok;
      this.dragOn = false;
    },
    onDrop(e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        this.$refs.fi.files = e.dataTransfer.files;
        this.onPick({ target: this.$refs.fi });
      }
      this.dragOn = false;
    },
    clearPicked() {
      if (this.$refs.fi) this.$refs.fi.value = '';
      this.picked = []; this.uperr = '';
    },
    onUpSubmit(e) {
      if (!this.picked.length) { e.preventDefault(); this.uperr = 'ابتدا فایل را انتخاب کنید.'; }
    },
  },
};
</script>
<template>
  <div>
    <div class="card">
      <div v-if="p.flagged" class="vflag"><svg class="ic"><use href="#i-alert"/></svg><div><b>این فعالیت «نیازمند اصلاح» علامت خورده است.</b><div class="mute">هنگام ورود از Excel بخشی از داده‌هایش خالی یا نامعتبر بود — آن را ویرایش و تکمیل کنید تا برچسب برداشته شود.</div></div></div>
      <div class="vhead">
        <div class="dtile"><svg class="ic i23"><use :href="'#'+p.icon"/></svg></div>
        <div class="vhead-t">
          <div class="fs16 fw8 ink1 vt">{{ p.title }}</div>
          <div class="mute vd"><svg class="ic dic"><use :href="'#'+p.icon"/></svg>{{ p.domain }}</div>
        </div>
        <span class="badge" :class="stClass(p.status)">{{ p.status }}</span>
      </div>
      <div class="vchips">
        <span class="vchip"><svg class="ic i14"><use href="#i-user"/></svg>{{ p.expert }}</span>
        <span class="vchip" v-if="p.creator"><svg class="ic i14"><use href="#i-pencil"/></svg>ثبت‌کننده: {{ p.creator }}</span>
        <span class="vchip" v-if="p.date_fa"><svg class="ic i14"><use href="#i-cal"/></svg>{{ p.date_fa }}</span>
        <span class="vchip" v-if="p.ticket"><svg class="ic i14"><use href="#i-ticket"/></svg>{{ p.ticket }}</span>
      </div>

      <template v-if="!hasVal"><div class="vempty mute">برای این فعالیت هنوز داده‌ای در فیلدهای فرم ثبت نشده است.</div></template>
      <div v-for="(s, si) in sections" :key="si" class="vsec">
        <div class="sec-kicker" v-if="s.name"><svg class="ic i14"><use :href="'#'+s.icon"/></svg> {{ s.name }}</div>
        <div class="sec-kicker" v-else><svg class="ic i14"><use href="#i-doc"/></svg> اطلاعات اصلی</div>
        <div class="vgrid" v-if="s.small.length">
          <div class="vrow" v-for="r in s.small" :key="s.name+r.label">
            <span class="vk">{{ r.label }}</span>
            <span class="vr" :class="{empty: !r.val}">
              <a v-if="r.dl" :href="r.dl" class="vfilechip"><svg class="ic i14"><use href="#i-download"/></svg>{{ r.val }}</a>
              <template v-else-if="r.val">{{ r.val }}</template>
              <template v-else>—</template>
            </span>
          </div>
        </div>
        <div class="vbig" v-for="r in s.big" :key="'b'+s.name+r.label">
          <div class="vk vk-big">{{ r.label }}</div>
          <div class="vbox prew" :class="{empty: !r.val}">{{ r.val || '—' }}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3><svg class="ic"><use href="#i-msg"/></svg> پاسخ‌ها ({{ fa(responses.length) }})</h3>
      <ul class="rlist" v-if="responses.length">
        <li v-for="(r,i) in responses" :key="i">
          <div class="rhead">
            <b class="ink1">{{ r.user }}</b>
            <span class="role-chip rc-s" :class="{expert: r.role==='expert'}">{{ r.role==='admin' ? 'مدیر' : 'کارشناس' }}</span>
            <span class="mute rwhen">{{ r.when }}</span>
          </div>
          <div class="rbody prew">{{ r.body }}</div>
        </li>
      </ul>
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
      <h3><svg class="ic"><use href="#i-clip"/></svg> فایل‌های ضمیمه ({{ fa(atts.length) }})</h3>
      <div class="tbl-wrap" v-if="atts.length"><table>
        <thead><tr><th>فایل</th><th class="w130">حجم</th><th class="w170">زمان بارگذاری</th><th class="w110">عملیات</th></tr></thead>
        <tbody>
        <tr v-for="(t,i) in atts" :key="i">
          <td><span class="nih"><svg class="ic dic"><use href="#i-file"/></svg><span class="attname">{{ t.name }}</span></span></td>
          <td class="mute onum">{{ fmtKb(t.kb) }}</td>
          <td class="mute">{{ t.when }}</td>
          <td><div class="btn-row">
            <a class="btn ghost icon" :href="t.download" title="دانلود"><svg class="ic"><use href="#i-download"/></svg></a>
            <form v-if="t.can_del" method="post" :action="t.delete" onsubmit="return confirm('حذف فایل؟')"><button class="btn danger icon" title="حذف"><svg class="ic"><use href="#i-trash"/></svg></button></form>
          </div></td>
        </tr>
        </tbody>
      </table></div>
      <div v-else class="mute mb-3">فایلی پیوست نشده است.</div>

      <form method="post" :action="p.upload_action" enctype="multipart/form-data" class="mt-3" @submit="onUpSubmit">
        <label>افزودن فایل</label>
        <div class="upzone" :class="{on: dragOn}"
             @dragover.prevent="dragOn = true" @dragleave.prevent="dragOn = false" @drop.prevent="onDrop"
             @click="$refs.fi.click()" role="button" tabindex="0">
          <input type="file" name="files" id="av-up" multiple class="hide" ref="fi"
                 :accept="p.accept || ''" @change="onPick" @click.stop>
          <svg class="ic i23"><use href="#i-upload"/></svg>
          <div class="upt">فایل را این‌جا رها کنید یا <b>انتخاب کنید</b></div>
          <div class="uph">فرمت‌های مجاز: PDF, Word, Excel, JPG, PNG, ZIP — حداکثر هر فایل {{ fa(p.max_mb || 10) }} مگابایت</div>
        </div>
        <ul class="uplist" v-if="picked.length">
          <li v-for="(f,i) in picked" :key="i">
            <svg class="ic i14"><use href="#i-file"/></svg><span class="n">{{ f.name }}</span>
            <span class="mute">{{ fmtKb(f.size/1024) }}</span>
          </li>
          <li class="clr"><button type="button" class="btn ghost sm" @click="clearPicked"><svg class="ic i14"><use href="#i-x"/></svg> پاک کردن همه</button></li>
        </ul>
        <div class="uperr" v-if="uperr"><svg class="ic i14"><use href="#i-alert-tri"/></svg>{{ uperr }}</div>
        <div class="btn-row mt-2">
          <button class="btn ok" type="submit" :disabled="!picked.length"><svg class="ic"><use href="#i-upload"/></svg> بارگذاری{{ picked.length ? ' (' + fa(picked.length) + ' فایل)' : '' }}</button>
        </div>
      </form>
    </div>

    <div class="btn-row mt-4 no-print">
      <a class="btn ghost" :href="p.back_url"><svg class="ic"><use href="#i-back"/></svg> بازگشت به فهرست فعالیت‌ها</a>
    </div>
  </div>
</template>
