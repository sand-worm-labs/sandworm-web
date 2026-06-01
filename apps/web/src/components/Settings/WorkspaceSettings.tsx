"use client";

import React, {
  useState,
  useEffect,
  Fragment,
  useCallback,
  useMemo,
} from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Transition } from "@headlessui/react";
import { toast } from "sonner";

import type { UserWorkspaceRole } from "@/types";

import {
  useApproveRoleRequest,
  useDeleteWorkspace,
  useInviteUserToWorkspace,
  usePendingInvites,
  usePendingRoleRequests,
  useRejectRoleRequest,
  useWorkspaceWithMembers,
  useRemoveUserFromWorkspace,
  useUpdateWorkspaceMemberRole,
} from "../Editor/hooks/useWorkspaces";
import { useStringQuery } from "../Editor/hooks/useQueryArgs";
import { useOpenRouterModels } from "../Editor/hooks/useOpenRouterModel";
import MiniUsersList from "../Editor/blocks/MiniUsersList";
import { ModelPickerModal } from "../Editor/blocks/ModelPicker";
import ManageInviteModal from "../ManageInvite";
import InviteUserModal from "../InviteUser";
import { PencilSimple } from "../Assets/PencilSimple";

import EditWorkspaceProfileModal from "./EditWorkspaceProfileModal";
import { WorkspaceIcon } from "./WorkspaceIcon";
import { DeleteWorkspaceModal } from "./DeleteWorkspaceModal";

// =====================================
// ⬢ Types
// =====================================
interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: {
    id: string;
    name: string;
    icon?: string | null;
    assistantModel?: string;
    secrets?: { hasAiModelApiKey?: boolean };
  } | null;
  updateWorkspace: (id: string, name: string, icon?: string) => Promise<void>;
  isUpdating: boolean;
  _isAdmin?: boolean;
  isCurrentWorkspace: boolean;
  disableCustomAiModelKey: boolean;
}

// =====================================
// ⬢ Utils
// =====================================
function formatCredit(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
}

function resolveDeleteError(
  error: string | null | undefined
): string | undefined {
  switch (error) {
    case "current_workspace":
      return "You cannot delete the workspace you are currently in.";
    case "last_workspace":
      return "You cannot delete your last workspace.";
    case "unauthorized":
      return "You must be an admin to delete this workspace.";
    case "unexpected":
      return "Something went wrong. Please try again.";
    default:
      return undefined;
  }
}

