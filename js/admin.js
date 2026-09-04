/* ===== CORTE NOBRE — admin.js ===== */
'use strict';

const TOKEN = '779988';
const LS_KEY = 'cn_admin_v1';
const SITE_KEY = 'cn_site_bookings';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const BRL = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pad = n => String(n).padStart(2, '0');
const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => isoOf(new Date());
const addISO = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return isoOf(d); };
const brDate = iso => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const brDateLong = iso => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });

/* Seeded RNG — dados demo estáveis */
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ================= SEED ================= */
function seed() {
  const R = rng(20260214);
  const pick = a => a[Math.floor(R() * a.length)];
  const services = [
    { name: 'Corte Clássico', duration: '40 min', price: 70 },
    { name: 'Degradê Navalhado', duration: '50 min', price: 80 },
    { name: 'Barba Terapia', duration: '35 min', price: 60 },
    { name: 'Combo Corte + Barba', duration: '1h20', price: 120 },
    { name: 'Coloração / Pigmentação', duration: '45 min', price: 90 },
    { name: 'Dia do Noivo', duration: '3h', price: 299 },
  ];
  const barbers = [
    { name: 'Diego Marra', role: 'Degradê · 9 anos', comm: 35 },
    { name: 'Rafa Costa', role: 'Barba & visagismo · 7 anos', comm: 35 },
    { name: 'Thiago Nobre', role: 'Clássicos · tesoura · 12 anos', comm: 40 },
  ];
  const names = [
    ['Lucas Mendes', '(11) 98711-2233'], ['Fernando Alves', '(11) 97654-8899'],
    ['Bruno Carvalho', '(11) 96543-1122'], ['Rafael Teixeira', '(11) 99432-7766'],
    ['Thiago Souza', '(11) 98877-4455'], ['Diego Oliveira', '(11) 97766-3344'],
    ['Matheus Lima', '(11) 96655-9900'], ['Gustavo Rocha', '(11) 95544-2211'],
    ['André Santos', '(11) 94433-6677'], ['Paulo Henrique', '(11) 93322-1188'],
    ['João Pedro', '(11) 92211-5533'], ['Marcos Vinícius', '(11) 91100-8899'],
    ['Felipe Costa', '(11) 90099-4422'], ['Rodrigo Almeida', '(11) 98988-7711'],
    ['Leonardo Dias', '(11) 97877-2200'], ['Eduardo Nunes', '(11) 96766-6655'],
    ['Caio Ferreira', '(11) 95655-1100'], ['Vitor Hugo', '(11) 94544-9933'],
  ];
  const times = [];
  for (let h = 9; h < 20; h++) { times.push(`${pad(h)}:00`, `${pad(h)}:30`); }
  const satTimes = [];
  for (let h = 8; h < 18; h++) { satTimes.push(`${pad(h)}:00`, `${pad(h)}:30`); }

  const bookings = [];
  let id = 1;
  const today = todayISO();
  for (let d = -29; d <= 7; d++) {
    const iso = addISO(today, d);
    const dow = new Date(iso + 'T12:00:00').getDay();
    if (dow === 0) continue; // domingo fechado
    const slots = dow === 6 ? satTimes : times;
    const n = d < 0 ? 2 + Math.floor(R() * 4) : d === 0 ? 4 : 1 + Math.floor(R() * 4);
    const used = new Set();
    for (let k = 0; k < n; k++) {
      const t = pick(slots);
      if (used.has(t)) continue;
      used.add(t);
      const [nm, ph] = pick(names);
      const svc = pick(services);
      let status;
      if (d < 0) status = R() < 0.9 ? 'concluido' : 'cancelado';
      else if (d === 0) status = R() < 0.4 ? 'concluido' : R() < 0.75 ? 'confirmado' : 'pendente';
      else status = R() < 0.55 ? 'confirmado' : 'pendente';
      bookings.push({
        id: id++, name: nm, phone: ph, service: svc.name,
        barber: R() < 0.2 ? 'Tanto faz' : pick(barbers).name,
        date: iso, time: t, price: svc.price, status, notes: '', origin: 'demo',
      });
    }
  }
  const costs = [
    { desc: 'Aluguel da loja', value: 2500 },
    { desc: 'Produtos (pomadas, óleos, lâminas)', value: 820 },
    { desc: 'Energia + água', value: 340 },
    { desc: 'Marketing / redes sociais', value: 450 },
    { desc: 'Sistema + assinaturas', value: 180 },
  ];
  const history = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - m);
    history.push({
      month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      revenue: Math.round(13200 + R() * 5200),
      costs: Math.round(3900 + R() * 1100),
    });
  }
  return {
    services, barbers, bookings, costs, history,
    importedSite: [],
    config: { wa: '5511999999999', open: '09:00', close: '20:00', sat: '18:00' },
  };
}

