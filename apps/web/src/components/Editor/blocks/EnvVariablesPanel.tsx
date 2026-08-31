import { v4 as uuidv4 } from "uuid";
import { useCallback, useState } from "react";
import { uniq } from "ramda";
import clsx from "clsx";
import { Transition } from "@headlessui/react";
import { toast } from "sonner";
import { PiPlus, PiTrash, PiEye, PiEyeSlash, PiCode } from "react-icons/pi";

import { CloseIconButton } from "@/components/CloseIconButton";
import ScrollBar from "@/components/Editor/blocks/ScrollBar";
import FormError from "@/components/Editor/blocks/forms/formError";
import Spin from "@/components/Editor/blocks/Spin";
import {
  useEnvironmentVariables,
  type EnvVar,
} from "@/components/Editor/hooks/useEnvironmentVariables";

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

const inputCls =
  "w-full px-3 py-2 rounded-lg font-body text-sm " +
  "bg-page-surface " +
  "border border-border dark:border-border-tertiary " +
  "text-ink-500 dark:text-white " +
  "placeholder-ink-300 dark:placeholder-ink-600 " +
  "focus:outline-none focus:ring-1 focus:ring-primary " +
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
    <div className="flex flex-col gap-2.5 py-3 border-b border-border-secondary dark:border-border-tertiary last:border-b-0">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
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

        <button
          type="button"
          onClick={onRemove}
          disabled={props.disabled}
          aria-label="Remove variable"
          className="flex items-center justify-center w-8 h-8 mt-[22px] rounded-lg flex-shrink-0
            text-ink-300 hover:text-warning hover:bg-error-tint
            dark:text-white dark:bg-error/40 dark:hover:bg-error/80
            transition-colors duration-100
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PiTrash size={16} />
        </button>
      </div>

      <div>
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
    </div>
  );
}

// =====================================
// ⬢ EnvVariablesPanel
// =====================================

interface Props {
  workspaceId: string;
  visible: boolean;
  onHide: () => void;
}

export default function EnvVariablesPanel(props: Props) {
  const {
    variables: fetchedVariables,
    loading,
    saving,
    save,
  } = useEnvironmentVariables(props.workspaceId);

  const [errors, setErrors] = useState<Record<string, ErrorType>>({});
  const [added, setAdded] = useState<EnvVar[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  const variables = fetchedVariables.filter(v => !removed.includes(v.id));
  const isDirty = added.length > 0 || removed.length > 0;

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
    [save, added, removed, variables]
  );

  const onCancel = useCallback(() => {
    setAdded([]);
    setRemoved([]);
  }, []);

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

  return (
    <Transition
      as="div"
      show={props.visible}
      className="h-full overflow-hidden flex-shrink-0 font-body"
      enter="transition-[width] duration-300 ease-in-out"
      enterFrom="w-0"
      enterTo="w-[354px]"
      leave="transition-[width] duration-300 ease-in-out"
      leaveFrom="w-[354px]"
      leaveTo="w-0"
    >
      <div className="w-full flex flex-col border-l dark:border-border-tertiary border-border-secondary h-full bg-page-surface font-body">
        <div className="flex-shrink-0 px-4 xl:px-6 pt-5 pb-3 dark:border-border-tertiary border-border-secondary border-b">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="flex items-center gap-x-1.5 text-base font-medium leading-6 dark:text-white text-ink-100">
                <PiCode size={18} className="flex-shrink-0" />
                Environment variables
              </h3>
              <p className="text-[12.5px] text-ink-400 mt-0.5">
                Available via{" "}
                <code className="font-mono text-[0.85em] px-1 py-0.5 bg-base-300 rounded">
                  os.getenv(&quot;VAR_NAME&quot;)
                </code>
              </p>
            </div>
            <CloseIconButton
              size="sm"
              round
              onClick={props.onHide}
              aria-label="Close environment variables"
            />
          </div>
        </div>

        <form onSubmit={onSave} className="flex flex-col flex-1 min-h-0">
          <ScrollBar className="flex-1 min-h-0 px-4 xl:px-6">
            <div className="flex flex-col">
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

            <div className="my-4">
              <button
                type="button"
                onClick={onAdd}
                className="flex items-center gap-2 text-sm font-medium w-full justify-center
                  text-ink-500 dark:text-ink-200
                  bg-base-300 dark:bg-base-700
                  border border-border dark:border-base-710
                  px-4 py-2 rounded-lg
                  hover:bg-base-350 dark:hover:bg-base-710
                  transition-colors duration-100"
              >
                <PiPlus size={15} />
                New variable
              </button>
            </div>
          </ScrollBar>

          <div className="flex-shrink-0 flex items-center justify-end gap-2 px-4 xl:px-6 py-4 border-t border-border-secondary dark:border-border-tertiary">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving || !isDirty}
              className="text-sm font-medium
                text-ink-500 dark:text-ink-200
                bg-base-300 dark:bg-base-700
                border border-border dark:border-base-710
                px-4 py-2 rounded-lg
                hover:bg-base-350 dark:hover:bg-base-710
                transition-colors duration-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isDirty || loading}
              className="flex items-center gap-2
                text-sm font-medium text-white
                bg-primary hover:bg-primary-710
                px-4 py-2 rounded-lg
                transition-colors duration-100
                disabled:bg-input dark:disabled:bg-base-700
                disabled:text-ink-300 dark:disabled:text-ink-600
                disabled:cursor-not-allowed"
            >
              {saving && <Spin />}
              Save
            </button>
          </div>
        </form>
      </div>
    </Transition>
  );
}
