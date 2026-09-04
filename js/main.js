/* ===== CORTE NOBRE — main.js ===== */
'use strict';

const CONFIG = {
  whatsapp: '5511999999999', // <-- TROQUE pelo número real
  openHour: 9,
  closeHour: 20,      // seg-sex
  saturdayClose: 18,  // sábado
  slotMinutes: 30,
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- Preloader ---------- */
window.addEventListener('load', () => {
  setTimeout(() => $('#preloader').classList.add('done'), 700);
});
setTimeout(() => $('#preloader').classList.add('done'), 3500); // fallback

/* ---------- Header + menu mobile ---------- */
const header = $('#header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), { passive: true });

const burger = $('#burger'), nav = $('#nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
$$('#nav a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open'); burger.classList.remove('open');
}));

/* ---------- Hero slider ---------- */
(() => {
  const slides = $$('#heroSlides .hero-slide');
  const dotsBox = $('#heroDots');
  let i = 0, timer;
  slides.forEach((_, k) => {
    const d = document.createElement('button');
    d.setAttribute('aria-label', 'Ir para slide ' + (k + 1));
    d.addEventListener('click', () => go(k, true));
    dotsBox.appendChild(d);
  });
  const dots = $$('button', dotsBox);
  function go(k, manual = false) {
    slides[i].classList.remove('active'); dots[i].classList.remove('on');
    i = (k + slides.length) % slides.length;
    // reinicia animação ken burns
    const s = slides[i];
    s.style.animation = 'none'; void s.offsetWidth; s.style.animation = '';
    s.classList.add('active'); dots[i].classList.add('on');
    if (manual) restart();
  }
  function restart() { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); }
  $('#heroPrev').addEventListener('click', () => go(i - 1, true));
  $('#heroNext').addEventListener('click', () => go(i + 1, true));
  dots[0].classList.add('on');
  restart();
})();

/* ---------- Reveal on scroll ---------- */
(() => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));
})();

/* ---------- Contadores ---------- */
(() => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.target;
      const t0 = performance.now(), dur = 1400;
      (function tick(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.counter').forEach(el => io.observe(el));
})();

/* ---------- Comparador antes/depois ---------- */
(() => {
  const range = $('#compareRange');
  const before = $('#compareBefore');
  const handle = $('#compareHandle');
  if (!range) return;
  const set = v => { before.style.width = v + '%'; handle.style.left = v + '%'; };
  range.addEventListener('input', () => set(range.value));
  set(50);
})();

/* ---------- Lightbox ---------- */
(() => {
  const box = $('#lightbox'), img = $('#lightboxImg');
  $$('.g-item img').forEach(pic => pic.addEventListener('click', () => {
    img.src = pic.src.replace('w=800', 'w=1400');
    box.classList.add('open'); box.setAttribute('aria-hidden', 'false');
  }));
  const close = () => { box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); };
  $('#lightboxClose').addEventListener('click', close);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ---------- Carrossel depoimentos ---------- */
(() => {
  const track = $('#carouselTrack');
  const cards = $$('.t-card', track);
  const dotsBox = $('#tDots');
  let i = 0, timer;
  cards.forEach((_, k) => {
    const d = document.createElement('button');
    d.setAttribute('aria-label', 'Depoimento ' + (k + 1));
    d.addEventListener('click', () => go(k, true));
    dotsBox.appendChild(d);
  });
  const dots = $$('button', dotsBox);
  function go(k, manual = false) {
    i = (k + cards.length) % cards.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
    if (manual) restart();
  }
  function restart() { clearInterval(timer); timer = setInterval(() => go(i + 1), 5000); }
  $('#tPrev').addEventListener('click', () => go(i - 1, true));
  $('#tNext').addEventListener('click', () => go(i + 1, true));
  // swipe
  let x0 = null;
  track.addEventListener('touchstart', e => (x0 = e.touches[0].clientX), { passive: true });
  track.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), true);
    x0 = null;
  }, { passive: true });
  go(0); restart();
})();