/* ================= STORE ================= */
let DB;
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { DB = JSON.parse(raw); return; }
  } catch { /* ignora */ }
  DB = seed(); save();
}
function save() { localStorage.setItem(LS_KEY, JSON.stringify(DB)); }

/* Agendamentos vindos do site (index.html salva em SITE_KEY) */
function mergeSiteBookings() {
  let site = [];
  try { site = JSON.parse(localStorage.getItem(SITE_KEY) || '[]'); } catch { site = []; }
  let added = 0;
  for (const b of site) {
    if (DB.importedSite.includes(b.id)) continue;
    DB.bookings.push({ ...b, origin: 'site', status: 'pendente' });
    DB.importedSite.push(b.id);
    added++;
  }
  if (added) { save(); toast(`📥 ${added} agendamento(s) do site importado(s)!`); }
}

/* ================= AUTH ================= */
function checkAuth() {
  if (sessionStorage.getItem('cn_admin_auth') === '1') showApp();
}
function showApp() {
  $('#loginView').hidden = true;
  $('#appView').hidden = false;
  mergeSiteBookings();
  renderAll();
}
$('#loginForm').addEventListener('submit', e => {
  e.preventDefault();
  if ($('#tokenInput').value.trim() === TOKEN) {
    sessionStorage.setItem('cn_admin_auth', '1');
    showApp();
  } else {
    $('#loginError').textContent = 'Token inválido. Tente novamente.';
    const card = $('.login-card');
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
  }
});
$('#logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('cn_admin_auth');
  location.reload();
});

