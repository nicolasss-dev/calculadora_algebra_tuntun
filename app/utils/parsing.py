from fractions import Fraction
from typing import List
import numpy as np


def parse_number(text: str) -> float:
    """Convierte una cadena en número. Acepta entero, decimal o fracción "a/b" con signo."""
    if text is None:
        raise ValueError("Campo vacío no válido")
    s = str(text).strip()
    if s == "":
        raise ValueError("Campo vacío no válido")
    try:
        if "/" in s:
            return float(Fraction(s))
        return float(s)
    except Exception:
        raise ValueError(f"Valor no numérico o fracción inválida: '{text}'")


def parse_matrix(cells: List[List[str]]) -> np.ndarray:
    """Convierte una grilla de strings a np.ndarray(float) con validaciones de tamaño."""
    if cells is None or not isinstance(cells, list) or len(cells) == 0:
        raise ValueError("Matriz vacía no válida")
    rows = len(cells)
    cols = len(cells[0]) if rows > 0 else 0
    if cols == 0:
        raise ValueError("Matriz con 0 columnas no válida")
    for r in cells:
        if len(r) != cols:
            raise ValueError("Todas las filas deben tener el mismo número de columnas")
    data = np.zeros((rows, cols), dtype=float)
    for i in range(rows):
        for j in range(cols):
            data[i, j] = parse_number(cells[i][j])
    return data


def parse_vector(cells: List[str]) -> np.ndarray:
    """Convierte una lista de strings a vector columna np.ndarray(float)."""
    if cells is None or not isinstance(cells, list) or len(cells) == 0:
        raise ValueError("Vector b vacío no válido")
    data = np.zeros((len(cells),), dtype=float)
    for i, v in enumerate(cells):
        data[i] = parse_number(v)
    return data