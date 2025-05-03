"use client";

import { FaRegStar, FaStar, FaCodeBranch } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { twilight } from "react-syntax-highlighter/dist/esm/styles/prism";

import type { Query } from "@/types";
import { useQueryLike } from "@/hooks/useLikeQuery";
import { useModalStore } from "@/store/auth";
import { DicebearAvatar } from "../../DicebearAvatar";

interface QueryCardProps {
  query: Query;
  liked: boolean;
}

export const QueryCard = ({ query, liked }: QueryCardProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const openSignIn = useModalStore(state => state.openSignIn);
  const { toggleLike, loading } = useQueryLike(query.id, liked);

  const handleQueryClick = () => {
    router.push(`/workspace/${query.id}`);
  };

  const handleLikeClick = () => {
    if (!session?.user?.id) return openSignIn();
    toggleLike();
  };

  return (
    <div className="shadow-sm rounded-xl p-4 px-8 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          {query.image ? (
            <Image
              alt="user avatar"
              src={query.image}
              width={25}
              height={25}
              unoptimized
              className="rounded-full border-2"
            />
          ) : (
            <DicebearAvatar
              size={20}
              seed={query.creator}
              className="border-2"
            />
          )}

          <div className="ml-3 text-sm">
            <Link
              href={`/creators/${query.creator}`}
              className="hover:underline font-medium"
            >
              {query.username}
            </Link>
            <span className="mx-1">/</span>
            <button className="hover:underline" onClick={handleQueryClick}>
              {query.title}
            </button>
            <p className="text-xs text-[#ffffff90]">
              created {new Date(query.updatedAt).toLocaleDateString("en-US")}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center text-[#ffffff90] text-xs">
          <div className="flex items-center gap-1">
            <FaCodeBranch className="text-sm" />
            <span>{query.forked_by.length || 0} Forks</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={loading}
              className="hover:text-white"
            >
              {liked ? (
                <FaStar className="text-sm" />
              ) : (
                <FaRegStar className="text-sm" />
              )}
            </button>
            <span>{query.stared_by.length + (liked ? 1 : 0)} Stars</span>
          </div>
        </div>
      </div>

      <button type="button" onClick={handleQueryClick} className="mt-2 text-sm">
        <SyntaxHighlighter
          language="sql"
          style={twilight}
          customStyle={{
            margin: 0,
            background: "#ffffff10",
            borderRadius: 0,
            borderWidth: 1,
            borderColor: "#ffffff25",
            overflow: "hidden",
          }}
          wrapLines
          wrapLongLines
          showInlineLineNumbers
          showLineNumbers
          className="h-[10rem] rounded-none"
        >
          {query.query + "\n\n\n\n\n\n\n\n\n"}
        </SyntaxHighlighter>
      </button>
    </div>
  );
};
