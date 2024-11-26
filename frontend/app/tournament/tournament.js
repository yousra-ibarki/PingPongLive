"use client";

import React, { useState, useEffect } from "react";
import { TreeGenerator } from "tournament-bracket-tree";
import "tournament-bracket-tree/dist/index.css";

// Function to render each node in the bracket
const mapTournamentToNode = (game) => {
  return (
    <div
      style={{}}
      className="m-2 md:m-[3px] w-[60px] h-[60px] lg:w-[77px] lg:h-[77px] lg:m-[14px]
                flex justify-center items-center border border-[#FFFFFF] rounded-full"
    >
      {game.player.startsWith("./") ? (
        <img
          src={game.player}
          alt="Player"
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <img
          src="./avatars/sand_clock.png"
          alt="nex-winner"
          className="flex w-8 h-8 justify-center items-center"
        ></img>
      )}
    </div>
  );
};

const Tournament = ({ myTree }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Update the layout based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Mobile if width < 768px
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={`flex ${
        isMobile ? "flex-col" : "flex-row"
      } justify-center items-center  my-5 md:mt-10 md:h-[400px] lg:h-[800px] border rounded-2xl bg-[#393E46]`}
    >
      {/* Right Tree */}
      <TreeGenerator
        root={isMobile ? "bottom" : "right"} // Vertical tree for mobile
        mapDataToNode={mapTournamentToNode}
        tree={myTree.right}
        lineThickness={1}
        lineColor="#FFFFFF"
        lineLength={32}
      />

      {/* Final Match Node */}
      <div
        style={{
          margin: isMobile ? "10px 0" : "0 10px",
        }}
        className="flex flex-col items-center w-full md:w-auto md:h-full"
      >
        <img
          src="./avatars/award.png"
          className="hidden md:block w-[60px] h-[100px]  text-white text-lg py-4 md:text-2xl lg:text-3xl"
        ></img>
        {mapTournamentToNode(myTree.data)}
      </div>

      {/* Left Tree */}
      <TreeGenerator
        root={isMobile ? "top" : "left"} // Vertical tree for mobile
        mapDataToNode={mapTournamentToNode}
        tree={myTree.left}
        lineThickness={1}
        lineColor="#FFFFFF"
        lineLength={35}
      />
    </div>
  );
};

export default Tournament;
