import Link from "next/link";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { SandwormLogo } from "../Assets/SandwormLogo";

const MainFooter = () => {
  return (
    <footer className=" p-4 text-sm text-text-gray border-t border-borderLight mt-16">
      <div className="container mx-auto grid grid-cols-3 pt-5 pb-8">
        <div>
          <Link href="/" className="flex items-center ">
            <SandwormLogo />
            <span className="ml-3 font-medium text-xl uppercase">
              Sandw0rm.
            </span>
          </Link>
        </div>
        <div className="flex space-y-4 flex-col">
          <span className="text-white font-medium mb-1">Resources</span>
          <Link href="/" className="hover:text-white">
            Docs
          </Link>
          <Link href="/" className="hover:text-white">
            Blog
          </Link>
          <Link href="/" className="hover:text-white">
            CLI
          </Link>
        </div>
        <div className="flex space-y-4 flex-col">
          <span className="text-white font-medium mb-1">Product</span>

          <Link href="/" className="hover:text-white">
            Terms & Conditions
          </Link>
          <Link href="/" className="hover:text-white">
            Contact Us
          </Link>
        </div>
      </div>
      <div className="mx-auto container flex justify-between py-4 ">
        <div>© Sandworm 2025</div>
        <div>
          <div className="flex space-x-6">
            <Link href="/" className="hover:text-white">
              <FaGithub size={20} />
            </Link>
            <Link href="/" className="hover:text-white">
              <FaDiscord size={20} />
            </Link>
            <Link href="/" className="hover:text-white">
              <FaXTwitter size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
