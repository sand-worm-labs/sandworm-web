/* eslint-disable no-nested-ternary */

"use client";

import { useState } from "react";
import {
  User,
  Calendar,
  Link as LinkIcon,
  Github,
  Twitter,
  Globe,
  UserPlus,
  UserMinus,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";

import { useCurrentUser } from "../Visualization/hooks/useCurrentUser";
import { Loader } from "../Loader";
import { ProjectIcon } from "../Assets/ProjectIcon";
import { useWallets } from "../Visualization/hooks/useWallets";

import { ProfileSettingsModal } from "./ProfileSettingModal";
import { ManageWalletsModal, AddWalletModal } from "./ManageWalletModal";

interface SocialLinks {
  twitter?: string;
  github?: string;
  website?: string;
  telegram?: string;
  discord?: string;
}

interface WalletInfo {
  address: string;
  chain?: string;
  label?: string;
}

interface UserProfile {
  id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  followersCount: number;
  followingCount: number;
  statusText?: string;
  statusUpdatedAt?: string;
  socialLinks?: SocialLinks;
  wallets?: WalletInfo[];
  memberSince?: string;
  location?: string;
  stats?: {
    queriesRun: number;
    datasetsAnalyzed: number;
    chainsTracked: number;
    totalViews: number;
  };
}

interface ProfileComponentProps {
  isOwnProfile?: boolean;
}

const ProfileComponent = ({ isOwnProfile = true }: ProfileComponentProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const { currentUser, loading, updateProfile, error } = useCurrentUser();

  const { wallets, addWallets, loading: updateLoading } = useWallets();

  const mockProfile: UserProfile = {
    id: "1",
    username: "sandworm",
    fullName: "Sandworm Labs",
    avatar: "/img/avatar/avatar2.svg",
    followersCount: 0,
    followingCount: 0,
    statusText: "Building the future of collaborative blockchain analytics",
    statusUpdatedAt: "2024-01-15T10:30:00Z",
    memberSince: "2023-06-15",
    location: "Global",
    socialLinks: {
      twitter: "https://twitter.com/sandwormlabs",
      github: "https://github.com/sandworm",
      website: "https://sandwormlabs.com",
      telegram: "https://t.me/sandwormlabs",
    },
    wallets: [],
    stats: {
      queriesRun: 3421,
      datasetsAnalyzed: 127,
      chainsTracked: 8,
      totalViews: 45231,
    },
  };

  const [isWalletsModalOpen, setIsWalletsModalOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);

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
        return <Twitter className="w-4 h-4" />;
      case "github":
        return <Github className="w-4 h-4" />;
      case "website":
        return <Globe className="w-4 h-4" />;
      case "telegram":
        return <LinkIcon className="w-4 h-4" />;
      case "discord":
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  const userForModal = currentUser
    ? {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        username: currentUser.username,
        email: currentUser.email,
        avater: currentUser.avatar,
        fullName: currentUser.fullName,
        settings: currentUser.settings,
      }
    : null;

  return (
    <>
      <div className="min-h-screen transition-colors font-body">
        {loading ? (
          <div className="mx-auto min-h-screen w-full flex items-center justify-center px-4 py-8">
            <Loader />
          </div>
        ) : !currentUser ? (
          <div className=" mx-auto md:px-4 py-8">
            <p className="text-center text-ink-200 dark:text-ink-400">
              No user found
            </p>
          </div>
        ) : (
          <div className=" mx-auto px-4 py-8 lg:w-[85%]">
            <h2 className="text-base font-bold mb-4">Profile</h2>
            <div className="space-y-6">
              <div className="flex md:flex-row flex-col gap-x-4">
                <div className=" rounded-2xl md:p-8 flex-1">
                  <div className="flex flex-col gap-6">
                    <div className="flex gap-x-5 ">
                      <div className="flex-shrink-0">
                        {mockProfile.avatar ? (
                          <Image
                            width={96}
                            height={96}
                            src={mockProfile.avatar}
                            alt={mockProfile.username}
                            className="w-[6rem] h-[6rem]  rounded-full"
                          />
                        ) : (
                          <div className="w-[7rem] h-[7rem] rounded-full bg-[#A308F0] flex items-center justify-center">
                            <User className="w-16 h-16 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {isOwnProfile ? (
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-1 rounded-lg font-medium transition-colors text-sm border border-[#DEE2E6] dark:border-border-tertiary text-[#6C757D] dark:text-black hover:bg-[#F8F9FA]  bg-[#F8F9FA]"
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsFollowing(!isFollowing)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-colors text-sm ${
                              isFollowing
                                ? "bg-[#E9ECEF] dark:bg-[#262A30] text-ink-100 dark:text-white hover:bg-opacity-80"
                                : "bg-black text-white hover:bg-opacity-90"
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <UserMinus className="w-4 h-4" />
                                Unfollow
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                Follow
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
                            {currentUser.firstName || currentUser.username}{" "}
                            {currentUser.lastName}
                          </p>
                          <p className="text-ink-200 text-[15px] font-medium mt-1">
                            @{currentUser.username}
                          </p>
                        </div>
                      </div>

                      {currentUser?.settings?.statusText && (
                        <p className="text-[#6C757D] font-medium text-sm dark:text-white">
                          {currentUser?.settings?.statusText}
                        </p>
                      )}

                      <div className="flex gap-4 gap-y-0 text-[0.95rem]">
                        <div>
                          <span className="font-bold text-ink-100 dark:text-white">
                            {mockProfile.followersCount}
                          </span>{" "}
                          <span className="text-ink-400  ml-0.5 font-medium text-sm">
                            Followers
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-ink-100 dark:text-white">
                            {mockProfile.followingCount}
                          </span>{" "}
                          <span className="text-ink-400  ml-0.5 font-medium text-sm">
                            Following
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-ink-400 font-medium ">
                          {currentUser.createdAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Joined{" "}
                              {new Date(
                                currentUser.createdAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {currentUser?.settings?.socialLinks &&
                        Object.keys(currentUser?.settings?.socialLinks).length >
                          0 && (
                          <div className="flex gap-3">
                            {Object.entries(currentUser?.settings?.socialLinks)
                              .filter(([, url]) => url)
                              .map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 rounded-xl border border-[#DEE2E6] dark:border-border-tertiary hover:bg-[#A308F0] hover:border-[#A308F0] hover:text-white transition-colors text-[#868E96] dark:text-ink-400 bg-[#F8F9FA] dark:bg-transparent"
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
                  {wallets && wallets.length > 0 ? (
                    <div className="bg-white dark:bg-base-200 rounded-2xl md:p-6">
                      <h2 className="px-2 py-0.5 font-medium text-ink-100 mb-4 bg-[#E9ECEF] dark:bg-base-100  inline-block text-sm rounded-lg">
                        Main Wallets
                      </h2>
                      <div className="space-y-3">
                        {wallets.map(wallet => (
                          <div
                            key={wallet.address}
                            className="flex items-center justify-between p-4 py-2 rounded-xl dark:border-border-tertiary   transition-colors bg-[#F8F9FA] dark:bg-base-200 border border-[#DEE2E6]"
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
                              className="p-2 rounded-lg hover:bg-[#E9ECEF] dark:hover:bg-[#262A30] transition-colors"
                            >
                              {copiedWallet === wallet.address ? (
                                <Check className="w-4 h-4 text-primary" />
                              ) : (
                                <Copy className="w-4 h-4 text-ink-200 dark:text-ink-400" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
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
                    </div>
                  ) : (
                    <div className="relative  max-w-[380px] mx-auto mt-12">
                      <div className="absolute z-1 inset-0  top-[1rem] left-[1rem] right-[1rem] rounded-xl bg-[#D97EF9] opacity-40 h-full" />
                      <div className="absolute z-1 inset-0 top-[0.5rem] left-[0.5rem] right-[0.5rem] rounded-xl bg-[#C44DF5] opacity-60 h-full" />
                      <button
                        type="button"
                        onClick={() => setIsAddWalletOpen(true)}
                        className="relative z-[10] bg-[#A308F0] py-3 px-6 rounded-xl text-[#E9ECEF] xl:text-sm w-full text-start text-[13px] font-medium"
                      >
                        Add Wallet
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl ">
                <h2 className="text-base font-bold text-ink-100 dark:text-white mb-4">
                  Projects
                </h2>
                <div className="text-center py-12 min-h-[20rem] flex flex-col items-center justify-center gap-2">
                  <ProjectIcon />
                  <p className="text-ink-200 dark:text-ink-400">
                    No projects yet
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
        wallets={wallets}
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
            ...wallets,
            {
              address: newWallet.address,
              chain: newWallet.chain ?? "",
            },
          ]);
        }}
        existingAddresses={wallets.map(w => w.address)}
      />
    </>
  );
};

export default ProfileComponent;
