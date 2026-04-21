import { Transition } from "@headlessui/react";
import clsx from "clsx";
import type { CSSProperties, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import useDropdownPosition from "../hooks/dropdownposition";

// =====================================
// ⬢ Types
// =====================================
export type TooltipSide = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "start" | "center" | "end";
export type TooltipPlacement =
  | TooltipSide
  | `${TooltipSide}-${Exclude<TooltipAlign, "center">}`;

function parsePlacement(placement: TooltipPlacement): {
  side: TooltipSide;
  align: TooltipAlign;
} {
  const [side, align] = placement.split("-") as [TooltipSide, TooltipAlign?];
  return { side, align: align ?? "center" };
}

// =====================================
// ⬢ Utils
// =====================================
export function computeTooltipPosition(
  commonParent: RefObject<Element>,
  reference: RefObject<Element>,
  tooltip: RefObject<Element>,
  placement: TooltipPlacement,
  padding: number,
  isPortal: boolean
): CSSProperties {
  if (!reference.current || !tooltip.current || !commonParent.current) {
    return { top: -9999, left: -9999 };
  }

  const commonRect = commonParent.current.getBoundingClientRect();
  const origRef = reference.current.getBoundingClientRect();
  const origTip = tooltip.current.getBoundingClientRect();

  const offsetTop = isPortal ? 0 : commonRect.top;
  const offsetLeft = isPortal ? 0 : commonRect.left;

  const ref = {
    top: origRef.top - offsetTop,
    left: origRef.left - offsetLeft,
    right: origRef.right - offsetLeft,
    bottom: origRef.bottom - offsetTop,
    width: origRef.width,
    height: origRef.height,
  };

  const { side, align } = parsePlacement(placement);
  const isVerticalSide = side === "top" || side === "bottom";

  let top = 0;
  let left = 0;

  if (side === "top") {
    top = ref.top - origTip.height - padding;
  } else if (side === "bottom") {
    top = ref.bottom + padding;
  } else if (side === "left") {
    left = ref.left - origTip.width - padding;
  } else if (side === "right") {
    left = ref.right + padding;
  }

  if (isVerticalSide) {
    if (align === "start") {
      left = ref.left;
    } else if (align === "end") {
      left = ref.right - origTip.width;
    } else {
      left = ref.left + ref.width / 2 - origTip.width / 2;
    }
  } else if (align === "start") {
    top = ref.top;
  } else if (align === "end") {
    top = ref.bottom - origTip.height;
  } else {
    top = ref.top + ref.height / 2 - origTip.height / 2;
  }

  const safeMargin = 36;
  if (isVerticalSide) {
    const rightEdgeInScreen = offsetLeft + left + origTip.width;
    if (rightEdgeInScreen + safeMargin > window.innerWidth) {
      left = ref.right - origTip.width;
    }
  }

  return { top, left };
}

function getPosClass(
  position: "top" | "bottom" | "left" | "right" | "manual"
): string {
  switch (position) {
    case "top":
      return "-top-1 left-1/2 -translate-x-1/2 -translate-y-full";
    case "bottom":
      return "-bottom-1 right-1/2 translate-x-1/2 translate-y-full";
    case "left":
      return "-left-1 top-1/2 -translate-x-full -translate-y-1/2";
    case "right":
      return "right-0 top-1/2 translate-x-full -translate-y-1/2";
    case "manual":
      return "";
    default:
      return "";
  }
}

export const Tooltip = ({
  title,
  message,
  children,
  className,
  position = "top",
  tooltipClassname,
  active,
}: {
  title?: string;
  message?: string;
  children: React.ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right" | "manual";
  tooltipClassname?: string;
  active?: boolean;
}) => {
  return (
    <div className={clsx(`group relative`, className)}>
      {children}

      {active && (
        <div
          className={clsx(
            "font-body  bg-black pointer-events-none absolute opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col items-center justify-center gap-y-1 z-[4000]",
            getPosClass(position),
            tooltipClassname
          )}
        >
          {title && <span>{title}</span>}
          {message && (
            <span className="inline-flex items-center justify-center text-ink-300 text-center">
              {message}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface PortalTooltipProps {
  className?: string;
  children: React.ReactNode;
  content: React.ReactNode;
  ignoreScrollableAncestor?: boolean;
}
export function PortalTooltip(props: PortalTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const { onOpen, dropdownPosition } = useDropdownPosition(
    ref,
    "top",
    0,
    props.ignoreScrollableAncestor
  );
  useEffect(() => {
    if (active) {
      onOpen();
    }
  }, [active]);

  return (
    <div
      className={clsx(props.className, "relative")}
      ref={ref}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      {props.children}
      {createPortal(
        <div
          className={clsx(
            "absolute z-[2000] -translate-y-full pb-2 subpixel-antialiased transition-opacity",
            active ? "opacity-100" : "opacity-0 invisible"
          )}
          style={dropdownPosition}
        >
          {props.content}
        </div>,
        document.body
      )}
    </div>
  );
}

// =====================================
// ⬢ Tooltip v2
// =====================================
interface TooltipV2Props<T extends Element> {
  title?: string;
  message?: string;
  content?: (tooltipRef: React.RefObject<HTMLDivElement>) => React.ReactNode;
  referenceRef?: React.RefObject<T>;
  children: (ref: React.RefObject<T>) => React.ReactNode;
  active: boolean;
  className?: string;
  position?: TooltipPlacement;
}

export function TooltipV2<T extends Element>(props: TooltipV2Props<T>) {
  const placement = props.position ?? "top";

  const parentRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const _referenceRef = useRef<T>(null);
  const referenceRef = props.referenceRef ?? _referenceRef;

  const [pos, setPos] = useState<CSSProperties>(
    computeTooltipPosition(
      parentRef,
      referenceRef,
      tooltipRef,
      placement,
      6,
      true
    )
  );
  const [hovering, setHovering] = useState(false);

  const onEnter = useCallback(() => setHovering(true), []);
  const onLeave = useCallback(() => setHovering(false), []);

  useEffect(() => {
    if (!parentRef.current || !props.active || !hovering) {
      return () => {};
    }

    const cb = () => {
      setPos(
        computeTooltipPosition(
          parentRef,
          referenceRef,
          tooltipRef,
          placement,
          6,
          true
        )
      );
    };

    const mut = new MutationObserver(cb);
    mut.observe(parentRef.current, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    cb();

    return () => {
      mut.disconnect();
    };
  }, [parentRef, referenceRef, tooltipRef, props.active, hovering, placement]);

  return (
    <div ref={parentRef} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {props.children(referenceRef)}
      {props.active &&
        hovering &&
        createPortal(
          <Transition
            show={props.active && hovering}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <div style={pos} className="absolute z-[2000] rounded-md">
              {(() => {
                if (props.content) {
                  return props.content(tooltipRef);
                }

                const shouldShowDefault = props.title || props.message;
                if (!shouldShowDefault) return null;

                return (
                  <div
                    ref={tooltipRef}
                    className={clsx(
                      "font-body  pointer-events-none bg-black text-white text-xs px-2.5 py-1 rounded-md flex flex-col items-center justify-center gap-y-1 max-w-36",
                      props.className
                    )}
                  >
                    {props.title && (
                      <span className="text-center">{props.title}</span>
                    )}

                    {props.message && (
                      <span className="inline-flex items-center justify-center text-white text-center">
                        {props.message}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </Transition>,
          document.body
        )}
    </div>
  );
}
