"""Design tokens. Every color and font in the package comes from here."""

INK = "#17101C"
INK_2 = "#42364C"
MUTED = "#6F6478"
PAPER = "#FFFFFF"
SHADE = "#FAF6FC"
RULE = "#E9E2ED"
BRAND = "#A308F0"

# Dark counterparts of the neutrals above, plus the two series colors that are
# too dark to read on a dark surface. The web app does not receive these from
# Python: it injects them as --sw-* CSS variables for HTML results, and swaps the
# same colors into stored Plotly figures when the reader is in dark mode (see
# apps/web .../python/PythonOutput.tsx and plotlyDark.ts). Keep the three in step.
DARK = {
    "ink": "#F3F0F5",
    "ink-2": "#CFC8D6",
    "muted": "#A5A5A4",
    "paper": "#272726",
    "shade": "#2F2F2E",
    "rule": "#40403E",
    "series-2": "#C1428A",
    "series-7": "#9A7BDB",
}


def var(name: str, fallback: str) -> str:
    """A CSS color that follows the reader's theme.

    `--sw-<name>` is set by the web app in dark mode and unset in light mode, so
    `fallback` (the light color) is what plain Jupyter and light mode get.
    """
    return f"var(--sw-{name}, {fallback})"


class _Css:
    """Theme-aware CSS colors for hand-written HTML: f"color:{CSS.ink}".

    Use these instead of hex codes in any HTML a notebook displays, so it reads
    in light and dark mode alike.
    """

    ink = var("ink", INK)
    ink_2 = var("ink-2", INK_2)
    muted = var("muted", MUTED)
    paper = var("paper", PAPER)
    shade = var("shade", SHADE)
    rule = var("rule", RULE)


CSS = _Css()

# Chart series, in the order Plotly assigns them to traces.
SERIES = (
    "#EE149E",  # primary
    "#84185C",  # secondary
    "#FB51BD",  # highlight
    "#FE83D1",  # tint
    BRAND,
    "#C77DEB",
    "#4B2E83",
    MUTED,
)

# Fixed per chain, so a chain keeps its color across every chart in a notebook.
CHAIN_COLORS = {
    "base": BRAND,
    "arbitrum": "#EE149E",
    "tron": "#84185C",
    "polygon": "#FB51BD",
    "optimism": "#FE83D1",
    "bnb": "#C77DEB",
    "ethereum": MUTED,
    "solana": "#4B2E83",
}

# Heatmaps and other continuous scales: light tint up to deep plum.
SEQUENTIAL = (SHADE, "#FE83D1", "#EE149E", "#84185C")

FONT_STACK = "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
FONT_IMPORT_URL = (
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque"
    ":opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap"
)
