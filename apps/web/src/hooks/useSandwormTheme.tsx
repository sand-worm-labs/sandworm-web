import type { PyodideInterface } from "pyodide";

export async function loadSandwormTheme(
  pyodide: PyodideInterface
): Promise<void> {
  const packageDir = "/home/pyodide/sandworm_theme";

  pyodide.FS.mkdirTree(packageDir);

  const files = [
    "__init__.py",
    "html.py",
    "plotly_theme.py",
    "theme.py",
    "tokens.py",
  ];

  await Promise.all(
    files.map(async file => {
      const response = await fetch(`/sandworm_theme/${file}`);

      if (!response.ok) {
        throw new Error(
          `Failed to load sandworm_theme/${file}: ${response.status}`
        );
      }

      const source = await response.text();

      pyodide.FS.writeFile(`${packageDir}/${file}`, source, {
        encoding: "utf8",
      });
    })
  );

  await pyodide.runPythonAsync(`
import sys

if "/home/pyodide" not in sys.path:
    sys.path.insert(0, "/home/pyodide")

import sandworm_theme
`);
}
