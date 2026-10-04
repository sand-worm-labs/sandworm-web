export const mcpUrl = import.meta.env.PUBLIC_MCP_URL ?? 'https://mcp.sandwormlab.xyz/mcp';

export const clients = [
	{
		name: 'Claude Code',
		note: 'Run this in your terminal, then type /mcp inside Claude Code and sign in.',
		code: `claude mcp add --transport http sandworm ${mcpUrl}`,
	},
	{
		name: 'Claude (web and desktop)',
		note: 'Settings → Connectors → Add custom connector, then paste the address.',
		code: mcpUrl,
	},
	{
		name: 'Cursor',
		note: 'Add this to ~/.cursor/mcp.json (or .cursor/mcp.json in a project).',
		code: `{
  "mcpServers": {
    "sandworm": { "url": "${mcpUrl}" }
  }
}`,
	},
	{
		name: 'Any other MCP client',
		note: 'Add a remote server with the HTTP (streamable HTTP) transport. The older SSE transport is not supported.',
		code: mcpUrl,
	},
];

export const prompts = [
	'Build a notebook on Arbitrum: daily activity, DEX volume and value locked. Explain each chart in plain words.',
	'Using open data, compare stablecoin supply on Base and Ethereum over the last year.',
	'Using our tools, show the top Uniswap pairs on Base by volume this month.',
	'Open my "Market mood" notebook, add a funding-rate chart and re-run it.',
	'Publish the notebook and send me the link.',
];
