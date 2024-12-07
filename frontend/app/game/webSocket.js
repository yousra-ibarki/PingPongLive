"use client";
import { Body } from "matter-js";
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
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
  
  // Refs for game objects
  const positionRef = useRef({
    x_right: 13,
    y_right: 39,
    x_ball: 0,
    y_ball: 0,
    x_velocity: 0,
    y_velocity: 0,
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
        
        // Handle opponent info
        if (data.opponent_name) {
          updates.playerTwoN = data.opponent_name;
        }
        if (data.opponent_img) {
          updates.playerTwoI = data.opponent_img;
        }
        
        // Handle countdown
        if (data.status === 'countdown') {
          updates.count = data.time_remaining;
          updates.isStart = data.time_remaining === 0;
        }
        
        return updates;
      });

      // Handle match start
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

  // Game message handler
  const handleGameMessage = useCallback((event) => {
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
          
        case "error":
          handleError(new Error(data.message), 'server message');
          break;
          
        // Classic game handlers preserved
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

        default:
          console.log("Unhandled message type:", data.type);
      }
    } catch (error) {
      handleError(error, 'message processing');
    }
  }, [
    handleTournamentUpdate,
    handleTournamentCancel,
    handleTournamentMatchResult,
    handleError,
    clearError
  ]);

  // WebSocket setup
  const {
    sendJsonMessage: sendGameMessage,
    lastJsonMessage: lastGameMessage,
    readyState: gameReadyState,
  } = useWebSocket(
    gameState.currentUser
      ? `ws://127.0.0.1:8000/ws/${gameMode}/${gameState.currentUser}/`
      : null,
    {
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

  // Tournament control methods
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

  // User management methods
  const setUser = useCallback((username) => {
    setGameState(prev => ({ ...prev, currentUser: username }));
  }, []);

  const setPlayer1Name = useCallback((playerName) => {
    setGameState(prev => ({ ...prev, player_name: playerName }));
  }, []);

  // Context value
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
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};

export default WebSocketContext;