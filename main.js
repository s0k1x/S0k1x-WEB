/* =========================================================
   CONFIG — edita aquí tus datos.
   ========================================================= */
const CONFIG = {
  github: 's0k1x',
  email: 'hola@s0k1x.dev', // ← pon tu email real
  status: 'Disponible para proyectos',
  lede: 'Soy s0k1x, desarrollador y creador. Diseño y programo herramientas, webs y skills para IA. Cada proyecto que hago es un mundo con sus propias reglas.',
  about: 'Me gusta que las cosas sean <em>simples por fuera</em> y sólidas por dentro. Si algo sobra, lo quito. Si algo falta, lo construyo.',
  facts: [
    ['Hago', 'Webs, herramientas y skills para IA'],
    ['Uso', 'JavaScript, Python, Claude, Supabase'],
    ['Ahora', 'Construyendo s0k1x-skill'],
    ['Busco', 'Proyectos con gente con ganas'],
  ],
  socials: [
    ['GitHub', 'https://github.com/s0k1x'],
    // ['Instagram', 'https://instagram.com/...'],
    // ['LinkedIn', 'https://linkedin.com/in/...'],
  ],
  // Proyectos con mundo y texto propios. El resto se cargan solos de GitHub
  // y reciben un mundo automáticamente. Mundos: orbita, bosque, terminal, oceano, neon, desierto, nieve
  projects: [
    { name: 's0k1x-skill', world: 'orbita', desc: 'Kit unificado de 35 skills y 3 agentes para Claude Code: diseño, escritura, tokens e ingeniería, todo coordinado.' },
    { name: 'S0k1x-WEB', world: 'neon', desc: 'Esta web. Un portfolio donde cada proyecto es un mundo y yo voy de uno a otro.' },
  ],
  hidden: [], // nombres de repos que no quieres mostrar
};

/* ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
function hash(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* =========================================================
   Mundos
   ========================================================= */
const WORLDS = {
  orbita: { label: 'Órbita', bg: '#0C0F26', fg: '#ECEBFF', acc: '#FFCF4A', ground: '#1A1F45', gfg: '#ECEBFF', item: 'helmet',
    lines: ['Houston, tenemos un proyecto.', 'Aquí no hay gravedad, pero sí código.', 'Un pequeño commit para un hombre…'] },
  bosque: { label: 'Bosque', bg: '#E6EEDC', fg: '#15301F', acc: '#E4572E', ground: '#6E9A5B', gfg: '#0F2416', item: 'leaf',
    lines: ['Aquí se respira tranquilo.', 'Este proyecto crece como los árboles.', 'Shh… que hay bugs durmiendo.'] },
  terminal: { label: 'Terminal', bg: '#070B08', fg: '#C9F7D2', acc: '#39FF7A', ground: '#0D1710', gfg: '#C9F7D2', item: 'phones',
    lines: ['> sudo hacer_algo_guapo', 'Entré al sistema. Era fácil.', 'Aquí todo es verde y funciona (casi).'] },
  oceano: { label: 'Océano', bg: '#BFE2EE', fg: '#0A2A3A', acc: '#FF6A3D', ground: '#F1D6A4', gfg: '#0A2A3A', item: 'shades',
    lines: ['Hoy toca playa y deploy.', 'Este proyecto flota solo.', '¿Has visto el agua? Ni un bug.'] },
  neon: { label: 'Neón', bg: '#1C1430', fg: '#F6ECFF', acc: '#FF4FA3', ground: '#110B1F', gfg: '#F6ECFF', item: 'phones',
    lines: ['La ciudad nunca duerme. Yo tampoco.', 'Luces, código y acción.', 'Bienvenido a mi barrio.'] },
  desierto: { label: 'Desierto', bg: '#F5E2C4', fg: '#3A2312', acc: '#1F6B5C', ground: '#E0A96E', gfg: '#3A2312', item: 'shades',
    lines: ['Qué calor hace en producción.', 'Lo construí grano a grano.', 'Ni un oasis, pero funciona.'] },
  nieve: { label: 'Nieve', bg: '#E4ECF4', fg: '#16233A', acc: '#2F6BFF', ground: '#FAFCFF', gfg: '#16233A', item: 'beanie',
    lines: ['Brrr… código fresquito.', 'Aquí el rendimiento está helado. En el buen sentido.', 'Cuidado, que resbala.'] },
};
const ORDER = ['orbita', 'bosque', 'terminal', 'oceano', 'neon', 'desierto', 'nieve'];

