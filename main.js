/* =========================================================
   CONFIG
   ========================================================= */
const CONFIG = {
  github: 's0k1x',
  email: 'hola@s0k1x.example',
  brain: 'https://hkfowjpiciqvbylnibne.supabase.co/functions/v1/fantasma',
  // clave pública (anon) de Supabase: es pública a propósito, no es la de Gemini
  anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZm93anBpY2lxdmJ5bG5pYm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNzg4MjEsImV4cCI6MjEwOTY1NDgyMX0.vDTy6utoCi9ohoWYAXJBmi9tf6U92ucQkZG6ar5u0Kc',
};
const $ = (s, el = document) => el.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hash = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const PI2 = Math.PI / 2;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = () => innerWidth <= 820;
const HUES = ['#ff9a6b', '#ff6b7a', '#6bffb0', '#6bb6ff', '#ffd36b', '#6bfff0', '#ff8ad8', '#b8ff6b', '#ffb36b'];

/* =========================================================
   Chispa: silueta vectorial 2D con resplandor (SVG), animada cada frame
   ========================================================= */
const NS = 'http://www.w3.org/2000/svg';
const stage = $('#ghost');
stage.innerHTML = `<svg viewBox="0 0 400 420" aria-hidden="true">
  <defs>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b3"/><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b2"/><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1"/>
      <feMerge><feMergeNode in="b3"/><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="1.1"/></filter>
    <linearGradient id="mouthG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0b0b"/><stop offset="1" stop-color="#3b3b3b"/></linearGradient>
  </defs>
  <g id="gBody">
    <g id="gSil" filter="url(#glow)">
      <g id="tf0" class="tf"><path d="M128 160 C122 126 116 88 112 46 C140 72 164 100 182 130 Z"/></g>
      <g id="tf1" class="tf"><path d="M272 160 C278 126 284 88 288 46 C260 72 236 100 218 130 Z"/></g>
      <g id="footL"><ellipse cx="150" cy="352" rx="30" ry="19"/></g>
      <g id="footR"><ellipse cx="250" cy="352" rx="30" ry="19"/></g>
      <g id="armL"><path d="M116 238 C90 230 66 214 54 190 C48 176 56 162 70 164 C82 166 90 176 100 186 C110 196 122 206 132 214 Z"/></g>
      <g id="armR"><path d="M284 238 C310 230 334 214 346 190 C352 176 344 162 330 164 C318 166 310 176 300 186 C290 196 278 206 268 214 Z"/></g>
      <path id="body" transform="translate(200 230) scale(.95) translate(-200 -230)" d="M200 100 C260 100 304 142 310 204 C316 266 300 312 262 336 C240 350 220 354 200 354 C180 354 160 350 138 336 C100 312 84 266 90 204 C96 142 140 100 200 100 Z"/>
    </g>
    <g id="gFace" filter="url(#soft)">
      <path id="eyeL"/><path id="eyeR"/><ellipse id="pupL" rx="2.6" ry="3.6" fill="#fff"/><ellipse id="pupR" rx="2.6" ry="3.6" fill="#fff"/><path id="mouth" fill="url(#mouthG)"/><path id="fangs" fill="#cfcfcf"/>
    </g>
  </g>
</svg>`;
const el = (id) => stage.querySelector('#' + id);
const gBody = el('gBody'), gSil = el('gSil'), gFace = el('gFace'), armL = el('armL'), armR = el('armR');
const eyeL = el('eyeL'), eyeR = el('eyeR'), mouthP = el('mouth'), fangsP = el('fangs');
const tufts = [0, 1].map((i) => el('tf' + i)), footL = el('footL'), footR = el('footR'), pupL = el('pupL'), pupR = el('pupR');
const PIV = { tf: [[150, 136], [250, 136]], armL: [122, 222], armR: [278, 222] };

// fondo de estrellas (se dibuja una vez)
const sky = $('#sky'), sc = sky.getContext('2d');
function drawSky() { sky.width = innerWidth; sky.height = innerHeight * 1.4; for (let i = 0; i < 260; i++) { sc.fillStyle = `rgba(255,255,255,${.1 + Math.random() * .45})`; sc.beginPath(); sc.arc(Math.random() * sky.width, Math.random() * sky.height, Math.random() * 1.1 + .2, 0, 7); sc.fill(); } }
drawSky(); addEventListener('resize', drawSky);

