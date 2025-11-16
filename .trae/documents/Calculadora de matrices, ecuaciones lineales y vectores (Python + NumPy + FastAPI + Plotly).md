# Objetivo
Implementar una calculadora de matrices, sistemas de ecuaciones y vectores (Python + NumPy) con una UI web sin estilos visuales (solo layout) y que respete el estilo de las imágenes proporcionadas: grillas compactas con bordes finos, botones +/− alineados al borde derecho (columnas) y al borde inferior (filas), disposición limpia y minimalista.

## Arquitectura
- Backend: FastAPI + NumPy, módulos por dominio, API-first para futura migración a React.
- Frontend: HTML semántico + CSS mínimo (layout/posicionamiento) + JavaScript vanilla.
- Gráficos: Plotly.js para plano cartesiano (autoscale, flechas, paralelogramo/triángulo).

## Estructura de directorios
- app/
  - main.py (servidor y rutas API/estáticos)
  - core/
    - matrix_ops.py (suma, resta, multiplicación, det, inv, trans)
    - linear_systems.py (Cramer, método de la inversa)
    - vectors.py (polar↔cartesiano, operaciones y datos de gráfico)
  - utils/
    - parsing.py (parseo robusto: enteros, decimales y fracciones "a/b")
  - static/
    - index.html (3 pestañas)
    - styles.css (layout según estilo de las imágenes)
    - app.js (lógica UI y peticiones a API)

## UI y estilo (siguiendo las imágenes)
- Pestañas superiores: "Matrices", "Ecuaciones lineales", "Vectores".
- Matrices:
  - Dos grillas A y B tipo hoja de cálculo; celdas cuadradas con borde fino uniforme.
  - Botones +Col/−Col en el borde derecho de cada grilla; +Fila/−Fila en el borde inferior.
  - Campos aceptan fracciones "a/b"; vista previa de fracción apilada a la derecha (CSS grid simple) sin colores.
  - Selector de operación (suma, resta, multiplicación); acciones unarias (det, inv, traspuesta) con selector de matriz objetivo (A/B).
  - Tercera grilla para resultado; mensajes de error debajo.
- Ecuaciones lineales:
  - Grilla cuadrada A; botón “+ tamaño” para N→N+1; vector b en columna separada; etiquetas X1..Xn.
  - Botones: “Resolver por Cramer” y “Resolver por Inversa”.
  - Muestra A, Ax, Ay, ... con sus determinantes, |A| y solución en disposición apilada minimalista.
  - Mensajes explícitos cuando |A|≈0.
- Vectores:
  - Selector de modo: Polar (magnitud+ángulo en grados respecto a +x) o Cartesiano (x,y).
  - Muestra componentes rectangulares de ambos vectores y del resultante.
  - Plano cartesiano con autoscale; flechas negras/grises; toggles: “Ver paralelogramo (suma)”, “Ver triángulo (resta)”.
  - Muestra producto punto y cruz (2D: cruz = escalar en z) y el proceso de cálculo.

## Endpoints API (JSON)
- POST /api/matrix/operate {A, B?, op, target?} → {resultMatrix?, scalar?, error?}
- POST /api/linear/cramer {A, b} → {detA, dets[], matrices{Ax,...}, solution?, error?}
- POST /api/linear/inverse {A, b} → {detA, Ainv?, solution?, error?}
- POST /api/vectors/calc {inputMode, v1, v2, show} → {v1, v2, sum, diff, dot, cross, plotSpec}

## Lógica y validaciones
- parsing.parse_number: "a/b" con signo y espacios; errores localizados en ES.
- Matrices: validación de dimensiones; cuadrada para det/inv; tolerancia eps=1e-10.
- Cramer: exige cuadrada; si |A|<eps → mensaje de no solvencia.
- Inversa: si |A|<eps → mensaje: “no tiene solución |A| = 0 y A no tiene inversa”.
- Vectores: valida grados en [−360, 360], magnitudes ≥0, componentes numéricas.

## Precisión y presentación
- float64; redondeo presentacional a 6 decimales; valor bruto en JSON.
- Criterio de cero: |x|<1e-10; mensajes consistentes.

## Escalabilidad y calidad
- API-first; UI desacoplada → fácil migrar a React.
- Docstrings en cada función y archivo; código limpio y modular.
- plotSpec independiente de Plotly para permitir reemplazo futuro.

## Pruebas
- Unit tests para parsing, matrix_ops, linear_systems, vectors (2x2, 3x3, casos singulares y tamaños no compatibles).

## Entregables
- Código backend FastAPI + módulos documentados.
- Frontend con 3 pestañas, controles +/− en bordes y gráficos.
- Mensajes en español y soporte de fracciones en inputs.

Si confirmas, procedo a implementar exactamente con ese estilo y estructura.