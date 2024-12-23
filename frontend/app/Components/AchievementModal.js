import React, { useEffect } from "react";

const AchievementModal = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Automatically close the modal after 5 seconds
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null; // Render nothing if no achievement

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative bg-[#1B1E3D] text-white rounded-lg shadow-lg w-11/12 md:w-2/5 p-6 animate-fade-in">
        {/* Golden Border */}
        <div className="absolute inset-0 border-4 border-[#FFD700] rounded-lg -z-10"></div>
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#FFD700]">
          New Achievement Unlocked!
        </h2>
        {/* Content */}
        <div className="mt-4 text-center">
          <p className="text-xl md:text-2xl text-[#E5E5E5] font-medium">
            "{achievement}"
          </p>
          <p className="mt-2 text-[#B8C1EC] text-lg">
            Congratulations! You've reached a new milestone.
          </p>
        </div>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#FFD700] text-[#1B1E3D] font-bold hover:bg-[#E5E5E5] hover:text-[#1B1E3D] transition duration-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AchievementModal;
