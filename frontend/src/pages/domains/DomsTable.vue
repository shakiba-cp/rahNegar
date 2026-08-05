<script>
/* جدول حوزه‌ها — پورت SFC؛ ویرایش نام و عملیات با فرم‌های POST سروری */
import { readJson, faNum as fa, sorter } from '@/lib/kit.js';

export default {
  name: 'DomsTable',
  mixins: [sorter],
  data() {
    const payload = readJson('doms-data') || { rows: [] };
    return {
      rows: (payload.rows || []).map((r, i) => ({ ...r, idx: i + 1, active_num: r.is_active ? 1 : 0 })),
      orgs: payload.orgs || [],
      q: '',
      sortKey: '',
      sortDir: 1,
      cols: [
        { k: 'idx', t: '#' },
        { k: 'name', t: 'حوزه' },
        { k: 'org', t: 'مرکز' },
        { k: 'field_count_num', t: 'فیلدهای فعال' },
        { k: 'act_count_num', t: 'فعالیت‌ها' },
        { k: 'active_num', t: 'وضعیت' }
      ]
    };
  },
  computed: {
    filtered() {
      let r = this.rows;
      const q = this.q.trim();
      if (q) r = r.filter(x => x.name.includes(q));
      return this.kSort(r);
    }
  },
  methods: { fa },
};
</script>
<template>
  <div>
    <div class="vbar">
      <div class="srch vgrow"><svg class="ic"><use href="#i-search"/></svg>
        <input v-model="q" type="text" placeholder="جستجوی لحظه‌ای حوزه...">
      </div>
      <span class="mute fs11" v-if="q">{{ fa(filtered.length) }} نتیجه</span>
    </div>
    <div class="tbl-wrap"><table>
      <thead><tr>
        <th v-for="c in cols" :key="c.k" class="sortable" :class="{on: sortKey===c.k}" @click="kToggleSort(c.k)">
          {{ c.t }} <span class="sa">{{ kSortIcon(c.k) }}</span>
        </th>
        <th>عملیات</th>
      </tr></thead>
      <tbody>
      <tr v-for="d in filtered" :key="d.id" :class="{'row-off': !d.is_active}">
        <td class="mute onum">{{ fa(d.idx) }}</td>
        <td>
          <form method="post" :action="d.edit" class="btn-row">
            <svg class="ic dic" style="width:17px;height:17px"><use :href="'#'+d.icon"/></svg>
            <input type="text" name="name" :value="d.name" class="iname">
            <button class="btn ghost icon" title="ذخیره نام و مرکز"><svg class="ic"><use href="#i-check"/></svg></button>
          </form>
        </td>
        <td>
          <form method="post" :action="d.edit" class="btn-row">
            <select name="org_id" class="osel-mini" :value="String(d.org_id)" title="مرکز این حوزه — با ذخیره، منتقل می‌شود">
              <option v-for="o in orgs" :key="o.id" :value="String(o.id)">{{ o.name }}</option>
            </select>
            <button class="btn ghost icon" title="انتقال به این مرکز"><svg class="ic"><use href="#i-check"/></svg></button>
          </form>
        </td>
        <td class="onum">{{ fa(d.field_count) }}</td>
        <td class="onum">{{ fa(d.act_count) }}</td>
        <td><span v-if="d.is_active" class="badge st-done">فعال</span><span v-else class="badge st-off">غیرفعال</span></td>
        <td><div class="btn-row">
          <a class="btn pri sm" :href="d.fields"><svg class="ic"><use href="#i-sliders"/></svg> مدیریت فیلدها</a>
          <form method="post" :action="d.toggle"><button class="btn ghost sm">{{ d.is_active ? 'غیرفعال' : 'فعال‌سازی' }}</button></form>
          <form v-if="!d.act_count" method="post" :action="d.delete" onsubmit="return confirm('حذف این حوزه؟')"><button class="btn danger icon" title="حذف"><svg class="ic"><use href="#i-trash"/></svg></button></form>
        </div></td>
      </tr>
      <tr v-if="!filtered.length"><td colspan="7" class="mute tac" style="padding:26px">حوزه‌ای یافت نشد.</td></tr>
      </tbody>
    </table></div>
  </div>
</template>