const W = 1600, H = 900, G = 760;
function wavePath(y, amp, len, phase) {
  let d = `M-200 ${G} L-200 ${y}`;
  for (let x = -200; x < W + 200; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
  return d + ` L${W + 200} ${G} Z`;
}
const SCENES = {
  orbita(r, w) {
    let s = '';
    for (let i = 0; i < 150; i++) {
      const tw = r() > .7 ? ` class="sc-twinkle" style="animation-delay:${(r() * 3).toFixed(2)}s"` : '';
      s += `<circle cx="${r() * W}" cy="${r() * (G - 20)}" r="${(.6 + r() * 1.8).toFixed(1)}" fill="${w.fg}" opacity="${(.25 + r() * .7).toFixed(2)}"${tw}/>`;
    }
    const px = 620 + r() * 160, py = 170 + r() * 50;
    s += `<g class="sc-float"><circle cx="${px}" cy="${py}" r="92" fill="${w.acc}"/><path d="M${px - 92} ${py} a92 92 0 0 0 184 0 a92 46 0 0 1 -184 0Z" fill="#000" opacity=".12"/>
      <ellipse cx="${px}" cy="${py}" rx="160" ry="28" fill="none" stroke="${w.fg}" stroke-width="3" transform="rotate(-14 ${px} ${py})"/></g>`;
    s += `<g class="sc-float" style="animation-delay:-3s"><circle cx="${1250 + r() * 200}" cy="${120 + r() * 40}" r="22" fill="#3A3F72"/></g>`;
    s += `<line class="sc-shoot" x1="1300" y1="110" x2="1360" y2="80" stroke="${w.fg}" stroke-width="2" stroke-linecap="round"/>`;
    s += `<rect y="${G}" width="${W}" height="${H - G}" fill="${w.ground}"/>`;
    for (let i = 0; i < 9; i++) s += `<ellipse cx="${r() * W}" cy="${G + 30 + r() * 90}" rx="${20 + r() * 50}" ry="${5 + r() * 8}" fill="#000" opacity=".18"/>`;
    return s;
  },
  bosque(r, w) {
    let s = `<circle cx="${660 + r() * 140}" cy="190" r="66" fill="${w.acc}" opacity=".9"/>`;
    s += `<path d="M-100 ${G} L250 420 L560 ${G} Z M380 ${G} L800 360 L1200 ${G} Z M1000 ${G} L1380 440 L1760 ${G} Z" fill="#CFDDC2"/>`;
    const tree = (x, base, h, c) => `<g class="sc-sway" style="animation-delay:${(-r() * 4).toFixed(2)}s"><path d="M${x - h * .32} ${base} L${x} ${base - h} L${x + h * .32} ${base} Z" fill="${c}"/><rect x="${x - 4}" y="${base}" width="8" height="14" fill="#3E2B1E"/></g>`;
    for (let x = -40; x < W + 40; x += 40 + r() * 30) s += tree(x, 650, 80 + r() * 50, '#A6C792');
    for (let x = -40; x < W + 40; x += 60 + r() * 50) s += tree(x, 705, 120 + r() * 70, '#5F9A63');
    for (let x = -40; x < W + 40; x += 120 + r() * 140) if (x < 120 || x > 520) s += tree(x, G - 10, 180 + r() * 110, '#2C5A37');
    s += `<rect y="${G - 2}" width="${W}" height="${H - G + 2}" fill="${w.ground}"/>`;
    return s;
  },
  terminal(r, w, p) {
    let s = '';
    const vx = 800, vy = 520;
    for (let i = 0; i <= 24; i++) { const x = -800 + i * 133; s += `<line x1="${vx}" y1="${vy}" x2="${x}" y2="${H}" stroke="${w.acc}" stroke-opacity=".22" stroke-width="1.5"/>`; }
    for (let i = 1; i < 12; i++) { const y = vy + Math.pow(i / 11, 2.2) * (H - vy); s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${w.acc}" stroke-opacity=".22" stroke-width="1.5"/>`; }
    const code = ['const mundo = crear()', 'await deploy()', 'git push origin main', 'if (bug) arreglar()', 'npm run magia', 'while (vivo) aprender()', 'return <Guapo />', 'console.log("hola")'];
    for (let i = 0; i < 9; i++) s += `<text x="${120 + r() * 700}" y="${150 + r() * 300}" fill="${w.acc}" opacity="${(.06 + r() * .12).toFixed(2)}" font-family="monospace" font-size="${14 + r() * 10}">${esc(pick(code))}</text>`;
    s += `<text x="180" y="190" fill="${w.acc}" opacity=".85" font-family="monospace" font-size="30">~/${esc(p.name)} $</text>`;
    s += `<rect class="sc-blink" x="${190 + (p.name.length + 4) * 18}" y="166" width="16" height="30" fill="${w.acc}"/>`;
    s += `<rect y="${G}" width="${W}" height="${H - G}" fill="${w.ground}" opacity=".7"/>`;
    return s;
  },
  oceano(r, w) {
    let s = `<circle cx="${680 + r() * 140}" cy="270" r="105" fill="${w.acc}"/>`;
    for (let i = 0; i < 4; i++) { const x = 200 + r() * 600, y = 120 + r() * 180; s += `<path d="M${x} ${y} q10 -10 20 0 q10 -10 20 0" fill="none" stroke="${w.fg}" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>`; }
    s += `<path class="sc-drift2" d="${wavePath(560, 10, 160)}" fill="#86C7DB"/>`;
    s += `<g class="sc-float"><path d="M${420 + r() * 600} 556 l40 0 l-6 12 l-30 0 Z" fill="${w.fg}" opacity=".7"/></g>`;
    s += `<path class="sc-drift" d="${wavePath(620, 14, 200)}" fill="#55A8C4"/>`;
    s += `<path class="sc-drift2" d="${wavePath(690, 16, 240)}" fill="#2F86A6"/>`;
    s += `<rect y="${G}" width="${W}" height="${H - G}" fill="${w.ground}"/>`;
    s += `<path class="sc-drift" d="${wavePath(G + 4, 6, 120).replace(`L${W + 200} ${G} Z`, '').replace(`M-200 ${G} L-200`, 'M-200')}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>`;
    return s;
  },
  neon(r, w) {
    let s = `<circle cx="${660 + r() * 160}" cy="160" r="54" fill="#FFE6F3"/>`;
    for (let i = 0; i < 40; i++) s += `<circle cx="${r() * W}" cy="${r() * 360}" r="${(.6 + r() * 1.4).toFixed(1)}" fill="#fff" opacity="${(.3 + r() * .5).toFixed(2)}"/>`;
    const row = (fill, minH, maxH, lit) => {
      let out = '';
      for (let x = -20; x < W + 20;) {
        const bw = 70 + r() * 110, bh = minH + r() * (maxH - minH), y = G - bh;
        out += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${fill}"/>`;
        for (let wy = y + 18; wy < G - 20; wy += 26) for (let wx = x + 12; wx < x + bw - 16; wx += 20)
          if (r() < lit) out += `<rect x="${wx}" y="${wy}" width="8" height="12" fill="${r() > .6 ? w.acc : '#FFD36E'}" opacity="${(.5 + r() * .5).toFixed(2)}"/>`;
        x += bw + 6;
      }
      return out;
    };
    s += row('#2B2150', 180, 460, .12) + row('#3A2C69', 90, 260, .22);
    s += `<rect y="${G}" width="${W}" height="${H - G}" fill="${w.ground}"/>`;
    s += `<line x1="0" y1="${G + 70}" x2="${W}" y2="${G + 70}" stroke="${w.acc}" stroke-width="4" stroke-dasharray="40 30" opacity=".7"/>`;
    return s;
  },
  desierto(r, w) {
    let s = `<circle cx="${600 + r() * 120}" cy="470" r="200" fill="#F2A65A"/>`;
    s += `<path d="M-100 ${G} Q300 520 700 620 T1700 560 L1700 ${G} Z" fill="#EFC897"/>`;
    s += `<path d="M-100 ${G} Q500 600 900 680 T1700 640 L1700 ${G} Z" fill="#E7B67D"/>`;
    const cactus = (x, h) => `<g fill="${w.acc}"><rect x="${x}" y="${G - h}" width="34" height="${h}" rx="17"/><rect x="${x - 34}" y="${G - h * .62}" width="22" height="${h * .3}" rx="11"/><rect x="${x - 34}" y="${G - h * .42}" width="50" height="20" rx="10"/><rect x="${x + 46}" y="${G - h * .8}" width="22" height="${h * .34}" rx="11"/><rect x="${x + 18}" y="${G - h * .5}" width="50" height="20" rx="10"/></g>`;
    s += cactus(1420 + r() * 80, 190 + r() * 50) + cactus(640 + r() * 140, 110 + r() * 40);
    s += `<rect y="${G}" width="${W}" height="${H - G}" fill="${w.ground}"/>`;
    for (let i = 0; i < 14; i++) s += `<path d="M${r() * W} ${G + 30 + r() * 90} q12 -6 24 0" fill="none" stroke="#B9814C" stroke-width="2.5" stroke-linecap="round"/>`;
    return s;
  },
  nieve(r, w) {
    let s = `<circle cx="${660 + r() * 160}" cy="190" r="56" fill="#fff"/>`;
    const mtn = (x, h, wd, c) => `<path d="M${x - wd} ${G} L${x} ${G - h} L${x + wd} ${G} Z" fill="${c}"/><path d="M${x - wd * .28} ${G - h * .72} L${x} ${G - h} L${x + wd * .28} ${G - h * .72} L${x + wd * .12} ${G - h * .66} L${x} ${G - h * .74} L${x - wd * .12} ${G - h * .66} Z" fill="#fff"/>`;
    s += mtn(300, 420, 420, '#BFCDDD') + mtn(1250, 480, 460, '#BFCDDD') + mtn(800, 340, 380, '#A5B6CC');
    for (let x = 0; x < W; x += 80 + r() * 120) if (x < 120 || x > 520) { const h = 60 + r() * 60; s += `<path d="M${x - h * .3} ${G} L${x} ${G - h} L${x + h * .3} ${G} Z" fill="#2B3E57"/>`; }
    s += `<rect y="${G}" width="${W}" height="${H - G}" fill="${w.ground}"/>`;
    for (let i = 0; i < 70; i++) s += `<circle class="sc-snow" cx="${r() * W}" cy="0" r="${(2 + r() * 3).toFixed(1)}" fill="#fff" stroke="#C9D6E5" stroke-width="1" style="animation-duration:${(6 + r() * 8).toFixed(1)}s;animation-delay:${(-r() * 14).toFixed(1)}s"/>`;
    return s;
  },
};
function sceneSVG(p, align = 'xMidYMax') {
  const w = WORLDS[p.world];
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="${align} slice" aria-hidden="true"><rect width="${W}" height="${H}" fill="${w.bg}"/>${SCENES[p.world](rng(hash(p.name)), w, p)}</svg>`;
}

/* =========================================================
   Personaje
   ========================================================= */
const HAIR = [[58, 74, 12], [64, 56, 15], [80, 42, 17], [100, 35, 18], [120, 38, 17], [137, 50, 15], [145, 70, 12], [76, 66, 13], [94, 60, 14], [112, 58, 14], [129, 64, 13], [103, 73, 7]];
const BUDDY_SVG = `
<svg viewBox="0 0 200 300" aria-hidden="true">
 <g class="b-jump"><g class="b-body">
  <g class="b-leg b-legL"><rect x="83" y="226" width="15" height="60" rx="7" class="jeans k"/><path d="M77 296 Q77 282 90 282 L95 282 Q101 282 101 290 L101 296 Z" class="shoe k"/></g>
  <g class="b-leg b-legR"><rect x="102" y="226" width="15" height="60" rx="7" class="jeans k"/><path d="M99 296 L99 290 Q99 282 105 282 L110 282 Q123 282 123 296 Z" class="shoe k"/></g>
  <g class="b-arm b-armL"><line x1="68" y1="182" x2="61" y2="230" class="arm-o"/><line x1="68" y1="182" x2="61" y2="230" class="arm-i"/><circle cx="60" cy="233" r="7.5" class="skin k"/></g>
  <g class="b-arm b-armR"><line x1="132" y1="182" x2="139" y2="230" class="arm-o"/><line x1="132" y1="182" x2="139" y2="230" class="arm-i"/><circle cx="140" cy="233" r="7.5" class="skin k"/></g>
  <rect x="92" y="148" width="16" height="22" class="skin k"/>
  <path d="M84 164 L116 164 Q131 166 139 187 L128 193 L128 236 Q100 242 72 236 L72 193 L61 187 Q69 166 84 164 Z" class="shirt k"/>
  <path d="M88 165 Q100 177 112 165 Z" class="skin k"/>
  <path d="M79 172 L71 188 M121 172 L129 188" class="stripe"/>
  <g class="acc acc-helmet"><rect x="72" y="152" width="56" height="14" rx="7" class="acc-fill k"/></g>
  <g class="b-head">
   <circle cx="48" cy="104" r="9" class="skin k"/><circle cx="152" cy="104" r="9" class="skin k"/>
   <path d="M48 96 C48 58 72 40 100 40 C130 40 152 58 152 96 C152 132 128 156 100 156 C72 156 48 132 48 96 Z" class="skin k"/>
   <path d="M50 102 Q48 88 54 78 L60 98 Z M150 102 Q152 88 146 78 L140 98 Z" class="fade"/>
   <g class="b-face">
    <ellipse cx="68" cy="124" rx="7" ry="4" class="blush"/><ellipse cx="132" cy="124" rx="7" ry="4" class="blush"/>
    <circle cx="74" cy="118" r="1.2" class="freck"/><circle cx="79" cy="121" r="1.2" class="freck"/><circle cx="126" cy="118" r="1.2" class="freck"/><circle cx="121" cy="121" r="1.2" class="freck"/>
    <g class="b-eyes">
     <circle cx="82" cy="100" r="9.5" class="eye"/><circle cx="118" cy="100" r="9.5" class="eye"/>
     <g class="b-pupils"><circle cx="82" cy="101" r="5" class="pupil"/><circle cx="118" cy="101" r="5" class="pupil"/><circle cx="84" cy="98.5" r="1.7" class="glint"/><circle cx="120" cy="98.5" r="1.7" class="glint"/></g>
    </g>
    <rect x="66" y="86" width="32" height="27" rx="7" class="lens"/><rect x="102" y="86" width="32" height="27" rx="7" class="lens"/>
    <path d="M98 97 Q100 94 102 97 M66 95 L50 93 M134 95 L150 93" class="frame"/>
    <g class="acc acc-shades"><rect x="66" y="86" width="32" height="27" rx="7" fill="#141414"/><rect x="102" y="86" width="32" height="27" rx="7" fill="#141414"/><path d="M71 93 L80 91 M107 93 L116 91" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".5"/></g>
    <path d="M101 106 Q105 115 98 117" class="nose"/>
    <path d="M91 123 Q100 120 109 123" class="stache"/>
    <path d="M90 130 Q100 139 110 130" class="mouth"/>
   </g>
   <g class="b-hair">
    <g class="b-hair-top">${HAIR.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 3}" class="hair-o"/>`).join('')}${HAIR.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" class="hair-f"/>`).join('')}
     <path d="M84 44 q6 -5 11 0 M110 42 q6 -5 11 0 M127 56 q5 -4 10 1 M68 60 q5 -4 9 1 M95 58 q5 -4 10 0" class="curl"/></g>
    <g class="acc acc-beanie"><path d="M48 78 C48 18 152 18 152 78 Z" class="acc-fill k"/><rect x="44" y="66" width="112" height="17" rx="8.5" class="acc-fill k"/><path d="M60 66 L60 83 M76 66 L76 83 M92 66 L92 83 M108 66 L108 83 M124 66 L124 83 M140 66 L140 83" stroke="#000" stroke-opacity=".15" stroke-width="3"/><circle cx="100" cy="22" r="10" fill="#fff" class="k"/></g>
    <g class="acc acc-leaf"><path d="M118 24 Q134 6 148 18 Q136 34 118 24 Z" fill="#6FAF5B" class="k"/><path d="M120 23 Q132 18 144 19" fill="none" stroke="#141414" stroke-width="2"/></g>
    <g class="acc acc-phones"><path d="M44 104 C38 18 162 18 156 104" fill="none" stroke="#141414" stroke-width="7" stroke-linecap="round"/><rect x="34" y="88" width="20" height="32" rx="9" class="acc-fill k"/><rect x="146" y="88" width="20" height="32" rx="9" class="acc-fill k"/></g>
   </g>
   <g class="b-brows"><path d="M70 82 Q80 77 92 81" class="brow"/><path d="M108 81 Q120 77 130 82" class="brow"/></g>
  </g>
  <g class="acc acc-helmet"><circle cx="100" cy="98" r="76" class="helmet-glass"/><path d="M48 76 A58 58 0 0 1 82 38" class="helmet-shine"/></g>
 </g></g>
</svg>`;

const MOUTH = {
  smile: 'M90 130 Q100 139 110 130',
  grin: 'M88 128 Q100 146 112 128 Z',
  neutral: 'M93 132 Q100 134 107 132',
  o: 'M95 133 Q95 127 100 127 Q105 127 105 133 Q105 139 100 139 Q95 139 95 133 Z',
  flat: 'M93 133 L107 133',
  smirk: 'M91 133 Q103 136 111 127',
};
const BROWS = {
  normal: ['M70 82 Q80 77 92 81', 'M108 81 Q120 77 130 82'],
  up: ['M70 76 Q80 70 92 74', 'M108 74 Q120 70 130 76'],
  sus: ['M70 82 Q80 77 92 81', 'M108 76 Q120 71 130 76'],
  angry: ['M72 77 Q82 80 92 85', 'M108 85 Q118 80 128 77'],
};
const JOKES = [
  'Funciona en mi máquina. Pues mandamos tu máquina.',
  'Tengo 99 problemas y 98 son de CSS.',
  'Un bug es una feature sin documentar.',
  'git commit -m "arreglado (creo)"',
  'Minimalista: tengo la nevera igual.',
  '¿Por qué confundo Halloween y Navidad? OCT 31 = DEC 25.',
];

const mouse = { x: innerWidth * .5, y: innerHeight * .4 };
addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

class Buddy {
  static all = new Set();
  constructor(host, { acc = '', accent = '', lines = [] } = {}) {
    const el = document.createElement('div');
    el.className = 'buddy';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'mini-s0k1x. Pulsa para que haga algo.');
    el.innerHTML = `<div class="b-bubble" aria-live="polite"></div><div class="b-zzz" aria-hidden="true"><span>z</span><span>z</span><span>Z</span></div>${BUDDY_SVG}`;
    if (acc) el.dataset.acc = acc;
    if (accent) el.style.setProperty('--b-acc', accent);
    host.appendChild(el);
    Object.assign(this, {
      el, lines, alive: true, busy: false, sleeping: false, token: 0, flipped: false, trickIdx: 0, lookEl: null, lookUntil: 0,
      bubble: $('.b-bubble', el), mouth: $('.mouth', el), brows: el.querySelectorAll('.brow'),
      eyes: $('.b-eyes', el), pupils: $('.b-pupils', el), face: $('.b-face', el), hair: $('.b-hair', el),
      browG: $('.b-brows', el), head: $('.b-head', el), svg: $('svg', el),
    });
    el.addEventListener('click', (e) => { e.stopPropagation(); this.trick(); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.trick(); } });
    Buddy.all.add(this);
    this.blinkLoop();
  }
  destroy() { this.alive = false; Buddy.all.delete(this); this.el.remove(); }
  mood(m = 'smile', b = 'normal') {
    this.mouth.setAttribute('d', MOUTH[m]);
    this.mouth.classList.toggle('open', m === 'grin' || m === 'o');
    this.brows[0].setAttribute('d', BROWS[b][0]);
    this.brows[1].setAttribute('d', BROWS[b][1]);
  }
  async say(text, ms = 3000, m = 'smile') {
    const t = ++this.token;
    this.bubble.textContent = '';
    this.bubble.classList.add('show');
    for (let i = 0; i < text.length; i++) {
      if (t !== this.token || !this.alive) return;
      this.bubble.textContent += text[i];
      if (!reduced && i % 3 === 0) this.mouth.setAttribute('d', MOUTH[i % 6 === 0 ? 'o' : m]);
      if (!reduced) await sleep(20);
    }
    this.mood(m, m === 'grin' ? 'up' : 'normal');
    await sleep(ms);
    if (t === this.token) { this.bubble.classList.remove('show'); if (!this.busy) this.mood(); }
  }
  hush() { this.token++; this.bubble.classList.remove('show'); }
  async act(cls, ms) {
    this.busy = true;
    this.el.classList.remove('waving', 'jump', 'spin', 'dance', 'shake', 'cheer');
    void this.el.offsetWidth;
    this.el.classList.add(cls);
    await sleep(reduced ? 200 : ms);
    this.el.classList.remove(cls);
    this.busy = false;
  }
  async walk(from, to, ms) {
    this.flipped = to < from;
    this.el.classList.toggle('flip', this.flipped);
    if (reduced) { this.el.style.translate = `${to}px 0`; this.flipped = false; this.el.classList.remove('flip'); return; }
    this.el.classList.add('walking');
    const a = this.el.animate([{ translate: `${from}px 0` }, { translate: `${to}px 0` }], { duration: ms, easing: 'linear', fill: 'forwards' });
    try { await a.finished; } catch {}
    this.el.classList.remove('walking', 'flip');
    this.flipped = false;
  }
  lookAt(el, ms = 1500) { this.lookEl = el; this.lookUntil = performance.now() + ms; }
  frame() {
    if (this.sleeping) return;
    const r = this.svg.getBoundingClientRect();
    if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
    let tx = mouse.x, ty = mouse.y;
    if (this.lookEl && performance.now() < this.lookUntil) { const b = this.lookEl.getBoundingClientRect(); tx = b.left + b.width / 2; ty = b.top + b.height / 2; }
    const s = r.width / 200, cx = r.left + 100 * s, cy = r.top + 100 * s;
    let dx = tx - cx; const dy = ty - cy;
    if (this.flipped) dx = -dx;
    const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 420), ux = dx / d * k, uy = dy / d * k;
    this.pupils.style.transform = `translate(${ux * 3.5}px, ${uy * 3}px)`;
    this.face.style.transform = this.browG.style.transform = `translate(${ux * 6}px, ${uy * 4}px)`;
    this.hair.style.transform = `translate(${ux * 2}px, ${uy * 1.5}px)`;
    this.head.style.transform = `rotate(${ux * 4}deg)`;
  }
  async blinkLoop() {
    while (this.alive) {
      await sleep(2000 + Math.random() * 3500);
      if (this.sleeping || !this.alive) continue;
      this.eyes.classList.add('blink'); await sleep(110); this.eyes.classList.remove('blink');
      if (Math.random() < .2) { await sleep(150); this.eyes.classList.add('blink'); await sleep(100); this.eyes.classList.remove('blink'); }
    }
  }
  sleep() {
    if (this.busy || this.sleeping) return;
    this.sleeping = true; this.hush(); this.el.classList.add('sleep'); this.mood('flat');
    this.pupils.style.transform = this.face.style.transform = this.browG.style.transform = '';
  }
  wake() {
    if (!this.sleeping) return;
    this.sleeping = false; this.el.classList.remove('sleep'); this.mood('o', 'up'); this.act('shake', 400);
    this.say(pick(['¡Estaba despierto! Lo juro.', '¿Eh? ¿Qué? ¿Quién?', 'Solo descansaba los ojos…']), 2200, 'o');
  }
  async trick() {
    if (this.busy) return;
    if (this.sleeping) return this.wake();
    const list = [
      async () => { this.mood('grin', 'up'); this.say(pick(['¡Hola hola!', '¡Ey! ¿Qué tal?', 'Yo saludo, tú haces scroll.']), 2000, 'grin'); await this.act('waving', 1900); },
      async () => { this.mood('grin', 'up'); this.say(pick(['¡Boing!', 'Hoy he desayunado fuerte.', 'Salto de calidad.']), 1800, 'grin'); await this.act('jump', 760); },
      async () => { this.mood('o', 'up'); this.say(pick(['Wiiii', 'Me mareo…', 'Giro de 360°, como mis ideas.']), 1800, 'o'); await this.act('spin', 950); this.mood(); },
      async () => { this.mood('smirk', 'sus'); this.say(pick(this.lines.length ? this.lines : JOKES), 3200, 'smirk'); },
      async () => { this.mood('grin', 'up'); this.say(pick(['tunts tunts tunts', 'Paso prohibido nº 7', 'No me mires mientras bailo.']), 2600, 'grin'); await this.act('dance', 3000); this.mood(); },
      async () => { this.mood('smirk', 'sus'); this.say(pick(JOKES), 3600, 'smirk'); },
    ];
    await list[this.trickIdx++ % list.length]();
  }
}
(function loop() { Buddy.all.forEach((b) => b.frame()); requestAnimationFrame(loop); })();

