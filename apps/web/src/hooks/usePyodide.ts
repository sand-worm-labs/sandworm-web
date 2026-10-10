"use client";

import { useEffect, useState } from "react";
import { loadPyodide } from "pyodide";
import type { PyodideInterface } from "pyodide";

import { loadSandwormTheme } from "./useSandwormTheme";

let pyodideInstance: PyodideInterface | null = null;
let pyodideLoadingPromise: Promise<PyodideInterface> | null = null;

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = (async () => {
    const pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/",
    });

    await pyodide.loadPackage(["numpy", "matplotlib"]);
    await loadSandwormTheme(pyodide);

    pyodideInstance = pyodide;
    return pyodide;
  })();

  try {
    return await pyodideLoadingPromise;
  } catch (error) {
    pyodideLoadingPromise = null;
    throw error;
  }
}

interface UsePyodideResult {
  pyodide: PyodideInterface | null;
  loading: boolean;
  error: string | null;
}

export function usePyodide(): UsePyodideResult {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(
    pyodideInstance
  );
  const [loading, setLoading] = useState(!pyodideInstance);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (pyodideInstance) {
      setPyodide(pyodideInstance);
      setLoading(false);
    } else {
      getPyodide()
        .then(instance => {
          if (!cancelled) {
            setPyodide(instance);
            setLoading(false);
            setError(null);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : "Failed to load Pyodide"
            );
            setLoading(false);
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return { pyodide, loading, error };
}
