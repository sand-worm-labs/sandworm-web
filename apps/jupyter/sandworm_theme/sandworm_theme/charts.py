"""Draw a Plotly figure the Sandworm way: title and legend above it as page text.

    from sandworm_theme import chart
    chart(fig, title="ETH is 56% of $25.7K", source="Source: Blockscout")

A Plotly title and legend live inside the figure at one fixed size, so on a phone or in a
small dashboard tile they collide with each other and with the plot. Here they are HTML above
the chart and wrap to any width; the figure keeps only the plot.
"""
from . import tokens as t
from .html import chart_head, note, show

# Traces that label themselves or carry a colour bar instead of a legend.
_NO_LEGEND = {"heatmap", "histogram2d", "contour", "pie", "treemap", "sunburst", "indicator", "table", "sankey"}


def _color(trace, index):
    for part in ("marker", "line"):
        c = getattr(getattr(trace, part, None), "color", None)
        if isinstance(c, str):
            return c
    return t.SERIES[index % len(t.SERIES)]


def prepare(fig, title=None, legend=None, extra_top=0):
    """Move the title and legend out of `fig`; return (head_html, fig). `legend=None` shows
    one when two or more named series would need it."""
    title = title if title is not None else (fig.layout.title.text or "")
    items, seen = [], set()
    for i, trace in enumerate(fig.data):
        name = getattr(trace, "name", None)
        if trace.type in _NO_LEGEND or not name or trace.showlegend is False or name in seen:
            continue
        seen.add(name)
        is_line = trace.type == "scatter" and "lines" in (trace.mode or "lines") and not trace.stackgroup and trace.fill in (None, "none")
        items.append((name, _color(trace, i), "line") if is_line else (name, _color(trace, i)))
    shown = len(items) > 1 if legend is None else legend
    fig.update_layout(title_text="", showlegend=False, margin=dict(l=16, r=16, t=16 + extra_top, b=16))
    return chart_head(title, items if shown else []), fig


def chart(fig, title=None, source=None, legend=None, extra_top=0):
    """Show a Plotly figure with its title and legend as page text, and `source` under it."""
    head, fig = prepare(fig, title, legend, extra_top)
    if head:
        show(head)
    fig.show()
    if source:
        show(note(source))
