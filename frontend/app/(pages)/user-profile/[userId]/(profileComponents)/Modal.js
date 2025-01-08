import React from "react";

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
      <div className="bg-black p-7 rounded-lg shadow-lg relative border border-[#FFD369] w-[90%] md:w-[80%] lg:w-[50%]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-[#393E46] rounded-full w-5 text-[#FFD369] hover:text-[#393E46] text-sm font-bold hover:bg-[#FFC857] transition duration-300"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
