import { Star } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const DashboardHeader = () => {
  const board = {
    boardTitle: "Uniswap Degen Activity",
    isStarred: true,
    isOwner: true,
    user: {
      name: "Si",
      avatarUrl: "si.eth",
    },
  };

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 bg-black text-white border-b border-white/10 container mx-auto mt-12">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-medium tracking-tight">
          <Link href="/console" className="hover:underline">
            {board.user.name}{" "}
          </Link>
          / {board.boardTitle}
        </h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className={`border flex items-center space-x-1 px-3 font-medium bg-white/5 py-1 ${board.isStarred ? "" : "text-white"} hover:bg-white/10`}
        >
          <span className="font-semibold">22</span>
          <Star className="w-4 h-4" fill={board.isStarred ? "none" : "none"} />
        </Button>{" "}
        <Button
          variant="ghost"
          className={`border flex items-center space-x-1 px-3  bg-white/5 py-1 ${board.isStarred ? "" : "text-white"} hover:bg-white/10`}
        >
          Share
        </Button>
      </div>
    </header>
  );
};
