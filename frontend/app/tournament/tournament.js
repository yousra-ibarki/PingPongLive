"use client";

import React from "react";
import { TreeGenerator } from "tournament-bracket-tree";
import "tournament-bracket-tree/dist/index.css";


// Function to render each node in the bracket
const mapTournamentToNode = (game) => {
  return (
    <div
      style={{
        height: "50px",
        width: "50px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "5px",
        borderRadius: "100%",
        backgroundColor: "#FFD369",
        border: "2px solid #222831",
      }}
      className="text-[#224312]"
    >
      {game.player.startsWith("./") ? (
        <img
          src={game.player}
          alt="Player"
          style={{
            height: "48px",
            width: "51px",
            borderRadius: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <p
          style={{
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          {game.player}
        </p>
      )}
    </div>
  );
};

const Tournament = ({ myTree }) => {
  return (
    <div className="flex justify-center h-[900px] w-full lg:h-[700px]">
        <div
          className="flex w-auto items-center rotate-90 lg:rotate-0 "
        >
          {/* Right Tree */}
          <TreeGenerator
            root="right" // Tree grows from the right
            mapDataToNode={mapTournamentToNode}
            tree={myTree.right} // Right subtree
            lineThickness={2}
            lineColor="#FFFFFF"
            lineLength={50}
          />
          {/* Final Match */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 5px",
            }}
          >
            {mapTournamentToNode(myTree.data)}
          </div>
          {/* Left Tree */}
          <TreeGenerator
            root="left" // Tree grows from the left
            mapDataToNode={mapTournamentToNode}
            tree={myTree.left} // Left subtree
            lineThickness={2}
            lineColor="#FFFFFF"
            lineLength={50}
          />
        </div>
    </div>
  );
};

export default Tournament;