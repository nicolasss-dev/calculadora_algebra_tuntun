"""Resolución de sistemas lineales: Regla de Cramer y método de la inversa.

Utiliza funciones de NumPy para álgebra lineal:
- `np.linalg.det(A)`: determinante.
- `np.linalg.inv(A)`: inversa.
- `A.dot(b)`: multiplicación matriz-vector.
"""

import numpy as np
from typing import Dict, Any

# Umbral para tratar determinantes muy pequeños como cero (evita inestabilidad)
EPS = 1e-10


def validate_square(A: np.ndarray):
    """Verifica que `A` sea una matriz cuadrada.

    Lanza `ValueError` si `A` no cumple.
    """
    if A.shape[0] != A.shape[1]:
        raise ValueError("Introduzca un sistema de ecuaciones cuadrado")


def _replace_column(A: np.ndarray, b: np.ndarray, col: int) -> np.ndarray:
    """Devuelve una copia de `A` con la columna `col` reemplazada por el vector `b`.

    Parámetros:
    - `A`: matriz `(n, n)`.
    - `b`: vector `(n,)`.
    - `col`: índice de columna a reemplazar.
    """
    M = A.copy()
    M[:, col] = b
    return M


def cramer(A: np.ndarray, b: np.ndarray) -> Dict[str, Any]:
    """Resuelve `Ax = b` por Regla de Cramer.

    Pasos:
    1. Valida que `A` sea cuadrada y que `b` tenga tamaño compatible.
    2. Calcula `|A|`. Si `|A| ≈ 0`, retorna error (no hay solución única).
    3. Para cada columna `k`, crea `A_k` reemplazando la columna por `b`, calcula `|A_k|` y `x_k = |A_k| / |A|`.

    Retorna: diccionario con `detA`, lista `dets`, dict `matrices` (A_k en listas) y `solution`.
    """
    validate_square(A)
    n = A.shape[0]
    if b.shape[0] != n:
        raise ValueError("El tamaño de b debe coincidir con A")
    detA = float(np.linalg.det(A))
    if abs(detA) < EPS:
        return {"error": "El sistema de ecuaciones no tiene solución |A| = 0", "detA": detA}
    dets = []
    matrices = {}
    sol = np.zeros((n,), dtype=float)
    for k in range(n):
        # Construye A_k y su determinante
        Ak = _replace_column(A, b, k)
        matrices[f"A{k+1}"] = Ak.tolist()
        detAk = float(np.linalg.det(Ak))
        dets.append(detAk)
        sol[k] = detAk / detA
    return {"detA": detA, "dets": dets, "matrices": matrices, "solution": sol.tolist()}


def inverse_solve(A: np.ndarray, b: np.ndarray) -> Dict[str, Any]:
    """Resuelve `Ax = b` usando `A^{-1}`.

    Pasos:
    1. Valida cuadratura y compatibilidad de dimensiones.
    2. Calcula `detA` y verifica que no sea cero (umbral `EPS`).
    3. Calcula la inversa con `np.linalg.inv(A)` y la solución `x = A^{-1} b` usando `dot`.

    Retorna: `detA`, `Ainv` (como listas) y `solution`.
    """
    validate_square(A)
    n = A.shape[0]
    if b.shape[0] != n:
        raise ValueError("El tamaño de b debe coincidir con A")
    detA = float(np.linalg.det(A))
    if abs(detA) < EPS:
        return {"error": "El sistema de ecuaciones no tiene solución |A| = 0 y la matriz A no tiene inversa", "detA": detA}
    Ainv = np.linalg.inv(A)
    x = Ainv.dot(b)
    return {"detA": detA, "Ainv": Ainv.tolist(), "solution": x.tolist()}