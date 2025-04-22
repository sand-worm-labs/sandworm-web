"use client";

import { FaRegStar, FaStar, FaCodeBranch } from "react-icons/fa";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useRouter } from "next/navigation";
import { twilight } from "react-syntax-highlighter/dist/esm/styles/prism";
import Image from "next/image";

import type { Query } from "@/types";
import { useQueryLike } from "@/hooks/useLikeQuery";

import { DicebearAvatar } from "../DicebearAvatar";

export const QueryCard = ({ query }: { query: Query }) => {
  const { liked, toggleLike, loading } = useQueryLike(query.id);
  const router = useRouter();

  const openQueryInTab = (queryData: any) => {
    router.push(`/workspace/${queryData.id}`);
  };

  return (
    <div className="shadow-sm rounded-xl p-4 px-8   flex flex-col justify-between">
      <div className="flex justify-between">
        <div className="flex">
          {query.image ? (
            <div className="relative">
              <Image
                alt="user avatar"
                src={query.image}
                width={25}
                height={25}
                unoptimized
                className="rounded-full border-2"
              />
            </div>
          ) : (
            <DicebearAvatar
              size={20}
              seed={query.creator}
              className="border-2"
            />
          )}

          <div className="ml-3">
            <div className="text-[0.8rem] font-medium">
              <Link
                href={`/creators/${query.creator} `}
                className="hover:underline"
              >
                {query.username}
              </Link>{" "}
              /{" "}
              <button
                type="button"
                className="hover:underline"
                onClick={() => openQueryInTab(query)}
              >
                {query.title}
              </button>
            </div>
            <p className="text-xs text-[#ffffff90]">
              created {new Date(query.updatedAt).toLocaleDateString("en-US")}
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center font-medium text-[#ffffff90] space-x-1">
            <FaCodeBranch className="text-sm" />
            <span className="text-xs">{query.forked_by.length || 0} Forks</span>
          </div>
          <div className="flex items-center font-medium text-[#ffffff90] space-x-1">
            <button
              type="button"
              className="text-[#ffffff90] hover:text-white"
              onClick={toggleLike}
              disabled={loading}
            >
              {liked ? (
                <FaStar className="text-sm" />
              ) : (
                <FaRegStar className="text-sm" />
              )}
            </button>
            <span className="text-xs">
              {query.stared_by.length + (liked ? 1 : 0)} Stars
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="  mt-2 text-sm "
        onClick={() => openQueryInTab(query)}
      >
        <SyntaxHighlighter
          language="sql"
          style={{
            ...twilight,
          }}
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
          className="h-[10rem] rounded-none my-0"
        >
          {`${query.query}\n\n\n\n\n\n\n\n\n`}
        </SyntaxHighlighter>
      </button>
    </div>
  );
};
