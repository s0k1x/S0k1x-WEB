/* Proyectos: salen solo de projects.json, en su orden y con sus textos */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const host = (u) => { try { const x = new URL(u); return (x.host + x.pathname).replace(/\/$/, ''); } catch { return u; } };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

async function load() {
  let cfg = { proyectos: [] };
  try { const r = await fetch('projects.json', { cache: 'no-cache' }); if (r.ok) cfg = await r.json(); } catch {}
  return (cfg.proyectos || []).filter((p) => p && p.nombre && p.mostrar !== false);
}

function render(list) {
  $('#projCount').textContent = list.length ? `${list.length} proyectos` : '';
  $('#projects').innerHTML = list.length ? list.map((p) => {
    const links = [p.web && `<a href="${esc(p.web)}" target="_blank" rel="noopener">Visitar ↗</a>`, p.codigo && `<a href="${esc(p.codigo)}" target="_blank" rel="noopener">Código ↗</a>`].filter(Boolean).join('');
    const tags = (p.etiquetas || []).map((t) => `<span>${esc(t)}</span>`).join('');
    const sub = p.web ? host(p.web) : p.codigo ? host(p.codigo) : '';
    const thumb = p.imagen ? `<a class="thumb" href="${esc(p.web || p.codigo)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><img src="${esc(p.imagen)}" alt="" loading="lazy" width="320" height="200"></a>` : '';
    return `<li class="project${p.imagen ? ' has-thumb' : ''}"><div class="project__main"><h3>${esc(p.nombre)}</h3>${sub ? `<p class="sub mono">${esc(sub)}</p>` : ''}${p.descripcion ? `<p class="desc">${esc(p.descripcion)}</p>` : ''}${tags ? `<div class="tags">${tags}</div>` : ''}${links ? `<div class="links">${links}</div>` : ''}</div>${thumb}</li>`;
  }).join('') : '<li class="empty">Pronto habrá proyectos aquí.</li>';
}

/* Portada: ventana de navegador que pasa las capturas de los proyectos */
function browser(list) {
  const shots = list.filter((p) => p.imagen && p.web), screen = $('#browserScreen'), url = $('#browserUrl'), link = $('#browser');
  if (!shots.length) { link.hidden = true; return; }
  screen.innerHTML = shots.map((p, i) => `<img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" class="${i ? '' : 'on'}" width="1280" height="800">`).join('');
  const imgs = [...screen.children]; let i = 0;
  const show = (k) => { imgs.forEach((im, j) => im.classList.toggle('on', j === k)); url.textContent = host(shots[k].web); link.href = shots[k].web; link.target = '_blank'; link.rel = 'noopener'; };
  show(0);
  if (!reduced && shots.length > 1) setInterval(() => { if (!document.hidden) show(i = (i + 1) % shots.length); }, 3800);
}

/* Navegación: marca la sección visible */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) document.querySelectorAll('.nav nav a').forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -45% 0px' });
document.querySelectorAll('main > section[id]').forEach((s) => io.observe(s));
$('#year').textContent = new Date().getFullYear();

load().then((list) => { render(list); browser(list); });
