/* =========================================================
   CONFIG — edita aquí tus datos. Todo lo demás se adapta solo.
   ========================================================= */
const CONFIG = {
  github: 's0k1x',
  email: 'hola@s0k1x.dev', // ← cambia por tu email real
  status: 'Disponible para proyectos',
  sub: 'Desarrollador y creador. Diseño y programo productos digitales limpios, rápidos y con algo de personalidad.',
  rotator: ['webs', 'herramientas', 'skills para IA', 'automatizaciones', 'cosas guapas'],
  marquee: ['Diseño', 'Desarrollo web', 'IA & agentes', 'Automatización', 'UI minimal', 'Open source'],
  about: [
    'Soy s0k1x. Me paso el día construyendo cosas en internet: webs, herramientas y kits de skills para trabajar con IA.',
    'Me obsesiona que las cosas sean simples por fuera y sólidas por dentro. Si algo se puede quitar, lo quito.',
    'Cuando no estoy programando, probablemente estoy pensando en el próximo proyecto (o haciéndome una foto en el espejo).',
  ],
  stats: [
    { n: '35+', t: 'skills creadas' },
    { n: '∞', t: 'cafés' },
    { n: '24/7', t: 'aprendiendo' },
    { n: '1', t: 'mini-yo animado' },
  ],
  stack: ['JavaScript', 'TypeScript', 'HTML & CSS', 'React', 'Node.js', 'Python', 'Claude & IA', 'Supabase', 'Cloudflare', 'Git', 'Figma'],
  socials: [
    { label: 'GitHub', url: 'https://github.com/s0k1x' },
    // { label: 'Instagram', url: 'https://instagram.com/...' },
    // { label: 'X / Twitter', url: 'https://x.com/...' },
    // { label: 'LinkedIn', url: 'https://linkedin.com/in/...' },
  ],
  // Proyectos destacados (aparecen primero). El resto se cargan solos desde GitHub.
  featured: [
    {
      name: 's0k1x-skill',
      desc: 'Kit unificado de 35 skills y 3 agentes para Claude Code: diseño, escritura, tokens e ingeniería, todo coordinado.',
      tag: 'Destacado',
      lang: 'Markdown',
      url: 'https://github.com/s0k1x/s0k1x-skill',
      quip: 'Mi niño mimado. 35 skills, cero descanso.',
    },
    {
      name: 'S0k1x-WEB',
      desc: 'Esta misma web. Con un mini-yo que hace tonterías.',
      tag: 'Web',
      lang: 'JavaScript',
      url: 'https://github.com/s0k1x/S0k1x-WEB',
      quip: '¡Eh! Que esa soy yo… bueno, mi casa.',
    },
  ],
};

/* ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

/* ---------- Contenido ---------- */
$('#statusText').textContent = CONFIG.status;
$('#heroSub').textContent = CONFIG.sub;
$('#year').textContent = new Date().getFullYear();
$('#ghAll').href = `https://github.com/${CONFIG.github}`;
$('#aboutBody').innerHTML = CONFIG.about.map((p) => `<p>${p}</p>`).join('');
$('#stats').innerHTML = CONFIG.stats.map((s) => `<div class="stat reveal"><b>${s.n}</b><span>${s.t}</span></div>`).join('');
$('#chips').innerHTML = CONFIG.stack.map((s) => `<li>${s}</li>`).join('');
$('#socials').innerHTML = CONFIG.socials.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.label} <span aria-hidden="true">↗</span></a></li>`).join('');
$('#emailText').textContent = CONFIG.email;
const mq = CONFIG.marquee.map((w) => `<span>${w}</span>`).join('');
$('#marquee').innerHTML = mq + mq;

/* ---------- Rotador ---------- */
(async function rotate() {
  const el = $('#rotator');
  let i = 0;
  if (reduced) return;
  while (true) {
    await sleep(2200);
    const word = el.textContent;
    for (let k = word.length; k >= 0; k--) { el.textContent = word.slice(0, k); await sleep(35); }
    i = (i + 1) % CONFIG.rotator.length;
    const next = CONFIG.rotator[i];
    for (let k = 1; k <= next.length; k++) { el.textContent = next.slice(0, k); await sleep(60); }
  }
})();

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12 });
const observeReveals = () => document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
observeReveals();

/* =========================================================
   mini-s0k1x
   ========================================================= */
const buddy = $('#buddy');
const svg = $('#buddySvg');
const bubble = $('#bubble');
const bubbleText = $('#bubbleText');
const mouth = $('#mouth');
const eyes = $('#eyes');
const pupils = $('#pupils');
const face = $('#face');
const hair = $('#hair');
const head = $('#head');
const browL = $('#browL');
const browR = $('#browR');
const brows = $('#brows');

const MOUTH = {
  smile: 'M106 169 Q120 182 134 169',
  grin: 'M104 166 Q120 194 136 166 Z',
  neutral: 'M110 172 Q120 175 130 172',
  o: 'M114 172 Q114 164 120 164 Q126 164 126 172 Q126 180 120 180 Q114 180 114 172 Z',
  flat: 'M112 173 L128 173',
  smirk: 'M108 172 Q122 176 134 166',
};
const BROWS = {
  normal: ['M86 110 Q99 103 112 109', 'M128 109 Q141 103 154 110'],
  up: ['M86 103 Q99 95 112 102', 'M128 102 Q141 95 154 103'],
  angry: ['M88 104 Q100 106 112 113', 'M128 113 Q140 106 152 104'],
  sad: ['M88 111 Q100 103 112 104', 'M128 104 Q140 103 152 111'],
  sus: ['M86 110 Q99 103 112 109', 'M128 104 Q141 98 154 104'],
};
function setMouth(k) {
  mouth.setAttribute('d', MOUTH[k]);
  mouth.classList.toggle('open', k === 'grin' || k === 'o');
}
function setBrows(k) {
  browL.setAttribute('d', BROWS[k][0]);
  browR.setAttribute('d', BROWS[k][1]);
}
function face_(m, b = 'normal') { setMouth(m); setBrows(b); }

/* hablar */
let talkToken = 0;
async function say(text, ms = 3200, mood = 'smile') {
  const token = ++talkToken;
  bubble.classList.add('show');
  bubbleText.textContent = '';
  for (let i = 0; i < text.length; i++) {
    if (token !== talkToken) return;
    bubbleText.textContent += text[i];
    if (!reduced && i % 2 === 0) setMouth(i % 4 === 0 ? 'o' : mood);
    await sleep(reduced ? 0 : 22);
  }
  setMouth(mood);
  await sleep(ms);
  if (token === talkToken) { bubble.classList.remove('show'); if (!busy) face_('smile'); }
}

/* mirar */
let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
let lookTarget = null;
let lookUntil = 0;
addEventListener('pointermove', (e) => { mouse = { x: e.clientX, y: e.clientY }; poke(); }, { passive: true });

function lookLoop() {
  const r = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const s = r.width / vb.width;
  let tx = mouse.x, ty = mouse.y;
  if (lookTarget && performance.now() < lookUntil) {
    const t = lookTarget.getBoundingClientRect();
    tx = t.left + t.width / 2; ty = t.top + t.height / 2;
  }
  const cx = r.left + (120 - vb.x) * s, cy = r.top + (133 - vb.y) * s;
  const dx = tx - cx, dy = ty - cy;
  const d = Math.hypot(dx, dy) || 1;
  const k = Math.min(1, d / 400);
  const ux = (dx / d) * k, uy = (dy / d) * k;
  if (!sleeping) {
    pupils.style.transform = `translate(${ux * 4.5}px, ${uy * 4.5}px)`;
    face.style.transform = brows.style.transform = `translate(${ux * 6}px, ${uy * 4}px)`;
    hair.style.transform = `translate(${ux * 2.5}px, ${uy * 1.5}px)`;
    head.style.transform = `rotate(${ux * 4}deg)`;
  }
  requestAnimationFrame(lookLoop);
}
requestAnimationFrame(lookLoop);
function lookAt(el, ms = 1600) { lookTarget = el; lookUntil = performance.now() + ms; }

/* parpadeo */
(async function blinkLoop() {
  while (true) {
    await sleep(2200 + Math.random() * 3200);
    if (sleeping) continue;
    eyes.classList.add('blink');
    await sleep(120);
    eyes.classList.remove('blink');
    if (Math.random() < 0.2) { await sleep(160); eyes.classList.add('blink'); await sleep(110); eyes.classList.remove('blink'); }
  }
})();

/* trucos */
let busy = false;
async function act(cls, ms) {
  busy = true;
  buddy.classList.remove('waving', 'jump', 'spin', 'dance', 'selfie', 'shake');
  void buddy.offsetWidth;
  buddy.classList.add(cls);
  await sleep(reduced ? 300 : ms);
  buddy.classList.remove(cls);
  busy = false;
}
const tricks = [
  async () => { face_('grin', 'up'); say(pick(['¡Hola hola! 👋', '¡Ey! ¿Qué tal?', 'Yo saludo, tú haces scroll.'])); await act('waving', 1900); },
  async () => { face_('grin', 'up'); say(pick(['¡Boing!', '¡Salto de calidad!', 'Hoy he desayunado fuerte.'])); await act('jump', 750); },
  async () => { face_('o', 'up'); say(pick(['Wiiiiii', 'Me estoy mareando…', 'Vuelta de 360 grados, como mis proyectos.'])); await act('spin', 950); face_('smile'); },
  async () => {
    face_('smirk', 'sus'); say('Un momento… foto para Insta.', 1800, 'smirk');
    busy = true; buddy.classList.add('selfie'); await sleep(900);
    const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    await sleep(700); buddy.classList.remove('selfie'); busy = false; face_('grin', 'up'); say('Salgo guapo, ¿eh?');
  },
  async () => { face_('grin', 'up'); say(pick(['🎶 tunts tunts tunts', 'Paso prohibido nº 7', 'No me mires mientras bailo.'])); await act('dance', 3000); face_('smile'); },
  async () => { face_('smirk', 'sus'); say(pick(JOKES), 4200, 'smirk'); },
];
const JOKES = [
  '¿Por qué los devs confunden Halloween y Navidad? Porque OCT 31 = DEC 25.',
  'Funciona en mi máquina. Pues mandamos tu máquina.',
  'Tengo 99 problemas y 98 son de CSS.',
  'Un bug es una feature sin documentar.',
  'git commit -m "arreglado (creo)"',
  'Minimalista: tengo la nevera igual.',
];
let trickIdx = 0;
async function doTrick() {
  if (busy) return;
  if (sleeping) return wake();
  await tricks[trickIdx++ % tricks.length]();
}
buddy.addEventListener('click', doTrick);
buddy.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doTrick(); } });

/* dormir si no haces nada */
let sleeping = false;
let idleTimer;
function poke() {
  clearTimeout(idleTimer);
  if (sleeping) wake();
  idleTimer = setTimeout(goSleep, 22000);
}
function goSleep() {
  if (busy) return poke();
  sleeping = true;
  talkToken++; bubble.classList.remove('show');
  buddy.classList.add('sleep');
  face_('flat', 'normal');
  pupils.style.transform = face.style.transform = brows.style.transform = '';
}
function wake() {
  if (!sleeping) return;
  sleeping = false;
  buddy.classList.remove('sleep');
  face_('o', 'up');
  act('shake', 400);
  say(pick(['¡Estaba despierto! Lo juro.', '¡Ah! ¿Qué? ¿Quién?', 'Solo descansaba los ojos…']), 2400, 'o');
}
addEventListener('scroll', () => poke(), { passive: true });
addEventListener('keydown', () => poke());
poke();

/* acoplar en la esquina al bajar */
const slot = $('#buddySlot');
new IntersectionObserver(([e]) => {
  const dock = !e.isIntersecting;
  if (dock === buddy.classList.contains('is-docked')) return;
  buddy.classList.toggle('is-docked', dock);
  svg.setAttribute('viewBox', dock ? '30 26 180 236' : '0 0 240 300');
  if (dock && !sessionDocked) { sessionDocked = true; setTimeout(() => say('Te acompaño por aquí abajo 👇', 2600), 500); }
}, { threshold: 0.15 }).observe(slot);
let sessionDocked = false;

/* comentarios por sección */
const SECTION_LINES = {
  sobre: ['Esto va sobre mí. Bueno, sobre el grande.', 'Spoiler: me gusta programar.'],
  proyectos: ['¡Mis proyectos! Pasa el ratón por encima.', 'Cada uno tiene su historia…'],
  stack: ['Mis herramientas favoritas 🛠️', 'Sí, también uso Ctrl+C Ctrl+V.'],
  contacto: ['¡Escríbeme! Contesto rápido.', 'No muerdo. Bueno, solo bugs.'],
};
const seen = new Set();
const sio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting || seen.has(e.target.id)) return;
  seen.add(e.target.id);
  if (buddy.classList.contains('is-docked') && !sleeping) say(pick(SECTION_LINES[e.target.id]));
}), { threshold: 0.45 });
Object.keys(SECTION_LINES).forEach((id) => sio.observe(document.getElementById(id)));

/* saludo inicial */
setTimeout(async () => {
  face_('grin', 'up');
  act('waving', 1900);
  await say('¡Hola! Soy mini-s0k1x 👋', 1400, 'grin');
  await sleep(300);
  if (!buddy.classList.contains('is-docked')) say('Te enseño la web. Haz clic en mí si te aburres.', 3000);
}, 900);

/* volver a la pestaña */
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (Date.now() - hiddenAt > 6000) { face_('grin', 'up'); say(pick(['¡Has vuelto! Te echaba de menos.', '¿Dónde estabas? Yo aquí, esperando.'])); }
});

/* =========================================================
   Tema
   ========================================================= */
$('#themeToggle').addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const next = isDark ? 'light' : 'dark';
  root.dataset.theme = next;
  store.set('theme', next);
  face_(next === 'dark' ? 'o' : 'grin', 'up');
  say(next === 'dark' ? pick(['¿Quién ha apagado la luz?', 'Modo oscuro: modo hacker activado.']) : pick(['¡Mis ojos! 😵', 'Buenos días, sol.']));
});

/* =========================================================
   Proyectos (GitHub)
   ========================================================= */
const LANG_COLORS = {
  JavaScript: '#F1E05A', TypeScript: '#3178C6', Python: '#3572A5', HTML: '#E34C26', CSS: '#663399',
  Shell: '#89E051', Go: '#00ADD8', Rust: '#DEA584', Java: '#B07219', 'C++': '#F34B7D', C: '#555555',
  Vue: '#41B883', Svelte: '#FF3E00', Markdown: '#FFD23F', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF',
};
const QUIPS = [
  'Este me costó tres cafés.', 'Aquí hubo un bug enorme. Ya no.', 'Lo hice un domingo por la tarde.',
  'De este estoy bastante orgulloso.', 'Abre y dale una estrella ⭐', 'Commit a commit se hace camino.',
];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function card(p, featured) {
  const a = document.createElement('a');
  a.className = `project reveal${featured ? ' featured' : ''}`;
  a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
  const color = LANG_COLORS[p.lang] || '#BDBDBD';
  a.innerHTML = `
    <div class="p-top"><span class="p-tag">${esc(p.tag || 'Repo')}</span><span class="p-arrow" aria-hidden="true">↗</span></div>
    <h3 class="p-name">${esc(p.name)}</h3>
    <p class="p-desc">${esc(p.desc || 'Sin descripción (todavía).')}</p>
    <div class="p-meta">
      ${p.lang ? `<span><i class="lang-dot" style="background:${color}"></i>${esc(p.lang)}</span>` : ''}
      ${p.stars != null ? `<span>★ ${p.stars}</span>` : ''}
      ${p.updated ? `<span>${p.updated}</span>` : ''}
    </div>`;
  const quip = p.quip || pick(QUIPS);
  let t;
  a.addEventListener('pointerenter', () => {
    clearTimeout(t);
    t = setTimeout(() => { lookAt(a, 2200); if (!busy && !sleeping) say(quip, 2000); }, 220);
  });
  a.addEventListener('pointerleave', () => clearTimeout(t));
  return a;
}

async function loadProjects() {
  const wrap = $('#projects');
  const featuredNames = new Set(CONFIG.featured.map((f) => f.name.toLowerCase()));
  let repos = [];
  try {
    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('repos') || 'null'); } catch {}
    if (cached) repos = cached;
    else {
      const res = await fetch(`https://api.github.com/users/${CONFIG.github}/repos?per_page=100&sort=updated`);
      if (!res.ok) throw new Error(res.status);
      repos = await res.json();
      try { sessionStorage.setItem('repos', JSON.stringify(repos)); } catch {}
    }
  } catch (e) { repos = []; }

  const byName = Object.fromEntries(repos.map((r) => [r.name.toLowerCase(), r]));
  const fmt = (d) => new Date(d).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

  const featured = CONFIG.featured.map((f) => {
    const r = byName[f.name.toLowerCase()];
    return { ...f, stars: r?.stargazers_count, updated: r ? fmt(r.pushed_at) : null, desc: f.desc || r?.description };
  });
  const others = repos
    .filter((r) => !r.fork && !featuredNames.has(r.name.toLowerCase()) && r.name.toLowerCase() !== CONFIG.github.toLowerCase())
    .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 7)
    .map((r) => ({
      name: r.name, desc: r.description, lang: r.language, url: r.html_url,
      stars: r.stargazers_count, updated: fmt(r.pushed_at), tag: r.homepage ? 'Live' : 'Repo',
    }));

  wrap.innerHTML = '';
  featured.forEach((p, i) => wrap.appendChild(card(p, i === 0)));
  others.forEach((p) => wrap.appendChild(card(p, false)));
  observeReveals();
}
loadProjects();

