"""Sandworm notebook theme: Plotly and matplotlib defaults plus optional HTML cards.

    from sandworm_theme import use_theme
    use_theme()          # Plotly and matplotlib charts now use Sandworm colors and font
"""
from .html import card, note, render, show, stat_card
from .plotly_theme import PLOT_CONFIG, TEMPLATE_NAME
from .theme import use_theme
from .tokens import CHAIN_COLORS, SERIES

__all__ = [
    "CHAIN_COLORS",
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
