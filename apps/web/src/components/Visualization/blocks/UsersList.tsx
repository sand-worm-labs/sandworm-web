import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { Fragment, useCallback, useMemo } from "react";
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
  onRemoveUser: (id: string) => void;
  onChangeRole: (id: string, role: UserWorkspaceRole) => void;
  onResetPassword: (id: string) => void;
  role: UserWorkspaceRole;
}
function UserItem(props: UserItemProps) {
  const onMakeAdmin = useCallback(() => {
    props.onChangeRole(props.user.id, "admin");
  }, [props.onChangeRole, props.user.id]);

  const onMakeEditor = useCallback(() => {
    props.onChangeRole(props.user.id, "editor");
  }, [props.onChangeRole, props.user.id]);

  const onMakeViewer = useCallback(() => {
    props.onChangeRole(props.user.id, "viewer");
  }, [props.onChangeRole, props.user.id]);

  const onRemoveUser = useCallback(() => {
    props.onRemoveUser(props.user.id);
  }, [props.onRemoveUser, props.user.id]);

  console.log("Rendering UserItem for user:", props.user.role);

  console.log(props, "gg");

  const badge = useMemo(() => {
    switch (props.user.role) {
      case "admin":
        return <Badge className=" border-0">Admin</Badge>;
      case "editor":
        return <Badge className=" border-0">Editor</Badge>;
      case "viewer":
        return <Badge className=" border-0">Viewer</Badge>;
      default:
        return null;
    }
  }, [props.user.role]);

  const roleHandlers: Record<string, () => void> = {
    admin: onMakeAdmin,
    editor: onMakeEditor,
    viewer: onMakeViewer,
  };

  const promotions = useMemo(() => {
    return ["admin", "editor", "viewer"]
      .filter(role => role !== props.user.role)
      .map(role => (
        <Menu.Item key={role}>
          {({ active }) => {
            const onClick = roleHandlers[role];

            return (
              <button
                type="button"
                onClick={onClick}
                className={clsx(
                  active ? "bg-gray-50" : "",
                  "text-gray-700 hover:text-gray-900 cursor-pointer",
                  "text-left w-full px-3 py-1 text-sm leading-6 block"
                )}
              >
                Make {role}
                <span className="sr-only">, {props.user.name}</span>
              </button>
            );
          }}
        </Menu.Item>
      ));
  }, [props.user.role]);

  const onResetPassword = useCallback(() => {
    props.onResetPassword(props.user.id);
  }, [props.onResetPassword, props.user.id]);

  return (
    <tr className="border-b border-[#E9ECEF] dark:border-[#262A30] hover:bg-gray-50 dark:hover:bg-[#0D0F12] transition-colors">
      <td className="whitespace-nowrap p-4 text-sm font-medium text-[#1A1A1A] dark:text-white">
        <Avatar />
        <span>{props.user.name}</span>{" "}
        <span className="text-[#6C757D] inline-block font-light">
          {" "}
          {props.user.email}
        </span>
      </td>
      <td className="whitespace-nowrap p-4  text-sm text-ink-100">
        <span className="bg-[#F8F9FA] border border-[#DEE2E6] rounded-md px-3 py-1">
          workspace
        </span>
      </td>
      <td className="whitespace-nowrap p-4  text-sm text-[#6C757D] font-medium">
        {badge}
      </td>
      <td className="whitespace-nowrap p-4  text-sm text-[#6C757D] font-medium">
        10 mins ago
      </td>
      <td className="whitespace-nowrap p-4  text-sm font-medium sm:pl-6 lg:pl-8 pr-4 items-end flex w-full">
        {/*  <Menu as="div" className="flex items-center justify-end relative">
          <Menu.Button
            as="span"
            className={
              props.role !== "admin"
                ? "hover:cursor-not-allowed"
                : "hover:cursor-pointer hover:text-gray-900"
            }
            disabled={props.role !== "admin"}
          >
            <EllipsisVerticalIcon
              className="h-5 w-5 text-gray-400 "
              aria-hidden="true"
            />
            <span className="sr-only">Options for {props.user.name}</span>

            {props.isCurrentUser && props.role === "admin" && (
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute text-left right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none hover:cursor-default">
                  {promotions}

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={onRemoveUser}
                        className={clsx(
                          active ? "bg-gray-50 cursor-pointer" : "",
                          "text-left w-full px-3 py-1 text-sm leading-6 text-red-600 block"
                        )}
                      >
                        Remove
                        <span className="sr-only">, {props.user.name}</span>
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            )}
          </Menu.Button>
        </Menu> */}

        <button
          type="button"
          onClick={onRemoveUser}
          className="
                          text-left w-full px-3 py-1 text-sm leading-6 text-red-600 block"
        >
          <Trash />
        </button>
      </td>
    </tr>
  );
}

type Props = {
  currentUserEmail: string;
  users: WorkspaceUser[];
  onRemoveUser: (id: string) => void;
  onChangeRole: (id: string, role: UserWorkspaceRole) => void;
  onResetPassword: (id: string) => void;
  role: UserWorkspaceRole;
};
function UsersList(props: Props) {
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

  console.log(
    "Rendering UsersList with users:",
    props.currentUserEmail,
    props.users
  );

  return (
    <div className="h-full">
      <div className="overflow-visible">
        <div className="w-full overflow-x-auto dark:border-[#262A30] border-b-0">
          <table className="min-w-full border-collapse ">
            <thead className="  rounded-t-2xl  sticky top-0 z-10 border-b border-[#E9ECEF]">
              <tr>
                <th
                  scope="col"
                  className="text-left p-4 text-xs font-bold text-ink-400 dark:text-ink-300  sticky left-0  min-w-[250px] uppercase"
                >
                  user
                </th>
                <th
                  scope="col"
                  className="text-left p-4 text-xs font-bold text-ink-400 dark:text-ink-300  min-w-[120px] uppercase"
                >
                  workspaces
                </th>
                <th
                  scope="col"
                  className="text-left p-4 text-xs font-bold text-ink-400 dark:text-ink-300  min-w-[120px] uppercase"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="text-left p-4 text-xs font-bold text-ink-400 dark:text-ink-300  min-w-[120px] uppercase"
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
              {users.map(user => {
                const isCurrentUser = user.email === props.currentUserEmail;

                return (
                  <UserItem
                    key={user.email}
                    user={user}
                    isCurrentUser={isCurrentUser}
                    onRemoveUser={props.onRemoveUser}
                    onChangeRole={props.onChangeRole}
                    onResetPassword={props.onResetPassword}
                    role={props.role}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UsersList;
