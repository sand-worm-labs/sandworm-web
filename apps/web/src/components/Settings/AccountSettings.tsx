"use client";

import { PencilIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import clsx from "clsx";
import {
  CheckCircleIcon,
  XMarkIcon,
  XCircleIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

import {
  useCurrentWorkspaceInfo,
  useWorkspaces,
} from "../Visualization/hooks/useWorkspaces";
import useProperties from "../Visualization/hooks/useProperties";
import { useSession } from "../Visualization/hooks/useAuth";

export default function WorkspaceSettings() {
  const router = useRouter();
  const session = useSession({ redirectToLogin: true });
  const properties = useProperties();
  const { workspaceInfo } = useCurrentWorkspaceInfo();
  const [{ data: allWorkspaces }] = useWorkspaces();

  const [state, setState] = useState({
    isEditingName: false,
    isEditingOpenAIKey: false,
    newName: "",
    newOpenAIKey: "",
    showWorkspaceSwitcher: false,
  });

  const currentWorkspace = workspaceInfo;
  const isAdmin = currentWorkspace?.roles?.some(
    r => r.userId === session.user?.id && r.role === "admin"
  );

  return (
    <div className="w-full bg-white dark:bg-black h-full">
      <div className="px-4 sm:p-6 lg:p-8">
        <div className="pb-4 sm:flex flex-col mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                Team Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your team workspace settings
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setState(s => ({
                  ...s,
                  showWorkspaceSwitcher: !s.showWorkspaceSwitcher,
                }))
              }
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowsRightLeftIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Switch Team</span>
            </button>
          </div>

          {/* Team Switcher Dropdown */}
          {state.showWorkspaceSwitcher && (
            <div className="mb-4 p-4 border border-[#E9ECEF] dark:border-gray-700 rounded-xl bg-[#F2F3F4] dark:bg-gray-900">
              <h4 className="text-sm font-medium mb-3 dark:text-white">
                Your Teams
              </h4>
              <div className="space-y-2">
                {allWorkspaces.map(workspace => (
                  <button
                    type="button"
                    key={workspace.id}
                    onClick={() => {
                      router.push(`/workspace/${workspace.id}/settings`);
                      setState(s => ({ ...s, showWorkspaceSwitcher: false }));
                    }}
                    className={clsx(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      workspace.id === currentWorkspace?.id
                        ? "bg-[#C7665C20] dark:bg-blue-900 text-[#C7665C] dark:text-white"
                        : "hover:bg-[#C7665C30] dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="font-medium">{workspace.name}</div>
                    <div className="text-xs text-gray-500">
                      {workspace.ownerId === session.user?.id
                        ? "Owner"
                        : "Member"}
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => router.push("/workspace/new")}
                  className="w-full text-left px-3 py-2 rounded-md text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400 transition-colors"
                >
                  + Create New Team
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-[#262A30] p-8 mb-6">
          <div className="space-y-8 border-b border-gray-900/10 dark:border-gray-800 pb-0 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 dark:divide-gray-800">
            {/* Team Name */}
            <div className="flex items-center justify-between sm:gap-4 sm:py-6">
              <div className="flex flex-col gap-y-2 justify-left">
                <label className="block text-md font-medium leading-6 dark:text-white sm:pt-1.5">
                  Team name
                </label>
                <span className="text-xs text-gray-400">
                  This name appears on invites and will be displayed to you and
                  your team members.
                </span>
              </div>

              <div className="w-1/2 flex items-center justify-center">
                {state.isEditingName ? (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      // updateSettings(currentWorkspace.id, { name: state.newName });
                      setState(s => ({ ...s, isEditingName: false }));
                    }}
                    className="flex gap-x-2 items-center w-full"
                  >
                    <input
                      type="text"
                      className=" w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4]"
                      value={state.newName}
                      onChange={e =>
                        setState(s => ({ ...s, newName: e.target.value }))
                      }
                      placeholder="My Team"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setState(s => ({ ...s, isEditingName: false }))
                      }
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#C7665C] text-white rounded-xl hover:bg-[#C7665C] text-sm"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-x-6">
                    <span className="text-lg dark:text-white text-[#6C757D]">
                      {currentWorkspace?.name}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        className="flex gap-x-1.5 items-center px-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                        onClick={() =>
                          setState(s => ({
                            ...s,
                            newName: currentWorkspace?.name ?? "",
                            isEditingName: true,
                          }))
                        }
                      >
                        <PencilIcon className="h-3 w-3" />
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Team Plan */}
            <div className="flex items-center justify-between sm:gap-4 sm:py-6">
              <div className="flex flex-col gap-y-2 justify-left">
                <label className="block text-md font-medium leading-6 dark:text-white sm:pt-1.5">
                  Team plan
                </label>
                <span className="text-xs text-gray-400">
                  Current plan:{" "}
                  <span className="font-medium capitalize">
                    {currentWorkspace?.plan || "Free"}
                  </span>
                </span>
              </div>

              <div className="w-1/2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/workspace/${currentWorkspace?.name}/settings/billing`
                    )
                  }
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="flex items-center justify-between sm:gap-4 sm:py-6">
              <div className="flex flex-col gap-y-2 justify-left">
                <label className="block text-md font-medium leading-6 dark:text-white sm:pt-1.5">
                  AI Model
                </label>
                <span className="text-xs text-gray-400">
                  Select the default AI model for your team workspace.
                </span>
              </div>

              <select
                className="block w-[14rem] rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset  ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-[#0D1014] disabled:bg-gray-100 dark:text-white dark:ring-[#262A30]"
                defaultValue="gpt-4o"
              >
                <option value="gpt-4o">GPT-4o (Recommended)</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            {/* Custom OpenAI API Key */}
            {!properties.data?.disableCustomOpenAiKey && (
              <div className="flex items-center justify-between sm:gap-4 sm:py-6">
                <div className="flex flex-col gap-y-2 justify-left">
                  <label className="block text-md font-medium leading-6 dark:text-white sm:pt-1.5">
                    Custom OpenAI API Key
                  </label>
                  <span className="text-xs text-gray-400">
                    Use your own API key for this team workspace.
                  </span>
                </div>

                <div className="w-1/2 flex justify-center gap-x-6">
                  {!state.isEditingOpenAIKey ? (
                    <>
                      <span className="flex gap-x-1 items-center text-sm">
                        {currentWorkspace?.secrets?.hasOpenAiApiKey ? (
                          <>
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            <span className="dark:text-white">API key set</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-5 w-5 text-red-500" />
                            <span className="dark:text-white">Not set</span>
                          </>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setState(s => ({
                            ...s,
                            isEditingOpenAIKey: true,
                            newOpenAIKey: "",
                          }))
                        }
                        className="flex gap-x-1.5 items-center px-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                      >
                        <PencilIcon className="h-3 w-3" />
                        Edit
                      </button>
                      {currentWorkspace?.secrets?.hasOpenAiApiKey && (
                        <button
                          type="button"
                          onClick={() => {
                            // updateSettings(currentWorkspace.id, { openAiApiKey: "" });
                          }}
                          className={clsx(
                            "flex gap-x-1.5 items-center px-4 py-1.5 border border-gray-200 text-xs rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                          )}
                        >
                          <XMarkIcon className="h-3 w-3" />
                          Remove
                        </button>
                      )}
                    </>
                  ) : (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        // updateSettings(currentWorkspace.id, { openAiApiKey: state.newOpenAIKey });
                        setState(s => ({
                          ...s,
                          isEditingOpenAIKey: false,
                          newOpenAIKey: "",
                        }));
                      }}
                      className="flex rounded-md shadow-sm  focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600 sm:max-w-md w-full gap-x-3"
                    >
                      <input
                        type="password"
                        placeholder="sk-..."
                        name="openAIKey"
                        className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4]"
                        value={state.newOpenAIKey}
                        onChange={e =>
                          setState(s => ({
                            ...s,
                            newOpenAIKey: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setState(s => ({ ...s, isEditingOpenAIKey: false }))
                        }
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#C7665C] text-white rounded-xl hover:bg-[#C7665C] text-sm"
                      >
                        Save
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Todo: We need to handle workspace deletion */}
      </div>
    </div>
  );
}
