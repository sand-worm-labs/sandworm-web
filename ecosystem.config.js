// PM2 on the current production server: pm2 start ecosystem.config.js, from a
// built checkout (pnpm install, then turbo build api, web, landing and mcp).
// The ai service runs in Docker, not here. Coolify (deployment/coolify) replaces this.
const app = dir => `${__dirname}/apps/${dir}`;
const common = { env: { NODE_ENV: 'production' }, restart_delay: 3000 };

module.exports = {
  apps: [
    { ...common, name: 'api', script: `${app('api')}/dist/main.js`, cwd: app('api'), max_memory_restart: '1G' },
    { ...common, name: 'web', script: 'pnpm', args: 'run start', interpreter: 'none', cwd: app('web'), max_memory_restart: '1500M' },
    {
      ...common,
      name: 'landing',
      script: 'pnpm',
      args: 'run preview --host 0.0.0.0',
      interpreter: 'none',
      cwd: app('landing-page'),
      max_memory_restart: '512M',
    },
    // Through pnpm, not dist/index.js: mcp reads its .env only via the --env-file flag in its start script.
    { ...common, name: 'mcp', script: 'pnpm', args: 'run start', interpreter: 'none', cwd: app('mcp'), max_memory_restart: '512M' },
  ],
};
