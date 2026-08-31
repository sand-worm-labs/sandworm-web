import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { IoFilterOutline } from "react-icons/io5";

import { StyledCheckbox } from "@/components/StyledCheckbox";

// =====================================
// ⬢ Types
// =====================================
export interface RoleFilter {
  role: "editor" | "admin" | "viewer";
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
}

// =====================================
// ⬢ User Control
// =====================================
export function UserControl({
  searchValue,
  onSearchChange,
  roleFilters,
  onRoleFilterChange,
  onResetFilters,
}: UserControlProps) {
  const activeFiltersCount = roleFilters.filter(f => f.enabled).length;

  return (
    <div className="space-y-4 max-w-[28rem]">
      {/* ✦ Controls ✦ */}
      <div className="flex items-center gap-3">
        {/* ✦ Search Input ✦ */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-400 " />
          <input
            type="text"
            placeholder="Search Name or email..."
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-16 py-1 h-8  rounded-lg border border-transparent dark:border-border-tertiary dark:bg-base-400  dark:text-white placeholder:dark:text-placeholder-muted  placeholder-[#868E96] focus:outline-none focus:ring focus:ring-primary transition text-xs md:text-sm bg-base-600 placeholder:text-ink-300"
          />
        </div>

        {/* ✦ Filter Popover ✦ */}
        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button className="gap-2 outline-none border-none text-sm bg-transparent text-ink-200 hover:bg-[rgba(177,182,196,0.1)] h-7 flex items-center py-0.5 px-2 rounded-md">
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
                <Popover.Panel className="absolute right-0  mt-2 w-[12rem] origin-top-right rounded-xl border border-border-tertiary  bg-white z-40  shadow-lg focus:outline-none dark:border-border-tertiary dark:bg-dropdown-bg">
                  <div className="p-4 px-2.5">
                    {/* ✦ Header ✦ */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[0.65rem] font-medium uppercase tracking-wider text-ink-400">
                        Roles
                      </span>
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="text-xs font-medium text-primary  hover:text-primary focus:outline-none"
                      >
                        Reset filters
                      </button>
                    </div>

                    {/* ✦ Filter Options ✦ */}
                    <div className="space-y-0">
                      {roleFilters.map(filter => (
                        <div
                          key={filter.role}
                          className="flex items-center gap-1.5 rounded-md p-2 py-1 transition-colors hover:bg-gray-750 dark:hover:bg-gray-750"
                        >
                          <StyledCheckbox
                            checked={filter.enabled}
                            onChange={() =>
                              onRoleFilterChange(filter.role, !filter.enabled)
                            }
                            aria-label={filter.label}
                          />
                          <span className="flex-1 ml-2 text-sm font-medium text-ink-400 dark:text-ink-400">
                            {filter.label}
                          </span>
                          <span className="text-sm text-ink-400  dark:text-ink-400 font-medium">
                            ({filter.count})
                          </span>
                        </div>
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
