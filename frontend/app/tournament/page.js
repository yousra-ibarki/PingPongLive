"use client";
import React from "react";
import Tournament from "./tournament";

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

  return (
    <div>
     <Tournament myTree={myTree} />    
    </div>
  );
};

export default App;
