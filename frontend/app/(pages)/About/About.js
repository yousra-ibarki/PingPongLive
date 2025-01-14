// pages/About.js

import React from "react";
import HorizontalCardScroll from "../Components/HorizontalCardScroll";

const About = () => {
  return (
    <div className="flex justify-center items-center bg-[#222831] min-h-screen p-4">
      <div className="w-full h-full md:[1000px] lg:[800px] ">
        <HorizontalCardScroll />
      </div>
    </div>
  );
};

export default About;