// Components/HorizontalCardScroll.js

"use client";

import React, { useRef } from "react";
import TeamCard from "./teamCard";
import teamMembers from "../About/taemMembers";

const HorizontalCardScroll = () => {
  const scrollContainerRef = useRef(null);

  return (
    <div className="relative">
      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex flex-wrap justify-center items-center gap-3 space-x-6 tablet:space-x-10 overflow-x-auto"
      >
        {teamMembers.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
};

export default HorizontalCardScroll;