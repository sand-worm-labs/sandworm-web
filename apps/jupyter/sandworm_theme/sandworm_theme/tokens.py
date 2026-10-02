"""Design tokens. Every color and font in the package comes from here."""

INK = "#17101C"
INK_2 = "#42364C"
MUTED = "#6F6478"
PAPER = "#FFFFFF"
SHADE = "#FAF6FC"
RULE = "#E9E2ED"
BRAND = "#A308F0"

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