// =====================================
// ⬢ useWorkspaceSettings
// =====================================
function useWorkspaceSettings(
  workspaceId: string | undefined,
  isOpen: boolean
) {
  const {
    members,
    currentUserRole,
    isLoading: isMembersLoading,
  } = useWorkspaceWithMembers(isOpen ? workspaceId : undefined);

  const { pendingRequests, refetch: refetchPendingRequests } =
    usePendingRoleRequests(workspaceId ?? "");
  const { pendingInvites: rawPendingInvites, refetch: refetchInvites } =
    usePendingInvites(workspaceId ?? "");

  const { approveRoleRequest } = useApproveRoleRequest(workspaceId ?? "");
  const { rejectRoleRequest } = useRejectRoleRequest(workspaceId ?? "");
  const { updateMemberRole } = useUpdateWorkspaceMemberRole(workspaceId ?? "");
  const { removeUser } = useRemoveUserFromWorkspace(workspaceId ?? "");
  const { inviteUser } = useInviteUserToWorkspace(workspaceId);

  const currentWorkspace = useStringQuery("workspace");
  const [{ loading: isDeleting, error: deleteError }, { deleteWorkspace }] =
    useDeleteWorkspace(currentWorkspace ?? undefined);

  const openRouterModels = useOpenRouterModels(currentWorkspace);

  const isAdmin = currentUserRole === "admin";

  const mappedPendingRequests = useMemo(
    () =>
      pendingRequests.map(req => ({
        id: req.userId,
        name: req.user
          ? `${req.user.firstName ?? ""} ${req.user.lastName ?? ""}`.trim() ||
            req.user.username ||
            req.user.email ||
            ""
          : req.userId,
        email: req.user?.email ?? "",
        requestedRole:
          (req.requestedRole as UserWorkspaceRole) ??
          ("editor" as UserWorkspaceRole),
        requestedAt: new Date(),
      })),
    [pendingRequests]
  );

  const mappedPendingInvites = useMemo(
    () =>
      rawPendingInvites.map(invite => ({
        id: invite.userId,
        name: invite.user
          ? `${invite.user.firstName ?? ""} ${invite.user.lastName ?? ""}`.trim() ||
            invite.user.username ||
            invite.user.email ||
            ""
          : invite.userId,
        email: invite.user?.email ?? "",
        role: invite.role as UserWorkspaceRole,
        invitedAt: new Date(),
      })),
    [rawPendingInvites]
  );

  const handleApproveRequest = async (userId: string) => {
    await approveRoleRequest(userId);
    refetchPendingRequests();
  };

  const handleDenyRequest = async (userId: string) => {
    await rejectRoleRequest(userId);
    refetchPendingRequests();
  };

  const handleSendInvite = async (
    email: string,
    role: UserWorkspaceRole,
    wId: string
  ) => {
    const success = await inviteUser(email, wId, role);
    if (success) {
      toast.success(`Invitation sent to ${email}`);
      refetchInvites();
    } else {
      toast.error("Failed to send invitation");
    }
  };

  const handleCancelInvite = async () => {
    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });
  };

  const onChangeRole = useCallback(
    async (id: string, role: UserWorkspaceRole) => {
      try {
        await updateMemberRole(id, role);
        toast.success("Role updated successfully");
      } catch {
        toast.error("Failed to update role");
      }
    },
    [updateMemberRole]
  );

  const onRemoveUser = useCallback(
    async (id: string) => {
      try {
        await removeUser(id);
        toast.success("User removed from workspace");
      } catch {
        toast.error("Failed to remove user");
      }
    },
    [removeUser]
  );

  return {
    members,
    currentUserRole,
    isMembersLoading,
    isAdmin,
    mappedPendingRequests,
    mappedPendingInvites,
    refetchInvites,
    handleApproveRequest,
    handleDenyRequest,
    handleSendInvite,
    handleCancelInvite,
    onChangeRole,
    onRemoveUser,
    isDeleting,
    deleteError,
    deleteWorkspace,
    ...openRouterModels,
  };
}

// =====================================
// ⬢ Settings Row
// =====================================
function SettingsRow({
  label,
  description,
  action,
  children,
  align = "center",
}: {
  label: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div
      className={`flex ${align === "start" ? "items-start" : "items-center"} justify-between gap-4 py-4`}
    >
      <div className="flex flex-col gap-y-2">
        <label className="block text-md font-bold leading-4 dark:text-white text-ink-100">
          {label}
        </label>
        <p className="text-xs xl:text-sm mt-2 text-[#6C757D] dark:text-ink-400">
          {description}
        </p>
        {action}
      </div>
      <div className="w-[50%]">{children}</div>
    </div>
  );
}

// =====================================
// ⬢ Credit Arc
// =====================================
function CreditArc({ pct }: { pct: number }) {
  const r = 14;
  const cx = 18;
  const cy = 18;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * Math.min(pct, 1);

  return (
    <svg width="36" height="36" className="-rotate-90">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        strokeWidth="3"
        className="stroke-[#E9ECEF] dark:stroke-border-tertiary"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        className="stroke-primary transition-all duration-700"
      />
    </svg>
  );
}

