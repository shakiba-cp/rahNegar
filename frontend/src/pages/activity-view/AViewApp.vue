<script>
/* صفحه جزئیات فعالیت — بازطراحی بر اساس بریف طراحی سازمانی:
   کارت‌های بخش‌بندی‌شده (اطلاعات فعالیت/درخواست/تحویل)، فیلد خواندنی متنی
   (بدون ظاهر Input)، بج رنگی برای شدت/وضعیت، آیکون برای خوانایی سریع،
   فونت مقدار برجسته‌تر از برچسب و فضای عمودی فشرده‌تر. */
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
    /* عنوان بخش: نام‌های بلند فنی → تیترهای خلاصهٔ سازمانی */
    secTitle(s) {
      const n = s.name || '';
      if (!n) return 'اطلاعات فعالیت';
      if (n.includes('درخواست')) return 'اطلاعات درخواست';
      if (n.includes('تحویل')) return 'اطلاعات تحویل';
      return n;
    },
    /* آیکون دیداری برای برچسب‌های شناخته‌شده — افزایش سرعت خواندن */
    fIcon(label) {
      const l = label || '';
      if (/تاریخ|زمان/.test(l)) return 'i-cal';
      if (/کارشناس|درخواست‌دهنده|تحویل‌گیرنده|تحویل‌دهنده|ارائه کننده|مدرس/.test(l)) return 'i-user';
      if (/شدت|اولویت/.test(l)) return 'i-alert-tri';
      if (/تیکت|شناسه/.test(l)) return 'i-ticket';
      if (/آسیب|بدافزار|CVE/i.test(l)) return 'i-bug';
      if (/آدرس|URL|لینک/i.test(l)) return 'i-globe';
      if (/وضعیت/.test(l)) return 'i-checkc';
      if (/محصول|برنامه|ابزار|دستگاه/.test(l)) return 'i-cap';
      return '';
    },
    /* بج رنگی برای مقادیر کلیدی (شدت/اولویت/وضعیت‌ها) */
    badgeCls(label, val) {
      if (!val) return '';
      const l = label || '', v = String(val).trim();
      if (/شدت|اولویت/.test(l)) {
        if (v === 'کم') return 'fb-green';
        if (v === 'متوسط') return 'fb-amber';
        if (v === 'زیاد' || v === 'بالا' || v === 'بسیار زیاد') return 'fb-red';
        if (v === 'بحرانی' || v === 'فوری') return 'fb-crit';
        return '';
      }
      if (/وضعیت/.test(l)) {
        const m = {
          'انجام شده': 'fb-green', 'تایید': 'fb-green', 'رفع‌شده': 'fb-green',
          'انجام کامل شد': 'fb-green', 'بسته': 'fb-green',
          'در حال انجام': 'fb-amber', 'در حال بررسی': 'fb-amber', 'در حال رفع': 'fb-amber',
          'بررسی شده': 'fb-blue', 'اطلاع‌رسانی شده': 'fb-blue', 'ریسک پذیرفته‌شده': 'fb-blue',
          'باز': 'fb-red', 'عدم تایید': 'fb-red', 'بررسی نشده': 'fb-red',
        };
        return m[v] || '';
      }
      return '';
    },
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
          <div class="mute vd"><svg class="ic dic"><use :href="'#'+p.icon"/></svg>{{ p.domain }}</div>
        </div>
        <span class="badge vbadge-lg" :class="stClass(p.status)">{{ p.status }}</span>
      </div>
      <div class="vchips">
        <span class="vchip"><svg class="ic i14"><use href="#i-user"/></svg>{{ p.expert }}</span>
        <span class="vchip" v-if="p.creator && p.admin"><svg class="ic i14"><use href="#i-pencil"/></svg>ثبت‌کننده: {{ p.creator }}</span>
        <span class="vchip" v-if="p.date_fa"><svg class="ic i14"><use href="#i-cal"/></svg>{{ p.date_fa }}</span>
        <span class="vchip" v-if="p.ticket"><svg class="ic i14"><use href="#i-ticket"/></svg>{{ p.ticket }}</span>
      </div>

      <template v-if="!hasVal"><div class="vempty mute">برای این فعالیت هنوز داده‌ای در فیلدهای فرم ثبت نشده است.</div></template>
      <div v-for="(s, si) in sections" :key="si" class="scard">
        <div class="scard-head"><svg class="ic i14"><use :href="'#'+(s.icon || 'i-doc')"/></svg> {{ secTitle(s) }}</div>
        <div class="fgrid" v-if="s.small.length">
          <div class="fcell" v-for="r in s.small" :key="s.name+r.label">
            <div class="fl"><svg class="ic i14" v-if="fIcon(r.label)"><use :href="'#'+fIcon(r.label)"/></svg>{{ r.label }}</div>
            <div class="fv" :class="{empty: !r.val}">
              <span v-if="r.val && badgeCls(r.label, r.val)" class="fbadge" :class="badgeCls(r.label, r.val)">{{ r.val }}</span>
              <a v-else-if="r.dl" :href="r.dl" class="vfilechip"><svg class="ic i14"><use href="#i-download"/></svg>{{ r.val }}</a>
              <template v-else-if="r.val">{{ r.val }}</template>
              <template v-else>—</template>
            </div>
          </div>
        </div>
        <div class="vbig" v-for="r in s.big" :key="'b'+s.name+r.label">
          <div class="fl flb">{{ r.label }}</div>
          <div class="vdesc prew" :class="{empty: !r.val}">{{ r.val || '—' }}</div>
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
