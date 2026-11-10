import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

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
const rng = (seed) => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const PI2 = Math.PI / 2;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = () => innerWidth <= 820;
const HUES = ['#ff9a6b', '#ff6b7a', '#6bffb0', '#6bb6ff', '#ffd36b', '#6bfff0', '#ff8ad8', '#b8ff6b', '#ffb36b'];

/* =========================================================
   Chispa: silueta vectorial 2D con resplandor (SVG), animada cada frame
   ========================================================= */
const stage = $('#ghost');
const f1 = (n) => (+n).toFixed(1);
/* =========================================================
   Chispa 3D: modelado suave de alta resolución (Three.js, sin archivos)
   ========================================================= */
const cv3 = document.createElement('canvas'); stage.appendChild(cv3);
const renderer = new THREE.WebGLRenderer({ canvas: cv3, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
const RES = mobile() ? 520 : 760;
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(RES, RES, false);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, .1, 50); camera.position.set(0, .15, 9);
scene.add(new THREE.HemisphereLight('#ffffff', '#7d84a3', 1.15));
const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(-2.5, 3.5, 4); scene.add(key);
const rim = new THREE.DirectionalLight('#dfe6ff', 2.2); rim.position.set(1.5, 2, -4); scene.add(rim);
const skin = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: .34, roughness: .55, metalness: 0 });
const ghost = new THREE.Group(), rig = new THREE.Group(); ghost.add(rig); scene.add(ghost);
const smooth = (pts, n = 72) => new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(n);
// cuerpo de pera
const body = new THREE.Mesh(new THREE.LatheGeometry(smooth([[0, 1.3], [.52, 1.18], [.86, .95], [1.05, .55], [1.1, .1], [1.08, -.35], [.95, -.78], [.62, -1.05], [.3, -1.18], [.001, -1.22]]), 128), skin);
body.scale.z = .86; rig.add(body);
// orejas en punta, ligeramente curvas y aplanadas
function earGeo() { const g = new THREE.LatheGeometry(smooth([[.36, 0], [.35, .18], [.3, .4], [.2, .6], [.1, .72], [.001, .76]], 48), 64); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) - y * y * .12); } g.computeVertexNormals(); return g; }
const ears = [-1, 1].map((s) => { const pv = new THREE.Group(); pv.position.set(s * .58, .9, 0); pv.rotation.z = -s * .3;
  const m = new THREE.Mesh(earGeo(), skin); m.scale.set(s, 1, .5); pv.add(m); rig.add(pv); return pv; });
// patitas
const feet = [-1, 1].map((s) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.3, 48, 32), skin); m.scale.set(1, .62, 1.05); m.position.set(s * .5, -1.2, .18); rig.add(m); return m; });
// bracitos cortos y gruesos
const arms = [-1, 1].map((s) => { const g = new THREE.Group(); g.position.set(s * .82, .12, .05);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(.16, .38, 12, 32), skin); m.position.y = .3; g.add(m); g.rotation.z = -s * 1.0; rig.add(g); return g; });
// llamitas flotantes
function flameTex() { const c = document.createElement('canvas'); c.width = 128; c.height = 256; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 190, 4, 64, 160, 120); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(240,240,255,.8)'); g.addColorStop(1, 'rgba(220,220,255,0)');
  x.fillStyle = g; x.beginPath(); x.moveTo(64, 8); x.bezierCurveTo(96, 80, 124, 140, 116, 192); x.bezierCurveTo(108, 244, 20, 244, 12, 192); x.bezierCurveTo(4, 140, 32, 80, 64, 8); x.fill(); return new THREE.CanvasTexture(c); }