/* ================= NAV ================= */
$$('.side-nav button').forEach(btn => btn.addEventListener('click', () => {
  $$('.side-nav button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  $$('.page').forEach(p => p.classList.remove('active'));
  const page = btn.dataset.page;
  $('#page-' + page).classList.add('active');
  $('#pageTitle').textContent = btn.textContent.replace(/\d+$/, '').trim();
  $('#sidebar').classList.remove('open');
  renderPage(page);
}));
$('#sideToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

/* ================= HELPERS ================= */
const svcPrice = name => (DB.services.find(s => s.name === name) || {}).price || 0;
const monthBookings = (statuses = ['concluido']) => {
  const mk = todayISO().slice(0, 7);
  return DB.bookings.filter(b => b.date.startsWith(mk) && statuses.includes(b.status));
};
function toast(m) {
  const t = $('#toast');
  t.textContent = m; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ================= MODAL ================= */
function openModal(title, html, onMount) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modal').classList.add('open');
  $('#modal').setAttribute('aria-hidden', 'false');
  if (onMount) onMount($('#modalBody'));
}
function closeModal() {
  $('#modal').classList.remove('open');
  $('#modal').setAttribute('aria-hidden', 'true');
}
$('#modalClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e => { if (e.target === $('#modal')) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ================= DASHBOARD ================= */
function renderDashboard() {
  const done = monthBookings();
  const revenue = done.reduce((s, b) => s + b.price, 0);
  const prev = DB.history.length > 1 ? DB.history[DB.history.length - 2].revenue : revenue;
  const delta = prev ? Math.round(((revenue - prev) / prev) * 100) : 0;

  const t = todayISO();
  const todays = DB.bookings.filter(b => b.date === t && b.status !== 'cancelado');
  const doneToday = todays.filter(b => b.status === 'concluido').length;

  $('#kpiRevenue').textContent = BRL(revenue);
  $('#kpiRevenueDelta').innerHTML = `<span class="${delta >= 0 ? 'up' : ''}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}% vs mês anterior (demo)</span>`;
  $('#kpiToday').textContent = todays.length;
  $('#kpiTodaySub').textContent = `${doneToday} concluído(s) · ${todays.filter(b => b.status === 'pendente').length} pendente(s)`;
  $('#kpiTicket').textContent = BRL(done.length ? Math.round(revenue / done.length) : 0);

  // ocupação próximos 7 dias
  let slots = 0, busy = 0;
  for (let d = 0; d < 7; d++) {
    const iso = addISO(t, d);
    const dow = new Date(iso + 'T12:00:00').getDay();
    if (dow === 0) continue;
    slots += (dow === 6 ? 20 : 22);
    busy += DB.bookings.filter(b => b.date === iso && b.status !== 'cancelado').length;
  }
  $('#kpiOccup').textContent = slots ? Math.round((busy / slots) * 100) + '%' : '—';

  // próximos agendamentos
  const next = DB.bookings
    .filter(b => (b.date > t || (b.date === t)) && ['pendente', 'confirmado'].includes(b.status))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);
  $('#nextList').innerHTML = next.length ? next.map(b => `
    <li><span class="avatar">${b.name[0]}</span>
    <span class="grow">${b.name}<small>${brDate(b.date)} às ${b.time} · ${b.service} · ${b.barber}</small></span>
    <span class="badge b-${b.status}">${b.status}</span></li>`).join('')
    : '<li class="muted">Nenhum agendamento futuro.</li>';

  // ranking equipe
  const rank = DB.barbers.map(bar => {
    const bs = done.filter(b => b.barber === bar.name);
    return { ...bar, n: bs.length, rev: bs.reduce((s, b) => s + b.price, 0) };
  }).sort((a, b) => b.rev - a.rev);
  const max = Math.max(1, ...rank.map(r => r.rev));
  $('#rankList').innerHTML = rank.map(r => `
    <li><span class="avatar">${r.name[0]}</span>
    <span class="grow">${r.name} — ${r.n} atend.<small>${BRL(r.rev)} no mês</small>
    <span class="rank-bar"><span style="width:${Math.round((r.rev / max) * 100)}%"></span></span></span></li>`).join('');

  $('#navPending').textContent = DB.bookings.filter(b => b.status === 'pendente').length;

  drawWeekChart();
  drawServicesChart();
}

function fitCanvas(cv) {
  const dpr = devicePixelRatio || 1;
  const w = cv.clientWidth, h = +(cv.getAttribute('height') || 220);
  cv.width = w * dpr; cv.height = h * dpr;
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  return [ctx, w, h];
}
function drawWeekChart() {
  const cv = $('#chartWeek');
  if (!cv || !cv.clientWidth) return;
  const [ctx, W, H] = fitCanvas(cv);
  const days = [];
  for (let d = 6; d >= 0; d--) {
    const iso = addISO(todayISO(), -d);
    days.push({
      label: new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'narrow' }).toUpperCase(),
      value: DB.bookings.filter(b => b.date === iso && b.status === 'concluido').reduce((s, b) => s + b.price, 0),
    });
  }
  const max = Math.max(1, ...days.map(d => d.value));
  const bw = W / days.length;
  ctx.clearRect(0, 0, W, H);
  days.forEach((d, i) => {
    const bh = Math.max(4, ((H - 46) * d.value) / max);
    const x = i * bw + bw * 0.22, y = H - 26 - bh;
    const g = ctx.createLinearGradient(0, y, 0, y + bh);
    g.addColorStop(0, '#e8c547'); g.addColorStop(1, '#7a5f14');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x, y, bw * 0.56, bh, 6); ctx.fill();
    ctx.fillStyle = '#F5F1E8'; ctx.font = '700 12px Inter'; ctx.textAlign = 'center';
    ctx.fillText(d.value ? d.value.toLocaleString('pt-BR') : '—', i * bw + bw / 2, y - 6);
    ctx.fillStyle = '#a7a7ad'; ctx.font = '600 11px Inter';
    ctx.fillText(d.label, i * bw + bw / 2, H - 8);
  });
}
function drawServicesChart() {
  const cv = $('#chartServices');
  if (!cv || !cv.clientWidth) return;
  const [ctx, W, H] = fitCanvas(cv);
  const mk = todayISO().slice(0, 7);
  const data = DB.services.map(s => ({
    name: s.name, n: DB.bookings.filter(b => b.service === s.name && b.date.startsWith(mk) && b.status !== 'cancelado').length,
  })).sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...data.map(d => d.n));
  const rh = (H - 10) / data.length;
  ctx.clearRect(0, 0, W, H);
  data.forEach((d, i) => {
    const y = i * rh + 4, w = Math.max(3, ((W - 190) * d.n) / max);
    ctx.fillStyle = '#d8d5cc'; ctx.font = '600 11px Inter'; ctx.textAlign = 'left';
    ctx.fillText(d.name.length > 20 ? d.name.slice(0, 20) + '…' : d.name, 4, y + rh / 2 + 3);
    const g = ctx.createLinearGradient(160, 0, 160 + w, 0);
    g.addColorStop(0, '#C9A227'); g.addColorStop(1, '#e8c547');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(160, y, w, rh - 9, 5); ctx.fill();
    ctx.fillStyle = '#F5F1E8'; ctx.font = '700 11px Inter';
    ctx.fillText(d.n + '×', 166 + w, y + rh / 2 + 3);
  });
}

