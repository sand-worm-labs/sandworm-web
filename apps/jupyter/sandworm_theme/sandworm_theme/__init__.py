"""Sandworm notebook theme: Plotly and matplotlib defaults plus optional HTML cards.

    from sandworm_theme import use_theme
    use_theme()          # Plotly and matplotlib charts now use Sandworm colors and font

Draw every Plotly chart with `chart(fig, title=..., source=...)`: title and legend become page text above
it, so they never collide. Heatmaps get the pink-to-plum scale on their own.
Colors for charts: keep the default series on every chart, never red or green (name each
series and leave marker_color unset, even for gain and loss). `POS` and `NEG` colour the text of
a figure card only.

Dark mode is applied when a result is displayed, not when it is made, so a notebook
reads in both themes. Plotly charts need nothing from you. In HTML you write by
hand, take colors from `CSS` (f"color:{CSS.ink}") rather than hex codes; `show`,
`card`, `stat_card`, `note`, `kpi_row` and `banner` already do.

`placeholder(title, text)` is the tile for data that is missing (no API key, nothing found).

For a dashboard, open with `kpi_row` (compact figure cards) and, if wanted, a `banner`.
Both are drawn as a plain tile that adds no card of its own.
"""
from .charts import chart
from .html import banner, card, chart_head, kpi_row, note, placeholder, render, show, stat_card
from .plotly_theme import PLOT_CONFIG, TEMPLATE_NAME
from .theme import use_theme
from .tokens import BRAND, CHAIN_COLORS, CSS, DARK, HEATMAP_SCALE, INK, MUTED, NEG, POS, SERIES

__all__ = [
    "BRAND",
    "CHAIN_COLORS",
    "CSS",
    "DARK",
    "HEATMAP_SCALE",
    "INK",
    "MUTED",
    "NEG",
    "PLOT_CONFIG",
    "POS",
    "SERIES",
    "TEMPLATE_NAME",
    "banner",
    "card",
    "chart",
    "chart_head",
    "kpi_row",
    "note",
    "placeholder",
    "render",
    "show",
    "stat_card",
    "use_theme",
]
