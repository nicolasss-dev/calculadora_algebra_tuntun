import numpy as np
from app.core import linear_systems as ls


def test_cramer_2x2():
    A = np.array([[2,1],[5,3]], dtype=float)
    b = np.array([1,2], dtype=float)
    res = ls.cramer(A,b)
    assert 'solution' in res
    x = np.linalg.solve(A,b)
    assert np.allclose(res['solution'], x.tolist())


def test_cramer_singular():
    A = np.array([[1,2],[2,4]], dtype=float)
    b = np.array([3,6], dtype=float)
    res = ls.cramer(A,b)
    assert 'error' in res


def test_inverse_solve():
    A = np.array([[3,2],[1,2]], dtype=float)
    b = np.array([2,0], dtype=float)
    res = ls.inverse_solve(A,b)
    x = np.linalg.inv(A).dot(b)
    assert 'solution' in res
    assert np.allclose(res['solution'], x.tolist())


def test_inverse_solve_singular():
    A = np.array([[1,2],[2,4]], dtype=float)
    b = np.array([1,1], dtype=float)
    res = ls.inverse_solve(A,b)
    assert 'error' in res