import plotly.graph_objects as go
import plotly.io as pio
import pytest

import sandworm_theme as sw
from sandworm_theme import tokens


@pytest.fixture(autouse=True)
def restore_default():
    before = pio.templates.default
    yield
    pio.templates.default = before


def test_use_theme_sets_default_and_is_idempotent():
    sw.use_theme()
    sw.use_theme()
    assert pio.templates.default == sw.TEMPLATE_NAME


def test_make_default_false_only_registers():
    before = pio.templates.default
    sw.use_theme(make_default=False)
    assert sw.TEMPLATE_NAME in pio.templates
    assert pio.templates.default == before


def test_template_applies_to_any_chart_type():
    sw.use_theme()
    for trace in (go.Bar(y=[1, 2]), go.Scatter(y=[1, 2]), go.Pie(values=[1, 2]), go.Heatmap(z=[[1, 2]])):
        fig = go.Figure(trace)
        assert fig.layout.template.layout.colorway[0] == tokens.SERIES[0]
        assert fig.layout.template.layout.font.family == tokens.FONT_STACK


def test_template_keeps_plotly_white_axis_defaults():
    sw.use_theme()
    assert go.Figure().layout.template.layout.xaxis.automargin is True


def test_figure_can_override_theme():
    sw.use_theme()
    fig = go.Figure(go.Bar(y=[1], marker_color="#000000"))
    assert fig.data[0].marker.color == "#000000"


def test_stat_card_escapes_and_includes_secondary():
    html = sw.stat_card("<1M>", "Volume", secondary=[("3", "Chains")], accent=tokens.BRAND)
    assert "&lt;1M&gt;" in html and "<1M>" not in html
    assert "Chains" in html and tokens.BRAND in html


def test_render_includes_style_once():
    html = sw.render(sw.card("a", "One"), sw.card("b", "Two"))
    assert html.count("<style>") == 1
    assert "Bricolage" in html


def test_use_theme_styles_matplotlib():
    import matplotlib as mpl

    sw.use_theme()
    assert mpl.rcParams["axes.prop_cycle"].by_key()["color"][0] == tokens.SERIES[0]
    assert mpl.rcParams["axes.spines.top"] is False
