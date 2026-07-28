/* entry فیلدهای حوزه: فرم افزودن + فهرست تعاملی */
import { mountApp } from '@/lib/kit.js';
import FldAddForm from './FldAddForm.vue';
import FldsList from './FldsList.vue';

mountApp(FldAddForm, '#fld-add-form');
mountApp(FldsList, '#flds-app');
