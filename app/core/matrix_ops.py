import numpy as np

EPS = 1e-10


def _shape(A: np.ndarray):
    return tuple(A.shape)


def add(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """Suma de matrices del mismo tamaño."""
    if _shape(A) != _shape(B):
        raise ValueError("Para sumar, las matrices deben tener el mismo tamaño")
    return A + B


def subtract(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """Resta de matrices del mismo tamaño."""
    if _shape(A) != _shape(B):
        raise ValueError("Para restar, las matrices deben tener el mismo tamaño")
    return A - B


def multiply(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """Multiplicación matricial: cols(A) == filas(B)."""
    if A.shape[1] != B.shape[0]:
        raise ValueError("Para multiplicar, las columnas de A deben igualar las filas de B")
    return A.dot(B)


def det(A: np.ndarray) -> float:
    """Determinante de matriz cuadrada."""
    if A.shape[0] != A.shape[1]:
        raise ValueError("Introduzca una matriz cuadrada para el determinante")
    return float(np.linalg.det(A))


def inv(A: np.ndarray) -> np.ndarray:
    """Inversa de matriz cuadrada si |A| != 0."""
    if A.shape[0] != A.shape[1]:
        raise ValueError("Introduzca una matriz cuadrada para la inversa")
    d = np.linalg.det(A)
    if abs(d) < EPS:
        raise ValueError("La matriz no tiene inversa: |A| = 0")
    return np.linalg.inv(A)


def transpose(A: np.ndarray) -> np.ndarray:
    """Traspuesta de una matriz."""
    return A.T