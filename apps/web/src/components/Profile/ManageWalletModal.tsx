"use client";

import { useState, useRef, Fragment } from "react";
import { X,  Check,  } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Copy } from "../Assets/Copy";
import { Trash } from "../Assets/Trash";
import ScrollBar from "../Editor/blocks/ScrollBar";

interface WalletInfo {
  address: string;
  chain?: string;
  label?: string;
}

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
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/20" />
        </Transition.Child>

        {/* ✦ Panel ✦ */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95 translate-y-1"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-1"
        >
          <Dialog.Panel className="relative bg-white dark:bg-base-400 dark:border dark:border-border-tertiary rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 font-body">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-base font-medium text-ink-100 dark:text-white">
                Add Wallet
              </Dialog.Title>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-[#F8F9FA] dark:hover:bg-[#262A30] dark:text-ink-100 transition-colors text-[#1C3B5A]"
              >
                <X className="w-4 h-4" />
              </button>
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
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[#F8F9FA] dark:bg-base-400 text-ink-100 dark:text-white placeholder:text-[#ADB5BD] dark:placeholder:text-ink-400 outline-none transition-colors font-body ${
                    addressError
                      ? "border-red-400 focus:border-red-400"
                      : "border-[#DEE2E6] dark:border-border-tertiary focus:border-[#A308F0]"
                  }`}
                />
                {addressError && (
                  <p className="text-xs text-red-500 mt-1 ml-1">
                    {addressError}
                  </p>
                )}
              </div>

              <input
                type="text"
                value={chain}
                onChange={e => setChain(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Chain"
                className="w-full px-4 py-2.5 rounded-xl border border-[#DEE2E6] dark:border-border-tertiary dark:bg-base-400 text-sm bg-[#F8F9FA] text-ink-100 dark:text-white placeholder:text-[#ADB5BD] dark:placeholder:text-ink-400 focus:border-[#A308F0] outline-none transition-colors font-body"
              />
            </div>

            {/* ✦ Actions ✦ */}
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-[60%] py-2.5 rounded-xl bg-[#A308F0] text-white text-sm font-medium hover:bg-opacity-90 transition-colors"
              >
                Add Wallet
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-[40%] py-2.5 rounded-xl border border-[#DEE2E6] dark:border-border-tertiary text-[#6C757D] dark:text-ink-400 text-sm font-medium hover:bg-[#F8F9FA] dark:hover:bg-base-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
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
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-[#0000001A]" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-1"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-1"
          >
            <Dialog.Panel className="relative bg-white dark:bg-base-400 dark:border dark:border-border-tertiary rounded-3xl shadow-xl w-full max-w-md mx-4 px-8 py-8 font-body">
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="text-base font-medium text-ink-100 dark:text-white">
                  Manage Wallets
                </Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[#F8F9FA] dark:hover:bg-[#262A30] transition-colors text-[#1C3B5A] dark:text-ink-100"
                >
                  <X className="w-4 h-4" />
                </button>
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
                          ? " bg-[#EBF9FA] dark:bg-base-100"
                          : "border-[#DEE2E6] dark:border-border-tertiary bg-[#F8F9FA] dark:bg-transparent"
                      }`}
                    >
                      <div className="flex flex-col">
                        <code className="text-sm font-medium text-[#6C757D] dark:text-white font-body">
                          {truncateAddress(wallet.address)}
                        </code>
                        {wallet.chain && (
                          <span className="text-xs text-[#6C757D] dark:text-ink-400 mt-0.5">
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
                            <Check className="w-4 h-4 text-[#A308F0]" />
                          ) : (
                            <Copy className="w-4 h-4 text-[#1C3B5A]  dark:text-ink-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteWallet(index)}
                          className="p-1 rounded-lg  transition-colors group"
                        >
                          <Trash className="w-4 h-4 text-[#1C3B5A] dark:text-ink-400 hover:text-error transition-colors" />
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
                  className="w-[60%] py-2.5 rounded-xl bg-[#A308F0] text-white text-sm font-medium hover:bg-opacity-90 transition-colors"
                >
                  Add wallet
                </button>
                {wallets.length > 0 && (
                  <button
                    type="button"
                    onClick={deleteAll}
                    className=" bg-[#0F0F0F] text-[#E9ECEF] w-[40%] py-2.5 rounded-xl border border-[#DEE2E6] dark:border-border-tertiary text-[#6C757D] dark:text-ink-400 text-sm font-medium hover:bg-[#F8F9FA] dark:hover:bg-base-500 transition-colors"
                  >
                    Delete all
                  </button>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
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
