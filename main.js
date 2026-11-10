/* Portada: las pestañas de la ventana cambian la captura (solo al pulsar; nada se mueve solo) */
const html = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
// capturas automáticas (HeadlessChrome) ven la página terminada, como hace el kit
const anim = !reduced && html.dataset.motion !== 'off' && (!/HeadlessChrome/.test(navigator.userAgent) || html.dataset.motion === 'live');
if (anim) html.classList.add('a-on');

const tabs = [...document.querySelectorAll('.win__tabs button')], imgs = [...document.querySelectorAll('.win__screen img')], link = document.getElementById('winLink');
const bar = document.querySelector('.win__tabs');
const ind = document.createElement('span'); ind.className = 'a-ind'; ind.setAttribute('aria-hidden', 'true'); bar.prepend(ind);
let cur = 0;
function place() { const t = tabs[cur]; ind.style.width = t.offsetWidth + 'px'; ind.style.transform = `translateX(${t.offsetLeft}px)`; }
function show(k) {
  if (k === cur) return;
  cur = k;
  tabs.forEach((t, j) => t.setAttribute('aria-selected', j === k));
  const im = imgs[k]; im.hidden = false; im.classList.add('is-on');
  link.href = im.dataset.href; place();
  const done = () => { im.classList.remove('a-enter'); imgs.forEach((o, j) => { if (j !== cur) { o.hidden = true; o.classList.remove('is-on'); } }); };
  if (anim) { im.classList.remove('a-enter'); void im.offsetWidth; im.classList.add('a-enter'); im.addEventListener('animationend', done, { once: true }); } else done();
}
tabs.forEach((t, k) => t.addEventListener('click', () => show(k)));
document.fonts?.ready.then(place); addEventListener('resize', place); place();

if (anim) {
  /* entrada de la portada: palabra a palabra en el titular */
  const hero = document.querySelector('.hero');
  const h1 = hero.querySelector('h1');
  h1.setAttribute('aria-label', h1.textContent);
  const words = h1.textContent.split(' ');
  h1.innerHTML = words.map(w => `<span class="a-w a-in" aria-hidden="true">${w}</span>`).join(' ');
  let i = 0;
  [hero.querySelector('.pill'), ...h1.children, hero.querySelector('.hero__lead'), ...hero.querySelectorAll('.btn-row .btn')]
    .forEach(el => { if (!el) return; el.classList.add('a-in'); el.style.setProperty('--i', i++); });
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));
  // al terminar, los botones recuperan sus propias transiciones de hover
  setTimeout(() => hero.querySelectorAll('.btn.a-in, .pill.a-in').forEach(el => el.classList.remove('a-in')), 1800);

  /* piezas que aparecen al hacer scroll */
  const groups = [
    document.querySelectorAll('#destacados .section-head > *'),
    document.querySelectorAll('#destacados .card'),
    document.querySelectorAll('#mas .section-head > *'),
    document.querySelectorAll('#mas .rows > li'),
    document.querySelectorAll('#contacto .section-head--split > *'),
  ];
  groups.forEach(list => list.forEach((el, k) => {
    el.classList.add('a-rv'); el.style.setProperty('--i', el.matches('li') ? k : k % 2);
    // cuando termina de entrar, la pieza vuelve a sus estilos normales (el hover de las tarjetas y botones)
    el.addEventListener('transitionend', function end(e) { if (e.target === el && e.propertyName === 'translate') { el.classList.remove('a-rv', 'is-in'); el.style.removeProperty('--i'); el.removeEventListener('transitionend', end); } });
  }));
  document.querySelectorAll('.tools-row').forEach(r => { r.classList.add('a-rv'); r.querySelectorAll('img').forEach((im, k) => im.style.setProperty('--i', k)); });

  /* terminal: cada línea se escribe con tantos pasos como letras tiene */
  const term = document.querySelector('.term'), pre = term?.querySelector('.term__body');
  if (pre) {
    const lines = pre.innerHTML.split('\n');
    pre.innerHTML = lines.map((l, k) => { const n = l.replace(/<[^>]+>/g, '').length || 1; return `<span class="tl" style="--i:${k};--s:${n};--d:${Math.min(.9, .25 + n * .012)}s">${l}</span>`; }).join('\n');
    term.classList.add('a-rv');
    term.addEventListener('transitionend', e => { if (e.target === pre.lastElementChild) term.classList.add('is-done'); });
  }

  /* cierre: letra a letra */
  const word = document.querySelector('.close__word');
  if (word) { word.innerHTML = [...word.textContent].map((c, k) => `<span class="a-l" style="--i:${k}">${c}</span>`).join(''); word.classList.add('a-rv'); }

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .2, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.a-rv').forEach(el => io.observe(el));
}

/* foco de luz de las tarjetas (también sin animaciones: no mueve nada, solo ilumina) */
if (matchMedia('(hover: hover)').matches) document.querySelectorAll('.card--open .shot').forEach(c => c.closest('.card').addEventListener('pointermove', e => {
  const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
}));
