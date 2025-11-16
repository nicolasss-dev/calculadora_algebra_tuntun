"""Aplicación FastAPI para cálculo de matrices, resolución de sistemas lineales y operaciones con vectores.

Esta API sirve una interfaz web estática y expone endpoints para:
- Operaciones matriciales (suma, resta, multiplicación, determinante, inversa, traspuesta)
- Resolución de sistemas de ecuaciones lineales (Regla de Cramer y método de la inversa)
- Cálculos y visualización de vectores en 2D

Referencias:
- FastAPI: https://fastapi.tiangolo.com/
- Pydantic (modelos de validación): https://docs.pydantic.dev/
- NumPy (álgebra lineal): https://numpy.org/doc/stable/
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any
import numpy as np

from .utils.parsing import parse_matrix, parse_vector
from .core import matrix_ops, linear_systems, vectors


class MatrixOperateRequest(BaseModel):
    """Modelo de entrada para operaciones de matrices.

    Propósito: encapsular las matrices `A` y `B` en formato de texto y la operación a realizar.

    Atributos:
    - `A`: matriz A como lista de listas de strings (acepta enteros, decimales y fracciones "a/b").
    - `B`: matriz B opcional en el mismo formato que A.
    - `op`: operación a ejecutar: `add` (suma), `sub` (resta), `mul` (multiplicación), `det` (determinante), `inv` (inversa), `trans` (traspuesta).
    - `target`: objetivo para operaciones unarias (`A` o `B`). Si no se indica, se usa `A`.

    Ejemplo:
    >>> MatrixOperateRequest(A=[["1","2"],["3","4"]], B=[["5","6"],["7","8"]], op="add")
    """
    A: List[List[str]]
    B: Optional[List[List[str]]] = None
    op: Literal["add", "sub", "mul", "det", "inv", "trans"]
    target: Optional[Literal["A", "B"]] = None


class LinearCramerRequest(BaseModel):
    """Entrada para resolver un sistema lineal por la Regla de Cramer.

    - `A`: matriz de coeficientes como grilla de strings.
    - `b`: vector independiente como lista de strings.
    """
    A: List[List[str]]
    b: List[str]


class LinearInverseRequest(BaseModel):
    """Entrada para resolver un sistema lineal por método de la inversa.

    - `A`: matriz cuadrada de coeficientes.
    - `b`: vector independiente.
    """
    A: List[List[str]]
    b: List[str]


class VectorsRequest(BaseModel):
    """Entrada para cálculos de vectores 2D y especificación de visualización.

    - `inputMode`: `polar` para magnitud+ángulo (grados) o `cart` para componentes x,y.
    - `v1`, `v2`: datos del vector u y v. En modo `polar`: `{mag, deg}`; en `cart`: `{x, y}`.
    - `show`: configuración de visualización (por ejemplo, `parallelogram`, `subtraction`, y opciones de rejilla).
    """
    inputMode: Literal["polar", "cart"]
    v1: Dict[str, Any]
    v2: Dict[str, Any]
    show: Dict[str, Any]


app = FastAPI(title="Calculadora de Matrices, Ecuaciones y Vectores")
# Monta archivos estáticos para la interfaz (HTML/JS/CSS)
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/", response_class=HTMLResponse)
def index():
    """Sirve la página principal HTML.

    Retorna: contenido HTML de `app/static/index.html`.
    Nota: se utiliza lectura simple de archivo; FastAPI lo entrega como `HTMLResponse`.
    """
    # Carga el HTML de la interfaz
    with open("app/static/index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.post("/api/matrix/operate")
def matrix_operate(payload: MatrixOperateRequest):
    """Ejecuta operaciones matriciales sobre A y B.

    Parámetros:
    - `payload`: `MatrixOperateRequest` con matrices como texto y el tipo de operación.

    Flujo:
    1. Convierte las entradas de texto a `np.ndarray(float)` con `parse_matrix`.
    2. Selecciona la operación:
       - Binaria: `add`, `sub`, `mul` usando `np.ndarray` y `np.dot`.
       - Unaria: `det` (usa `np.linalg.det`), `inv` (usa `np.linalg.inv`), `trans` (traspuesta `A.T`).
    3. Devuelve matriz resultado como listas (para JSON) o un escalar.

    Retornos:
    - `{ "resultMatrix": List[List[float]] }` para operaciones con matriz de salida.
    - `{ "scalar": float }` para `det`.

    Errores:
    - 400 si los tamaños son inválidos o la matriz no es cuadrada/invertible.
    """
    try:
        # Parseo y validación de entradas desde strings a números (incluye fracciones "a/b")
        A = parse_matrix(payload.A)
        B = parse_matrix(payload.B) if payload.B is not None else None
    except ValueError as e:
        # Propaga errores de validación como HTTP 400
        raise HTTPException(status_code=400, detail=str(e))

    op = payload.op
    try:
        # Operaciones binarias requieren B
        if op in ("add", "sub", "mul"):
            if B is None:
                raise HTTPException(status_code=400, detail="Debe proporcionar la matriz B para esta operación")
            if op == "add":
                R = matrix_ops.add(A, B)
            elif op == "sub":
                R = matrix_ops.subtract(A, B)
            else:
                R = matrix_ops.multiply(A, B)  # usa `A.dot(B)` internamente
            return {"resultMatrix": R.tolist()}
        # Operaciones unarias sobre A o B
        elif op in ("det", "inv", "trans"):
            target = payload.target or "A"
            M = A if target == "A" else (B if B is not None else None)
            if M is None:
                raise HTTPException(status_code=400, detail="Matriz objetivo no proporcionada")
            if op == "det":
                d = matrix_ops.det(M)  # usa `np.linalg.det`
                return {"scalar": float(d)}
            if op == "inv":
                inv = matrix_ops.inv(M)  # valida |A| != 0 y usa `np.linalg.inv`
                return {"resultMatrix": inv.tolist()}
            tr = matrix_ops.transpose(M)  # acceso a traspuesta con `A.T`
            return {"resultMatrix": tr.tolist()}
        else:
            raise HTTPException(status_code=400, detail="Operación no válida")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/linear/cramer")
def linear_cramer(payload: LinearCramerRequest):
    """Resuelve un sistema lineal por la Regla de Cramer.

    - Convierte `A` y `b` con los parsers.
    - Calcula `|A|` y los determinantes `|A_k|` reemplazando columnas por `b`.
    - Si `|A| == 0`, reporta que no hay solución única.

    Retorna un diccionario con `detA`, `dets`, `matrices` y `solution`.
    Referencia: https://es.wikipedia.org/wiki/Regla_de_Cramer
    """
    try:
        A = parse_matrix(payload.A)
        b = parse_vector(payload.b)
        result = linear_systems.cramer(A, b)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/linear/inverse")
def linear_inverse(payload: LinearInverseRequest):
    """Resuelve un sistema lineal usando la matriz inversa.

    Flujo:
    - Verifica que `A` sea cuadrada y `|A| != 0`.
    - Calcula `A^{-1}` con `np.linalg.inv` y la solución `x = A^{-1} b` (multiplicación matricial `dot`).

    Retorna `detA`, opcionalmente `Ainv`, y `solution`.
    """
    try:
        A = parse_matrix(payload.A)
        b = parse_vector(payload.b)
        result = linear_systems.inverse_solve(A, b)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/vectors/calc")
def vectors_calc(payload: VectorsRequest):
    """Calcula operaciones básicas de vectores 2D y datos para graficación.

    Entrada:
    - `inputMode`: `polar` (magnitud y ángulo en grados) o `cart` (componentes x,y).
    - `v1`, `v2`: datos de los vectores.
    - `show`: configuración de visualización para la rejilla y figuras.

    Cálculos:
    - Suma `u+v`, resta `u−v`, producto punto `u·v`, producto cruz (componente z) `u×v`.
    - Conversión entre componentes y forma polar.
    - Especificación de trazado para Plotly.

    Retorna un diccionario con valores numéricos y `plotSpec`.
    """
    try:
        mode = payload.inputMode
        show = payload.show or {}

        # Normaliza entradas según modo polar o cartesiano
        if mode == "polar":
            ux, uy = vectors.to_components(float(payload.v1.get("mag", 0)), float(payload.v1.get("deg", 0)))
            vx, vy = vectors.to_components(float(payload.v2.get("mag", 0)), float(payload.v2.get("deg", 0)))
        else:
            ux = float(payload.v1.get("x", 0))
            uy = float(payload.v1.get("y", 0))
            vx = float(payload.v2.get("x", 0))
            vy = float(payload.v2.get("y", 0))

        # Construye arrays NumPy para operar de forma vectorizada
        u = np.array([ux, uy], dtype=float)
        v = np.array([vx, vy], dtype=float)

        # Operaciones básicas
        s = vectors.add(u, v)
        d = vectors.subtract(u, v)
        dp = vectors.dot(u, v)
        cp = vectors.cross(u, v)

        # Conversión a magnitud/ángulo para presentar
        u_md = vectors.from_components(u[0], u[1])
        v_md = vectors.from_components(v[0], v[1])

        # Datos de trazado para Plotly
        plot = vectors.plot_data(u, v, show)

        return {
            "v1": {"xy": [u[0], u[1]], "mag": u_md[0], "deg": u_md[1]},
            "v2": {"xy": [v[0], v[1]], "mag": v_md[0], "deg": v_md[1]},
            "sum": [s[0], s[1]],
            "diff": [d[0], d[1]],
            "dot": float(dp),
            "cross": float(cp),
            "plotSpec": plot,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))