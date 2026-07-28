<script>
/* اپ منوی هدر — کلاینت-رندر روی <header class="gnav">
   دادهٔ ساختار منو از جزیره JSON «gnav-data» (ساختهٔ Jinja) می‌آید.
   مارک‌آپ SSR در base.html صرفاً fallback بدون‌JS است؛ پس از mount
   همین کامپوننت همان ساختار را با رفتار کامل Vue بازتولید می‌کند. */
import { readJson, faNum } from '@/lib/kit.js';

export default {
  name: 'GnavApp',
  data: () => ({
    p: readJson('gnav-data') || {},
    navOpen: false,
    gddOpen: false,
    dark: document.documentElement.dataset.theme === 'dark',
    _tin: null, _tout: null
  }),
  created() {
    // آبجکت مرورگر — بیرون از state واکنش‌گرا نگه داشته می‌شود
    this.hoverFine = window.matchMedia ? matchMedia('(hover:hover) and (pointer:fine)') : { matches: false };
  },
  computed: {
    u() { return this.p.user || {}; },
    /* آیتم‌های منوی اصلی با وضعیت فعال (محاسبهٔ کلاینت از endpoint سرور) */
    items() {
      const ep = this.p.endpoint || '';
      const it = [
        { href: this.p.urls.dashboard, icon: 'i-home', label: 'داشبورد', on: ep === 'dashboard' },
        { href: this.p.urls.activities, icon: 'i-pencil', label: 'فعالیت‌ها', on: ['activities', 'activity_view', 'activity_edit', 'activity_new'].includes(ep), badge: this.p.nav_tasks, badge_title: 'تسک‌های باز تخصیص‌یافته به شما' },
        { href: this.p.urls.tasks, icon: 'i-ticket', label: this.p.is_admin ? 'تخصیص تسک' : 'تسک‌های من', on: ep === 'tasks_page', badge: this.p.nav_tasks, badge_title: 'تسک‌های باز تخصیص‌یافته به شما' },
        { href: this.p.urls.reports, icon: 'i-chart', label: 'گزارش‌ها', on: ep === 'reports' },
      ];
      if (this.p.perm_import) it.push({ href: this.p.urls.import, icon: 'i-inbox', label: 'ورود از Excel', on: ['import_excel', 'import_result'].includes(ep) });
      return it;
    },
    gddOn() { return ['manage', 'users', 'user_new', 'user_edit', 'settings', 'domains_page', 'fields_page'].includes(this.p.endpoint || ''); },
    gddItems() {
      const ep = this.p.endpoint || '';
      return [
        { href: this.p.urls.manage, icon: 'i-home', label: 'پیشخوان مدیریت', on: ep === 'manage' },
        { href: this.p.urls.users, icon: 'i-users', label: 'کاربران', on: ['users', 'user_edit'].includes(ep) },
        { href: this.p.urls.user_new, icon: 'i-plus', label: 'کاربر جدید', on: ep === 'user_new' },
        { href: this.p.urls.settings, icon: 'i-wrench', label: 'تنظیمات', on: ['settings', 'domains_page', 'fields_page'].includes(ep) },
      ];
    },
    roleLabel() { return this.u.role === 'admin' ? 'مدیر' : (this.u.is_trainee ? 'کارآموز' : 'کارشناس'); },
    initial() { return (this.u.full_name || '؟')[0]; },
  },
  watch: {
    navOpen(v) { document.body.classList.toggle('nav-open', v); }
  },
  mounted() {
    document.addEventListener('click', e => {
      if (this.navOpen && !e.target.closest('.gmenu') && !e.target.closest('.hamb')) this.navOpen = false;
      if (this.gddOpen && !e.target.closest('.gdd')) this.gddOpen = false;
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.gddOpen = false; });
    // میانبر «/» برای جستجوی سراسری
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !(e.target.matches && e.target.matches('input,select,textarea'))) {
        const inp = document.getElementById('gsearch-in');
        if (inp) { e.preventDefault(); inp.focus(); inp.select(); }
      }
    });
  },
  methods: {
    fa: faNum,
    toggleNav() { this.navOpen = !this.navOpen; },
    gddToggle() { this.gddOpen = !this.gddOpen; },
    gddEnter() { if (!this.hoverFine.matches) return; clearTimeout(this._tout); this._tin = setTimeout(() => { this.gddOpen = true; }, 100); },
    gddLeave() { if (!this.hoverFine.matches) return; clearTimeout(this._tin); this._tout = setTimeout(() => { this.gddOpen = false; }, 320); },
    toggleTheme() {
      const root = document.documentElement, next = root.dataset.theme === 'dark' ? '' : 'dark';
      if (next) root.dataset.theme = next; else delete root.dataset.theme;
      try { localStorage.setItem('secman-theme', next || 'light'); } catch (_) {}
      location.reload();
    }
  },
};
</script>
<template>
  <div class="gnav-in">
    <button type="button" class="hamb" aria-label="منو" :aria-expanded="navOpen?'true':'false'" @click="toggleNav"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    <a class="gbrand" :href="p.urls.dashboard" :title="p.sys_name">
      <img v-if="p.has_logo" :src="p.urls.logo" :alt="p.sys_name"><span v-else class="bmark"><svg class="ic"><use href="#i-shield"/></svg></span>
      <b>{{ p.sys_name }}</b>
    </a>
    <nav class="gmenu" id="gmenu" aria-label="ناوبری اصلی">
      <a v-for="it in items" :key="it.href" :href="it.href" :class="{active: it.on}"><svg class="ic"><use :href="'#'+it.icon"/></svg><span>{{ it.label }}</span><span v-if="it.badge" class="nb" :title="it.badge_title">{{ fa(it.badge) }}</span></a>
      <div v-if="p.is_admin" class="gdd" id="gdd" :class="{open: gddOpen}" @mouseenter="gddEnter" @mouseleave="gddLeave">
        <a class="gd-l" :class="{active: gddOn}" :href="p.urls.manage"><svg class="ic"><use href="#i-sliders"/></svg><span>مدیریت</span></a>
        <button type="button" class="gd-c" aria-label="بازکردن منوی مدیریت" :aria-expanded="gddOpen?'true':'false'" @click.prevent.stop="gddToggle"><svg class="ic chv"><use href="#i-down"/></svg></button>
        <div class="gdd-menu" @click="gddOpen=false">
          <a v-for="it in gddItems" :key="it.href" :href="it.href" :class="{on: it.on}"><svg class="ic"><use :href="'#'+it.icon"/></svg> {{ it.label }}</a>
        </div>
      </div>
    </nav>
    <form class="gsearch" method="get" :action="p.urls.activities" role="search">
      <svg class="ic"><use href="#i-search"/></svg>
      <input type="text" name="q" id="gsearch-in" placeholder="جستجوی فعالیت..." autocomplete="off" :value="p.q">
      <kbd>/</kbd>
    </form>
    <div class="gside">
      <span class="gchip"><svg class="ic"><use href="#i-cal"/></svg><span>{{ p.today_fa }}</span></span>
      <button type="button" class="gbtn" id="themeToggle" title="تغییر تم روشن / تیره" aria-label="تغییر تم" @click="toggleTheme">
        <svg class="ic i16" data-th="moon" :class="{hide: dark}"><use href="#i-moon"/></svg>
        <svg class="ic i16" data-th="sun" :class="{hide: !dark}"><use href="#i-sun"/></svg>
      </button>
      <a class="guser" :href="p.urls.profile" title="پروفایل من — ویرایش نام نمایشی و رمز عبور">
        <span class="avatar" :title="u.full_name">{{ initial }}</span>
        <span class="uinfo"><b>{{ u.full_name }}</b><i>{{ roleLabel }}</i></span>
        <svg class="ic i16 guser-ic"><use href="#i-user"/></svg>
      </a>
      <a :href="p.urls.logout" class="gbtn tbtn-out" title="خروج از حساب" aria-label="خروج"><svg class="ic i16"><use href="#i-logout"/></svg></a>
    </div>
  </div>
</template>
