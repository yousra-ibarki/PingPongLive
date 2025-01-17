"use client";
import { config } from "../Components/config";
import useWebSocket from "react-use-websocket";
import { GAME_CONSTANTS } from "./GameHelper";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";
import toast from "react-hot-toast";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const router = useRouter();

  const positionRef = useRef({
    x_right: 13,
    y_right: 39,
    x_ball: 0,
    y_ball: 0,
    left_player: null,
    right_player: null,
    isPlayerOnRight: null,
  });
  const [gameState, setGameState] = useState({
    playerTwoN: "Loading...",
    playerTwoI: "./hourglass.svg",
    waitingMsg: "Searching for an opponent ...",
    isStart: false,
    currentUser: null,
    player_name: null,
    scoreA: 0,
    scoreB: 0,
    isReload: false,
    mapNmber: 0,
    leavingMsg: null,
    reason: null,
  });


  const handlePaddleMove = useCallback(
    (data) => {
      positionRef.current.y_right = data.y_right;
    },
    [positionRef.current.y_right]
  );

  const handleBallPositions = useCallback(
    (data) => {
      const { ball, paddles } = data;

      const isPlayerOnRight =
        gameState.player_name !== positionRef.current.left_player;
      if (isPlayerOnRight) {
        positionRef.current = {
          ...positionRef.current,
          x_ball: GAME_CONSTANTS.ORIGINAL_WIDTH - ball.x,
          y_ball: ball.y,
          ball_radius: ball.radius,
          y_right: paddles.left.y, 
          y_left: paddles.right.y,
        };
      } else {
        positionRef.current = {
          ...positionRef.current,
          x_ball: ball.x,
          y_ball: ball.y,
          ball_radius: ball.radius,
          y_right: paddles.right.y,
          y_left: paddles.left.y,
        };
      }

      if (data.scored) {
        if (data.scored === "left" && !isPlayerOnRight) {
          setGameState((prev) => ({
            ...prev,
            scoreA: prev.scoreA + 1,
          }));
        } else if (data.scored === "left" && isPlayerOnRight) {
          setGameState((prev) => ({
            ...prev,
            scoreB: prev.scoreB + 1,
          }));
        } else if (data.scored == "right" && !isPlayerOnRight) {
          setGameState((prev) => ({
            ...prev,
            scoreB: prev.scoreB + 1,
          }));
        } else if (data.scored == "right" && isPlayerOnRight) {
          setGameState((prev) => ({
            ...prev,
            scoreA: prev.scoreA + 1,
          }));
        }
      }
    },
    [gameState.player_name, gameState.scoreB]
  );

  const handleRightPositions = useCallback((data) => {
    positionRef.current = {
      ...positionRef.current,
      y_right: data.y_right,
    };
  }, []);

  const handlePlayerPaired = useCallback(
    (data) => {
      const isLeftPlayer = data.left_player === gameState.player_name;
      positionRef.current = {
        ...positionRef.current,
        left_player: data.left_player,
        right_player: data.right_player,
        is_left_player: isLeftPlayer, 
      };

      setGameState((prev) => ({
        ...prev,
        waitingMsg: data.message,
        is_left_player: isLeftPlayer,
        playerTwoN:
          prev.player_name === data.player2_name
            ? data.player1_name
            : data.player2_name,
        playerTwoI:
          prev.player_name === data.player2_name
            ? data.player1_img
            : data.player2_img,
      }));
    },
    [gameState.player_name]
  );

  const handlePlayerCancel = useCallback((data) => {
    setGameState((prev) => ({
      ...prev,
      waitingMsg: data.message,
      playerTwoN:
        data.playertwo_name === prev.playerTwoN
          ? "Loading..."
          : prev.playerTwoN,
      playerTwoI:
        data.playertwo_img === prev.playerTwoI
          ? "./hourglass.svg"
          : prev.playerTwoI,
    }));
  }, []);

  const handleReloading = useCallback((data) => {
    setGameState((prev) => ({
      ...prev,
      leavingMsg: data.message,
      reason: data.reason,
    }));
  }, [router]);

  const handleCountdown = useCallback((data) => {
    setGameState((prev) => ({
      ...prev,
      count: data.time_remaining,
      isStart: data.is_finished,
    }));
  }, []);

  const setUser = useCallback((username) => {
    setGameState((prev) => ({ ...prev, currentUser: username }));
  }, []);

  const setPlayer1Name = useCallback((playerName) => {
    setGameState((prev) => ({ ...prev, player_name: playerName }));
  }, []);

  const setMapNmber = useCallback((mapNum) => {
    setGameState((prev) => ({ ...prev, mapNumber: mapNum }));
  }, []);

  // Tournament Handlers

  const [tournamentState, setTournamentState] = useState({
    status: null,
    playersNeeded: 0,
    currentRound: null,
    position: null,
    error: null,
    current_players: []
  });

  const handleError = useCallback((error, context) => {
    toast.error(`Error in ${context}: ${error.message || 'Unknown error'}`);
    setTournamentState(prev => ({
      ...prev,
      error: `Error in ${context}: ${error.message || 'Unknown error'}`
    }));
  }, []);

  const clearError = useCallback(() => {
    setTournamentState(prev => ({ ...prev, error: null }));
  }, []);

  const handleTournamentUpdate = useCallback((data) => {
    try {
      clearError();
      
      setTournamentState(prev => ({
        ...prev,
        status: data.status,
        playersNeeded: data.players_needed || prev.playersNeeded,
        currentRound: data.current_round || prev.currentRound,
        position: data.position || prev.position,
        current_players: data.current_players || prev.current_players,
        room_name: data.room_name || prev.room_name,
        bracket: data.bracket || prev.bracket,
        winner_id: data.winner_id || prev.winner_id,
        winner_img: data.winner_img || prev.winner_img,
        winner_name: data.winner_name || prev.winner_name,
        mapNum: data.mapNum || prev.mapNum,
      }));
      

      setGameState(prev => {
        const updates = { ...prev };

        // Handle different tournament states
        switch(data.status) {
          case 'tournament_cancelled':
            window.location.assign("/");
          case 'opponent_left':
            updates.waitingMsg = data.message || "Your opponent left the game. You win!";
            if (data.should_redirect) {
              // Set a short timeout to allow the message to be shown
              setTimeout(() => {
                setGameState(prev => ({
                  ...prev,
                  isStart: false,
                  count: 0
                }));
                router.push('/home?tournament=true');
              }, 3000);
            }
            break;

          case 'waiting':
            updates.waitingMsg = data.message || "Waiting for players...";
            break;
  
          case 'pre_match':
            updates.waitingMsg = "Tournament match forming...";
            updates.playerTwoN = data.opponent_name || prev.playerTwoN;
            updates.playerTwoI = data.opponent_img || prev.playerTwoI;
            break;
  
          case 'countdown':
            updates.waitingMsg = "All players are ready";
            updates.count = data.time_remaining;
            updates.isStart = data.time_remaining === 0;
            break;

  
          case 'finals_ready':
            updates.waitingMsg = "Finals starting soon!";
            updates.playerTwoN = data.opponent_name || prev.playerTwoN;
            updates.playerTwoI = data.opponent_img || prev.playerTwoI;
            break;
          
          case 'tournament_complete':
            updates.count = 0;
            updates.isStart = false;
            setTimeout(() => {
              router.push("/");
            }, 5000);
            break;

          case 'waiting_for_semifinal':
            updates.waitingMsg = data.message || "You won! Waiting for other semifinal match to complete...";
            updates.isStart = false;
            updates.count = 0;
            updates.scoreA = 0;
            updates.scoreB = 0;
            break;
          
          case 'semifinal_complete':
            updates.waitingMsg = data.message || "Semifinal match complete.";
            updates.isStart = false;
            updates.count = 0;
            break;
        
          case 'final_match_ready':
            updates.waitingMsg = "Finals starting soon!";
            updates.playerTwoN = data.opponent_name || prev.playerTwoN;
            updates.playerTwoI = data.opponent_img || prev.playerTwoI;
            updates.isStart = false;
            updates.count = 0;
            updates.scoreA = 0;
            updates.scoreB = 0;
            break;
          
          case 'tournament_winner':
            updates.waitingMsg = "Congratulations! You won the tournament!";
            updates.isStart = false;
            updates.count = 0;
            updates.scoreA = 0;
            updates.scoreB = 0;
            break;
          
          default:
            updates.waitingMsg = data.message || prev.waitingMsg;
        }
        
        return updates;
      });
      
    } catch (error) {
      handleError(error, 'tournament update');
    }
    if (data.status === 'waiting_for_semifinal' || data.status == 'final_match_ready') {
        router.push("/home?tournament=true");
    }
    if (data.status === 'tournament_winner') {
        router.push("/home?tournament=true");
    }
    if (data.status === 'tournament_complete') {
      setTimeout(() => {
          window.location.assign("/");
      }, 5000)
    }
  }, [handleError, clearError]);

  const handleTournamentCancel = useCallback((data) => {
  try {
    clearError();
    setGameState(prev => ({
      ...prev,
      waitingMsg: data.message,
      playerTwoN: data.playertwo_name || "Loading...",
      playerTwoI: data.playertwo_img || "./hourglass.svg",
      tournamentStatus: null,
      currentRound: null,
      remainingPlayers: null,
      isStart: false,
      count: 0
    }));
    
    setTournamentState(prev => ({
      ...prev,
      status: 'cancelled',
      playersNeeded: 0,
      currentRound: null,
      position: null,
      current_players: []
    }));
  } catch (error) {
    handleError(error, 'tournament cancellation');
  }
  }, [handleError, clearError]);

  const handleGameMessage = useCallback(
    (event) => {
      const data = JSON.parse(event.data);


      if (!data || !data.type) {
        toast.error("Invalid message received");
        return;
      }

      switch (data.type) {
        case "tournament_update":
          handleTournamentUpdate(data);
          break;
        case "tournament_cancel":
          handleTournamentCancel(data);
          break;
        case "player_paired":
          handlePlayerPaired(data);
          break;
        case "cancel":
          handlePlayerCancel(data);
          break;
        case "countdown":
          handleCountdown(data);
          break;
        case "right_positions":
          handleRightPositions(data);
          break;
        case "ball_positions":
          handleBallPositions(data);
          break;
        case "PaddleLeft_move":
          handlePaddleMove(data);
          break;
        case "reloading":
          handleReloading(data);
          break;
        case "error":
          toast.error("Error: " + data.message);
          break;
        default:
          toast.error("Unknown message type received");
      }
    },
    [
      handlePlayerPaired,
      handlePlayerCancel,
      handleCountdown,
      handleRightPositions,
      handleBallPositions,
      handlePaddleMove,
      handleTournamentUpdate,
      handleTournamentCancel,
      handleReloading,
    ]
  );

  const { sendJsonMessage: sendGameMessage, readyState } = useWebSocket(
    gameState.currentUser
      ? `${config.wsUrl}/game/${gameState.currentUser}/`
      : null,
    {
      reconnectInterval: 3000,
      onOpen: () => {
      },
      onMessage: handleGameMessage,
      onClose: () => {
      },
      onError: (error) => {
        toast.error("WebSocket error: " + error.message);
      }
    }
  );

  const contextValue = {
    gameState,
    sendGameMessage,
    setUser,
    setPlayer1Name,
    positionRef,
    setGameState,
    setMapNmber,
    tournamentState,
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};

export default WebSocketContext;
