/* eslint-disable no-nested-ternary */

"use client";

import { useState } from "react";
import {
  User,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Github,
  Twitter,
  Globe,
  UserPlus,
  UserMinus,
  Pencil,
  Copy,
  Check,
} from "lucide-react";
import { ActivityCalendar } from "react-activity-calendar";

import { useCurrentUser } from "../Visualization/hooks/useCurrentUser";
import { Loader } from "../Loader";
import { ProjectIcon } from "../Assets/ProjectIcon";

import { ProfileSettingsModal } from "./ProfileSettingModal";

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
  const {
    currentUser,
    settings,
    loading,
    updateUser,
    updateUserSettings,
    loading: updateLoading,
    error,
  } = useCurrentUser();

  const mockProfile: UserProfile = {
    id: "1",
    username: "sandworm",
    fullName: "Sandworm Labs",
    avatar: "/apps/web/public/img/",
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
    wallets: [
      {
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        chain: "Ethereum",
        label: "Main Wallet",
      },
      {
        address: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
        chain: "Base",
        label: "Trading",
      },
    ],
    stats: {
      queriesRun: 3421,
      datasetsAnalyzed: 127,
      chainsTracked: 8,
      totalViews: 45231,
    },
  };

  const mockActivityData = Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (364 - i));
    return {
      date: date.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 15),
      level: Math.floor(Math.random() * 5) as 0 | 1 | 2 | 3 | 4,
    };
  });

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
      }
    : null;

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-[#010100] transition-colors font-body">
        {loading ? (
          <div className="mx-auto min-h-screen w-full flex items-center justify-center px-4 py-8">
            <Loader />
          </div>
        ) : !currentUser ? (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <p className="text-center text-ink-200 dark:text-gray-400">
              No user found
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="space-y-6">
              <div className="flex gap-x-4">
                <div className="bg-white dark:bg-[#010100] rounded-2xl p-8 flex-1">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      {mockProfile.avatar ? (
                        <img
                          src={mockProfile.avatar}
                          alt={mockProfile.username}
                          className="w-32 h-32 rounded-full"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-[#A308F0] flex items-center justify-center">
                          <User className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <p className="text-xl font-medium text-ink-100 dark:text-white">
                            {currentUser.firstName || currentUser.username}
                          </p>
                          <p className="text-ink-200 dark:text-gray-400">
                            @{currentUser.username}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {isOwnProfile ? (
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(true)}
                              className="flex items-center gap-2 px-4 py-1 rounded-lg font-medium transition-colors text-sm border border-[#DEE2E6] dark:border-[#262A30] text-[#6C757D] dark:text-white hover:bg-[#F8F9FA] dark:hover:bg-[#262A30] bg-[#F8F9FA]"
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

                      {settings?.statusText && (
                        <p className="text-[#6C757D] dark:text-white">
                          {settings.statusText}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-ink-200 dark:text-gray-400">
                        {mockProfile.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {mockProfile.location}
                          </div>
                        )}
                        {mockProfile.memberSince && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Joined{" "}
                            {new Date(
                              mockProfile.memberSince
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-6 text-[0.95rem]">
                        <div>
                          <span className="font-medium text-ink-100 dark:text-white">
                            {mockProfile.followersCount}
                          </span>{" "}
                          <span className="text-ink-400 dark:text-gray-400 ml-1">
                            Followers
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-ink-100 dark:text-white">
                            {mockProfile.followingCount}
                          </span>{" "}
                          <span className="text-ink-400 dark:text-gray-400 ml-1">
                            Following
                          </span>
                        </div>
                      </div>

                      {settings?.socialLinks &&
                        Object.keys(settings.socialLinks).length > 0 && (
                          <div className="flex gap-3">
                            {Object.entries(settings.socialLinks)
                              .filter(([_, url]) => url)
                              .map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 rounded-xl border border-[#DEE2E6] dark:border-[#262A30] hover:bg-[#A308F0] hover:border-[#A308F0] hover:text-white transition-colors text-[#1C3B5A] dark:text-gray-400 bg-[#F8F9FA] dark:bg-transparent"
                                >
                                  {getSocialIcon(platform)}
                                </a>
                              ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className="w-full flex-1">
                  {mockProfile.wallets && mockProfile.wallets.length > 0 && (
                    <div className="bg-white dark:bg-[#010100] rounded-2xl p-6">
                      <h2 className="px-2 py-0.5 font-medium text-ink-100 dark:text-white mb-4 bg-[#E9ECEF] inline-block text-sm rounded-lg">
                        Main Wallets
                      </h2>
                      <div className="space-y-3">
                        {mockProfile.wallets.map((wallet, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 py-2 rounded-2xl dark:border-[#262A30]   transition-colors bg-[#F8F9FA] border border-[#DEE2E6]"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {/*   {wallet.label && (
                              <span className="text-sm font-medium text-ink-100 dark:text-white">
                                {wallet.label}
                              </span>
                            )} */}
                                {/*    {wallet.chain && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#A308F0] bg-opacity-10 text-primary">
                                {wallet.chain}
                              </span>
                            )} */}
                              </div>
                              <code className="text-sm text-[#6C757D] dark:text-[#6C757D] font-body font-medium">
                                {truncateAddress(wallet.address)}
                              </code>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(wallet.address)}
                              className="p-2 rounded-lg hover:bg-[#E9ECEF] dark:hover:bg-[#262A30] transition-colors"
                            >
                              {copiedWallet === wallet.address ? (
                                <Check className="w-4 h-4 text-primary" />
                              ) : (
                                <Copy className="w-4 h-4 text-ink-200 dark:text-gray-400" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

          

              <div className="rounded-2xl p-6 ">
                <h2 className="text-base font-bold text-ink-100 dark:text-white mb-4" >
                  Projects
                </h2>
                <div className="text-center py-12 min-h-[20rem] flex flex-col items-center justify-center gap-2">
                  <ProjectIcon />
                  <p className="text-ink-200 dark:text-gray-400">
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
        settings={settings}
        updateUser={updateUser}
        updateUserSettings={updateUserSettings}
        loading={updateLoading}
        error={error}
      />
    </>
  );
};

export default ProfileComponent;
