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
.sw-chart-head {{ padding: 16px 20px 0; }}
.sw-chart-title {{ margin: 0; font-size: 18px; font-weight: 600; line-height: 1.3; color: {t.CSS.ink}; }}
.sw-legend {{ display: flex; flex-wrap: wrap; gap: 6px 20px; margin-top: 10px; font-size: 14px; color: {t.CSS.muted}; }}
.sw-legend span {{ display: inline-flex; align-items: center; gap: 8px; }}
.sw-legend i {{ flex: none; width: 12px; height: 12px; border-radius: 4px; display: inline-block; }}
.sw-legend i.ln {{ width: 20px; height: 4px; border-radius: 2px; }}
@media (max-width: 520px) {{ .sw-chart-title {{ font-size: 16px; }} .sw-legend {{ font-size: 13px; gap: 5px 14px; }} }}
.sw-empty {{ font-size: 14px; line-height: 1.6; color: {t.CSS.muted}; padding: 20px; }}
.sw-empty b {{ display: block; color: {t.CSS.ink}; font-size: 15px; margin-bottom: 4px; }}
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
.sw-cards {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(var(--sw-min, 270px), 1fr)); gap: 16px; }}
.sw-cards-wrap {{ padding: 20px 16px; }}
.sw-cards-cap {{ margin: 0 0 12px; font-size: 13px; font-weight: 600; color: {t.CSS.ink}; }}
.sw-c {{ display: flex; flex-direction: column; gap: 12px; padding: 20px 20px 18px; border: 1px solid {t.CSS.rule}; border-radius: 16px; background: {t.CSS.paper}; min-width: 0; }}
.sw-c-kicker {{ font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: {t.SERIES[0]}; }}
.sw-c-big {{ font-size: 38px; font-weight: 700; line-height: 1.05; color: {t.CSS.ink}; overflow-wrap: anywhere; }}
.sw-c-big.pos, .sw-c-fv.pos {{ color: {t.CSS.pos}; }}
.sw-c-big.neg, .sw-c-fv.neg {{ color: {t.CSS.neg}; }}
.sw-c-head {{ font-size: 15px; font-weight: 600; line-height: 1.45; color: {t.CSS.ink}; }}
.sw-c-detail {{ font-size: 13px; line-height: 1.6; color: {t.CSS.muted}; }}
.sw-c-verdict {{ font-size: 13px; line-height: 1.55; padding: 2px 0 2px 12px; border-left: 3px solid {t.SERIES[0]}; color: {t.CSS.ink}; }}
.sw-c-top {{ display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }}
.sw-c-title {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; font-weight: 600; color: {t.CSS.ink}; }}
.sw-c-chip {{ font-size: 12px; padding: 2px 10px; border: 1px solid {t.CSS.rule}; border-radius: 999px; color: {t.CSS.ink_2}; white-space: nowrap; }}
.sw-c-sub {{ margin-top: -6px; font-size: 13px; color: {t.CSS.muted}; }}
.sw-c-facts {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; padding-top: 12px; border-top: 1px solid {t.CSS.rule}; }}
.sw-c-fl {{ font-size: 11px; color: {t.CSS.muted}; }}
.sw-c-fv {{ margin-top: 2px; font-size: 15px; font-weight: 600; color: {t.CSS.ink}; }}
.sw-c-meter-row {{ display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: {t.CSS.muted}; }}
.sw-c-meter-row b {{ color: {t.CSS.ink}; }}
.sw-c-bar {{ height: 6px; margin-top: 5px; border-radius: 3px; background: {t.CSS.shade}; }}
.sw-c-bar i {{ display: block; height: 6px; border-radius: 3px; background: {t.SERIES[0]}; }}
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


def chart_head(title: str = "", items: Iterable[tuple] = ()) -> str:
    """A chart's title and legend as page text, so they wrap on any screen.

    `items` is (name, color) or (name, color, "line") per series. A Plotly title and legend
    are drawn at one fixed size and collide on a narrow screen; this wraps instead.
    """
    head = f'<h4 class="sw-chart-title">{escape(title)}</h4>' if title else ""
    keys = "".join(
        f'<span><i class="{"ln" if len(i) > 2 and i[2] == "line" else ""}" style="background:{escape(str(i[1]), quote=True)}"></i>{escape(str(i[0]))}</span>'
        for i in items
    )
    legend = f'<div class="sw-legend">{keys}</div>' if keys else ""
    return f'<div class="sw-chart-head">{head}{legend}</div>' if head or legend else ""