/* ---------- cara paramétrica: ojos y boca se transforman de forma continua ---------- */
const P = (o) => ({ in: 24, out: -30, up: -26, lo: 30, open: 1, w: 132, cy: -24, mup: 20, mlo: 96, teeth: 1, ...o });
const CARAS = {
  malvado: P({}),
  chulo: P({ in: 6, out: -18, up: -20, lo: 22, w: 104, cy: -10, mup: 14, mlo: 60 }),
  feliz: P({ in: 12, out: 12, up: -40, lo: -6, w: 120, cy: -26, mup: 18, mlo: 96 }),
  risa: P({ in: 14, out: 14, up: -42, lo: -10, w: 132, cy: -34, mup: 12, mlo: 128, teeth: .7 }),
  sorpresa: P({ in: 0, out: 0, up: -48, lo: 48, w: 34, cy: 10, mup: -24, mlo: 46, teeth: 0 }),
  enfado: P({ in: 30, out: -34, up: -2, lo: 30, w: 96, cy: 6, mup: 4, mlo: 40 }),
  triste: P({ in: -26, out: 14, up: -26, lo: 30, w: 70, cy: 36, mup: -8, mlo: 6, teeth: 0 }),
  dormido: P({ in: 6, out: 6, up: 4, lo: 6, open: 0, w: 60, cy: 12, mup: 10, mlo: 16, teeth: 0 }),
  pensando: P({ in: 4, out: -14, up: -28, lo: 24, w: 66, cy: 8, mup: 2, mlo: 22, teeth: 0 }),
  asustado: P({ in: -8, out: -8, up: -50, lo: 44, w: 92, cy: 14, mup: -6, mlo: 34, teeth: 1 }),
  aburrido: P({ in: 0, out: 0, up: -2, lo: 30, w: 60, cy: 12, mup: 10, mlo: 14, teeth: 0 }),
  lengua: P({ in: 12, out: 12, up: -40, lo: -6, w: 110, cy: -18, mup: 16, mlo: 80, teeth: .4 }),
  guino: P({}), amor: P({}), mareado: P({}), estrellas: P({}), muerto: P({}),
  neutro: P({ in: 0, out: 0, up: -40, lo: 40, w: 60, cy: 10, mup: 8, mlo: 14, teeth: 0 }),
};
const GLYPHS = { amor: 'M0 34 C-66 -6 -28 -50 0 -16 C28 -50 66 -6 0 34 Z', muerto: 'M-30 -22 L-22 -30 L0 -8 L22 -30 L30 -22 L8 0 L30 22 L22 30 L0 8 L-22 30 L-30 22 L-8 0 Z',
  estrellas: (() => { let d = ''; for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 : 44, a = -Math.PI / 2 + i * Math.PI / 5; d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; } return d + 'Z'; })() };
const F = { ...CARAS.malvado, blink: 0, wink: 0, look: 0, lookY: 0, talk: 0, glyph: '' };
let T = { ...CARAS.malvado, wink: 0 }, faceTimer, talkUntil = 0;
function cara(n) { const k = CARAS[n] ? n : 'malvado'; T = { ...CARAS[k], wink: k === 'guino' ? 1 : 0 }; F.glyph = k === 'mareado' ? 'spiral' : GLYPHS[k] || ''; }
function caraUn(n, ms = 2600) { cara(n); clearTimeout(faceTimer); faceTimer = setTimeout(() => cara('malvado'), ms); }
const f1 = (n) => n.toFixed(1);
function eyePath(side, now) {
  if (F.glyph === 'spiral') { let d = ''; for (let a = 0; a < 16; a += .25) { const r = a * 2.6, b = a + now / 260 * side; d += `${a ? 'L' : 'M'}${f1(Math.cos(b) * r)} ${f1(Math.sin(b) * r)}`; } return d; }
  if (F.glyph) return F.glyph;
  const open = Math.max(F.open * (1 - F.blink) * (side === 1 ? 1 - F.wink : 1), .05);
  const mid = (F.in + F.out) / 2, up = mid + (F.up - mid) * open, lo = mid + (F.lo - mid) * open;
  return `M-50 ${f1(F.in)} Q0 ${f1(up * 1.25 - mid * .25)} 50 ${f1(F.out)} Q0 ${f1(lo * 1.25 - mid * .25)} -50 ${f1(F.in)} Z`;
}
function drawFace(now) {
  for (const [p, side] of [[eyeL, -1], [eyeR, 1]]) {
    p.setAttribute('d', eyePath(side, now));
    p.setAttribute('transform', `translate(${f1(200 + side * 46 + F.look * 5)} ${f1(198 + F.lookY * 3)}) scale(${side * .5} .5)`);
    p.setAttribute('fill', F.glyph === 'spiral' ? 'none' : '#121212'); p.setAttribute('stroke', '#121212'); p.setAttribute('stroke-width', F.glyph === 'spiral' ? 12 : 8); p.setAttribute('stroke-linejoin', 'round'); p.setAttribute('stroke-linecap', 'round');
  }
  const openE = F.open * (1 - F.blink);
  for (const [p, side] of [[pupL, -1], [pupR, 1]]) {
    const mid = (F.in + F.out) / 2;
    p.setAttribute('cx', f1(200 + side * 46 + F.look * 9)); p.setAttribute('cy', f1(198 + mid * .5 + F.lookY * 4));
    p.setAttribute('opacity', F.glyph || openE * (side === 1 ? 1 - F.wink : 1) < .35 ? 0 : 1);
  }
  const w = F.w, cy = F.cy, lo = F.mlo + F.talk * 26, top = F.mup - F.talk * 4;
  const tr = `translate(${f1(200 + F.look * 3)} ${f1(258 + F.lookY * 2)}) scale(.5)`;
  mouthP.setAttribute('d', `M${f1(-w)} ${f1(cy)} Q0 ${f1(lo * 2 - cy)} ${f1(w)} ${f1(cy)} Q0 ${f1(top * 2 - cy)} ${f1(-w)} ${f1(cy)} Z`);
  mouthP.setAttribute('transform', tr); mouthP.setAttribute('stroke', '#101010'); mouthP.setAttribute('stroke-width', 9); mouthP.setAttribute('stroke-linejoin', 'round');
  let fd = '';
  if (F.teeth > .05 && w > 50) for (const sx of [-1, 1]) { const x = sx * w * .42, tt = x / w, y = cy + (top * 2 - 2 * cy) * (1 - tt * tt) * .5; fd += `M${f1(x - 15)} ${f1(y - 4)} L${f1(x + sx * 2)} ${f1(y + 28 + F.teeth * 6)} L${f1(x + 15)} ${f1(y - 4)} Z`; }
  fangsP.setAttribute('d', fd); fangsP.setAttribute('transform', tr); fangsP.setAttribute('opacity', Math.min(1, F.teeth));
}
const FACE_KEYS = ['in', 'out', 'up', 'lo', 'open', 'w', 'cy', 'mup', 'mlo', 'teeth', 'wink'];
function tweenFace(dt, now) {
  const k = 1 - Math.exp(-dt * 14);
  for (const key of FACE_KEYS) F[key] += ((T[key] ?? 0) - F[key]) * k;
  const talkT = bubble.classList.contains('show') && now < talkUntil ? (.5 + .5 * Math.sin(now / 55)) * (.6 + .4 * Math.sin(now / 130)) : 0;
  F.talk += (talkT - F.talk) * Math.min(1, dt * 30);
  drawFace(now);
}