/* =========================================================
   Home
   ========================================================= */
$('#status').textContent = CONFIG.status;
$('#lede').textContent = CONFIG.lede;
$('#aboutBig').innerHTML = CONFIG.about;
$('#facts').innerHTML = CONFIG.facts.map(([t, d]) => `<div><dt class="mono">${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('');
$('#socials').innerHTML = CONFIG.socials.map(([l, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)} ↗</a></li>`).join('');
$('#mailText').textContent = CONFIG.email;
$('#year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => document.getElementById(b.dataset.go).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })));

// reveal
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
function reveal(root = document) { root.querySelectorAll('.block-head, .about, .contact-big, .mail, .socials, .w-row').forEach((el) => { if (!el.classList.contains('rv')) { el.classList.add('rv'); io.observe(el); } }); }
reveal();

// personaje principal
const hero = new Buddy($('#heroStage'), { accent: '#FFD23F' });
(async () => {
  hero.mood('smile');
  const from = Math.min(innerWidth * .6, 700);
  await sleep(400);
  await hero.walk(from, 0, reduced ? 0 : 1800);
  hero.mood('grin', 'up');
  hero.act('waving', 1900);
  await hero.say('¡Hola! Soy mini-s0k1x.', 1200, 'grin');
  await sleep(250);
  hero.say('Cada proyecto es un mundo. Baja y elige uno.', 3200);
})();
let idleT;
function poke() { clearTimeout(idleT); if (hero.sleeping) hero.wake(); idleT = setTimeout(() => { if (!worldOpen) hero.sleep(); }, 25000); }
['pointermove', 'scroll', 'keydown', 'touchstart'].forEach((ev) => addEventListener(ev, poke, { passive: true }));
poke();
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (Date.now() - hiddenAt > 6000) { const b = worldBuddy || hero; b.mood('grin', 'up'); b.say(pick(['¡Has vuelto!', 'Te echaba de menos.', '¿Dónde estabas?']), 2200, 'grin'); }
});

