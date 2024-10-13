import React from "react";


const CloseButton = ({ size = 24, color = "#000" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="bg-[#393E46] rounded-full p-1"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);



const Settings = () => {
  return (
    <div
      className="p-2 bg-[#131313] w-[95%] h-[85%] rounded-2xl \
                    border-[0.5px] border-[#FFD369] shadow-2xl"
    >
      <div className="w-full flex justify-end cursor-pointer">
        < CloseButton size={24} color="#FFD369" />
      </div>
      sitings
    </div>
  );
};

export default Settings;

