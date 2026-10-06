"use client";

import { Fragment, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  DialogPanel,
  DialogTitle,
  Dialog,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Check, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import { socialLinks } from "@/data/socialLinks";
import { CloseIconButton } from "@/components/CloseIconButton";
import { tintPillDarkClassName } from "@/styles/interactive";
import {
  GetUserWorkspacesDocument,
  useSimulateWorkspaceUpgradeMutation,
  useStartWorkspaceTrialMutation,
  WorkspacePlan,
} from "@/generated/graphql";

import {
  useCurrentWorkspaceInfo,
  useWorkspaces,
} from "../Editor/hooks/useWorkspaces";

import PlanFaq from "./PlanFaq";

// =====================================
// ⬢ Constants
// =====================================
const DISCORD_URL =
  socialLinks.find(link => link.name === "Discord")?.href ??
  "https://discord.gg/pftQtpcjK2";

// No payment provider is wired up yet, so outside production the Pro CTA opens
// a simulated checkout that upgrades the workspace for real (API enforces it).
const SIMULATED_CHECKOUT = process.env.NODE_ENV !== "production";

// =====================================
// ⬢ Types
// =====================================
type BillingCycle = "monthly" | "annual";
type PlanTier = "TRIAL" | "PRO" | "ENTERPRISE";
type CtaKind = "start" | "wallet" | "discord";

interface PlanOption {
  id: PlanTier;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  priceSuffix: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
  cta: string;
  ctaKind: CtaKind;
}

// =====================================
// ⬢ Data
// Mirrors the WorkspacePlan enum (TRIAL, PRO, ENTERPRISE). FREE is what new
// workspaces start on and isn't offered as a plan — Sandworm is in beta, so
// the entry tier is a Trial the owner starts from here, which is what
// unlocks the paid features (Dune, Sandworm Cloud).
// =====================================
const plans: PlanOption[] = [
  {
    id: "TRIAL",
    name: "Trial",
    tagline: "Full access while Sandworm is in public beta.",
    monthlyPrice: 0,
    annualPrice: 0,
    priceSuffix: "during beta",
    badge: "Beta access",
    features: [
      "1 workspace, up to 3 members",
      "Up to 5 notebooks",
      "250 MB file & image storage",
      "50 AI credits / month via OpenRouter",
      "Manual notebook runs only",
      "Core chains: Base & Ethereum",
      "Sandworm Cloud data, no Dune",
      "Public gist sharing & forking",
      "Community support on Discord",
    ],
    cta: "Start free trial",
    ctaKind: "start",
  },
  {
    id: "PRO",
    name: "Pro",
    tagline: "For teams shipping dashboards and queries daily.",
    monthlyPrice: 29,
    annualPrice: 24,
    priceSuffix: "/ seat / month",
    badge: "Most popular",
    highlight: true,
    features: [
      "Everything in Trial, plus:",
      "Unlimited notebooks",
      "Unlimited team workspaces",
      "10 GB file & image storage",
      "Scheduled notebook runs (hourly to monthly)",
      "All supported chains",
      "Dune data access",
      "CSV, PDF & custom data uploads",
      "500 AI credits / month via OpenRouter",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    ctaKind: "wallet",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    tagline: "For organizations that need scale, security and support.",
    monthlyPrice: null,
    annualPrice: null,
    priceSuffix: "",
    features: [
      "Everything in Pro, plus:",
      "Custom storage limits",
      "Custom cron scheduling & SLA",
      "SSO / SAML",
      "Dedicated infrastructure",
      "Dedicated success manager",
      "Custom AI credit limits",
    ],
    cta: "Contact sales",
    ctaKind: "discord",
  },
];

// =====================================
// ⬢ Billing Toggle
// =====================================
function BillingToggle({
  cycle,
  onChange,
}: {
  cycle: BillingCycle;
  onChange: (nextCycle: BillingCycle) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border-secondary dark:border-border-tertiary bg-base-300/50 dark:bg-[#252524] p-1 shrink-0">
      {(
        [
          { id: "monthly", label: "Monthly" },
          { id: "annual", label: "Annual" },
        ] as const
      ).map(option => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium font-body transition-colors border border-transparent",
            cycle === option.id
              ? `bg-base-400 text-white ${tintPillDarkClassName}`
              : "text-ink-400 hover:text-ink-100 dark:hover:text-white"
          )}
        >
          {option.label}
          {option.id === "annual" && (
            <span
              className={cn(
                "ml-1.5 text-xs",
                cycle === "annual" ? "text-primary-200" : "text-primary"
              )}
            >
              Save 20%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// =====================================
// ⬢ Wallet Payment Modal
// Pay-with-wallet isn't wired up yet — this keeps the CTA honest
// instead of linking somewhere dead.
// =====================================
function WalletPaymentModal({
  isOpen,
  onClose,
  planName,
}: {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[60] flex items-center justify-center"
        onClose={onClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/20" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95 translate-y-1"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-1"
        >
          <DialogPanel className="relative bg-white dark:bg-base-400 dark:border dark:border-border-tertiary rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 font-body">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-base font-medium text-ink-100 dark:text-white">
                Upgrade to {planName}
              </DialogTitle>
              <CloseIconButton size="sm" onClick={onClose} />
            </div>

            <span className="font-medium bg-primary-tint-75 dark:bg-primary-910 px-3 py-0.5 rounded-md text-primary inline-block text-xs mb-4">
              Coming soon
            </span>

            <p className="text-sm text-ink-400 dark:text-ink-400 mb-5">
              Pay-with-wallet is on the way, so you can upgrade straight from a
              connected wallet. Until it ships, message us on Discord and
              we&apos;ll get your workspace upgraded manually.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled
                className="w-full py-2.5 rounded-xl bg-base-300 dark:bg-base-500 text-ink-400 text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect wallet
              </button>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-xl border border-border dark:border-border-tertiary text-ink-100 dark:text-white text-sm font-medium hover:bg-inputBg dark:hover:bg-base-500 transition-colors"
              >
                Message us on Discord
              </a>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

// =====================================
// ⬢ Simulated Checkout Modal
// Dev-only stand-in for a payment provider: the card fields are cosmetic and
// "Pay" just calls the dev upgrade mutation.
// =====================================
function SimulatedCheckoutModal({
  isOpen,
  onClose,
  plan,
  price,
  cycle,
  workspaceId,
}: {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanOption | null;
  price: number | null;
  cycle: BillingCycle;
  workspaceId?: string;
}) {
  const [upgrade, { loading }] = useSimulateWorkspaceUpgradeMutation({
    refetchQueries: [GetUserWorkspacesDocument],
    awaitRefetchQueries: true,
  });

  const handlePay = async () => {
    if (!workspaceId || !plan) return;
    try {
      await upgrade({
        variables: { workspaceId, plan: WorkspacePlan.Pro },
      });
      toast.success(`Payment simulated — workspace upgraded to ${plan.name}`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Simulated payment failed");
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-border dark:border-border-tertiary bg-transparent px-3 py-2 text-sm text-ink-100 dark:text-white outline-none focus:border-primary";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[60] flex items-center justify-center"
        onClose={loading ? () => {} : onClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/20" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95 translate-y-1"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-1"
        >
          <DialogPanel className="relative bg-white dark:bg-base-400 dark:border dark:border-border-tertiary rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 font-body">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-base font-medium text-ink-100 dark:text-white">
                Upgrade to {plan?.name}
              </DialogTitle>
              <CloseIconButton size="sm" onClick={onClose} />
            </div>

            <span className="font-medium bg-primary-tint-75 dark:bg-primary-910 px-3 py-0.5 rounded-md text-primary inline-block text-xs mb-4">
              Test mode — no real charge
            </span>

            <div className="flex items-baseline justify-between mb-4 text-sm text-ink-100 dark:text-white">
              <span>
                {plan?.name} · {cycle === "monthly" ? "Monthly" : "Annual"}
              </span>
              <span className="font-medium">
                ${price} {plan?.priceSuffix}
              </span>
            </div>

            <div className="flex flex-col gap-2 mb-5">
              <input
                className={inputClassName}
                defaultValue="4242 4242 4242 4242"
                aria-label="Card number"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputClassName}
                  defaultValue="12 / 34"
                  aria-label="Expiry"
                />
                <input
                  className={inputClassName}
                  defaultValue="123"
                  aria-label="CVC"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={loading || !workspaceId}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Pay $${price} (simulated)`}
            </button>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

// =====================================
// ⬢ Card CTA
// Routes each plan's action to what it actually does: start the trial, open
// the checkout modal, or reach out on Discord.
// =====================================
type TrialCta = {
  // "available": a free workspace can start it. "included": the workspace is
  // already on a plan that covers it. "pending": plan not loaded yet.
  state: "available" | "included" | "pending";
  loading: boolean;
  onStart: () => void;
};

function CardCta({
  plan,
  onWalletUpgrade,
  trial,
}: {
  plan: PlanOption;
  onWalletUpgrade: () => void;
  trial: TrialCta;
}) {
  const className = cn(
    "w-full text-center rounded-3xl px-4 py-3 text-sm font-medium mb-6 transition-opacity hover:opacity-85 border border-transparent",
    plan.highlight ? "bg-white text-primary" : "bg-base-400 text-white",
    tintPillDarkClassName
  );

  if (plan.ctaKind === "wallet") {
    return (
      <button type="button" onClick={onWalletUpgrade} className={className}>
        {plan.cta}
      </button>
    );
  }

  if (plan.ctaKind === "discord") {
    return (
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {plan.cta}
      </a>
    );
  }

  if (trial.state === "included") {
    return (
      <span className="w-full text-center rounded-3xl px-4 py-3 text-sm font-medium mb-6 cursor-default bg-base-300 dark:bg-base-200 text-ink-400">
        Included in your plan
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={trial.onStart}
      disabled={trial.state === "pending" || trial.loading}
      className={cn(
        className,
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      {trial.loading ? "Starting..." : plan.cta}
    </button>
  );
}

// =====================================
// ⬢ Pricing Card
// =====================================
function PricingCard({
  plan,
  cycle,
  isCurrent,
  onWalletUpgrade,
  trial,
}: {
  plan: PlanOption;
  cycle: BillingCycle;
  isCurrent: boolean;
  onWalletUpgrade: () => void;
  trial: TrialCta;
}) {
  const isCustom = plan.monthlyPrice === null;
  const price = cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;

  return (
    <div
      className={cn(
        "flex flex-col rounded-3xl p-6 border font-body dark:bg-dropdown-bg dark:border-border-tertiary",
        plan.highlight
          ? "bg-primary border-primary text-white"
          : "bg-[#F2F3FB] border-teal/[20%]"
      )}
    >
      <div className="flex items-center justify-between mb-3 min-h-[1.5rem] gap-2">
        <h3
          className={cn(
            "font-medium text-lg",
            plan.highlight ? "text-white" : "text-ink-100 dark:text-white"
          )}
        >
          {plan.name}
        </h3>
        {(isCurrent || plan.badge) && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap border border-transparent",
              plan.highlight
                ? `bg-[#F3F3FA] text-ink-400 ${tintPillDarkClassName}`
                : "bg-primary-tint-75 dark:bg-primary-910 text-primary"
            )}
          >
            {isCurrent ? "Current plan" : plan.badge}
          </span>
        )}
      </div>

      <p
        className={cn(
          "text-sm mb-5 min-h-[2.5rem]",
          plan.highlight ? "text-inputBg" : "text-ink-400"
        )}
      >
        {plan.tagline}
      </p>

      <div className="mb-6">
        {isCustom ? (
          <span
            className={cn(
              "text-3xl font-medium",
              plan.highlight ? "text-white" : "text-ink-100 dark:text-white"
            )}
          >
            Custom
          </span>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-3xl font-medium",
                plan.highlight ? "text-white" : "text-ink-100 dark:text-white"
              )}
            >
              ${price}
            </span>
            <span
              className={cn(
                "text-sm",
                plan.highlight ? "text-inputBg" : "text-ink-400"
              )}
            >
              {plan.priceSuffix}
            </span>
          </div>
        )}
      </div>

      {isCurrent ? (
        <span
          className={cn(
            "w-full text-center rounded-3xl px-4 py-3 text-sm font-medium mb-6 cursor-default",
            plan.highlight
              ? "bg-white/15 text-white"
              : "bg-base-300 dark:bg-base-200 text-ink-400"
          )}
        >
          Current plan
        </span>
      ) : (
        <CardCta plan={plan} onWalletUpgrade={onWalletUpgrade} trial={trial} />
      )}

      <ul className="flex flex-col gap-2.5 mt-auto">
        {plan.features.map(feature => (
          <li
            key={feature}
            className={cn(
              "flex items-start gap-2 text-sm",
              plan.highlight ? "text-white" : "text-ink-200 dark:text-ink-400"
            )}
          >
            <Check
              className={cn(
                "w-4 h-4 mt-0.5 shrink-0",
                plan.highlight ? "text-white" : "text-primary"
              )}
              strokeWidth={2.5}
            />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// =====================================
// ⬢ Plan Settings Main
// =====================================
export default function PlanSettings() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [walletModalPlan, setWalletModalPlan] = useState<PlanOption | null>(
    null
  );
  const params = useParams<{ workspace?: string }>();
  const { workspaceInfo } = useCurrentWorkspaceInfo();
  const [{ data: allWorkspaces }] = useWorkspaces();
  // The URL's workspace is the one being viewed, which may not be the user's
  // currently selected one.
  const workspaceId = params?.workspace ?? workspaceInfo?.id;

  const currentPlan = useMemo(() => {
    const workspace = allWorkspaces?.find(w => w.id === workspaceId);
    return workspace?.plan?.toUpperCase();
  }, [allWorkspaces, workspaceId]);

  const [startTrial, { loading: startingTrial }] =
    useStartWorkspaceTrialMutation({
      refetchQueries: [GetUserWorkspacesDocument],
      awaitRefetchQueries: true,
    });

  const handleStartTrial = async () => {
    if (!workspaceId) return;
    try {
      await startTrial({ variables: { workspaceId } });
      toast.success("Your free trial has started");
    } catch (err: any) {
      toast.error(err?.message || "Couldn't start the trial");
    }
  };

  const trial: TrialCta = {
    state:
      currentPlan === undefined
        ? "pending"
        : currentPlan === "FREE"
          ? "available"
          : "included",
    loading: startingTrial,
    onStart: handleStartTrial,
  };

  return (
    <div className="w-full h-full font-body">
      <div className="px-4 sm:p-6 lg:p-8">
        {/* ✦ Page Header ✦ */}
        <div className="flex md:flex-row flex-col md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-ink-100 dark:text-white mb-2">
              Plan &amp; Billing
            </h3>
            <p className="text-ink-400 dark:text-ink-400 text-sm xl:text-base">
              Sandworm is in public beta — start on a trial and upgrade whenever
              your team is ready to scale.
            </p>
          </div>
          <BillingToggle cycle={cycle} onChange={setCycle} />
        </div>

        {/* ✦ Plans ✦ */}
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(plan => (
            <PricingCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              isCurrent={currentPlan === plan.id}
              onWalletUpgrade={() => setWalletModalPlan(plan)}
              trial={trial}
            />
          ))}
        </div>

        <PlanFaq />
      </div>

      {SIMULATED_CHECKOUT ? (
        <SimulatedCheckoutModal
          isOpen={!!walletModalPlan}
          onClose={() => setWalletModalPlan(null)}
          plan={walletModalPlan}
          price={
            cycle === "monthly"
              ? (walletModalPlan?.monthlyPrice ?? null)
              : (walletModalPlan?.annualPrice ?? null)
          }
          cycle={cycle}
          workspaceId={workspaceId}
        />
      ) : (
        <WalletPaymentModal
          isOpen={!!walletModalPlan}
          onClose={() => setWalletModalPlan(null)}
          planName={walletModalPlan?.name ?? "Pro"}
        />
      )}
    </div>
  );
}
