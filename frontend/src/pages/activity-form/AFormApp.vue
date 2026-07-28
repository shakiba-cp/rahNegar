<script>
/* ثبت/ویرایش فعالیت — پورت دقیق همان app نسخهٔ global
   سه حالت: choose (ویزارد انتخاب حوزه)، new (فرم پویا)، edit (پرشده) */
import { fa } from '@/lib/kit.js';
import FieldCell from './FieldCell.vue';

export default {
  name: 'AFormApp',
  components: { FieldCell },
  props: { p: Object },
  data() { return { q: '' }; },
  computed: {
    isChoose() { return this.p.mode === 'choose'; },
    isNew() { return this.p.mode === 'new'; },
    filteredDomains() {
      const q = this.q.trim();
      const ds = this.p.domains || [];
      return q ? ds.filter(d => d.name.includes(q)) : ds;
    },
    sections() {
      const groups = new Map();
      for (const f of (this.p.fields || [])) {
        const s = f.section || '';
        if (!groups.has(s)) groups.set(s, []);
        groups.get(s).push(f);
      }
      return Array.from(groups, ([name, fields]) => ({ name, fields }));
    },
    statusSel() {
      const pv = this.p.posted || {};
      if (pv['status']) return pv['status'];
      if (this.isNew) {
        const ss = this.p.statuses || [];
        return ss.includes('در حال انجام') ? 'در حال انجام' : ss[0];
      }
      return this.p.current_status;
    },
    ownSel() {
      const pv = this.p.posted || {};
      if (pv['owner_id']) return String(pv['owner_id']);
      return String(this.isNew ? this.p.self_id : this.p.current_owner);
    }
  },
  methods: {
    fa,
    isCommon(sec) { const s = sec.name; return s && (s.includes('درخواست‌دهنده') || s.includes('تحویل')); },
    isDelivery(sec) { return sec.name.includes('تحویل'); },
    secIcon(sec) { return sec.name.includes('درخواست‌دهنده') ? 'i-user' : 'i-send'; },
    secHasValue(sec) {
      const pv = this.p.posted || {};
      const vals = this.isNew ? {} : (this.p.vals || {});
      return sec.fields.some(f => {
        const k = 'f' + f.id;
        if (f.type === 'date') {
          if (pv[k + '__y'] || pv[k + '__m']) return true;
        } else if (pv[k] != null && pv[k] !== '') return true;
        const vv = vals[String(f.id)];
        return vv != null && vv !== '';
      });
    }
  },
};
</script>

