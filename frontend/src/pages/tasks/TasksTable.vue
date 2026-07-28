<script>
/* جدول تسک‌ها — پورت SFC؛ فرم تخصیص همچنان سروری است */
import { readJson, faNum as fa, statusClass, sorter } from '@/lib/kit.js';

export default {
  name: 'TasksTable',
  mixins: [sorter],
  data() {
    const payload = readJson('tasks-data') || { rows: [], admin: false };
    return {
      rows: payload.rows || [],
      isAdmin: !!payload.admin,
      q: '',
      sortKey: '',
      sortDir: 1,
      cols: [
        { k: 'who', t: null },
        { k: 'domain', t: 'حوزه' },
        { k: 'title', t: 'عنوان تسک' },
        { k: 'status', t: 'وضعیت' },
        { k: 'date_key', t: 'تاریخ ثبت' }
      ]
    };
  },
  computed: {
    filtered() {
      let r = this.rows;
      const q = this.q.trim();
      if (q) r = r.filter(x => (x.who + ' ' + x.domain + ' ' + x.title + ' ' + x.ticket + ' ' + x.note + ' ' + x.status).includes(q));
      return this.kSort(r);
    }
  },
  methods: { fa, stClass: statusClass },
};
</script>
<template>
  <div>
    <template v-if="rows.length">
    <div class="vbar">
      <div class="srch vgrow"><svg class="ic"><use href="#i-search"/></svg>
        <input v-model="q" type="text" placeholder="جستجوی لحظه‌ای در تسک‌ها...">
      </div>
      <span class="mute fs11" v-if="q">{{ fa(filtered.length) }} نتیجه</span>
    </div>
    <div class="tbl-wrap"><table>
      <thead><tr>
        <th v-for="c in cols" :key="c.k" class="sortable" :class="{on: sortKey===c.k}" @click="kToggleSort(c.k)">
          {{ c.t || (isAdmin ? 'کارشناس مسئول' : 'تخصیص‌دهنده') }} <span class="sa">{{ kSortIcon(c.k) }}</span>
        </th>
        <th>توضیحات</th>
        <th title="مستندات"><svg class="ic i14 ink3"><use href="#i-clip"/></svg></th>
        <th title="پاسخ‌ها"><svg class="ic i14 ink3"><use href="#i-msg"/></svg></th>
        <th></th>
      </tr></thead>
      <tbody>
      <tr v-for="r in filtered" :key="r.id" :class="{rowdone: r.status==='انجام شده'}">
        <td><b class="ink1">{{ r.who }}</b></td>
        <td><span class="nih"><svg class="ic dic"><use :href="'#'+r.icon"/></svg>{{ r.domain }}</span></td>
        <td><b>{{ r.title }}</b> <span class="tag tk-ch" v-if="r.ticket">تیکت {{ fa(r.ticket) }}</span></td>
        <td class="mute fs11 tn-c" :title="r.note">{{ r.note_short || '—' }}</td>
        <td><span class="badge" :class="stClass(r.status)">{{ r.status }}</span></td>
        <td class="mute onum">{{ fa(r.date) }}</td>
        <td class="onum">{{ r.atts ? fa(r.atts) : '—' }}</td>
        <td class="onum">{{ r.resps ? fa(r.resps) : '—' }}</td>
        <td><a class="btn ghost sm" :href="r.view"><svg class="ic i14"><use href="#i-eye"/></svg> مشاهده</a></td>
      </tr>
      <tr v-if="!filtered.length"><td colspan="9" class="mute tac" style="padding:26px">موردی با این جستجو یافت نشد.</td></tr>
      </tbody>
    </table></div>
    <div class="mute fs11 mt-3" v-if="isAdmin"><svg class="ic i14 va-m"><use href="#i-alert"/></svg> ردیف‌های محو‌شده، تسک‌های انجام‌شده‌اند. برای تعیین توضیحات بیشتر یا بررسی پاسخ کارشناس، روی «مشاهده» کلیک کنید.</div>
    </template>
    <div class="empty" v-else>
      <div class="eic"><svg class="ic i88"><use href="#i-empty"/></svg></div>
      <div class="fw7 ink2">{{ isAdmin ? 'هنوز تسکی تخصیص نداده‌اید — از فرم بالا اولین تسک را بسازید.' : 'تسکی برای شما ثبت نشده است.' }}</div>
    </div>
  </div>
</template>
