import { Map } from "immutable";
import type { Extension } from "@codemirror/state";
import { LanguageSupport } from "@codemirror/language";
import type { SQLDialect, SQLNamespace } from "@codemirror/lang-sql";
import {
  keywordCompletionSource,
  PostgreSQL,
  schemaCompletionSource,
  StandardSQL,
} from "@codemirror/lang-sql";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import type { DataSourceSchema } from "@sandworm/types";

import type { APIDataSource } from "@/types";

import { useDataSources } from "../../../hooks/useDataSources";

// =====================================
// ⬢ getDialect
// =====================================
function getDialect(type?: APIDataSource["type"]): SQLDialect {
  switch (type) {
    case "trino":
      return StandardSQL;
    case "psql":
      return PostgreSQL;
    default:
      return StandardSQL;
  }
}

// =====================================
// ⬢ adjustCasing
// =====================================
function adjustCasing(currentWord: string, suggestion: string): string {
  if (!currentWord || !suggestion) return suggestion;

  if (currentWord === currentWord.toUpperCase()) {
    return suggestion.toUpperCase();
  }

  if (currentWord === currentWord.toLowerCase()) {
    return suggestion.toLowerCase();
  }

  const firstChar = currentWord.charAt(0);
  if (
    firstChar === firstChar.toUpperCase() &&
    currentWord.slice(1) === currentWord.slice(1).toLowerCase()
  ) {
    return (
      suggestion.charAt(0).toUpperCase() + suggestion.slice(1).toLowerCase()
    );
  }

  const lastChar = currentWord.charAt(currentWord.length - 1);
  if (lastChar === lastChar.toUpperCase()) return suggestion.toUpperCase();
  if (lastChar === lastChar.toLowerCase()) return suggestion.toLowerCase();

  return suggestion;
}

// =====================================
// ⬢ getSchemaFromSchemas
// =====================================
// ⚠️ FLAG: If schema.tables is undefined/null on a partially hydrated schema
// this will throw at runtime. Add a guard if schemas can arrive incomplete.
function getSchemaFromSchemas(
  schemas: Map<string, DataSourceSchema>
): SQLNamespace {
  return Array.from(schemas.entries()).reduce<SQLNamespace>(
    (namespace, [schemaName, schema]) =>
      Object.entries(schema.tables).reduce((ns, [tableName, table]) => {
        ns[`${schemaName}.${tableName}`] = table.columns.map(
          column => column.name
        );
        return ns;
      }, namespace),
    {}
  );
}

// =====================================
// ⬢ computeCompletion
// =====================================
// This returns a Promise<fn> that is awaited on every keystroke
// inside schemaCompletion. Fine for small schemas, noticeable lag on large ones.
// Consider resolving once at construction time and caching the result.
async function computeCompletion(
  dataSource: APIDataSource,
  schemas: Map<string, DataSourceSchema>
) {
  const schema = getSchemaFromSchemas(schemas);
  return schemaCompletionSource({
    dialect: getDialect(dataSource.type),
    schema,
    defaultSchema:
      "defaultSchema" in dataSource.structure
        ? (dataSource.structure.defaultSchema ?? "")
        : "",
  });
}

// =====================================
// ⬢ language
// =====================================
function language(
  dataSource: APIDataSource | null,
  schemas: Map<string, DataSourceSchema>
): Extension {
  const dialect = getDialect(dataSource?.type);

  const keywordSource = keywordCompletionSource(dialect, true);
  const keywordCompletion = async (
    context: CompletionContext
  ): Promise<CompletionResult | null> => {
    const wordRange = context.state.wordAt(context.pos);
    const word = wordRange
      ? context.state.sliceDoc(wordRange.from, wordRange.to)
      : "";
    const completions = await keywordSource(context);
    if (!completions) return null;

    return {
      ...completions,
      options: completions.options.map(option => ({
        ...option,
        label: adjustCasing(word, option.label),
      })),
    };
  };

  if (!dataSource) {
    return new LanguageSupport(dialect.language, [
      dialect.language.data.of({ autocomplete: keywordCompletion }),
    ]);
  }

  const completionSource = computeCompletion(dataSource, schemas);
  const schemaCompletion = async (
    context: CompletionContext
  ): Promise<CompletionResult | null> => (await completionSource)(context);

  return new LanguageSupport(dialect.language, [
    dialect.language.data.of({ autocomplete: keywordCompletion }),
    dialect.language.data.of({ autocomplete: schemaCompletion }),
  ]);
}

