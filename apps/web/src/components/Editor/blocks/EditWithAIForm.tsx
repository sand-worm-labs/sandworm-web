import type * as Y from "yjs";
import clsx from "clsx";
import { useCallback, useEffect, useRef } from "react";
import { PiX, PiArrowRight } from "react-icons/pi";
import { updateYText } from "@sandworm/editor";

import { AIChatIcon } from "@/components/Assets/AIChatIcon";

import Spin from "./Spin";

interface Props {
  loading: boolean;
  disabled: boolean;
  value: Y.Text;
  onSubmit: () => void;
  onClose: () => void;
  hasOutput: boolean;
}

function EditWithAIForm(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="print:hidden w-full">
      <form
        onSubmit={onSubmit}
        className={clsx(
          "print:hidden w-full flex items-center gap-2 px-3 py-2 mt-[-1px]",
          "border-t border-border dark:border-border-dark",
          !props.hasOutput && "rounded-b-xl",
          "bg-surface dark:bg-surface-dark",
          "transition-colors duration-150"
        )}
      >
        <div className="flex-shrink-0 text-ink-400 dark:text-ink-500">
          <AIChatIcon size={36} />
        </div>

        <input
          ref={inputRef}
          disabled={props.disabled}
          defaultValue={props.value.toString()}
          className={clsx(
            "flex-1 min-w-0 rounded-md px-2 py-1",
            "border border-border dark:border-border-dark",
            "bg-white dark:bg-ink-950",
            "outline-none ring-offset-0",
            "focus:border-[#A308F0] dark:focus:border-[#C97FF5]",
            "dark:focus:ring-[#C97FF5]/20",
            "text-[12.5px] font-body",
            "text-ink-700 dark:text-ink-200",
            "placeholder:text-ink-400 dark:placeholder:text-ink-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-[border-color,box-shadow] duration-150"
          )}
          placeholder="Describe what you want to change…"
          onChange={onChange}
          onKeyDown={onKeyDown}
        />

        <button
          type="button"
          onClick={props.onClose}
          className={clsx(
            "flex-shrink-0",
            "text-ink-400 dark:text-ink-500",
            "hover:text-[#A308F0] dark:hover:text-[#C97FF5]",
            "transition-colors duration-150"
          )}
        >
          <PiX size={12} />
        </button>

        <button
          type="submit"
          disabled={props.disabled}
          className={clsx(
            "flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg",
            "transition-all duration-150",
            props.loading || props.disabled
              ? "bg-ink-100 dark:bg-ink-800 text-ink-400 dark:text-ink-500 cursor-not-allowed"
              : "bg-[#A308F0] hover:bg-[#8A06CC] text-white"
          )}
        >
          {props.loading ? <Spin /> : <PiArrowRight size={12} />}
        </button>
      </form>
    </div>
  );
}

export default EditWithAIForm;
