import * as THREE from 'three';

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
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = () => innerWidth <= 820;
const HUES = ['#ff9a6b', '#ff6b7a', '#6bffb0', '#6bb6ff', '#ffd36b', '#6bfff0', '#ff8ad8', '#b8ff6b', '#ffb36b'];

/* =========================================================
   Escena 3D: fantasma llama (geometría por código, sin modelos)
   ========================================================= */
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setClearColor(0x000000, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
camera.position.set(0, 0, 9);

const U = { uTime: { value: 0 }, uTint: { value: new THREE.Color('#ffffff') }, uOpacity: { value: 1 }, uWob: { value: 1 } };
const bodyMat = new THREE.ShaderMaterial({
  uniforms: U, transparent: true,
  vertexShader: `uniform float uTime; uniform float uWob; varying vec3 vN; varying vec3 vV; varying float vY;
    void main(){ vec3 p = position; float h = clamp((p.y + 1.0) / 2.8, 0.0, 1.0);
      float w = sin(p.y * 3.0 - uTime * 3.2) * 0.06 * h * uWob + sin(p.x * 4.0 + uTime * 2.1) * 0.025 * uWob;
      p.x += w + pow(h, 2.2) * sin(uTime * 1.7) * 0.32 * uWob; p.z += cos(p.y * 2.5 - uTime * 2.6) * 0.04 * h * uWob;
      vY = h; vec4 mv = modelViewMatrix * vec4(p, 1.0); vV = -mv.xyz; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform vec3 uTint; uniform float uOpacity; varying vec3 vN; varying vec3 vV; varying float vY;
    void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
      vec3 c = mix(vec3(1.0), uTint, 0.35 + f * 0.65) + f * 0.25; c = mix(c, uTint, vY * 0.25);
      gl_FragColor = vec4(c, uOpacity); }`,
});
const ghost = new THREE.Group(), rig = new THREE.Group();
ghost.add(rig); scene.add(ghost);
const prof = [[0, -1], [.34, -.96], [.6, -.8], [.76, -.52], [.81, -.18], [.77, .16], [.66, .48], [.5, .8], [.34, 1.1], [.2, 1.38], [.09, 1.62], [0, 1.82]].map(([x, y]) => new THREE.Vector2(x, y));
rig.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 40), bodyMat));
for (const s of [-1, 1]) { // cuernitos
  const horn = new THREE.Mesh(new THREE.ConeGeometry(.11, .42, 14), bodyMat);
  horn.position.set(s * .36, .74, .08); horn.rotation.z = -s * .55; rig.add(horn);
}
const arms = [-1, 1].map((s) => { // brazos de llama
  const g = new THREE.Group(); g.position.set(s * .7, -.12, 0);
  const m = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 12), bodyMat); m.scale.set(2.3, .85, .85); m.position.x = s * .26;
  g.add(m); rig.add(g); return g;
});
// cara: textura de canvas sobre un trozo de cilindro que abraza el cuerpo
const faceCv = document.createElement('canvas'); faceCv.width = 512; faceCv.height = 340;
const fctx = faceCv.getContext('2d');
const faceTex = new THREE.CanvasTexture(faceCv); faceTex.colorSpace = THREE.SRGBColorSpace;
const face = new THREE.Mesh(new THREE.CylinderGeometry(.815, .815, .78, 32, 1, true, -.78, 1.56), new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false }));
face.position.y = -.08; rig.add(face);
// brillo
const gc = document.createElement('canvas'); gc.width = gc.height = 128;
const gx = gc.getContext('2d'), grad = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
grad.addColorStop(0, 'rgba(255,255,255,.55)'); grad.addColorStop(.35, 'rgba(255,255,255,.16)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
gx.fillStyle = grad; gx.fillRect(0, 0, 128, 128);
const glowMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
const glow = new THREE.Sprite(glowMat); glow.scale.set(5.2, 5.2, 1); glow.position.set(0, .2, -.6); ghost.add(glow);
// brasas
const N = 70, emb = new Float32Array(N * 3), embV = [];
for (let i = 0; i < N; i++) { emb[i * 3] = (Math.random() - .5) * 1.4; emb[i * 3 + 1] = Math.random() * 3 - 1; emb[i * 3 + 2] = (Math.random() - .5) * .8; embV.push(.2 + Math.random() * .5); }
const embG = new THREE.BufferGeometry(); embG.setAttribute('position', new THREE.BufferAttribute(emb, 3));
const embMat = new THREE.PointsMaterial({ size: .05, color: 0xffffff, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false });
ghost.add(new THREE.Points(embG, embMat));

/* ---------- caras (ojos × boca = cientos de combinaciones) ---------- */
const INK = '#050505';
const F = { eyes: 'malvado', mouth: 'sonrisa', blink: 0, look: 0 };
const CARAS = {
  neutro: ['redondo', 'plana'], feliz: ['feliz', 'sonrisa'], malvado: ['malvado', 'sonrisa'], risa: ['feliz', 'grande'], sorpresa: ['redondo', 'o'],
  enfado: ['enfado', 'plana'], triste: ['triste', 'triste'], dormido: ['cerrado', 'plana'], amor: ['corazon', 'sonrisa'], guino: ['guino', 'sonrisilla'],
  pensando: ['lado', 'sonrisilla'], asustado: ['redondo', 'ondulada'], aburrido: ['aburrido', 'plana'], chulo: ['malvado', 'sonrisilla'], lengua: ['feliz', 'lengua'],
  mareado: ['espiral', 'ondulada'], estrellas: ['estrella', 'grande'], muerto: ['x', 'ondulada'],
};
function eye(kind, side) {
  const c = fctx; c.save(); c.translate(256 + side * 92 + F.look * 18, 140); c.scale(side, 1);
  c.fillStyle = c.strokeStyle = INK; c.lineWidth = 15; c.lineCap = c.lineJoin = 'round';
  const k = kind === 'guino' ? (side === 1 ? 'feliz' : 'malvado') : kind;
  const shut = F.blink > .5 && !['feliz', 'cerrado', 'x', 'corazon', 'estrella', 'espiral'].includes(k);
  c.beginPath();
  if (shut || k === 'cerrado') { c.moveTo(-40, 4); c.quadraticCurveTo(0, 18, 40, 4); c.stroke(); }
  else if (k === 'malvado' || k === 'enfado') { const a = k === 'enfado' ? 20 : 0; c.moveTo(-48, 14 + a * .4); c.quadraticCurveTo(-4, -30 + a, 46, -30 + a * .2); c.quadraticCurveTo(36, 26, -20, 26); c.closePath(); c.fill(); }
  else if (k === 'triste') { c.moveTo(-46, -24); c.quadraticCurveTo(10, -4, 46, 18); c.quadraticCurveTo(10, 32, -34, 22); c.closePath(); c.fill(); }
  else if (k === 'feliz') { c.moveTo(-40, 14); c.quadraticCurveTo(0, -36, 40, 14); c.stroke(); }
  else if (k === 'redondo' || k === 'lado') { c.ellipse(k === 'lado' ? 16 : 0, 0, 30, 36, 0, 0, 7); c.fill(); }
  else if (k === 'aburrido') { c.moveTo(-40, -4); c.lineTo(40, -4); c.quadraticCurveTo(36, 28, 0, 28); c.quadraticCurveTo(-36, 28, -40, -4); c.fill(); }
  else if (k === 'corazon') { c.moveTo(0, 30); c.bezierCurveTo(-60, -6, -26, -46, 0, -14); c.bezierCurveTo(26, -46, 60, -6, 0, 30); c.fill(); }
  else if (k === 'x') { c.moveTo(-28, -28); c.lineTo(28, 28); c.moveTo(28, -28); c.lineTo(-28, 28); c.stroke(); }
  else if (k === 'espiral') { c.lineWidth = 8; for (let a = 0; a < 16; a += .2) { const r = a * 2.2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.stroke(); }
  else if (k === 'estrella') { for (let i = 0; i < 10; i++) { const r = i % 2 ? 16 : 40, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); }
  if (['redondo', 'lado', 'malvado'].includes(k) && !shut) { c.fillStyle = '#fff'; c.beginPath(); c.arc(k === 'malvado' ? 14 : 10, k === 'malvado' ? -6 : -10, 6, 0, 7); c.fill(); }
  c.restore();
}
function mouth(kind) {
  const c = fctx; c.save(); c.translate(256 + F.look * 12, 252); c.fillStyle = c.strokeStyle = INK; c.lineWidth = 14; c.lineCap = c.lineJoin = 'round'; c.beginPath();
  if (kind === 'sonrisa' || kind === 'lengua') {
    c.moveTo(-128, -26); c.quadraticCurveTo(0, 96, 128, -26); c.quadraticCurveTo(0, 22, -128, -26); c.fill();
    c.fillStyle = '#fff'; c.beginPath();
    for (let i = 0; i < 8; i++) { const x0 = -96 + i * 24, y0 = -26 + 48 * (1 - ((x0 + 12) / 128) ** 2) * .5; c.moveTo(x0, y0 - 2); c.lineTo(x0 + 12, y0 + 18); c.lineTo(x0 + 24, y0 - 2); }
    c.fill();
    if (kind === 'lengua') { c.fillStyle = '#d9d9d9'; c.beginPath(); c.ellipse(30, 50, 26, 20, 0, 0, 7); c.fill(); }
  } else if (kind === 'grande') { c.moveTo(-110, -30); c.quadraticCurveTo(0, 130, 110, -30); c.closePath(); c.fill(); c.fillStyle = '#cfcfcf'; c.beginPath(); c.ellipse(0, 50, 40, 18, 0, 0, 7); c.fill(); }
  else if (kind === 'o') { c.ellipse(0, 10, 28, 34, 0, 0, 7); c.fill(); }
  else if (kind === 'plana') { c.moveTo(-50, 10); c.lineTo(50, 10); c.stroke(); }
  else if (kind === 'triste') { c.moveTo(-60, 30); c.quadraticCurveTo(0, -20, 60, 30); c.stroke(); }
  else if (kind === 'ondulada') { c.moveTo(-70, 10); for (let i = 1; i <= 7; i++) c.quadraticCurveTo(-70 + i * 20 - 10, i % 2 ? -10 : 30, -70 + i * 20, 10); c.stroke(); }
  else if (kind === 'sonrisilla') { c.moveTo(-60, 8); c.quadraticCurveTo(10, 40, 70, -14); c.stroke(); }
  c.restore();
}
let faceDirty = true, faceTimer;
function drawFace() { fctx.clearRect(0, 0, 512, 340); eye(F.eyes, -1); eye(F.eyes, 1); mouth(F.mouth); faceTex.needsUpdate = true; faceDirty = false; }
function cara(n) { const c = CARAS[n] || CARAS.malvado; F.eyes = c[0]; F.mouth = c[1]; faceDirty = true; }
function caraUn(n, ms = 2600) { cara(n); clearTimeout(faceTimer); faceTimer = setTimeout(() => cara('malvado'), ms); }

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
function screenPos(dx = 0, dy = 0) {
  const v = new THREE.Vector3(dx, dy, 0); ghost.localToWorld(v); v.project(camera);
  return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
}
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
function decir(t, ms = 3200) { bubble.textContent = String(t).slice(0, 140); bubble.classList.add('show'); bubbleUntil = performance.now() + Math.min(Math.max(ms, 1500), 8000); }

/* ---------- tono ---------- */
const tint = new THREE.Color('#ffffff'), tintTarget = new THREE.Color('#ffffff');
let tintOverride = null, tintOverrideUntil = 0;
function color(hex, ms = 3500) { try { tintOverride = new THREE.Color(hex); tintOverrideUntil = performance.now() + ms; } catch {} }

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
  inicio: () => [{ cara: 'malvado' }, { animacion: 'saludar' }, { decir: 'Buenas. Soy el fantasma de s0k1x. Pulsa en mí si te aburres.' }],
  seccion: (c) => c.seccion === 'contacto' ? [{ cara: 'feliz' }, { animacion: 'saltar' }, { decir: '¿Hablamos? s0k1x contesta rápido.' }]
    : c.seccion === 'kit' ? [{ cara: 'chulo' }, { animacion: 'girar' }] : c.seccion === 'herramientas' ? [{ cara: 'pensando' }, { animacion: 'asentir' }] : [{ cara: 'feliz' }, { animacion: 'flotar' }],
  proyecto: () => [{ cara: pick(['feliz', 'chulo', 'amor']) }, { animacion: pick(['saltar', 'girar', 'rebotar', 'latido']) }],
  clic: () => pick([[{ cara: 'risa' }, { animacion: 'reir' }], [{ meme: '67' }], [{ cara: 'sorpresa' }, { animacion: 'teletransporte' }], [{ cara: 'lengua' }, { animacion: 'bailar' }], [{ cara: 'mareado' }, { animacion: 'girar' }]]),
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
  currentEl = el; currentSection = el.dataset.project != null ? 'proyecto' : el.id;
  tintTarget.set(el.dataset.tint || '#ffffff');
  document.querySelectorAll('.dots a').forEach((d) => d.classList.toggle('on', d.dataset.id === el.id));
  if (seen.has(el.id)) return;
  seen.add(el.id);
  if (el.id === 'inicio') return;
  think(el.dataset.project != null ? 'proyecto' : 'seccion', {}, el.dataset.project != null ? 4000 : 5000);
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
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const pos = new THREE.Vector3(), target = new THREE.Vector3();
let baseScale = 1, blinkAt = performance.now() + 2500, firstFrame = true;
function poseTarget() {
  const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z, visW = visH * camera.aspect;
  const pose = currentEl?.dataset.pose || 'hero';
  if (mobile()) { target.set(0, visH * .2, 0); baseScale = Math.min(1, visW / 4.4) * .85; }
  else if (pose === 'center') { target.set(0, visH * .2, 0); baseScale = .62; }
  else { target.set(visW * (pose === 'hero' ? .2 : .18), -.1, 0); baseScale = 1; }
}
function frame(now) {
  requestAnimationFrame(frame);
  const t = now / 1000;
  U.uTime.value = t; U.uWob.value = reduced ? .3 : 1;
  poseTarget(); if (firstFrame) { pos.copy(target); firstFrame = false; } else pos.lerp(target, .05);
  const A = { x: 0, y: S(t * 1.6) * .08, z: 0, rx: 0, ry: 0, rz: S(t * .9) * .03, s: 1, sx: 1, sy: 1, armL: S(t * 2.2) * .12, armR: S(t * 2.2 + 1) * .12, op: 1 };
  for (let i = active.length - 1; i >= 0; i--) { const a = active[i], p = (now - a.t0) / a.dur; if (p >= 1) { active.splice(i, 1); continue; } a.fn(p, A); }
  ghost.position.set(pos.x + A.x, pos.y + A.y, A.z);
  const sc = baseScale * A.s; ghost.scale.set(sc * A.sx, sc * A.sy, sc);
  rig.rotation.set(A.rx + ptr.y * .12, A.ry + ptr.x * .35, A.rz);
  arms[0].rotation.z = .55 - A.armL; arms[1].rotation.z = -.55 + A.armR;
  U.uOpacity.value = A.op; glowMat.opacity = .9 * A.op; embMat.opacity = .7 * A.op; face.material.opacity = A.op;
  tint.lerp(tintOverride && now < tintOverrideUntil ? tintOverride : tintTarget, .06);
  U.uTint.value.copy(tint); glowMat.color.copy(tint); embMat.color.copy(tint);
  const lk = Math.round(ptr.x * 4) / 4; if (lk !== F.look) { F.look = lk; faceDirty = true; }
  if (now > blinkAt && !F.blink) { F.blink = 1; faceDirty = true; }
  if (F.blink && now > blinkAt + 120) { F.blink = 0; faceDirty = true; blinkAt = now + 2500 + Math.random() * 3000; }
  if (faceDirty) drawFace();
  const pa = embG.attributes.position;
  for (let i = 0; i < N; i++) { let y = pa.getY(i) + embV[i] * .012; if (y > 2.2) y = -.6; pa.setY(i, y); pa.setX(i, pa.getX(i) + S(t * 2 + i) * .002); }
  pa.needsUpdate = true;
  if (bubble.classList.contains('show')) {
    if (now > bubbleUntil) bubble.classList.remove('show');
    const o = screenPos(.55, 1.5), w = bubble.offsetWidth;
    bubble.style.left = `${Math.min(Math.max(o.x, 12), innerWidth - w - 12)}px`; bubble.style.top = `${Math.max(o.y - bubble.offsetHeight, 70)}px`;
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

/* ---------- interacción ---------- */
const ray = new THREE.Raycaster();
document.addEventListener('click', (e) => {
  if (e.target.closest('a,button,input,img,form')) return;
  ray.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  if (ray.intersectObject(rig, true).length) think('clic', {}, 3000);
});
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
