# S0k1x-WEB

Portfolio personal de **s0k1x**. Minimalista por fuera; cada proyecto es un **mundo** propio por dentro.

## Cómo funciona
- **Home**: hero, lista de mundos (un proyecto por fila, con vista previa al pasar el ratón), sobre mí y contacto.
- **Mundos**: al entrar en un proyecto se abre un portal a su mundo (Órbita, Bosque, Terminal, Océano, Neón, Desierto o Nieve). Cada uno tiene paisaje animado, colores, accesorio para el personaje y frases propias, y muestra el README del repo.
- **mini-s0k1x**: personaje SVG que camina, te sigue con la mirada, saluda, salta, gira, baila, cuenta chistes y se duerme si no haces nada.
- Navega entre mundos con ← → y sal con Esc. Easter egg: escribe `s0k1x`.

## Editar
Todo en `CONFIG` al principio de `main.js`: email, textos, datos, redes, proyectos destacados (con su mundo) y repos ocultos.
Los repos públicos se cargan solos desde la API de GitHub y reciben un mundo automáticamente.

## Local
```bash
python3 -m http.server 8000
```

## GitHub Pages
Settings → Pages → Deploy from a branch → `main` / root.
