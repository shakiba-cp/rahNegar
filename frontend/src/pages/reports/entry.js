/* entry گزارش‌ها: جدول نتایج + انتخاب ستون‌ها + منوی خروجی */
import { mountApp } from '@/lib/kit.js';
import RepsTable from './RepsTable.vue';
import ColsChooser from './ColsChooser.vue';
import ExpMenu from './ExpMenu.vue';

mountApp(ExpMenu, '#exp-app');
mountApp(ColsChooser, '#cols-app');
mountApp(RepsTable, '#reps-app');
