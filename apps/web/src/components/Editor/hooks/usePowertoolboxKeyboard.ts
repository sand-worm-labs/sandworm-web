import { useEffect, useRef, useCallback } from "react";

interface UseKeyboardNavOptions {
  itemCount: number;
  onSelect: (index: number) => void;
  onBack?: () => void;
  onClose: () => void;
  enabled: boolean;
}

// =====================================
// ⬢ Use Power Toolbox Keyboard
// =====================================
//  Handles ↑ ↓ Enter Esc keyboard navigation f"or the PowerToolbox modal.
//  Returns the active index and a setter so the component can also update
// it on mouse hover for a unified highlight state.
// =====================================

export function usePowerToolboxKeyboard({
  itemCount,
  onSelect,
  onBack,
  onClose,
  enabled,
}: UseKeyboardNavOptions) {
  const activeIndex = useRef(-1);
  const setActive = useCallback((index: number) => {
    activeIndex.current = index;
  }, []);

  useEffect(() => {
    if (!enabled) return () => {};

    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = (activeIndex.current + 1) % itemCount;
          activeIndex.current = next;
          document
            .querySelector(`[data-ptb-index="${next}"]`)
            ?.scrollIntoView({ block: "nearest" });
          document.dispatchEvent(
            new CustomEvent("ptb:active", { detail: next })
          );
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev =
            activeIndex.current <= 0 ? itemCount - 1 : activeIndex.current - 1;
          activeIndex.current = prev;
          document
            .querySelector(`[data-ptb-index="${prev}"]`)
            ?.scrollIntoView({ block: "nearest" });
          document.dispatchEvent(
            new CustomEvent("ptb:active", { detail: prev })
          );
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (activeIndex.current >= 0) {
            onSelect(activeIndex.current);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          if (onBack) {
            onBack();
          } else {
            onClose();
          }
          break;
        }
        case "Backspace": {
          if (onBack) {
            onBack();
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [itemCount, onSelect, onBack, onClose, enabled]);

  return { setActive };
}
