import { FaHeart, FaUser } from "react-icons/fa";
import Link from "next/link";

const QueryCard = ({ query }: { query: any }) => {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-4 border border-gray-200 dark:border-gray-800">
      {/* Query Name */}
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        {query.name}
      </h2>

      {/* Author */}
      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
        <FaUser className="mr-2 text-blue-500" />
        <Link
          href={`/profile/${query.author.id}`}
          className="hover:underline text-blue-600 dark:text-blue-400"
        >
          {query.author.username}
        </Link>
      </div>

      {/* Last Updated */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Last updated: {new Date(query.updatedAt).toLocaleDateString()}
      </p>

      {/* Saves/Likes */}
      <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
        <FaHeart className="mr-1 text-red-500" />
        <span className="text-sm">{query.saves} saves</span>
      </div>
    </div>
  );
};

export default QueryCard;
