// Mobile comes first for every chart, table and card a notebook draws. The
// community opens a shared notebook from a phone, and a chart that only reads on
// a desktop is a broken chart. One text, used in the server instructions (on for
// every client) and in the cell tool descriptions (read when a cell is written).
// The in-product AI service carries the same rule: apps/ai block_action/prompts.py.
export const CHART_RESPONSIVE_RULES = [
  'Charts and visualizations must read well on a phone, about 390px wide, before anything else. When a rule here conflicts with density, extra series, decoration or how it looks on a desktop, the phone wins.',
  'Never set a chart\'s width, margins or legend position: the theme and the renderer size it to the screen. Keep any height modest, 320 to 420px and never above 480.',
  'Show at most 8 to 10 categories and group the rest as "Other". Keep labels and series names short, about 14 characters. Use at most 5 series and legend entries, and never a dual-axis chart.',
  'Prefer horizontal bars for rankings and long labels. Keep chart titles under about 60 characters so they fit on two lines. Put the key numbers in the title or in a note under the chart, not in annotations or text drawn over the plot.',
  'Network and node-link diagrams label only the handful of nodes that matter (about 8) and leave the rest to hover.',
  'Tables have at most 6 columns with short headers. A row of figure cards has at most 4 cards.',
].join(' ');
