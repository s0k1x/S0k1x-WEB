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
const f1 = (n) => (+n).toFixed(1);
// ---------- geometría procedural del pelaje ----------
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const ell = (cx, cy, rx, ry, n = 72, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; };
function spine(segs, n = 40) { const pts = []; segs.forEach((s, k) => { for (let i = k ? 1 : 0; i <= n; i++) pts.push(bez(s[0], s[1], s[2], s[3], i / n)); }); return pts; }
function tubePts(c, w0, w1) { // contorno de una forma alargada a partir de su eje
  const L = [], R = [];
  c.forEach((p, i) => { const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, t = i / (c.length - 1), w = (w0 + (w1 - w0) * Math.pow(t, .85)) * (t > .92 ? (1 - t) / .08 * .8 + .2 : 1);
    L.push([p[0] - dy / l * w, p[1] + dx / l * w]); R.push([p[0] + dy / l * w, p[1] - dx / l * w]); });
  return [...L, ...R.reverse()];
}
function fur(pts, amp = 7, top = 0) { // mechones curvos hacia fuera
  const n = pts.length; let cx = 0, cy = 0; pts.forEach((p) => { cx += p[0]; cy += p[1]; }); cx /= n; cy /= n;
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; }
    const k = amp * (.55 + rnd() * .8) * (1 + Math.max(0, -ny) * top), sw = (rnd() - .5) * amp * .9;
    d += ` Q${f1(mx + nx * k + ny * sw)} ${f1(my + ny * k - nx * sw)} ${f1(b[0])} ${f1(b[1])}`;
  }
  return d + 'Z';
}
function claws(x, y, ang, s = 1) { let d = ''; for (let k = -1; k <= 1; k++) { const a = ang + k * .38, bx = x + Math.cos(a) * 14 * s, by = y + Math.sin(a) * 14 * s, tx = x + Math.cos(a) * 30 * s, ty = y + Math.sin(a) * 30 * s, px = -Math.sin(a) * 5 * s, py = Math.cos(a) * 5 * s;
  d += `M${f1(bx - px)} ${f1(by - py)} Q${f1(tx - px * .4)} ${f1(ty - py * .4)} ${f1(tx + px * .6)} ${f1(ty + py * .6)} Q${f1(bx + px * 1.2)} ${f1(by + py * 1.2)} ${f1(bx + px)} ${f1(by + py)}Z`; } return d; }
