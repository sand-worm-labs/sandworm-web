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


def test_stat_card_keeps_each_secondary_value_with_its_label():
    html = sw.stat_card("1", "Total", secondary=[("3", "Chains"), ("7", "Protocols")])
    grid = html.split('class="sw-stat-grid">')[1]
    assert grid.count('<div class="sw-stat-item">') == 2
    first = grid.split('<div class="sw-stat-item">')[1]
    assert ">3<" in first and "Chains" in first and "Protocols" not in first


def test_legend_gap_does_not_grow_with_chart_height():
    sw.use_theme()
    layout = go.Figure().layout.template.layout
    # Just above the plot; a larger offset scales with the plot and pushes a
    # wrapped legend into the title.
    assert layout.legend.y <= 1.02
    assert layout.margin.t >= 112


def test_charts_carry_the_watermark_by_default():
    sw.use_theme()
    layout = go.Figure(go.Bar(y=[1, 2])).layout.template.layout
    (image,), (label,) = layout.images, layout.annotations
    assert image.name == label.name == "sandworm-watermark"
    assert image.source.startswith("data:image/svg+xml;base64,")
    assert "SANDWORM" in label.text


def test_watermark_can_be_switched_off_and_back_on():
    sw.use_theme(watermark=False)
    layout = go.Figure().layout.template.layout
    assert not layout.images and not layout.annotations
    sw.use_theme()
    assert go.Figure().layout.template.layout.images


def test_watermark_does_not_displace_a_charts_own_annotations():
    sw.use_theme()
    fig = go.Figure(go.Scatter(y=[1, 2]))
    fig.add_annotation(x=0, y=1, text="peak")
    assert [a.text for a in fig.layout.annotations] == ["peak"]
    assert len(fig.layout.template.layout.annotations) == 1


def test_render_includes_style_once():
    html = sw.render(sw.card("a", "One"), sw.card("b", "Two"))
    assert html.count("<style>") == 1
    assert "Bricolage" in html


def test_use_theme_styles_matplotlib():
    import matplotlib as mpl

    sw.use_theme()
    assert mpl.rcParams["axes.prop_cycle"].by_key()["color"][0] == tokens.SERIES[0]
    assert mpl.rcParams["axes.spines.top"] is False


def test_html_colors_follow_the_readers_theme():
    html = sw.render(sw.stat_card("1", "Total", secondary=[("2", "Chains")]))
    # Every neutral is a --sw-* variable with the light color as its fallback, so
    # the web app can swap in dark values and plain Jupyter still looks the same.
    assert "color: var(--sw-ink, " + tokens.INK + ")" in html
    assert "var(--sw-muted, " + tokens.MUTED + ")" in html
    for light in (tokens.INK, tokens.INK_2, tokens.MUTED, tokens.PAPER, tokens.SHADE, tokens.RULE):
        assert "color: " + light not in html and "background: " + light not in html


def test_every_css_color_has_a_dark_counterpart():
    for name in ("ink", "ink-2", "muted", "paper", "shade", "rule"):
        assert name in tokens.DARK
        assert "--sw-" + name in tokens.var(name, "#000")


def test_kpi_row_escapes_and_tones_values():
    html = sw.kpi_row([("Inflow <USD>", "$1"), ("Net flow", "-$2", "neg"), ("Up", "+3", "pos"), ("Other", "4", "bogus")])
    assert "Inflow &lt;USD&gt;" in html and "<USD>" not in html
    assert html.count('class="sw-kpi"') == 4
    assert 'sw-kpi-value neg"' in html and 'sw-kpi-value pos"' in html
    assert html.count("sw-kpi-value ") == 2  # an unknown tone adds no class


def test_kpi_cards_carry_the_stat_card_accent_bar():
    html = sw.kpi_row([("a", "1"), ("b", "2")], accent="#123456")
    assert html.count('class="sw-kpi-main"') == 2
    assert "--sw-accent:#123456" in html
    assert "--sw-accent:" + tokens.SERIES[0] in sw.kpi_row([("a", "1")])
    assert "border-left: 3px solid var(--sw-accent)" in sw.render(html)


def test_kpi_row_never_puts_more_than_four_cards_in_a_line():
    def cols(n):
        return sw.kpi_row([("k", str(i)) for i in range(n)]).split("--sw-cols:")[1].split(";")[0]

    assert [cols(n) for n in (1, 2, 3, 4)] == ["1", "2", "3", "4"]
    assert [cols(n) for n in (5, 6, 7, 8, 9)] == ["3", "3", "4", "4", "4"]
    assert "--sw-cols:2;" in sw.kpi_row([("a", "1"), ("b", "2"), ("c", "3")], columns=2)


def test_kpi_row_colors_follow_the_readers_theme():
    html = sw.render(sw.kpi_row([("a", "1", "neg")]))
    assert "var(--sw-neg, " + tokens.NEG + ")" in html
    assert "var(--sw-paper, " + tokens.PAPER + ")" in html
    assert "pos" in tokens.DARK and "neg" in tokens.DARK


def test_a_good_figure_is_brand_purple_not_green():
    assert tokens.POS == "#7A06B8" and tokens.DARK["pos"] == "#C97FF5"


def test_banner_has_no_title_unless_asked_and_keeps_only_safe_links_and_images():
    html = sw.banner(
        "Weekly <numbers>",
        logo_url="https://acme.test/logo.png",
        links=[("Site", "https://acme.test"), ("Bad", "javascript:alert(1)"), ("Mail", "mailto:hi@acme.test")],
    )
    assert "Weekly &lt;numbers&gt;" in html and 'class="sw-banner-sub"' in html
    assert "sw-banner-title" not in html
    assert 'src="https://acme.test/logo.png"' in html
    assert "javascript:" not in html and ">Bad<" not in html
    assert html.count('target="_blank" rel="noopener noreferrer"') == 2
    assert 'src=' not in sw.banner("x", logo_url="javascript:alert(1)")
    assert 'class="sw-banner-title">Acme</div>' in sw.banner("x", title="Acme")