const fTex = flameTex();
const WISPS = [[-1.65, .9, .32], [1.6, .55, .36], [-1.5, -.6, .28]];
const wisps = WISPS.map(([x, y, k]) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.set(k, k * 2, 1); sp.position.set(x, y, -.2); ghost.add(sp); return sp; });
// cara: textura de alta resolución proyectada sobre el cuerpo (decal)
const fCv = document.createElement('canvas'); fCv.width = fCv.height = 1024; const fx2 = fCv.getContext('2d');
const fTexFace = new THREE.CanvasTexture(fCv); fTexFace.colorSpace = THREE.SRGBColorSpace; fTexFace.anisotropy = 8;
body.updateMatrixWorld(true);
const faceMesh = new THREE.Mesh(new DecalGeometry(body, new THREE.Vector3(0, 0, 1.2), new THREE.Euler(0, 0, 0), new THREE.Vector3(2.2, 2.2, 2.6)),
  new THREE.MeshBasicMaterial({ map: fTexFace, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8, toneMapped: false, side: THREE.DoubleSide, depthTest: false }));
faceMesh.renderOrder = 2;
rig.add(faceMesh);
const gFace = faceMesh;
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
let eyeCol = '#16161b';
function drawFace() {
  const c = fx2, k = 1024 / 220; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 1024, 1024);
  c.setTransform(k, 0, 0, k, -90 * k, -120 * k);
  for (const [side, e] of [[-1, EYE.L], [1, EYE.R]]) {
    const open = Math.max(F.open * (1 - F.blink) * (side === 1 ? 1 - F.wink : 1), .04), mid = (F.in + F.out) / 2, up = mid + (F.up - mid) * open, lo = mid + (F.lo - mid) * open, s = .62;
    c.save(); c.translate(e[0], e[1]); c.scale(side * s, s);
    c.fillStyle = eyeCol; c.fill(new Path2D(`M-50 ${f1(F.in)} C-50 ${f1(up)} 50 ${f1(up)} 50 ${f1(F.out)} C50 ${f1(lo)} -50 ${f1(lo)} -50 ${f1(F.in)} Z`)); c.restore();
    if (open > .3) { const heart = faceName === 'amor', px = e[0] + F.look * 9, py = e[1] + mid * s + F.lookY * 5;
      c.fillStyle = heart ? '#ff5c9a' : '#ffffff'; c.beginPath(); c.ellipse(px, py, heart ? 9 : 3, (heart ? 9 : 4) * Math.min(1, open * 1.4), 0, 0, 7); c.fill(); }
  }
  const w = F.w, cy = F.cy, lo = F.mlo + F.talk * 20, top = F.mup - F.talk * 3;
  c.save(); c.translate(200, 252); c.scale(.72, .72);
  const mp = new Path2D(`M${f1(-w)} ${f1(cy)} Q0 ${f1(lo * 2 - cy)} ${f1(w)} ${f1(cy)} Q0 ${f1(top * 2 - cy)} ${f1(-w)} ${f1(cy)} Z`);
  const g = c.createRadialGradient(0, cy + 10, 4, 0, cy + 20, w); g.addColorStop(0, '#3a3b44'); g.addColorStop(.6, '#1e1f26'); g.addColorStop(1, '#111116');
  c.fillStyle = g; c.fill(mp); c.save(); c.clip(mp);
  const tg = Math.min(1.4, F.tongue), ty = lo * .82;
  if (tg > .05 && lo > 20) { c.fillStyle = '#d77a9c'; c.beginPath(); c.ellipse(0, ty + 8, w * .42 * tg, 22 * tg, 0, 0, 7); c.fill(); }
  if (F.teeth > .05 && w > 34) { c.fillStyle = '#c9ccd6'; for (const sx of [-1, 1]) { const x = sx * w * .5, tt = x / w, y = cy + (top * 2 - 2 * cy) * (1 - tt * tt) * .5; c.beginPath(); c.moveTo(x - 10, y - 2); c.lineTo(x + sx, y + 22 * F.teeth); c.lineTo(x + 10, y - 2); c.fill(); } }
  c.restore(); c.restore();
  fTexFace.needsUpdate = true;
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
const FUR0 = ['#ffffff', '#ffffff', '#e6eaf3'], EYE0 = ['#22222a', '#16161b', '#0d0d11'];
const hexOk = (h) => /^#[0-9a-f]{6}$/i.test(String(h));
const shade = (h, k) => '#' + hex2(h).map((c) => Math.round(Math.min(255, c * k)).toString(16).padStart(2, '0')).join('');
let colTimer;
function colorPelo(h, ms = 6000) { if (!hexOk(h)) return; skin.color.set(h); skin.emissive.set(h); clearTimeout(colTimer); colTimer = setTimeout(() => { skin.color.set('#ffffff'); skin.emissive.set('#ffffff'); }, clamp(ms, 1500, 15000)); }
let eyeTimer;
function colorOjos(h, ms = 6000) { if (!hexOk(h)) return; eyeCol = h; clearTimeout(eyeTimer); eyeTimer = setTimeout(() => { eyeCol = '#16161b'; }, clamp(ms, 1500, 15000)); }
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
  const num = /^\d+$/.test(String(id));
  if (num) select(+id);
  const t = num ? document.getElementById('proyectos') : document.getElementById(String(id));
  if (!t) return; t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  const box = (num && list.querySelector(`[data-i="${+id}"]`)) || t.querySelector('.kit, .projects, .head') || t;
  box.classList.remove('fx-hl'); void box.offsetWidth; box.classList.add('fx-hl'); setTimeout(() => box.classList.remove('fx-hl'), 2400);
}
function clonar(n = 3) {
  n = clamp(n, 1, 6);
  for (let i = 0; i < n; i++) { const c = stage.cloneNode(false); c.removeAttribute('id'); c.classList.add('ghost', 'fx-clone'); const im = new Image(); im.src = cv3.toDataURL(); im.style.cssText = 'width:100%;height:100%'; c.appendChild(im); c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c);
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
  let cfg = { proyectos: [] };
  try { const r = await fetch('projects.json', { cache: 'no-cache' }); if (r.ok) cfg = await r.json(); } catch {}
  return (cfg.proyectos || []).filter((p) => p && p.mostrar !== false && (p.nombre || p.repo)).map((p) => ({
    id: p.repo || p.nombre, name: p.nombre || p.repo, priv: !!p.privado, lang: p.lenguaje || '', year: p.año || p.ano || '',
    desc: p.descripcion || '', web: p.web || '', code: p.codigo || (!p.privado && p.repo ? `https://github.com/${CONFIG.github}/${p.repo}` : ''),
    images: (p.imagenes || []).filter(Boolean), links: (p.enlaces || []).filter((l) => l?.url),
  }));
}
const hue = (p) => HUES[hash(p.id) % HUES.length];
let sel = 0;
const list = $('#projects');
function renderProjects() {
  $('#projCount').textContent = PROJECTS.length ? `${PROJECTS.length} proyectos` : '';
  if (!PROJECTS.length) { list.innerHTML = '<li class="empty">Pronto habrá proyectos aquí.</li>'; return; }
  list.innerHTML = PROJECTS.map((p, i) => {
    const meta = [p.priv && '<span class="tag">Privado</span>', p.lang && `<span>${esc(p.lang)}</span>`, p.year && `<span>${esc(p.year)}</span>`].filter(Boolean).join('');
    const links = [p.web && `<a href="${esc(p.web)}" target="_blank" rel="noopener">Web ↗</a>`, p.code && `<a href="${esc(p.code)}" target="_blank" rel="noopener">Código ↗</a>`, ...p.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.texto || 'Referencia')} ↗</a>`)].filter(Boolean).join('');
    return `<li class="project" data-i="${i}"><div><h3>${esc(p.name)}</h3>${p.desc ? `<p>${esc(p.desc)}</p>` : ''}${meta ? `<div class="meta">${meta}</div>` : ''}${links ? `<div class="links">${links}</div>` : ''}${p.images.length ? `<div class="shots">${p.images.slice(0, 4).map((src, k) => `<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="${esc(p.name)}, imagen ${k + 1}" loading="lazy"></a>`).join('')}</div>` : ''}</div></li>`;
  }).join('');
  list.querySelectorAll('.project').forEach((li) => li.addEventListener('pointerenter', () => select(+li.dataset.i, true)));
}
let hoverT;
function select(i, user) {
  if (!PROJECTS[i]) return; sel = i;
  list.querySelectorAll('.project').forEach((li) => li.classList.toggle('is-on', +li.dataset.i === i));
  if (currentSection === 'proyectos') tintTarget = hex2(hue(PROJECTS[i]));
  if (user) { clearTimeout(hoverT); hoverT = setTimeout(() => think('proyecto', {}, 6000), 700); }
}

/* ---------- secciones ---------- */
let currentSection = 'inicio';
const currentProject = () => currentSection === 'proyectos' ? PROJECTS[sel] : null;
const seen = new Set();
const sio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) enterSection(e.target); }), { rootMargin: '-45% 0px -45% 0px' });
document.querySelectorAll('main > section[id]').forEach((n) => sio.observe(n));
function enterSection(el) {
  if (currentSection === el.id) return;
  currentSection = el.id;
  tintTarget = el.id === 'proyectos' && PROJECTS[sel] ? hex2(hue(PROJECTS[sel])) : [255, 255, 255];
  document.querySelectorAll('.nav nav a').forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + el.id));
  if (seen.has(el.id)) return; seen.add(el.id);
  if (el.id !== 'inicio') think('seccion', {}, 5000);
}
document.querySelectorAll('.copy').forEach((b) => b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(b.dataset.copy); } catch {} b.textContent = 'Copiado'; b.classList.add('is-done'); setTimeout(() => { b.textContent = 'Copiar'; b.classList.remove('is-done'); }, 1800); }));

/* =========================================================
   Bucle
   ========================================================= */
const ptr = { x: 0, y: 0 };
addEventListener('pointermove', (e) => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1; poke(); }, { passive: true });
const prog = document.createElement('div'); prog.className = 'progress'; document.body.appendChild(prog);
const G = { x: innerWidth * .7, y: innerHeight * .5, size: 400, u: 140 };
const target = { x: 0, y: 0, size: 400 };
let blinkAt = performance.now() + 2500, first = true, prevX = 0, prevY = 0, sprX = 0, sprY = 0, lastNow = 0, dt = .016;
const slot = $('#stageSlot');
let atSlot = false;
function poseTarget() {
  const W = innerWidth, H = innerHeight, now = performance.now(), r = slot.getBoundingClientRect();
  atSlot = r.width > 0 && r.bottom > 80 && r.top < H * .8;
  if (atSlot) Object.assign(target, { x: r.left + r.width / 2, y: r.top + r.height * .52, size: Math.min(r.width * .9, r.height * 1.12) });
  else { const sz = mobile() ? 110 : 150; Object.assign(target, { x: W - sz / 2 - 14, y: H - sz / 2 - (mobile() ? 78 : 74), size: sz }); }
  if (now < OV.until) {
    if (OV.follow) { target.x = (ptr.x + 1) / 2 * W + 120; target.y = (ptr.y + 1) / 2 * H - 40; target.size = Math.max(target.size * .6, 110); }
    else { target.x = OV.x / 100 * W; target.y = OV.y / 100 * H; target.size = Math.max(target.size, 150); if (OV.hide) target.size *= .8; }
  }
  if (now < sizeUntil) target.size *= sizeMul;
}
const D = 180 / Math.PI;
function frame(now) {
  requestAnimationFrame(frame);
  const t = now / 1000; dt = Math.min((now - lastNow) / 1000, .05); lastNow = now;
  poseTarget();
  const k = first ? 1 : 1 - Math.exp(-dt * (atSlot && performance.now() >= OV.until ? 9 : 3.2)); first = false;
  G.x += (target.x - G.x) * k; G.y += (target.y - G.y) * k; G.size += (target.size - G.size) * k; G.u = G.size * .36;
  const br = S(t * 1.9);
  const A = { x: 0, y: S(t * 1.4) * .09, rx: 0, ry: 0, rz: S(t * .8) * .035, s: 1, sx: 1 - br * .012, sy: 1 + br * .02, armL: S(t * 2.2) * .12, armR: S(t * 2.2 + 1) * .12, op: 1 };
  for (let i = active.length - 1; i >= 0; i--) { const a = active[i], p = (now - a.t0) / a.dur; if (p >= 1) { active.splice(i, 1); continue; } a.fn(p, A); }
  const cx = G.x + A.x * G.u, cy = G.y - A.y * G.u;
  const turn = Math.cos(A.ry + ptr.x * .25), rot = (A.rz + A.rx) * D + ptr.x * 3;
  stage.style.width = stage.style.height = `${G.size}px`;
  stage.style.transform = `translate(${cx - G.size / 2}px, ${cy - G.size / 2}px) rotate(${(A.rz * D + ptr.x * 2).toFixed(2)}deg) scale(${A.s * A.sx}, ${A.s * A.sy})`;
  stage.style.opacity = A.op;
  rig.rotation.set(A.rx + ptr.y * .14, A.ry + ptr.x * .45, 0);
  faceMesh.visible = Math.cos(rig.rotation.y) * Math.cos(rig.rotation.x) > .2;
  const hl = A.armL, hr = A.armR;
  arms[0].rotation.z = (1.0 - hl * .5) + S(t * 1.6) * .05; arms[1].rotation.z = -(1.0 - hr * .5) - S(t * 1.5 + 1) * .05;
  const kick = S(t * 2.6) * .025, air = Math.min(1, Math.max(0, A.y - .15) * 2);
  feet[0].position.set(-.5 - air * .06, -1.2 + kick + air * .08, .18); feet[1].position.set(.5 + air * .06, -1.2 - kick + air * .08, .18);
  const vx = (cx - prevX) / Math.max(dt, .001), vy = (cy - prevY) / Math.max(dt, .001); prevX = cx; prevY = cy;
  sprX += (Math.max(-1, Math.min(1, -vx / 900)) - sprX) * .1; sprY += (Math.max(-1, Math.min(1, vy / 900)) - sprY) * .1;
  ears.forEach((e, i) => { const s2 = i ? 1 : -1; e.rotation.z = -s2 * .3 + sprX * .3 + S(t * 2.3 + i * 1.7) * .04 + s2 * Math.max(0, -sprY) * .2; e.rotation.x = sprY * .2; });
  tint = tint.map((c, i) => c + ((tintOverride && now < tintOverrideUntil ? tintOverride : tintTarget)[i] - c) * .06);
  wisps.forEach((w, i) => { const [x, y, k] = WISPS[i]; w.position.set(x + S(t * .9 + i) * .08, y + S(t * 1.3 + i * 2) * .12, -.2); const f = 1 + S(t * 7 + i * 3) * .06; w.scale.set(k * f, k * 2 * f, 1);
    w.material.color.setRGB(...tint.map((c) => (255 - (255 - c) * .6) / 255)); w.material.opacity = (.75 + S(t * 3 + i * 1.3) * .25) * A.op; });
  F.look += (ptr.x - F.look) * .1; F.lookY += (ptr.y - F.lookY) * .1;
  const bp = (now - blinkAt) / 150; F.blink = bp > 0 && bp < 1 ? Math.sin(bp * Math.PI) : 0;
  if (bp >= 1) blinkAt = now + 2200 + Math.random() * 3200;
  tweenFace(dt, now);
  if (bubble.classList.contains('show')) {
    if (now > bubbleUntil) bubble.classList.remove('show');
    const o = screenPos(.55, mobile() ? 1.7 : 1.45), w = bubble.offsetWidth;
    bubble.style.left = `${Math.min(Math.max(o.x, 12), innerWidth - w - 12)}px`; bubble.style.top = `${Math.max(o.y - bubble.offsetHeight, 70)}px`;
  }
  renderer.render(scene, camera);
  prog.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
}
requestAnimationFrame(frame);

/* ---------- interacción ---------- */
document.addEventListener('click', (e) => { if (e.target.closest('a,button,input,form,summary')) return; if (Math.hypot(e.clientX - G.x, e.clientY - G.y) < G.size * .38) think('clic', {}, 3000); });
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

$('#year').textContent = new Date().getFullYear();

/* ---------- arranque ---------- */
cara('contento');
getProjects().then((p) => { PROJECTS = p; renderProjects(); });
setTimeout(() => think('inicio', {}, 0), 1200);
poke();
