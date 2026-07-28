/* entry صفحه فعالیت‌ها */
import { mountApp } from '@/lib/kit.js';
import FltPanel from './FltPanel.vue';
import ActsTable from './ActsTable.vue';

mountApp(FltPanel, '#flt-app');
mountApp(ActsTable, '#acts-app');
