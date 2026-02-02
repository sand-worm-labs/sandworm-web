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
} from "lucide-react";
import { ActivityCalendar } from "react-activity-calendar";

import { useCurrentUser } from "../Visualization/hooks/useCurrentUser";
import { Loader } from "../Loader";
import { ProjectIcon } from "../Assets/ProjectIcon";

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

const ProfileComponent = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const { currentUser, settings, loading } = useCurrentUser();
  console.log(currentUser);

  const mockProfile: UserProfile = {
    id: "1",
    username: "sandworm",
    fullName: "Sandworm Labs",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sandworm",
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

  return (
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
            <div className="bg-white dark:bg-[#010100]  rounded-2xl p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {mockProfile.avatar ? (
                    <img
                      src={mockProfile.avatar}
                      alt={mockProfile.username}
                      className="w-32 h-32 rounded-full "
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
                      <p className="text-xl font-medium text-ink-100  dark:text-white">
                        {currentUser.firstName || currentUser.username}
                      </p>
                      <p className="text-ink-200 dark:text-gray-400">
                        @{currentUser.username}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-color text-sm ${
                        isFollowing
                          ? "bg-[#E9ECEF] dark:bg-[#262A30] text-ink-100  dark:text-white hover:bg-opacity-80"
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
                  </div>

                  {mockProfile.statusText && (
                    <p className="text-[#6C757D] dark:text-white">
                      {currentUser?.settings.statusText}
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
                        {new Date(mockProfile.memberSince).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-6 text-[0.95rem]">
                    <div>
                      <span className="font-medium text-ink-100  dark:text-white">
                        {mockProfile.followersCount}
                      </span>{" "}
                      <span className="text-ink-400 dark:text-gray-400 ml-1">
                        Followers
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-ink-100  dark:text-white">
                        {mockProfile.followingCount}
                      </span>{" "}
                      <span className="text-ink-400 dark:text-gray-400 ml-1">
                        Following
                      </span>
                    </div>
                  </div>

                  {mockProfile.socialLinks &&
                    Object.keys(mockProfile.socialLinks).length > 0 && (
                      <div className="flex gap-3">
                        {Object.entries(mockProfile.socialLinks).map(
                          ([platform, url]) => (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl border border-[#DEE2E6] dark:border-[#262A30] hover:bg-[#A308F0] hover:border-[#A308F0] hover:text-white transition-colors text-[#1C3B5A] dark:text-gray-400 bg-[#F8F9FA]"
                            >
                              {getSocialIcon(platform)}
                            </a>
                          )
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/*    {mockProfile.wallets && mockProfile.wallets.length > 0 && (
              <div className="bg-white dark:bg-[#010100]  rounded-2xl p-6">
                <h2 className="text-xl font-medium text-ink-100  dark:text-white mb-4">
                  Wallets
                </h2>
                <div className="space-y-3">
                  {mockProfile.wallets.map((wallet, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg  dark:border-[#262A30] hover:border-[#A308F0] transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {wallet.label && (
                            <span className="text-sm font-medium text-ink-100  dark:text-white">
                              {wallet.label}
                            </span>
                          )}
                          {wallet.chain && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#A308F0] bg-opacity-10 text-primary">
                              {wallet.chain}
                            </span>
                          )}
                        </div>
                        <code className="text-sm text-ink-200 dark:text-gray-400 font-mono">
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
            )} */}

            <div className="bg-white dark:bg-[#010100]  dark:border-[#262A30] rounded-2xl p-6">
              <h2 className="text-xl font-medium text-ink-100  dark:text-white mb-4">
                Activity
              </h2>
              <div className="overflow-x-auto w-full">
                <ActivityCalendar
                  data={mockActivityData}
                  theme={{
                    light: [
                      "#F3ECEC80",
                      "#CE76FB",
                      "#FDC7CF",
                      "#E3AFFD",
                      "#A308F0",
                    ],
                    dark: [
                      "#F3ECEC80",
                      "#CE76FB",
                      "#FDC7CF",
                      "#E3AFFD",
                      "#A308F0",
                    ],
                  }}
                  blockSize={12}
                  blockMargin={4}
                  fontSize={12}
                  hideColorLegend={false}
                  hideMonthLabels={false}
                  hideTotalCount={false}
                  style={{
                    width: "100%",
                  }}
                  labels={{
                    totalCount: "{{count}} contributions in the last year",
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl p-6">
              <h2 className="text-xl font-medium text-ink-100  dark:text-white mb-4">
                Projects
              </h2>
              <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
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
  );
};

export default ProfileComponent;
