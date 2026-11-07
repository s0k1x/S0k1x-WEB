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
const PI2 = Math.PI / 2;
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

const U = { uTime: { value: 0 }, uTint: { value: new THREE.Color('#ffffff') }, uOpacity: { value: 1 } };
const VERT = `uniform float uTime; uniform float uWob; uniform float uThick; varying vec3 vN; varying vec3 vV;
  void main(){ vec3 p = position; float h = clamp((p.y + 1.0) * .5, 0.0, 1.0);
    p.x += (sin(p.y * 3.0 - uTime * 3.0) * .035 + sin(uTime * 1.6) * .06 * h * h) * uWob;
    p.z += cos(p.y * 2.6 - uTime * 2.4) * .02 * uWob;
    p += normal * uThick;
    vec4 mv = modelViewMatrix * vec4(p, 1.0); vV = -mv.xyz; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`;
// sombreado plano por bandas (cel shading), sombra fría y borde de luz con el color del capítulo
const TOON = `uniform vec3 uTint; uniform float uOpacity; varying vec3 vN; varying vec3 vV;
  void main(){ vec3 n = normalize(vN); float d = dot(n, normalize(vec3(-.45, .7, .6)));
    float rim = 1.0 - abs(dot(n, normalize(vV)));
    vec3 base = mix(vec3(.93), vec3(1.0), smoothstep(-.3, .5, d)) + rim * .15;
    base = mix(base, uTint, smoothstep(.55, 1.0, rim) * .5);
    gl_FragColor = vec4(base, uOpacity); }`;
