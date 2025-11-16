import numpy as np
from app.core import vectors as vec


def test_polar_cart():
    x,y = vec.to_components(2, 60)
    mag,deg = vec.from_components(x,y)
    assert abs(mag-2) < 1e-9


def test_ops():
    u = np.array([1.0,2.0])
    v = np.array([3.0,4.0])
    s = vec.add(u,v)
    d = vec.subtract(u,v)
    dp = vec.dot(u,v)
    cp = vec.cross(u,v)
    assert np.allclose(s, [4,6])
    assert np.allclose(d, [-2,-2])
    assert abs(dp - (1*3+2*4)) < 1e-9
    assert abs(cp - (1*4-2*3)) < 1e-9