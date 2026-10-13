<p align="center" id="top">

  <!-- Logo -->
  <a href="/">
    <picture>
      <source media="(prefers-color-scheme: light)" srcset="./misc/sandworm_logo.png">
      <img src="./misc/sandworm_logo.png" width="300px" alt="Sandworm Logo">
    </picture>
  </a>

  <h1 align="center">Sandworm Webapp </h1>
</p>

This repo is the frontend interface for SandWorm, a multi-chain blockchain data explorer and query IDE. We currently support Sui, Base, Ethereum, and other EVM-compatible networks and actively expanding to additional ecosystems beyond EVM. This repository contains the web-based UI, including the **landing page**, **public gists**, and the **integrated IDE** for querying blockchain data with SandWorm's SQL-like query language (WQL).


## Hackathon Submission

Sandworm existed before the hackathon. This section says what was already there, what was built during the build window (1 September to 14 October 2026), and which AI coding tools were used.

**The submission:** AI agents that do onchain analysis step by step in a notebook, and publish the result as a live dashboard that runs in the viewer's browser.

### Pre-existing foundation (before 1 September 2026)

These components were built before the build window and are used as the foundation. The last commit before the window is `76e6f61b`.

- **Notebook editor** (`apps/web`, `packages/editor`): SQL, Python, markdown, visualization, pivot table and input blocks on a shared Yjs document, with real-time collaboration.
- **API** (`apps/api`): authentication, workspaces, projects, documents, and the executors that run SQL and Python blocks.
- **Cloud runtime** (`apps/jupyter`): the Jupyter kernel image that runs notebook code on the server.
- **Dashboards**: arranging a notebook's outputs on a grid.
- **AI service** (`apps/ai`, a separate repository included as a submodule): the first version of the in-app assistant.
- **Landing page** (`apps/landing-page`) and the shared packages (`packages/types`, `packages/postgresql-typeorm`, `packages/nest-common`).

### Built during the hackathon (1 September to 14 October 2026)

| Area | What was added |
| --- | --- |
| **MCP server for agents** (`apps/mcp`) | A new server that lets AI clients build and run notebooks: an OAuth 2.1 authorization server, tools for cells, dashboards, comments, data sources and environments, and audit and tool-call logging |
| **Agent editing in the app** | The in-app assistant edits and fixes cells through the same MCP tools, and replies are saved as they stream |
| **Browser notebooks** | Three notebook types (Cloud, Live dashboard, Local analysis), a Python kernel that runs in the browser on Pyodide, and a browser executor that mirrors the server's |
| **Live dashboards** | Cells that keep updating by polling or WebSocket (`@sw.every`, `sw.websocket`), a canvas chart for streaming series (`sw.stream`), and a memory guard |
| **JavaScript cells and safety** | A JavaScript block type for browser notebooks, a sandbox for notebook code, and a prompt before running a notebook someone else wrote |
| **Showcase** | Public showcase, category and case-study pages, leads, public profiles and search |
| **Bounties and contracts** (`packages/foundry`) | A bounty escrow contract with tests and deploy scripts, and bounty creation and funding in the app |
| **Plans and data access** | Free and Pro plans, a trial, an upgrade gate, an open-data fallback, and tools that say which API keys they need |
| **Power Toolbox** | A block that runs prebuilt analysis tools, tool templates, the Trino query service and contract ABI lookup |
| **Publishing** | Publish and unpublish, public notebooks and dashboards, forking, the explore page and scheduled runs |
| **Theme and charts** | Dark mode, the Sandworm chart theme for Python output, pie charts and chart image export |

### Verifying the build window

The commit history is the record. In this repository, 292 commits fall inside the window and 1,606 come before it.

```bash
# Work done during the build window
git log --since="2026-09-01T00:00:00+00:00" --no-merges --oneline

# Everything that changed since the last commit before the window
git diff --stat 76e6f61b HEAD
```

`apps/ai` is a submodule, so its history is in its own repository.

### AI coding tools

AI coding tools were used to build this project during the hackathon. Claude Code (Anthropic) was used to write, refactor, test and review code across the repository. All AI-written code was directed and reviewed by the team.

### Environment Variables

Copy the example `.env` file and configure it with the necessary values:

```sh
cp .env.example .env.local
```


## Project Structure

### Applications (Apps)

- `app/jupyter`: Jupyter Notbook 
- `apps/app-api`: Graphql and rest backend  Api
- `apps/web`: Web frontend application

### Packages

- `packages/api`: Common library for APIs
- `packages/postgresql-typeorm`: TypeORM configuration and utilities for PostgreSQL
- `packages/nest-common`: Common modules and services for NestJS
- `packages/ui`: UI components library
- `packages/eslint-config`: ESLint configuration
- `packages/typescript-config`: TypeScript configuration

## System Requirements

- Node.js >= 18.x
- pnpm >= 8.x
- Docker (optional, for development environment)

## Installation

```bash
# Clone repository
git clone https://github.com/sand-worm-labs/sandworm-web.git

# Install dependencies
pnpm install

# Create environment files
cp apps/graphql_api/.env.example apps/graphql_api/.env
cp apps/graphql_api/.env.example apps/graphql_api/.env
```

## Development

```bash
# Run all applications in development mode
pnpm dev

# Run a specific application
pnpm dev --filter=graphql_api
pnpm dev --filter=web
```

## Build

```bash
# Build all applications and packages
pnpm build

# Build a specific application
pnpm build --filter=graphql_api
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific application
pnpm test --filter=graphql_api
```

## Deployment

Each application can be deployed independently. See the README of each application for detailed deployment instructions.

## Development Process

1. Create a new branch from `develop`
2. Make changes
3. Create pull request
4. Wait for review and merge

## 🛠 Contributing

To contribute:

1. Read our **[Contributing Guidelines](CONTRIBUTING.md)**.
2. Check the **Developer Notes** (`DEVELOPER_NOTE.md`) for pending features.
3. Follow the project structure and coding guidelines.

To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m "Added new feature"`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

---

## 📜 License

This project is licensed under the MIT License. See the **[LICENSE](LICENSE)** file for details.


## Support

If you encounter any issues or have questions, please create an issue on GitHub.

