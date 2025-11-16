# Guía del Proyecto: Calculadora de Matrices, Ecuaciones y Vectores

## Descripción General
- API y frontend para operar con matrices, resolver sistemas lineales y trabajar con vectores 2D.
- Backend en `FastAPI` con validación de entradas usando `Pydantic` y cálculos con `NumPy`.
- Frontend estático (HTML/CSS/JS) con graficación de vectores mediante `Plotly`.

## Estructura de Archivos
```
app/
  main.py                # Endpoints FastAPI y montaje de estáticos
  core/
    matrix_ops.py        # Operaciones básicas de matrices (suma, resta, mul, det, inv, trans)
    linear_systems.py    # Resolución de Ax=b (Cramer e inversa)
    vectors.py           # Utilidades de vectores y datos para graficación
  utils/
    parsing.py           # Parseo de entradas de texto a números y arrays
  static/
    index.html           # Interfaz de usuario
    styles.css           # Estilos
    app.js               # Lógica de UI, requests y render
tests/
  conftest.py            # Configuración de pruebas
  test_*.py              # Casos de prueba (matrices, sistemas, vectores, parsing)
requirements.txt         # Dependencias de Python
docs/
  guia_proyecto.md       # Esta guía
```

## Función de Cada Archivo
- `app/main.py`: define el objeto `FastAPI`, los modelos Pydantic y los endpoints:
  - `POST /api/matrix/operate`: operaciones matriciales.
  - `POST /api/linear/cramer`: Regla de Cramer.
  - `POST /api/linear/inverse`: método de la inversa.
  - `POST /api/vectors/calc`: cálculos y especificaciones de graficación.
- `app/core/matrix_ops.py`: implementa operaciones con `NumPy` (`dot`, `linalg.det`, `linalg.inv`, `A.T`).
- `app/core/linear_systems.py`: lógica para Cramer e inversa con validaciones y retornos detallados.
- `app/core/vectors.py`: conversión polar↔cartesiano, suma/resta/punto/cruz y layout Plotly.
- `app/utils/parsing.py`: convierte textos a números/arrays; acepta fracciones `a/b`.
- `app/static/*`: recursos de UI. `app.js` realiza `fetch` a la API y renderiza resultados.
- `tests/*`: cubre funciones core y parsing.

## Diagrama de Flujo de Componentes
```
[UI (index.html + app.js)]
        |
        v (fetch JSON)
[FastAPI main.py]
  |-- /api/matrix/operate --> core/matrix_ops.py
  |-- /api/linear/cramer --> core/linear_systems.py (Cramer)
  |-- /api/linear/inverse --> core/linear_systems.py (Inversa)
  |-- /api/vectors/calc --> core/vectors.py
        |
        v (JSON)
[UI render/Plotly]
```

## Guía de Modificación
- Cambiar una operación de matrices:
  - Editar `app/core/matrix_ops.py` (p. ej., reglas de validación o nuevas operaciones).
  - Endpoint ya enruta según `op`; no requiere cambios en `main.py` salvo nuevas operaciones.
- Ajustar solución de sistemas:
  - `app/core/linear_systems.py` (criterios de singularidad `EPS`, formato de salida, nuevas técnicas).
- Modificar parseo de entradas:
  - `app/utils/parsing.py` (formatos aceptados, mensajes de error).
- Actualizar visualización de vectores:
  - `app/core/vectors.py` (rejilla, anotaciones, paralelogramo/triángulo).
  - `app/static/app.js` para controles y comportamiento en UI.

### Dependencias entre Módulos
- `main.py` importa `parsing.py` y llama a funciones de `core/*`.
- `core/*` no depende del frontend; son funciones puras basadas en `NumPy`.
- `app.js` consume los endpoints definidos en `main.py`.

### Configuraciones Sensibles
- `EPS` en `matrix_ops.py` y `linear_systems.py`: umbral para tratar determinantes como cero.
- Montaje de estáticos: `app.mount('/static', 'app/static')` en `main.py`.
- Paso de rejilla y densidad en `vectors.py` (`mainStepX/Y`, `minorFactor`).

## Convenciones de Código
- Python:
  - Tipado estático con `typing` y docstrings detallados en español.
  - Uso de `NumPy` para operaciones numéricas.
  - Errores de validación como `ValueError` y propagación `HTTPException 400` en endpoints.
- Frontend:
  - Comentarios explicativos en funciones clave.
  - `fetch` con `Content-Type: application/json` y manejo de errores.
  - Graficación con `Plotly.newPlot` y limpieza previa (`Plotly.purge`).

## Requisitos del Entorno
- Python 3.10+ recomendado.
- Dependencias (`requirements.txt`):
  - `fastapi==0.115.0`
  - `uvicorn==0.30.6`
  - `numpy==2.1.2`
  - `pytest==8.3.3`
- Frontend: acceso a CDN de Plotly.

## Ejecución y Pruebas
- Ejecutar servidor de desarrollo:
  - `uvicorn app.main:app --reload`
  - Abrir `http://127.0.0.1:8000/` en el navegador.
- Ejecutar pruebas:
  - `pytest -q`

## Ejemplos Prácticos
- Suma de matrices (UI): ingresar A y B, seleccionar “Suma A + B” y presionar “Calcular”.
- Determinante: elegir “Operación unaria → Determinante” y la matriz objetivo.
- Cramer: configurar sistema en “Ecuaciones lineales” y presionar “Resolver por Cramer”.
- Vectores: seleccionar modo “Magnitud + Ángulo”, ingresar `u` y `v`, habilitar “Ver paralelogramo” y “Calcular y graficar”.

## Mantenimiento y Actualización
- Al agregar nuevas operaciones/endpoints, mantener docstrings y comentarios en español.
- Evitar cambios que expongan datos sensibles en logs o respuestas.
- Revisar densidad de rejilla en vectores para evitar sobrecarga visual.