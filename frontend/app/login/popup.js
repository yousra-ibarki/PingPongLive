import React from 'react';

const Popup = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#222831] p-6 rounded-lg shadow-lg w-full sm:w-2/3 h-3/4 border border-[#FFD369] relative">
        {/* Close button positioned in the top right of the popup */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-4xl"
          aria-label="Close"
        >
          &times; {/* Close icon */}
        </button>
        {children}
      </div>
    </div>
  );
};

export default Popup;
