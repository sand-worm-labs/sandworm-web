"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Heading } from "@/components/EmptyState/Heading";

interface ActionButton {
  label: string;
  onClick: () => void;
}

interface QuickLink {
  label: string;
  href: string;
}

interface EmptyStateProps {
  heading: string;
  title?: string;
  subtitle?: string;
  showReset?: boolean;
  label?: string;
  reset?: () => void;
  imageSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  showRefresh?: boolean;
  showGoBack?: boolean;
  showReportBug?: boolean;
  showTwitterUpdates?: boolean;
  customActions?: ActionButton[];
  quickLinks?: QuickLink[];
  onRefresh?: () => void;
  onReportBug?: () => void;
  twitterUrl?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  heading = "?",
  title = "No exact matches",
  subtitle = "Try changing or removing some of your filters.",
  label = "Remove all filters",
  showReset,
  reset,
  imageSrc = "/img/404.png",
  imageWidth = 1233,
  imageHeight = 467,
  imageAlt,
  showRefresh = false,
  showGoBack = true,
  showReportBug = false,
  showTwitterUpdates = false,
  customActions = [],
  quickLinks = [],
  onRefresh,
  onReportBug,
  twitterUrl = "https://twitter.com/your_handle",
}) => {
  const router = useRouter();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  };

  const handleReportBug = () => {
    if (onReportBug) {
      onReportBug();
    } else {
      // Default bug report action
      window.open("/report-bug", "_blank");
    }
  };

  const linkClassName =
    "text-accent hover:underline font-medium font-body text-sm cursor-pointer";

  return (
    <div
      className="
        h-full
        flex 
        flex-col 
        gap-2 
        items-center font-body relative
      "
    >
      <h2 className="text-[5rem] font-mono mt-[5%]">{heading} </h2>
      <Heading center title={title} subtitle={subtitle} />

      {/* Action Buttons and Links - All on same line */}
      <div className="mt-6 flex flex-row gap-4 flex-wrap justify-center items-center">
        {showReset && (
          <button onClick={() => reset && reset()} className={linkClassName}>
            {label}
          </button>
        )}

        {showRefresh && (
          <button onClick={handleRefresh} className={linkClassName}>
            Refresh
          </button>
        )}

        {showGoBack && (
          <button onClick={() => router.push("/")} className={linkClassName}>
            Go Back
          </button>
        )}

        {showReportBug && (
          <button onClick={handleReportBug} className={linkClassName}>
            Report Bug
          </button>
        )}

        {showTwitterUpdates && (
          <button
            onClick={() => window.open(twitterUrl, "_blank")}
            className={linkClassName}
          >
            Twitter Updates
          </button>
        )}

        {customActions.map((action, index) => (
          <button
            key={`action-${index}`}
            onClick={action.onClick}
            className={linkClassName}
          >
            {action.label}
          </button>
        ))}

        {quickLinks.map((link, index) => (
          <Link
            key={`link-${index}`}
            href={link.href}
            className={linkClassName}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Bottom Image */}
      <div className="absolute bottom-0 w-full flex items-center justify-center">
        <Image
          src={imageSrc}
          width={imageWidth}
          height={imageHeight}
          alt={imageAlt || title}
        />
      </div>
    </div>
  );
};
