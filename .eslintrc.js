module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
    "cypress/globals": true,
  },
  extends: [
    "airbnb",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
    "plugin:@next/next/recommended",
    "prettier",
    "plugin:prettier/recommended",
    "plugin:cypress/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: "module",
  },
  plugins: [
    "import",
    "@typescript-eslint",
    "react",
    "simple-import-sort",
    "prettier",
    "cypress",
  ],
  overrides: [
    {
      files: ["cypress/**/*.cy.{js,ts}"],
      rules: {
        "no-unused-expressions": "off",
      },
    },
  ],
  root: true,
  rules: {
    "prettier/prettier": ["error", { endOfLine: "auto" }],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "consistent-return": "error",
    "import/extensions": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react/require-default-props": "off",
    "import/order": [
      "warn",
      {
        "newlines-between": "always",
        pathGroups: [
          {
            group: "external",
            pattern: "@/**",
            position: "after",
          },
        ],
      },
    ],
    "import/prefer-default-export": "off",
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        aspects: ["invalidHref", "preferButton"],
        components: ["Link"],
        specialLink: ["hrefLeft", "hrefRight"],
      },
    ],
    "jsx-a11y/label-has-associated-control": "off",
    "no-console": "off",
    "no-underscore-dangle": "off",
    "no-use-before-define": "error",
    "react/jsx-filename-extension": [1, { extensions: [".ts", ".tsx"] }],
    "react/jsx-props-no-spreading": ["off", { custom: "ignore" }],
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    // 'simple-import-sort/exports': 'error',
    // 'simple-import-sort/imports': 'error',
    "sort-keys": "off",
    "no-unused-vars": "error",
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    "react/function-component-definition": [
      2,
      {
        namedComponents: ["arrow-function", "function-declaration"],
        unnamedComponents: "arrow-function",
      },
    ],
  },
  settings: {
    // TypeScript needs this to resolve nextjs absolute imports
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: ["node_modules", "node_modules/.pnpm", "src/"],
      },
    },
    react: {
      version: "detect",
    },
  },
};
