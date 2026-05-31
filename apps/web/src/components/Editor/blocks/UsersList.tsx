"use client";

import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@sandworm/ui/components/avatar";

import { Trash } from "@/components/Assets/Trash";
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
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded-2xl border-[#D0D5DD] text-[#7F56D9] focus:border-[#7F56D9] cursor-pointer"
        />
      </td>
      <td className="whitespace-nowrap p-4 text-sm font-medium text-[#1A1A1A] dark:text-white">
        <Avatar />
        <span>{props.user.name}</span>{" "}
        <span className="text-[#6C757D] dark:text-ink-400 inline-block font-light">
          {props.user.email}
        </span>
      </td>
      <td className="whitespace-nowrap p-4 text-sm text-ink-100">
        <span className="bg-[#F8F9FA] border border-[#DEE2E6] dark:bg-base-100  dark:border-border-tertiary rounded-md px-3 py-1">
          {props.user.workspaceName || "—"} workspace
        </span>
      </td>
      <td className="whitespace-nowrap p-4 text-sm text-[#6C757D] dark:text-ink-400  font-medium">
        {badge}
      </td>
      <td className="whitespace-nowrap p-4 text-sm text-[#6C757D] dark:text-ink-400  font-medium">
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
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded-2xl border-[#D0D5DD]  dark:border-border-tertiary text-[#7F56D9] focus:border-[#7F56D9] cursor-pointer"
                  />
                </th>
                <th
                  scope="col"
                  className="text-left p-4 text-xs font-bold text-ink-400 sticky left-0 min-w-[250px] uppercase bg-base-100"
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
              {users.map((user, index) => {
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={clsx(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-4 px-3 py-3",
          "bg-[#0F0F0F] dark:bg-[#1A1D21] border border-border-secondary  dark:border-border-tertiary",
          "rounded-[14px]",
          "transition-all duration-200 ease-out",
          selectionCount > 0
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <span className="text-[13px] text-[#F8F9FA] dark:text-ink-300 whitespace-nowrap">
          <span className=" text-[#F8F9FA] dark:text-white">
            {selectionCount}
          </span>{" "}
          {selectionCount === 1 ? "user" : "users"} selected
        </span>

        <button
          type="button"
          onClick={handleBulkRemove}
          className="flex items-center gap-1.5 text-xs font-medium  transition-colors bg-[#F8F9FA] rounded-lg px-2 py-1.5 text-[#343A40]"
        >
          Remove member
        </button>
      </div>
    </div>
  );
}

export default UsersList;
