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

