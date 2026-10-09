"""Sandworm notebook theme: Plotly and matplotlib defaults plus optional HTML cards.

    from sandworm_theme import use_theme
    use_theme()          # Plotly and matplotlib charts now use Sandworm colors and font

Dark mode is applied when a result is displayed, not when it is made, so a notebook
reads in both themes. Plotly charts need nothing from you. In HTML you write by
hand, take colors from `CSS` (f"color:{CSS.ink}") rather than hex codes; `show`,
`card`, `stat_card` and `note` already do.
"""
from .html import card, note, render, show, stat_card
from .plotly_theme import PLOT_CONFIG, TEMPLATE_NAME
from .theme import use_theme
from .tokens import CHAIN_COLORS, CSS, DARK, SERIES

__all__ = [
    "CHAIN_COLORS",
    "CSS",
    "DARK",
    "PLOT_CONFIG",
    "SERIES",
    "TEMPLATE_NAME",
    "card",
    "note",
    "render",
    "show",
    "stat_card",
    "use_theme",
]