/* ================= AGENDAMENTOS ================= */
function bookingFilters() {
  return {
    q: $('#bkSearch').value.trim().toLowerCase(),
    status: $('#bkStatus').value,
    date: $('#bkDate').value,
  };
}
function renderBookings() {
  const { q, status, date } = bookingFilters();
  const rows = DB.bookings
    .filter(b =>
      (!q || (b.name + b.service + b.barber).toLowerCase().includes(q)) &&
      (!status || b.status === status) &&
      (!date || b.date === date))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  $('#bkTable tbody').innerHTML = rows.map(b => `
    <tr>
      <td><strong>${b.name}</strong><br><small class="muted">${b.phone}${b.origin === 'site' ? ' · 🌐 site' : ''}</small></td>
      <td>${b.service}</td><td>${b.barber}</td>
      <td>${brDate(b.date)}</td><td>${b.time}</td>
      <td><strong>${BRL(b.price)}</strong></td>
      <td><span class="badge b-${b.status}">${b.status}</span></td>
      <td><div class="row-actions">
        ${b.status === 'pendente' ? `<button data-act="confirm" data-id="${b.id}">✓ confirmar</button>` : ''}
        ${b.status === 'confirmado' ? `<button data-act="done" data-id="${b.id}">✓ concluir</button>` : ''}
        ${!['concluido', 'cancelado'].includes(b.status) ? `<button data-act="cancel" data-id="${b.id}">✕</button>` : ''}
        <button data-act="del" data-id="${b.id}">🗑</button>
      </div></td>
    </tr>`).join('') || '<tr><td colspan="8" class="muted">Nenhum agendamento encontrado.</td></tr>';
}
$('#bkTable').addEventListener('click', e => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const b = DB.bookings.find(x => x.id === +btn.dataset.id);
  if (!b) return;
  const act = btn.dataset.act;
  if (act === 'confirm') b.status = 'confirmado';
  if (act === 'done') b.status = 'concluido';
  if (act === 'cancel' && confirm(`Cancelar agendamento de ${b.name}?`)) b.status = 'cancelado';
  if (act === 'del' && confirm(`Excluir agendamento de ${b.name}?`)) DB.bookings = DB.bookings.filter(x => x.id !== b.id);
  save(); renderAll();
});
['bkSearch', 'bkStatus', 'bkDate'].forEach(id => $('#' + id).addEventListener('input', renderBookings));
$('#bkClear').addEventListener('click', () => { $('#bkSearch').value = ''; $('#bkStatus').value = ''; $('#bkDate').value = ''; renderBookings(); });
$('#bkCsv').addEventListener('click', () => {
  const rows = [['Nome', 'Telefone', 'Serviço', 'Barbeiro', 'Data', 'Hora', 'Valor', 'Status']];
  DB.bookings.forEach(b => rows.push([b.name, b.phone, b.service, b.barber, b.date, b.time, b.price, b.status]));
  const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'agendamentos-corte-nobre.csv';
  a.click();
});

