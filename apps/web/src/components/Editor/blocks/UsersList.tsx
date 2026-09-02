"use client";

import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PiUsers } from "react-icons/pi";
import { Avatar } from "@sandworm/ui/components/avatar";

import { Trash } from "@/components/Assets/Trash";
import { StyledCheckbox } from "@/components/StyledCheckbox";
import type { UserWorkspaceRole, WorkspaceUser } from "@/types";

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}
function Badge(props: BadgeProps) {
  return (
    <span
      className={clsx(
        props.className,
        "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium border"
      )}
    >
      {props.children}
    </span>
  );
}

interface UserItemProps {
  user: WorkspaceUser;
  isCurrentUser: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onRemoveUser: (id: string) => void;
  role: UserWorkspaceRole;
}

function UserItem(props: UserItemProps) {
  const onRemoveUser = useCallback(() => {
    props.onRemoveUser(props.user.id);
  }, [props.onRemoveUser, props.user.id]);

  const onToggleSelect = useCallback(() => {
    props.onToggleSelect(props.user.id);
  }, [props.onToggleSelect, props.user.id]);

  const badge = useMemo(() => {
    switch (props.user.role) {
      case "admin":
        return <Badge className="border-0">Admin</Badge>;
      case "editor":
        return <Badge className="border-0">Editor</Badge>;
      case "viewer":
        return <Badge className="border-0">Viewer</Badge>;
      default:
        return null;
    }
  }, [props.user.role]);

  return (
    <tr
      className={clsx(
        "border-b border-border-secondary  dark:border-border-tertiary   transition-colors",
        props.isSelected && ""
      )}
    >
      <td className="whitespace-nowrap p-4">
        <StyledCheckbox
          checked={props.isSelected}
          onChange={onToggleSelect}
          aria-label={`Select ${props.user.name}`}
        />
      </td>
      <td className="whitespace-nowrap p-4 text-sm font-medium text-ink-100 dark:text-white">
        <Avatar />
        <span>{props.user.name}</span>{" "}
        <span className="text-ink-400 dark:text-ink-400 inline-block font-light">
          {props.user.email}
        </span>
      </td>
      <td className="whitespace-nowrap p-4 text-sm text-ink-100">
        <span className="bg-inputBg border border-border dark:bg-[#2E2E2C]  dark:border-border-tertiary rounded-md px-3 py-1">
          {props.user.workspaceName || "—"} workspace
        </span>
      </td>
      <td className="whitespace-nowrap p-4 text-sm text-ink-400 dark:text-ink-400  font-medium">
        {badge}
      </td>
      <td className="whitespace-nowrap p-4 text-sm text-ink-400 dark:text-ink-400  font-medium">
        10 mins ago
      </td>
      <td className="whitespace-nowrap p-4 text-sm font-medium sm:pl-6 lg:pl-8 pr-4 items-end flex w-full">
        <button
          type="button"
          onClick={onRemoveUser}
          disabled={props.isCurrentUser}
          className={clsx(
            "text-left w-full px-3 py-1 text-sm leading-6 block",
            props.isCurrentUser
              ? "text-gray-300 cursor-not-allowed"
              : "text-red-600"
          )}
        >
          <Trash size={18} />
        </button>
      </td>
    </tr>
  );
}

type Props = {
  currentUserEmail: string;
  users: WorkspaceUser[];
  onRemoveUser: (id: string) => void;
  userRole: UserWorkspaceRole;
  searchValue?: string;
  hasActiveFilters?: boolean;
};

