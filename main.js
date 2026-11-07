/* =========================================================
   CONFIG: edita aquí tus datos
   ========================================================= */
const CONFIG = {
  github: 's0k1x',
  email: 'hola@s0k1x.example', // ← pon tu email real (y en index.html)
  // Descripción, frase del avatar o web propia para repos concretos (opcional)
  notes: {
    's0k1x-skill': { desc: 'Kit de 35 skills y 3 agentes para Claude Code: diseño web, escritura, ahorro de tokens e ingeniería, coordinados entre sí.', say: 'Mi niño mimado. Lo uso todos los días.' },
    'S0k1x-WEB': { desc: 'Esta web. HTML, CSS y JavaScript sin dependencias, con mi avatar dentro.', say: 'Estás dentro de este proyecto ahora mismo.' },
  },
  hidden: [], // repos que no quieres mostrar
  // Copia por si la API de GitHub falla o llega al límite
  fallback: [
    ['s0k1x-skill', 'Python'], ['S0k1x-WEB', 'JavaScript'], ['Aura-X', 'JavaScript'], ['Roblox-automatico', 'Python'],
    ['prueba-repositorio-airama', 'JavaScript'], ['aurevixweb-web', 'HTML'], ['s0k1x-toolkit-kali-linux', null], ['kreskolab', 'CSS'],
    ['Malaga-reventa', null], ['PEQUE-m', null], ['IA-PRUEBA', null], ['fran-taser', null], ['anita_repositorio', null],
  ],
};

let REPOS = [];
const repoCount = () => (REPOS.length || CONFIG.fallback.length);
const $ = (s, el = document) => el.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hash = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const rng = (seed) => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/* =========================================================
   Avatar en línea fina
   ========================================================= */
const HAIR = [[63, 74, 12], [68, 57, 14], [83, 45, 16], [101, 39, 17], [119, 43, 16], [133, 55, 14], [138, 73, 11], [79, 64, 12], [97, 59, 13], [115, 59, 13], [127, 67, 11], [104, 70, 6]];
const MOUTH = { smile: 'M92 124 Q100 130 108 124', happy: 'M90 122 Q100 134 110 122', o: 'M96 125 a4 4.5 0 1 0 8 0 a4 4.5 0 1 0 -8 0', flat: 'M93 126 L107 126' };
const avatars = [];

function avatar(host, { ink = '#efefef', paper = '#161617', acc = '#ff7a45', sw = 2.6, hand = false } = {}) {
  host.innerHTML = `<svg class="av" viewBox="0 0 200 220" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M14 224 C18 182 58 166 100 166 C142 166 182 182 186 224 Z" fill="${ink}"/>
  <path d="M46 184 L40 200 M154 184 L160 200" stroke="${acc}" stroke-width="${sw + .6}"/>
  <g class="av-head">
   <path d="M86 136 L86 168 L114 168 L114 136" fill="${paper}"/>
   <path d="M84 166 Q100 182 116 166" fill="${paper}"/>
   <path d="M58 98 C48 94 47 112 59 114 M142 98 C152 94 153 112 141 114" fill="${paper}"/>
   <path d="M58 92 C58 56 78 40 100 40 C124 40 142 56 142 92 C142 124 124 146 100 146 C76 146 58 124 58 92 Z" fill="${paper}"/>
   <g fill="${ink}" stroke="none">${HAIR.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
   <path d="M78 52 q5 -4 10 0 M104 46 q5 -4 10 0 M120 58 q4 -3 8 1" stroke="${paper}" stroke-width="2" opacity=".6"/>
   <g class="av-eyes" fill="${ink}" stroke="none"><circle cx="83" cy="96" r="3.2"/><circle cx="117" cy="96" r="3.2"/></g>
   <path class="av-lids" d="M79 97 Q83 99 87 97 M113 97 Q117 99 121 97"/>
   <rect x="69" y="84" width="27" height="21" rx="5"/><rect x="104" y="84" width="27" height="21" rx="5"/>
   <path d="M96 92 Q100 89 104 92 M69 90 L58 89 M131 90 L142 89"/>
   <g class="av-brows"><path d="M72 78 Q82 74 92 77 M108 77 Q118 74 128 78" stroke-width="${sw + 1}"/></g>
   <path d="M101 102 Q104 112 97 114" stroke-width="${sw - .6}"/>
   <path class="av-mouth" d="${MOUTH.smile}"/>
  </g>
  ${hand ? `<g class="av-hand"><rect x="154" y="200" width="24" height="26" fill="${paper}"/>
   <rect x="151" y="148" width="8" height="36" rx="4" fill="${paper}"/><rect x="160" y="143" width="8" height="40" rx="4" fill="${paper}"/>
   <rect x="169" y="146" width="8" height="38" rx="4" fill="${paper}"/><rect x="178" y="153" width="7" height="32" rx="3.5" fill="${paper}"/>
   <rect x="139" y="178" width="8" height="26" rx="4" transform="rotate(-38 143 191)" fill="${paper}"/>
   <rect x="150" y="174" width="35" height="34" rx="11" fill="${paper}"/></g>` : ''}
 </svg>`;
  const svg = $('svg', host);
  const a = { host, svg, eyes: $('.av-eyes', svg), head: $('.av-head', svg), mouth: $('.av-mouth', svg) };
  a.mood = (m) => { a.mouth.setAttribute('d', MOUTH[m] || MOUTH.smile); svg.classList.toggle('happy', m === 'happy' || m === 'o'); };
  avatars.push(a);
  return a;
}