/* Modal novo/editar agendamento */
function bookingModal() {
  const svcOpts = DB.services.map(s => `<option value="${s.name}">${s.name} — ${BRL(s.price)}</option>`).join('');
  const barOpts = `<option value="Tanto faz">Tanto faz</option>` + DB.barbers.map(b => `<option>${b.name}</option>`).join('');
  openModal('Novo agendamento', `
    <form id="mBkForm">
      <label>Cliente<input type="text" id="mBkName" required placeholder="Nome do cliente"></label>
      <label>WhatsApp<input type="tel" id="mBkPhone" required placeholder="(11) 99999-9999"></label>
      <label>Serviço<select id="mBkService">${svcOpts}</select></label>
      <label>Barbeiro<select id="mBkBarber">${barOpts}</select></label>
      <label>Data<input type="date" id="mBkDate" required min="${todayISO()}" value="${todayISO()}"></label>
      <label>Hora<select id="mBkTime"></select></label>
      <label>Status<select id="mBkStatus"><option value="pendente">Pendente</option><option value="confirmado">Confirmado</option><option value="concluido">Concluído</option></select></label>
      <button class="btn btn-gold btn-block" type="submit">Salvar agendamento</button>
    </form>`, () => {
    const fillTimes = () => {
      const d = new Date($('#mBkDate').value + 'T12:00:00');
      const close = d.getDay() === 6 ? 18 : 20;
      let opts = '';
      for (let h = 9; h < close; h++) opts += `<option>${pad(h)}:00</option><option>${pad(h)}:30</option>`;
      $('#mBkTime').innerHTML = opts;
    };
    $('#mBkDate').addEventListener('change', fillTimes);
    fillTimes();
    $('#mBkForm').addEventListener('submit', ev => {
      ev.preventDefault();
      const svc = $('#mBkService').value;
      DB.bookings.push({
        id: Date.now(), name: $('#mBkName').value.trim(), phone: $('#mBkPhone').value.trim(),
        service: svc, barber: $('#mBkBarber').value, date: $('#mBkDate').value,
        time: $('#mBkTime').value, price: svcPrice(svc), status: $('#mBkStatus').value,
        notes: '', origin: 'admin',
      });
      save(); closeModal(); renderAll();
      toast('✅ Agendamento salvo!');
    });
  });
}
$('#quickNew').addEventListener('click', bookingModal);

