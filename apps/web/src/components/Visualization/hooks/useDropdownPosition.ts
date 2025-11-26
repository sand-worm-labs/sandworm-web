import type { exhaustiveCheck } from "@sandworm/types";
import type { CSSProperties, RefObject } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

function useDropdownPosition(
  buttonRef: RefObject<HTMLElement>,
  dropdownRef: RefObject<HTMLElement>,
  position: "left" | "right",
  padding: number
): [CSSProperties, onToggle: () => void] {
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!buttonRef.current || !dropdownRef.current) {
      setStyle({});
      return;
    }

    const button = buttonRef.current;
    const dropdown = dropdownRef.current;

    const compute = () => {
      const buttonRect = button.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();
      switch (position) {
        case "left":
          setStyle({
            left: buttonRect.left - dropdownRect.width - padding,
            top: buttonRect.top,
          });
          break;
        case "right":
          setStyle({
            left: buttonRect.left + buttonRect.width + padding,
            top: buttonRect.top,
          });
          break;
        default:
          exhaustiveCheck(position);
      }
    };

    const observer = new MutationObserver(compute);
    observer.observe(button, { attributes: true });
    observer.observe(dropdown, { attributes: true });
    compute();

    return () => {
      observer.disconnect();
    };
  }, [buttonRef, dropdownRef, position, padding]); // , tick])

  const onToggle = useCallback(() => {
    // setTick((tick) => tick + 1)
  }, []);

  return useMemo(() => [style, onToggle], [style, onToggle]);
}

export default useDropdownPosition;