/* ---------- animaciones: funciones de p (0..1) que suman sobre la pose ---------- */
const S = Math.sin, PI = Math.PI;
const ease = (p) => p < .5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
let teleX = 0;
const ANIMS = {
  flotar: [2000, (p, A) => { A.y += S(p * PI) * .45; }],
  saltar: [800, (p, A) => { A.y += S(p * PI) * 1.1; const sq = p < .12 ? 1 - p / .12 : p > .88 ? (p - .88) / .12 : 0; A.sy -= sq * .25; A.sx += sq * .15; A.armL += S(p * PI) * 1.4; A.armR += S(p * PI) * 1.4; }],
  girar: [1000, (p, A) => { A.ry += ease(p) * PI * 2; }],
  reir: [1400, (p, A) => { A.y += Math.abs(S(p * PI * 9)) * .14; A.rz += S(p * PI * 9) * .07; A.armL += .5; A.armR += .5; }],
  bailar: [2600, (p, A) => { A.x += S(p * PI * 6) * .4; A.rz += S(p * PI * 6) * .22; A.armL += 1.2 + S(p * PI * 12) * .8; A.armR += 1.2 - S(p * PI * 12) * .8; A.y += Math.abs(S(p * PI * 12)) * .12; }],
  saludar: [1700, (p, A) => { const e = S(Math.min(p * 4, 1) * PI / 2) * (p > .85 ? (1 - p) / .15 : 1); A.armR += e * (2.2 + S(p * PI * 10) * .45); A.rz -= e * .06; }],
  '67': [2600, (p, A) => { const e = p > .9 ? (1 - p) / .1 : Math.min(p * 6, 1), w = S(p * PI * 10); A.armL += e * (1.3 + w * .55); A.armR += e * (1.3 - w * .55); A.rz += w * .05 * e; A.y += Math.abs(w) * .05; }],
  temblar: [800, (p, A) => { A.x += S(p * 100) * .06 * (1 - p); A.rz += S(p * 80) * .04 * (1 - p); }],
  desvanecer: [1800, (p, A) => { A.op *= 1 - S(p * PI) * .95; A.y += S(p * PI) * .2; }],
  teletransporte: [1600, (p, A) => { const k = p < .4 ? 1 - p / .4 : p > .6 ? (p - .6) / .4 : 0; A.s *= k; A.op *= k; if (p > .5) A.x += teleX * (1 - ease((p - .5) / .5)); }],
  crecer: [1500, (p, A) => { A.s *= 1 + S(p * PI) * .5; }],
  encoger: [1500, (p, A) => { A.s *= 1 - S(p * PI) * .5; }],
  asomarse: [2200, (p, A) => { A.y -= S(p * PI) * 2.2; A.rz += S(p * PI * 2) * .08; }],
  dormir: [3200, (p, A) => { const e = S(Math.min(p * 3, 1) * PI / 2) * (p > .9 ? (1 - p) / .1 : 1); A.rz += e * .28; A.y -= e * .25; A.sy += S(p * PI * 4) * .03 * e; A.armL -= .3 * e; A.armR -= .3 * e; }],
  aplaudir: [1500, (p, A) => { const w = Math.abs(S(p * PI * 7)); A.armL += 1 + w * .9; A.armR += 1 + w * .9; A.y += w * .04; }],
  volar: [2400, (p, A) => { A.x += S(p * PI * 2) * 2.3; A.y += S(p * PI * 4) * .45; A.rz -= Math.cos(p * PI * 2) * .25; A.armL += 1; A.armR += 1; }],
  rebotar: [1600, (p, A) => { A.y += Math.abs(S(p * PI * 4)) * (1 - p) * .9; }],
  estirar: [1300, (p, A) => { const e = S(p * PI); A.sy += e * .4; A.sx -= e * .18; A.armL += e * 2; A.armR += e * 2; }],
  latido: [1000, (p, A) => { A.s *= 1 + Math.abs(S(p * PI * 4)) * .1 * (1 - p); }],
  espiar: [2200, (p, A) => { const e = S(p * PI); A.x += e * .7; A.ry += e * .9; A.y -= e * .2; }],
  asentir: [1000, (p, A) => { A.rx += S(p * PI * 4) * .2; }],
  negar: [1000, (p, A) => { A.ry += S(p * PI * 4) * .4; }],
  voltereta: [1100, (p, A) => { const q = Math.min(Math.max((p - .15) / .7, 0), 1); A.rx -= ease(q) * PI * 2; A.y += S(q * PI) * 1.3; const sq = p < .15 ? S(p / .15 * PI) : p > .85 ? S((p - .85) / .15 * PI) : 0; A.sy -= sq * .22; A.sx += sq * .12; A.armL += S(q * PI) * 2; A.armR += S(q * PI) * 2; }],
  pirueta: [1200, (p, A) => { const q = Math.min(Math.max((p - .12) / .76, 0), 1); A.ry += ease(q) * PI * 4; A.y += S(q * PI) * .9; A.armL += S(q * PI) * 1.6; A.armR += S(q * PI) * 1.6; const sq = p < .12 ? S(p / .12 * PI) : 0; A.sy -= sq * .2; }],
  rueda: [1400, (p, A) => { A.rz -= ease(p) * PI * 2; A.x += S(p * PI) * 1.2; A.y += Math.abs(S(p * PI * 2)) * .4; A.armL += 2.2; A.armR += 2.2; }],
  mortal: [1600, (p, A) => { const q = Math.min(Math.max((p - .1) / .8, 0), 1); A.rx -= ease(q) * PI * 4; A.y += S(q * PI) * 1.8; A.s *= 1 - S(q * PI) * .15; }],
  risa_malvada: [2200, (p, A) => { const e = S(Math.min(p * 3, 1) * PI / 2) * (p > .85 ? (1 - p) / .15 : 1); A.rx -= e * .25; A.y += Math.abs(S(p * PI * 10)) * .08 * e; A.armL += e * (1.1 + S(p * PI * 10) * .15); A.armR += e * (1.1 - S(p * PI * 10) * .15); A.sy += e * .04; }],
  encogerse: [1400, (p, A) => { const e = S(p * PI); A.armL += e * 1.1; A.armR += e * 1.1; A.sy -= e * .08; A.y -= e * .06; }],
};
const active = [];
function anim(name) {
  const a = ANIMS[name]; if (!a) return 0;
  if (name === 'teletransporte') teleX = (Math.random() > .5 ? 1 : -1) * (1 + Math.random());
  const dur = reduced ? Math.min(a[0], 600) : a[0];
  active.push({ fn: a[1], t0: performance.now(), dur });
  return dur;
}

