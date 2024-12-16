"use client";
import { config } from "../Components/config";
import { Body } from "matter-js";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  // Core state
  const [gameState, setGameState] = useState({
    playerTwoN: "Loading...",
    playerTwoI: "./hourglass.svg",
    waitingMsg: "Searching for an opponent ...",
    count: 0,
    isStart: false,
    currentUser: null,
    player_name: null,
    player_side: null,
    scoreA: 0,
    scoreB: 0,
  });

  // Tournament-specific state
  const [tournamentState, setTournamentState] = useState({
    status: null,
    playersNeeded: 0,
    currentRound: null,
    position: null,
    error: null
  });

  const [gameMode, setGameMode] = useState("game");

  // Constants for game objects
  const RacketWidth = 20;
  const RacketHeight = 150;
  const BallRadius = 17;

  // Refs for game objects
  const positionRef = useRef({
    x_right: 13,
    y_right: 39,
    x_ball: 0,
    y_ball: 0,
    x_velocity: 0,
    y_velocity: 0,
    left_player: null,
    right_player: null,
    left_paddle_y: 0,
    right_paddle_y: 0,
    is_left_player: null,
    ball_radius: BallRadius,
  });

  const gameObjRef = useRef(null);

  // Error handling helper
  const handleError = useCallback((error, context) => {
    console.error(`WebSocket error in ${context}:`, error);
    setTournamentState(prev => ({
      ...prev,
      error: `Error in ${context}: ${error.message || 'Unknown error'}`
    }));
  }, []);

  // Clear error helper
  const clearError = useCallback(() => {
    setTournamentState(prev => ({ ...prev, error: null }));
  }, []);

  const setUser = useCallback((username) => {
    setGameState((prev) => ({ ...prev, currentUser: username }));
  }, []);

  const setPlayer1Name = useCallback((playerName) => {
    setGameState((prev) => ({ ...prev, player_name: playerName }));
  }, []);

  const handlePaddleMove = useCallback((data) => {
    positionRef.current.y_right = data.y_right;
  }, []);

  const handleBallPositions = useCallback((data) => {
    const isPlayerOnRight = gameState.player_name !== positionRef.current.left_player;
    const normalizedX = isPlayerOnRight ? data.canvas_width - data.ball.x : data.ball.x;

    positionRef.current = {
      ...positionRef.current,
      x_ball: normalizedX,
      y_ball: data.ball.y,
      x_velocity: isPlayerOnRight ? -data.ball.vx : data.ball.vx,
      y_velocity: data.ball.vy,
    };

    if(data.scored) {
      if(data.scored === 'left') {
        setGameState((prev) => ({...prev, scoreA: prev.scoreA + 1}));
      } else {
        setGameState((prev) => ({...prev, scoreB: prev.scoreB + 1}));
      }
    }
  }, [gameState.player_name]);

  const handleRightPositions = useCallback((data) => {
    positionRef.current = {
      ...positionRef.current,
      y_right: data.y_right,
    };
  }, []);

  const handlePlayerPaired = useCallback((data) => {
    const isLeftPlayer = data.left_player === gameState.player_name;
    positionRef.current = {
      ...positionRef.current,
      left_player: data.left_player,
      right_player: data.right_player,
      is_left_player: isLeftPlayer
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
  }, [gameState.player_name]);

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

  const handleCountdown = useCallback((data) => {
    setGameState((prev) => ({
      ...prev,
      count: data.time_remaining,
      isStart: data.is_finished,
    }));
  }, []);

  // Tournament message handlers
  const handleTournamentUpdate = useCallback((data) => {
    try {
      console.log("Received tournament update:", data);
      clearError();
      
      setTournamentState(prev => ({
        ...prev,
        status: data.status,
        playersNeeded: data.players_needed || prev.playersNeeded,
        currentRound: data.current_round || prev.currentRound,
        position: data.position || prev.position
      }));
      
      setGameState(prev => {
        const updates = {
          ...prev,
          waitingMsg: data.message || prev.waitingMsg
        };
        
        if (data.opponent_name) {
          updates.playerTwoN = data.opponent_name;
        }
        if (data.opponent_img) {
          updates.playerTwoI = data.opponent_img;
        }
        
        if (data.status === 'countdown') {
          updates.count = data.time_remaining;
          updates.isStart = data.time_remaining === 0;
        }
        
        return updates;
      });

      if (data.status === 'match_start') {
        window.location.assign("./game");
      }
    } catch (error) {
      handleError(error, 'tournament update');
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
        position: null
      }));
    } catch (error) {
      handleError(error, 'tournament cancellation');
    }
  }, [handleError, clearError]);

  const handleTournamentMatchResult = useCallback((data) => {
    try {
      clearError();
      setGameState(prev => ({
        ...prev,
        waitingMsg: data.message,
        tournamentStatus: data.result
      }));
      
      if (data.result === 'win') {
        console.log("Won match by forfeit");
      } else {
        console.log("Match lost");
      }
    } catch (error) {
      handleError(error, 'match result');
    }
  }, [handleError, clearError]);

  const handleGameMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", {
          type: data.type,
          mode: data.mode
        });

        clearError();

        switch (data.type) {
          case "tournament_update":
            handleTournamentUpdate(data);
            break;
          case "tournament_cancel":
            handleTournamentCancel(data);
            break;
          case "tournament_match_result":
            handleTournamentMatchResult(data);
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
          case "error":
            handleError(new Error(data.message), 'server message');
            break;
          default:
            console.log("Unhandled message type:", data.type);
        }
      } catch (error) {
        handleError(error, 'message processing');
      }
    },
    [
      handleTournamentUpdate,
      handleTournamentCancel,
      handleTournamentMatchResult,
      handlePlayerPaired,
      handlePlayerCancel,
      handleCountdown,
      handleRightPositions,
      handleBallPositions,
      handlePaddleMove,
      handleError,
      clearError
    ]
  );

  const {
    sendJsonMessage: sendGameMessage,
    lastJsonMessage: lastGameMessage,
    readyState: gameReadyState,
  } = useWebSocket(
    gameState.currentUser
      ? `${config.wsUrl}/${gameMode}/${gameState.currentUser}/`
      : null,
    {
      shouldReconnect: (closeEvent) => {
        return closeEvent.code !== 1000;
      },
      reconnectInterval: 3000,
      onOpen: () => {
        console.log("WebSocket connection opened");
        clearError();
      },
      onMessage: handleGameMessage,
      onError: (error) => handleError(error, 'connection'),
      onClose: () => {
        console.log("WebSocket connection closed");
      },
    }
  );

  // Tournament control methods - moved after useWebSocket hook
  const startTournament = useCallback(() => {
    try {
      clearError();
      sendGameMessage({
        type: "play",
        mode: "tournament"
      });
    } catch (error) {
      handleError(error, 'tournament start');
    }
  }, [sendGameMessage, handleError, clearError]);

  const leaveTournament = useCallback(() => {
    try {
      clearError();
      sendGameMessage({
        type: "tournament_cancel"
      });
    } catch (error) {
      handleError(error, 'tournament leave');
    }
  }, [sendGameMessage, handleError, clearError]);

  const contextValue = {
    gameState,
    tournamentState,
    setGameMode,
    sendGameMessage,
    gameReadyState,
    lastGameMessage,
    setUser,
    setGameState,
    setPlayer1Name,
    positionRef,
    gameObjRef,
    RacketWidth,
    RacketHeight,
    BallRadius,
    selectGameMode: (mode) => setGameMode(mode),
    startTournament,
    leaveTournament,
    clearError
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