/* ================= CLIENTES ================= */
function clientsDerived() {
  const map = {};
  for (const b of DB.bookings) {
    if (b.status === 'cancelado') continue;
    (map[b.name] = map[b.name] || { name: b.name, phone: b.phone, visits: 0, spent: 0, last: '' });
    const c = map[b.name];
    c.visits++;
    if (b.status === 'concluido') c.spent += b.price;
    if (b.date > c.last) c.last = b.date;
  }
  return Object.values(map).sort((a, b) => b.spent - a.spent);
}
function renderClients() {
  const q = $('#clSearch').value.trim().toLowerCase();
  const rows = clientsDerived().filter(c => !q || c.name.toLowerCase().includes(q));
  $('#clTable tbody').innerHTML = rows.map((c, i) => `
    <tr><td><strong>${c.name}</strong></td><td>${c.phone}</td><td>${c.visits}</td>
    <td><strong>${BRL(c.spent)}</strong></td><td>${c.last ? brDate(c.last) : '—'}</td>
    <td><div class="row-actions">
      <button data-wa="${c.phone}">✆ chamar</button>
      <button data-del="${c.name}">🗑</button>
    </div></td></tr>`).join('') || '<tr><td colspan="6" class="muted">Nenhum cliente.</td></tr>';
}
$('#clSearch').addEventListener('input', renderClients);
$('#clTable').addEventListener('click', e => {
  const wa = e.target.closest('button[data-wa]');
  if (wa) { open(`https://wa.me/55${wa.dataset.wa.replace(/\D/g, '')}`, '_blank'); return; }
  const del = e.target.closest('button[data-del]');
  if (del && confirm(`Excluir histórico de ${del.dataset.del}?`)) {
    DB.bookings = DB.bookings.filter(b => b.name !== del.dataset.del);
    save(); renderAll();
  }
});
$('#newClient').addEventListener('click', () => {
  openModal('Novo cliente', `
    <form id="mClForm">
      <label>Nome<input type="text" id="mClName" required></label>
      <label>WhatsApp<input type="tel" id="mClPhone" required placeholder="(11) 99999-9999"></label>
      <button class="btn btn-gold btn-block" type="submit">Cadastrar</button>
    </form>`, () => {
    $('#mClForm').addEventListener('submit', ev => {
      ev.preventDefault();
      DB.bookings.push({
        id: Date.now(), name: $('#mClName').value.trim(), phone: $('#mClPhone').value.trim(),
        service: DB.services[0].name, barber: 'Tanto faz', date: todayISO(), time: '09:00',
        price: 0, status: 'cancelado', notes: 'cadastro', origin: 'admin',
      });
      save(); closeModal(); renderAll();
      toast('✅ Cliente cadastrado!');
    });
  });
});

/* ================= EQUIPE ================= */
function renderTeam() {
  const mk = todayISO().slice(0, 7);
  $('#teamGrid').innerHTML = DB.barbers.map(b => {
    const bs = DB.bookings.filter(x => x.barber === b.name && x.date.startsWith(mk) && x.status === 'concluido');
    const rev = bs.reduce((s, x) => s + x.price, 0);
    return `<div class="mate-card">
      <div class="mate-avatar">${b.name[0]}</div>
      <h4>${b.name}</h4><p class="mate-role">${b.role}</p>
      <div class="mate-stats">
        <div><strong>${bs.length}</strong><span>atend. mês</span></div>
        <div><strong>${BRL(rev)}</strong><span>receita</span></div>
        <div><strong>${BRL(Math.round(rev * b.comm / 100))}</strong><span>comissão ${b.comm}%</span></div>
      </div>
      <button class="btn btn-line btn-sm" data-sched="${b.name}">Ver agenda</button>
    </div>`;
  }).join('');
}
$('#teamGrid').addEventListener('click', e => {
  const btn = e.target.closest('button[data-sched]');
  if (!btn) return;
  const t = todayISO();
  const list = DB.bookings
    .filter(b => b.barber === btn.dataset.sched && b.date >= t && b.status !== 'cancelado')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 8);
  openModal(`Agenda — ${btn.dataset.sched}`,
    list.length ? `<ul class="mini-list">${list.map(b => `<li><span class="grow">${b.name}<small>${brDate(b.date)} às ${b.time} · ${b.service}</small></span><span class="badge b-${b.status}">${b.status}</span></li>`).join('')}</ul>`
      : '<p class="muted">Sem compromissos futuros.</p>');
});