// tema
$('#theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  store.set('theme', root.dataset.theme);
  hero.mood(dark ? 'grin' : 'o', 'up');
  hero.say(dark ? pick(['¡Mis ojos!', 'Buenos días, sol.']) : pick(['¿Quién ha apagado la luz?', 'Modo noche activado.']), 2200, dark ? 'grin' : 'o');
});

// email
$('#mail').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(CONFIG.email); } catch {
    const t = document.createElement('textarea'); t.value = CONFIG.email; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch {} t.remove();
  }
  $('#mailTag').textContent = '¡copiado!';
  setTimeout(() => ($('#mailTag').textContent = 'copiar'), 1800);
});

/* =========================================================
   Proyectos
   ========================================================= */
let PROJECTS = [];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : '';

async function fetchJSON(url, key) {
  try { const c = sessionStorage.getItem(key); if (c) return JSON.parse(c); } catch {}
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();
  try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
  return data;
}

const ready = (async () => {
  let repos = [];
  try { repos = await fetchJSON(`https://api.github.com/users/${CONFIG.github}/repos?per_page=100&sort=pushed`, 'repos'); } catch {}
  const hidden = new Set(CONFIG.hidden.map((n) => n.toLowerCase()));
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));
  const list = [];
  const seen = new Set();
  const fromRepo = (r) => ({
    name: r.name, desc: r.description, lang: r.language, url: r.html_url, homepage: r.homepage, stars: r.stargazers_count,
    pushed: r.pushed_at, branch: r.default_branch, topics: r.topics || [],
  });
  for (const c of CONFIG.projects) {
    const r = byName.get(c.name.toLowerCase());
    list.push({ ...(r ? fromRepo(r) : { url: `https://github.com/${CONFIG.github}/${c.name}`, branch: 'main', topics: [] }), ...c, desc: c.desc || r?.description });
    seen.add(c.name.toLowerCase());
  }
  repos.filter((r) => !r.fork && !seen.has(r.name.toLowerCase()) && !hidden.has(r.name.toLowerCase()) && r.name.toLowerCase() !== CONFIG.github.toLowerCase())
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .forEach((r) => list.push(fromRepo(r)));
  // asigna mundos sin repetir hasta agotarlos
  const used = new Set(list.filter((p) => p.world).map((p) => p.world));
  let queue = [];
  for (const p of list) {
    if (p.world && WORLDS[p.world]) continue;
    if (!queue.length) { queue = ORDER.filter((w) => !used.has(w)); used.clear(); if (!queue.length) queue = [...ORDER]; }
    p.world = queue.shift();
  }
  PROJECTS = list;
  renderList();
})();

