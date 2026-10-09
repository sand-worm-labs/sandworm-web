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


def render(*fragments: str) -> str:
    """Wrap fragments in one page with the font and styles, included once."""
    return f'<style>{_CSS}</style><div class="sw">{"".join(fragments)}</div>'


def show(*fragments: str) -> None:
    """Display fragments as the cell's HTML output."""
    from IPython.display import HTML, display

    display(HTML(render(*fragments)))


def _stat(value: str, label: str) -> str:
    return (
        f'<div class="sw-stat-value">{escape(value)}</div>'
        f'<div class="sw-stat-label">{escape(label)}</div>'
    )
