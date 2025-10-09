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
    <div className="flex flex-col w-full pt-8 px-4">
      <div className="relative w-full mb-6">
        <div className="h-1 bg-black rounded-full w-full absolute top-1/2 -translate-y-1/2" />

        <div
          className="h-1 bg-rainbow-gradient rounded-full absolute top-1/2 -translate-y-1/2 left-0 transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
        />
      </div>

      <div className="flex justify-between w-full px-3 roobert">
        {steps.map((step, index) => (
          <Link
            key={step.name}
            href={step.href}
            className={`text-center flex items-center flex-1 ${
              index <= currentStep ? "text-[#C7665C]" : "text-black"
            }`}
          >
            <span>{index + 1}. &nbsp;</span>
            <span
              className={` text-center ${
                index <= currentStep ? "text-[#C7665C]" : "text-black"
              }`}
            >
              {step.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
