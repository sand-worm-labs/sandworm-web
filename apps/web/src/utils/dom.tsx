import type { CSSProperties, RefObject } from "react";

export function isInside(
  box: Pick<DOMRect, "left" | "right" | "top" | "bottom">,
  x: number,
  y: number
) {
  return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
}

// =====================================
// ⬢ Compute Menu Position
// =====================================
export function computeMenuPosition(
  referenceObject: RefObject<HTMLElement>,
  containerObject: RefObject<HTMLElement>,
  menuPosition: "left" | "right" | "bottom",
  padding: number
): CSSProperties {
  if (!referenceObject.current || !containerObject.current) {
    return {
      top: -9999,
      left: -9999,
    };
  }

  const referenceRect = referenceObject.current.getBoundingClientRect();
  const containerRect = containerObject.current.getBoundingClientRect();

  switch (menuPosition) {
    case "left":
      return {
        top: referenceRect.top,
        left: referenceRect.left - containerRect.width - padding,
      };
    case "right":
      return {
        top: referenceRect.top,
        left: referenceRect.left + referenceRect.width + 6,
      };
    case "bottom":
      return {
        top: referenceRect.top + referenceRect.height + padding,
        left: referenceRect.left,
      };
    default:
      return {};
  }
}

// =====================================
// ⬢ Compute ToolTip Position
// =====================================
export function computeTooltipPosition(
  commonParent: RefObject<Element>,
  reference: RefObject<Element>,
  tooltip: RefObject<Element>,
  tooltipPosition: "top",
  padding: number,
  isPortal: boolean
): CSSProperties {
  if (!reference.current || !tooltip.current || !commonParent.current) {
    return {
      top: -9999,
      left: -9999,
    };
  }

  const commonRect = commonParent.current.getBoundingClientRect();

  const origReferenceRect = reference.current.getBoundingClientRect();
  const origTooltipRect = tooltip.current.getBoundingClientRect();

  const referenceRect = {
    top: origReferenceRect.top - (isPortal ? 0 : commonRect.top),
    right: origReferenceRect.right - (isPortal ? 0 : commonRect.left),
    bottom: origReferenceRect.bottom - (isPortal ? 0 : commonRect.top),
    left: origReferenceRect.left - (isPortal ? 0 : commonRect.left),
    width: origReferenceRect.width,
    height: origReferenceRect.height,
  };
  const tooltipRect = {
    top: origTooltipRect.top - (isPortal ? 0 : commonRect.top),
    right: origTooltipRect.right - (isPortal ? 0 : commonRect.left),
    bottom: origTooltipRect.bottom - (isPortal ? 0 : commonRect.top),
    left: origTooltipRect.left - (isPortal ? 0 : commonRect.left),
    width: origTooltipRect.width,
    height: origTooltipRect.height,
  };

  const referenceMiddleX = referenceRect.left + referenceRect.width / 2;

  switch (tooltipPosition) {
    case "top": {
      let left = referenceMiddleX - tooltipRect.width / 2;
      const top = referenceRect.top - tooltipRect.height - padding;
      const safeMargin = 36;
      const rightEdgeInScreen =
        (isPortal ? 0 : commonRect.left) + left + tooltipRect.width;

      if (rightEdgeInScreen + safeMargin > window.innerWidth) {
        left = referenceRect.right - tooltipRect.width;
      }

      return { top, left };
    }
    default:
      return {};
  }
}
