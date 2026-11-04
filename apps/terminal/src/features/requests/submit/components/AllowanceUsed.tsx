import type { IconType } from "react-icons";
import { PiCaretRight, PiNotePencil, PiPlus } from "react-icons/pi";

import { AppLink } from "@/components/AppLink";
import { buttonClassName } from "@/components/Button";
import type { RouteId } from "@/config/routes";
import { site } from "@/config/site";

import type { Allowance } from "../../types";

import { AllowancePips } from "./AllowancePips";

type Option = {
  id: string;
  route: RouteId;
  Icon: IconType;
  iconClassName: string;
  title: string;
  detail: string;
};

function options(allowance: Allowance): Option[] {
  return [
    {
      id: "add-more",
      route: "contact",
      Icon: PiPlus,
      iconClassName:
        "bg-primary-tint-75 text-primary-700 dark:bg-primary-910 dark:text-primary-200",
      title: "Add more to your plan",
      detail: "Add studies to this quarter or move to a bigger plan.",
    },
    {
      id: "save-draft",
      route: "requests",
      Icon: PiNotePencil,
      iconClassName: "bg-hover-bg text-ink-500",
      title: `Save it for ${allowance.resetsMonth}`,
      detail: `We'll keep your draft and send it to ${site.name} on ${allowance.resetsShort}.`,
    },
  ];
}

export function AllowanceUsed({ allowance }: { allowance: Allowance }) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2.5 px-8 pb-2 pt-6">
        <h2 className="text-xl font-medium text-ink-100">
          You&apos;ve used this quarter&apos;s research
        </h2>
        <p className="text-sm leading-[1.55] text-ink-500">
          All {allowance.research.total} research requests in your plan are in
          progress or delivered. Your allowance resets on {allowance.resetsOn}.
        </p>
      </div>
      <div className="mx-8 mt-2">
        <AllowancePips
          used={allowance.research.used}
          total={allowance.research.total}
          note={`Resets ${allowance.resetsShort}`}
        />
      </div>
      <div className="flex flex-col gap-2.5 px-8 pb-2 pt-5">
        <span className="font-medium text-ink-100">What you can do now</span>
        {options(allowance).map(option => (
          <AppLink
            key={option.id}
            route={option.route}
            className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[14px] border border-hover-border bg-block-surface px-4 py-3.5 transition-colors hover:bg-primary-tint-50 dark:hover:bg-dropdown-hover"
          >
            <span
              aria-hidden="true"
              className={`flex size-9 items-center justify-center rounded-[10px] ${option.iconClassName}`}
            >
              <option.Icon size={16} />
            </span>
            <span className="flex flex-col">
              <span className="font-medium text-ink-100">{option.title}</span>
              <span className="text-xs text-ink-400">{option.detail}</span>
            </span>
            <PiCaretRight
              size={12}
              aria-hidden="true"
              className="text-ink-400"
            />
          </AppLink>
        ))}
      </div>
      <div className="mt-4 flex justify-end border-t border-border-secondary px-6 py-3.5">
        <AppLink
          route="requests"
          className={buttonClassName({ variant: "secondary" })}
        >
          Close
        </AppLink>
      </div>
    </div>
  );
}
