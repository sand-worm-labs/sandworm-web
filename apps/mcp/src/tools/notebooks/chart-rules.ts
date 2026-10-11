// Mobile comes first for every chart, table and card a notebook draws. The
// community opens a shared notebook from a phone, and a chart that only reads on
// a desktop is a broken chart. One text, used in the server instructions (on for
// every client) and in the cell tool descriptions (read when a cell is written).
// The in-product AI service carries the same rule: apps/ai block_action/prompts.py.
export const CHART_RESPONSIVE_RULES = [
  'Charts and visualizations must read well on a phone, about 390px wide, before anything else. When a rule here conflicts with density, extra series, decoration or how it looks on a desktop, the phone wins.',
  'Draw every Plotly chart with `from sandworm_theme import chart` and `chart(fig, title="The finding, under 60 characters", source="Source: ...")` instead of `fig.show()`: it puts the title and legend above the chart as page text that wraps on any screen, and the source under it. Never leave a title or legend inside the figure. Heatmaps, density and contour charts take the theme\'s pink-to-plum colour scale on their own: never pass `colorscale`, `color_continuous_scale` or a named Plotly scale (Plotly\'s default, navy to yellow, looks wrong).',
  'Never set a chart\'s width, margins or legend position: the theme and the renderer size it to the screen. Keep any height modest, 320 to 420px and never above 480.',
  'Show at most 8 to 10 categories and group the rest as "Other". Keep labels and series names short, about 14 characters. Use at most 5 series and legend entries, and never a dual-axis chart.',
  'Prefer horizontal bars for rankings and long labels. Keep chart titles under about 60 characters. Put the key numbers in the title or in a note under the chart, not in annotations or text drawn over the plot.',
  'Network and node-link diagrams label only the handful of nodes that matter (about 8) and leave the rest to hover.',
  'Tables have at most 6 columns with short headers. A row of figure cards has at most 4 cards.',
].join(' ');

// What a notebook or dashboard must get right before the user sees it. Same two
// homes as the chart rules above: server instructions and the cell tool guidance.
export const DATA_AND_DASHBOARD_RULES = [
  'Check headline numbers before you report them: compare the totals a notebook shows (net worth, volume, counts) with the source or a second source, and say so when a number cannot be verified.',
  'Never test a cell with mocked API responses, a patched requests module or invented rows in the user\'s workspace: a disk cache or a patched module outlives the test and later shows fake numbers as real. Key any cache by the API key, never cache an error or an empty reply, and clear whatever a test wrote.',
  'A dashboard that ranks holdings, positions or counterparties also shows the full list as a table tile: a python cell that returns the DataFrame.',
  'The source goes under every chart through `chart(..., source=...)`: the renderer pads it inside a card tile, so add no spacing of your own.',
].join(' ');
