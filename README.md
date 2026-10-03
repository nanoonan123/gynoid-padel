# Gynoid Web V9

Versión con configurador 3D real basado en Three.js.

## Qué cambia respecto a V8

La V8 simulaba una pista 3D usando elementos HTML/CSS transformados. En V9 el configurador usa WebGL mediante Three.js y construye una pista de pádel con geometría 3D real.

Cada selector controla un grupo 3D independiente:

- Techo retráctil: estructura y paneles superiores.
- Gynoid AI: cámaras, conos de visión y HUD de analítica.
- Media LED: paneles digitales luminosos en los cerramientos.
- Smart Access: tótem, lector y puerta de acceso.
- Solar Glass: paneles fotovoltaicos visibles sobre la pista.
- Premium Comfort: bancos, lounge y minibar.
- Club / Resort / Urban: cambia el entorno tridimensional.
- Day / Night: cambia iluminación, fondo y exposición.

El visor permite:

- Arrastrar para rotar.
- Rueda del ratón para zoom.
- Pinch en móvil para zoom.
- Doble clic o botón para restablecer la vista.

## Three.js

El motor 3D se carga como módulo ES desde jsDelivr:

`https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js`

Por tanto, para verlo en local se recomienda usar VS Code Live Server o:

```bash
python -m http.server 8000
```

Y abrir `http://localhost:8000`.

Al publicarlo en GitHub Pages funcionará directamente.

## Contacto

Edita `js/config.js` para cambiar email y WhatsApp.
