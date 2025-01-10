import React from "react";

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
      <div className="bg-[#222831] p-6 rounded-lg shadow-lg relative border border-[#FFD369]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[#FFD369] text-lg font-bold"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
