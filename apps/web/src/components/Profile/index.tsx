/* eslint-disable no-nested-ternary */

"use client";

import { useState } from "react";
import {
  Link as LinkIcon,
  Github,
  Twitter,
  Globe,
  UserPlus,
  UserMinus,
  Check,
} from "lucide-react";
import { PiCalendarDots } from "react-icons/pi";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@sandworm/ui/components/avatar";

import type { ApiDocument } from "@/types";

import { Copy } from "../Assets/Copy";
import { Loader } from "../Loader";
import { ProjectIcon } from "../Assets/ProjectIcon";
import { useCurrentUser } from "../Editor/hooks/useCurrentUser";
import { useWallets } from "../Editor/hooks/useWallets";
import { useUser } from "../Editor/hooks/useUser";
import { useStringQuery } from "../Editor/hooks/useQueryArgs";
import { useUserPublicDocuments } from "../Editor/hooks/usePublicDocuments";
import { useInfiniteScroll } from "../Editor/hooks/useInfiniteScroll";
import { EmptyQueryState } from "../EmptyState/EmptyQueryState";
import { QueryList } from "../Queries";

import { UserConnectionsModal } from "./UserConnectionModal";
import { ManageWalletsModal, AddWalletModal } from "./ManageWalletModal";
import { ProfileSettingsModal } from "./ProfileSettingModal";

// =====================================
// ⬢ Types
// =====================================
interface ProfileComponentProps {
  user: any | null;
  isLoading: boolean;
  isOwnProfile?: boolean;
  initialDocuments?: ApiDocument[];
  pageSize?: number;
  isFollowing: boolean;
}