// ojos que siguen al cursor
const pointer = { x: innerWidth * .4, y: innerHeight * .3 };
addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
(function look() {
  for (const a of avatars) {
    const r = a.svg.getBoundingClientRect();
    if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
    const s = r.width / 200, dx = pointer.x - (r.left + 100 * s), dy = pointer.y - (r.top + 96 * s);
    const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 500);
    a.eyes.style.transform = `translate(${(dx / d) * k * 3.2}px, ${(dy / d) * k * 2.4}px)`;
    a.head.style.transform = `rotate(${(dx / d) * k * 2.5}deg)`;
  }
  requestAnimationFrame(look);
})();
// parpadeo cada 4,5 s
if (!reduced) setInterval(() => avatars.forEach((a) => { a.svg.classList.add('blink'); setTimeout(() => a.svg.classList.remove('blink'), 140); }), 4500);

/* =========================================================
   Hero: avatar + terminal
   ========================================================= */
const hero = avatar($('#heroAvatar'), { hand: true });
const termCmd = $('#termCmd'), termOut = $('#termOut');
let termBusy = false, termQueue = null;
async function type(cmd, out) {
  termBusy = true;
  termCmd.textContent = ''; termOut.innerHTML = '&nbsp;';
  for (const ch of cmd) { termCmd.textContent += ch; await sleep(reduced ? 0 : 42); }
  await sleep(reduced ? 0 : 260);
  termOut.textContent = out;
  termBusy = false;
}
const LINES = [
  () => ['ls proyectos | wc -l', `→ ${repoCount()} repositorios públicos en GitHub`],
  () => ['whoami', '→ s0k1x · desarrollador de webs y herramientas para IA'],
  () => ['cat ahora.txt', '→ mejorando s0k1x-skill (35 skills, 3 agentes)'],
];
let li = 0;
(async function termLoop() {
  while (true) {
    if (termQueue) { const q = termQueue; termQueue = null; await type(...q); await sleep(2600); continue; }
    await type(...LINES[li++ % LINES.length]());
    await sleep(reduced ? 8000 : 3400);
  }
})();

const heroCard = $('#heroCard');
heroCard.addEventListener('pointerenter', () => hero.mood('happy'));
heroCard.addEventListener('pointerleave', () => hero.mood('smile'));
async function greet() {
  if (hero.svg.classList.contains('wave')) return;
  hero.mood('happy');
  hero.svg.classList.add('wave');
  termQueue = ['echo "hola"', '→ ¡Hola! Gracias por pasarte. Mira mis proyectos abajo.'];
  await sleep(1900);
  hero.svg.classList.remove('wave');
}
$('#heroAvatar').addEventListener('click', greet);
$('#heroAvatar').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); greet(); } });

/* =========================================================
   Proyectos: lista + panel, cada repo con su portada propia
   ========================================================= */
