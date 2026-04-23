"use client";

import { v4 as uuidv4 } from "uuid";
import { useCallback, useState } from "react";
import { uniq } from "ramda";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash } from "@/components/Assets/Trash";
import { BsPlusCircle } from "react-icons/bs";


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
            className="block text-xs font-medium leading-6 text-ink-400 uppercase mb-1"
          >
            Name
          </label>
          <input
            id={`name-${props.variable.id}`}
            type="text"
            value={props.variable.name}
            placeholder="MY_VARIABLE_NAME"
            className={clsx(
              "w-full px-3 py-1.5 rounded-md dark:bg-[#1A1A1A] border dark:border-border-tertiary border-[#DEE2E6] dark:text-white placeholder:dark:text-ink-300  placeholder-[#455768] focus:outline-none focus:ring-[1p] focus:ring-[#A308F0] transition text-xs md:text-sm bg-[#F1F3F4] font-body ",
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
            className="mb-1 block text-xs font-medium leading-6 text-ink-400 uppercase"
          >
            Value
          </label>
          <input
            rows={1}
            type="password"
            id={`val-${props.variable.id}`}
            value={props.variable.value}
            className="w-full px-3 py-1.5 rounded-md dark:bg-[#1A1A1A] border dark:border-border-tertiary border-[#DEE2E6] dark:text-white placeholder:dark:text-ink-300  placeholder-[#455768] focus:outline-none focus:ring-[1p] focus:ring-[#A308F0] transition text-xs md:text-sm bg-[#F1F3F4] font-body "
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
            <Trash className="h-5 w-5" />
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
  const { variables: fetchedVariables, loading, saving, save } = useEnvironmentVariables(workspaceId);
  const environment = useEnvironmentStatus(workspaceId);

  const [errors, setErrors] = useState<Record<string, ErrorType>>({});
  const [added, setAdded] = useState<EnvVar[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  const variables = fetchedVariables.filter(v => !removed.includes(v.id));
  const isViewer =
    session?.user?.role?.find(r => r[workspaceId])?.[workspaceId] === "viewer";

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

      save(added, removed)
        .then(() => {
          setAdded([]);
          setRemoved([]);
        })
        .catch(() => {
          toast.error("Something went wrong");
        })
        .finally(() => {
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
            <h2 className="text-lg font-medium leading-7 text-ink-100">
              Environment variables
            </h2>
            <p className="pt-1 text-sm leading-6 text-ink-400">
            Available in Python blocks via
              <span className="font-mono px-1 py-0.5 text-ink-100 rounded-sm">
                os.getenv("VAR_NAME")
              </span>
              .
            </p>
          </div>
          <form onSubmit={onSave}>
            <div className="flex flex-col py-4 space-y-4">
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
                  className="flex items-center gap-x-2 text-sm font-medium leading-6 text-ink-400 border border-border-secondary px-6 py-1.5  hover:bg-gray-50 rounded-lg"
                >
                  <BsPlusCircle />
                  New variable
                </button>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-4">
              <button
                onClick={onCancel}
                type="button"
                className="text-sm font-medium leading-6 text-gray-600 border border-border-secondary px-6 py-2 rounded-lg "
                disabled={saving}
              >
                {added.length === 0 && removed.length === 0 ? "Back" : "Cancel"}
              </button>
              <button
                type="submit"
                className="flex items-center gap-x-2 rounded-lg bg-[#0F0F0F] text-white  px-6 py-2 text-sm font-medium  disabled:bg-[#868E96] disabled:cursor-not-allowed "
                disabled={(added.length === 0 && removed.length === 0) || loading}
              >
                {saving && <Spin />}
                Save Changes
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
        onOpenFiles={onToggleFilesOpen}
        publishedAt={null}
        lastUpdatedAt={null}
      />
    </div>
  );
}
