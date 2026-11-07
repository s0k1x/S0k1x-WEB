# S0k1x-WEB

Portfolio de **s0k1x**: oscuro, minimalista y con mi avatar en línea fina.

## Secciones (una por pantalla)
1. **Portada**: titular, avatar que te sigue con los ojos y saluda al pulsarlo, y una terminal que escribe sola.
2. **Proyectos**: una ventana tipo app con todos mis repos públicos (se cargan solos de GitHub). Cada repo tiene su propia portada generada a partir de su nombre, su descripción (o la primera frase de su README) y un comentario de mi avatar.
3. **s0k1x-skill**: mi kit para Claude Code, con una terminal que recorre las skills.
4. **Herramientas**: diagrama con los logos reales de lo que uso.
5. **Sobre mí** y **contacto**.

## Editar
Todo en `CONFIG` al principio de `main.js`: email, descripciones y frases por repo, repos ocultos.
El email también aparece en `index.html` (botones de contacto).

Iconos: `assets/icons/` (SVG Logos CC0, Simple Icons CC0, VSCode Icons MIT; créditos en `icons-credits.json`).

## Local
```bash
python3 -m http.server 8000
```