/* ---------- efectos sobre la página ---------- */
const fx = $('#fx');
function screenPos(dx = 0, dy = 0) { return { x: G.x + dx * G.u, y: G.y - dy * G.u }; }
const GLYPH = { corazones: '♥', estrellas: '★', interrogacion: '?', exclamacion: '!', zzz: 'z', chispas: '✦' };
function efecto(kind, texto) {
  if (reduced && kind !== 'texto') return;
  const o = screenPos(0, .6);
  if (kind === 'texto') {
    const el = document.createElement('i'); el.className = 'big'; el.textContent = String(texto || '').slice(0, 12);
    el.style.left = `${o.x}px`; el.style.top = `${o.y}px`; fx.appendChild(el);
    el.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.05)', opacity: 1, offset: .25 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: .8 }, { transform: 'translate(-50%,-50%) scale(1.15)', opacity: 0 }], { duration: 2200, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.then(() => el.remove());
    return;
  }
  const n = kind === 'confeti' ? 60 : 9;
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i');
    if (kind === 'confeti') Object.assign(el.style, { width: '7px', height: '11px', background: pick(['#fff', '#4c8dff', '#ff9a6b', '#6bffb0', '#ffd36b']), borderRadius: '2px' });
    else { el.textContent = GLYPH[kind] || '✦'; el.style.fontSize = `${18 + Math.random() * 18}px`; el.style.color = kind === 'corazones' ? '#ff6b8a' : '#fff'; el.style.textShadow = '0 0 12px rgba(255,255,255,.6)'; }
    el.style.left = `${o.x + (Math.random() - .5) * 80}px`; el.style.top = `${o.y}px`; fx.appendChild(el);
    const dx = (Math.random() - .5) * (kind === 'confeti' ? 600 : 160), dy = kind === 'confeti' ? 300 + Math.random() * 400 : -(120 + Math.random() * 160);
    el.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) rotate(${(Math.random() - .5) * 720}deg)`, opacity: 0 }],
      { duration: 1400 + Math.random() * 900, delay: i * (kind === 'confeti' ? 6 : 90), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' }).finished.then(() => el.remove());
  }
}
const bubble = $('#bubble');
let bubbleUntil = 0;
function decir(t, ms = 3200) { talkUntil = performance.now() + Math.min(String(t).length * 55, 4000); bubble.textContent = String(t).slice(0, 140); bubble.classList.add('show'); bubbleUntil = performance.now() + Math.min(Math.max(ms, 1500), 8000); }

/* ---------- tono ---------- */
const hex2 = (h) => { const n = parseInt(String(h).replace('#', '').padEnd(6, 'f').slice(0, 6), 16); return isNaN(n) ? [255, 255, 255] : [n >> 16 & 255, n >> 8 & 255, n & 255]; };
let tint = [255, 255, 255], tintTarget = [255, 255, 255], tintOverride = null, tintOverrideUntil = 0;
function color(h, ms = 3500) { tintOverride = hex2(h); tintOverrideUntil = performance.now() + ms; }

/* ---------- memes = combinaciones ---------- */
const MEMES = {
  '67': [{ cara: 'chulo' }, { efecto: 'texto', texto: '6 7' }, { animacion: '67' }],
  encogerse: [{ cara: 'aburrido' }, { animacion: 'encogerse' }, { efecto: 'interrogacion' }],
  'esto-esta-bien': [{ color: '#ff7a30' }, { cara: 'feliz' }, { efecto: 'chispas' }, { decir: 'Todo bien. Todo perfecto.' }],
  stonks: [{ cara: 'chulo' }, { efecto: 'texto', texto: 'STONKS ↗' }, { animacion: 'crecer' }],
  nope: [{ cara: 'asustado' }, { efecto: 'texto', texto: 'NOPE' }, { animacion: 'negar' }, { animacion: 'desvanecer' }],
  ok: [{ cara: 'feliz' }, { animacion: 'asentir' }, { efecto: 'texto', texto: 'OK' }],
  'mind-blown': [{ cara: 'mareado' }, { efecto: 'chispas' }, { animacion: 'crecer' }],
  dramatico: [{ cara: 'sorpresa' }, { efecto: 'exclamacion' }, { animacion: 'latido' }],
};

/* ---------- ejecutor de acciones (lista blanca) ---------- */
const hist = [];
let queue = Promise.resolve();
function run(acciones) {
  const list = (Array.isArray(acciones) ? acciones : []).slice(0, 6).flatMap((a) => a && a.meme && MEMES[a.meme] ? MEMES[a.meme] : [a]);
  queue = queue.then(async () => {
    for (const a of list) {
      if (!a || typeof a !== 'object') continue;
      if (a.cara) caraUn(a.cara, 3200);
      if (a.color) color(a.color);
      if (a.efecto) efecto(a.efecto, a.texto);
      if (a.decir) { decir(a.decir, a.ms || 3200); hist.push({ dijo: String(a.decir).slice(0, 90) }); await sleep(500); }
      if (a.animacion) await sleep(anim(a.animacion) * .7);
      if (a.esperar) await sleep(Math.min(+a.esperar || 0, 3000));
      if (a.ir) document.getElementById(a.ir)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    }
  }).catch(() => {});
}
window.s0k1x = { run, cara, anim, decir, efecto, color, memes: Object.keys(MEMES), caras: Object.keys(CARAS), animaciones: Object.keys(ANIMS) };

/* =========================================================
   Cerebro: Gemini vía Supabase, con respaldo local
   ========================================================= */
let calls = 0, lastCall = 0, aiDown = false;
const LOCAL = {
  inicio: () => [{ cara: 'malvado' }, { animacion: 'saludar' }, { decir: 'Buenas, soy Chispa, el fantasma de esta web. Pulsa en mí si te aburres.' }],
  seccion: (c) => c.seccion === 'contacto' ? [{ cara: 'feliz' }, { animacion: 'saltar' }, { decir: '¿Hablamos? s0k1x contesta rápido.' }]
    : c.seccion === 'kit' ? [{ cara: 'chulo' }, { animacion: 'girar' }] : c.seccion === 'herramientas' ? [{ cara: 'pensando' }, { animacion: 'asentir' }] : [{ cara: 'feliz' }, { animacion: 'flotar' }],
  proyecto: () => [{ cara: pick(['feliz', 'chulo', 'amor']) }, { animacion: pick(['saltar', 'girar', 'rebotar', 'latido']) }],
  clic: () => pick([[{ cara: 'malvado' }, { animacion: 'risa_malvada' }, { decir: 'Jejeje... Has caído en mi trampa.' }], [{ cara: 'chulo' }, { animacion: 'voltereta' }], [{ cara: 'risa' }, { animacion: 'pirueta' }], [{ cara: 'feliz' }, { animacion: 'rueda' }], [{ cara: 'risa' }, { animacion: 'reir' }], [{ meme: '67' }], [{ cara: 'sorpresa' }, { animacion: 'teletransporte' }], [{ cara: 'lengua' }, { animacion: 'bailar' }], [{ cara: 'mareado' }, { animacion: 'girar' }]]),
  inactivo: () => [{ cara: 'dormido' }, { efecto: 'zzz' }, { animacion: 'dormir' }],
  vuelve: () => [{ cara: 'sorpresa' }, { animacion: 'temblar' }, { decir: '¡Has vuelto!' }],
  mensaje: (c) => /6\s*7|six seven/i.test(c.mensaje) ? [{ meme: '67' }] : [{ cara: 'pensando' }, { animacion: 'encogerse' }, { decir: 'Ahora mismo no tengo el cerebro conectado. Prueba más tarde.' }],
};
function contexto(extra = {}) {
  const p = currentProject();
  return {
    seccion: currentSection, proyecto: p ? { nombre: p.name, descripcion: p.desc, lenguaje: p.lang, privado: !!p.priv } : null,
    proyectos: PROJECTS.map((x) => x.name), sobre: 's0k1x: desarrollador de webs, automatizaciones y skills para Claude Code (kit s0k1x-skill: 35 skills, 3 agentes).',
    hora: new Date().getHours(), movil: mobile(), historial: hist.slice(-6), ...extra,
  };
}
async function think(evento, extra = {}, gap = 6000) {
  const now = Date.now(), ctx = contexto(extra);
  hist.push({ evento, ...(extra.mensaje ? { mensaje: extra.mensaje } : {}) });
  if (aiDown || calls >= 40 || now - lastCall < gap) { run(LOCAL[evento]?.(ctx) || []); return; }
  lastCall = now; calls++;
  try {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 9000);
    const r = await fetch(CONFIG.brain, { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CONFIG.anon}`, apikey: CONFIG.anon }, body: JSON.stringify({ evento, contexto: ctx }) });
    clearTimeout(to);
    if (r.status === 503 || r.status === 403) aiDown = true;
    if (!r.ok) throw new Error(r.status);
    const { acciones } = await r.json();
    if (!acciones?.length) throw new Error('vacío');
    run(acciones);
  } catch { run(LOCAL[evento]?.(ctx) || []); }
}

