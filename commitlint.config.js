// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      headerPattern:
        /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)?\s?(\w*)(?:\((.*)\))?: (.*)$/u,
      headerCorrespondence: ["emoji", "type", "scope", "subject"],
    },
  },
  rules: {
    "header-max-length": [2, "always", 70],
    "header-min-length": [2, "always", 15],

    "subject-case": [2, "always", "lower-case"],
    "subject-min-length": [2, "always", 10],
    "subject-empty": [2, "never"],

    "type-case": [2, "always", "lower-case"],
    "type-enum": [
      2,
      "always",
      [
        "feat", // ✨ Features
        "ui", // 🎨 User interface updates
        "fix", // 🐛 Bug fixes
        "docs", // 📝 Documentation
        "style", // 🎨 UI, formatting
        "refactor", // ♻️ Refactoring
        "perf", // ⚡ Performance
        "test", // ✅ Tests
        "chore", // 🛠️ Maintenance
        "revert", // ⏪ Reverts
      ],
    ],

    "header-trim": [2, "always"],
  },
};
