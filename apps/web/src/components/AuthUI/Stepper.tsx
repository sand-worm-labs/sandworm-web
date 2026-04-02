"use client";

import React from "react";
import Link from "next/link";

// =====================================
// ⬢ Types
// =====================================
interface Step {
  name: string;
  href: string;
  completed?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

// =====================================
// ⬢ Stepper
// =====================================
export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full pt-6 px-6">
      <div className="flex gap-12 font-body ">
        {steps.map((step, index) => {
          const active = index === currentStep;
          return (
            <Link key={step.name} href={step.href} className="group">
              <div
                className={`mt-2 h-[2.5px] w-40 rounded-full mb-2 ${
                  active
                    ? "bg-rainbow-gradient"
                    : "dark:bg-[#E9ECEF] bg-[#E9ECEF] "
                }`}
              />
              <div className="flex items-center gap-2 text-sm px-1">
                <span
                  className={`${active ? "text-ink-200" : "text-ink-300 "}`}
                >
                  {index + 1}.
                </span>
                <span
                  className={`${active ? "text-ink-200" : "text-ink-300 "}`}
                >
                  {step.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
