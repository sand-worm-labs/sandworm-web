import type * as Y from "yjs";
import clsx from "clsx";
import { useCallback, useEffect, useRef } from "react";
import { PiX, PiArrowRight } from "react-icons/pi";
import { updateYText } from "@sandworm/editor";

import { SparkleAI } from "@/components/Assets/SparkleAI";

import Spin from "./Spin";

// =====================================================
// ⬢ Types
// =====================================================
interface Props {
  loading: boolean;
  disabled: boolean;
  value: Y.Text;
  onSubmit: () => void;
  onClose: () => void;
  hasOutput: boolean;
}

// =====================================================
// ⬢ Component
// =====================================================
function EditWithAIForm(props: Props) {
  // ── Refs ──────────────────────────────────────────
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Yjs sync observer ─────────────────────────────
  useEffect(() => {
    const onChange = (evt: Y.YTextEvent, tr: Y.Transaction) => {
      const currentSelectionStart = inputRef.current?.selectionStart ?? null;
      const currentSelectionEnd = inputRef.current?.selectionEnd ?? null;

      if (
        tr.local ||
        currentSelectionStart === null ||
        currentSelectionEnd === null ||
        !inputRef.current
      ) {
        return;
      }

      const currentInput = inputRef.current;
      let index = 0;
      let delta = 0;
      evt.changes.delta.forEach(operation => {
        if (operation.retain !== undefined) {
          index += operation.retain;
        } else if (operation.insert !== undefined) {
          if (index < currentSelectionStart) delta += operation.insert.length;
          index += operation.insert.length;
        } else if (operation.delete !== undefined) {
          if (index < currentSelectionStart) delta -= operation.delete;
        }
      });

      currentInput.value = evt.target.toString();
      requestAnimationFrame(() => {
        currentInput.setSelectionRange(
          currentSelectionStart + delta,
          currentSelectionEnd + delta
        );
      });
    };

    props.value.observe(onChange);
    return () => props.value.unobserve(onChange);
  }, [props.value, inputRef]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateYText(props.value, e.target.value);
    },
    [props.value]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      props.onSubmit();
    },
    [props.onSubmit]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const modifier = e.ctrlKey || e.metaKey;
      if (e.key === "Escape" || (modifier && e.key === "e")) {
        e.preventDefault();
        props.onClose();
      } else if (e.key === "Enter") {
        props.onSubmit();
      }
    },
    [props.onSubmit, props.onClose]
  );

  return (
    <>
      {/* Inject keyframes once — Tailwind can't do this */}
      <style>{`
        @keyframes rainbow-slide {
          0%   { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        .rainbow-border-top::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1.5px;
          background: linear-gradient(
            98.58deg,
            #6368FF 0.62%,
            #CBECFF 15.71%,
            #7BFF42 25.15%,
            #2DB2FF 42.6%,
            #FF0000 60.53%,
            #DED757 80.81%,
            #FF00E1 98.74%,
            /* repeat for seamless loop */
            #6368FF 100%
          );
          background-size: 200% 100%;
          animation: rainbow-slide 1.4s linear infinite;
          pointer-events: none;
        }
        /* Static (non-running) border — no animation, solid purple */
        .rainbow-border-top-static::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1.5px;
          background: #A308F0;
          opacity: 0.35;
          pointer-events: none;
        }
      `}</style>

      <div className="print:hidden w-full">
        <form
          onSubmit={onSubmit}
          className={clsx(
            // layout
            "print:hidden w-full flex items-center gap-2 px-3 py-2 mt-[-1px]",
            "relative",
            props.loading ? "rainbow-border-top" : "rainbow-border-top-static",
            "border-b border-x border-border dark:border-border-dark",
            !props.hasOutput && "rounded-b-xl",
            "bg-[#F8F9FA] dark:bg-surface-dark",
            "transition-colors duration-150"
          )}
        >
          <div className="flex-shrink-0 text-ink-400 dark:text-ink-500">
            <SparkleAI size={32} />
          </div>

          {/* Text input + action buttons */}
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              disabled={props.disabled}
              defaultValue={props.value.toString()}
              className={clsx(
                "w-full min-w-0 rounded-2xl pl-3 py-1.5 pr-[68px]",
                "border border-[#E6E0F1] dark:border-border-dark",
                "bg-[#F1F3F4] dark:bg-ink-950",
                "outline-none ring-offset-0",
                "focus:border-[#A308F0] dark:focus:border-[#C97FF5]",
                "dark:focus:ring-[#C97FF5]/20",
                "text-[12.5px] font-body",
                "text-ink-700 dark:text-ink-200",
                "placeholder:text-[#868E96] dark:placeholder:text-ink-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-[border-color,box-shadow] duration-150"
              )}
              placeholder="Start suggesting…"
              onChange={onChange}
              onKeyDown={onKeyDown}
            />

            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {/* Submit / spinner button */}
              <button
                type="submit"
                disabled={props.disabled}
                className={clsx(
                  "flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg",
                  "transition-all duration-150",
                  props.loading || props.disabled
                    ? [
                        "relative overflow-hidden cursor-not-allowed",
                        "bg-transparent border border-transparent",
                        "before:absolute before:inset-[1px] before:rounded-[7px]",
                        "before:bg-surface dark:before:bg-surface-dark",
                      ]
                    : "bg-[#FEFEFF] hover:bg-[#8A06CC] text-white border border-[#E6E0F1]"
                )}
              >
                {props.loading ? (
                  <span className="relative z-10 text-[#A308F0] dark:text-[#C97FF5]">
                    <Spin />
                  </span>
                ) : (
                  <PiArrowRight
                    size={12}
                    className="text-[#A308F0] dark:text-[#C97FF5]"
                  />
                )}
              </button>
              {/* Close button */}
              <button
                type="button"
                onClick={props.onClose}
                className={clsx(
                  "flex-shrink-0 flex items-center justify-center ",
                  "text-error dark:text-ink-500",
                  "hover:text-error dark:hover:text-[#C97FF5]",
                  "transition-colors duration-150 border border-[#E6E0F1] w-6 h-6 rounded-lg",
                  "bg-[#FEFEFF] dark:bg-ink-950"
                )}
              >
                <PiX size={12} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditWithAIForm;
