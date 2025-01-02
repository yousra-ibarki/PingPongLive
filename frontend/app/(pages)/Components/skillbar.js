import React from 'react';

const SkillBar = ({ skillName, percentage }) => {
  return (
    <div className="mb-4 w-full">
      <div className="font-bold mb-1">{skillName}</div>
      <div className="relative w-full bg-gray-200 rounded-full h-4">
        <div 
          className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-right text-sm mt-1">{percentage}%</div>
    </div>
  );
};

export default SkillBar;
