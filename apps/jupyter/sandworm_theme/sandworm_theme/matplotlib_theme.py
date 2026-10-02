"""Matplotlib defaults, so charts drawn with plt look on-brand without extra code."""
from . import tokens as t

# Preferred first. Only installed families are used: matplotlib logs a warning
# per text element for every family in the list it cannot find.
_FONTS = ("Bricolage Grotesque", "Helvetica Neue", "Arial", "DejaVu Sans")

_RC = {
    "font.size": 12,
    "text.color": t.INK,
    "figure.facecolor": t.PAPER,
    "axes.facecolor": t.PAPER,
    "axes.edgecolor": t.RULE,
    "axes.labelcolor": t.MUTED,
    "axes.titlecolor": t.INK,
    "axes.titlelocation": "left",
    "axes.titlesize": 14,
    "axes.titleweight": "bold",
    "axes.titlepad": 22,
    "axes.labelpad": 14,
    "xtick.major.pad": 10,
    "ytick.major.pad": 10,
    "xtick.major.size": 6,
    "legend.borderpad": 0.8,
    "legend.labelspacing": 0.9,
    "legend.handletextpad": 0.9,
    "legend.columnspacing": 2.0,
    "figure.constrained_layout.h_pad": 0.12,
    "figure.constrained_layout.w_pad": 0.12,
    "figure.autolayout": False,
    "figure.constrained_layout.use": True,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "axes.grid.axis": "y",
    "axes.axisbelow": True,
    "grid.color": t.RULE,
    "grid.linewidth": 0.8,
    "xtick.color": t.MUTED,
    "ytick.color": t.MUTED,
    "xtick.direction": "out",
    "lines.linewidth": 2.2,
    "legend.frameon": False,
}


def _installed_fonts() -> list:
    from matplotlib import font_manager

    installed = {f.name for f in font_manager.fontManager.ttflist}
    return [name for name in _FONTS if name in installed] or ["sans-serif"]


def apply() -> None:
    import matplotlib as mpl
    from cycler import cycler

    mpl.rcParams.update({
        **_RC,
        "font.family": _installed_fonts(),
        "axes.prop_cycle": cycler(color=list(t.SERIES)),
    })
