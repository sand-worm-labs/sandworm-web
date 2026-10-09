"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useShowcaseTrack } from "@/hooks/useShowcaseTrack";
import { notebookHref } from "@/lib/showcase";
import { cn } from "@/lib/utils";

// =====================================
// ⬢  Case study view
// =====================================
// Fires case_study_view once the visitor's UTM values are known.
export function TrackCaseStudyView({
  category,
  protocol,
}: {
  category: string;
  protocol: string;
}) {
  const { track } = useShowcaseTrack();

  useEffect(() => {
    track("case_study_view", { category, protocol });
  }, [track, category, protocol]);

  return null;
}

// =====================================
// ⬢  Open the notebook
// =====================================
// The link from a Showcase page into the working notebook: the step of the
// funnel between reading a case study and asking it a question.
export function OpenNotebookLink({
  slug,
  category,
  children,
  className,
}: {
  slug: string;
  category: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { track } = useShowcaseTrack();

  return (
    <Link
      href={notebookHref(slug)}
      onClick={() => track("notebook_open", { category, notebook: slug })}
      className={cn(
        "h-9 inline-flex items-center rounded-lg px-4 text-sm font-medium font-body transition-colors",
        className
      )}
    >
      {children}
    </Link>
  );
}