<template>
  <div>
    <!-- ==================== حالت انتخاب حوزه ==================== -->
    <template v-if="isChoose">
      <div class="vbar" v-if="(p.domains||[]).length > 6">
        <div class="srch vgrow"><svg class="ic"><use href="#i-search"/></svg>
          <input v-model="q" type="text" placeholder="جستجوی لحظه‌ای حوزه...">
        </div>
      </div>
      <div class="domain-grid" v-if="filteredDomains.length">
        <a v-for="(d,i) in filteredDomains" :key="d.id" class="domain-card"
           :href="p.new_url+'?domain_id='+d.id"
           :style="{animation:'fadeUp .4s var(--ease) both', animationDelay:(i*30)+'ms'}">
          <div class="tile" :class="'t'+((i%8)+1)"><svg class="ic"><use :href="'#'+d.icon"/></svg></div>
          <div class="n">{{ d.name }}</div>
        </a>
      </div>
      <div v-else class="empty"><div class="eic"><svg class="ic i88"><use href="#i-empty"/></svg></div>
        <div class="fw7 ink2">حوزه‌ای با این نام یافت نشد.</div></div>
      <div v-if="p.admin" class="mute mt-5">حوزه جدید می‌خواهید؟ <a :href="p.domains_url">مدیریت حوزه‌ها</a></div>
    </template>

    <!-- ==================== حالت ثبت جدید ==================== -->
    <template v-else-if="isNew">
      <div class="fdom">
        <div class="fdom-ic tile t1"><svg class="ic i22"><use :href="'#'+p.domain.icon"/></svg></div>
        <div class="fdom-t">
          <b>۲. تکمیل اطلاعات حوزه «{{ p.domain.name }}»</b>
          <span>فیلدهای ستاره‌دار الزامی‌اند — بخش‌های اختیاری با کلیک باز می‌شوند.</span>
        </div>
        <a class="btn ghost sm" :href="p.change_url"><svg class="ic i14"><use href="#i-layers"/></svg> تغییر حوزه</a>
      </div>
      <form method="post">
        <div class="card fcard">
          <div class="form-grid">
            <div class="status-top">
              <label>وضعیت فعالیت</label>
              <select name="status">
                <option v-for="s in p.statuses" :key="s" :value="s" :selected="s===statusSel">{{ s }}</option>
              </select>
            </div>
            <template v-for="sec in sections" :key="sec.name || 'main'">
              <details v-if="isCommon(sec)" class="csec" :class="isDelivery(sec) ? 'delivery' : 'request'" :open="secHasValue(sec)">
                <summary class="csec-h">
                  <span class="csec-ic"><svg class="ic"><use :href="'#'+secIcon(sec)"/></svg></span>
                  <span class="csec-t">
                    <b>{{ sec.name }} <em class="csec-opt">اختیاری</em></b>
                    <span>در صورت نیاز، روی این بخش کلیک کنید تا باز شود و اطلاعات را تکمیل کنید</span>
                  </span>
                  <span class="csec-count">{{ fa(sec.fields.length) }} فیلد</span>
                  <svg class="ic csec-arrow"><use href="#i-down"/></svg>
                </summary>
                <div class="csec-b"><div class="form-grid">
                  <FieldCell v-for="f in sec.fields" :key="f.id" :f="f" :p="p"></FieldCell>
                  <div v-if="isDelivery(sec)" class="sec-note"><svg class="ic"><use href="#i-alert"/></svg> فایل‌های مستندات تحویل/درخواست را می‌توانید بعد از ثبت فعالیت، در بخش «فایل‌های ضمیمه» آپلود کنید.</div>
                </div></div>
              </details>
              <template v-else>
                <div v-if="sec.name" class="sec-title" :class="sec.name.includes('درخواست‌دهنده') ? 'request' : 'delivery'">
                  <svg class="ic"><use :href="'#'+secIcon(sec)"/></svg> {{ sec.name }}
                </div>
                <FieldCell v-for="f in sec.fields" :key="f.id" :f="f" :p="p"></FieldCell>
              </template>
            </template>
          </div>
        </div>
        <div class="acard" v-if="p.admin">
          <div class="acard-h">
            <span class="acard-ic"><svg class="ic"><use href="#i-ticket"/></svg></span>
            <div class="acard-t">
              <b>تخصیص تسک به کارشناس <em class="csec-opt">اختیاری</em></b>
              <span>مالک این فعالیت را مشخص می‌کنید — اگر کارشناس دیگری را انتخاب کنید، فعالیت به‌عنوان «تسک» برای او ثبت می‌شود و در منوی فعالیت‌هایش بج قرمز می‌گیرد.</span>
            </div>
          </div>
          <div class="acard-b">
            <label>کارشناس مسئول فعالیت</label>
            <select name="owner_id">
              <option v-for="u in p.users" :key="u.id" :value="u.id" :selected="String(u.id)===ownSel">{{ u.full_name }}{{ String(u.id)===String(p.self_id) ? ' (خودم)' : '' }}</option>
            </select>
            <div class="acard-note"><svg class="ic"><use href="#i-alert"/></svg><span>کارشناس می‌تواند تسک را «انجام» کند یا پاسخ بنویسد؛ انجام‌شدن آن هم برای او و هم برای شما ثبت و قابل پیگیری است.</span></div>
          </div>
        </div>
        <div class="btn-row mt-5">
          <button class="btn pri" type="submit"><svg class="ic"><use href="#i-check"/></svg> {{ p.submit_label }}</button>
          <a class="btn ghost" :href="p.back_url">{{ p.cancel_label }}</a>
        </div>
      </form>
    </template>

    <!-- ==================== حالت ویرایش ==================== -->
    <template v-else>
      <div class="card">
        <form method="post">
          <div class="form-grid">
            <template v-for="sec in sections" :key="sec.name || 'main'">
              <details v-if="isCommon(sec)" class="csec" :class="isDelivery(sec) ? 'delivery' : 'request'" :open="secHasValue(sec)">
                <summary class="csec-h">
                  <span class="csec-ic"><svg class="ic"><use :href="'#'+secIcon(sec)"/></svg></span>
                  <span class="csec-t">
                    <b>{{ sec.name }} <em class="csec-opt">اختیاری</em></b>
                    <span>برای ویرایش، روی این بخش کلیک کنید تا باز شود</span>
                  </span>
                  <span class="csec-count">{{ fa(sec.fields.length) }} فیلد</span>
                  <svg class="ic csec-arrow"><use href="#i-down"/></svg>
                </summary>
                <div class="csec-b"><div class="form-grid">
                  <FieldCell v-for="f in sec.fields" :key="f.id" :f="f" :p="p"></FieldCell>
                </div></div>
              </details>
              <template v-else>
                <div v-if="sec.name" class="sec-title" :class="sec.name.includes('درخواست‌دهنده') ? 'request' : 'delivery'">
                  <svg class="ic"><use :href="'#'+secIcon(sec)"/></svg> {{ sec.name }}
                </div>
                <FieldCell v-for="f in sec.fields" :key="f.id" :f="f" :p="p"></FieldCell>
              </template>
            </template>
            <div>
              <label>وضعیت</label>
              <select name="status">
                <option v-for="s in p.statuses" :key="s" :value="s" :selected="s===statusSel">{{ s }}</option>
              </select>
            </div>
            <div v-if="p.admin">
              <label>مالک فعالیت</label>
              <select name="owner_id">
                <option v-for="u in p.users" :key="u.id" :value="u.id" :selected="String(u.id)===ownSel">{{ u.full_name }}</option>
              </select>
            </div>
          </div>
          <div class="btn-row mt-5">
            <button class="btn pri" type="submit"><svg class="ic"><use href="#i-check"/></svg> {{ p.submit_label }}</button>
            <a class="btn ghost" :href="p.back_url"><svg class="ic"><use href="#i-back"/></svg> {{ p.cancel_label }}</a>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>
