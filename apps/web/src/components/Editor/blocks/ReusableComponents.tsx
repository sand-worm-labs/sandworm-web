/* eslint-disable react/jsx-no-useless-fragment */
import { v4 as uuidv4 } from "uuid";
import type * as Y from "yjs";
import React, { useCallback, useState } from "react";
import { PiStackLight, PiFloppyDisk } from "react-icons/pi";
import { Transition, Dialog } from "@headlessui/react";
import { format } from "date-fns";
import clsx from "clsx";
import { addComponentToDocument, decodeComponentState } from "@sandworm/editor";
import Link from "next/link";
import * as allOutlineIcons from "@heroicons/react/24/outline";
import type {
  APIReusableComponent,
  ReusableComponentType,
} from "@sandworm/types";

import { CloseIconButton } from "@/components/CloseIconButton";
import { ScheduleIcon } from "@/components/Assets/ScheduleIcon";
import { Trash } from "@/components/Assets/Trash";
import allLucideIcons from "@/utils/lucideIcons";

import { useReusableComponents } from "../hooks/useReusableComponents";

import { Tooltip, TooltipV2 } from "./ToolTips";
import Spin from "./Spin";
import ScrollBar from "./ScrollBar";

const icons: Record<string, React.ComponentType<React.ComponentProps<any>>> = {
  ...allOutlineIcons,
  ...allLucideIcons,
};

