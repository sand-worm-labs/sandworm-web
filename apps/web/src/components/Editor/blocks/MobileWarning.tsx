import { Fragment, useState } from "react";
import {
  DialogPanel,
  DialogTitle,
  Dialog,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import { ScheduleIcon } from "@/components/Assets/ScheduleIcon";

export default function MobileWarning() {
  const [open, setOpen] = useState(window.innerWidth < 768);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog className="relative z-[99999]" onClose={setOpen}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#161633] transition-opacity bg-opacity-20" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-base-100 px-4 pb-4 pt-5 text-left border transition-all my-auto font-body border-border-tertiary shadow-xl">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/[12.5%]">
                    <ScheduleIcon />
                  </div>
                  <div className="mt-4 text-center sm:mt-5">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold leading-6 text-ink-100"
                    >
                      Sandworm works best on desktop
                    </DialogTitle>
                    <div className="mt-4 text-sm text-ink-400  flex flex-col gap-y-4">
                      <p>
                        Hey there! We love mobile too, but sandworm works best
                        on desktop resolutions.
                      </p>
                      <p>
                        It&apos;s a bit cramped in here, so we recommend you
                        switch to a larger screen for the best experience.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="rounded-xl  border border-primary-400 text-white inline-flex w-full justify-center dark:bg-white dark:text-black px-3 py-2.5 text-sm font-semibold shadow-sm hover:bg-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 bg-base-400 "
                    onClick={() => setOpen(false)}
                  >
                    I want to stay on mobile
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
