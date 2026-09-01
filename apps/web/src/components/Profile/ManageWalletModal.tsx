"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { DialogPanel, DialogTitle, Dialog, Transition, TransitionChild } from "@headlessui/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sandworm/ui/components/select";

import { CloseIconButton } from "@/components/CloseIconButton";
import { tintPillDarkClassName } from "@/styles/interactive";
import { useChainStore, getChainLogoUrl } from "@/store/chains";

import { Copy } from "../Assets/Copy";
import { Trash } from "../Assets/Trash";
import { FourSquare } from "../Assets/FourSquare";
import ScrollBar from "../Editor/blocks/ScrollBar";

interface WalletInfo {
  address: string;
  chain?: string;
  label?: string;
}

const SELECT_TRIGGER_CLASSNAME =
  "w-full px-4 py-2.5 rounded-xl border border-border dark:border-border-tertiary dark:bg-base-400 text-sm bg-inputBg text-ink-100 dark:text-white data-[placeholder]:text-[#ADB5BD] dark:data-[placeholder]:text-ink-400 focus:border-primary outline-none transition-colors font-body h-auto";

const SELECT_CONTENT_CLASSNAME =
  "z-[70] w-[var(--radix-select-trigger-width)] max-h-72 bg-white dark:bg-dropdown-bg border-border-tertiary font-body text-ink-200 dark:text-ink-300 dark:border-border-tertiary rounded-xl";

const SELECT_ITEM_CLASSNAME =
  "hover:bg-primary/20 dark:hover:bg-dropdown-hover dark:hover:text-white";

// =====================================
// ⬢  Chain Icon (falls back gracefully if a chain has no logo asset)
// =====================================
const ChainIcon = ({ name, size = 16 }: { name: string; size?: number }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <FourSquare className="shrink-0" />;
  }

  return (
    <Image
      alt=""
      src={getChainLogoUrl(name)}
      width={size}
      height={size}
      unoptimized
      className="rounded-full shrink-0"
      onError={() => setFailed(true)}
    />
  );
};

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (wallet: WalletInfo) => void;
  existingAddresses: string[];
}

