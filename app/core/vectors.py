import math
from typing import Dict, Any, List
import numpy as np


def to_components(mag: float, deg: float):
    rad = math.radians(deg)
    return mag * math.cos(rad), mag * math.sin(rad)


def from_components(x: float, y: float):
    mag = math.hypot(x, y)
    deg = math.degrees(math.atan2(y, x)) if mag != 0 else 0.0
    return mag, deg


def add(u: np.ndarray, v: np.ndarray):
    return u + v


def subtract(u: np.ndarray, v: np.ndarray):
    return u - v


def dot(u: np.ndarray, v: np.ndarray):
    return float(u[0] * v[0] + u[1] * v[1])


def cross(u: np.ndarray, v: np.ndarray):
    return float(u[0] * v[1] - u[1] * v[0])


def _axis_limits(points, pad=0.1):
    xs = [p[0] for p in points] + [0.0]
    ys = [p[1] for p in points] + [0.0]
    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)
    dx = max(1e-6, maxx - minx)
    dy = max(1e-6, maxy - miny)
    px = dx * pad
    py = dy * pad
    return [minx - px, maxx + px], [miny - py, maxy + py]


def plot_data(u: np.ndarray, v: np.ndarray, show: Dict[str, Any]):
    show = show or {}
    s = add(u, v)
    d = subtract(u, v)
    points = [(u[0], u[1]), (v[0], v[1]), (s[0], s[1]), (d[0], d[1])]
    xr, yr = _axis_limits(points)

    shapes: List[Dict[str, Any]] = []
    data = []
    annotations = []

    # Grid configurable
    grid_cfg = (show.get("grid") or {}) if isinstance(show, dict) else {}
    grid_enabled = grid_cfg.get("enabled", True)
    if grid_enabled:
        # Compute nice steps for main and minor grid
        def nice_step(vmin, vmax):
            span = max(1e-9, abs(vmax - vmin))
            raw = span / 8.0
            pow10 = 10 ** math.floor(math.log10(raw))
            for m in [1, 2, 5, 10]:
                step = m * pow10
                if raw <= step:
                    return step
            return pow10

        # Preferencia: paso 1 por defecto (requisito), pero si sería demasiado denso, usar paso "agradable"
        def choose_step(vmin, vmax, desired):
            span = max(1e-9, abs(vmax - vmin))
            if desired is None:
                desired = 1.0
            # Evitar más de 200 líneas principales
            if span / desired > 200:
                return nice_step(vmin, vmax)
            return float(desired)

        main_step_x = choose_step(xr[0], xr[1], grid_cfg.get("mainStepX"))
        main_step_y = choose_step(yr[0], yr[1], grid_cfg.get("mainStepY"))
        minor_factor = grid_cfg.get("minorFactor", 5)  # e.g., 5 minor per main
        minor_step_x = grid_cfg.get("minorStepX") or (main_step_x / minor_factor)
        minor_step_y = grid_cfg.get("minorStepY") or (main_step_y / minor_factor)

        main_color = grid_cfg.get("color", "rgba(0,0,0,0.18)")
        main_width = float(grid_cfg.get("width", 1))
        main_dash = grid_cfg.get("dash", "solid")
        minor_color = grid_cfg.get("minorColor", "rgba(0,0,0,0.10)")
        minor_width = float(grid_cfg.get("minorWidth", 1))
        minor_dash = grid_cfg.get("minorDash", "dot")
        show_minor = bool(grid_cfg.get("showMinor", True))

        def frange(vmin, vmax, step):
            if step <= 0:
                return []
            start = math.floor(vmin / step) * step
            vals = []
            x = start
            # guard for floating error and very dense grids
            count = 0
            limit = 200
            while x <= vmax + 1e-12 and count < limit:
                vals.append(round(x, 12))
                x += step
                count += 1
            return vals

        # Minor grid (below)
        if show_minor:
            for xv in frange(xr[0], xr[1], minor_step_x):
                if abs(xv) < 1e-12:
                    continue  # 0 line will be drawn as main
                shapes.append({
                    "type": "line", "xref": "x", "yref": "y", "layer": "below",
                    "x0": xv, "x1": xv, "y0": yr[0], "y1": yr[1],
                    "line": {"color": minor_color, "width": minor_width, "dash": minor_dash}
                })
            for yv in frange(yr[0], yr[1], minor_step_y):
                if abs(yv) < 1e-12:
                    continue
                shapes.append({
                    "type": "line", "xref": "x", "yref": "y", "layer": "below",
                    "x0": xr[0], "x1": xr[1], "y0": yv, "y1": yv,
                    "line": {"color": minor_color, "width": minor_width, "dash": minor_dash}
                })

        # Main grid (below) aligned with major ticks
        for xv in frange(xr[0], xr[1], main_step_x):
            shapes.append({
                "type": "line", "xref": "x", "yref": "y", "layer": "below",
                "x0": xv, "x1": xv, "y0": yr[0], "y1": yr[1],
                "line": {"color": main_color, "width": main_width, "dash": main_dash}
            })
        for yv in frange(yr[0], yr[1], main_step_y):
            shapes.append({
                "type": "line", "xref": "x", "yref": "y", "layer": "below",
                "x0": xr[0], "x1": xr[1], "y0": yv, "y1": yv,
                "line": {"color": main_color, "width": main_width, "dash": main_dash}
            })

    def arrow(x0, y0, x1, y1, text, color="black", width=2):
        """Create a vector arrow with proper arrowhead"""
        # Calculate vector length
        vec_length = math.sqrt((x1-x0)**2 + (y1-y0)**2)
        
        if vec_length < 1e-9:
            # Don't draw zero-length vectors
            return
        
        # Arrowhead size proportional to vector length
        arrow_size = max(0.8, min(2.0, vec_length * 0.15))
        
        # Arrow annotation with proper arrowhead
        annotations.append({
            "ax": x0, 
            "ay": y0, 
            "x": x1, 
            "y": y1,
            "xref": "x",
            "yref": "y",
            "axref": "x",
            "ayref": "y",
            "showarrow": True, 
            "arrowhead": 2,
            "arrowsize": arrow_size,
            "arrowwidth": width,
            "arrowcolor": color,
            "text": text, 
            "xanchor": "left", 
            "yanchor": "bottom",
            "font": {"size": 12, "color": color},
            "bgcolor": "rgba(255,255,255,0.7)",
            "borderpad": 2
        })

    # Always show main vectors u and v
    arrow(0, 0, u[0], u[1], "u", color="blue", width=2)
    arrow(0, 0, v[0], v[1], "v", color="red", width=2)
    
    # Always show resultant vector u+v (independent of parallelogram state)
    arrow(0, 0, s[0], s[1], "u+v", color="green", width=3)

    # Parallelogram visualization (optional)
    if show.get("parallelogram", False):
        shapes.append({
            "type": "path",
            "path": f"M 0 0 L {u[0]} {u[1]} L {u[0]+v[0]} {u[1]+v[1]} L {v[0]} {v[1]} Z",
            "line": {"color": "gray", "width": 1}, 
            "fillcolor": "rgba(128,128,128,0.1)"  # Light gray fill
        })

    # Subtraction visualization (optional)
    if show.get("subtraction", False):
        arrow(v[0], v[1], d[0], d[1], "u−v", color="purple", width=2)


    # Grid styling defaults (customizable)
    grid_color = grid_cfg.get("color", "rgba(0,0,0,0.20)")
    grid_width = float(grid_cfg.get("width", 1))
    grid_dash = grid_cfg.get("dash", "solid")

    layout = {
        "xaxis": {
            "range": xr,
            "zeroline": True,
            "zerolinecolor": "black",
            "zerolinewidth": 1.5,
            "showgrid": True,  # Enable native grid
            "gridcolor": grid_color,
            "gridwidth": grid_width,
            "griddash": grid_dash,
            "linecolor": "black",
            "ticks": "outside",
            "tickcolor": "black",
            "ticklen": 4,
            "tickfont": {"color": "black", "size": 11},
            "dtick": main_step_x if grid_enabled else None
        },
        "yaxis": {
            "range": yr,
            "zeroline": True,
            "zerolinecolor": "black",
            "zerolinewidth": 1.5,
            "showgrid": True,  # Enable native grid
            "gridcolor": grid_color,
            "gridwidth": grid_width,
            "griddash": grid_dash,
            "linecolor": "black",
            "ticks": "outside",
            "tickcolor": "black",
            "ticklen": 4,
            "tickfont": {"color": "black", "size": 11},
            "dtick": main_step_y if grid_enabled else None
        },
        "showlegend": False,
        "margin": {"l": 20, "r": 20, "t": 20, "b": 20},
        "shapes": shapes,
        "annotations": annotations,
        "plot_bgcolor": "white",  # Ensure contrast
        "paper_bgcolor": "white",
        "xaxis_fixedrange": False,  # Keep zoom/pan
        "yaxis_fixedrange": False,
    }

    return {"data": data, "layout": layout}