function renderList() {
  const ol = $('#worldList');
  $('#count').textContent = `(${String(PROJECTS.length).padStart(2, '0')})`;
  ol.innerHTML = '';
  PROJECTS.forEach((p, i) => {
    const w = WORLDS[p.world];
    const li = document.createElement('li');
    li.innerHTML = `<button class="w-row" style="--row:${w.bg};--rowfg:${w.fg};--dot:${w.acc}">
      <span class="w-num mono">${String(i + 1).padStart(2, '0')}</span>
      <span class="w-name">${esc(p.name)}</span>
      <span class="w-sub w-type mono"><i class="w-dot"></i>${w.label}</span>
      <span class="w-sub w-lang mono">${esc(p.lang || '—')}</span>
      <span class="w-sub w-year mono">${p.pushed ? new Date(p.pushed).getFullYear() : ''}</span>
      <span class="w-arrow" aria-hidden="true">→</span></button>`;
    const btn = li.firstElementChild;
    btn.setAttribute('aria-label', `Entrar al mundo ${w.label}: ${p.name}`);
    btn.addEventListener('click', (e) => enter(p.name, e.clientX, e.clientY));
    btn.addEventListener('pointerenter', () => showPreview(p));
    btn.addEventListener('pointerleave', hidePreview);
    ol.appendChild(li);
  });
  reveal(ol);
}

