// Defaults appended to add_cell's description; phrase them so the agent can depart from them.
export const CELL_GUIDANCE = {
  python: [
    'Charts: prefer Plotly (interactive, any chart type that suits the data); matplotlib also works.',
    'Call `from sandworm_theme import use_theme; use_theme()` once, before drawing, to get Sandworm\'s default colors and font on Plotly and matplotlib charts. Do not hard-code your own palette or fonts unless the data needs something else.',
    'For HTML summaries, `from sandworm_theme import show, stat_card, card, note` give styled stat cards and cards. Optional.',
  ],
} as const;

export const guidanceFor = (type: keyof typeof CELL_GUIDANCE) =>
  `${type[0]!.toUpperCase()}${type.slice(1)} cells. ${CELL_GUIDANCE[type].join(' ')}`;
