/* Portada: las pestañas de la ventana cambian la captura (solo al pulsar; nada se mueve solo) */
const tabs = [...document.querySelectorAll('.win__tabs button')], imgs = [...document.querySelectorAll('.win__screen img')], link = document.getElementById('winLink');
function show(k) { tabs.forEach((t, j) => t.setAttribute('aria-selected', j === k)); imgs.forEach((im, j) => { im.hidden = j !== k; im.classList.toggle('is-on', j === k); }); link.href = imgs[k].dataset.href; }
tabs.forEach((t, k) => t.addEventListener('click', () => show(k)));
