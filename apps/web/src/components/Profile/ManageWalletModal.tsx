"use client";

import { useState, useRef, useEffect } from "react";
import { X, Copy, Check, Trash2 } from "lucide-react";

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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => addressInputRef.current?.focus(), 50);
    } else {
      setAddress("");
      setChain("");
      setAddressError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative bg-white dark:bg-base-400 dark:border dark:border-border-tertiary rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 font-body">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-ink-100 dark:text-white">
            Add Wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F8F9FA] dark:hover:bg-[#262A30] dark:text-ink-100 transition-colors text-[#1C3B5A]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
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
              <p className="text-xs text-red-500 mt-1 ml-1">{addressError}</p>
            )}
          </div>

          <input
            type="text"
            value={chain}
            onChange={e => setChain(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chain "
            className="w-full px-4 py-2.5 rounded-xl border border-[#DEE2E6] dark:border-border-tertiary dark:bg-base-400 text-sm bg-[#F8F9FA] text-ink-100 dark:text-white placeholder:text-[#ADB5BD] dark:placeholder:text-ink-00 focus:border-[#A308F0] outline-none transition-colors font-body"
          />
        </div>

        {/* Actions */}
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
            onClick={onClose}
            className="w-[40%] py-2.5 rounded-xl border border-[#DEE2E6] dark:border-border-tertiary text-[#6C757D] dark:text-ink-400 text-sm font-medium hover:bg-[#F8F9FA] dark:hover:bg-[#262A30] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ManageWalletsModal ───────────────────────────────────────────────────────

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

  if (!isOpen) return null;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center text-ink-100">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#0000001A]" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white dark:bg-base-400 dark:border dark:border-border-tertiary rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 font-body">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-medium text-ink-100 dark:text-white">
              Manage Wallets
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#F8F9FA] dark:hover:bg-[#262A30] transition-colors text-[#1C3B5A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Wallet List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
            {wallets.length === 0 ? (
              <p className="text-center text-sm text-ink-200 dark:text-gray-500 py-8">
                No wallets added yet
              </p>
            ) : (
              wallets.map((wallet, index) => (
                <div
                  key={wallet.address}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                    hoveredIndex === index
                      ? "border-[#A308F0] bg-[#F8F9FA] dark:bg-[#1A1A2E]"
                      : "border-[#DEE2E6] dark:border-[#262A30] bg-[#F8F9FA] dark:bg-transparent"
                  }`}
                >
                  <div className="flex flex-col">
                    <code className="text-sm font-medium text-[#6C757D] dark:text-white font-body">
                      {truncateAddress(wallet.address)}
                    </code>
                    {wallet.chain && (
                      <span className="text-xs text-[#6C757D] dark:text-gray-500 mt-0.5">
                        {wallet.chain}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(wallet.address)}
                      className="p-1.5 rounded-lg hover:bg-[#E9ECEF] dark:hover:bg-[#262A30] transition-colors"
                    >
                      {copiedAddress === wallet.address ? (
                        <Check className="w-4 h-4 text-[#A308F0]" />
                      ) : (
                        <Copy className="w-4 h-4 text-ink-200 dark:text-gray-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteWallet(index)}
                      className="p-1.5 rounded-lg hover:bg-[#FFE8E8] dark:hover:bg-[#3A1A1A] transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-ink-200 dark:text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
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
                className="w-[40%] py-2.5 rounded-xl bg-[#1C1C1C] dark:bg-[#262A30] text-white text-sm font-medium hover:bg-opacity-80 transition-colors"
              >
                Delete all
              </button>
            )}
          </div>
        </div>
      </div>

      <AddWalletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleWalletAdded}
        existingAddresses={wallets.map(w => w.address)}
      />
    </>
  );
};
