# S0k1x-WEB

Portfolio de **s0k1x**: oscuro, minimalista y con mi avatar en línea fina.

## Secciones (una por pantalla)
1. **Portada**: titular, avatar que te sigue con los ojos y saluda al pulsarlo, y una terminal que escribe sola.
2. **Proyectos**: una ventana tipo app con todos mis repos públicos (se cargan solos de GitHub). Cada repo tiene su propia portada generada a partir de su nombre, su descripción (o la primera frase de su README) y un comentario de mi avatar.
3. **s0k1x-skill**: mi kit para Claude Code, con una terminal que recorre las skills.
4. **Herramientas**: diagrama con los logos reales de lo que uso.
5. **Sobre mí** y **contacto**.

## Elegir qué proyectos salen
Todo en **`projects.json`**: el orden de la lista es el orden en la web.
- `mostrar: false` oculta un proyecto.
- `privado: true` + `web`: proyecto privado; se ve con su botón a la web, sin enseñar el código.
- `imagenes`: capturas o fotos (ver `assets/proyectos/LEEME.md`). Sin imágenes se usa una portada generada.
- `enlaces`: referencias extra (Figma, vídeo, artículo…).
- `mostrarOtrosPublicos: true` añade al final los repos públicos que no estén en la lista.

El email está en `main.js` (`CONFIG.email`) y en `index.html` (botones de contacto).

## Controlar el avatar desde código (para conectar una IA)
La web expone `window.s0k1x`:

| Llamada | Qué hace |
|---|---|
| `s0k1x.decir('texto', ms)` | bocadillo encima del avatar |
| `s0k1x.terminal('cmd', 'salida')` | escribe en la terminal del avatar |
| `s0k1x.cara('smile' \| 'happy' \| 'o' \| 'flat')` | cambia la expresión |
| `s0k1x.saludar()` | saluda con la mano |
| `s0k1x.mirar(x, y)` / `s0k1x.mirarCursor()` | dirige la mirada |
| `s0k1x.meme(urlImagen, 'texto', ms)` | enseña una imagen (un meme) sobre el avatar |
| `s0k1x.proyecto('Aura-X')` / `s0k1x.irA('kit')` | abre un proyecto / va a una sección |
| `s0k1x.proyectos()` | lista de proyectos (para dar contexto a la IA) |
| `s0k1x.on('click' \| 'proyecto', fn)` | eventos para que la IA reaccione |

**La clave de Gemini no puede ir en esta web** (cualquiera la vería en el código). Hace falta un servidor
pequeño en medio (por ejemplo un Cloudflare Worker) que guarde la clave, hable con Gemini y devuelva
acciones como `{ "decir": "...", "cara": "happy", "meme": "..." }`, que la web ejecuta con esta API.

Iconos: `assets/icons/` (SVG Logos CC0, Simple Icons CC0, VSCode Icons MIT; créditos en `icons-credits.json`).

## Local
```bash
python3 -m http.server 8000
```