function flameD(h = 1) { return `M0 0 C-22 -18 -26 -52 -8 -78 C-14 -58 -4 -50 4 -60 C2 -86 18 -104 10 -${f1(140 * h)} C34 -110 44 -70 30 -40 C42 -48 40 -64 36 -72 C56 -46 44 -10 18 2 C10 6 4 4 0 0Z`; }
const WISPS = [[52, 140, .45, -.2], [350, 170, .5, .15], [60, 300, .4, .1]];
const BODY = 'M200 100 C260 100 304 142 310 204 C316 266 300 312 262 336 C240 350 220 354 200 354 C180 354 160 350 138 336 C100 312 84 266 90 204 C96 142 140 100 200 100 Z';
const EAR = 'M126 162 C120 120 112 80 102 34 C136 68 166 100 184 130 Z';
const ARM = 'M104 238 C80 228 62 208 58 188 C56 174 70 168 82 176 C96 186 108 202 122 214 Z';
stage.innerHTML = `<svg viewBox="0 0 400 420" aria-hidden="true">
  <defs>
    <radialGradient id="furG" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#ffffff"/><stop offset=".75" stop-color="#ffffff"/><stop offset="1" stop-color="#e6eaf3"/></radialGradient>
    <radialGradient id="furG2" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9edf5"/></radialGradient>
    <linearGradient id="wispG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--wisp, #ffffff)" stop-opacity=".85"/><stop offset="1" stop-color="var(--wisp, #ffffff)" stop-opacity="0"/></linearGradient>
    <radialGradient id="eyeG" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#22222a"/><stop offset=".7" stop-color="#16161b"/><stop offset="1" stop-color="#0d0d11"/></radialGradient>
    <radialGradient id="mouthG" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#3a3b44"/><stop offset=".6" stop-color="#1e1f26"/><stop offset="1" stop-color="#111116"/></radialGradient>
    <filter id="aura" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="22" result="far"/><feFlood flood-color="#fff" flood-opacity=".5"/><feComposite in2="far" operator="in" result="fg"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="near"/><feFlood flood-color="#fff" flood-opacity=".85"/><feComposite in2="near" operator="in" result="ng"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="soft"/><feMerge><feMergeNode in="fg"/><feMergeNode in="ng"/><feMergeNode in="soft"/></feMerge>
    </filter>
    <filter id="wglow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>
    <filter id="far" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="38"/></filter>
  </defs>
  <ellipse id="halo" cx="200" cy="230" rx="140" ry="130" fill="#fff" opacity=".18" filter="url(#far)"/>
  <g id="gSil">${WISPS.map(([x, y, s, r], i) => `<g class="wisp" id="w${i}" transform="translate(${x} ${y})"><g filter="url(#wglow)"><path d="${flameD()}" fill="url(#wispG)" transform="scale(${s}) rotate(${r * 57})"/></g></g>`).join('')}</g>
  <g filter="url(#aura)">
    <g id="tail"></g>
    <g id="tf0"><path d="${EAR}" fill="url(#furG2)"/></g>
    <g id="tf1"><path d="${EAR}" transform="translate(400 0) scale(-1 1)" fill="url(#furG2)"/></g>
    <g id="footL"><ellipse cx="152" cy="352" rx="30" ry="19" fill="url(#furG2)"/></g>
    <g id="footR"><ellipse cx="248" cy="352" rx="30" ry="19" fill="url(#furG2)"/></g>
    <path d="${BODY}" transform="translate(200 230) scale(.95) translate(-200 -230)" fill="url(#furG)"/>
    <g id="armL"><path d="${ARM}" fill="url(#furG2)"/></g>
    <g id="armR"><path d="${ARM}" transform="translate(400 0) scale(-1 1)" fill="url(#furG2)"/></g>
  </g>
  <g id="gFace" filter="url(#soft)">
    <path id="eyeL" fill="url(#eyeG)"/><path id="eyeR" fill="url(#eyeG)"/>
    <ellipse id="pupL" rx="3" ry="4" fill="#fff"/><ellipse id="pupR" rx="3" ry="4" fill="#fff"/>
    <circle id="hiL" r="0"/><circle id="hiR" r="0"/>
    <path id="mouth" fill="url(#mouthG)"/><path id="tongue" fill="#d77a9c"/><path id="fangs" fill="#c9ccd6"/>
  </g>
</svg>`;
const el = (id) => stage.querySelector('#' + id);
const gSil = el('gSil'), gFace = el('gFace'), armL = el('armL'), armR = el('armR'), footL = el('footL'), footR = el('footR'), tailG = el('tail');
const eyeL = el('eyeL'), eyeR = el('eyeR'), pupL = el('pupL'), pupR = el('pupR'), hiL = el('hiL'), hiR = el('hiR'), mouthP = el('mouth'), tongueP = el('tongue'), fangsP = el('fangs');
const tufts = [el('tf0'), el('tf1')], wisps = WISPS.map((_, i) => el('w' + i));
const PIV = { tf: [[150, 140], [250, 140]], armL: [116, 220], armR: [284, 220] };
const sky = $('#sky'), sc = sky.getContext('2d');
function drawSky() { sky.width = innerWidth; sky.height = innerHeight * 1.4; for (let i = 0; i < 260; i++) { sc.fillStyle = `rgba(255,255,255,${.1 + Math.random() * .45})`; sc.beginPath(); sc.arc(Math.random() * sky.width, Math.random() * sky.height, Math.random() * 1.1 + .2, 0, 7); sc.fill(); } }
drawSky(); addEventListener('resize', drawSky);

