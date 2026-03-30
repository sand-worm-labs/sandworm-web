"use client";

import { v4 as uuidv4 } from "uuid";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { useCallback, useState } from "react";
import { uniq } from "ramda";
import clsx from "clsx";
import { useRouter } from "next/router";
import { toast } from "sonner";

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

const envVarRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

type ErrorType = "empty-name" | "invalid-name" | "duplicated-name";

function errorToMessage(error: ErrorType): string {
  switch (error) {
    case "invalid-name":
      return "Invalid name, must start with a letter or underscore and contain only letters, numbers, and underscores.";
    case "duplicated-name":
      return "Duplicated name, you can't have two variables with the same name.";
    case "empty-name":
      return "Invalid name, can't be empty.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

interface EnvVarInputProps {
  variable: EnvVar;
  onChange?: (v: EnvVar) => void;
  onRemove: (v: EnvVar) => void;
  disabled: boolean;
  error?: ErrorType;
}
function EnvVarInput(props: EnvVarInputProps) {
  const onChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.({ ...props.variable, name: e.target.value });
    },
    [props.variable, props.onChange]
  );

  const onChangeValue = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      props.onChange?.({ ...props.variable, value: e.target.value });
    },
    [props.variable, props.onChange]
  );

  const onRemove = useCallback(() => {
    props.onRemove(props.variable);
  }, [props.variable, props.onRemove]);

  return (
    <div>
      <div className="flex space-x-4">
        <div className="flex-1 w-full">
          <label
            htmlFor={`name-${props.variable.id}`}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Name
          </label>
          <input
            id={`name-${props.variable.id}`}
            type="text"
            value={props.variable.name}
            placeholder="MY_VARIABLE_NAME"
            className={clsx(
              "h-9 block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-ceramic-200/70 disabled:bg-gray-100 disabled:text-gray-300",
              props.error && "ring-1 ring-error-600"
            )}
            onChange={onChangeName}
            disabled={!props.onChange || props.disabled}
          />
          {props.error && <FormError msg={errorToMessage(props.error)} />}
        </div>
        <div className="flex-1 w-full">
          <label
            htmlFor={`val-${props.variable.id}`}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Value
          </label>
          <textarea
            rows={1}
            id={`val-${props.variable.id}`}
            value={props.variable.value}
            className="h-9 block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-ceramic-200/70 6 disabled:bg-gray-100 disabled:text-gray-300"
            onChange={onChangeValue}
            disabled={!props.onChange || props.disabled}
          />
        </div>
        <div className="pt-6">
          <button
            type="button"
            className="flex items-center justify-center cursor-pointer text-gray-600 disabled:cursor-not-allowed w-9 h-9 rounded-md hover:text-error "
            onClick={onRemove}
            disabled={props.disabled}
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EnvirontVariablesPage() {
  const session = useSession({ redirectToLogin: true });
  const router = useRouter();
  const workspaceId = useStringQuery("workspace");
  const [saving, setSaving] = useState(false);
  const [swr, { save }] = useEnvironmentVariables(workspaceId);
  const environment = useEnvironmentStatus(workspaceId);

  const [errors, setErrors] = useState<Record<string, ErrorType>>({});
  const [added, setAdded] = useState<EnvVar[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  const variables = (swr.data ?? []).filter(v => !removed.includes(v.id));

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

        const isDuplicateInAdded = added.some(
          x => x.id !== v.id && x.name === v.name
        );

        if (isDuplicateInAdded) {
          newErrors[v.id] = "duplicated-name";
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setSaving(true);
      save(added, removed)
        .then(() => {
          setAdded([]);
          setRemoved([]);
        })
        .catch(() => {
          toast.error("Something went wrong");
        })
        .finally(() => {
          setSaving(false);
        });
    },
    [save, added, removed, variables, environment.status]
  );

  const onCancel = useCallback(() => {
    if (added.length === 0 && removed.length === 0) {
      router.back();
    }

    setAdded([]);
    setRemoved([]);
  }, [added, removed, router]);

  const onChange = useCallback(
    (v: EnvVar) => {
      setAdded(prev => prev.map(x => (x.id === v.id ? v : x)));
    },
    [setAdded]
  );

  const onRemove = useCallback(
    (v: EnvVar) => {
      setRemoved(prev => uniq([...prev, v.id]));
    },
    [setRemoved]
  );

  const onRemoveAdded = useCallback(
    (v: EnvVar) => {
      setAdded(prev => prev.filter(x => x.id !== v.id));
    },
    [setAdded]
  );

  const [filesOpen, setFilesOpen] = useState(false);
  const onToggleFilesOpen = useCallback(() => {
    setFilesOpen(prev => !prev);
  }, []);

  if (!session.user) {
    return null;
  }

  return (
    <div className="flex flex-col flex-grow h-full">
      <ScrollBar className="w-full bg-white h-full overflow-auto">
        <div className="px-4 sm:p-6 lg:p-8">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold leading-7 text-gray-900">
              Environment variables
            </h2>
            <p className="pt-1 text-sm leading-6 text-gray-500">
              These environment variables are available in Python blocks through{" "}
              <span className="font-mono px-1 py-0.5 bg-gray-100 rounded-sm">
                os.getenv("VAR_NAME")
              </span>
              .
            </p>
          </div>
          <form onSubmit={onSave}>
            <div className="flex flex-col border-b border-gray-200 py-4 space-y-4">
              <div className="flex flex-col space-y-2">
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
                    variable={v}
                    onChange={onChange}
                    onRemove={onRemoveAdded}
                    disabled={saving}
                    error={errors[v.id]}
                  />
                ))}
              </div>
              <div>
                <button
                  type="button"
                  onClick={onAdd}
                  className="flex items-center gap-x-2 text-sm font-semibold leading-6 text-gray-600 border border-gray-400 px-6 py-1.5 rounded-sm shadow-sm hover:bg-gray-50"
                >
                  New variable
                </button>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-4">
              <button
                onClick={onCancel}
                type="button"
                className="text-sm font-semibold leading-6 text-gray-600 border border-gray-400 px-6 py-1.5 rounded-sm shadow-sm hover:bg-gray-50"
                disabled={saving}
              >
                {added.length === 0 && removed.length === 0 ? "Back" : "Cancel"}
              </button>
              <button
                type="submit"
                className="flex items-center gap-x-2 rounded-sm shadow-sm bg-primary-200 px-6 py-2.5 text-sm font-semibold hover:bg-primary-300 border-stone-950 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={
                  (added.length === 0 && removed.length === 0) || swr.isLoading
                }
              >
                {saving && <Spin />}
                Save
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
        isViewer={session.user?.roles[workspaceId] === "viewer"}
        onOpenFiles={onToggleFilesOpen}
        publishedAt={null}
        lastUpdatedAt={null}
      />
    </div>
  );
}
