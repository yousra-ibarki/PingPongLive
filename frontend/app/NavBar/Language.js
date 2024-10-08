import React, { useState } from "react";
import { HiLanguage } from "react-icons/hi2";

const Language = ({ isSmall }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
      <div
        className="relative"
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        <div>
          <HiLanguage
            className={`h-6 w-6  cursor-pointer ${
              isSmall ? "lg:hidden" : " hidden lg:block"
            }`}
          />
        </div>
        {isMenuOpen && (
          <div
            className={`absolute -left-5 z-50 w-auto rounded-md  p-1 ${
              isSmall ? "lg:hidden" : "hidden lg:block"
            }`}
            style={{ backgroundColor: "#393E46" }}
          >
            <ul>
              <li className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black" >
                English
              </li>
              <li className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black" >
                Arabic
              </li>
              <li className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black" >
                French
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  export default Language;