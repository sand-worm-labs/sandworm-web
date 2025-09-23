module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 70],

    "subject-case": [2, "always", "lower-case"],
    "subject-min-length": [2, "always", 10],

    "type-case": [2, "always", "lower-case"],
    "type-enum": [
      2,
      "always",
      [
        "feat", // ✨ Features
        "ui", // 🖼️ User interface updates
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

    "subject-empty": [2, "never"],
    "header-min-length": [2, "always", 15],
  },
};
