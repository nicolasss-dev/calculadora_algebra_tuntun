# Causa raíz
- Ecuaciones (Cramer): para N>3, la UI etiqueta matrices de reemplazo con un mapeo de caracteres `'x','y','z'` y luego caracteres no válidos (`String.fromCharCode(120+idx)`), causando etiquetas incorrectas y potencial desalineación perceptiva entre matrices y determinantes. Esto puede interpretarse como fallo de funcionalidad.
- Selección en gráfico: algunos navegadores pueden permitir selección dentro de nodos internos de Plotly (SVG/DOM) si el `user-select` no se aplica a los descendientes.

## Solución técnica
1) Ecuaciones (Cramer)
- Modificar app/static/app.js en `setupLinear()` para:
  - Iterar las matrices de reemplazo usando las claves reales del backend (`A1`, `A2`, …) en orden por índice numérico extraído, en lugar de construir etiquetas con caracteres.
  - Alinear determinantes con sus matrices según el índice extraído de la clave, evitando cualquier desfase.
  - Mantener el renderizado de la matriz A y su |A| como hasta ahora.

2) Gráfico (selección)
- Refuerzo CSS para evitar selección en todos los descendientes del contenedor del gráfico:
  - Añadir regla `#vec-plot * { user-select:none; -webkit-user-select:none; cursor: default }` a app/static/styles.css.
  - Mantener `dragmode:false`, `doubleClick:false`, `displayModeBar:false` y los listeners de bloqueo ya implementados.

## Verificación
- Pruebas manuales:
  - Cramer en 2×2, 3×3, 4×4 y 5×5: visualizar A, A1..An con determinantes correctos y solución; |A|=0 muestra mensaje y no deja residuos.
  - Inversa en 3×3 y caso singular.
  - Gráfico de vectores: verificar que no existe selección en Chrome, Firefox, Safari y Edge (desktop y móvil), sin perder clic izquierdo.
- Pruebas automáticas: ya existen tests unitarios para Cramer e Inversa; no requieren cambios.

## Impacto y compatibilidad
- Cambios solo en frontend; backend y contratos JSON permanecen iguales.
- Sin efectos secundarios: etiquetas correctas y grid/selección robustas sin alterar el comportamiento de cálculo.

¿Procedo a aplicar estas correcciones y realizar la verificación en los navegadores indicados?