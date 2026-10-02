# Gynoid — static website

Landing page estática para **Gynoid / AI Court Ultimate™**.

## Estructura

- `index.html` — contenido y estructura.
- `css/styles.css` — diseño responsive, animaciones y paleta visual.
- `js/main.js` — menú móvil, scroll, animaciones, lightbox y configuración de contacto.
- `js/config.js` — email y redes sociales.
- `assets/images/` — imágenes optimizadas en WebP.
- `favicon.svg` — favicon local.

## Verla en local

La opción más simple es abrir `index.html` en el navegador.

Para un entorno local más parecido a producción:

```bash
python3 -m http.server 8000
```

Después abre `http://localhost:8000`.

## Configurar contacto

Edita `js/config.js`:

```js
window.GYNOID_CONFIG = {
  contactEmail: "tu-email@dominio.com",
  instagram: "https://...",
  linkedin: "https://...",
  whatsapp: "https://wa.me/..."
};
```

Los enlaces sociales vacíos se ocultan automáticamente.

## GitHub Pages

1. Sube todo el contenido de esta carpeta a la raíz del repositorio.
2. En GitHub: **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Selecciona `main` y `/ (root)`.
5. Guarda.

No necesita npm, compilación, framework ni backend.

## Antes de publicar

Conviene confirmar con Gynoid qué afirmaciones comerciales, partners, certificaciones, cifras técnicas y funcionalidades están disponibles actualmente. La versión inicial evita deliberadamente la mayoría de claims absolutos del material conceptual.
