import React from 'react';

const Popup = ({ children, onClose }) => {
  return (
    <div className="flex fixed inset-0 w-full items-center justify-center bg-black bg-opacity-50">
        {/* Close button positioned in the top right of the popup */}
        
        {children}
    </div>
  );
};

export default Popup;
