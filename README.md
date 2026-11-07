# S0k1x-WEB

Portfolio personal de **s0k1x**: minimalista, con un mini-yo animado (mini-s0k1x) que te guía por la web.

## Qué hace mini-s0k1x
- Te sigue con la mirada y parpadea.
- Saluda, salta, gira, baila, se hace un selfie y cuenta chistes al hacer clic en él.
- Comenta los proyectos al pasar el ratón por encima y cada sección al llegar a ella.
- Se queda dormido si no haces nada durante un rato.
- Al bajar se queda en la esquina como acompañante.
- Easter egg: escribe `s0k1x` o el código Konami.

## Editar contenido
Todo está en el objeto `CONFIG` al principio de `main.js`: email, textos, stats, stack, redes y proyectos destacados.
El resto de proyectos se cargan solos desde la API pública de GitHub.

## Ejecutar en local
```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Publicar en GitHub Pages
Settings → Pages → Source: *Deploy from a branch* → rama `main`, carpeta `/ (root)`.
