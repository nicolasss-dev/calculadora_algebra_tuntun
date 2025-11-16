"""Operaciones básicas de matrices usando NumPy.

Incluye suma, resta, multiplicación, determinante, inversa y traspuesta.
Se utilizan las siguientes funciones de NumPy:
- `ndarray.dot(B)`: multiplicación matricial.
- `np.linalg.det(A)`: determinante de una matriz cuadrada.
- `np.linalg.inv(A)`: inversa de una matriz cuadrada no singular.
- `A.T`: traspuesta del arreglo.
"""

import numpy as np

# Umbral numérico para considerar un determinante como cero (estabilidad)
EPS = 1e-10


def _shape(A: np.ndarray):
    """Retorna la forma `(filas, columnas)` de la matriz `A`.

    Parámetros:
    - `A`: matriz NumPy.

    Retorna: `tuple[int,int]` con la forma.
    """
    return tuple(A.shape)


def add(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """Suma elemento a elemento de matrices del mismo tamaño.

    Parámetros:
    - `A`, `B`: matrices con igual forma.

    Retorna: `A + B` como `np.ndarray`.

    Ejemplo:
    >>> add(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]))
    array([[ 6,  8],
           [10, 12]])
    """
    if _shape(A) != _shape(B):
        raise ValueError("Para sumar, las matrices deben tener el mismo tamaño")
    return A + B


def subtract(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """Resta elemento a elemento de matrices del mismo tamaño.

    Parámetros:
    - `A`, `B`: matrices con igual forma.

    Retorna: `A - B` como `np.ndarray`.
    """
    if _shape(A) != _shape(B):
        raise ValueError("Para restar, las matrices deben tener el mismo tamaño")
    return A - B


def multiply(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """Multiplicación matricial clásica `A × B`.

    Requisito: `cols(A) == filas(B)`.

    Implementación: utiliza `A.dot(B)` de NumPy (producto matricial).

    Parámetros:
    - `A`: matriz de tamaño `(m, n)`.
    - `B`: matriz de tamaño `(n, p)`.

    Retorna: matriz `(m, p)`.
    """
    if A.shape[1] != B.shape[0]:
        raise ValueError("Para multiplicar, las columnas de A deben igualar las filas de B")
    return A.dot(B)


def det(A: np.ndarray) -> float:
    """Calcula el determinante de una matriz cuadrada.

    Usa `np.linalg.det(A)`.

    Parámetros:
    - `A`: matriz cuadrada `(n, n)`.

    Retorna: `float` con el determinante.
    """
    if A.shape[0] != A.shape[1]:
        raise ValueError("Introduzca una matriz cuadrada para el determinante")
    return float(np.linalg.det(A))


def inv(A: np.ndarray) -> np.ndarray:
    """Calcula la inversa de `A` si es cuadrada y no singular.

    Pasos:
    1. Verificación de cuadratura.
    2. Cálculo de `|A|` con `np.linalg.det` y comparación contra `EPS`.
    3. `np.linalg.inv(A)` si `|A|` es distinto de cero.

    Retorna: `np.ndarray` con `A^{-1}`.
    """
    if A.shape[0] != A.shape[1]:
        raise ValueError("Introduzca una matriz cuadrada para la inversa")
    d = np.linalg.det(A)
    if abs(d) < EPS:
        raise ValueError("La matriz no tiene inversa: |A| = 0")
    return np.linalg.inv(A)


def transpose(A: np.ndarray) -> np.ndarray:
    """Devuelve la traspuesta de la matriz `A`.

    Implementación: acceso a atributo `A.T` (vista traspuesta de NumPy).
    """
    return A.T