// preview flotante
const preview = $('#preview');
let pvName = '';
function showPreview(p) { if (pvName !== p.name) { preview.innerHTML = sceneSVG(p, 'xMidYMid'); pvName = p.name; } preview.classList.add('on'); }
function hidePreview() { preview.classList.remove('on'); }
let pvX = 0, pvY = 0;
(function pvLoop() {
  pvX += (mouse.x + 28 - pvX) * .18; pvY += (mouse.y - 90 - pvY) * .18;
  const x = Math.min(pvX, innerWidth - 320);
  preview.style.transform = `translate(${x}px, ${pvY}px) rotate(${(mouse.x + 28 - pvX) * .03}deg)`;
  requestAnimationFrame(pvLoop);
})();

/* =========================================================
   Mundo (vista de proyecto)
   ========================================================= */
const world = $('#world');
const portal = $('#portal');
let worldOpen = false;
let worldBuddy = null;
let current = -1;
const readmeCache = new Map();

async function portalTo(color, x, y, fn) {
  portal.className = 'portal';
  portal.style.setProperty('--pbg', color);
  portal.style.setProperty('--px', `${x}px`);
  portal.style.setProperty('--py', `${y}px`);
  if (reduced) { fn(); return; }
  void portal.offsetWidth;
  portal.classList.add('open');
  await sleep(780);
  fn();
  await sleep(60);
  portal.classList.add('fade');
  await sleep(520);
  portal.className = 'portal';
}

