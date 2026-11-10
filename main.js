/* Portada: las pestañas de la ventana cambian la captura (solo al pulsar; nada se mueve solo) */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  if (!reduced) { im.classList.remove('a-enter'); void im.offsetWidth; im.classList.add('a-enter'); im.addEventListener('animationend', done, { once: true }); } else done();
}
tabs.forEach((t, k) => t.addEventListener('click', () => show(k)));
document.fonts?.ready.then(place); addEventListener('resize', place); place();

/* Cierre: cada letra de s0k1x en su span para la ola al pasar el ratón (el texto no cambia) */
const word = document.querySelector('.close__word');
if (word) word.innerHTML = [...word.textContent].map((c, k) => `<span class="a-l" style="--i:${k}">${c}</span>`).join('');
