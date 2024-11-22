"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const WebSocketContext = createContext(null);

// The main WebSocket Provider component that wraps the app
export const WebSocketProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    playerTwoN: "Loading...",
    playerTwoI: "./hourglass.svg",
    waitingMsg: "Searching for and opponent ...",
    count: 0,
    isStart: false,
    currentUser: null,
    player_name: null,
  });

  

  const {
    sendJsonMessage: sendGameMessage,
    lastJsonMessage: lastGameMessage,
    readyState: gameReadyState,
  } = useWebSocket(`ws://127.0.0.1:8000/ws/game/${gameState.currentUser}/`, {
    reconnectInterval: 3000,
    // shouldReconnect: true,
    onOpen: () => {
      console.log("WebSocket connection opened 😃😃😃😃😃😃😃😃");
    },
    onMessage: handleGameMessage,
    onClose: () => {
      console.log("WebSocket connection closed 🥴🥴🥴🥴🥴🥴🥴🥴");
    },
  });

  function handleGameMessage(event) {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "player_paired":
        handlePlayerPaired(data);
        break;
      case "cancel":
        handlePlayerCancel(data);
        break;
      case "countdown":
        handleCountdown(data);
        break;
      case "error":
        console.error("Game error:", data.message);
        break;
      default:
        console.log("Unhandled message type:", data.type);
    }
  }

  function handlePlayerPaired(data) {
    setGameState((prev) => ({
      ...prev,
      waitingMsg: data.message,
      playerTwoN: determinePlayerName(data), //!!?
      playerTwoI: determinePlayerImage(data),
    }));
    console.log("PLAYERTWOOOON ", gameState.playerTwoN);
  }
  function determinePlayerName(data) {
    return gameState.player_name === data.player2_name
      ? data.player1_name
      : data.player2_name;
  }

  function determinePlayerImage(data) {
    return gameState.player_name === data.player2_name
      ? data.player1_img
      : data.player2_img;
  }

  function handlePlayerCancel(data) {
    setGameState((prev) => ({
      ...prev,
      waitingMsg: data.message,
      playerTwoN:
        data.playertwo_name === prev.playerTwoN ? "Loading..." : prev.playerTwoN,
      playerTwoI:
        data.playertwo_img === prev.playerTwoI
          ? "./hourglass.svg"
          : prev.playerTwoI,
    }));
  }

  function handleCountdown(data) {
    setGameState((prev) => ({
      ...prev,
      count: data.time_remaining,
      isStart: data.is_finished,
    }));
  }
  const setUser = (username) => {
    console.log("this is username ", username);
    setGameState(prev => ({ ...prev, currentUser: username }));
  };
  const setPlayer1Name = (playerName) => {
    console.log("this is PLAYER1NAME ", playerName);
    setGameState(prev => ({ ...prev, player_name: playerName }));
  }

  const contextValue = {
    gameState,
    sendGameMessage,
    gameReadyState,
    lastGameMessage,
    setUser,
    setPlayer1Name,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use the WebSocket context
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};

export default WebSocketContext;
