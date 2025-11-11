"use client";

import { FaHeart } from "react-icons/fa";
import React from "react";

const FooterBottom: React.FC = () => {
  return (
	
     <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
      {/* Top Section */}
      <div>
        <p className="mb-0 text-center">					
        © {new Date().getFullYear()} VK Hair. All rights reserved.
        </p>
      </div>

      {/* Right Section */}
      <div>
        <p className="mt-2 text-center flex items-center justify-center gap-1">
          Built with{" "}
          <FaHeart
            className="text-red-600 text-base inline-block"
            aria-label="heart icon"
          />{" "}
          by{" "}
          <a
            href="https://portfolio-kappa-nine-76.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-600 font-semibold border-b-2 border-yellow-600 hover:text-yellow-400 hover:border-yellow-400 transition"
          >
            Mukesh Kumar
          </a>
        </p>
      </div>
    </div>
  );
};

export default FooterBottom;
