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

## El fantasma (3D + IA)
- Modelo 3D hecho por código con Three.js (sin archivos de modelo): llama blanca con brillo, cara dibujada en textura.
- 18 caras × 23 animaciones × efectos × memes (67, stonks, nope...), combinables.
- Lo controla Gemini a través de la Edge Function `fantasma` de Supabase (`supabase/functions/fantasma`).
  La web le cuenta qué pasa (entra en una sección, mira un proyecto, pulsan el fantasma, escriben en el chat, se queda quieto)
  y Gemini devuelve acciones con sentido. Si la IA no responde, el fantasma usa reacciones locales.
- Secreto necesario en Supabase: `GEMINI_API_KEY` (Edge Functions → Secrets). Opcional: `GEMINI_MODEL`.
- Desde la consola: `s0k1x.run([{ meme: "67" }])`, `s0k1x.caras`, `s0k1x.animaciones`, `s0k1x.memes`.
