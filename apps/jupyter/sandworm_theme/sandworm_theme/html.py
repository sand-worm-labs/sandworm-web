"""Small HTML building blocks for summary cards. All optional."""
from html import escape
from typing import Iterable, Optional, Tuple

from . import tokens as t

_CSS = f"""
@import url('{t.FONT_IMPORT_URL}');
.sw {{ font-family: {t.FONT_STACK}; color: {t.CSS.ink}; font-variant-numeric: tabular-nums; display: grid; gap: 28px; }}
.sw-card {{ border: 1px solid {t.CSS.rule}; border-radius: 14px; overflow: hidden; background: {t.CSS.paper}; }}
.sw-card-head {{ background: {t.CSS.shade}; border-bottom: 1px solid {t.CSS.rule}; padding: 20px 28px; font-weight: 600; }}
.sw-card-body {{ padding: 24px 28px; }}
.sw-stat {{ display: grid; gap: 28px; padding: 24px 28px; }}
.sw-stat-main {{ border-left: 3px solid var(--sw-accent); padding-left: 20px; }}
.sw-stat-value {{ font-size: 42px; font-weight: 600; letter-spacing: -.03em; line-height: 1.1; }}
.sw-stat-label {{ font-size: 13px; color: {t.CSS.muted}; margin-top: 6px; }}
.sw-stat-grid {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; border-top: 1px solid {t.CSS.rule}; padding-top: 22px; }}
.sw-stat-grid .sw-stat-value {{ font-size: 19px; letter-spacing: -.01em; }}
.sw-note {{ font-size: 13px; color: {t.CSS.ink_2}; line-height: 1.6; padding: 0 4px; }}
.sw-kpis {{ display: grid; grid-template-columns: repeat(var(--sw-cols, 4), minmax(0, 1fr)); gap: 12px; }}
.sw-kpi {{ border: 1px solid {t.CSS.rule}; border-radius: 14px; background: {t.CSS.paper}; padding: 18px 20px; min-width: 0; }}
.sw-kpi-main {{ border-left: 3px solid var(--sw-accent); padding-left: 14px; }}
.sw-kpi-label {{ font-size: 13px; color: {t.CSS.muted}; }}
.sw-kpi-value {{ font-size: 28px; font-weight: 600; letter-spacing: -.02em; line-height: 1.15; margin-top: 8px; color: {t.CSS.ink}; overflow-wrap: anywhere; }}
@media (max-width: 640px) {{ .sw-kpis {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} }}
.sw-kpi-value.pos {{ color: {t.CSS.pos}; }}
.sw-kpi-value.neg {{ color: {t.CSS.neg}; }}
.sw-banner {{ display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }}
.sw-banner img {{ height: 44px; width: auto; border-radius: 10px; }}
.sw-banner-title {{ font-size: 26px; font-weight: 600; letter-spacing: -.02em; line-height: 1.2; }}
.sw-banner-sub {{ font-size: 14px; color: {t.CSS.muted}; margin-top: 4px; }}
.sw-banner-links {{ margin-left: auto; display: flex; gap: 10px; flex-wrap: wrap; }}
.sw-link {{ border: 1px solid {t.CSS.rule}; border-radius: 999px; padding: 6px 14px; font-size: 13px; color: {t.CSS.ink}; text-decoration: none; }}
.sw-link:hover {{ background: {t.CSS.shade}; }}
"""

_Secondary = Iterable[Tuple[str, str]]


def card(body: str, title: Optional[str] = None) -> str:
    """A bordered card. `body` is trusted HTML (a chart, a table); `title` is plain text."""
    head = f'<div class="sw-card-head">{escape(title)}</div>' if title else ""
    return f'<div class="sw-card">{head}<div class="sw-card-body">{body}</div></div>'


def stat_card(
    value: str,
    label: str,
    secondary: _Secondary = (),
    accent: str = t.SERIES[0],
) -> str:
    """One headline figure, plus optional (value, label) pairs in a 3-column grid."""
    # Each pair is one grid cell; unwrapped, the value and its label would
    # land in separate columns.
    cells = "".join(f'<div class="sw-stat-item">{_stat(v, l)}</div>' for v, l in secondary)
    grid = f'<div class="sw-stat-grid">{cells}</div>' if cells else ""
    return (
        f'<div class="sw-card sw-stat" style="--sw-accent:{escape(accent)}">'
        f'<div class="sw-stat-main">{_stat(value, label)}</div>{grid}</div>'
    )


