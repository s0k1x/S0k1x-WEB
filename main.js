/* Portada: las pestañas de la ventana cambian la captura; una vuelta automática cada 3,4 s que se para al pulsar */
const tabs = [...document.querySelectorAll('.win__tabs button')], imgs = [...document.querySelectorAll('.win__screen img')], link = document.getElementById('winLink');
let i = 0, auto = !matchMedia('(prefers-reduced-motion: reduce)').matches;
function show(k) { i = k; tabs.forEach((t, j) => t.setAttribute('aria-selected', j === k)); imgs.forEach((im, j) => im.classList.toggle('is-on', j === k)); link.href = imgs[k].dataset.href; }
tabs.forEach((t, k) => t.addEventListener('click', () => { auto = false; show(k); }));
setInterval(() => { if (auto && !document.hidden) show((i + 1) % imgs.length); }, 3400);
