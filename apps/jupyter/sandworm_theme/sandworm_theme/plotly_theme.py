"""Plotly template that gives every chart type Sandworm's colors and font."""
import copy

from . import tokens as t

TEMPLATE_NAME = "sandworm"

PLOT_CONFIG = {
    "displaylogo": False,
    "scrollZoom": False,
    "modeBarButtonsToRemove": ["select2d", "lasso2d", "autoScale2d"],
    "toImageButtonOptions": {"format": "png", "scale": 2},
}

_TICK_FONT = {"color": t.MUTED, "size": 12.5}

_LAYOUT = {
    "colorway": list(t.SERIES),
    "colorscale": {"sequential": [[i / (len(t.SEQUENTIAL) - 1), c] for i, c in enumerate(t.SEQUENTIAL)]},
    "font": {"family": t.FONT_STACK, "size": 13.5, "color": t.INK},
    # Transparent, so a chart sits on whatever card or page surrounds it.
    "paper_bgcolor": "rgba(0,0,0,0)",
    "plot_bgcolor": "rgba(0,0,0,0)",
    "hoverlabel": {
        "bgcolor": t.INK,
        "bordercolor": t.INK,
        "font": {"family": t.FONT_STACK, "size": 13, "color": t.PAPER},
    },
    # Title sits at the very top; the legend sits just above the plot, in the
    # space the top margin leaves below it. Before, both fought over a 44px strip.
    "title": {
        "x": 0,
        "xanchor": "left",
        "xref": "container",
        "y": 1,
        "yanchor": "top",
        "yref": "container",
        "pad": {"t": 24, "b": 8, "l": 0},
        "font": {"size": 17, "color": t.INK},
    },
    "xaxis": {
        "showgrid": False,
        "zeroline": False,
        "showline": True,
        "linecolor": t.RULE,
        "ticks": "outside",
        "tickcolor": t.RULE,
        "ticklen": 8,
        "tickfont": _TICK_FONT,
        "automargin": True,
        "title": {"standoff": 24, "font": {"size": 12.5, "color": t.MUTED}},
    },
    "yaxis": {
        "showgrid": True,
        "gridcolor": t.RULE,
        "zeroline": False,
        "showline": False,
        "tickfont": _TICK_FONT,
        "automargin": True,
        "title": {"standoff": 24, "font": {"size": 12.5, "color": t.MUTED}},
    },
    "legend": {
        "orientation": "h",
        "yanchor": "bottom",
        "xanchor": "left",
        "x": 0,
        "font": {"size": 12.5, "color": t.MUTED},
        "bgcolor": "rgba(0,0,0,0)",
        "y": 1.06,
        "tracegroupgap": 16,
        "entrywidthmode": "pixels",
        "entrywidth": 130,
        "itemsizing": "constant",
    },
    # Roomy on purpose: the title, legend, tick labels and axis titles each need their own space.
    "margin": {"t": 120, "b": 80, "l": 88, "r": 40, "pad": 8},
    "bargap": 0.3,
    "bargroupgap": 0.08,
}


def _merge(base: dict, overrides: dict) -> dict:
    for key, value in overrides.items():
        if isinstance(value, dict) and isinstance(base.get(key), dict):
            _merge(base[key], value)
        else:
            base[key] = copy.deepcopy(value)
    return base


def _bar_defaults():
    import plotly.graph_objects as go

    try:
        return go.Bar(marker={"cornerradius": 3, "line": {"width": 0}})
    except (ValueError, TypeError):  # plotly < 5.18 has no cornerradius
        return go.Bar(marker={"line": {"width": 0}})


def apply(make_default: bool = True) -> None:
    import plotly.io as pio

    if TEMPLATE_NAME not in pio.templates:
        pio.templates[TEMPLATE_NAME] = build_template()
    if make_default:
        pio.templates.default = TEMPLATE_NAME


def build_template():
    import plotly.graph_objects as go
    import plotly.io as pio

    base = pio.templates["plotly_white"].to_plotly_json()
    base["layout"] = _merge(base["layout"], _LAYOUT)
    template = go.layout.Template(base)
    template.data.bar = [_bar_defaults()]
    return template