def note(text: str) -> str:
    """Footnote for definitions and coverage gaps."""
    return f'<div class="sw-note">{escape(text)}</div>'


def kpi_row(
    items: Iterable[tuple],
    columns: Optional[int] = None,
    accent: str = t.SERIES[0],
) -> str:
    """A row of compact figure cards, the default way to open a dashboard.

    Each item is (label, value) or (label, value, tone), where tone is "pos" or
    "neg" to color the value for a good or bad figure. Each card carries the same
    accent bar as stat_card. At most 4 cards sit in a line: more wrap onto the
    next line (6 figures make two lines of 3), and on a narrow screen it is 2
    across. Four figures or fewer are the easiest to read at a glance. Give the
    cell a plain 24-column tile, 3 rows tall per line of cards (5 for two lines).
    """
    entries = list(items)
    cards = []
    for item in entries:
        label, value = item[0], item[1]
        tone = item[2] if len(item) > 2 and item[2] in ("pos", "neg") else ""
        tone_class = f" {tone}" if tone else ""
        cards.append(
            f'<div class="sw-kpi"><div class="sw-kpi-main">'
            f'<div class="sw-kpi-label">{escape(str(label))}</div>'
            f'<div class="sw-kpi-value{tone_class}">{escape(str(value))}</div></div></div>'
        )
    per_line = columns if columns else _kpi_columns(len(entries))
    return (
        f'<div class="sw-kpis" style="--sw-cols:{max(1, int(per_line))};--sw-accent:{escape(accent)}">'
        f'{"".join(cards)}</div>'
    )


def banner(
    subtitle: Optional[str] = None,
    logo_url: Optional[str] = None,
    links: Iterable[Tuple[str, str]] = (),
    title: Optional[str] = None,
) -> str:
    """A strip for the top of a dashboard: an optional logo, a line of text, and link buttons.

    A dashboard already shows the notebook's title above the grid, so a banner
    carries no title of its own: `subtitle` is the one line beside the logo, and
    `links` is (text, url) pairs, such as a website or a social profile. Only
    http(s) and mailto links are kept. Pass `title` only for a dashboard
    that is not headed by the notebook title. Use a plain tile.
    """
    logo = f'<img src="{escape(logo_url, quote=True)}" alt="">' if logo_url and _safe_image(logo_url) else ""
    head = f'<div class="sw-banner-title">{escape(title)}</div>' if title else ""
    sub = f'<div class="sw-banner-sub">{escape(subtitle)}</div>' if subtitle else ""
    text = f"<div>{head}{sub}</div>" if head or sub else ""
    anchors = "".join(
        f'<a class="sw-link" href="{escape(url, quote=True)}" target="_blank" rel="noopener noreferrer">{escape(text_)}</a>'
        for text_, url in links
        if _safe_link(url)
    )
    link_box = f'<div class="sw-banner-links">{anchors}</div>' if anchors else ""
    return f'<div class="sw-banner">{logo}{text}{link_box}</div>'


def render(*fragments: str) -> str:
    """Wrap fragments in one page with the font and styles, included once."""
    return f'<style>{_CSS}</style><div class="sw">{"".join(fragments)}</div>'


def show(*fragments: str) -> None:
    """Display fragments as the cell's HTML output."""
    from IPython.display import HTML, display

    display(HTML(render(*fragments)))


def _kpi_columns(count: int) -> int:
    """Cards per line: all of them up to 4, then lines of 3 (5 and 6) or 4."""
    if count <= 4:
        return max(count, 1)
    return 3 if count in (5, 6) else 4


def _safe_link(url: str) -> bool:
    return url.lower().startswith(("https://", "http://", "mailto:"))


def _safe_image(url: str) -> bool:
    return url.lower().startswith(("https://", "http://", "data:image/"))


def _stat(value: str, label: str) -> str:
    return (
        f'<div class="sw-stat-value">{escape(value)}</div>'
        f'<div class="sw-stat-label">{escape(label)}</div>'
    )
