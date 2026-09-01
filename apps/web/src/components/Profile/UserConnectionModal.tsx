import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import { CloseIconButton } from "@/components/CloseIconButton";
import type { FollowUser } from "@/components/Editor/hooks/useUser";
import {
  useUserFollowers,
  useUserFollowing,
} from "@/components/Editor/hooks/useUser";

// =====================================
// ⬢ Types
// =====================================
export interface UserConnectionsListProps {
  userId: string;
  type: "followers" | "following";
  emptyMessage?: string;
  maxHeight?: string;
  onUserClick?: (user: FollowUser) => void;
  workspaceId: string;
}

export interface UserConnectionsModalProps
  extends Omit<UserConnectionsListProps, "maxHeight"> {
  open: boolean;
  onClose: () => void;
  title?: string;
}

// =====================================
// ⬢ List
// =====================================
export const UserConnectionsList = ({
  userId,
  type,
  emptyMessage,
  maxHeight = "320px",
  onUserClick,
  workspaceId,
}: UserConnectionsListProps) => {
  const followers = useUserFollowers({ userId, skip: type !== "followers" });
  const following = useUserFollowing({ userId, skip: type !== "following" });

  const { users, loading, error } =
    type === "followers"
      ? {
          users: followers.followers,
          loading: followers.loading,
          error: followers.error,
        }
      : {
          users: following.following,
          loading: following.loading,
          error: following.error,
        };

  const defaultEmpty =
    type === "followers" ? "No followers yet." : "Not following anyone yet.";

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-3" style={{ maxHeight }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex-1 h-3 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600 dark:text-red-400">
        Failed to load {type}.
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-6 text-sm text-neutral-500 dark:text-neutral-400 text-center">
        {emptyMessage ?? defaultEmpty}
      </div>
    );
  }

  return (
    <ul
      className="flex flex-col overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800"
      style={{ maxHeight }}
    >
      {users.map(user => (
        <li key={user.id}>
          <UserRow
            user={user}
            workspaceId={workspaceId}
            onClick={onUserClick}
          />
        </li>
      ))}
    </ul>
  );
};

// =====================================
// ⬢ Modal
// =====================================
export const UserConnectionsModal = ({
  open,
  onClose,
  title,
  type,
  ...listProps
}: UserConnectionsModalProps) => {
  const defaultTitle = type === "followers" ? "Followers" : "Following";

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/[10.2%]" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto font-body">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md rounded-2xl bg-white dark:bg-base-200  border border-border-secondary overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                  <DialogTitle className="text-sm font-semibold mt-3">
                    {title ?? defaultTitle}
                  </DialogTitle>
                  <CloseIconButton onClick={onClose} />
                </div>
                <UserConnectionsList
                  type={type}
                  maxHeight="60vh"
                  {...listProps}
                />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// =====================================
// ⬢ Row
// =====================================
interface UserRowProps {
  user: FollowUser;
  onClick?: (user: FollowUser) => void;
  workspaceId: string;
}

const UserRow = ({ user, workspaceId, onClick }: UserRowProps) => {
  const content = (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
      <Avatar src={user.avater} name={user.firstName || user.username || ""} />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate">
          {user.firstName || user.username}
        </span>
        {user.firstName && (
          <span className="text-xs text-neutral-500 truncate">
            @{user.username}
          </span>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(user)}
        className="w-full text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={`/workspace/${workspaceId}/profile/${user.id}`}>{content}</Link>
  );
};

// =====================================
// ⬢ Avatar
// =====================================
const Avatar = ({ src, name }: { src?: string | null; name: string }) => {
  const initial = name.charAt(0).toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={32}
        height={32}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-medium flex-shrink-0">
      {initial}
    </div>
  );
};
