"use client";

import React, { useState, useEffect } from "react";
import { TreeGenerator } from "tournament-bracket-tree";
import "tournament-bracket-tree/dist/index.css";

// Function to render each node in the bracket
const mapTournamentToNode = (game) => {
  return (
    <div
      style={{
        height: "60px", // Smaller for mobile
        width: "60px",
        margin: "5px",
      }}
      className="flex justify-center items-center border border-[#FFFFFF] rounded-full"
    >
      {game.player.startsWith("./") ? (
        <img
          src={game.player}
          alt="Player"
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <img src="./avatars/sand_clock.png" alt="nex-winner" className="flex w-8 h-8 justify-center items-center">
        </img>
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
      } justify-center items-center w-full h-auto lg:h-[800px] border`}
    >
      {/* Right Tree */}
      <TreeGenerator
        root={isMobile ? "bottom" : "right"} // Vertical tree for mobile
        mapDataToNode={mapTournamentToNode}
        tree={myTree.right}
        lineThickness={isMobile ? 0.5 : 1} // Thinner lines for mobile
        lineColor="#FFFFFF"
        lineLength={isMobile ? 20 : 30}
        nodeGap={isMobile ? 5 : 10}
      />

      {/* Final Match Node */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: isMobile ? "10px 0" : "0 10px",
        }}
      >
        {mapTournamentToNode(myTree.data)}
      </div>

      {/* Left Tree */}
      <TreeGenerator
        root={isMobile ? "top" : "left"} // Vertical tree for mobile
        mapDataToNode={mapTournamentToNode}
        tree={myTree.left}
        lineThickness={isMobile ? 0.5 : 1}
        lineColor="#FFFFFF"
        lineLength={isMobile ? 20 : 30}
        nodeGap={isMobile ? 5 : 10}
      />
    </div>
  );
};

export default Tournament;