/* ---------- cara paramétrica ---------- */
// ojo: in/out esquinas, up/lo párpados, open apertura · boca: w, cy, mup, mlo, teeth, tongue
const P = (o) => ({ in: 16, out: -16, up: -22, lo: 30, open: 1, w: 96, cy: -20, mup: 10, mlo: 82, teeth: 1, tongue: 0, ...o });
const CARAS = {
  contento: P({}), feliz: P({ in: 8, out: 8, up: -40, lo: -4, w: 80, mlo: 80 }), risa: P({ in: 10, out: 10, up: -42, lo: -10, w: 88, cy: -16, mlo: 100 }),
  malvado: P({ in: 16, out: -18, up: -16, lo: 34, w: 92, cy: -22, mup: 10, mlo: 70, tongue: 0 }), chulo: P({ in: 6, out: -10, up: -22, lo: 30, w: 66, cy: -2, mup: 6, mlo: 34, tongue: 0 }),
  sorpresa: P({ up: -54, lo: 52, w: 26, cy: 8, mup: -20, mlo: 44, teeth: 0, tongue: 0 }), enfado: P({ in: 26, out: -22, up: -6, lo: 34, w: 64, cy: 10, mup: 4, mlo: 30, tongue: 0 }),
  triste: P({ in: -18, out: 14, up: -30, lo: 38, w: 48, cy: 26, mup: -4, mlo: 6, teeth: 0, tongue: 0 }), dormido: P({ in: 6, out: 6, up: 4, lo: 6, open: 0, w: 40, cy: 8, mup: 6, mlo: 14, teeth: 0, tongue: 0 }),
  pensando: P({ up: -34, lo: 30, w: 40, cy: 6, mup: 2, mlo: 16, teeth: 0, tongue: 0 }), asustado: P({ up: -56, lo: 50, w: 60, cy: 10, mup: -4, mlo: 28, tongue: 0 }),
  aburrido: P({ up: -4, lo: 40, w: 40, cy: 10, mup: 8, mlo: 10, teeth: 0, tongue: 0 }), lengua: P({ in: 8, out: 8, up: -40, lo: -4, w: 70, mlo: 72, tongue: 1.6 }),
  guino: P({ w: 70, cy: -6, mlo: 50 }), amor: P({}), mareado: P({ w: 50, mlo: 24, teeth: 0 }), estrellas: P({ w: 84, mlo: 90 }), muerto: P({ open: 0, w: 44, cy: 8, mup: 6, mlo: 12, teeth: 0, tongue: 0 }),
  neutro: P({ up: -40, lo: 36, w: 40, cy: 8, mup: 6, mlo: 12, teeth: 0, tongue: 0 }),
};
const F = { ...CARAS.contento, blink: 0, wink: 0, look: 0, lookY: 0, talk: 0 };
let T = { ...CARAS.contento, wink: 0 }, faceTimer, talkUntil = 0, faceName = 'contento';
function cara(n) { faceName = CARAS[n] ? n : 'contento'; T = { ...CARAS[faceName], wink: faceName === 'guino' ? 1 : 0 }; }
function caraUn(n, ms = 2600) { cara(n); clearTimeout(faceTimer); faceTimer = setTimeout(() => cara('contento'), ms); }
const EYE = { L: [158, 196], R: [242, 196] };
function drawFace() {
  for (const [p, pu, hi, side, c] of [[eyeL, pupL, hiL, -1, EYE.L], [eyeR, pupR, hiR, 1, EYE.R]]) {
    const open = Math.max(F.open * (1 - F.blink) * (side === 1 ? 1 - F.wink : 1), .04), mid = (F.in + F.out) / 2, up = mid + (F.up - mid) * open, lo = mid + (F.lo - mid) * open, sx = side * .62, s = .62;
    p.setAttribute('d', `M-50 ${f1(F.in)} C-50 ${f1(up)} 50 ${f1(up)} 50 ${f1(F.out)} C50 ${f1(lo)} -50 ${f1(lo)} -50 ${f1(F.in)} Z`);
    p.setAttribute('transform', `translate(${c[0]} ${c[1]}) scale(${sx} ${s})`); p.setAttribute('stroke', 'none');
    const heart = faceName === 'amor', show = open > .3;
    const px = c[0] + F.look * 9, py = c[1] + (mid + (lo - up) * .05) * s + F.lookY * 5;
    pu.setAttribute('cx', f1(px)); pu.setAttribute('cy', f1(py)); pu.setAttribute('ry', f1((heart ? 9 : 4) * Math.min(1, open * 1.4))); pu.setAttribute('rx', heart ? 9 : 3);
    pu.setAttribute('fill', heart ? '#ff5c9a' : '#ffffff'); pu.setAttribute('opacity', show ? 1 : 0);
    hi.setAttribute('cx', f1(px + 4)); hi.setAttribute('cy', f1(py - 6)); hi.setAttribute('opacity', show ? .95 : 0);
  }
  const w = F.w, cy = F.cy, lo = F.mlo + F.talk * 20, top = F.mup - F.talk * 3, tr = `translate(200 252) scale(.72)`;
  const md = `M${f1(-w)} ${f1(cy)} Q0 ${f1(lo * 2 - cy)} ${f1(w)} ${f1(cy)} Q0 ${f1(top * 2 - cy)} ${f1(-w)} ${f1(cy)} Z`;
  mouthP.setAttribute('d', md); mouthP.setAttribute('transform', tr); mouthP.setAttribute('stroke', 'none'); mouthP.setAttribute('stroke-linejoin', 'round');
  const tg = Math.min(1.4, F.tongue), ty = lo * .82;
  tongueP.setAttribute('d', tg > .05 && lo > 20 ? `M${f1(-w * .45 * tg)} ${f1(ty)} Q0 ${f1(ty - 26 * tg)} ${f1(w * .45 * tg)} ${f1(ty)} Q${f1(w * .3)} ${f1(lo * 1.02)} 0 ${f1(lo * 1.02)} Q${f1(-w * .3)} ${f1(lo * 1.02)} ${f1(-w * .45 * tg)} ${f1(ty)}Z` : '');
  tongueP.setAttribute('transform', tr);
  let fd = '';
  if (F.teeth > .05 && w > 34) {
    for (const sx of [-1, 1]) { const x = sx * w * .5, tt = x / w, y = cy + (top * 2 - 2 * cy) * (1 - tt * tt) * .5; fd += `M${f1(x - 10)} ${f1(y - 2)} L${f1(x + sx)} ${f1(y + 22 * F.teeth)} L${f1(x + 10)} ${f1(y - 2)}Z`; }
    for (const sx of [-1, 1]) { const x = sx * w * .28, tt = x / w, y = cy + (lo * 2 - 2 * cy) * (1 - tt * tt) * .5; if (false) fd += `M${f1(x - 7)} ${f1(y + 2)} L${f1(x)} ${f1(y - 12 * F.teeth)} L${f1(x + 7)} ${f1(y + 2)}Z`; }
  }
  fangsP.setAttribute('d', fd); fangsP.setAttribute('transform', tr);
}
const FACE_KEYS = ['in', 'out', 'up', 'lo', 'open', 'w', 'cy', 'mup', 'mlo', 'teeth', 'tongue', 'wink'];
function tweenFace(dt, now) {
  const k = 1 - Math.exp(-dt * 14);
  for (const key of FACE_KEYS) F[key] += ((T[key] ?? 0) - F[key]) * k;
  const talkT = bubble.classList.contains('show') && now < talkUntil ? (.5 + .5 * Math.sin(now / 55)) * (.6 + .4 * Math.sin(now / 130)) : 0;
  F.talk += (talkT - F.talk) * Math.min(1, dt * 30);
  drawFace();
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

/* ---------- poderes extra (la IA los combina como quiera) ---------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, +v || 0));
const OV = { until: 0, x: 50, y: 50, size: 1, follow: false, hide: false };
function mover(x, y, ms = 5000) { Object.assign(OV, { x: clamp(x, 5, 95), y: clamp(y, 12, 90), until: performance.now() + clamp(ms, 800, 12000), follow: false, hide: false }); }
function perseguir(ms = 4000) { Object.assign(OV, { follow: true, hide: false, until: performance.now() + clamp(ms, 1000, 10000) }); }
function esconderse(ms = 4000) { Object.assign(OV, { hide: true, follow: false, x: Math.random() > .5 ? 102 : -2, y: 60 + Math.random() * 25, until: performance.now() + clamp(ms, 1500, 10000) }); }
let sizeMul = 1, sizeUntil = 0;
function tamano(v, ms = 5000) { sizeMul = clamp(v, .4, 1.8); sizeUntil = performance.now() + clamp(ms, 800, 12000); }
const setStops = (id, cols) => stage.querySelectorAll(`#${id} stop`).forEach((st, i) => cols[i] && st.setAttribute('stop-color', cols[i]));
const FUR0 = ['#ffffff', '#ffffff', '#e6eaf3'], EYE0 = ['#22222a', '#16161b', '#0d0d11'];
const hexOk = (h) => /^#[0-9a-f]{6}$/i.test(String(h));
const shade = (h, k) => '#' + hex2(h).map((c) => Math.round(Math.min(255, c * k)).toString(16).padStart(2, '0')).join('');
let colTimer;
function colorPelo(h, ms = 6000) { if (!hexOk(h)) return; setStops('furG', [shade(h, 1.5), h, shade(h, .5)]); setStops('furG2', [shade(h, 1.3), shade(h, .5)]); clearTimeout(colTimer); colTimer = setTimeout(() => { setStops('furG', FUR0); setStops('furG2', ['#ffffff', '#e9edf5']); }, clamp(ms, 1500, 15000)); }
let eyeTimer;
function colorOjos(h, ms = 6000) { if (!hexOk(h)) return; setStops('eyeG', [shade(h, 1.5), h, shade(h, .7)]); clearTimeout(eyeTimer); eyeTimer = setTimeout(() => setStops('eyeG', EYE0), clamp(ms, 1500, 15000)); }
function pantalla(k) {
  const b = document.body;
  if (k === 'temblar') { b.classList.remove('fx-shake'); void b.offsetWidth; b.classList.add('fx-shake'); setTimeout(() => b.classList.remove('fx-shake'), 700); }
  else if (k === 'flash' || k === 'rayo') { const f = document.createElement('div'); f.className = 'fx-flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 600); if (k === 'rayo') rayo(); }
  else if (k === 'oscurecer') { b.classList.add('fx-dim'); setTimeout(() => b.classList.remove('fx-dim'), 2600); }
  else if (k === 'invertir') { b.classList.add('fx-invert'); setTimeout(() => b.classList.remove('fx-invert'), 900); }
}
function rayo() {
  const o = screenPos(0, 1.2), sv = document.createElementNS(NS, 'svg'); sv.setAttribute('class', 'fx-bolt'); sv.setAttribute('width', innerWidth); sv.setAttribute('height', innerHeight);
  let d = `M${o.x + (Math.random() - .5) * 200} 0`, y = 0; while (y < o.y) { y += 40 + Math.random() * 50; d += ` L${o.x + (Math.random() - .5) * 90} ${Math.min(y, o.y)}`; }
  sv.innerHTML = `<path d="${d}" fill="none" stroke="#e6d6ff" stroke-width="4" stroke-linejoin="round" style="filter:drop-shadow(0 0 10px #a77bff)"/>`; document.body.appendChild(sv); setTimeout(() => sv.remove(), 450);
}
function resaltar(id) {
  const t = /^\d+$/.test(String(id)) ? document.getElementById('p-' + id) : document.getElementById(String(id));
  if (!t) return; t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  const box = t.querySelector('.ch__text') || t; box.classList.remove('fx-hl'); void box.offsetWidth; box.classList.add('fx-hl'); setTimeout(() => box.classList.remove('fx-hl'), 2400);
}
function clonar(n = 3) {
  n = clamp(n, 1, 6);
  for (let i = 0; i < n; i++) { const c = stage.cloneNode(true); c.removeAttribute('id'); c.classList.add('fx-clone'); c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c);
    const dx = (Math.random() - .5) * innerWidth * .6, dy = (Math.random() - .5) * innerHeight * .4, base = stage.style.transform;
    c.animate([{ transform: base, opacity: .9 }, { transform: `${base} translate(${dx}px, ${dy}px) scale(.6)`, opacity: 0 }], { duration: 1600 + i * 200, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.then(() => c.remove()); }
}
function lluvia(g = '✦') {
  if (reduced) return; g = String(g || '✦').slice(0, 2);
  for (let i = 0; i < 26; i++) { const e = document.createElement('i'); e.textContent = g; e.style.left = `${Math.random() * 100}vw`; e.style.top = '-40px'; e.style.fontSize = `${16 + Math.random() * 22}px`; e.style.color = '#d9c6ff'; fx.appendChild(e);
    e.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: `translateY(${innerHeight + 80}px) rotate(${(Math.random() - .5) * 360}deg)`, opacity: .6 }], { duration: 1800 + Math.random() * 1600, delay: Math.random() * 600, easing: 'linear', fill: 'backwards' }).finished.then(() => e.remove()); }
}
function caraLibre(o) { if (!o || typeof o !== 'object') return; for (const k of FACE_KEYS) if (k in o) T[k] = clamp(o[k], -80, 160); clearTimeout(faceTimer); faceTimer = setTimeout(() => cara('contento'), 3500); }
let nextT;
function siguiente(sec) { clearTimeout(nextT); const s2 = clamp(sec, 15, 180); nextT = setTimeout(() => { if (!document.hidden) think('libre', {}, 12000); }, s2 * 1000); }

/* ---------- ejecutor de acciones (lista blanca) ---------- */
const hist = [];
let queue = Promise.resolve();
function run(acciones) {
  const list = (Array.isArray(acciones) ? acciones : []).slice(0, 8).flatMap((a) => a && a.meme && MEMES[a.meme] ? MEMES[a.meme] : [a]);
  queue = queue.then(async () => {
    for (const a of list) {
      if (!a || typeof a !== 'object') continue;
      if (a.cara) caraUn(a.cara, 3200);
      if (a.cara_libre) caraLibre(a.cara_libre);
      if (a.color) color(a.color);
      if (a.color_llamas) color(a.color_llamas, 6000);
      if (a.color_pelo) colorPelo(a.color_pelo, a.ms);
      if (a.color_ojos) colorOjos(a.color_ojos, a.ms);
      if (a.mover) mover(a.mover.x, a.mover.y, a.mover.ms);
      if (a.volver) OV.until = 0;
      if (a.perseguir_cursor) perseguir(a.perseguir_cursor);
      if (a.esconderse) esconderse(a.esconderse);
      if (a.tamano) tamano(a.tamano, a.ms);
      if (a.pantalla) pantalla(a.pantalla);
      if (a.clonar) clonar(a.clonar);
      if (a.lluvia) lluvia(a.lluvia);
      if (a.resaltar != null) resaltar(a.resaltar);
      if (a.efecto) efecto(a.efecto, a.texto);
      if (a.terminal) decir(`> ${String(a.terminal).slice(0, 80)}`, 2600);
      if (a.decir) { decir(a.decir, a.ms || 3200); hist.push({ dijo: String(a.decir).slice(0, 90) }); await sleep(500); }
      if (a.animacion) await sleep(anim(a.animacion) * .7);
      if (a.esperar) await sleep(Math.min(+a.esperar || 0, 4000));
      if (a.ir) document.getElementById(a.ir)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      if (a.siguiente) siguiente(a.siguiente);
    }
  }).catch(() => {});
}
window.s0k1x = { run, cara, anim, decir, efecto, color, mover, perseguir, esconderse, tamano, pantalla, clonar, lluvia, resaltar, colorPelo, colorOjos,
  memes: Object.keys(MEMES), caras: Object.keys(CARAS), animaciones: Object.keys(ANIMS) };

/* =========================================================
   Cerebro: Gemini vía Supabase, con respaldo local
   ========================================================= */
let calls = 0, lastCall = 0, aiDown = false;
const LOCAL = {
  inicio: () => [{ cara: 'malvado' }, { animacion: 'saludar' }, { decir: 'Muajaja. Soy Chispa y esta web es mía. Bueno, de s0k1x. De momento.' }],
  seccion: (c) => c.seccion === 'contacto' ? [{ cara: 'feliz' }, { animacion: 'saltar' }, { decir: '¿Hablamos? s0k1x contesta rápido.' }]
    : c.seccion === 'kit' ? [{ cara: 'chulo' }, { animacion: 'girar' }] : c.seccion === 'herramientas' ? [{ cara: 'pensando' }, { animacion: 'asentir' }] : [{ cara: 'feliz' }, { animacion: 'flotar' }],
  proyecto: () => [{ cara: pick(['feliz', 'chulo', 'amor']) }, { animacion: pick(['saltar', 'girar', 'rebotar', 'latido']) }],
  clic: () => pick([[{ cara: 'malvado' }, { animacion: 'risa_malvada' }, { decir: 'Jejeje... Has caído en mi trampa.' }], [{ cara: 'chulo' }, { animacion: 'voltereta' }], [{ cara: 'risa' }, { animacion: 'pirueta' }], [{ cara: 'feliz' }, { animacion: 'rueda' }], [{ cara: 'risa' }, { animacion: 'reir' }], [{ meme: '67' }], [{ cara: 'sorpresa' }, { animacion: 'teletransporte' }], [{ cara: 'lengua' }, { animacion: 'bailar' }], [{ cara: 'mareado' }, { animacion: 'girar' }]]),
  inactivo: () => [{ cara: 'dormido' }, { efecto: 'zzz' }, { animacion: 'dormir' }],
  libre: () => pick([[{ cara: 'malvado' }, { esconderse: 3000 }, { esperar: 2500 }, { decir: 'Jejeje, ¿me has echado de menos?' }], [{ perseguir_cursor: 3500 }, { cara: 'chulo' }], [{ cara: 'malvado' }, { clonar: 3 }, { decir: 'Somos legión. Bueno, somos tres.' }], [{ pantalla: 'rayo' }, { cara: 'risa' }, { animacion: 'risa_malvada' }]]),
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
  const pose = currentEl?.dataset.pose || 'hero', W = innerWidth, H = innerHeight, now = performance.now();
  if (mobile()) Object.assign(target, { x: W * .5, y: H * .27, size: Math.min(W * .62, H * .36) });
  else if (pose === 'center') Object.assign(target, { x: W * .5, y: H * .3, size: Math.min(H * .36, 320) });
  else Object.assign(target, { x: W * (pose === 'hero' ? .7 : .7), y: H * .5, size: Math.min(H * .58, 520) });
  if (now < OV.until) {
    if (OV.follow) { target.x = (ptr.x + 1) / 2 * W + 120; target.y = (ptr.y + 1) / 2 * H - 40; target.size *= .6; }
    else { target.x = OV.x / 100 * W; target.y = OV.y / 100 * H; if (OV.hide) target.size *= .8; }
  }
  if (now < sizeUntil) target.size *= sizeMul;
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
  // manos flotando separadas del cuerpo, cada una con su propio vaivén
  const hl = A.armL, hr = A.armR;
  armL.setAttribute('transform', `translate(${f1(-10 - hl * 10 + S(t * 1.7) * 3)} ${f1(-hl * 34 + S(t * 2.1 + .6) * 7)}) rotate(${f1(-hl * 14 + S(t * 1.3) * 5)} ${PIV.armL[0]} ${PIV.armL[1]})`);
  armR.setAttribute('transform', `translate(${f1(10 + hr * 10 + S(t * 1.6 + 2) * 3)} ${f1(-hr * 34 + S(t * 2.3 + 1.9) * 7)}) rotate(${f1(hr * 14 + S(t * 1.4 + 1) * 5)} ${PIV.armR[0]} ${PIV.armR[1]})`);
  const kick = S(t * 2.6) * 3, air = Math.min(1, Math.max(0, A.y - .15) * 2);
  footL.setAttribute('transform', `translate(${f1(-air * 6)} ${f1(kick - air * 10)})`);
  footR.setAttribute('transform', `translate(${f1(air * 6)} ${f1(-kick - air * 10)})`);
  // movimiento secundario tipo muelle en orejas
  const vx = (cx - prevX) / Math.max(dt, .001), vy = (cy - prevY) / Math.max(dt, .001); prevX = cx; prevY = cy;
  sprX += (Math.max(-1, Math.min(1, -vx / 900)) - sprX) * .1; sprY += (Math.max(-1, Math.min(1, vy / 900)) - sprY) * .1;
  tufts.forEach((tf, i) => { const [px, py] = PIV.tf[i]; tf.setAttribute('transform', `rotate(${f1((sprX * 18 + S(t * 2.3 + i * 1.7) * 3 + (i ? 1 : -1) * Math.max(0, -sprY) * 12))} ${px} ${py}) translate(${px} ${py}) scale(1 ${f1(1 + sprY * .25 + S(t * 4 + i * 2) * .05)}) translate(${-px} ${-py})`); });
  tint = tint.map((c, i) => c + ((tintOverride && now < tintOverrideUntil ? tintOverride : tintTarget)[i] - c) * .06);
    const wc = tint.map((c) => Math.round(255 - (255 - c) * .6));
  gSil.style.setProperty('--wisp', `rgb(${wc.join(',')})`);
  wisps.forEach((w, i) => { const [x, y] = WISPS[i]; w.setAttribute('transform', `translate(${f1(x + S(t * .9 + i) * 6)} ${f1(y + S(t * 1.3 + i * 2) * 8)}) rotate(${f1(S(t * 1.7 + i) * 8)}) scale(${f1(1 + S(t * 6 + i * 3) * .05)} ${f1(1 + S(t * 5 + i) * .08)})`); w.style.opacity = .75 + S(t * 3 + i * 1.3) * .25; });
  tailG.setAttribute('transform', `rotate(${f1(S(t * 1.6) * 5 + sprX * 14)} 160 330)`);
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
cara('contento');
observeChapters();
getProjects().then((p) => { PROJECTS = p; renderProjects(); });
setTimeout(() => think('inicio', {}, 0), 1200);
poke();