/* ---------- Atalhos: serviço / barbeiro -> form ---------- */
$$('.book-service').forEach(btn => btn.addEventListener('click', () => {
  const svc = btn.closest('[data-service]').dataset.service;
  const sel = $('#fService');
  [...sel.options].forEach(o => { if (o.text.startsWith(svc)) sel.value = o.text; });
  $('#agendar').scrollIntoView({ behavior: 'smooth' });
  toast(`"${svc}" selecionado — complete seus dados 👇`);
}));
$$('.book-barber').forEach(btn => btn.addEventListener('click', () => {
  $('#fBarber').value = btn.closest('[data-barber]').dataset.barber;
  $('#agendar').scrollIntoView({ behavior: 'smooth' });
  toast(`Barbeiro selecionado — escolha data e hora 👇`);
}));

/* ---------- Agendamento ---------- */
const fDate = $('#fDate'), fTime = $('#fTime'), formError = $('#formError');

(function initDate() {
  const today = new Date();
  const iso = d => d.toISOString().split('T')[0];
  fDate.min = iso(today);
  const max = new Date(today); max.setDate(max.getDate() + 30);
  fDate.max = iso(max);
})();

fDate.addEventListener('change', () => {
  formError.textContent = '';
  fTime.innerHTML = '<option value="">Selecione…</option>';
  if (!fDate.value) { fTime.innerHTML = '<option value="">Selecione a data primeiro…</option>'; return; }
  const d = new Date(fDate.value + 'T12:00:00');
  if (d.getDay() === 0) { formError.textContent = 'Fechamos aos domingos. Escolha outro dia.'; return; }
  const close = d.getDay() === 6 ? CONFIG.saturdayClose : CONFIG.closeHour;
  const now = new Date();
  const isToday = fDate.value === now.toISOString().split('T')[0];
  for (let h = CONFIG.openHour; h < close; h++) {
    for (const m of [0, CONFIG.slotMinutes]) {
      if (isToday) {
        const slot = new Date(); slot.setHours(h, m, 0, 0);
        if (slot <= new Date(now.getTime() + 30 * 60000)) continue;
      }
      const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      fTime.insertAdjacentHTML('beforeend', `<option>${label}</option>`);
    }
  }
  if (fTime.options.length === 1) formError.textContent = 'Sem horários livres neste dia. Tente outra data.';
});

$('#bookingForm').addEventListener('submit', e => {
  e.preventDefault();
  formError.textContent = '';
  const name = $('#fName').value.trim();
  const phone = $('#fPhone').value.trim();
  const service = $('#fService').value;
  const barber = $('#fBarber').value || 'Tanto faz';
  const notes = $('#fNotes').value.trim();

  if (name.length < 3) return fail('Informe seu nome completo.');
  if (phone.replace(/\D/g, '').length < 10) return fail('Informe um WhatsApp válido com DDD.');
  if (!service) return fail('Escolha um serviço.');
  if (!fDate.value) return fail('Escolha a data.');
  if (new Date(fDate.value + 'T12:00:00').getDay() === 0) return fail('Fechamos aos domingos.');
  if (new Date(fDate.value) < new Date(new Date().toISOString().split('T')[0])) return fail('A data não pode ser no passado.');
  if (!fTime.value) return fail('Escolha um horário.');

  const dateBR = new Date(fDate.value + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
  const msg =
`💈 *CORTE NOBRE — Novo agendamento*
--------------------------
👤 Nome: ${name}
📱 Tel: ${phone}
✂ Serviço: ${service}
🧔 Barbeiro: ${barber}
📅 Data: ${dateBR}
⏰ Hora: ${fTime.value}` + (notes ? `\n📝 Obs: ${notes}` : '') +
`\n--------------------------\nAguardo confirmação!`;

  const box = $('#bookingSummary');
  box.hidden = false;
  box.innerHTML = `<strong>Resumo:</strong> ${service} · ${dateBR} às ${fTime.value} · com ${barber}.<br>Abrindo o WhatsApp…`;
  toast('Abrindo o WhatsApp com sua mensagem pronta ✅');
  setTimeout(() => {
    open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  }, 600);
});

function fail(m) { formError.textContent = m; return false; }

/* ---------- Toast ---------- */
let toastTimer;
function toast(m) {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
