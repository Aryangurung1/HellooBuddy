import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Linkedin, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="h-64 w-full border-t border-gray-200 bg-white/75">
      <MaxWidthWrapper>
        <div className="flex flex-col gap-8 justify-center pt-12 items-center">
          <ul className="flex space-x-10">
            <li>
              <Link
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin
                  className="text-gray-500 hover:text-blue-700 transition-colors duration-300"
                  size={32}
                />
              </Link>
            </li>
            <li>
              <Link
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram
                  className="text-gray-500 hover:text-pink-500 transition-colors duration-300"
                  size={32}
                />
              </Link>
            </li>
            <li>
              <Link
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter
                  className="text-gray-500 hover:text-blue-500 transition-colors duration-300"
                  size={32}
                />
              </Link>
            </li>
          </ul>

          <ul className="flex space-x-10">
            <li className="hover:text-blue-500">
              <Link href="/">Home</Link>
            </li>
            <li className="hover:text-blue-500">
              <Link href="/pricing">Pricing</Link>
            </li>
            <li className="hover:text-blue-500">
              <Link href="mailto:contact@hellobuddy.com">Contact Us</Link>
            </li>
            <li className="hover:text-blue-500">
              <Link href="/About-us">About Us</Link>
            </li>
          </ul>

          {/* Footer Text */}
          <p className="text-gray-500">
            &copy; HelloBuddy | All Rights Reserved
          </p>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
