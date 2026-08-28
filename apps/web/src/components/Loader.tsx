"use client";

import React from "react";

import RotatingGradientRing from "@/components/Chats/RotatingGradientRing";

type LoaderProps = {
  variant?: "ring" | "bar";
};

export const Loader = ({ variant = "bar" }: LoaderProps) => {
  if (variant === "bar") {
    return <div className="bar-loader" />;
  }

  return <RotatingGradientRing variant="page" />;
};
