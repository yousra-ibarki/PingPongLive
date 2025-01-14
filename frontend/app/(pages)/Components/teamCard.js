// Components/TeamCard.js

import React from "react";

const TeamCard = ({ member }) => {
  return (
    <div
      className="min-w-[300px] h-[460px] overflow-hidden transform transition-transform duration-300 group"
      // Optional: Add animation delays or other styles here
    >
      <img
        className="h-full w-full object-cover transition duration-300 group-hover:blur-sm"
        src={member.image}
        alt={`${member.name}'s photo`}
      />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center bg-black bg-opacity-60">
        {/* Social Links */}
        <div className="space-y-4 text-white text-sm">
          {/* GitHub */}
          <a
            href={member.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 hover:text-[#FFD369]"
          >
            {/* GitHub Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <path
                d="M12 0.5C5.37 0.5 0 5.87 0 12.5C0 17.25 3.438 21.5 8.205 23.54C8.805 23.65 9.025 23.3 9.025 23.0C9.025 22.7 9.015 22.05 9.01 21.2C5.672 21.9 4.968 19.61 4.968 19.61C4.42 18.25 3.63 17.9 3.63 17.9C2.545 17.15 3.72 17.16 3.72 17.16C4.922 17.25 5.56 18.42 5.56 18.42C6.64 20.31 8.53 19.78 9.16 19.5C9.28 18.72 9.59 18.2 9.93 17.9C7.27 17.6 4.47 16.52 4.47 11.8C4.47 10.5 4.92 9.45 5.66 8.6C5.54 8.3 5.17 7.0 5.8 5.3C5.8 5.3 6.8 5.0 9.0 6.3C9.94 6.1 11.0 6.0 12.0 6.0C13.0 6.0 14.06 6.1 15.0 6.3C17.2 5.0 18.2 5.3 18.2 5.3C18.83 7.0 18.47 8.3 18.35 8.6C19.09 9.45 19.54 10.5 19.54 11.8C19.54 16.53 16.73 17.59 14.06 17.88C14.44 18.28 14.8 19.0 14.8 20.0C14.8 21.3 14.79 22.3 14.79 23.0C14.79 23.3 15.0 23.65 15.61 23.54C20.37 21.5 23.81 17.25 23.81 12.5C23.81 5.87 18.44 0.5 12 0.5Z"
              />
            </svg>
            <span>GitHub</span>
          </a>

          {/* LinkedIn */}
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 hover:text-[#FFD369]"
          >
            {/* LinkedIn Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <path
                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.762 2.239 5 5 5h14c2.761 0 5-2.238 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.866-3.063-1.867 0-2.153 1.46-2.153 2.964v5.7h-3v-10h2.881v1.367h.041c.401-.757 1.38-1.555 2.842-1.555 3.041 0 3.604 2.002 3.604 4.6v5.586z"
              />
            </svg>
            <span>LinkedIn</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:${member.email}`}
            className="flex items-center space-x-2 hover:text-[#FFD369]"
          >
            {/* Email Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <path
                d="M4 4h16v16h-16z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M4 4l8 8 8-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span>Email</span>
          </a>
        </div>
        {/* Full Name at the Bottom */}
        <div className="absolute bottom-4 text-white font-serif text-lg">
          {member.name}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;