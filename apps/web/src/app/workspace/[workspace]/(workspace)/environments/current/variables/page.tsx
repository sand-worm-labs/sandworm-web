"use client";

import { v4 as uuidv4 } from "uuid";
import { useCallback, useState } from "react";
import { uniq } from "ramda";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PiPlus, PiTrash, PiEye, PiEyeSlash } from "react-icons/pi";

import {
  useEnvironmentVariables,
  type EnvVar,
} from "@/components/Editor/hooks/useEnvironmentVariables";
import FormError from "@/components/Editor/blocks/forms/formError";
import { useSession } from "@/components/Editor/hooks/useAuth";
import ScrollBar from "@/components/Editor/blocks/ScrollBar";
import Files from "@/components/Editor/blocks/Files";
import { useEnvironmentStatus } from "@/components/Editor/hooks/useEnvironmentStatus";
import EnvBar from "@/components/Editor/blocks/EnvBar";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import Spin from "@/components/Editor/blocks/Spin";

// =====================================
// ⬢ Constants
// =====================================
const envVarRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

type ErrorType = "empty-name" | "invalid-name" | "duplicated-name";

function errorToMessage(error: ErrorType): string {
  switch (error) {
    case "invalid-name":
      return "Must start with a letter or underscore and contain only letters, numbers, and underscores.";
    case "duplicated-name":
      return "A variable with this name already exists.";
    case "empty-name":
      return "Name can't be empty.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

// =====================================
// ⬢ Input shared classes
// =====================================

const inputCls =
  "w-full px-3 py-2 rounded-lg font-body text-sm " +
  "bg-[#F1F3F4] dark:bg-[#1A1A1A] " +
  "border border-[#DEE2E6] dark:border-border-tertiary " +
  "text-ink-500 dark:text-white " +
  "placeholder-ink-300 dark:placeholder-ink-600 " +
  "focus:outline-none focus:ring-1 focus:ring-[#A308F0] " +
  "transition-colors duration-100 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

// =====================================
// ⬢ EnvVarInput
// =====================================

interface EnvVarInputProps {
  variable: EnvVar;
  onChange?: (v: EnvVar) => void;
  onRemove: (v: EnvVar) => void;
  disabled: boolean;
  error?: ErrorType;
}

function EnvVarInput(props: EnvVarInputProps) {
  const [showValue, setShowValue] = useState(false);

  const onChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.({ ...props.variable, name: e.target.value });
    },
    [props.variable, props.onChange]
  );

  const onChangeValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.({ ...props.variable, value: e.target.value });
    },
    [props.variable, props.onChange]
  );

  const onRemove = useCallback(() => {
    props.onRemove(props.variable);
  }, [props.variable, props.onRemove]);

  return (
    <div className="flex gap-4 items-start">
      {/* ── Name ── */}
      <div className="flex-1">
        <label
          htmlFor={`name-${props.variable.id}`}
          className="block text-xs font-medium text-ink-300 dark:text-ink-600
            uppercase tracking-wider mb-1.5"
        >
          Name
        </label>
        <input
          id={`name-${props.variable.id}`}
          type="text"
          value={props.variable.name}
          placeholder="MY_VARIABLE_NAME"
          className={clsx(inputCls, props.error && "ring-1 ring-red-500")}
          onChange={onChangeName}
          disabled={!props.onChange || props.disabled}
        />
        {props.error && <FormError msg={errorToMessage(props.error)} />}
      </div>

      {/* ── Value ── */}
      <div className="flex-1">
        <label
          htmlFor={`val-${props.variable.id}`}
          className="block text-xs font-medium text-ink-300 dark:text-ink-600
            uppercase tracking-wider mb-1.5"
        >
          Value
        </label>
        <div className="relative">
          <input
            id={`val-${props.variable.id}`}
            type={showValue ? "text" : "password"}
            value={props.variable.value}
            placeholder="••••••••"
            className={clsx(inputCls, "pr-9")}
            onChange={onChangeValue}
            disabled={!props.onChange || props.disabled}
          />
          <button
            type="button"
            onClick={() => setShowValue(v => !v)}
            aria-label={showValue ? "Hide value" : "Show value"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2
              text-ink-300 hover:text-ink-500 dark:hover:text-ink-300
              transition-colors"
          >
            {showValue ? <PiEyeSlash size={15} /> : <PiEye size={15} />}
          </button>
        </div>
      </div>

      {/* ── Remove ── */}
      <div className="pt-7">
        <button
          type="button"
          onClick={onRemove}
          disabled={props.disabled}
          aria-label="Remove variable"
          className="flex items-center justify-center w-8 h-8 rounded-lg
            text-ink-300 hover:text-[#D85A30] hover:bg-[#FAECE7]
            dark:hover:bg-[#1A0D08]
            transition-colors duration-100
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PiTrash size={16} />
        </button>
      </div>
    </div>
  );
}

// =====================================
// ⬢ EnvironmentVariablesPage
// =====================================

export default function EnvironmentVariablesPage() {
  const session = useSession({ redirectToLogin: true });
  const router = useRouter();
  const workspaceId = useStringQuery("workspace");

  const {
    variables: fetchedVariables,
    loading,
    saving,
    save,
  } = useEnvironmentVariables(workspaceId);
  const environment = useEnvironmentStatus(workspaceId);

  const [errors, setErrors] = useState<Record<string, ErrorType>>({});
  const [added, setAdded] = useState<EnvVar[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  const variables = fetchedVariables.filter(v => !removed.includes(v.id));
  const isViewer =
    session?.user?.role?.find(r => r[workspaceId])?.[workspaceId] === "viewer";

  const isDirty = added.length > 0 || removed.length > 0;

  // ── Handlers ──
  const onAdd = useCallback(() => {
    setAdded(prev => [...prev, { id: uuidv4(), name: "", value: "" }]);
  }, []);

  const onSave: React.FormEventHandler<HTMLFormElement> = useCallback(
    async e => {
      e.preventDefault();
      const newErrors: Record<string, ErrorType> = {};

      added.forEach(v => {
        if (!v.name) {
          newErrors[v.id] = "empty-name";
          return;
        }
        if (!envVarRegex.test(v.name)) {
          newErrors[v.id] = "invalid-name";
          return;
        }
        if (variables.some(x => x.name === v.name)) {
          newErrors[v.id] = "duplicated-name";
          return;
        }
        if (added.some(x => x.id !== v.id && x.name === v.name)) {
          newErrors[v.id] = "duplicated-name";
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      save(added, removed)
        .then(() => {
          setAdded([]);
          setRemoved([]);
        })
        .catch(() => {
          toast.error("Something went wrong");
        });
    },
    [save, added, removed, variables, environment.status]
  );

  const onCancel = useCallback(() => {
    if (!isDirty) {
      router.back();
      return;
    }
    setAdded([]);
    setRemoved([]);
  }, [isDirty, router]);

  const onChange = useCallback(
    (v: EnvVar) => setAdded(prev => prev.map(x => (x.id === v.id ? v : x))),
    []
  );

  const onRemove = useCallback(
    (v: EnvVar) => setRemoved(prev => uniq([...prev, v.id])),
    []
  );

  const onRemoveAdded = useCallback(
    (v: EnvVar) => setAdded(prev => prev.filter(x => x.id !== v.id)),
    []
  );

  const [filesOpen, setFilesOpen] = useState(false);

  if (!session.user) return null;

  return (
    <div className="flex flex-col flex-grow h-full">
      <ScrollBar className="w-full bg-white dark:bg-base-100 h-full overflow-auto font-body">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* ── Header ── */}
          <div className="mb-6 pb-5 border-b border-[#F1F3F4] dark:border-[#2A2A28]">
            <h2 className="text-lg font-semibold text-ink-100 dark:text-white">
              Environment variables
            </h2>
            <p className="mt-1 text-sm text-ink-400 dark:text-ink-500">
              Available in Python blocks via{" "}
              <code
                className="font-mono text-[0.8125em] px-1.5 py-0.5
                bg-[#F1F3F4] dark:bg-[#2A2A28]
                border border-[#DEE2E6] dark:border-[#3A3A38]
                text-ink-500 dark:text-ink-300 rounded-md"
              >
                os.getenv("VAR_NAME")
              </code>
            </p>
          </div>

          <form onSubmit={onSave}>
            {/* ── Variable rows ── */}
            <div className="flex flex-col gap-4">
              {variables.map(v => (
                <EnvVarInput
                  key={v.id}
                  variable={v}
                  onRemove={onRemove}
                  disabled={saving}
                />
              ))}
              {added.map(v => (
                <EnvVarInput
                  key={v.id}
                  variable={v}
                  onChange={onChange}
                  onRemove={onRemoveAdded}
                  disabled={saving}
                  error={errors[v.id]}
                />
              ))}
            </div>

            {/* ── Add variable ── */}
            <div className="mt-4">
              <button
                type="button"
                onClick={onAdd}
                className="flex items-center gap-2 text-sm font-medium
                  text-ink-400 dark:text-ink-500
                  border border-[#DEE2E6] dark:border-[#3A3A38]
                  px-4 py-2 rounded-lg
                  hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
                  hover:text-ink-500 dark:hover:text-ink-300
                  transition-colors duration-100"
              >
                <PiPlus size={15} />
                New variable
              </button>
            </div>

            {/* ── Actions ── */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="text-sm font-medium
                  text-ink-400 dark:text-ink-500
                  border border-[#DEE2E6] dark:border-[#3A3A38]
                  px-5 py-2 rounded-lg
                  hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
                  hover:text-ink-500 dark:hover:text-ink-300
                  transition-colors duration-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDirty ? "Cancel" : "Back"}
              </button>

              <button
                type="submit"
                disabled={!isDirty || loading}
                className="flex items-center gap-2
                  text-sm font-medium text-white
                  bg-[#A308F0] hover:bg-[#8A06CC]
                  px-5 py-2 rounded-lg
                  transition-colors duration-100
                  disabled:bg-[#DEE2E6] dark:disabled:bg-[#2A2A28]
                  disabled:text-ink-300 dark:disabled:text-ink-600
                  disabled:cursor-not-allowed"
              >
                {saving && <Spin />}
                Save changes
              </button>
            </div>
          </form>
        </div>
      </ScrollBar>

      <Files
        workspaceId={workspaceId}
        visible={filesOpen}
        onHide={() => setFilesOpen(false)}
        userId={session.user?.id ?? null}
      />
      <EnvBar
        isViewer={isViewer}
        onOpenFiles={() => setFilesOpen(prev => !prev)}
        publishedAt={null}
        lastUpdatedAt={null}
      />
    </div>
  );
}
