<script>
/* جدول فعالیت‌ها — روی #acts-app
   جستجو/مرتب‌سازی/صفحه‌بندی کلاینتی + انتخاب چندتایی + خروجی CSV */
import { fa, statusClass, downloadCsv, readJson, sorter } from '@/lib/kit.js';

const PER = 20;

export default {
  name: 'ActsTable',
  mixins: [sorter],
  data() {
    const payload = readJson('acts-data') || { rows: [], admin: false };
    return {
      rows: payload.rows,
      isAdmin: !!payload.admin,
      q: '',
      sortKey: '',
      sortDir: 1,
      sel: [],
      page: 1,
      cols: [
        { k: 'title', t: 'عنوان' },
        { k: 'domain', t: 'حوزه' },
        { k: 'expert', t: 'کارشناس' },
        { k: 'status', t: 'وضعیت' },
        { k: 'date_key', t: 'تاریخ' },
        { k: 'ticket_num', t: 'تیکت' }
      ]
    };
  },
  computed: {
    filtered() {
      let r = this.rows;
      const q = this.q.trim();
      if (q) r = r.filter(x => (x.title + ' ' + x.domain + ' ' + x.expert + ' ' + x.ticket + ' ' + x.date).includes(q));
      return this.kSort(r);
    },
    pages() { return Math.max(1, Math.ceil(this.filtered.length / PER)); },
    curPage() { return Math.min(this.page, this.pages); },
    paged() { return this.filtered.slice((this.curPage - 1) * PER, this.curPage * PER); },
    pageWindow() {
      const w = [], p = this.curPage, n = this.pages;
      for (let i = 1; i <= n; i++) if (i === 1 || i === n || Math.abs(i - p) <= 2) w.push(i);
      return w;
    },
    selCount() { return this.sel.length; },
    allChecked() { return this.filtered.length > 0 && this.filtered.every(x => this.sel.includes(x.id)); },
    rangeText() {
      if (!this.filtered.length) return '';
      const a = (this.curPage - 1) * PER + 1, b = Math.min(this.filtered.length, this.curPage * PER);
      return `نمایش ${this.fa(a)} تا ${this.fa(b)} از ${this.fa(this.filtered.length)} فعالیت`;
    }
  },
  watch: {
    q() { this.page = 1; }
  },
  methods: {
    fa, stClass: statusClass,
    go(n) { this.page = Math.min(Math.max(1, n), this.pages); },
    toggleAll(e) {
      // انتخاب همه نتایجِ فیلترشده (نه فقط صفحه جاری)
      const ids = this.filtered.map(x => x.id);
      this.sel = e.target.checked ? [...new Set(this.sel.concat(ids))] : this.sel.filter(id => !ids.includes(id));
    },
    clearSel() { this.sel = []; },
    exportCsv() {
      const rows = this.rows.filter(x => this.sel.includes(x.id));
      downloadCsv('activities-selected.csv',
        ['عنوان', 'حوزه', 'کارشناس', 'وضعیت', 'تاریخ', 'تیکت'],
        rows.map(x => [x.title.replace('تسک', '').trim(), x.domain, x.expert, x.status, x.date, x.ticket || '—']));
    },
    kToggleSort(key) {
      if (this.sortKey === key) { this.sortDir *= -1; }
      else { this.sortKey = key; this.sortDir = 1; }
      this.page = 1;
    }
  },
  directives: {
    ind: { mounted(el, b) { el.indeterminate = !!b.value; }, updated(el, b) { el.indeterminate = !!b.value; } }
  },
};
</script>
<template>
  <div>
    <div class="vbar">
      <div class="srch vgrow"><svg class="ic"><use href="#i-search"/></svg>
        <input v-model="q" type="text" placeholder="جستجو در عنوان، تیکت، کارشناس...">
      </div>
      <span class="mute fs11" v-if="q">{{ fa(filtered.length) }} نتیجه</span>
    </div>
    <div class="selbar no-print" :class="{on: selCount>0}">
      <span><b class="onum">{{ fa(selCount) }}</b> فعالیت انتخاب شد</span>
      <button type="button" class="btn pri sm" @click="exportCsv"><svg class="ic"><use href="#i-file"/></svg> خروجی CSV انتخاب‌شده‌ها</button>
      <button type="button" class="btn ghost sm" @click="clearSel">لغو انتخاب</button>
    </div>
    <div class="tbl-wrap"><table>
      <thead><tr>
        <th class="selc"><input type="checkbox" title="انتخاب همه نتایج" :checked="allChecked" v-ind="selCount>0 && !allChecked" @change="toggleAll"></th>
        <th v-for="c in cols" :key="c.k" class="sortable" :class="{on: sortKey===c.k}" @click="kToggleSort(c.k)">
          {{ c.t }} <span class="sa">{{ kSortIcon(c.k) }}</span>
        </th>
        <th title="تعداد ضمیمه"><svg class="ic i14 ink3"><use href="#i-clip"/></svg></th>
        <th class="no-print">عملیات</th>
      </tr></thead>
      <tbody>
      <tr v-for="r in paged" :key="r.id" :class="{'row-on': sel.includes(r.id)}">
        <td class="selc"><input type="checkbox" :value="r.id" v-model="sel"></td>
        <td><a :href="r.view" class="fw7 ink1">{{ r.title }}</a>
          <span class="tag warn" v-if="r.task" title="این فعالیت به این کارشناس تخصیص داده شده است"><svg class="ic"><use href="#i-alert"/></svg> تسک</span></td>
        <td><span class="nih"><svg class="ic dic"><use :href="'#'+r.icon"/></svg>{{ r.domain }}</span></td>
        <td>{{ r.expert }}</td>
        <td><span class="badge" :class="stClass(r.status)">{{ r.status }}</span></td>
        <td class="mute onum">{{ fa(r.date) }}</td>
        <td class="mute onum">{{ r.ticket ? fa(r.ticket) : '—' }}</td>
        <td><span class="tag onum" v-if="r.atts">{{ fa(r.atts) }}</span></td>
        <td class="no-print">
          <div class="btn-row">
            <a class="btn ghost icon" :href="r.view" title="مشاهده"><svg class="ic"><use href="#i-eye"/></svg></a>
            <a class="btn ghost icon" :href="r.edit" title="ویرایش"><svg class="ic"><use href="#i-pencil"/></svg></a>
            <form v-if="isAdmin" method="post" :action="r.delete" data-confirm="حذف این فعالیت؟"><button class="btn danger icon" title="حذف"><svg class="ic"><use href="#i-trash"/></svg></button></form>
          </div>
        </td>
      </tr>
      <tr v-if="!filtered.length"><td colspan="9" class="mute tac" style="padding:26px">موردی با این جستجو یافت نشد.</td></tr>
      </tbody>
    </table></div>
    <div class="tbl-foot" v-if="filtered.length">
      <span class="mute fs11 onum">{{ rangeText }}</span>
      <div class="pagination no-print" v-if="pages>1">
        <template v-for="(n,i) in pageWindow" :key="n">
          <span v-if="i>0 && n-pageWindow[i-1]>1" class="dots">…</span>
          <span v-if="n===curPage" class="cur">{{ fa(n) }}</span>
          <a v-else href="#" @click.prevent="go(n)">{{ fa(n) }}</a>
        </template>
      </div>
    </div>
  </div>
</template>
