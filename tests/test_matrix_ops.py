import numpy as np
import pytest
from app.core import matrix_ops as mo


def test_add_subtract():
    A = np.array([[1,2],[3,4]], dtype=float)
    B = np.array([[5,6],[7,8]], dtype=float)
    np.testing.assert_allclose(mo.add(A,B), A+B)
    np.testing.assert_allclose(mo.subtract(A,B), A-B)
    with pytest.raises(ValueError):
        mo.add(A, np.ones((3,3)))


def test_multiply():
    A = np.array([[1,2,3],[4,5,6]], dtype=float)
    B = np.array([[1,2],[3,4],[5,6]], dtype=float)
    np.testing.assert_allclose(mo.multiply(A,B), A.dot(B))
    with pytest.raises(ValueError):
        mo.multiply(A, np.eye(2))


def test_det_inv_trans():
    A = np.array([[4,7],[2,6]], dtype=float)
    d = mo.det(A)
    assert abs(d - (4*6-7*2)) < 1e-9
    inv = mo.inv(A)
    np.testing.assert_allclose(inv.dot(A), np.eye(2), atol=1e-9)
    np.testing.assert_allclose(mo.transpose(A), A.T)
    with pytest.raises(ValueError):
        mo.inv(np.array([[1,2],[2,4]], dtype=float))