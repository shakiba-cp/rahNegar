<script>
/* جدول کاربران — پورت SFC؛ جستجو + مرتب‌سازی + صفحه‌بندی + آواتار رنگی پایدار */
import { readJson, faNum as fa, sorter } from '@/lib/kit.js';

const PER = 15;
const hue = name => {
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
};

export default {
  name: 'UsersTable',
  mixins: [sorter],
  data() {
    const payload = readJson('users-data') || { rows: [] };
    return {
      rows: (payload.rows || []).map(r => ({
        ...r,
        active_num: r.is_active ? 1 : 0,
        act_count_num: r.act_count,
        kind: r.is_trainee ? 1 : 0,
        tc_num: r.trainee_count || 0
      })),
      q: '',
      sortKey: '',
      sortDir: 1,
      page: 1,
      cols: [
        { k: 'username', t: 'کاربر' },
        { k: 'full_name', t: 'نام کامل' },
        { k: 'org', t: 'بخش' },
        { k: 'role', t: 'نقش' },
        { k: 'kind', t: 'سمت' },
        { k: 'tc_num', t: 'سرپرست / کارآموزان' },
        { k: 'act_count_num', t: 'فعالیت‌ها' },
        { k: 'active_num', t: 'وضعیت' }
      ]
    };
  },
  computed: {
    filtered() {
      let r = this.rows;
      const q = this.q.trim();
      if (q) r = r.filter(x => (x.username + ' ' + x.full_name + ' ' + (x.org || '')).includes(q));
      return this.kSort(r);
    },
    pages() { return Math.max(1, Math.ceil(this.filtered.length / PER)); },
    curPage() { return Math.min(this.page, this.pages); },
    paged() { return this.filtered.slice((this.curPage - 1) * PER, this.curPage * PER); },
    pageWindow() {
      const w = [], p = this.curPage, n = this.pages;
      for (let i = 1; i <= n; i++) if (i === 1 || i === n || Math.abs(i - p) <= 2) w.push(i);
      return w;
    }
  },
  watch: { q() { this.page = 1; } },
  methods: {
    fa,
    go(n) { this.page = Math.min(Math.max(1, n), this.pages); },
    avStyle(u) {
      const h = hue(u.username || u.full_name);
      return { background: `linear-gradient(140deg,hsl(${h},48%,47%),hsl(${h},52%,33%))` };
    }
  },
};
</script>
<template>
  <div>
    <div class="vbar">
      <div class="srch vgrow"><svg class="ic"><use href="#i-search"/></svg>
        <input v-model="q" type="text" placeholder="جستجوی کاربر — نام یا نام کاربری...">
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
      <tr v-for="u in paged" :key="u.id" :class="{op45: !u.is_active}">
        <td><span class="nih"><span class="avt" :style="avStyle(u)">{{ (u.full_name||'؟')[0] }}</span><b class="ink1">{{ u.username }}</b></span></td>
        <td>{{ u.full_name }}</td>
        <td><span class="badge" :class="u.org_id ? 'st-prog' : ''" :title="u.org_id ? 'فقط حوزه‌های این بخش را می‌بیند' : 'همهٔ حوزه‌ها'">{{ u.org }}</span></td>
        <td><span class="role-chip" :class="{expert: u.role==='expert'}">{{ u.role==='admin' ? 'مدیر' : 'کارشناس' }}</span>
          <span v-if="u.role!=='admin'" class="perm-mini">
            <span v-if="u.can_add">ثبت</span><span v-if="u.can_edit">ویرایش</span><span v-if="u.can_delete">حذف</span><span v-if="u.can_import">اکسل</span>
          </span>
        </td>
        <td><span v-if="u.is_trainee" class="chip chip-tr"><svg class="ic"><use href="#i-cap"/></svg> کارآموز</span>
            <span v-else class="chip chip-nr">نیرو</span></td>
        <td><template v-if="u.is_trainee"><span v-if="u.supervisor_name" class="mute">سرپرست: <b class="ink1">{{ u.supervisor_name }}</b></span><span v-else class="mute">بدون سرپرست</span></template>
            <template v-else><span v-if="u.trainee_count>0" class="badge st-done" title="کارآموزان تحت سرپرستی">{{ fa(u.trainee_count) }} کارآموز</span><span v-else class="mute">—</span></template></td>
        <td class="onum">{{ fa(u.act_count) }}</td>
        <td><span v-if="u.is_active" class="badge st-done">فعال</span><span v-else class="badge st-off">غیرفعال</span></td>
        <td><div class="btn-row">
          <a class="btn ghost icon" :href="u.edit" title="ویرایش"><svg class="ic"><use href="#i-pencil"/></svg></a>
          <template v-if="!u.self">
            <form method="post" :action="u.toggle"><button class="btn ghost sm">{{ u.is_active ? 'غیرفعال' : 'فعال‌سازی' }}</button></form>
            <form v-if="!u.act_count" method="post" :action="u.delete" onsubmit="return confirm('حذف این کاربر؟')"><button class="btn danger icon" title="حذف"><svg class="ic"><use href="#i-trash"/></svg></button></form>
          </template>
        </div></td>
      </tr>
      <tr v-if="!filtered.length"><td colspan="9" class="mute tac" style="padding:26px">کاربری با این جستجو یافت نشد.</td></tr>
      </tbody>
    </table></div>
    <div class="tbl-foot" v-if="pages>1">
      <span class="mute fs11 onum">صفحه {{ fa(curPage) }} از {{ fa(pages) }}</span>
      <div class="pagination no-print">
        <template v-for="(n,i) in pageWindow" :key="n">
          <span v-if="i>0 && n-pageWindow[i-1]>1" class="dots">…</span>
          <span v-if="n===curPage" class="cur">{{ fa(n) }}</span>
          <a v-else href="#" @click.prevent="go(n)">{{ fa(n) }}</a>
        </template>
      </div>
    </div>
  </div>
</template>
