"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";
import type { ParamDefinition } from "@sandworm/editor";

import { useGetContractAbiLazyQuery } from "@/generated/graphql";

import { FieldLabel, FieldError } from "./AddressField";
import { ChevronDown } from "./SelectField";

function isValidAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

interface Signature {
  name: string;
  signature: string;
}

interface RemoteSignatureFieldProps {
  param: ParamDefinition;
  value: string;
  allValues: Record<string, unknown>;
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
  error?: string;
}

/**
 * Picks a real function/event signature off a contract's verified ABI —
 * fetched from the block explorer the moment chain + contract address are
 * both filled in, instead of the user typing/guessing a signature by hand.
 * Selecting an option stores the full canonical signature (e.g.
 * "burn(uint256)") as the param value, so the generated tool template just
 * hashes a known-good string — no ABI fetch needed at query-run time.
 */
export function RemoteSignatureField({
  param,
  value,
  allValues,
  onChange,
  onBlur,
  error,
}: RemoteSignatureFieldProps) {
  const [chainKey, addressKey] = param.dependsOn ?? ["chain", "contract_address"];
  const chain = allValues[chainKey] as string | undefined;
  const address = allValues[addressKey] as string | undefined;
  const kind = param.type === "event_signature" ? "events" : "functions";

  const [fetchAbi, { data, loading, error: fetchError }] = useGetContractAbiLazyQuery();

  // Debounced re-fetch whenever the contract this field depends on changes.
  const lastKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!chain || !address || !isValidAddress(address)) return;
    const key = `${chain}:${address}`;
    if (lastKeyRef.current === key) return;

    const timer = setTimeout(() => {
      lastKeyRef.current = key;
      fetchAbi({ variables: { chain, address } });
    }, 400);
    return () => clearTimeout(timer);
  }, [chain, address, fetchAbi]);

  const options: Signature[] = useMemo(
    () => data?.getContractAbi?.[kind] ?? [],
    [data, kind]
  );

  const selected = options.find(opt => opt.signature === value);
  const [placeholderReason, setPlaceholderReason] = useState<string | null>(null);

  useEffect(() => {
    if (!chain || !address) {
      setPlaceholderReason(`Fill in ${chainKey} and ${addressKey} first`);
    } else if (!isValidAddress(address)) {
      setPlaceholderReason("Waiting for a valid contract address");
    } else if (loading) {
      setPlaceholderReason("Fetching contract ABI...");
    } else if (fetchError) {
      setPlaceholderReason(fetchError.message);
    } else if (data && options.length === 0) {
      setPlaceholderReason(`No ${kind} found in this contract's verified ABI`);
    } else {
      setPlaceholderReason(null);
    }
  }, [chain, address, chainKey, addressKey, loading, fetchError, data, options, kind]);

  const disabled = options.length === 0;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel param={param} />

      <Listbox
        value={value}
        onChange={val => {
          onChange(val);
          onBlur(val);
        }}
        disabled={disabled}
      >
        {({ open }) => (
          <div className="relative">
            <Listbox.Button
              className={clsx(
                "w-full flex items-center px-3 py-2.5 pr-8 rounded-lg text-sm text-left",
                "bg-white/[0.04] border transition-colors outline-none",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                "text-ink-100 ",
                error
                  ? "border-error focus:border-red-500/60"
                  : "border-border-tertiary focus:border-primary/50"
              )}
            >
              {selected ? (
                <span className="truncate font-mono text-xs">
                  {selected.name}({selected.signature.slice(selected.name.length + 1, -1)})
                </span>
              ) : (
                <span className="text-ink-400  truncate">
                  {placeholderReason ?? `Select ${param.label.toLowerCase()}...`}
                </span>
              )}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 ">
                <ChevronDown />
              </span>
            </Listbox.Button>

            <Transition
              show={open && !disabled}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className={clsx(
                  "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg py-1",
                  "bg-base-100 border border-border-tertiary shadow-lg outline-none"
                )}
              >
                {options.map(opt => (
                  <Listbox.Option
                    key={opt.signature}
                    value={opt.signature}
                    className={({ active }) =>
                      clsx(
                        "px-3 py-2 text-xs font-mono cursor-pointer truncate",
                        active ? "bg-white/[0.06]" : "",
                        "text-ink-100 "
                      )
                    }
                  >
                    {opt.signature}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>

      {error && <FieldError message={error} />}
    </div>
  );
}
