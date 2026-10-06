import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

type UpgradePlanModalProps = {
  visible: boolean;
  onHide: () => void;
  message: string;
  workspaceId: string;
};

// Shown when the server pauses a query because the workspace's plan doesn't
// include its data source (see PaidPlanRequired in SQLResult).
export default function UpgradePlanModal(props: UpgradePlanModalProps) {
  return (
    <Transition show={props.visible}>
      <Dialog onClose={props.onHide} className="relative z-[1000]">
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-ink-navy">
              <DialogTitle className="text-lg font-semibold">
                Upgrade to run this query
              </DialogTitle>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
                {props.message}
              </p>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
                Your query is paused. Upgrade, then run the block again.
              </p>

              <div className="mt-6 flex justify-end gap-x-3">
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={props.onHide}
                >
                  Not now
                </button>
                <a
                  href={`/workspace/${props.workspaceId}/settings/plan`}
                  className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400"
                >
                  Upgrade plan
                </a>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
