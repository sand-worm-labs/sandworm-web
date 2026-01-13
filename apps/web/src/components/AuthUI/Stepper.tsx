"use client";

import React from "react";
import Link from "next/link";

interface Step {
  name: string;
  href: string;
  completed?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full pt-6 px-6">
      <div className="flex gap-12 font-primary">
        {steps.map((step, index) => {
          const active = index === currentStep;
          return (
            <Link key={step.name} href={step.href} className="group">
              <div
                className={`mt-2 h-[2.5px] w-32 rounded-full mb-2 ${
                  active
                    ? "bg-rainbow-gradient"
                    : "dark:bg-[#E9ECEF] bg-[#1A1A1A] "
                }`}
              />
              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-70 text-muted-foreground">
                  {index + 1}.
                </span>
                <span
                  className={`${active ? "text-[#A308F0]" : "text-muted-foreground"}`}
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