function UsersList(props: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const users = useMemo(
    () =>
      props.users.sort((a, b) => {
        if (a.email === props.currentUserEmail) return -1;
        if (b.email === props.currentUserEmail) return 1;
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (b.role === "admin" && a.role !== "admin") return 1;
        if (a.role === "editor" && b.role === "viewer") return -1;
        if (b.role === "editor" && a.role === "viewer") return 1;
        return (a.name ?? "").localeCompare(b.name ?? "");
      }),
    [props.users, props.currentUserEmail]
  );

  const selectableUsers = useMemo(
    () => users.filter(u => u.email !== props.currentUserEmail),
    [users, props.currentUserEmail]
  );

  const allSelected =
    selectedIds.size === selectableUsers.length && selectableUsers.length > 0;
  const someSelected = selectedIds.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(
          users.filter(u => u.email !== props.currentUserEmail).map(u => u.id)
        )
      );
    }
  }, [allSelected, users, props.currentUserEmail]);

  const handleBulkRemove = useCallback(() => {
    selectedIds.forEach(id => {
      const user = users.find(u => u.id === id);
      if (user?.email !== props.currentUserEmail) {
        props.onRemoveUser(id);
      }
    });
    setSelectedIds(new Set());
  }, [selectedIds, users, props.currentUserEmail, props.onRemoveUser]);

  const selectionCount = selectedIds.size;

  return (
    <div className="h-full">
      <div className="overflow-visible">
        <div className="w-full overflow-x-auto dark:border-border-tertiary border-b-0">
          <table className="min-w-full border-collapse">
            <thead className="rounded-t-2xl sticky top-0 z-10 border-b border-border-secondary   dark:border-border-tertiary">
              <tr>
                <th scope="col" className="p-4 w-10">
                  <StyledCheckbox
                    ref={selectAllRef}
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all users"
                  />
                </th>
                <th
                  scope="col"
                  className="text-left p-4 text-xs font-bold text-ink-400 sticky left-0 min-w-[250px] uppercase bg-base-100 dark:bg-page-surface"
                >
                  user
                </th>
                <th
                  scope="col"
                  className="text-left p-4 text-xs font-bold text-ink-400  min-w-[120px] uppercase"
                >
                  workspaces
                </th>
                <th
                  scope="col"
                  className="text-left p-4 text-xs font-bold text-ink-400 min-w-[120px] uppercase"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="text-left p-4 text-xs font-bold text-ink-400  min-w-[120px] uppercase"
                >
                  last active
                </th>
                <th
                  scope="col"
                  className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8"
                >
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <PiUsers
                        size={36}
                        className="text-ink-200 dark:text-ink-600"
                      />
                      <p className="text-sm font-medium text-ink-200 dark:text-ink-400">
                        {props.searchValue
                          ? `No users matching "${props.searchValue}"`
                          : props.hasActiveFilters
                            ? "No users match the selected filters"
                            : "No users found"}
                      </p>
                      <p className="text-xs text-ink-300 dark:text-ink-500">
                        Try adjusting or clearing your filters to see all
                        users.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const isCurrentUser = user.email === props.currentUserEmail;
                  return (
                    <UserItem
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${user.email}-${index}`}
                      user={user}
                      isCurrentUser={isCurrentUser}
                      isSelected={selectedIds.has(user.id)}
                      onToggleSelect={handleToggleSelect}
                      onRemoveUser={props.onRemoveUser}
                      role={props.userRole}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={clsx(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-4 px-3 py-3",
          "bg-base-400 dark:bg-dropdown-bg border border-border-secondary  dark:border-border-tertiary",
          "rounded-[14px]",
          "shadow-lg",
          "transition-all duration-200 ease-out",
          selectionCount > 0
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <span className="text-[13px] text-white/70 whitespace-nowrap">
          <span className="text-white font-medium">{selectionCount}</span>{" "}
          {selectionCount === 1 ? "user" : "users"} selected
        </span>

        <button
          type="button"
          onClick={handleBulkRemove}
          className="flex items-center gap-1.5 text-xs font-medium  transition-colors bg-inputBg rounded-lg px-2 py-1.5 text-ink-500"
        >
          Remove member
        </button>
      </div>
    </div>
  );
}

export default UsersList;