/* =========================================================
   Email
   ========================================================= */
$('#emailBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(CONFIG.email); }
  catch {
    const ta = document.createElement('textarea'); ta.value = CONFIG.email; document.body.appendChild(ta);
    ta.select(); try { document.execCommand('copy'); } catch {} ta.remove();
  }
  $('#copyLabel').textContent = '¡copiado!';
  setTimeout(() => ($('#copyLabel').textContent = 'copiar'), 1800);
  face_('grin', 'up'); act('jump', 750); say('¡Copiado! Te espero en el correo 📬');
});

/* =========================================================
   Easter eggs: escribe "s0k1x" o el código Konami
   ========================================================= */
let typed = '';
const KONAMI = 'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba';
let keys = '';
addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return;
  typed = (typed + e.key).slice(-5).toLowerCase();
  keys = (keys + e.key).slice(-KONAMI.length);
  if (typed === 's0k1x' || keys === KONAMI) party();
});
function party() {
  typed = ''; keys = '';
  face_('grin', 'up');
  say('¡¡FIESTAAA!! 🎉 Me has encontrado.', 3000, 'grin');
  act('dance', 3000);
  if (reduced) return;
  const colors = ['#FFD23F', '#6B4EFF', '#2BD46B', '#FF5C8A', '#4CC9F0', '#FFFFFF'];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = pick(colors);
    c.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
    c.style.setProperty('--r', (Math.random() * 1080 - 540) + 'deg');
    c.style.animationDuration = 1.8 + Math.random() * 2 + 's';
    c.style.animationDelay = Math.random() * 0.4 + 's';
    if (Math.random() > 0.5) c.style.borderRadius = '50%';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4500);
  }
}
