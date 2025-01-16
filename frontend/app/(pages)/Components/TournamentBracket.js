import React, { useState, useEffect } from "react";
import { TreeGenerator } from "tournament-bracket-tree";
import "tournament-bracket-tree/dist/index.css";

const TournamentBracket = ({ tournamentState, gameState, playerPic }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // mobile breakpoint at 768px
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createSemifinalSlots = () => {
    // Initialize empty slots
    const slots = Array(4).fill().map(() => ({
      player: "./avatars/sand_clock.png",
      playerName: "Waiting..."
    }));

    // Handle different tournament states
    if (tournamentState.status === 'waiting' || tournamentState.status === 'countdown') {
      // Fill slots with current players during waiting and countdown
      if (tournamentState.current_players) {
        tournamentState.current_players.forEach((player, index) => {
          if (index < 4) {
            slots[index] = {
              player: player.img,
              playerName: player.name,
              isWinner: false
            };
          }
        });
      }
    } 
    // Handle tournament matches
    else if (tournamentState.bracket?.matches) {
      tournamentState.bracket.matches.forEach((match, matchIndex) => {
        match.players.forEach((player, playerIndex) => {
          if (player.info) {
            const slotIndex = matchIndex * 2 + playerIndex;
            slots[slotIndex] = {
              player: player.info.img,
              playerName: player.info.name,
              isWinner: match.winner === player.id
            };
          }
        });
      });
    }

    return slots;
  };

  const createFinalSlot = () => {
    if (tournamentState.status === 'tournament_complete' && 
        tournamentState.winner_id && 
        tournamentState.winner_img && 
        tournamentState.winner_name) {
      
      return {
        player: tournamentState.winner_img,
        playerName: tournamentState.winner_name,
        isWinner: true
      };
    }

    return {
      player: "./avatars/sand_clock.png",
      playerName: "Final Winner",
      isWinner: false
    };
  };

  const buildBracketTree = () => {
    const semifinalSlots = createSemifinalSlots();
    const finalSlot = createFinalSlot();

    // Helper function to get winner node info
    const getWinnerNode = (match) => {
      if (match?.winner) {
          // Get winner information
          const winnerInfo = match.players.find(p => p.id === match.winner)?.info;
          if (winnerInfo) {
              return {
                  player: winnerInfo.img,
                  playerName: winnerInfo.name,
                  isWinner: true
              };
          }
      }
      // For ongoing/waiting matches
      return {
          player: "./avatars/sand_clock.png",
          playerName: "Waiting...",
          isWinner: false
      };
    };

    const leftSemifinalNode = getWinnerNode(tournamentState.bracket?.matches?.[0]);
    const rightSemifinalNode = getWinnerNode(tournamentState.bracket?.matches?.[1]);

    // First semifinal match (left side)
    const leftBranch = {
      data: leftSemifinalNode,
      right: { data: semifinalSlots[0] },
      left: { data: semifinalSlots[1] }
    };

    // Second semifinal match (right side)
    const rightBranch = {
      data: rightSemifinalNode,
      right: { data: semifinalSlots[2] },
      left: { data: semifinalSlots[3] }
    };

    return {
      data: finalSlot,
      right: leftBranch,
      left: rightBranch
    };
  };

  const [bracketTree, setBracketTree] = useState(() => buildBracketTree());

  // Update bracket when tournament state changes
  useEffect(() => {
    setBracketTree(buildBracketTree());
  }, [tournamentState]);

  
  const truncateName = (name, maxLength = 8) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };

  const renderNode = (game) => {
    const hasValidImage = game.player && (
      game.player.startsWith("./") || 
      game.player.startsWith("http")
    );

    const nodeClass = game.isWinner ? 'winner-node' : '';
    const truncatedName = truncateName(game.playerName);

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
            <span className="absolute -bottom-6 text-xs text-center w-full text-white whitespace-nowrap" 
                  title={game.playerName}>
              {truncatedName}
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <img
              src="./avatars/sand_clock.png"
              alt="waiting"
              className="w-8 h-8"
            />
            <span className="absolute -bottom-6 text-xs text-center w-full text-white whitespace-nowrap"
                  title={game.playerName}>
              {truncatedName}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Return the JSX for the component...
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
              mapDataToNode={renderNode}
              tree={bracketTree.right}
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
              {renderNode(bracketTree.data)}
            </div>

            <TreeGenerator
              root={isMobile ? "top" : "left"}
              mapDataToNode={renderNode}
              tree={bracketTree.left}
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