import numpy as np
from typing import Dict, Any

EPS = 1e-10


def validate_square(A: np.ndarray):
    if A.shape[0] != A.shape[1]:
        raise ValueError("Introduzca un sistema de ecuaciones cuadrado")


def _replace_column(A: np.ndarray, b: np.ndarray, col: int) -> np.ndarray:
    M = A.copy()
    M[:, col] = b
    return M


def cramer(A: np.ndarray, b: np.ndarray) -> Dict[str, Any]:
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
        Ak = _replace_column(A, b, k)
        matrices[f"A{k+1}"] = Ak.tolist()
        detAk = float(np.linalg.det(Ak))
        dets.append(detAk)
        sol[k] = detAk / detA
    return {"detA": detA, "dets": dets, "matrices": matrices, "solution": sol.tolist()}


def inverse_solve(A: np.ndarray, b: np.ndarray) -> Dict[str, Any]:
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