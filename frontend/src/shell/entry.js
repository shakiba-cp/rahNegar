/* ============================================================
   ره‌نگار — entry پوسته: روی همهٔ صفحات mount می‌شود
   · GnavApp   روی <header class="gnav">  (رفتار منوی هدر)
   · ChromeApp روی #chrome-app            (توست/مودال/تقویم/نوار پیشرفت)
   ============================================================ */
import { mountApp } from '@/lib/kit.js';
import { installChromeGlobals } from '@/store/chrome.js';
import GnavApp from '@/components/shell/GnavApp.vue';
import ChromeApp from '@/components/shell/ChromeApp.vue';

mountApp(GnavApp, '.gnav');
mountApp(ChromeApp, '#chrome-app');
installChromeGlobals();
