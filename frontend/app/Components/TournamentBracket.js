import React, { useState, useEffect } from "react";
import { TreeGenerator } from "tournament-bracket-tree";
import "tournament-bracket-tree/dist/index.css";

const TournamentBracket = ({ tournamentState, gameState, playerPic }) => {
  const [isMobile, setIsMobile] = useState(false);

  const createSemifinalSlots = () => {
    // Map players to their positions in the tournament
    const slots = Array(4).fill().map(() => ({
        player: "./avatars/sand_clock.png",
        playerName: "Waiting..."
    }));

    // Fill in known players
    if (tournamentState.current_players && Array.isArray(tournamentState.current_players)) {
        tournamentState.current_players.forEach((player, index) => {
            if (index < 4) {
                slots[index] = {
                    player: player.img,
                    playerName: player.name,
                    isWinner: checkIfWinner(player.id, tournamentState)
                };
            }
        });
    }

    return slots;
  };

  const createFinalSlot = () => {
    if (tournamentState.bracket?.final_match) {
      const finalMatch = tournamentState.bracket.final_match;
      
      // If there's a winner, show them with winner flag
      if (finalMatch.winner) {
        const winner = finalMatch.players.find(p => p.id === finalMatch.winner);
        if (winner && winner.info) {
          return {
            player: winner.info.img,
            playerName: winner.info.name,
            isWinner: true
          };
        }
      }
      
      // If finals are in progress (has players but no winner)
      if (finalMatch.players?.length > 0) {
        // Show first finalist while waiting for match completion
        const finalist = finalMatch.players[0];
        if (finalist && finalist.info) {
          return {
            player: finalist.info.img,
            playerName: finalist.info.name,
            isWinner: false
          };
        }
      }
    }
    
    // Default state when no final match data exists
    return {
      player: "./avatars/sand_clock.png",
      playerName: "Final Winner",
      isWinner: false
    };
  };
  
  const checkIfWinner = (playerId, state) => {
    if (!state.bracket?.matches) return false;
    
    // Check for winner in semifinals
    const isSemifinalWinner = state.bracket.matches.some(match => 
      match.winner === playerId
    );
    
    // Check for tournament winner
    const isTournamentWinner = state.bracket?.final_match?.winner === playerId;
    
    return isSemifinalWinner || isTournamentWinner;
  };

  const createInitialTree = () => {
    // Start with creating slots for semifinal round
    let semifinalSlots = createSemifinalSlots();
    // Create final slot
    let finalSlot = createFinalSlot();
    
    return createTree(semifinalSlots, finalSlot);
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

    const nodeClass = game.isWinner ? 'winner-node' : '';

    return (
      <div className={`relative w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] 
                flex justify-center items-center border border-[#FFFFFF] rounded-full
                mx-2 my-8 lg:mx-4 lg:my-12 ${nodeClass}`}>
        {hasValidImage ? (
          <>
            <img
              src={game.player}
              alt="Player"
              className="rounded-full object-cover w-full h-full"
            />
            <span className="absolute -bottom-6 text-xs text-center w-full text-white whitespace-nowrap">
              {game.playerName}
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <img
              src="./avatars/sand_clock.png"
              alt="waiting"
              className="w-8 h-8"
            />
            <span className="absolute -bottom-6 text-xs text-center w-full text-white whitespace-nowrap">
              {game.playerName}
            </span>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add style for winner highlighting
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .winner-node {
        border-color: #FFD369 !important;
        box-shadow: 0 0 10px #FFD369;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const myTree = createInitialTree();

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full overflow-x-auto overflow-y-auto">
        <div className="min-w-[300px] w-full flex justify-center p-4">
          <div className={`flex ${isMobile ? "flex-col" : "flex-row"} 
                        justify-center items-center
                        min-h-[400px] lg:min-h-[600px]
                        border rounded-2xl bg-[#393E46]
                        p-4 lg:p-8
                        ${isMobile ? 'mt-8' : ''}`}>
            <TreeGenerator
              root={isMobile ? "bottom" : "right"}
              mapDataToNode={mapTournamentToNode}
              tree={myTree.right}
              lineThickness={1}
              lineColor="#FFFFFF"
              lineLength={32}
            />
            
            <div className="flex flex-col items-center justify-center w-full md:w-auto py-8">
              <img
                src="./avatars/award.png"
                alt="trophy"
                className="hidden md:block w-12 h-16 mb-4"
              />
              {mapTournamentToNode(myTree.data)}
            </div>

            <TreeGenerator
              root={isMobile ? "top" : "left"}
              mapDataToNode={mapTournamentToNode}
              tree={myTree.left}
              lineThickness={1}
              lineColor="#FFFFFF"
              lineLength={32}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;