/* ================= SERVIÇOS ================= */
function renderServices() {
  const mk = todayISO().slice(0, 7);
  $('#svTable tbody').innerHTML = DB.services.map((s, i) => {
    const n = DB.bookings.filter(b => b.service === s.name && b.date.startsWith(mk) && b.status !== 'cancelado').length;
    return `<tr><td><strong>${s.name}</strong></td><td>${s.duration}</td>
      <td><strong>${BRL(s.price)}</strong></td><td>${n}</td>
      <td><div class="row-actions">
        <button data-edit="${i}">✎ editar</button>
        <button data-del="${i}">🗑</button>
      </div></td></tr>`;
  }).join('');
}
$('#svTable').addEventListener('click', e => {
  const ed = e.target.closest('button[data-edit]');
  const del = e.target.closest('button[data-del]');
  if (ed) {
    const s = DB.services[+ed.dataset.edit];
    openModal('Editar serviço', `
      <form id="mSvForm">
        <label>Nome<input type="text" id="mSvName" value="${s.name}" required></label>
        <label>Duração<input type="text" id="mSvDur" value="${s.duration}" required></label>
        <label>Preço (R$)<input type="number" id="mSvPrice" value="${s.price}" min="1" step="1" required></label>
        <button class="btn btn-gold btn-block" type="submit">Salvar</button>
      </form>`, () => {
      $('#mSvForm').addEventListener('submit', ev => {
        ev.preventDefault();
        Object.assign(s, { name: $('#mSvName').value.trim(), duration: $('#mSvDur').value.trim(), price: +$('#mSvPrice').value });
        save(); closeModal(); renderAll();
        toast('✅ Serviço atualizado!');
      });
    });
  }
  if (del && confirm('Excluir este serviço?')) {
    DB.services.splice(+del.dataset.del, 1);
    save(); renderAll();
  }
});
$('#newService').addEventListener('click', () => {
  openModal('Novo serviço', `
    <form id="mSvNew">
      <label>Nome<input type="text" id="mSvName" required placeholder="Ex: Hidratação"></label>
      <label>Duração<input type="text" id="mSvDur" required placeholder="Ex: 30 min"></label>
      <label>Preço (R$)<input type="number" id="mSvPrice" min="1" step="1" required></label>
      <button class="btn btn-gold btn-block" type="submit">Adicionar</button>
    </form>`, () => {
    $('#mSvNew').addEventListener('submit', ev => {
      ev.preventDefault();
      DB.services.push({ name: $('#mSvName').value.trim(), duration: $('#mSvDur').value.trim(), price: +$('#mSvPrice').value });
      save(); closeModal(); renderAll();
      toast('✅ Serviço adicionado!');
    });
  });
});

