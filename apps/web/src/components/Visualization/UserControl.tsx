import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { IoFilterOutline } from "react-icons/io5";

export interface RoleFilter {
  role: "admin" | "manager" | "editor" | "viewer" | "guest";
  label: string;
  count: number;
  enabled: boolean;
}

interface UserControlProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  roleFilters: RoleFilter[];
  onRoleFilterChange: (role: string, enabled: boolean) => void;
  onResetFilters: () => void;
  totalUsers: number;
}

export function UserControl({
  searchValue,
  onSearchChange,
  roleFilters,
  onRoleFilterChange,
  onResetFilters,
  totalUsers,
}: UserControlProps) {
  const activeFiltersCount = roleFilters.filter(f => f.enabled).length;

  return (
    <div className="space-y-4 max-w-[28rem]">
      {/* Header */}
      <h2 className="text-base font-medium text-[#050818] dark:text-gray-100">
        Users ({totalUsers})
      </h2>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Name or email..."
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-16 py-1 h-8  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none focus:ring focus:ring-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4]"
          />
        </div>

        {/* Filter Popover */}
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button className="gap-2 outline-none border-none text-sm bg-transparent text-[#717a94] hover:bg-[rgba(177,182,196,0.1)] h-7 flex items-center py-0.5 px-2 rounded-md">
                <IoFilterOutline className="w-4 h-4" />
                <span>
                  Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </Popover.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Popover.Panel className="absolute right-0  mt-2 w-40 origin-top-right rounded-xl border border-[#CED4DA]  bg-white z-40  shadow-lg focus:outline-none dark:border-gray-600 dark:bg-gray-800">
                  <div className="p-4">
                    {/* Header */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[0.65rem] font-medium uppercase tracking-wider text-gray-400">
                        Roles
                      </span>
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="text-xs font-medium text-[#C7665C]  hover:text-[#C7665C] focus:outline-none"
                      >
                        Reset filters
                      </button>
                    </div>

                    {/* Filter Options */}
                    <div className="space-y-0">
                      {roleFilters.map(filter => (
                        <label
                          key={filter.role}
                          className="flex cursor-pointer items-center gap-1.5 rounded-md p-2 py-1 transition-colors hover:bg-gray-750 dark:hover:bg-gray-750"
                        >
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={filter.enabled}
                              onChange={e =>
                                onRoleFilterChange(
                                  filter.role,
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 cursor-pointer appearance-none rounded border-2 border-[#CED4DA] bg-white transition-colors checked:border-[#C7665C] checked:bg-[#C7665C] focus:outline-none focus:ring-2 focus:ring-[#C7665C] focus:ring-offset-2 focus:ring-none dark:border-gray-500 dark:bg-gray-700"
                            />
                            {filter.enabled && (
                              <svg
                                className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="flex-1 text-sm font-medium text-[#455768] dark:text-gray-100">
                            {filter.label}
                          </span>
                          <span className="text-sm text-gray-400 dark:text-gray-400">
                            ({filter.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  );
}