const LANG = { JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5', HTML: '#e34c26', CSS: '#e06b3c', Shell: '#89e051', Go: '#00add8', Rust: '#dea584' };
const HUES = ['#ff7a45', '#e5484d', '#30a46c', '#0091ff', '#f5a524', '#12a594', '#ff6b9a', '#7fc8ff', '#c9e85a'];
const SAYS = ['Este me costó tres cafés.', 'Aquí aprendí un montón.', 'De este estoy bastante orgulloso.', 'Hecho un domingo por la tarde.', 'Funciona. No preguntes cómo.', 'Ábrelo y dale una estrella.'];
let sel = 0;

function coverSVG(name) {
  const r = rng(hash(name)), c = HUES[hash(name) % HUES.length], W = 800, H = 320, kind = hash(name + '#') % 6;
  let s = `<rect width="${W}" height="${H}" fill="#0e0e0f"/><radialGradient id="g${hash(name)}" cx="${30 + r() * 40}%" cy="${30 + r() * 40}%" r="70%"><stop offset="0" stop-color="${c}" stop-opacity=".28"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient><rect width="${W}" height="${H}" fill="url(#g${hash(name)})"/>`;
  const st = (o, w = 1.2) => `stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" fill="none"`;
  if (kind === 0) { // curvas de nivel
    const cx = 200 + r() * 400, cy = 80 + r() * 160;
    for (let i = 1; i < 16; i++) { let d = ''; for (let a = 0; a <= 64; a++) { const t = a / 64 * Math.PI * 2, rr = i * 22 * (1 + .18 * Math.sin(t * 3 + i * .4 + r())); d += `${a ? 'L' : 'M'}${(cx + Math.cos(t) * rr * 1.5).toFixed(1)} ${(cy + Math.sin(t) * rr).toFixed(1)}`; } s += `<path d="${d}Z" ${st(.55 - i * .028)}/>`; }
  } else if (kind === 1) { // rejilla de puntos en onda
    const f = 1 + r() * 2, ph = r() * 6;
    for (let x = 20; x < W; x += 22) for (let y = 20; y < H; y += 22) { const v = (Math.sin(x / 90 * f + ph) + Math.cos(y / 60 + x / 200)) / 2; s += `<circle cx="${x}" cy="${y}" r="${(1 + Math.max(0, v) * 3.2).toFixed(2)}" fill="${c}" fill-opacity="${(.15 + Math.max(0, v) * .7).toFixed(2)}"/>`; }
  } else if (kind === 2) { // barras tipo onda
    const n = 64, bw = W / n;
    for (let i = 0; i < n; i++) { const h = 20 + Math.abs(Math.sin(i * .21 + r() * .6) * Math.cos(i * .05)) * 220 * (.4 + r() * .6); s += `<rect x="${i * bw + 2}" y="${(H - h) / 2}" width="${bw - 5}" height="${h}" rx="3" fill="${c}" fill-opacity="${(.18 + h / 340).toFixed(2)}"/>`; }
  } else if (kind === 3) { // órbitas
    const cx = W / 2 + (r() - .5) * 200, cy = H / 2;
    for (let i = 0; i < 7; i++) s += `<ellipse cx="${cx}" cy="${cy}" rx="${60 + i * 52}" ry="${22 + i * 19}" transform="rotate(${-12 + r() * 8} ${cx} ${cy})" ${st(.6 - i * .07)}/>`;
    for (let i = 0; i < 7; i++) { const a = r() * Math.PI * 2; s += `<circle cx="${cx + Math.cos(a) * (60 + i * 52)}" cy="${cy + Math.sin(a) * (22 + i * 19)}" r="${3 + r() * 4}" fill="${c}"/>`; }
    s += `<circle cx="${cx}" cy="${cy}" r="18" fill="${c}"/>`;
  } else if (kind === 4) { // isométrica
    for (let x = -H; x < W + H; x += 34) s += `<path d="M${x} 0 L${x + H * .58} ${H} M${x} 0 L${x - H * .58} ${H}" ${st(.16)}/>`;
    for (let i = 0; i < 5; i++) { const x = 100 + r() * 600, y = 60 + r() * 200, z = 26 + r() * 30; s += `<path d="M${x} ${y - z} L${x + z * 1.7} ${y} L${x} ${y + z} L${x - z * 1.7} ${y} Z" fill="${c}" fill-opacity="${(.15 + r() * .5).toFixed(2)}" ${st(.8)}/>`; }
  } else { // flujo de líneas
    for (let i = 0; i < 26; i++) { const y0 = i * 13 + 10, a = 20 + r() * 50, f = .006 + r() * .006; let d = `M0 ${y0}`; for (let x = 0; x <= W; x += 20) d += ` L${x} ${(y0 + Math.sin(x * f + i * .3) * a).toFixed(1)}`; s += `<path d="${d}" ${st(.12 + (i % 5) * .08, 1.4)}/>`; }
  }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${s}</svg>`;
}

async function getRepos() {
  try { const c = sessionStorage.getItem('repos2'); if (c) return JSON.parse(c); } catch {}
  const res = await fetch(`https://api.github.com/users/${CONFIG.github}/repos?per_page=100&sort=pushed`);
  if (!res.ok) throw new Error(res.status);
  const data = (await res.json()).filter((r) => !r.fork).map((r) => ({ name: r.name, lang: r.language, desc: r.description, url: r.html_url, home: r.homepage, stars: r.stargazers_count, pushed: r.pushed_at }));
  try { sessionStorage.setItem('repos2', JSON.stringify(data)); } catch {}
  return data;
}

const list = $('#repoList');
function renderList() {
  const hidden = new Set(CONFIG.hidden.map((n) => n.toLowerCase()));
  REPOS = REPOS.filter((r) => !hidden.has(r.name.toLowerCase()) && r.name.toLowerCase() !== CONFIG.github.toLowerCase());
  const pin = Object.keys(CONFIG.notes);
  REPOS.sort((a, b) => { const ia = pin.indexOf(a.name), ib = pin.indexOf(b.name); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
  $('#projSub').textContent = `${REPOS.length} repositorios públicos. Elige uno para ver de qué va.`;
  list.innerHTML = REPOS.map((r, i) => `<li><button class="repo" role="option" aria-selected="${i === sel}" data-i="${i}" style="--c:${HUES[hash(r.name) % HUES.length]}">
    <i class="repo__dot"></i><span class="repo__name">${esc(r.name)}</span><span class="repo__lang">${esc(r.lang || '')}</span></button></li>`).join('');
  list.querySelectorAll('.repo').forEach((b) => b.addEventListener('click', () => select(+b.dataset.i)));
  select(0, true);
}
list.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  select((sel + (e.key === 'ArrowDown' ? 1 : -1) + REPOS.length) % REPOS.length);
  list.querySelector(`[data-i="${sel}"]`).focus();
});

avatar($('#meAvatar'), { hand: true });
const sayAv = avatar($('#sayAv'), { sw: 3.2 });
const readmes = new Map();
function select(i, quiet) {
  sel = i;
  const r = REPOS[i];
  list.querySelectorAll('.repo').forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.i === i)));
  const note = CONFIG.notes[r.name] || {};
  $('#appPath').textContent = `~/s0k1x/${r.name}`;
  $('#repoCover').innerHTML = coverSVG(r.name);
  $('#repoName').textContent = r.name;
  $('#repoMeta').innerHTML = [r.lang && `<span><i class="repo__dot" style="--c:${LANG[r.lang] || '#888'};display:inline-block;margin-right:6px"></i>${esc(r.lang)}</span>`,
    r.stars != null && `<span>★ ${r.stars}</span>`, r.pushed && `<span>${new Date(r.pushed).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>`].filter(Boolean).join('');
  const desc = note.desc || r.desc;
  $('#repoDesc').textContent = desc || 'Cargando descripción…';
  $('#repoSay').textContent = note.say || SAYS[hash(r.name) % SAYS.length];
  $('#repoActions').innerHTML = `<a class="btn" href="${esc(r.url || `https://github.com/${CONFIG.github}/${r.name}`)}" target="_blank" rel="noopener">Ver el código</a>` +
    (r.home ? `<a class="btn btn--ghost" href="${esc(r.home)}" target="_blank" rel="noopener">Abrir la web</a>` : '');
  if (!quiet) { sayAv.mood('happy'); setTimeout(() => sayAv.mood('smile'), 900); }
  if (!desc) readmeDesc(r);
}
async function readmeDesc(r) {
  let t = readmes.get(r.name);
  if (t === undefined) {
    try {
      const res = await fetch(`https://api.github.com/repos/${CONFIG.github}/${r.name}/readme`, { headers: { Accept: 'application/vnd.github.raw+json' } });
      const md = res.ok ? await res.text() : '';
      t = md.split(/\n\s*\n/).map((p) => p.replace(/!\[[^\]]*\]\([^)]*\)|<[^>]+>|[#*_`>]/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim())
        .find((p) => p.length > 40 && !/^(\||-{3})/.test(p)) || '';
    } catch { t = ''; }
    readmes.set(r.name, t);
  }
  if (REPOS[sel] !== r) return;
  $('#repoDesc').textContent = t || 'Todavía sin descripción. El código habla por sí solo.';
}

(async () => {
  try { REPOS = await getRepos(); } catch { REPOS = []; }
  if (!REPOS.length) REPOS = CONFIG.fallback.map(([name, lang]) => ({ name, lang }));
  renderList();
})();

/* =========================================================
   Kit: recorre las skills (bucle de 3,2 s)
   ========================================================= */
const SKILLS = [
  ['s0k1x-estilo', 'Diseña webs con dirección de arte real y un comprobador en el navegador.'],
  ['s0k1x-pulido', 'Crítica y pulido de interfaces: jerarquía, tipografía, color y accesibilidad.'],
  ['s0k1x-movimiento', 'Crea o audita animaciones con criterios de diseño de movimiento.'],
  ['s0k1x-componentes', 'Construye botones, tarjetas y heros que no parecen de plantilla.'],
  ['s0k1x-humano', 'Reescribe textos para que no suenen a IA.'],
  ['s0k1x-breve', 'Respuestas escuetas que ahorran tokens.'],
  ['s0k1x-tokens', 'Audita el gasto de contexto y lo reduce con tu permiso.'],
  ['s0k1x-investigar', 'Diagnostica un fallo antes de tocar el código.'],
  ['s0k1x-parche', 'Arreglos mínimos en la capa responsable.'],
  ['s0k1x-construir', 'Funcionalidad nueva sin construir de más.'],
  ['s0k1x-refactor', 'Reestructura sin cambiar el comportamiento.'],
  ['s0k1x-memoria', 'Un runbook por repo que se lee al empezar cada sesión.'],
];
const kitList = $('#kitList'), kitDesc = $('#kitDesc');
kitList.innerHTML = SKILLS.map(([n]) => `<li>${n}</li>`).join('');
let ki = 0;
function kitStep() {
  kitList.querySelectorAll('li').forEach((l, i) => l.classList.toggle('on', i === ki));
  kitDesc.textContent = `/${SKILLS[ki][0]}: ${SKILLS[ki][1]}`;
  const vis = [...kitList.children].filter((l) => l.offsetParent).length || SKILLS.length;
  ki = (ki + 1) % vis;
}
kitStep();
if (!reduced) {
  let kt = setInterval(kitStep, 3200);
  const kit = $('.kit');
  kit.addEventListener('pointerenter', () => { clearInterval(kt); ki = 0; kitStep(); kt = setInterval(kitStep, 3200); });
}

/* =========================================================
   Herramientas: diagrama con pulsos
   ========================================================= */
const TOOLS = [
  ['javascript', 'JavaScript'], ['python', 'Python'], ['html', 'HTML'], ['css', 'CSS'], ['nodejs', 'Node.js'], ['git', 'Git'],
  ['github', 'GitHub', true], ['claude', 'Claude'], ['supabase', 'Supabase'], ['cloudflare', 'Cloudflare'], ['visual-studio-code', 'VS Code'], ['linux-tux', 'Linux'], ['kalilinux', 'Kali Linux'],
];
const hub = $('#hub'), hubLines = $('#hubLines');
avatar($('#hubCore'), { sw: 3 });
const nodes = TOOLS.map(([f, label, ink]) => {
  const n = document.createElement('div');
  n.className = 'node';
  n.innerHTML = `<div class="node__tile"><img src="assets/icons/${f}.svg" alt="" class="${ink ? 'ink' : ''}" loading="lazy"></div><span>${label}</span>`;
  hub.appendChild(n);
  return n;
});
function layoutHub() {
  const w = hub.clientWidth, h = hub.clientHeight, cx = w / 2, cy = h / 2;
  const small = w < 640;
  const rx = Math.min(w * .44, small ? w * .38 : 560), ry = h * (small ? .38 : .39);
  let svg = '';
  nodes.forEach((n, i) => {
    const a = -Math.PI / 2 + (i / nodes.length) * Math.PI * 2;
    const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    n.style.left = `${x}px`; n.style.top = `${y - 8}px`;
    svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y - 8}"/>`;
  });
  hubLines.setAttribute('viewBox', `0 0 ${w} ${h}`);
  hubLines.innerHTML = svg + '<circle id="pulse" r="3.5" cx="-10" cy="-10"/>';
}
layoutHub();
addEventListener('resize', layoutHub);
if (!reduced) {
  let pi = 0;
  setInterval(() => {
    const ln = hubLines.querySelectorAll('line')[pi % nodes.length];
    const p = $('#pulse', hubLines);
    if (!ln || !p) return;
    const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((k) => +ln.getAttribute(k));
    p.animate([{ cx: `${x1}px`, cy: `${y1}px` }, { cx: `${x2}px`, cy: `${y2}px` }], { duration: 900, easing: 'linear' });
    p.setAttribute('cx', x2); p.setAttribute('cy', y2);
    nodes.forEach((n, i) => n.firstElementChild.classList.toggle('on', i === pi % nodes.length));
    pi++;
  }, 1000);
}

/* =========================================================
   Contacto
   ========================================================= */
$('#year').textContent = new Date().getFullYear();
$('#copyBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(CONFIG.email); } catch {}
  const t = $('#copyText');
  t.textContent = '✓ Copiado';
  setTimeout(() => (t.textContent = CONFIG.email), 1800);
});
