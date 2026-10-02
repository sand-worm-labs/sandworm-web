"""Single entry point that themes whichever charting libraries are installed."""
from . import matplotlib_theme, plotly_theme


def use_theme(make_default: bool = True, watermark: bool = True) -> None:
    """Give Plotly and matplotlib charts Sandworm's colors and font.

    Plotly: registers the "sandworm" template, and makes it the default unless
    `make_default=False`. Plotly charts also carry a faint Sandworm watermark;
    pass `watermark=False` to leave it off. Matplotlib: updates rcParams. Safe
    to call repeatedly.
    Anything set on an individual chart still wins.
    """
    for apply in (lambda: plotly_theme.apply(make_default, watermark), matplotlib_theme.apply):
        try:
            apply()
        except ImportError:  # that library isn't installed; skip it
            pass
