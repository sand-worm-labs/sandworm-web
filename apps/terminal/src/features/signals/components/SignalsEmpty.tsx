import { PiClockCountdown } from "react-icons/pi";
import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";

import { AppLink } from "@/components/AppLink";
import { site } from "@/config/site";

export function SignalsEmpty() {
  return (
    <Card
      aria-labelledby="signals-empty"
      className="flex flex-col items-center gap-3.5 px-8 pb-[72px] pt-16 text-center"
    >
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-primary-tint-75 text-primary-700 dark:bg-primary-910 dark:text-primary-200"
      >
        <PiClockCountdown size={28} />
      </span>
      <h2 id="signals-empty" className="text-xl font-medium text-ink-100">
        No signals yet
      </h2>
      <p className="max-w-[480px] text-sm leading-[1.55] text-ink-500">
        Signals usually appear 2 to 3 weeks after setup, once {site.name} has a
        full picture of your numbers. Each one says what we saw, what it could
        mean and how strong the evidence is.
      </p>
      <div className="mt-1.5 flex flex-wrap justify-center gap-2">
        <AppLink
          route="signal"
          className={buttonClassName({ variant: "secondary" })}
        >
          See a sample signal
        </AppLink>
        <AppLink route="newRequest" className={buttonClassName()}>
          Submit a request
        </AppLink>
      </div>
    </Card>
  );
}