function enter(name, x = innerWidth / 2, y = innerHeight / 2) {
  const p = PROJECTS.find((q) => q.name === name);
  if (!p) return;
  hidePreview();
  portalTo(WORLDS[p.world].bg, x, y, () => { location.hash = `#/mundo/${encodeURIComponent(name)}`; });
}

async function route() {
  const m = location.hash.match(/^#\/mundo\/(.+)$/);
  if (!m) { if (worldOpen) closeWorld(); return; }
  await ready;
  const idx = PROJECTS.findIndex((p) => p.name.toLowerCase() === decodeURIComponent(m[1]).toLowerCase());
  if (idx < 0) { history.replaceState(null, '', location.pathname); closeWorld(); return; }
  openWorld(idx);
}
addEventListener('hashchange', route);

function openWorld(idx) {
  const p = PROJECTS[idx];
  const w = WORLDS[p.world];
  current = idx;
  worldOpen = true;
  hero.hush();
  world.hidden = false;
  world.scrollTop = 0;
  document.body.classList.add('locked');
  document.title = `${p.name} · s0k1x`;
  Object.entries({ '--wbg': w.bg, '--wfg': w.fg, '--wacc': w.acc, '--wgfg': w.gfg, '--b-bg': w.fg, '--b-fg': w.bg }).forEach(([k, v]) => world.style.setProperty(k, v));
  document.querySelector('meta[name="theme-color"]').content = w.bg;
  $('#wScene').innerHTML = sceneSVG(p);
  $('#wCount').textContent = `${String(idx + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}`;
  $('#wKicker').textContent = `Mundo ${String(idx + 1).padStart(2, '0')} · ${w.label}`;
  $('#wTitle').textContent = p.name;
  $('#wDesc').textContent = p.desc || 'Un mundo todavía sin descripción. Pero con mucho potencial.';
  $('#wMeta').innerHTML = [p.lang, p.stars != null ? `★ ${p.stars}` : '', p.pushed ? `Actualizado ${fmtDate(p.pushed)}` : '', ...(p.topics || []).slice(0, 3).map((t) => `#${t}`)]
    .filter(Boolean).map((t) => `<span>${esc(t)}</span>`).join('');
  $('#wActions').innerHTML = `<a class="w-link primary" href="${esc(p.url)}" target="_blank" rel="noopener">Ver código ↗</a>` +
    (p.homepage ? `<a class="w-link" href="${esc(p.homepage)}" target="_blank" rel="noopener">Visitar ↗</a>` : '');

  if (worldBuddy) worldBuddy.destroy();
  worldBuddy = new Buddy($('#wBuddy'), { acc: w.item, accent: w.acc, lines: w.lines });
  (async (b) => {
    await b.walk(-Math.min(innerWidth * .4, 420), 0, reduced ? 0 : 1300);
    if (!b.alive) return;
    b.mood('grin', 'up');
    b.act(Math.random() > .5 ? 'waving' : 'jump', 1500);
    b.say(pick(w.lines), 3000, 'grin');
  })(worldBuddy);

  loadReadme(p);
}

function closeWorld() {
  worldOpen = false;
  world.hidden = true;
  document.body.classList.remove('locked');
  document.title = 's0k1x';
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if (worldBuddy) { worldBuddy.destroy(); worldBuddy = null; }
  current = -1;
  setTimeout(() => { hero.mood('grin', 'up'); hero.say(pick(['¡De vuelta en casa!', '¿Qué tal el viaje?', '¿Otro mundo?']), 2200, 'grin'); }, 300);
}

async function loadReadme(p) {
  const el = $('#wReadme');
  el.innerHTML = '<p class="empty">Cargando…</p>';
  let md = readmeCache.get(p.name);
  if (md === undefined) {
    try {
      const res = await fetch(`https://api.github.com/repos/${CONFIG.github}/${p.name}/readme`, { headers: { Accept: 'application/vnd.github.raw+json' } });
      md = res.ok ? await res.text() : null;
    } catch { md = null; }
    readmeCache.set(p.name, md);
  }
  if (PROJECTS[current]?.name !== p.name) return;
  if (!md || md.trim().length < 20 || !window.marked || !window.DOMPurify) {
    el.innerHTML = '<p class="empty">Este mundo aún no tiene historia escrita. Pero mini-s0k1x ya está aquí, así que algo bueno va a pasar.</p>';
    return;
  }
  el.innerHTML = DOMPurify.sanitize(marked.parse(md));
  if (!p.desc) {
    const first = [...el.querySelectorAll('p')].map((x) => x.textContent.trim()).find((t) => t.length > 30);
    if (first) { p.desc = first.length > 170 ? first.slice(0, 167).trim() + '…' : first; $('#wDesc').textContent = p.desc; }
  }
  const raw = `https://raw.githubusercontent.com/${CONFIG.github}/${p.name}/${p.branch || 'main'}/`;
  const blob = `https://github.com/${CONFIG.github}/${p.name}/blob/${p.branch || 'main'}/`;
  const rel = (u) => u && !/^([a-z]+:|#|\/\/)/i.test(u);
  el.querySelectorAll('img').forEach((i) => { const s = i.getAttribute('src'); if (rel(s)) i.src = new URL(s, raw).href; i.loading = 'lazy'; });
  el.querySelectorAll('a').forEach((a) => { const h = a.getAttribute('href'); if (rel(h)) a.href = new URL(h, blob).href; if (!h?.startsWith('#')) { a.target = '_blank'; a.rel = 'noopener'; } });
}

async function step(dir) {
  if (current < 0 || !PROJECTS.length) return;
  const next = (current + dir + PROJECTS.length) % PROJECTS.length;
  const b = worldBuddy;
  if (b && !reduced) { b.hush(); b.walk(0, dir * innerWidth * .9, 900); await sleep(350); }
  const r = $('#wBuddy').getBoundingClientRect();
  portalTo(WORLDS[PROJECTS[next].world].bg, dir > 0 ? innerWidth : 0, r.top + r.height / 2, () => { location.hash = `#/mundo/${encodeURIComponent(PROJECTS[next].name)}`; });
}
$('#wNext').addEventListener('click', () => step(1));
$('#wPrev').addEventListener('click', () => step(-1));
$('#wBack').addEventListener('click', (e) => {
  const c = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  portalTo(c, e.clientX || 40, e.clientY || 30, () => { history.pushState(null, '', location.pathname + '#mundos'); route(); document.getElementById('mundos').scrollIntoView(); });
});
$('#wScroll').addEventListener('click', () => world.scrollTo({ top: innerHeight, behavior: reduced ? 'auto' : 'smooth' }));
addEventListener('keydown', (e) => {
  if (!worldOpen) return;
  if (e.key === 'Escape') $('#wBack').click();
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});
route();

/* =========================================================
   Easter egg: escribe "s0k1x" o el código Konami
   ========================================================= */
let typed = '', keys = '';
const KONAMI = 'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba';
addEventListener('keydown', (e) => {
  typed = (typed + e.key).slice(-5).toLowerCase();
  keys = (keys + e.key).slice(-KONAMI.length);
  if (typed === 's0k1x' || keys === KONAMI) party();
});
function party() {
  typed = keys = '';
  Buddy.all.forEach((b) => { b.mood('grin', 'up'); b.say('¡¡FIESTAAA!! Me has encontrado.', 2600, 'grin'); b.act('dance', 3000); });
  if (reduced) return;
  const colors = ['#FFD23F', '#FF5B2E', '#2FCB6B', '#6B4EFF', '#FF4FA3', '#111'];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    Object.assign(c.style, { left: `${Math.random() * 100}vw`, background: pick(colors), animationDuration: `${1.8 + Math.random() * 2}s`, animationDelay: `${Math.random() * .4}s`, borderRadius: Math.random() > .5 ? '50%' : '2px' });
    c.style.setProperty('--dx', `${Math.random() * 200 - 100}px`);
    c.style.setProperty('--r', `${Math.random() * 1080 - 540}deg`);
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4500);
  }
}