/* ================= FINANCEIRO ================= */
function renderFin() {
  const done = monthBookings();
  const revenue = done.reduce((s, b) => s + b.price, 0);
  const costs = DB.costs.reduce((s, c) => s + c.value, 0);
  const comm = DB.barbers.reduce((s, bar) => {
    const rev = done.filter(b => b.barber === bar.name).reduce((x, b) => x + b.price, 0);
    return s + rev * bar.comm / 100;
  }, 0);
  $('#finRevenue').textContent = BRL(revenue);
  $('#finCosts').textContent = BRL(costs);
  $('#finProfit').textContent = BRL(revenue - costs);
  $('#finProfit').style.color = revenue - costs >= 0 ? 'var(--green)' : 'var(--red)';
  $('#finComm').textContent = BRL(Math.round(comm));
  $('#costList').innerHTML = DB.costs.map((c, i) => `
    <li><span class="grow">${c.desc}</span><strong>${BRL(c.value)}</strong>
    <button class="btn btn-ghost btn-sm" data-cost="${i}">✕</button></li>`).join('');
  drawFinChart();
}
$('#costList').addEventListener('click', e => {
  const btn = e.target.closest('button[data-cost]');
  if (!btn) return;
  DB.costs.splice(+btn.dataset.cost, 1);
  save(); renderAll();
});
$('#costForm').addEventListener('submit', e => {
  e.preventDefault();
  DB.costs.push({ desc: $('#costDesc').value.trim(), value: +$('#costValue').value });
  $('#costDesc').value = ''; $('#costValue').value = '';
  save(); renderAll();
  toast('✅ Despesa adicionada!');
});
function drawFinChart() {
  const cv = $('#chartFin');
  if (!cv || !cv.clientWidth) return;
  const [ctx, W, H] = fitCanvas(cv);
  const data = DB.history;
  const max = Math.max(1, ...data.map(d => d.revenue));
  const gw = W / data.length, bw = Math.min(26, gw * 0.22);
  ctx.clearRect(0, 0, W, H);
  data.forEach((d, i) => {
    const cx = i * gw + gw / 2;
    const rh1 = ((H - 50) * d.revenue) / max, rh2 = ((H - 50) * d.costs) / max;
    ctx.fillStyle = '#C9A227';
    ctx.beginPath(); ctx.roundRect(cx - bw - 3, H - 26 - rh1, bw, rh1, 4); ctx.fill();
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath(); ctx.roundRect(cx + 3, H - 26 - rh2, bw, rh2, 4); ctx.fill();
    ctx.fillStyle = '#a7a7ad'; ctx.font = '600 11px Inter'; ctx.textAlign = 'center';
    ctx.fillText(d.month, cx, H - 8);
  });
  ctx.textAlign = 'left'; ctx.font = '600 11px Inter';
  ctx.fillStyle = '#C9A227'; ctx.fillText('■ receita', 8, 14);
  ctx.fillStyle = '#ff6b6b'; ctx.fillText('■ despesas', 90, 14);
}

/* ================= CONFIG ================= */
function renderConfig() {
  $('#cfgWa').value = DB.config.wa;
  $('#cfgOpen').value = DB.config.open;
  $('#cfgClose').value = DB.config.close;
  $('#cfgSat').value = DB.config.sat;
}
$('#cfgForm').addEventListener('submit', e => {
  e.preventDefault();
  DB.config = { wa: $('#cfgWa').value.trim(), open: $('#cfgOpen').value, close: $('#cfgClose').value, sat: $('#cfgSat').value };
  save();
  toast('✅ Configurações salvas!');
});
$('#resetDemo').addEventListener('click', () => {
  if (!confirm('Restaurar todos os dados de demonstração? Suas alterações serão perdidas.')) return;
  localStorage.removeItem(SITE_KEY);
  DB = seed(); save(); renderAll();
  toast('♻️ Dados de demonstração restaurados!');
});

/* ================= RENDER ================= */
function renderPage(p) {
  if (p === 'dashboard') renderDashboard();
  if (p === 'agendamentos') renderBookings();
  if (p === 'clientes') renderClients();
  if (p === 'equipe') renderTeam();
  if (p === 'servicos') renderServices();
  if (p === 'financeiro') renderFin();
  if (p === 'config') renderConfig();
}
function renderAll() {
  const active = ($('.side-nav button.active') || {}).dataset?.page || 'dashboard';
  renderDashboard(); renderBookings(); renderClients();
  renderTeam(); renderServices(); renderFin(); renderConfig();
  renderPage(active); // redesenha gráficos da página visível
}
addEventListener('resize', () => {
  clearTimeout(window._rz);
  window._rz = setTimeout(() => {
    const active = ($('.side-nav button.active') || {}).dataset?.page || 'dashboard';
    renderPage(active);
  }, 250);
});

/* ================= INIT ================= */
$('#todayLabel').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
load();
checkAuth();
