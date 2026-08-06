<script>
/* فرم کاربر (جدید/ویرایش) — روی <form id="uform-app"> سوار می‌شود و
   کل محتوای فرم را از جزیره «uform-data» بازتولید می‌کند.
   رفتار کلیدی: تیک «کارآموز» → ردیف سرپرست کم‌رنگ/پاک می‌شود. */
import { readJson } from '@/lib/kit.js';

export default {
  name: 'UserForm',
  data() {
    const p = readJson('uform-data') || {};
    return {
      p,
      tr: !!p.is_trainee,
      sup: p.supervisor_id != null && p.supervisor_id !== '' ? String(p.supervisor_id) : '',
      uname: p.username || '',
      fname: p.full_name || '',
      al: p.aliases || '',
      role: p.role || 'expert',
      org: p.org_id != null && p.org_id !== '' ? String(p.org_id) : '',
      pwd: '',
      pm: {
        can_add: !!((p.perms || {}).can_add),
        can_edit: !!((p.perms || {}).can_edit),
        can_delete: !!((p.perms || {}).can_delete),
        can_import: !!((p.perms || {}).can_import)
      }
    };
  },
  watch: {
    tr(v) { if (!v) this.sup = ''; }
  },
  computed: {
    sups() { return this.p.sups || []; },
    perms() { return this.p.perms || {}; }
  },
};
</script>
<template>
  <div>
    <div class="mb-3">
      <label class="req">نام کاربری</label>
      <input type="text" name="username" dir="ltr" v-model="uname" :readonly="!!p.is_edit" required>
      <div v-if="p.is_edit" class="mute mt-1">نام کاربری قابل تغییر نیست.</div>
    </div>
    <div class="mb-3">
      <label class="req">نام کامل</label>
      <input type="text" name="full_name" v-model="fname" required>
    </div>
    <div class="mb-3">
      <label>نام‌های مستعار کارشناس <span class="mute">(اختیاری)</span></label>
      <textarea name="aliases" v-model="al" rows="2" placeholder="مثلاً: رضایی"></textarea>
      <div class="mute mt-1">اگر نام این کارشناس در فایل‌های اکسل به شکل دیگری نوشته می‌شود (مثل فقط فامیلی) این‌جا بنویسید تا در نمودارها و گزارش‌ها یکی شمرده شود؛ با ویرگول یا در هر خط جدا کنید.</div>
    </div>
    <div class="mb-3">
      <label>نقش</label>
      <select name="role" v-model="role">
        <option value="expert">کارشناس — فقط فعالیت‌های خودش</option>
        <option value="admin">مدیر — دسترسی کامل</option>
      </select>
      <div v-if="p.self_edit" class="mute mt-1">کاربر مدیر فعلی نمی‌تواند نقش خود را کاهش دهد.</div>
    </div>
    <div class="mb-3">
      <label>بخش <span class="mute fs11">(دسترسی کاربر به حوزه‌ها)</span></label>
      <select name="org_id" v-model="org">
        <option value="">همه بخش‌ها — همهٔ حوزه‌ها دیده می‌شود</option>
        <option v-for="o in (p.orgs || [])" :key="o.id" :value="String(o.id)">{{ o.name }} — فقط حوزه‌های این بخش</option>
      </select>
      <div class="mute mt-1">اگر بخش انتخاب شود، این کاربر (در صورت کارشناس بودن) فقط حوزه‌های همان بخش را در فهرست‌ها، ثبت فعالیت، ورود Excel و گزارش‌ها می‌بیند.</div>
    </div>
    <input type="hidden" name="perm_form" value="1">
    <div class="mb-3">
      <label>دسترسی‌ها <span class="mute fs11">(فقط برای نقش کارشناس اعمال می‌شود؛ مدیر همیشه دسترسی کامل دارد)</span></label>
      <div class="perm-grid">
        <label class="ck"><input type="checkbox" name="can_add" v-model="pm.can_add" :disabled="p.self_edit"> ثبت فعالیت جدید</label>
        <label class="ck"><input type="checkbox" name="can_edit" v-model="pm.can_edit" :disabled="p.self_edit"> ویرایش فعالیت‌ها</label>
        <label class="ck"><input type="checkbox" name="can_delete" v-model="pm.can_delete" :disabled="p.self_edit"> حذف فعالیت‌ها</label>
        <label class="ck"><input type="checkbox" name="can_import" v-model="pm.can_import" :disabled="p.self_edit"> ورود از Excel</label>
      </div>
      <div v-if="p.self_edit" class="mute mt-1">دسترسی‌های حساب خودتان قابل تغییر نیست.</div>
    </div>
    <div class="mb-3 trn-box">
      <label>نوع حساب</label>
      <label class="ck"><input type="checkbox" name="is_trainee" id="tr-cb" v-model="tr" :disabled="p.self_edit"> این حساب «کارآموز» است</label>
      <div class="sup-row" id="sup-row" :class="{dim: !tr}">
        <label class="fs12 mute">سرپرست کارآموز (کدام نیرو مسئول این کارآموز است؟)</label>
        <select name="supervisor_id" id="sup-sel" v-model="sup" :disabled="p.self_edit">
          <option value="">— بدون سرپرست —</option>
          <option v-for="s in sups" :key="s.id" :value="String(s.id)">{{ s.full_name }} ({{ s.username }})</option>
        </select>
      </div>
      <div class="mute mt-1">تعداد کارآموزان هر نیرو در صفحه «کاربران» و «پیشخوان مدیریت» نمایش داده می‌شود.</div>
    </div>
    <div class="mb-5">
      <label :class="{req: !p.is_edit}">رمز عبور {{ p.is_edit ? '(برای تغییر وارد کنید)' : '' }}</label>
      <input type="password" name="password" dir="ltr" v-model="pwd" :required="!p.is_edit" autocomplete="new-password">
    </div>
    <div class="btn-row">
      <button class="btn pri" type="submit"><svg class="ic"><use href="#i-check"/></svg> ذخیره</button>
      <a class="btn ghost" :href="p.back_url || '/users'">انصراف</a>
    </div>
  </div>
</template>
