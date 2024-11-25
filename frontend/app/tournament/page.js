"use client";

import React from "react";
import { TreeGenerator } from "tournament-bracket-tree";
import "tournament-bracket-tree/dist/index.css";

const App = () => {
  // Mock images for players (can be replaced with backend data)
  const playerImages = [
    "./avatars/defaultAv_1.jpg",
    "./avatars/defaultAv_1.jpg",
    "./avatars/defaultAv_1.jpg",
    "./avatars/defaultAv_1.jpg",
    "./avatars/defaultAv_1.jpg",
    "./avatars/defaultAv_1.jpg",
    "./avatars/defaultAv_1.jpg",
    "./avatars/defaultAv_1.jpg",
  ];

  // Function to create a single-elimination tree dynamically
  const createTree = (players) => {
    if (players.length === 1) {
      // Base case: single player as winner
      return { data: { player: players[0] } };
    }

    const mid = Math.floor(players.length / 2);
    return {
      data: { player: "Winner" }, // Placeholder for winners
      right: createTree(players.slice(0, mid)), // Right subtree
      left: createTree(players.slice(mid)), // Left subtree
    };
  };

  // Generate the tree for 8 players
  const myTree = createTree(playerImages);

  // Function to render each node in the bracket
  const mapTournamentToNode = (game) => {
    return (
      <div
        style={{
          height: "100px",
          width: "100px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "10px",
          borderRadius: "100%",
          backgroundColor: "#FFD369",
          border: "3px solid #EEEEEE",
        }}
        className="text-[#224312]"
      >
        {game.player.startsWith("./") ? (
          <img
            src={game.player}
            alt="Player"
            style={{
              height: "95px",
              width: "101px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {game.player}
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className="App flex items-center justify-center h-[800px] border border-[#FFD369] rounded-lg"
      style={{ padding: "" }}
    >
      <div
        style={{ display: "flex", justifyContent: "center", gap: "50px" }}
        className="h-[80%]"
      >
        {/* Right Tree */}
        <TreeGenerator
          root="right" // Tree grows from the right
          mapDataToNode={mapTournamentToNode}
          tree={myTree.right} // Right subtree
          lineThickness={4}
          lineColor="#FFD369"
          lineLength={50}
        />
        {/* Final Match */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 20px",
            minWidth: "200px",
          }}
        >
          {mapTournamentToNode(myTree.data)}
        </div>
        {/* Left Tree */}
        <TreeGenerator
          root="left" // Tree grows from the left
          mapDataToNode={mapTournamentToNode}
          tree={myTree.left} // Left subtree
          lineThickness={4}
          lineColor="#FFD369"
          lineLength={50}
        />
      </div>
    </div>
  );
};

export default App;
