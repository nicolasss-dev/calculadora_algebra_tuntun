import pytest
import numpy as np
from app.utils.parsing import parse_number, parse_matrix, parse_vector


def test_parse_number_basic():
    assert parse_number("3") == 3.0
    assert parse_number("-2.5") == -2.5
    assert parse_number("  1/4 ") == 0.25


def test_parse_number_invalid():
    with pytest.raises(ValueError):
        parse_number("")
    with pytest.raises(ValueError):
        parse_number("abc")
    with pytest.raises(ValueError):
        parse_number("1/0")


def test_parse_matrix_and_vector():
    A = parse_matrix([["1","2/3"],["-1","0"]])
    assert A.shape == (2,2)
    b = parse_vector(["3","1/2"])
    assert b.shape == (2,)