import { mountApp, readJson } from '../../lib/kit.js';
import AFormApp from './AFormApp.vue';
const p = readJson('aform-data') || {};
export default mountApp(AFormApp, '#aform-app', { p });
