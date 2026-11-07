# Imágenes de los proyectos

Crea una carpeta por proyecto y mete dentro sus capturas (PNG, JPG o WebP; mejor apaisadas, unos 1600×640):

```
assets/proyectos/aura-x/1.png
assets/proyectos/aura-x/2.png
```

Luego añádelas en `projects.json`, en el campo `imagenes` de ese proyecto:

```json
"imagenes": ["assets/proyectos/aura-x/1.png", "assets/proyectos/aura-x/2.png"]
```

Si un proyecto no tiene imágenes, la web genera una portada propia a partir de su nombre.