// =====================================
// ⬢ Worskpace Plan
// =====================================
function TeamPlanSection({
  workspaceId,
  credits,
  creditsLoading,
  onClose,
}: {
  workspaceId: string;
  credits: ReturnType<typeof useOpenRouterModels>["credits"];
  creditsLoading: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <SettingsRow
      label="Team plan"
      description="Check your current billing status"
      action={
        <button
          type="button"
          onClick={() => {
            router.push(`/workspace/${workspaceId}/settings/billing`);
            onClose();
          }}
          className="px-2.5 py-1 border border-[#DEE2E6] dark:border-gray-700 dark:text-black bg-[#F8F9FA] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 text-xs"
        >
          Change Plan
        </button>
      }
    >
      <div className="flex w-full justify-between border-b border-border-secondary  pb-2 dark:border-border-tertiary items-center">
        {/* ✦ Plan Badge ✦ */}
        <div>
          <span className="text-[13px] uppercase text-[#6C757D] dark:text-ink-400 font-bold block mb-2.5">
            Current Plan
          </span>
          <div className="font-medium capitalize bg-[#F7E8FF] dark:bg-[#2a1a3a] px-3 py-0.5 rounded-md text-primary inline-block text-sm">
            Free
          </div>
        </div>

        {/* ✦ Credits ✦ */}
        <div>
          <span className="text-[13px] uppercase text-[#6C757D] dark:text-ink-400 font-bold block mb-2.5">
            AI Credits
          </span>
          <div className="flex items-center gap-2 min-h-[2.25rem]">
            {creditsLoading ? (
              <div className="flex items-center gap-2 w-full">
                <div className="h-9 w-9 rounded-full bg-[#F8F9FA] dark:bg-base-100 animate-pulse shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-3.5 w-24 rounded bg-[#F8F9FA] dark:bg-base-100 animate-pulse" />
                  <div className="h-2.5 w-20 rounded bg-[#F8F9FA] dark:bg-base-100 animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                <CreditArc
                  pct={credits ? credits.usedCredits / credits.totalCredits : 0}
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    ${credits ? formatCredit(credits.availableCredits) : "—"}
                    <span className="text-xs font-normal text-[#6C757D] dark:text-ink-400">
                      {" "}
                      / ${credits ? formatCredit(credits.totalCredits) : "—"}
                    </span>
                  </span>
                  <span className="text-[11px] text-[#6C757D] dark:text-ink-400">
                    available (USD)
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SettingsRow>
  );
}

// =====================================
// ⬢ AI Config Section
// =====================================
function AIConfigSection({
  selectedModelId,
  assistantModel,
  onOpenPicker,
}: {
  selectedModelId: string | null;
  assistantModel?: string;
  onOpenPicker: () => void;
}) {
  return (
    <SettingsRow
      label="AI Configuration"
      description="Select the default AI model for your team workspace"
    >
      <div className="text-[13px] uppercase text-[#6C757D] dark:text-ink-400 font-bold block mb-1.5">
        Model
      </div>
      <button
        type="button"
        onClick={onOpenPicker}
        className="flex items-center justify-between w-full rounded-[10px] xl:py-2 py-1.5 pl-4 pr-3 ring-1 ring-inset ring-[#CED4DA] dark:ring-border-tertiary focus:ring-[#A308F0] dark:bg-base-400 text-sm font-medium text-ink-100 dark:text-white transition-colors hover:ring-[#A308F0]/50"
      >
        <span className="text-[#6C757D] dark:text-ink-400">
          {selectedModelId ?? assistantModel}
        </span>
        <svg
          className="w-4 h-4 text-[#6C757D] shrink-0"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </SettingsRow>
  );
}

// =====================================
// ⬢ Workspace Members Section
// =====================================
function MembersSection({
  members,
  currentUserRole,
  isMembersLoading,
  onChangeRole,
  onRemoveUser,
  onInvite,
}: {
  members: ReturnType<typeof useWorkspaceSettings>["members"];
  currentUserRole: string | undefined;
  isMembersLoading: boolean;
  onChangeRole: (id: string, role: UserWorkspaceRole) => Promise<void>;
  onRemoveUser: (id: string) => Promise<void>;
  onInvite: () => void;
}) {
  return (
    <SettingsRow
      label="Members"
      description="Manage access levels for users within this workspace"
      align="start"
    >
      {isMembersLoading ? (
        <div
          className="w-full rounded-xl border border-[#DEE2E6] dark:border-border-tertiary overflow-hidden min-h-[11.5rem]"
          aria-busy="true"
          aria-label="Loading members"
        >
          <div className="h-10 border-b border-[#CED4DA] dark:border-border-tertiary bg-[#F8F9FA]/60 dark:bg-base-100/60 animate-pulse" />
          <div className="h-[4.5rem] border-b border-[#DEE2E6] dark:border-border-tertiary bg-[#F8F9FA]/40 dark:bg-base-100/40 animate-pulse" />
          <div className="h-[4.5rem] bg-[#F8F9FA]/40 dark:bg-base-100/40 animate-pulse" />
        </div>
      ) : (
        <MiniUsersList
          currentUserEmail={
            members.find(m => m.role === currentUserRole)?.email ?? ""
          }
          users={members}
          onRemoveUser={onRemoveUser}
          onChangeRole={onChangeRole}
          onInvite={onInvite}
        />
      )}
    </SettingsRow>
  );
}

// =====================================
// ⬢ Dangerzone Section
// =====================================
function DangerZoneSection({ onDelete }: { onDelete: () => void }) {
  return (
    <SettingsRow label="Delete Workspace" description="Delete this Workspace">
      <h3 className="uppercase mb-2 text-[#6C757D] dark:text-ink-400 font-bold text-[13px]">
        Delete this workspace
      </h3>
      <div className="flex bg-[#FFDBDB] dark:bg-[#2a1a1a] border border-[#CED4DA] dark:border-[#5a2e2e] rounded-xl text-[13px] py-1 px-2 items-center gap-x-5 justify-between">
        <span className="inline-block text-[#ff0000] dark:text-[#ff6b6b]">
          Once deleted, all files, users and data will be permanently lost
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="bg-[#F8F9FA] dark:bg-base-400 text-[12px] py-1 px-2 rounded-lg border border-[#DEE2E6] dark:border-border-tertiary text-[#ff0000] dark:text-[#ff6b6b] font-medium inline-block"
        >
          Delete Workspace
        </button>
      </div>
    </SettingsRow>
  );
}

// =====================================
// ⬢ Settings Header
// =====================================
function SettingsHeader({
  workspace,
  isMembersLoading,
  memberCount,
  pendingRequestsCount,
  pendingInvitesCount,
  onClose,
  onEdit,
  onManageInvites,
}: {
  workspace: NonNullable<WorkspaceSettingsModalProps["workspace"]>;
  isMembersLoading: boolean;
  memberCount: number;
  pendingRequestsCount: number;
  pendingInvitesCount: number;
  onClose: () => void;
  onEdit: () => void;
  onManageInvites: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 pt-12">
      <div>
        <div className="flex gap-x-3 items-center">
          <WorkspaceIcon icon={workspace.icon} />

          <h2 className="text-base font-semibold text-ink-100 dark:text-white capitalize flex items-center gap-2">
            {workspace.name} workspace
            <button
              type="button"
              onClick={onEdit}
              className="p-1 rounded transition-colors"
            >
              <PencilSimple className="h-4 w-4 dark:text-ink-400" />
            </button>
          </h2>

          <div className="w-32 flex items-center justify-center gap-2 text-sm text-[#6C757D] font-medium dark:text-ink-400 border-r border-[#1A1A1A]">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>
              {isMembersLoading ? "..." : memberCount}{" "}
              {memberCount === 1 ? "member" : "members"}
            </span>
          </div>

          <button
            type="button"
            onClick={onManageInvites}
            className="flex items-center gap-2 px-2.5 py-0.5 border bg-[#F8F9FA] border-[#DEE2E6] dark:text-black dark:border-border-tertiary rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            Manage Invites
          </button>

          <span className="text-primary text-[13px] font-medium">
            {pendingRequestsCount} Pending Requests
          </span>
          <span className="text-primary text-[13px] font-medium">
            {pendingInvitesCount} Pending Invites
          </span>
        </div>

        <p className="text-xs xl:text-sm mt-2 text-[#6C757D] dark:text-ink-400">
          Change details about your workspace
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 text-ink-400 hover:bg-gray-100 hover:text-ink-400 dark:hover:bg-gray-800"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

// =====================================
// ⬢ Main Workspace Setting Modal
// =====================================
export default function WorkspaceSettingsModal({
  isOpen,
  onClose,
  workspace,
  updateWorkspace,
  isUpdating,
  _isAdmin,
  isCurrentWorkspace: _isCurrentWorkspace,
  disableCustomAiModelKey: _disableCustomAiModelKey,
}: WorkspaceSettingsModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [cachedWorkspace, setCachedWorkspace] =
    useState<WorkspaceSettingsModalProps["workspace"]>(null);

  useEffect(() => {
    if (workspace) {
      setCachedWorkspace(workspace);
    }
  }, [workspace]);

  const activeWorkspace = workspace ?? cachedWorkspace;
  const showModal = isOpen && !!activeWorkspace;

  const settings = useWorkspaceSettings(activeWorkspace?.id, !!activeWorkspace);
  const {
    members,
    currentUserRole,
    isMembersLoading,
    isAdmin,
    mappedPendingRequests,
    mappedPendingInvites,
    refetchInvites,
    handleApproveRequest,
    handleDenyRequest,
    handleSendInvite,
    handleCancelInvite,
    onChangeRole,
    onRemoveUser,
    isDeleting,
    deleteError,
    deleteWorkspace,
    models,
    loading: modelsLoading,
    error: modelsError,
    selectedModelId,
    isPickerOpen,
    openPicker,
    closePicker,
    selectModel,
    credits,
    creditsLoading,
  } = settings;

  useEffect(() => {
    if (!isOpen) {
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
      setIsInviteModalOpen(false);
      setIsManageOpen(false);
    }
  }, [isOpen]);

  if (!activeWorkspace) return null;

  const handleSave = async ({
    name,
    selectedIcon,
  }: {
    name: string;
    selectedIcon?: string | null;
  }) => {
    if (!isAdmin) {
      toast.error("Only admins can update workspace settings");
      return;
    }
    try {
      await updateWorkspace(
        activeWorkspace.id,
        name.trim(),
        selectedIcon ?? undefined
      );
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update workspace name:", err);
      toast.error("Failed to update team name. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWorkspace(activeWorkspace.id);
      setIsDeleteModalOpen(false);
      onClose();
    } catch (err) {
      toast.error(resolveDeleteError(deleteError));
      console.error("Failed to delete workspace:", err);
    }
  };

  return (
    <Transition
      appear
      show={showModal}
      as={Fragment}
      afterLeave={() => setCachedWorkspace(null)}
    >
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden p-4 sm:p-6">
        {/* ✦ Backdrop ✦ */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-[#0000001A]"
            onClick={onClose}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClose();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close modal"
          />
        </Transition.Child>

        {/* ✦ Panel ✦ */}
        <div className="relative z-10 mx-auto flex h-full w-full min-h-0 max-w-[1500px]">
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="flex h-full w-full min-h-0"
          >
            <div className="relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white  px-20 shadow-none dark:border dark:border-border-tertiary dark:bg-base-400">
              <SettingsHeader
                workspace={activeWorkspace}
                isMembersLoading={isMembersLoading}
                memberCount={members.length}
                pendingRequestsCount={mappedPendingRequests.length}
                pendingInvitesCount={mappedPendingInvites.length}
                onClose={onClose}
                onEdit={() => setIsEditModalOpen(true)}
                onManageInvites={() => setIsManageOpen(true)}
              />

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="space-y-0 px-6 py-4">
                  <TeamPlanSection
                    workspaceId={activeWorkspace.id}
                    credits={credits}
                    creditsLoading={creditsLoading}
                    onClose={onClose}
                  />
                  <AIConfigSection
                    selectedModelId={selectedModelId}
                    assistantModel={activeWorkspace.assistantModel}
                    onOpenPicker={openPicker}
                  />
                  <MembersSection
                    members={members}
                    currentUserRole={currentUserRole ?? undefined}
                    isMembersLoading={isMembersLoading}
                    onChangeRole={onChangeRole}
                    onRemoveUser={onRemoveUser}
                    onInvite={() => setIsInviteModalOpen(true)}
                  />
                </div>

                <div className="mb-20 px-6 py-4">
                  <DangerZoneSection
                    onDelete={() => setIsDeleteModalOpen(true)}
                  />
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>

        {/* ✦ SubModals ✦ */}
        <ManageInviteModal
          isOpen={isManageOpen}
          workspaceId={activeWorkspace.id}
          onClose={() => setIsManageOpen(false)}
          pendingInvites={mappedPendingInvites}
          onCancelInvite={handleCancelInvite}
          pendingRequests={mappedPendingRequests}
          refetchInvite={refetchInvites}
          onApproveRequest={handleApproveRequest}
          onDenyRequest={handleDenyRequest}
        />

        <DeleteWorkspaceModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
          workspaceName={activeWorkspace.name}
          isDeleting={isDeleting}
        />

        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          workspaceName={activeWorkspace.name}
          workspaceId={activeWorkspace.id}
          onInvite={handleSendInvite}
        />

        <EditWorkspaceProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentName={activeWorkspace.name}
          onSave={handleSave}
          isLoading={isUpdating}
        />

        <ModelPickerModal
          isOpen={isPickerOpen}
          onClose={closePicker}
          onSelect={selectModel}
          models={models}
          loading={modelsLoading}
          error={modelsError}
          selectedModelId={selectedModelId}
          title="Select Model"
        />
      </div>
    </Transition>
  );
}
