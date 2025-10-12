"use client";

import React from "react";
import Link from "next/link";

interface Step {
  name: string;
  href: string; // this is temporary and would be removed once nav logic is implemented
  completed?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full pt-6 px-6">
      <div className="flex gap-12 roobert">
        {steps.map((step, index) => {
          const active = index === currentStep;
          return (
            <Link key={step.name} href={step.href} className="group">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`opacity-70 ${active ? "text-[#6C757D]" : "text-[#6C757D]"}`}
                >
                  {index + 1}.
                </span>
                <span
                  className={`${active ? "text-[#1A1A1A]" : "text-[#6C757D]"}`}
                >
                  {step.name}
                </span>
              </div>
              <div
                className={`mt-2 h-[2px] w-32 rounded-full ${
                  active ? "bg-rainbow-gradient" : "bg-[#E9ECEF]"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
