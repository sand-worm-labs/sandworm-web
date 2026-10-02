"""Matplotlib defaults, so charts drawn with plt look on-brand without extra code."""
from . import tokens as t

# Preferred first. Only installed families are used: matplotlib logs a warning
# per text element for every family in the list it cannot find.
# Liberation Sans is the Arial-metric font installed in the notebook image, so
# matplotlib falls back to the same look as Plotly's "Helvetica Neue, Arial" stack.
_FONTS = ("Bricolage Grotesque", "Helvetica Neue", "Arial", "Liberation Sans", "DejaVu Sans")

_RC = {
    # IPython's inline backend sets figure.dpi to 72, which makes every chart a
    # soft, low-resolution PNG. Render at 2x so text stays sharp on retina screens.
    "figure.dpi": 160,
    "savefig.dpi": 160,
    "font.size": 12,
    "text.color": t.INK,
    "figure.facecolor": t.PAPER,
    "axes.facecolor": t.PAPER,
    "axes.edgecolor": t.RULE,
    "axes.labelcolor": t.MUTED,
    "axes.titlecolor": t.INK,
    "axes.titlelocation": "left",
    "axes.titlesize": 16,
    "axes.titleweight": "normal",
    "axes.titlepad": 22,
    "axes.labelpad": 14,
    "xtick.major.pad": 10,
    "ytick.major.pad": 10,
    "xtick.major.size": 6,
    "legend.borderpad": 0.8,
    "legend.labelspacing": 0.9,
    "legend.handletextpad": 0.9,
    "legend.columnspacing": 2.0,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.spines.left": False,
    "axes.grid": True,
    "axes.grid.axis": "y",
    "axes.axisbelow": True,
    "grid.color": t.RULE,
    "grid.linewidth": 0.8,
    "xtick.color": t.MUTED,
    "ytick.color": t.MUTED,
    "ytick.major.size": 0,
    "xtick.labelsize": 11,
    "ytick.labelsize": 11,
    "xtick.direction": "out",
    "lines.linewidth": 2.2,
    "legend.frameon": False,
    "legend.fontsize": 11,
    "legend.title_fontsize": 11,
    "legend.scatterpoints": 1,
}


def _installed_fonts() -> list:
    from matplotlib import font_manager

    installed = {f.name for f in font_manager.fontManager.ttflist}
    return [name for name in _FONTS if name in installed] or ["sans-serif"]


def apply() -> None:
    import matplotlib as mpl
    # Importing pyplot activates IPython's inline backend, which applies its own
    # rc (figure.dpi=72, transparent background). Do that first so our values win.
    import matplotlib.pyplot  # noqa: F401
    from cycler import cycler

    mpl.rcParams.update({
        **_RC,
        "font.family": _installed_fonts(),
        "axes.prop_cycle": cycler(color=list(t.SERIES)),
    })