def placeholder(title: str, text: str) -> str:
    """A calm stand-in for a tile whose data could not be had (no API key, nothing found).

    Use it instead of an empty chart or an error, so the tile says what is missing and
    what to do. Both strings are plain text; the padding is built in.
    """
    return f'<div class="sw-empty"><b>{escape(title)}</b>{escape(text)}</div>'


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


def _tone(tone: str) -> str:
    return tone if tone in ("pos", "neg") else ""


def finding(kicker: str, big: str, head: str, detail: str = "", verdict: str = "", tone: str = "") -> str:
    """One finding as a card: a small label, one big number, the sentence it belongs to, the evidence, the takeaway.

    Put one card per finding in `card_grid`. `tone` ("pos" or "neg") colours the big number.
    """
    parts = [
        f'<div class="sw-c-kicker">{escape(kicker)}</div>',
        f'<div class="sw-c-big {_tone(tone)}">{escape(big)}</div>',
        f'<div class="sw-c-head">{escape(head)}</div>',
    ]
    if detail:
        parts.append(f'<div class="sw-c-detail">{escape(detail)}</div>')
    if verdict:
        parts.append(f'<div class="sw-c-verdict">{escape(verdict)}</div>')
    return f'<div class="sw-c">{"".join(parts)}</div>'


def fact(label: str, value: str, tone: str = "") -> str:
    """One small labelled figure for `profile_card(facts=[...])`."""
    return f'<div><div class="sw-c-fl">{escape(label)}</div><div class="sw-c-fv {_tone(tone)}">{escape(value)}</div></div>'


def meter(label: str, share: float, text: str) -> str:
    """A labelled bar for a share between 0 and 1 (how much is still held, a win rate)."""
    width = max(0.0, min(1.0, float(share))) * 100
    return (
        f'<div><div class="sw-c-meter-row"><span>{escape(label)}</span><b>{escape(text)}</b></div>'
        f'<div class="sw-c-bar"><i style="width:{width:.0f}%"></i></div></div>'
    )


def profile_card(
    title: str,
    big: str,
    chip: str = "",
    sub: str = "",
    verdict: str = "",
    meters: Iterable[str] = (),
    facts: Iterable[str] = (),
    tone: str = "",
) -> str:
    """A card for one wallet, token or protocol: a title and chip, one big figure, a verdict, bars and a facts grid.

    Build `meters` with `meter(...)` and `facts` with `fact(...)`. Put the cards in `card_grid`.
    """
    chip_html = f'<span class="sw-c-chip">{escape(chip)}</span>' if chip else ""
    sub_html = f'<div class="sw-c-sub">{escape(sub)}</div>' if sub else ""
    verdict_html = f'<div class="sw-c-verdict">{escape(verdict)}</div>' if verdict else ""
    facts_html = "".join(facts)
    grid = f'<div class="sw-c-facts">{facts_html}</div>' if facts_html else ""
    return (
        f'<div class="sw-c"><div class="sw-c-top"><span class="sw-c-title">{escape(title)}</span>{chip_html}</div>'
        f'<div class="sw-c-big {_tone(tone)}">{escape(big)}</div>{sub_html}{verdict_html}{"".join(meters)}{grid}</div>'
    )


def card_grid(*cards: str, caption: str = "", min_width: int = 270) -> str:
    """Cards in a responsive grid with the padding and spacing built in, so they never touch the tile edge.

    Use it for any row of `finding` or `profile_card` cards. `caption` is an optional line above the grid. Two or
    more grids in one `show(...)` stack with space between them.
    """
    cap = f'<div class="sw-cards-cap">{escape(caption)}</div>' if caption else ""
    return f'<div class="sw-cards-wrap">{cap}<div class="sw-cards" style="--sw-min:{int(min_width)}px">{"".join(cards)}</div></div>'


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