// =====================================
// ⬢  Add Wallet Modal
// =====================================
export const AddWalletModal = ({
  isOpen,
  onClose,
  onAdd,
  existingAddresses,
}: AddWalletModalProps) => {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("");
  const [addressError, setAddressError] = useState("");
  const addressInputRef = useRef<HTMLInputElement>(null);

  const { chains, loading: chainsLoading, error: chainsError, fetchChainData } =
    useChainStore();

  useEffect(() => {
    if (isOpen && !chains && !chainsLoading) fetchChainData();
  }, [isOpen, chains, chainsLoading, fetchChainData]);

  const selectedChain = chains?.find(c => c.short_code === chain);

  const handleClose = () => {
    setAddress("");
    setChain("");
    setAddressError("");
    onClose();
  };

  const handleConfirm = () => {
    if (!address.trim()) {
      setAddressError("Address is required");
      return;
    }

    if (
      existingAddresses.some(
        a => a.toLowerCase() === address.trim().toLowerCase()
      )
    ) {
      setAddressError("This wallet is already added");
      return;
    }

    onAdd({ address: address.trim(), chain: chain.trim() || undefined });
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[60] flex items-center justify-center"
        onClose={handleClose}
        initialFocus={addressInputRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/20" />
        </TransitionChild>

        {/* ✦ Panel ✦ */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95 translate-y-1"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-1"
        >
          <DialogPanel className="relative bg-white dark:bg-dropdown-bg dark:border dark:border-border-tertiary rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 font-body">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <DialogTitle className="text-base font-medium text-ink-100 dark:text-white">
                Add Wallet
              </DialogTitle>
              <CloseIconButton size="sm" onClick={handleClose} />
            </div>

            {/* ✦ Fields ✦ */}
            <div className="space-y-3">
              <div>
                <input
                  ref={addressInputRef}
                  type="text"
                  value={address}
                  onChange={e => {
                    setAddress(e.target.value);
                    setAddressError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="0x... wallet address"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-inputBg dark:bg-base-400 text-ink-100 dark:text-white placeholder:text-[#ADB5BD] dark:placeholder:text-ink-400 outline-none transition-colors font-body ${
                    addressError
                      ? "border-red-400 focus:border-red-400"
                      : "border-border dark:border-border-tertiary focus:border-primary"
                  }`}
                />
                {addressError && (
                  <p className="text-xs text-red-500 mt-1 ml-1">
                    {addressError}
                  </p>
                )}
              </div>

              <Select value={chain || undefined} onValueChange={setChain}>
                <SelectTrigger className={SELECT_TRIGGER_CLASSNAME}>
                  <SelectValue placeholder="Select chain (optional)">
                    {selectedChain && (
                      <span className="flex items-center gap-2">
                        <ChainIcon name={selectedChain.name} />
                        {selectedChain.name}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  className={SELECT_CONTENT_CLASSNAME}
                  side="bottom"
                  sideOffset={4}
                  avoidCollisions={false}
                >
                  {chainsLoading && !chains ? (
                    <div className="px-3 py-2 text-sm text-ink-400">
                      Loading chains…
                    </div>
                  ) : chainsError ? (
                    <div className="px-3 py-2 text-sm text-red-500">
                      Couldn&apos;t load chains — you can still add the
                      wallet without one.
                    </div>
                  ) : (
                    chains?.map(c => (
                      <SelectItem
                        key={c.short_code}
                        value={c.short_code}
                        className={SELECT_ITEM_CLASSNAME}
                      >
                        <span className="flex items-center gap-2">
                          <ChainIcon name={c.name} />
                          <span className="flex flex-col">
                            <span>{c.name}</span>
                            <span className="text-xs text-ink-400 uppercase">
                              {c.short_code}
                            </span>
                          </span>
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* ✦ Actions ✦ */}
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={handleConfirm}
                className={`w-[60%] py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-opacity-90 transition-colors border border-transparent ${tintPillDarkClassName}`}
              >
                Add Wallet
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-[40%] py-2.5 rounded-xl border border-border dark:border-border-tertiary text-ink-400 dark:text-ink-100 text-sm font-medium hover:bg-inputBg dark:hover:bg-base-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

// =====================================
// ⬢ Manage Wallets Modal
// =====================================
interface ManageWalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletInfo[];
  onWalletsChange: (wallets: WalletInfo[]) => void;
}

export const ManageWalletsModal = ({
  isOpen,
  onClose,
  wallets,
  onWalletsChange,
}: ManageWalletsModalProps) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const truncateAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copyToClipboard = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const deleteWallet = (index: number) => {
    onWalletsChange(wallets.filter((_, i) => i !== index));
  };

  const deleteAll = () => {
    onWalletsChange([]);
  };

  const handleWalletAdded = (wallet: WalletInfo) => {
    onWalletsChange([...wallets, wallet]);
  };

  return (
    <>
      <Transition show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center text-ink-100"
          onClose={onClose}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-black/[10.2%]" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-1"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-1"
          >
            <DialogPanel className="relative bg-white dark:bg-dropdown-bg dark:border dark:border-border-tertiary rounded-3xl shadow-xl w-full max-w-md mx-4 px-8 py-8 font-body">
              <div className="flex items-center justify-between mb-5">
                <DialogTitle className="text-base font-medium text-ink-100 dark:text-white">
                  Manage Wallets
                </DialogTitle>
                <CloseIconButton size="sm" onClick={onClose} />
              </div>

              {/* ✦ Wallet List ✦ */}
              <ScrollBar>
                <div className="space-y-2 max-h-80  pr-0.5">
                  {wallets.length === 0 ? (
                    <p className="text-center text-sm text-ink-200 dark:text-ink-400 py-8">
                      No wallets added yet
                    </p>
                  ) : (
                    wallets.map((wallet, index) => (
                      <div
                        key={wallet.address}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`flex items-center justify-between px-4 py-2 rounded-xl border transition-colors ${
                          hoveredIndex === index
                            ? "border-primary bg-hover-bg dark:bg-base-700"
                            : "border-border dark:border-border-tertiary bg-inputBg dark:bg-transparent"
                        }`}
                      >
                        <div className="flex flex-col">
                          <code className="text-sm font-medium text-ink-400 dark:text-white font-body">
                            {truncateAddress(wallet.address)}
                          </code>
                          {wallet.chain && (
                            <span className="text-xs text-ink-400 dark:text-ink-400 mt-0.5 uppercase">
                              {wallet.chain}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-[1px]">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(wallet.address)}
                            className="p-1 rounded-lg transition-colors"
                          >
                            {copiedAddress === wallet.address ? (
                              <Check className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4 text-ink-navy  dark:text-ink-400" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteWallet(index)}
                            className="p-1 rounded-lg  transition-colors group"
                          >
                            <Trash className="w-4 h-4 text-ink-navy dark:text-ink-400 hover:text-error transition-colors" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollBar>

              {/* ✦ Footer Actions ✦ */}
              <div className="flex gap-3 mt-10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className={`w-[60%] py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-opacity-90 transition-colors border border-transparent ${tintPillDarkClassName}`}
                >
                  Add wallet
                </button>
                {wallets.length > 0 && (
                  <button
                    type="button"
                    onClick={deleteAll}
                    className=" bg-base-400 text-border-secondary w-[40%] py-2.5 rounded-xl border border-border dark:border-border-tertiary text-ink-400 dark:text-ink-100 text-sm font-medium hover:bg-inputBg dark:hover:bg-base-500 transition-colors"
                  >
                    Delete all
                  </button>
                )}
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      <AddWalletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleWalletAdded}
        existingAddresses={wallets.map(w => w.address)}
      />
    </>
  );
};