interface SaveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}
export const SaveConfirmationModal = (props: SaveConfirmationModalProps) => {
  return (
    <Transition show={props.isOpen}>
      <Dialog onClose={props.onClose} className="relative z-[1000]">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/[10.2%] transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-page-surface px-4 pb-4 pt-5 text-left transition-all w-[532px] font-body shadow-xl">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full ">
                    <ScheduleIcon />
                  </div>
                  <div className="mt-1 text-center sm:mt-1 mb-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-ink-100"
                    >
                      Update existing component
                    </Dialog.Title>
                    <div className="mt-2 flex flex-col items-center gap-y-2">
                      <p className="text-sm text-ink-100 font-medium">
                        You have previously saved this block as a reusable
                        component.{" "}
                        <span className="text-sm text-error font-medium">
                          Saving this component will update all of its
                          instances.
                        </span>
                      </p>

                      <p className="text-sm text-ink-100 font-medium">
                        Do you want to update it?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3 px-5">
                  <button
                    type="button"
                    onClick={props.onUpdate}
                    className="inline-flex w-full justify-center rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  sm:col-start-2"
                  >
                    Update component
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={props.onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-xl bg-inputBg px-3 py-2 text-sm font-medium text-ink-100 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0 dark:text-black"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

function showType(type: ReusableComponentType): string {
  switch (type) {
    case "sql":
      return "SQL";
    case "python":
      return "Python";
    default:
      return "Unknown";
  }
}

interface ReusableComponentItemProps {
  workspaceId: string;
  component: APIReusableComponent;
  onUse: (component: APIReusableComponent) => void;
  onRemove: (component: APIReusableComponent) => void;
  canUse: boolean;
}
function ReusableComponentItem(props: ReusableComponentItemProps) {
  const onUse = useCallback(() => {
    props.onUse(props.component);
  }, [props.onUse, props.component]);

  const onRemove = useCallback(() => {
    props.onRemove(props.component);
  }, [props.onRemove, props.component]);

  const Icon =
    icons[props.component.document?.icon ?? "DocumentIcon"] || (() => null);

  return (
    <div className="px-4 py-3 font-body  block w-full">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div
            className="font-medium pr-2 text-sm break-all"
            title={props.component.title || "SQL - Untitled"}
          >
            {props.component.title || "Untitled"}
          </div>
          <div>
            <button
              type="button"
              className="text-ink-400 dark:text-ink-100 hover:text-red-500 disabled:cursor-not-allowed shrink-0 w-5 h-5"
              onClick={onRemove}
            >
              <Trash className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2 font-medium text-ink-400 text-xs">
            {showType(props.component.type)}

            <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
              <circle cx={1} cy={1} r={1} />
            </svg>
            <Link
              href={`/workspace/${props.workspaceId}/documents/${props.component.document.id}`}
              className="flex items-center gap-x-1 text-ink-400 hover:text-ink-400 "
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {props.component.document.title || "Untitled"}
            </Link>
          </div>
          <div className="flex items-center gap-x-2 font-medium text-ink-400 text-xs">
            Saved at{" "}
            {format(
              new Date(props.component.updatedAt),
              "h:mm a '-' do MMM, yyyy"
            )}
          </div>
        </div>

        <div className="flex pt-3 text-xs font-medium">
          <Tooltip
            position="manual"
            title=""
            message="You must be editing a notebook to use this component."
            active={!props.canUse}
            tooltipClassname="-top-1 w-44 -translate-y-full"
          >
            <button
              type="button"
              className="text-ink-400  hover:text-ink-400 hover:underline disabled:hover:text-ink-400  disabled:cursor-not-allowed"
              onClick={onUse}
              disabled={!props.canUse}
            >
              Add to notebook
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

interface Props {
  workspaceId: string;
  documentId: string;
  visible: boolean;
  onHide: () => void;
  yDoc?: Y.Doc;
}
export default function ReusableComponents(props: Props) {
  const [{ data, isLoading }, api] = useReusableComponents(props.workspaceId);

  const onUse = useCallback(
    async (component: APIReusableComponent) => {
      if (!props.yDoc) {
        return;
      }

      const blockId = uuidv4();
      try {
        const block = decodeComponentState(component.state);
        await api.createInstance(props.workspaceId, component.id, {
          documentId: props.documentId,
          blockId,
        });
        addComponentToDocument(block, blockId, props.yDoc);
      } catch (err) {
        alert("Failed to create instance of reusable component");
      }
    },
    [props.workspaceId, props.documentId, props.yDoc]
  );

  const onRemove = useCallback(
    (component: APIReusableComponent) => {
      api.remove(props.workspaceId, component.id);
    },
    [api, props.workspaceId]
  );

  return (
    <>
      {props.visible && (
        <div className="relative w-full flex flex-col  h-full bg-white dark:bg-page-surface font-body dark:border-border-tertiary">
          <div className="flex-shrink-0 px-4 xl:px-6 pt-5 pb-3 dark:border-border-tertiary border-border-secondary border-b">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-x-1.5 text-base font-medium leading-6 dark:text-white text-ink-100">
                  <PiStackLight size={18} className="flex-shrink-0" />
                  Reusable Components
                </h3>
                <p className="text-[12.5px] text-ink-400 mt-0.5">
                  Click a component to add it to the current page.
                </p>
              </div>
              <CloseIconButton
                size="sm"
                round
                onClick={props.onHide}
                aria-label="Close reusable components"
              />
            </div>
          </div>
          {data.size > 0 || isLoading ? (
            <>
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Spin />
                </div>
              )}
              <ScrollBar className="overflow-y-auto">
                <ul className="flex-1">
                  {data.map(component => (
                    <li
                      key={component.id}
                      className={clsx(
                        "border-border-secondary dark:border-border-tertiary border-b"
                      )}
                    >
                      <ReusableComponentItem
                        workspaceId={props.workspaceId}
                        component={component}
                        onUse={onUse}
                        onRemove={onRemove}
                        canUse={props.yDoc !== undefined}
                      />
                    </li>
                  ))}
                </ul>
              </ScrollBar>
            </>
          ) : (
            <div className="flex-1 p-4">
              <div className="flex items-center justify-center h-full text-ink-300 dark:text-ink-400 rounded-lg border border-dashed border-border-secondary dark:border-border-tertiary p-8 text-center font-body font-medium flex-col bg-base-500 dark:bg-page-surface">
                <ScheduleIcon />
                <p className="mt-2 text-[0.9rem]">
                  You have no reusable components. Save a block to create one.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

interface SaveReusableComponentButtonProps {
  isComponent: boolean;
  onSave: () => void;
  disabled: boolean;
  isComponentInstance: boolean;
}
export function SaveReusableComponentButton(
  props: SaveReusableComponentButtonProps
) {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const onSave = useCallback(() => {
    if (props.isComponent && !isConfirmationModalOpen) {
      setIsConfirmationModalOpen(true);
    } else {
      setIsConfirmationModalOpen(false);
      props.onSave();
    }
  }, [props.isComponent, props.onSave, isConfirmationModalOpen]);

  const onCancel = useCallback(() => {
    setIsConfirmationModalOpen(false);
  }, []);

  return (
    <>
      <div className="relative">
        <TooltipV2<HTMLButtonElement>
          message={
            props.isComponentInstance
              ? "You can't save this component because it's an instance of an existing component."
              : "Save this block as a reusable component to add to other pages."
          }
          active
        >
          {ref => (
            <button
              type="button"
              className="bg-base-200 dark:bg-header-surface rounded-[5px] border border-hover-border h-[24px] min-w-[24px] flex items-center justify-center hover:bg-hover-bg hover:border-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300"
              onClick={onSave}
              disabled={props.disabled || props.isComponentInstance}
              ref={ref}
            >
              <PiFloppyDisk className="w-[13px] h-[13px] text-ink-navy" />
            </button>
          )}
        </TooltipV2>
      </div>
      <SaveConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={onCancel}
        onUpdate={onSave}
      />
    </>
  );
}
