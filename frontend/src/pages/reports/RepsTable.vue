<script>
/* جدول نتایج گزارش — پورت SFC (جستجو + مرتب‌سازی روی همه نتایج سرور) */
import { readJson, faNum as fa, statusClass, sorter } from '@/lib/kit.js';

export default {
  name: 'RepsTable',
  mixins: [sorter],
  data() {
    const payload = readJson('reps-data') || { rows: [] };
    return {
      rows: payload.rows || [],
      q: '',
      sortKey: 'date_key',
      sortDir: -1,
      cols: [
        { k: 'domain', t: 'حوزه' },
        { k: 'title', t: 'عنوان' },
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
    }
  },
  methods: { fa, stClass: statusClass },
};
</script>
<template>
  <div>
    <div class="vbar no-print">
      <div class="srch vgrow"><svg class="ic"><use href="#i-search"/></svg>
        <input v-model="q" type="text" placeholder="جستجوی لحظه‌ای در نتایج گزارش...">
      </div>
      <span class="mute fs11" v-if="q">{{ fa(filtered.length) }} نتیجه</span>
    </div>
    <div class="tbl-wrap" style="max-height:560px;overflow:auto" v-if="rows.length"><table>
      <thead><tr>
        <th v-for="c in cols" :key="c.k" class="sortable" :class="{on: sortKey===c.k}" @click="kToggleSort(c.k)">
          {{ c.t }} <span class="sa">{{ kSortIcon(c.k) }}</span>
        </th>
        <th title="ضمیمه"><svg class="ic i14 ink3"><use href="#i-clip"/></svg></th>
      </tr></thead>
      <tbody>
      <tr v-for="r in filtered" :key="r.id">
        <td><span class="nih"><svg class="ic dic"><use :href="'#'+r.icon"/></svg>{{ r.domain }}</span></td>
        <td><a :href="r.view" class="fw7 ink1">{{ r.title }}</a></td>
        <td>{{ r.expert }}</td>
        <td><span class="badge" :class="stClass(r.status)">{{ r.status }}</span></td>
        <td class="mute onum">{{ fa(r.date) }}</td>
        <td class="mute onum">{{ r.ticket ? fa(r.ticket) : '—' }}</td>
        <td><span class="onum" v-if="r.atts">{{ fa(r.atts) }}</span></td>
      </tr>
      <tr v-if="!filtered.length"><td colspan="7" class="mute tac" style="padding:26px">موردی با این جستجو یافت نشد.</td></tr>
      </tbody>
    </table></div>
    <div v-else class="empty"><div class="eic"><svg class="ic i88"><use href="#i-empty"/></svg></div><div class="fw7 ink2">موردی با این فیلترها یافت نشد.</div></div>
  </div>
</template>
