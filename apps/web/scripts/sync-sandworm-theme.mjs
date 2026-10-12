// Copies the sandworm_theme Python package into public/, where the browser
// kernel (public/pyodide-kernel.worker.mjs) fetches it from. apps/jupyter
// holds the only source; this copy is generated before `dev` and `build` and
// is not committed. files.json lists what was copied, so the worker never
// needs its own list of the package's files.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(
  here,
  "../../jupyter/sandworm_theme/sandworm_theme"
);
const target = path.resolve(here, "../public/sandworm_theme");

const files = readdirSync(source)
  .filter(file => file.endsWith(".py"))
  .sort();

if (files.length === 0) {
  throw new Error(`No sandworm_theme files found in ${source}`);
}

// Start clean, so a file removed from the package doesn't linger. Also
// replaces the symlink this directory used to be.
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
files.forEach(file => cpSync(path.join(source, file), path.join(target, file)));
writeFileSync(path.join(target, "files.json"), `${JSON.stringify(files)}\n`);

console.log(`sandworm_theme: copied ${files.length} files to public/`);