// =====================================
// ⬢ Profile Component
// =====================================
const ProfileComponent = ({
  user,
  isLoading,
  isOwnProfile = false,
  initialDocuments = [],
  pageSize = 20,
  isFollowing,
}: ProfileComponentProps) => {
  const [optimisticFollowing, setOptimisticFollowing] = useState<
    boolean | null
  >(null);
  const currentFollowing = optimisticFollowing ?? isFollowing ?? false;
  const { follow, unfollow, mutationLoading } = useUser({
    userId: user?.id,
    skip: isOwnProfile || !user?.id,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const [isWalletsModalOpen, setIsWalletsModalOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"followers" | "following">("followers");
  const workspaceId = useStringQuery("workspace");

  const {
    documents,
    loading: docsLoading,
    loadingMore,
    hasMore,
    loadMore,
  } = useUserPublicDocuments(user?.id ?? null, pageSize, initialDocuments);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    loading: docsLoading || loadingMore,
    onLoadMore: loadMore,
  });

  // ─── MUTATION HOOKS ───
  // We extract only the mutations/states we need for editing.
  // Hooks must always be called, even if not used (Rules of Hooks).
  const { updateProfile, error } = useCurrentUser();
  const {
    wallets: ownWallets,
    addWallets,
    loading: updateLoading,
  } = useWallets();

  // Determine which wallets to display based on profile ownership
  const displayWallets = isOwnProfile
    ? ownWallets
    : user?.settings?.wallets || [];

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedWallet(text);
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="w-4 h-4 text-[#1C3B5A]" />;
      case "github":
        return <Github className="w-4 h-4 text-[#1C3B5A]" />;
      case "website":
        return <Globe className="w-4 h-4 text-[#1C3B5A]" />;
      case "telegram":
        return <LinkIcon className="w-4 h-4 text-[#1C3B5A]" />;
      case "discord":
        return <LinkIcon className="w-4 h-4 text-[#1C3B5A]" />;
      default:
        return <LinkIcon className="w-4 h-4 text-[#1C3B5A]" />;
    }
  };

  const userForModal =
    user && isOwnProfile
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          avater: user.avatar,
          fullName: user.fullName,
          settings: user.settings,
        }
      : null;

  return (
    <>
      <div className="min-h-screen transition-colors font-body">
        {isLoading ? (
          <div className="mx-auto min-h-screen w-full flex items-center justify-center px-4 py-8">
            <Loader />
          </div>
        ) : !user ? (
          <div className=" mx-auto md:px-4 py-8">
            <p className="text-center text-ink-200 dark:text-ink-400">
              No user found
            </p>
          </div>
        ) : (
          <div className=" mx-auto px-4 md:py-8 py-2 lg:w-[85%]">
            <h2 className="text-base font-bold mb-4">Profile</h2>
            <div className="space-y-6">
              <div className="flex md:flex-row flex-col gap-x-4">
                {/* ─── LEFT: USER INFO ─── */}
                <div className=" rounded-2xl md:p-8 flex-1">
                  <div className="flex flex-col gap-6">
                    <div className="flex gap-x-5 ">
                      <div className="flex-shrink-0">
                        {user.avatar ? (
                          <Image
                            width={96}
                            height={96}
                            src={user.avatar}
                            alt={user.username}
                            className="w-[6rem] h-[6rem] rounded-full border-border-secondary  border-[2.5px]"
                          />
                        ) : (
                          <Avatar>
                            <AvatarFallback className="relative overflow-hidden">
                              <Image
                                src="/img/avatar/avatar6.svg"
                                alt=""
                                width={96}
                                height={96}
                                className="object-cover border-border-secondary  border-[2.5px] rounded-full"
                              />
                              <span className="relative z-10 font-bold font-body text-white text-xl">
                                {user.firstName?.split(" ")[0]?.[0] ?? "U"}
                              </span>
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      {/* ─── ACTION BUTTON ─── */}
                      <div className="flex items-center gap-3">
                        {isOwnProfile ? (
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-0.5 rounded-lg transition-colors text-sm border border-[#DEE2E6] dark:border-border-tertiary text-[#6C757D] dark:text-black hover:bg-[#F8F9FA] bg-[#F8F9FA]"
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              const next = !currentFollowing;
                              setOptimisticFollowing(next);

                              try {
                                if (currentFollowing) {
                                  await unfollow();
                                } else {
                                  await follow();
                                }
                              } catch {
                                setOptimisticFollowing(null);
                              }
                            }}
                            disabled={mutationLoading}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-colors text-sm ${
                              currentFollowing
                                ? "bg-[#E9ECEF] dark:bg-[#262A30] text-ink-100 dark:text-white hover:bg-opacity-80"
                                : "bg-black text-white hover:bg-opacity-90"
                            }`}
                          >
                            {currentFollowing ? (
                              <>
                                <UserMinus className="w-4 h-4" /> Unfollow
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" /> Follow
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <p className="text-base capitalize font-medium text-ink-100 dark:text-white">
                            {user.firstName || user.username} {user.lastName}
                          </p>
                          <p className="text-ink-200 text-[15px] font-medium mt-1">
                            @{user.username}
                          </p>
                        </div>
                      </div>

                      {user?.settings?.statusText && (
                        <p className="text-[#6C757D] font-medium text-sm dark:text-white">
                          {user?.settings?.statusText}
                        </p>
                      )}

                      <div className="flex gap-4 gap-y-0 text-[0.95rem]">
                        <div>
                          <button
                            className="font-bold text-ink-100 dark:text-white"
                            onClick={() => {
                              setTab("followers");
                              setOpen(true);
                            }}
                          >
                            {user.followersCount ?? 0}

                            <span className="text-ink-400 ml-1 font-medium text-sm">
                              Followers
                            </span>
                          </button>
                        </div>
                        <div>
                          <button
                            className="font-bold text-ink-100 dark:text-white"
                            onClick={() => {
                              setTab("following");
                              setOpen(true);
                            }}
                          >
                            {user.followingCount ?? 0}
                            <span className="text-ink-400 ml-1 font-medium text-sm">
                              Following
                            </span>
                          </button>{" "}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-ink-400 font-medium">
                          {user.createdAt && (
                            <div className="flex items-center gap-1">
                              <PiCalendarDots className="w-4 h-4" />
                              Joined{" "}
                              {new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {user?.settings?.socialLinks &&
                        Object.keys(user.settings.socialLinks).length > 0 && (
                          <div className="flex gap-3">
                            {Object.entries(user.settings.socialLinks)
                              .filter(([, url]) => url)
                              .map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 rounded-xl border border-[#DEE2E6] dark:border-border-tertiary hover:bg-primary/20 hover:border-primary/20 hover:text-white transition-colors text-[#868E96] dark:text-ink-400 bg-[#F8F9FA] dark:bg-transparent"
                                >
                                  {getSocialIcon(platform)}
                                </a>
                              ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className="w-full flex-1 py-12 md:py-0">
                  {displayWallets && displayWallets.length > 0 ? (
                    <div className="bg-white dark:bg-base-200 rounded-2xl md:p-6">
                      <h2 className="px-2 py-0.5 font-medium text-ink-100 mb-4 bg-[#E9ECEF] dark:bg-base-100 inline-block text-sm rounded-lg">
                        Main Wallets
                      </h2>
                      <div className="space-y-3">
                        {displayWallets.slice(0, 2).map((wallet: any) => (
                          <div
                            key={wallet.address}
                            className="flex items-center justify-between p-4 py-2 rounded-xl dark:border-border-tertiary transition-colors bg-[#F8F9FA] dark:bg-base-200 border border-[#DEE2E6]"
                          >
                            <div className="flex-1">
                              <div className="flex flex-col">
                                <code className="text-sm text-[#6C757D] dark:text-ink-400 font-body font-medium">
                                  {truncateAddress(wallet.address)}
                                </code>
                                {wallet.chain && (
                                  <span className="text-xs text-[#6C757D] dark:text-ink-400 mt-0.5">
                                    {wallet.chain}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(wallet.address)}
                              className="p-2 rounded-full hover:bg-[#E9ECEF] dark:hover:bg-[#262A30] transition-colors"
                            >
                              {copiedWallet === wallet.address ? (
                                <Check className="w-4 h-4 text-[#A308F0]" />
                              ) : (
                                <Copy className="w-4 h-4 text-[#1C3B5A] dark:text-ink-400" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>

                      {isOwnProfile && (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsAddWalletOpen(true)}
                            className="bg-[#A308F0] py-3 px-5 rounded-xl mt-6 text-[#E9ECEF] xl:text-sm w-full text-start text-[13px] font-medium"
                          >
                            Add Wallet
                          </button>
                          <button
                            type="button"
                            className="text-[#A308F0] mt-3 text-[13px] font-medium"
                            onClick={() => setIsWalletsModalOpen(true)}
                          >
                            All Wallets
                          </button>
                        </>
                      )}
                    </div>
                  ) : isOwnProfile ? (
                    <div className="relative max-w-[380px] mx-auto mt-12">
                      <div className="absolute z-1 inset-0 top-[1rem] left-[1rem] right-[1rem] rounded-xl bg-[#D97EF9] opacity-40 h-full" />
                      <div className="absolute z-1 inset-0 top-[0.5rem] left-[0.5rem] right-[0.5rem] rounded-xl bg-[#C44DF5] opacity-60 h-full" />
                      <button
                        type="button"
                        onClick={() => setIsAddWalletOpen(true)}
                        className="relative z-[10] bg-[#A308F0] py-3 px-6 rounded-xl text-[#E9ECEF] xl:text-sm w-full text-start text-[13px] font-medium"
                      >
                        Add Wallet
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ─── PROJECTS ─── */}
              {/* ─── DOCUMENTS ─── */}
              <div className="rounded-2xl">
                <h2 className="text-base font-bold text-ink-100 dark:text-white mb-4">
                  Notebooks
                </h2>

                {docsLoading && documents.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-40 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse"
                      />
                    ))}
                  </div>
                ) : documents.length === 0 ? (
                  <EmptyQueryState message="No public queries yet." />
                ) : (
                  <>
                    <QueryList documents={documents} />
                    <div ref={sentinelRef} aria-hidden="true" className="h-1" />
                    {loadingMore && (
                      <div className="flex justify-center py-6">
                        <div className="h-6 w-6 border-2 border-ink-300 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {!hasMore && documents.length > 0 && (
                      <p className="text-center text-ink-300 text-sm py-6">
                        You&apos;ve reached the end.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isOwnProfile && (
        <>
          <ProfileSettingsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            user={userForModal}
            updateProfile={updateProfile}
            loading={updateLoading}
            error={error}
          />

          <ManageWalletsModal
            isOpen={isWalletsModalOpen}
            onClose={() => setIsWalletsModalOpen(false)}
            wallets={ownWallets}
            onWalletsChange={async updated => {
              await addWallets(
                updated.map(wallet => ({
                  address: wallet.address,
                  chain: wallet.chain ?? "",
                }))
              );
            }}
          />

          <AddWalletModal
            isOpen={isAddWalletOpen}
            onClose={() => setIsAddWalletOpen(false)}
            onAdd={async newWallet => {
              await addWallets([
                ...ownWallets,
                {
                  address: newWallet.address,
                  chain: newWallet.chain ?? "",
                },
              ]);
            }}
            existingAddresses={ownWallets.map(w => w.address)}
          />
        </>
      )}

      <UserConnectionsModal
        open={open}
        onClose={() => setOpen(false)}
        userId={user?.id}
        type={tab}
        workspaceId={workspaceId}
      />
    </>
  );
};

export default ProfileComponent;
