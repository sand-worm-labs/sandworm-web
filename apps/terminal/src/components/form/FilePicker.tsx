"use client";

import { useRef } from "react";
import { PiPlus, PiX } from "react-icons/pi";

type FilePickerProps = {
  label: string;
  files: readonly string[];
  onChange: (files: string[]) => void;
  hint?: string;
};

export function FilePicker({ label, files, onChange, hint }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-100">{label}</span>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={event => {
          const input = event.currentTarget;
          const picked = Array.from(input.files ?? [], file => file.name);
          onChange(Array.from(new Set([...files, ...picked])));
          input.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] border border-dashed border-hover-border bg-block-surface text-[13px] font-medium text-ink-500 transition-colors hover:border-primary hover:text-ink-100"
      >
        <PiPlus size={14} aria-hidden="true" />
        Add files
      </button>
      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map(name => (
            <li
              key={name}
              className="flex items-center justify-between gap-2 text-xs text-ink-500"
            >
              <span className="truncate">{name}</span>
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => onChange(files.filter(file => file !== name))}
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-ink-400 hover:text-primary-700 dark:hover:text-primary-200"
              >
                <PiX size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
    </div>
  );
}