const LINE = `uniform float uOpacity; void main(){ gl_FragColor = vec4(.04, .04, .07, uOpacity); }`;
function part(geo, wob = .6, thick = .028) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: { ...U, uWob: { value: wob }, uThick: { value: 0 } }, vertexShader: VERT, fragmentShader: TOON, transparent: true })));
  return g;
}
const ghost = new THREE.Group(), rig = new THREE.Group();
ghost.add(rig); scene.add(ghost);
// cuerpo redondito
const prof = [[0, -1], [.46, -.97], [.73, -.83], [.89, -.57], [.95, -.22], [.92, .14], [.82, .45], [.64, .72], [.4, .9], [.16, .99], [0, 1.01]].map(([x, y]) => new THREE.Vector2(x, y));
rig.add(part(new THREE.LatheGeometry(prof, 64), .5, .045));
const flameGeo = (r, h) => new THREE.LatheGeometry([[0, 0], [r * .8, h * .08], [r, h * .25], [r * .85, h * .5], [r * .5, h * .75], [r * .18, h * .93], [0, h]].map(([x, y]) => new THREE.Vector2(x, y)), 20);
// tres llamitas en la cabeza (se balancean con muelle)
const tufts = [[-.36, .86, .5, .5], [0, 1.0, 0, .66], [.36, .86, -.5, .5]].map(([x, y, rz, h]) => {
  const pv = new THREE.Group(); pv.position.set(x, y, .05); pv.rotation.z = rz;
  const c = part(flameGeo(.19, h), 1.4, .03); c.position.y = -.04; pv.add(c); rig.add(pv);
  return pv;
});
// cola de llama
const tail = new THREE.Group(); tail.position.set(.2, -.55, -.7); tail.rotation.set(-1.0, 0, -.5);
const tc = part(flameGeo(.26, .95), 1.6, .03); tc.position.y = -.05; tail.add(tc); rig.add(tail);
// patitas
for (const s of [-1, 1]) { const f = part(new THREE.SphereGeometry(.2, 20, 14), 0, .03); f.scale.set(1.3, .7, 1.5); f.position.set(s * .42, -.98, .18); rig.add(f); }
// bracitos con manita de tres dedos redondeados
const arms = [-1, 1].map((s) => {
  const g = new THREE.Group(); g.position.set(s * .8, -.12, .05);
  const arm = part(new THREE.CapsuleGeometry(.12, .28, 8, 16), .3, .028); arm.rotation.z = PI2; arm.position.x = s * .22; g.add(arm);
  const hand = part(new THREE.SphereGeometry(.15, 20, 16), 0, .028); hand.scale.set(1, .9, .85); hand.position.x = s * .5; g.add(hand);
  [[.1, .4], [.13, 0], [.1, -.4]].forEach(([len, ang], k) => {
    const fg = part(new THREE.CapsuleGeometry(.045, len, 6, 10), 0, .018);
    fg.rotation.z = -s * PI2 + ang * s; fg.position.set(s * (.62 + Math.cos(ang) * .02), Math.sin(ang) * .1, .02 + (k === 1 ? .02 : 0)); g.add(fg);
  });
  const th = part(new THREE.CapsuleGeometry(.04, .07, 6, 10), 0, .018); th.rotation.set(.9, 0, -s * .4); th.position.set(s * .5, .1, .12); g.add(th);
  rig.add(g); return g;
});
// cara: textura de canvas sobre un trozo de cilindro que abraza la barriga
const faceCv = document.createElement('canvas'); faceCv.width = 512; faceCv.height = 340;
const fctx = faceCv.getContext('2d');
const faceTex = new THREE.CanvasTexture(faceCv); faceTex.colorSpace = THREE.SRGBColorSpace; faceTex.anisotropy = 4;
const face = new THREE.Mesh(new THREE.CylinderGeometry(.955, .955, .86, 40, 1, true, -.82, 1.64), new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false }));
face.position.y = .02; rig.add(face);
// brillo
const gc = document.createElement('canvas'); gc.width = gc.height = 128;
const gx = gc.getContext('2d'), grad = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
grad.addColorStop(0, 'rgba(255,255,255,.7)'); grad.addColorStop(.3, 'rgba(255,255,255,.22)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
gx.fillStyle = grad; gx.fillRect(0, 0, 128, 128);
const glowMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
const glow = new THREE.Sprite(glowMat); glow.scale.set(4.6, 4.6, 1); glow.position.set(0, 0, -.9); ghost.add(glow);
// polvo de estrellas de fondo (sutil)
const SD = 320, sd = new Float32Array(SD * 3);
for (let i = 0; i < SD; i++) { sd[i * 3] = (Math.random() - .5) * 26; sd[i * 3 + 1] = (Math.random() - .5) * 16; sd[i * 3 + 2] = -4 - Math.random() * 8; }
const dustG = new THREE.BufferGeometry(); dustG.setAttribute('position', new THREE.BufferAttribute(sd, 3));
const dust = new THREE.Points(dustG, new THREE.PointsMaterial({ size: .035, color: 0xffffff, transparent: true, opacity: .35, depthWrite: false }));
scene.add(dust);
// brasas
const N = 70, emb = new Float32Array(N * 3), embV = [];
for (let i = 0; i < N; i++) { emb[i * 3] = (Math.random() - .5) * 1.4; emb[i * 3 + 1] = Math.random() * 3 - 1; emb[i * 3 + 2] = (Math.random() - .5) * .8; embV.push(.2 + Math.random() * .5); }
const embG = new THREE.BufferGeometry(); embG.setAttribute('position', new THREE.BufferAttribute(emb, 3));
const embMat = new THREE.PointsMaterial({ size: .05, color: 0xffffff, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false });
ghost.add(new THREE.Points(embG, embMat));

/* ---------- cara paramétrica: ojos y boca se transforman de forma continua (cada frame) ---------- */
const INK = '#050505';
// ojo: in = altura esquina interior, out = esquina exterior, up/lo = curvas de párpados, open = apertura
// boca: w = ancho, cy = altura de las comisuras, up/lo = curvas, teeth = dientes (0-1)
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
  guino: P({}), amor: P({}), mareado: P({}), estrellas: P({}), muerto: P({}), neutro: P({ in: 0, out: 0, up: -40, lo: 40, w: 60, cy: 10, mup: 8, mlo: 14, teeth: 0 }),
};
const GLYPHS = { amor: 'corazon', mareado: 'espiral', estrellas: 'estrella', muerto: 'x' };
const F = { ...CARAS.malvado, blink: 0, wink: 0, look: 0, lookY: 0, talk: 0, glyph: '' };
let T = { ...CARAS.malvado }, faceName = 'malvado';
function cara(n) { faceName = CARAS[n] ? n : 'malvado'; T = { ...CARAS[faceName] }; F.glyph = GLYPHS[faceName] || ''; T.wink = faceName === 'guino' ? 1 : 0; if (faceName === 'lengua') T.tongue = 1; else T.tongue = 0; }
let faceTimer;
function caraUn(n, ms = 2600) { cara(n); clearTimeout(faceTimer); faceTimer = setTimeout(() => cara('malvado'), ms); }
function eye(side) {
  const c = fctx; c.save(); c.translate(256 + side * 98 + F.look * 8, 112 + F.lookY * 5); c.scale(side * 1.12, 1.12); c.fillStyle = c.strokeStyle = INK;
  if (F.glyph) {
    c.lineWidth = 14; c.lineCap = c.lineJoin = 'round'; c.beginPath(); const g = F.glyph;
    if (g === 'corazon') { c.moveTo(0, 34); c.bezierCurveTo(-66, -6, -28, -50, 0, -16); c.bezierCurveTo(28, -50, 66, -6, 0, 34); c.fill(); }
    else if (g === 'x') { c.moveTo(-28, -28); c.lineTo(28, 28); c.moveTo(28, -28); c.lineTo(-28, 28); c.stroke(); }
    else if (g === 'espiral') { c.lineWidth = 8; for (let a = 0; a < 16; a += .2) { const r = a * 2.4; c.lineTo(Math.cos(a + performance.now() / 300 * side) * r, Math.sin(a + performance.now() / 300 * side) * r); } c.stroke(); }
    else { for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 : 44, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); }
    c.restore(); return;
  }
  const open = F.open * (1 - F.blink) * (side === 1 ? 1 - F.wink : 1);
  const mid = (F.in + F.out) / 2, up = mid + (F.up - mid) * Math.max(open, .04), lo = mid + (F.lo - mid) * Math.max(open, .04);
  c.beginPath(); c.moveTo(-50, F.in); c.quadraticCurveTo(0, up * 1.25 - mid * .25, 50, F.out); c.quadraticCurveTo(0, lo * 1.25 - mid * .25, -50, F.in); c.closePath();
  c.lineWidth = 10; c.lineJoin = 'round'; c.fill(); c.stroke();
  if (open > .45) { c.globalAlpha = (open - .45) / .55 * .9; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(16 + F.look * 6 * side, mid - 6, 5.5, 4, -.5, 0, 7); c.fill(); c.globalAlpha = 1; }
  c.restore();
}
function mouth() {
  const c = fctx; c.save(); c.translate(256 + F.look * 6, 226 + F.lookY * 3); c.fillStyle = INK;
  const w = F.w, cy = F.cy, upY = cy + (F.mup - cy) * 2 - cy * 0, talk = F.talk;
  const lo = F.mlo + talk * 26, top = F.mup - talk * 4;
  c.beginPath(); c.moveTo(-w, cy); c.quadraticCurveTo(0, lo * 2 - cy, w, cy); c.quadraticCurveTo(0, top * 2 - cy, -w, cy); c.closePath(); c.fill();
  c.lineWidth = 8; c.lineJoin = 'round'; c.strokeStyle = INK; c.stroke();
  if (F.teeth > .05 && w > 50) {
    c.save(); c.clip(); c.fillStyle = '#fff'; c.globalAlpha = Math.min(1, F.teeth);
    const n = Math.max(3, Math.round(w / 17)), step = (w * 2 * .86) / n, x0 = -w * .86, th = 18 + F.teeth * 6;
    c.beginPath();
    for (let i = 0; i < n; i++) { const x = x0 + i * step, tt = (x + step / 2) / w, y = cy + (top * 2 - cy - cy) * (1 - tt * tt) * .5 + cy * 0; c.moveTo(x, y - 4); c.lineTo(x + step / 2, y + th); c.lineTo(x + step, y - 4); }
    c.fill(); c.restore();
  }
  if (F.tongue > .05) { c.fillStyle = `rgba(210,210,210,${F.tongue})`; c.beginPath(); c.ellipse(w * .25, (cy + lo) / 2 + 10, 26, 18, 0, 0, 7); c.fill(); }
  c.restore();
}
F.tongue = 0; T.tongue = 0;
let faceDirty = true;
function drawFace() { fctx.clearRect(0, 0, 512, 340); eye(-1); eye(1); mouth(); faceTex.needsUpdate = true; }
const FACE_KEYS = ['in', 'out', 'up', 'lo', 'open', 'w', 'cy', 'mup', 'mlo', 'teeth', 'wink', 'tongue'];
function tweenFace(dt, now) {
  const k = 1 - Math.exp(-dt * 14); let moving = false;
  for (const key of FACE_KEYS) { const d = (T[key] ?? 0) - F[key]; if (Math.abs(d) > .01) { F[key] += d * k; moving = true; } }
  const talkT = bubble.classList.contains('show') && now < talkUntil ? (.5 + .5 * Math.sin(now / 55)) * (.6 + .4 * Math.sin(now / 130)) : 0;
  if (Math.abs(talkT - F.talk) > .01) { F.talk += (talkT - F.talk) * Math.min(1, dt * 30); moving = true; }
  if (moving || faceDirty || F.glyph === 'espiral') { drawFace(); faceDirty = false; }
}
let talkUntil = 0;

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
function decir(t, ms = 3200) { talkUntil = performance.now() + Math.min(String(t).length * 55, 4000); bubble.textContent = String(t).slice(0, 140); bubble.classList.add('show'); bubbleUntil = performance.now() + Math.min(Math.max(ms, 1500), 8000); }

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
  tintTarget.set(el.dataset.tint || '#ffffff');
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
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const prog = document.createElement('div'); prog.className = 'progress'; document.body.appendChild(prog);
const pos = new THREE.Vector3(), target = new THREE.Vector3();
let baseScale = 1, blinkAt = performance.now() + 2500, firstFrame = true;
function poseTarget() {
  const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z, visW = visH * camera.aspect;
  const pose = currentEl?.dataset.pose || 'hero';
  if (mobile()) { target.set(0, visH * .2, 0); baseScale = Math.min(1, visW / 4.4) * .85; }
  else if (pose === 'center') { target.set(0, visH * .2, 0); baseScale = .62; }
  else { target.set(visW * (pose === 'hero' ? .2 : .18), -.1, 0); baseScale = 1; }
}
let prevX = 0, prevY = 0, sprX = 0, sprY = 0, lastNow = 0, dt = .016;
function frame(now) {
  requestAnimationFrame(frame);
  const t = now / 1000; dt = Math.min((now - lastNow) / 1000, .05); lastNow = now;
  U.uTime.value = t;
  poseTarget(); if (firstFrame) { pos.copy(target); firstFrame = false; } else pos.lerp(target, .05);
  const br = S(t * 1.9);
  const A = { x: 0, y: S(t * 1.4) * .09, z: 0, rx: 0, ry: 0, rz: S(t * .8) * .035, s: 1, sx: 1 - br * .012, sy: 1 + br * .02, armL: S(t * 2.2) * .12, armR: S(t * 2.2 + 1) * .12, op: 1 };
  for (let i = active.length - 1; i >= 0; i--) { const a = active[i], p = (now - a.t0) / a.dur; if (p >= 1) { active.splice(i, 1); continue; } a.fn(p, A); }
  ghost.position.set(pos.x + A.x, pos.y + A.y, A.z);
  const sc = baseScale * A.s; ghost.scale.set(sc * A.sx, sc * A.sy, sc);
  rig.rotation.set(A.rx + ptr.y * .12, A.ry + ptr.x * .35, A.rz);
  arms[0].rotation.z = .5 - A.armL; arms[1].rotation.z = -.5 + A.armR;
  // movimiento secundario: las llamitas y la cola se retrasan como un muelle
  const vx = (ghost.position.x - prevX) / Math.max(dt, .001), vy = (ghost.position.y - prevY) / Math.max(dt, .001); prevX = ghost.position.x; prevY = ghost.position.y;
  sprX += (THREE.MathUtils.clamp(-vx * .08, -.6, .6) - sprX) * .12; sprY += (THREE.MathUtils.clamp(-vy * .06, -.4, .4) - sprY) * .12;
  tufts.forEach((tf, i) => { tf.rotation.z = [.5, 0, -.5][i] + sprX + S(t * 3 + i) * .06; tf.scale.y = 1 + sprY * .5 + S(t * 4 + i * 2) * .04; });
  tail.rotation.z = -.5 + sprX * .8 + S(t * 2.4) * .15; tail.rotation.x = -1 + sprY * .6;
  U.uOpacity.value = A.op; glowMat.opacity = .75 * A.op; embMat.opacity = .7 * A.op; face.material.opacity = A.op;
  tint.lerp(tintOverride && now < tintOverrideUntil ? tintOverride : tintTarget, .06);
  U.uTint.value.copy(tint); glowMat.color.copy(tint); embMat.color.copy(tint);
  F.look += (ptr.x - F.look) * .1; F.lookY += (ptr.y - F.lookY) * .1;
  const bp = (now - blinkAt) / 150; F.blink = bp > 0 && bp < 1 ? Math.sin(bp * Math.PI) : 0;
  if (bp >= 1) blinkAt = now + 2200 + Math.random() * 3200;
  tweenFace(dt, now);
  const pa = embG.attributes.position;
  for (let i = 0; i < N; i++) { let y = pa.getY(i) + embV[i] * .012; if (y > 2.2) y = -.6; pa.setY(i, y); pa.setX(i, pa.getX(i) + S(t * 2 + i) * .002); }
  pa.needsUpdate = true;
  if (bubble.classList.contains('show')) {
    if (now > bubbleUntil) bubble.classList.remove('show');
    const o = screenPos(.6, mobile() ? 2.1 : 1.6), w = bubble.offsetWidth;
    bubble.style.left = `${Math.min(Math.max(o.x, 12), innerWidth - w - 12)}px`; bubble.style.top = `${Math.max(o.y - bubble.offsetHeight, 70)}px`;
  }
  dust.rotation.y = t * .01 + ptr.x * .04; dust.rotation.x = ptr.y * .03; dust.position.y = scrollY * .0008;
  prog.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
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
