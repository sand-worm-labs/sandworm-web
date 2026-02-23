"use client";

import clsx from "clsx";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Avatar } from "@sandworm/ui/components/avatar";
import { PlusIcon } from "lucide-react";

import type { UserWorkspaceRole, WorkspaceUser } from "@/types";

const ROLES: {
  value: UserWorkspaceRole;
  label: string;
  description: string;
}[] = [
  { value: "admin", label: "Owner", description: "Full access and billing" },
  {
    value: "editor",
    label: "Editor",
    description: "Edit access to files in the workspace",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to the files in the workspace",
  },
];

interface RoleDropdownProps {
  role: UserWorkspaceRole;
  onChange: (role: UserWorkspaceRole) => void;
  disabled?: boolean;
}
function RoleDropdown({ role, onChange, disabled }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = ROLES.find(r => r.value === role);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={clsx(
          "flex items-center gap-1.5 px-3 py-0.5 rounded-lg border text-sm font-medium transition-colors min-w-[70px]",
          "border-[#DEE2E6] dark:border-[#262A30]",
          "bg-[#F8F9FA] dark:bg-[#1A1D21]",
          "text-[#343A40] dark:text-white",
          "hover:bg-[#F8F9FA] dark:hover:bg-[#262A30]",
          disabled && " cursor-not-allowed"
        )}
      >
        {current?.label ?? "—"}
        <svg
          className={clsx(
            "w-4 h-3.5 text-[#1C3B5A] transition-transform",
            open && "rotate-180"
          )}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className={clsx(
            "absolute right-0 mt-1 w-52 z-50",
            "bg-white dark:bg-[#1A1D21]",
            "border border-[#E9ECEF] dark:border-[#262A30]",
            "rounded-xl shadow-lg py-1"
          )}
        >
          {ROLES.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => {
                onChange(r.value);
                setOpen(false);
              }}
              className={clsx(
                "w-full text-left px-3 py-2.5 hover:bg-[#F8F9FA] dark:hover:bg-[#262A30] transition-colors",
                r.value === role && "bg-[#F8F9FA] dark:bg-[#262A30]"
              )}
            >
              <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">
                {r.label}
              </p>
              <p className="text-xs text-[#6C757D] mt-0.5">{r.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MiniUserItemProps {
  user: WorkspaceUser;
  isCurrentUser: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onChangeRole: (id: string, role: UserWorkspaceRole) => void;
}
function MiniUserItem({
  user,
  isCurrentUser,
  isSelected,
  onToggleSelect,
  onChangeRole,
}: MiniUserItemProps) {
  const handleRoleChange = useCallback(
    (role: UserWorkspaceRole) => onChangeRole(user.id, role),
    [onChangeRole, user.id]
  );

  const handleToggle = useCallback(
    () => onToggleSelect(user.id),
    [onToggleSelect, user.id]
  );

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-[#DEE2E6] dark:border-[#262A30] last:border-0">
      <Avatar />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1A1A] dark:text-white truncate">
          {user.firstName} {user.lastName}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs font-normal text-[#6C757D]">
              (you)
            </span>
          )}
        </p>
        <p className="text-xs text-[#6C757D] truncate">{user.email}</p>
      </div>
      <RoleDropdown
        role={user.role}
        onChange={handleRoleChange}
        disabled={isCurrentUser}
      />
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleToggle}
        className="
    h-4 w-4
    rounded-[5px]
    border-[1.5px] border-[#D0D5DD]
    appearance-none
    checked:bg-[#7F56D9]
    checked:border-[#7F56D9]
    focus:outline-none
    focus:ring-2 focus:ring-[#7F56D9]
    cursor-pointer
  "
      />
    </div>
  );
}

type MiniUsersListProps = {
  currentUserEmail: string;
  users: WorkspaceUser[];
  onChangeRole: (id: string, role: UserWorkspaceRole) => void;
  onRemoveUser: (id: string) => void;
  onInvite?: () => void;
  onViewAll?: () => void;
};

export function MiniUsersList({
  currentUserEmail,
  users,
  onChangeRole,
  onRemoveUser,
  onInvite,
  onViewAll,
}: MiniUsersListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sorted = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.email === currentUserEmail) return -1;
        if (b.email === currentUserEmail) return 1;
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (b.role === "admin" && a.role !== "admin") return 1;
        return (a.name ?? "").localeCompare(b.name ?? "");
      }),
    [users, currentUserEmail]
  );

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleBulkRemove = useCallback(() => {
    selectedIds.forEach(id => onRemoveUser(id));
    setSelectedIds(new Set());
  }, [selectedIds, onRemoveUser]);

  const selectionCount = selectedIds.size;

  return (
    <div className="relative w-full">
      <div className="rounded-xl border border-[#DEE2E6] dark:border-[#262A30] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#CED4DA] dark:border-[#262A30]">
          <span className="text-sm font-medium text-[#6C757D] dark:text-white">
            {users.length} member{users.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3">
            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="text-xs text-[#A308F0] hover:underline font-medium"
              >
                View all members
              </button>
            )}
            {onInvite && (
              <button
                type="button"
                onClick={onInvite}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium",
                  "bg-[#F8F9FA] dark:bg-[#1A1D21] border border-[#DEE2E6] dark:border-[#262A30]",
                  "text-[#A308F0] dark:text-white hover:bg-[#F8F9FA] dark:hover:bg-[#262A30] transition-colors"
                )}
              >
                <span className="text-base leading-none inline-block mr-0.5"><PlusIcon className="w-4 h-4"/></span> Invite
              </button>
            )}
          </div>
        </div>

        {/* User rows */}
        {sorted.map(user => (
          <MiniUserItem
            key={user.id}
            user={user}
            isCurrentUser={user.email === currentUserEmail}
            isSelected={selectedIds.has(user.id)}
            onToggleSelect={handleToggleSelect}
            onChangeRole={onChangeRole}
          />
        ))}
      </div>

      {/* Bulk action bar */}
      <div
        className={clsx(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-4 px-3 py-3",
          "bg-[#0F0F0F] dark:bg-[#1A1D21] border border-[#E9ECEF] dark:border-[#262A30]",
          "rounded-[14px] transition-all duration-200 ease-out",
          selectionCount > 0
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <span className="text-[13px] text-[#F8F9FA] whitespace-nowrap">
          <span className="text-white">{selectionCount}</span>{" "}
          {selectionCount === 1 ? "user" : "users"} selected
        </span>
        <button
          type="button"
          onClick={handleBulkRemove}
          className="flex items-center gap-1.5 text-xs font-medium bg-[#F8F9FA] rounded-lg px-2 py-1.5 text-[#343A40] transition-colors"
        >
          Remove member
        </button>
      </div>
    </div>
  );
}

export default MiniUsersList;
