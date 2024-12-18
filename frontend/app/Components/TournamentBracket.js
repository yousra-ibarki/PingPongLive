import React, { useState, useEffect } from "react";
import { TreeGenerator } from "tournament-bracket-tree";
import "tournament-bracket-tree/dist/index.css";

const TournamentBracket = ({ tournamentState, gameState, playerPic }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Initialize the tree with current tournament state
  const createInitialTree = () => {
    // Create initial array of 4 slots with waiting state
    let playerSlots = Array(4).fill().map(() => ({
      player: "./avatars/sand_clock.png",
      playerName: "Waiting..."
    }));

    // Calculate how many players have joined based on playersNeeded
    const joinedPlayersCount = 4 - (tournamentState.playersNeeded || 0);
    console.log("==> Joined Players Count:", joinedPlayersCount);

    // Fill the slots based on joined players count
    for (let i = 0; i < joinedPlayersCount; i++) {
      if (i === 0) {
        // Current player's data (we always have this)
        playerSlots[i] = {
          player: playerPic,
          playerName: gameState.player_name || "You"
        };
      } else if (gameState.playerTwoN && gameState.playerTwoI && i === 1) {
        // Second player's data if available
        playerSlots[i] = {
          player: gameState.playerTwoI,
          playerName: gameState.playerTwoN
        };
      } else {
        // For other joined players where we don't have specific data yet
        playerSlots[i] = {
          player: "./avatars/defaultAv_1.jpg",
          playerName: `Player ${i + 1}`
        };
      }
    }

    return createTree(playerSlots);
  };

  const createTree = (players) => {
    if (players.length === 1) {
      return { data: players[0] };
    }

    const mid = Math.floor(players.length / 2);
    return {
      data: {
        player: "",
        playerName: "Winner"
      },
      right: createTree(players.slice(0, mid)),
      left: createTree(players.slice(mid)),
    };
  };

  const mapTournamentToNode = (game) => {
    const hasValidImage = game.player && (
      game.player.startsWith("./") || 
      game.player.startsWith("http")
    );

    return (
      <div className="relative m-2 md:m-[3px] w-[60px] h-[60px] lg:w-[100px] lg:h-[100px] lg:m-[30px] lg:mt-[100px] lg:mb-[100px]
                flex justify-center items-center border border-[#FFFFFF] rounded-full">
        {hasValidImage ? (
          <>
            <img
              src={game.player}
              alt="Player"
              className="rounded-full object-cover w-full h-full"
            />
            {game.playerName && (
              <span className="absolute -bottom-6 text-xs text-center w-full text-white">
                {game.playerName}
              </span>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center">
            <img
              src="./avatars/sand_clock.png"
              alt="waiting"
              className="w-8 h-8"
            />
            <span className="absolute -bottom-6 text-xs text-center w-full text-white">
              Waiting...
            </span>
          </div>
        )}
      </div>
    );
  };

  // Mobile responsiveness handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const myTree = createInitialTree();

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      <div className={`flex ${
        isMobile ? "flex-col" : "flex-row"
      } justify-center items-center my-100 md:mt-10 md:h-[400px] lg:h-[800px] lg:w-[1000px] border rounded-2xl bg-[#393E46]`}>
        <TreeGenerator
          root={isMobile ? "bottom" : "right"}
          mapDataToNode={mapTournamentToNode}
          tree={myTree.right}
          lineThickness={1}
          lineColor="#FFFFFF"
          lineLength={32}
        />
        
        <div className="flex flex-col items-center w-full md:w-auto md:h-full">
          <img
            src="./avatars/award.png"
            alt="trophy"
            className="hidden md:block w-[60px] h-[100px]"
          />
          {mapTournamentToNode(myTree.data)}
        </div>

        <TreeGenerator
          root={isMobile ? "top" : "left"}
          mapDataToNode={mapTournamentToNode}
          tree={myTree.left}
          lineThickness={1}
          lineColor="#FFFFFF"
          lineLength={35}
        />
      </div>

      {/* Debug info */}
      <div className="text-white text-sm">
        <p>Players Needed: {tournamentState.playersNeeded}</p>
        <p>Status: {tournamentState.status}</p>
        <p>Message: {gameState.waitingMsg}</p>
      </div>
    </div>
  );
};

export default TournamentBracket;