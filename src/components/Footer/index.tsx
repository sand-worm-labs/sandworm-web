import Link from "next/link";
import { FaGithub, FaDiscord, FaTwitter } from "react-icons/fa";

const MainFooter = () => {
  return (
    <footer className=" p-4 text-sm text-gray-400 border-t border-gray-700 mt-16">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <span>© 2025 Sandworm</span>
          <Link href="/" className="hover:text-white">
            Docs
          </Link>
          <Link href="/" className="hover:text-white">
            CLI
          </Link>
          <Link href="/" className="hover:text-white">
            Terms & Conditions
          </Link>
        </div>
        <div className="flex space-x-4">
          <Link href="/" className="hover:text-white">
            <FaGithub size={18} />
          </Link>
          <Link href="/" className="hover:text-white">
            <FaDiscord size={18} />
          </Link>
          <Link href="/" className="hover:text-white">
            <FaTwitter size={18} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
