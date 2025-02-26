"use client";

import { FaHeart, FaUser } from "react-icons/fa";
import Link from "next/link";

const QueryCard = ({ query }: { query: any }) => {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl p-4 px-8 border border-[#E2E8F0] flex justify-between">
      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-2">
          {query.name}
        </h2>
        <div className="flex space-x-4 items-center">
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm  font-[500]">
            <FaUser className="mr-2 text-[#475569]" />
            <Link
              href={`/creators/${query.author.id}`}
              className="hover:underline text-[#475569]"
            >
              {query.author.username}
            </Link>
          </div>

          {/* Last Updated */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(query.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center text-gray-600 dark:text-gray-400">
        <span className="text-[#1E293B] text-sm font-medium">
          {query.saves}
        </span>
        <FaHeart className="ml-2 text-[#4F46E5] text-lg" />
      </div>
    </div>
  );
};

export default QueryCard;
