# Objetivo
Corregir la interfaz y la lógica solicitada: 1) botón “-Fila” que no actúa, 2) solapamiento de botones/diseño responsivo, 3) fallos en ecuaciones lineales (cálculo, validaciones y visualización), 4) añadir pruebas unitarias y 5) verificar en 3 navegadores y móvil/escritorio.

## Diagnóstico rápido
- Botón “-Fila” (B) no actúa: la lógica de evento existe en app/static/app.js:153, pero el CSS posiciona controles con `position:absolute` (app/static/styles.css:14–15), que puede provocar solapamientos y zonas no clicables.
- Solapamiento visual: `.controls.right` y `.controls.bottom` salen del flujo (absolute) e invaden la tercera columna `.ops` (app/static/styles.css:7,14–16).
- Ecuaciones: la UI muestra determinantes pero no renderiza matrices A, Ax, Ay, …, ni limpia estados de forma robusta; es fácil que el usuario perciba “fallos” (app/static/app.js:185–225). Backend de Cramer/inversa está correcto.

## Plan de cambios
### 1) Botón “-Fila” y controles por matriz
- Mantener la lógica actual (app/static/app.js:145–153) que llama a `resizeMatrix()` y `renderAll()`.
- Quitar posicionamiento absoluto de controles y reorganizar el bloque de matriz con CSS grid-areas, sin tocar HTML:
  - `.matrix-block { display:grid; grid-template-columns:auto auto; grid-template-rows:auto auto; grid-template-areas:"title title" "matrix right" "bottom bottom"; gap:6px 8px }`
  - `.matrix-title{ grid-area:title }`, `.matrix{ grid-area:matrix }`, `.controls.right{ grid-area:right; position:static }`, `.controls.bottom{ grid-area:bottom; position:static }`.
- Añadir espaciado mínimo entre botones y `cursor:pointer` para mejorar UX.
- Verificar que “-Fila” de B reduce `rows` hasta un mínimo de 1 y re-renderiza correctamente con múltiples filas.

### 2) Corregir solapamientos y responsividad
- Ajustar layout principal:
  - `.grid-row { grid-template-columns: 1fr 1fr minmax(220px, 260px) }`.
  - `.ops { min-width:220px }`.
- Breakpoints:
  - `@media (max-width: 900px)`: `.grid-row, .eq-row { grid-template-columns:1fr }` y los bloques se apilan.
- Separación visual:
  - Añadir márgenes/padding mínimos a botones dentro de `.ops` y a los controles de matriz para no colisionar.
- Revisar capas: si hiciera falta, `z-index` > 0 en `.ops` y controles, aunque al eliminar `absolute` no debería ser necesario.

### 3) Ecuaciones lineales
- Validaciones: mantener mensajes backend; en UI, limpiar estados antes de pintar nueva salida (limpiar `#lin-ax`, `#lin-solution`, `#lin-error`, `#lin-det`).
- Visualización de matrices A, Ax, Ay, …:
  - Renderizar grillas compactas dentro de `#lin-ax` mostrando el contenido de cada matriz (no solo el nombre), con un título `Ax`/`Ay`/… y su determinante.
  - Mostrar `A⁻¹` en método de la inversa cuando aplique.
- Comportamiento con |A|≈0: mostrar el mensaje y no dejar resultados anteriores visibles.
- Opcional: Etiquetas `X1..Xn` a la izquierda de `#linB` o como encabezados para claridad.

### 4) Pruebas unitarias
- Añadir `pytest` a dependencias.
- tests/test_parsing.py: enteros/decimales/fracciones válidos e inválidos; matrices mal formadas.
- tests/test_matrix_ops.py: suma/resta (tamaños ok y error), multiplicación (compatible y no compatible), determinante/inversa/traspuesta, singularidad.
- tests/test_linear_systems.py: Cramer (2x2, 3x3, |A|=0), inverse_solve (|A|=0 y ≠0), tamaños de b.
- tests/test_vectors.py: polar↔cartesiano, suma/resta, punto/cruz, autoscale básico.

### 5) Verificación manual multi-navegador
- Chrome, Firefox, Safari (incl. móvil):
  - Matrices: añadir/quitar filas/columnas; entradas con fracciones; operaciones binaria/unaria; verificar no hay solapamientos y que el scroll/zoom móvil funciona.
  - Ecuaciones: crecer N, resolver por Cramer e Inversa; casos |A|=0 y no cuadrada.
  - Vectores: polar y cartesiano, toggles de paralelogramo/triángulo, autoscale.
- Comprobar accesibilidad básica: foco de inputs y navegación por teclado.

## Archivos a modificar
- app/static/styles.css: nuevas reglas de grid-areas, media queries, espaciados; quitar `position:absolute` en controles.
- app/static/app.js: limpieza robusta de estados al render, render de matrices Ax/Ay/… y A⁻¹; mantener listeners existentes.
- requirements.txt: añadir pytest para pruebas.
- tests/*.py: incorporar las pruebas descritas.

## Entregables
- UI sin solapamientos y con controles clicables en escritorio/móvil.
- Pestaña de ecuaciones con matrices y determinantes visibles, validaciones y mensajes claros.
- Suite de tests pasando en local.
- Notas de verificación manual en los tres navegadores.

¿Procedo con estos cambios? Una vez confirmes, aplicaré las modificaciones y dejaré todo probado y ejecutándose.