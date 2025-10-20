# @sandwormworm/eslint-config

Shared ESLint configuration for the entire monorepo.

## Available Configurations

- `@sandworm/eslint-config/eslint-base` - Base configuration for all projects
- `@sandworm/eslint-config/eslint-nest` - Configuration for NestJS projects
- `@sandworm/eslint-config/eslint-next` - Configuration for Next.js projects
- `@sandworm/eslint-config/eslint-react-internal` - Configuration for internal React libraries

## Installation

```bash
# Install package
pnpm add -D @sandworm/eslint-config
```

## Usage

### NestJS Projects

```js
// .eslintrc.js
module.exports = {
  extends: ["@sandworm/eslint-config/eslint-nest"],
};
```

### Next.js Projects

```js
// .eslintrc.js
module.exports = {
  extends: ["@sandworm/eslint-config/eslint-next"],
};
```

### React Libraries

```js
// .eslintrc.js
module.exports = {
  extends: ["@sandworm/eslint-config/eslint-react-internal"],
};
```

## Prettier Configuration

This package also provides a default Prettier configuration:

```js
// .prettierrc.js
module.exports = require("@sandworm/eslint-config/prettier-base");
```

## Rules

### NestJS

- Use TypeScript strict mode
- Follow NestJS best practices
- Use decorators correctly
- Manage dependencies properly

### Next.js

- Use TypeScript
- Follow Next.js best practices
- Optimize SEO
- Manage assets properly

### React Libraries

- Use TypeScript
- Follow React best practices
- Optimize bundle size
- Manage dependencies properly

## Support

If you encounter any issues or have questions, please create an issue on GitHub.

## License

This project is licensed under the [MIT License](LICENSE).