/* =========================================================
   Proyectos (projects.json + GitHub)
   ========================================================= */
let PROJECTS = [];
async function getProjects() {
  let cfg = { proyectos: [], mostrarOtrosPublicos: true }, gh = [];
  try { const r = await fetch('projects.json', { cache: 'no-cache' }); if (r.ok) cfg = await r.json(); } catch {}
  try {
    const c = sessionStorage.getItem('repos3');
    if (c) gh = JSON.parse(c);
    else {
      const r = await fetch(`https://api.github.com/users/${CONFIG.github}/repos?per_page=100&sort=pushed`);
      if (r.ok) { gh = (await r.json()).filter((x) => !x.fork).map((x) => ({ name: x.name, lang: x.language, desc: x.description, url: x.html_url, home: x.homepage, stars: x.stargazers_count, pushed: x.pushed_at })); sessionStorage.setItem('repos3', JSON.stringify(gh)); }
    }
  } catch {}
  const by = new Map(gh.map((g) => [g.name.toLowerCase(), g])), used = new Set(), out = [];
  for (const p of cfg.proyectos || []) {
    if (p.repo) used.add(p.repo.toLowerCase());
    if (p.mostrar === false) continue;
    const g = (!p.privado && p.repo && by.get(p.repo.toLowerCase())) || {};
    const name = p.nombre || p.repo; if (!name) continue;
    out.push({ id: p.repo || name, name, priv: !!p.privado, lang: p.lenguaje || g.lang, stars: p.privado ? null : g.stars, pushed: g.pushed, desc: p.descripcion || g.desc || '',
      web: p.web || g.home || '', code: p.privado ? '' : (g.url || (p.repo ? `https://github.com/${CONFIG.github}/${p.repo}` : '')), images: (p.imagenes || []).filter(Boolean), links: (p.enlaces || []).filter((l) => l?.url) });
  }
  if (cfg.mostrarOtrosPublicos) gh.filter((g) => !used.has(g.name.toLowerCase()) && g.name.toLowerCase() !== CONFIG.github).forEach((g) => out.push({ id: g.name, name: g.name, lang: g.lang, stars: g.stars, pushed: g.pushed, desc: g.desc || '', web: g.home || '', code: g.url, images: [], links: [] }));
  return out;
}
function renderProjects() {
  $('#statProj').textContent = PROJECTS.length;
  $('#projLead').textContent = `${PROJECTS.length} proyectos, cada uno con su color. Mira cómo cambia el fantasma.`;
  $('#projectChapters').innerHTML = PROJECTS.map((p, i) => {
    const t = HUES[hash(p.id) % HUES.length];
    const meta = [p.priv && '<span class="tag">Privado</span>', p.lang && esc(p.lang), p.stars != null && `★ ${p.stars}`, p.pushed && new Date(p.pushed).getFullYear()].filter(Boolean).map((m) => `<span>${m}</span>`).join('');
    const acts = [p.web && `<a class="btn" href="${esc(p.web)}" target="_blank" rel="noopener">Abrir la web</a>`, p.code && `<a class="btn${p.web ? ' btn--ghost' : ''}" href="${esc(p.code)}" target="_blank" rel="noopener">Ver el código</a>`].filter(Boolean).join('');
    return `<section class="ch" id="p-${i}" data-pose="side" data-tint="${t}" data-project="${i}" style="--tint:${t}">
      <div class="ch__text"><p class="kicker">Proyecto ${String(i + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}</p>
      <h2>${esc(p.name)}</h2>${p.desc ? `<p class="lead">${esc(p.desc)}</p>` : ''}<div class="meta">${meta}</div>
      ${p.images.length ? `<div class="shots">${p.images.slice(0, 3).map((s, k) => `<a href="${esc(s)}" target="_blank" rel="noopener"><img src="${esc(s)}" alt="${esc(p.name)}, imagen ${k + 1}" loading="lazy"></a>`).join('')}</div>` : ''}
      <div class="actions">${acts}</div>${p.links.length ? `<div class="links">${p.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.texto || 'Referencia')} ↗</a>`).join('')}</div>` : ''}</div></section>`;
  }).join('');
  observeChapters();
}

/* =========================================================
   Capítulos: el fantasma se coloca y cambia con el scroll
   ========================================================= */
let currentSection = 'inicio', currentEl = null;
const seen = new Set();
const currentProject = () => currentEl?.dataset.project != null ? PROJECTS[+currentEl.dataset.project] : null;
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) enterChapter(e.target); }), { threshold: .55 });
function observeChapters() { document.querySelectorAll('.ch').forEach((s) => io.observe(s)); buildDots(); }
function enterChapter(el) {
  if (currentEl === el) return;
  reveal(el);
  currentEl = el; currentSection = el.dataset.project != null ? 'proyecto' : el.id;
  tintTarget = hex2(el.dataset.tint || '#ffffff');
  document.querySelectorAll('.dots a').forEach((d) => d.classList.toggle('on', d.dataset.id === el.id));
  if (seen.has(el.id)) return;
  seen.add(el.id);
  if (el.id === 'inicio') return;
  think(el.dataset.project != null ? 'proyecto' : 'seccion', {}, el.dataset.project != null ? 4000 : 5000);
}
function reveal(el) {
  if (el.classList.contains('in')) return;
  [...el.querySelectorAll('.ch__text > *')].forEach((c, i) => c.style.setProperty('--i', i));
  el.classList.add('in');
  el.querySelectorAll('.stats b').forEach((b) => {
    const end = parseInt(b.textContent, 10); if (!end || reduced) return;
    const t0 = performance.now(); const step = (n) => { const p = Math.min((n - t0) / 900, 1); b.textContent = Math.round(end * (1 - (1 - p) ** 3)); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
  });
}
function buildDots() {
  let d = $('.dots'); if (!d) { d = document.createElement('nav'); d.className = 'dots'; d.setAttribute('aria-label', 'Capítulos'); document.body.appendChild(d); }
  d.innerHTML = [...document.querySelectorAll('.ch')].map((s) => `<a href="#${s.id}" data-id="${s.id}" class="${s === currentEl ? 'on' : ''}" aria-label="${esc(s.querySelector('h1,h2')?.textContent || s.id)}"></a>`).join('');
}

/* =========================================================
   Bucle
   ========================================================= */
const ptr = { x: 0, y: 0 };
addEventListener('pointermove', (e) => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1; poke(); }, { passive: true });
const prog = document.createElement('div'); prog.className = 'progress'; document.body.appendChild(prog);
const G = { x: innerWidth * .7, y: innerHeight * .5, size: 400, u: 140 };
const target = { x: 0, y: 0, size: 400 };
let blinkAt = performance.now() + 2500, first = true, prevX = 0, prevY = 0, sprX = 0, sprY = 0, lastNow = 0, dt = .016;
function poseTarget() {
  const pose = currentEl?.dataset.pose || 'hero', W = innerWidth, H = innerHeight;
  if (mobile()) Object.assign(target, { x: W * .5, y: H * .27, size: Math.min(W * .62, H * .36) });
  else if (pose === 'center') Object.assign(target, { x: W * .5, y: H * .3, size: Math.min(H * .36, 320) });
  else Object.assign(target, { x: W * (pose === 'hero' ? .7 : .7), y: H * .5, size: Math.min(H * .58, 520) });
}
const D = 180 / Math.PI;
function frame(now) {
  requestAnimationFrame(frame);
  const t = now / 1000; dt = Math.min((now - lastNow) / 1000, .05); lastNow = now;
  poseTarget();
  const k = first ? 1 : 1 - Math.exp(-dt * 3.2); first = false;
  G.x += (target.x - G.x) * k; G.y += (target.y - G.y) * k; G.size += (target.size - G.size) * k; G.u = G.size * .36;
  const br = S(t * 1.9);
  const A = { x: 0, y: S(t * 1.4) * .09, rx: 0, ry: 0, rz: S(t * .8) * .035, s: 1, sx: 1 - br * .012, sy: 1 + br * .02, armL: S(t * 2.2) * .12, armR: S(t * 2.2 + 1) * .12, op: 1 };
  for (let i = active.length - 1; i >= 0; i--) { const a = active[i], p = (now - a.t0) / a.dur; if (p >= 1) { active.splice(i, 1); continue; } a.fn(p, A); }
  const cx = G.x + A.x * G.u, cy = G.y - A.y * G.u;
  const turn = Math.cos(A.ry + ptr.x * .25), rot = (A.rz + A.rx) * D + ptr.x * 3;
  stage.style.width = stage.style.height = `${G.size}px`;
  stage.style.transform = `translate(${cx - G.size / 2}px, ${cy - G.size / 2}px) rotate(${rot}deg) scale(${A.s * A.sx * turn}, ${A.s * A.sy})`;
  stage.style.opacity = A.op;
  gFace.style.opacity = turn < .15 ? 0 : 1;
  armL.setAttribute('transform', `rotate(${(-A.armL * .55) * D} ${PIV.armL[0]} ${PIV.armL[1]})`);
  armR.setAttribute('transform', `rotate(${(A.armR * .55) * D} ${PIV.armR[0]} ${PIV.armR[1]})`);
  const kick = S(t * 2.6) * 3, air = Math.min(1, Math.max(0, A.y - .15) * 2);
  footL.setAttribute('transform', `translate(${f1(-air * 6)} ${f1(kick - air * 10)})`);
  footR.setAttribute('transform', `translate(${f1(air * 6)} ${f1(-kick - air * 10)})`);
  // movimiento secundario tipo muelle en orejas
  const vx = (cx - prevX) / Math.max(dt, .001), vy = (cy - prevY) / Math.max(dt, .001); prevX = cx; prevY = cy;
  sprX += (Math.max(-1, Math.min(1, -vx / 900)) - sprX) * .1; sprY += (Math.max(-1, Math.min(1, vy / 900)) - sprY) * .1;
  tufts.forEach((tf, i) => { const [px, py] = PIV.tf[i]; tf.setAttribute('transform', `rotate(${f1((sprX * 18 + S(t * 2.3 + i * 1.7) * 3 + (i ? 1 : -1) * Math.max(0, -sprY) * 12))} ${px} ${py}) translate(${px} ${py}) scale(1 ${f1(1 + sprY * .25 + S(t * 4 + i * 2) * .05)}) translate(${-px} ${-py})`); });
  tint = tint.map((c, i) => c + ((tintOverride && now < tintOverrideUntil ? tintOverride : tintTarget)[i] - c) * .06);
  const mix = tint.map((c) => Math.round(255 - (255 - c) * .55));
  gSil.setAttribute('fill', `rgb(${mix.join(',')})`);
  F.look += (ptr.x - F.look) * .1; F.lookY += (ptr.y - F.lookY) * .1;
  const bp = (now - blinkAt) / 150; F.blink = bp > 0 && bp < 1 ? Math.sin(bp * Math.PI) : 0;
  if (bp >= 1) blinkAt = now + 2200 + Math.random() * 3200;
  tweenFace(dt, now);
  if (bubble.classList.contains('show')) {
    if (now > bubbleUntil) bubble.classList.remove('show');
    const o = screenPos(.55, mobile() ? 1.7 : 1.45), w = bubble.offsetWidth;
    bubble.style.left = `${Math.min(Math.max(o.x, 12), innerWidth - w - 12)}px`; bubble.style.top = `${Math.max(o.y - bubble.offsetHeight, 70)}px`;
  }
  sky.style.transform = `translate(${ptr.x * -8}px, ${-scrollY * .05 + ptr.y * -6}px)`;
  prog.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
}
requestAnimationFrame(frame);

/* ---------- interacción ---------- */
stage.addEventListener('click', () => think('clic', {}, 3000));
$('#chat').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#chatIn').value.trim(); if (!v) return;
  $('#chatIn').value = '';
  caraUn('pensando', 2000);
  think('mensaje', { mensaje: v.slice(0, 200) }, 1500);
});
let idleT;
function poke() { clearTimeout(idleT); idleT = setTimeout(() => think('inactivo', {}, 20000), 40000); }
addEventListener('scroll', poke, { passive: true });
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => { if (document.hidden) hiddenAt = Date.now(); else if (Date.now() - hiddenAt > 15000) think('vuelve', {}, 8000); });

/* ---------- herramientas ---------- */
const TOOLS = [['javascript', 'JavaScript'], ['python', 'Python'], ['html', 'HTML'], ['css', 'CSS'], ['nodejs', 'Node.js'], ['git', 'Git'], ['github', 'GitHub', 1], ['claude', 'Claude'], ['supabase', 'Supabase'], ['cloudflare', 'Cloudflare'], ['visual-studio-code', 'VS Code'], ['linux-tux', 'Linux']];
$('#tools').innerHTML = TOOLS.map(([f, l, ink]) => `<li><img src="assets/icons/${f}.svg" alt="" class="${ink ? 'ink' : ''}" loading="lazy">${l}</li>`).join('');
$('#year').textContent = new Date().getFullYear();

/* ---------- arranque ---------- */
cara('malvado');
observeChapters();
getProjects().then((p) => { PROJECTS = p; renderProjects(); });
setTimeout(() => think('inicio', {}, 0), 1200);
poke();
