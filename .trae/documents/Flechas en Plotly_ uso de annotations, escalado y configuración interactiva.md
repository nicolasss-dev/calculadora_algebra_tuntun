# Hallazgos en la documentación
- Plotly.js permite dibujar flechas mediante `layout.annotations` con propiedades: `showarrow`, `arrowhead`, `arrowsize`, `arrowwidth`, `arrowcolor`, y coordenadas (`x`,`y`,`ax`,`ay`).
- `layout.shapes` de tipo `line` no soporta flechas (sin arrowheads); se usa para líneas, no para flechas.
- `scatter` con `marker.symbol` admite símbolos (triángulos, etc.), pero no es un vector escalado ni tiene rotación universal; no sirve para representar flechas de magnitud/dirección arbitrarias de forma precisa.
- Para vectores 2D, la forma recomendada es: línea (shaft) + `annotation` (arrowhead) o solo `annotation` desde (`ax`,`ay`) a (`x`,`y`).

## Cambios propuestos
1) Representación de flechas
- Backend (vectors.plot_data):
  - Generar, por cada vector (u, v, resultantes), un trazo `scatter` (shaft) para hover y una `annotation` con flecha en el extremo.
  - Calcular `arrowsize` proporcional a la magnitud del vector y al rango del gráfico: `arrowsize = clamp(k * |v| / diagRange, minSize, maxSize)`.
  - Permitir personalización: `show.arrows = { color, width, head, sizeK, minSize, maxSize }` y aplicar a todas las flechas.
  - Mantener la cuadrícula y ejes tal como quedaron, para que los vectores se dibujen “por encima”.

2) Interactividad
- Frontend (app.js):
  - Mantener tooltips (hover) y zoom; configurar `layout.dragmode: 'zoom'` y `config.scrollZoom: true`, `doubleClick: 'reset'`.
  - Conservar la desactivación de selección de texto (CSS + listeners) sin afectar zoom/hover.

3) Estética y legibilidad
- Colores: vectores en negro (coherente con diseño actual) y cuadrícula en gris suave.
- Grosor de líneas de vectores configurable (`line.width`).
- Flechas con head configurable (`arrowhead` 0–8) y tamaño proporcional a magnitud.

4) API de personalización
- Enviar en `/api/vectors/calc` → `show.arrows`:
  - `color` (string), `width` (number), `head` (0..8), `sizeK` (factor), `minSize`, `maxSize`.
- Si no se envía, usar valores por defecto sensatos.

## Verificación
- Pruebas manuales: Chrome, Firefox, Safari, Edge (desktop/móvil).
  - Validar flechas visibles, bien orientadas y tamaño proporcional.
  - Confirmar hover (tooltips) y zoom/pan funcionales.
  - Confirmar que la cuadrícula no tapa vectores y que las etiquetas de ticks son legibles.
- No se esperan efectos colaterales: se mantiene JSON de respuesta y se añaden campos opcionales.

## Entregables
- Actualizar `vectors.plot_data` para generar annotations de flecha y escalarlas.
- Ajustes en `app.js` de configuración de Plotly para conservar interactividad.
- Documentación inline en funciones afectadas y breve guía de configuración `show.arrows` en comentarios del código.

¿Procedo con estos cambios y pruebas? Una vez confirmes, los implementaré y validaré en los navegadores indicados.