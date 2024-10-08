import React, { useState } from "react";

const User = ({ isSmall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div
      //   className="relative"
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <button>
        <img
          src="./avatar1.jpg"
          alt="avatar"
          className={`w-16 h-16 rounded-full cursor-pointer border-2 mr-5 ${isSmall ? "lg:hidden" : "hidden lg:block"} `}
          style={{ borderColor: "#FFD369" }}
        />
        {/* <span>User</span> */}
      </button>
      {isMenuOpen && (
        <div
          className={`absolute z-50 w-auto rounded-md bg-white text-nowrap right-3 p-1 ${isSmall ? "lg:hidden" : "hidden lg:block"}`}
          style={{ backgroundColor: "#393E46" }}
        >
          <ul>
            <a>
              <li className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black">
                My Pofile
              </li>
            </a>
            <a>
              <li className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black">
                Settings
              </li>
            </a>
            <a>
              <li className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black">
                Logout
              </li>
            </a>
          </ul>
        </div>
      )}
    </div>
  );
};

export default User;