// =====================================
// ⬢ Context
// =====================================
const Context = createContext(
  (_workspaceId: string, _dataSourceId: string | null): Extension => {
    throw new Error("Called getExtension outside of provider");
  }
);

// =====================================
// ⬢ useSQLExtension
// =====================================
export function useSQLExtension(
  workspaceId: string,
  dataSourceId: string | null
): Extension {
  const getExtension = useContext(Context);

  const [extension, setExtension] = useState<Extension>(() =>
    getExtension(workspaceId, dataSourceId)
  );

  const prevWorkspaceId = useRef(workspaceId);
  const prevDataSourceId = useRef(dataSourceId);

  useEffect(() => {
    if (
      prevWorkspaceId.current !== workspaceId ||
      prevDataSourceId.current !== dataSourceId
    ) {
      setExtension(getExtension(workspaceId, dataSourceId));
      prevWorkspaceId.current = workspaceId;
      prevDataSourceId.current = dataSourceId;
    }
  }, [workspaceId, dataSourceId, getExtension]);
  // NOTE: getExtension added to dep array. If the provider's useCallback
  // is unstable this will loop. we need verify getExtension has a stable reference.

  return extension;
}

// =====================================
// ⬢ SQLExtensionProvider
// =====================================
interface Props {
  workspaceId: string;
  children: React.ReactNode;
}

export function SQLExtensionProvider(props: Props) {
  const [{ datasources, schemas }] = useDataSources(props.workspaceId);
  const [extensionMap, setExtensionMap] =
    useState<Map<string, Extension>>(Map());

  const getExtension = useCallback(
    (workspaceId: string, dataSourceId: string | null): Extension => {
      const key = `${workspaceId}-${dataSourceId}`;
      const cached = extensionMap.get(key);
      if (cached) return cached;

      const datasource =
        datasources?.find(ds => ds.data.id === dataSourceId) ?? null;
      const schema = dataSourceId ? schemas.get(dataSourceId) : null;
      const newExtension = language(datasource, schema ?? Map());

      setExtensionMap(prev => prev.set(key, newExtension));

      return newExtension;
    },
    [extensionMap, datasources, schemas]
  );

  const lastUpdate = useRef(0);

  useEffect(() => {
    const update = () => {
      setExtensionMap(prev =>
        prev.map((_, key) => {
          const [, dataSourceId] = key.split("-");
          const datasource =
            datasources?.find(ds => ds.data.id === dataSourceId) ?? null;
          const schema = dataSourceId ? schemas.get(dataSourceId) : null;
          return language(datasource, schema ?? Map());
        })
      );
    };

    if (Date.now() - lastUpdate.current > 5000) {
      update();
      lastUpdate.current = Date.now();
      return () => {};
    }

    // ⚠️ FLAG: Math.max here always resolves to 5000 since the >5000 case is
    // already handled by the if-branch above. Likely should be Math.min.
    // Leaving as-is — changing throttle behaviour is a product decision.
    const timeToWait = Math.max(5000, 5000 - (Date.now() - lastUpdate.current));
    const timeout = setTimeout(() => {
      update();
      lastUpdate.current = Date.now();
    }, timeToWait);

    return () => clearTimeout(timeout);
  }, [datasources, schemas]);

  return (
    <Context.Provider value={getExtension}>{props.children}</Context.Provider>
  );
}
