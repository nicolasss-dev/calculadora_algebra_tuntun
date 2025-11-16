from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any
import numpy as np

from .utils.parsing import parse_matrix, parse_vector
from .core import matrix_ops, linear_systems, vectors


class MatrixOperateRequest(BaseModel):
    A: List[List[str]]
    B: Optional[List[List[str]]] = None
    op: Literal["add", "sub", "mul", "det", "inv", "trans"]
    target: Optional[Literal["A", "B"]] = None


class LinearCramerRequest(BaseModel):
    A: List[List[str]]
    b: List[str]


class LinearInverseRequest(BaseModel):
    A: List[List[str]]
    b: List[str]


class VectorsRequest(BaseModel):
    inputMode: Literal["polar", "cart"]
    v1: Dict[str, Any]
    v2: Dict[str, Any]
    show: Dict[str, Any]


app = FastAPI(title="Calculadora de Matrices, Ecuaciones y Vectores")
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/", response_class=HTMLResponse)
def index():
    with open("app/static/index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.post("/api/matrix/operate")
def matrix_operate(payload: MatrixOperateRequest):
    try:
        A = parse_matrix(payload.A)
        B = parse_matrix(payload.B) if payload.B is not None else None
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    op = payload.op
    try:
        if op in ("add", "sub", "mul"):
            if B is None:
                raise HTTPException(status_code=400, detail="Debe proporcionar la matriz B para esta operación")
            if op == "add":
                R = matrix_ops.add(A, B)
            elif op == "sub":
                R = matrix_ops.subtract(A, B)
            else:
                R = matrix_ops.multiply(A, B)
            return {"resultMatrix": R.tolist()}
        elif op in ("det", "inv", "trans"):
            target = payload.target or "A"
            M = A if target == "A" else (B if B is not None else None)
            if M is None:
                raise HTTPException(status_code=400, detail="Matriz objetivo no proporcionada")
            if op == "det":
                d = matrix_ops.det(M)
                return {"scalar": float(d)}
            if op == "inv":
                inv = matrix_ops.inv(M)
                return {"resultMatrix": inv.tolist()}
            tr = matrix_ops.transpose(M)
            return {"resultMatrix": tr.tolist()}
        else:
            raise HTTPException(status_code=400, detail="Operación no válida")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/linear/cramer")
def linear_cramer(payload: LinearCramerRequest):
    try:
        A = parse_matrix(payload.A)
        b = parse_vector(payload.b)
        result = linear_systems.cramer(A, b)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/linear/inverse")
def linear_inverse(payload: LinearInverseRequest):
    try:
        A = parse_matrix(payload.A)
        b = parse_vector(payload.b)
        result = linear_systems.inverse_solve(A, b)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/vectors/calc")
def vectors_calc(payload: VectorsRequest):
    try:
        mode = payload.inputMode
        show = payload.show or {}

        if mode == "polar":
            ux, uy = vectors.to_components(float(payload.v1.get("mag", 0)), float(payload.v1.get("deg", 0)))
            vx, vy = vectors.to_components(float(payload.v2.get("mag", 0)), float(payload.v2.get("deg", 0)))
        else:
            ux = float(payload.v1.get("x", 0))
            uy = float(payload.v1.get("y", 0))
            vx = float(payload.v2.get("x", 0))
            vy = float(payload.v2.get("y", 0))

        u = np.array([ux, uy], dtype=float)
        v = np.array([vx, vy], dtype=float)

        s = vectors.add(u, v)
        d = vectors.subtract(u, v)
        dp = vectors.dot(u, v)
        cp = vectors.cross(u, v)

        u_md = vectors.from_components(u[0], u[1])
        v_md = vectors.from_components(v[0], v[1])

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