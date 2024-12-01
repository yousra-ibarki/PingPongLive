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
  const positionRef = useRef({
    x_right: 13,
    y_right: 39,
    x_ball: 0,
    y_ball: 0,
    x_velocity: 0,
    y_velocity: 0,
    ball_owner: null,
  });

  const gameObjRef = useRef(null);

  const [gameState, setGameState] = useState({
    playerTwoN: "Loading...",
    playerTwoI: "./hourglass.svg",
    waitingMsg: "Searching for an opponent ...",
    count: 0,
    isStart: false,
    currentUser: null,
    player_name: null,
  });

  const handleBallPositions = useCallback((data) => {
    const { Ball } = gameObjRef.current;

    const distance = Math.sqrt(
      Math.pow(Ball.position.x - data.x_ball, 2) +
      Math.pow(Ball.position.y - data.y_ball, 2)
    );

    if(distance > 5){
      Body.setPosition(Ball, { x: data.x_ball, y: data.y_ball });
    }
    else{
      Body.translate(Ball, {
        x: (data.x_ball - Ball.position.x) * 0.1,
        y: (data.y_ball - Ball.position.y) * 0.1,
      });
    }

    Body.setVelocity(Ball, {
      x: data.x_velocity,
      y: data.y_velocity,
    });

    positionRef.current = {
      ...positionRef.current,
      x_ball: data.x_ball,
      y_ball: data.y_ball,
      x_velocity: data.x_velocity,
      y_velocity: data.y_velocity,
      // ball_owner: data.ball_owner,
    };

    }, []);
    

  const handleRightPositions = useCallback((data) => {
    positionRef.current = {
      ...positionRef.current,
      ball_owner: data.ball_owner,
      x_right: data.x_right,
      y_right: data.y_right,
    };
    setGameState((prev) => ({ ...prev,  }));
  }, []);
  // console.log("x: ", gameState.x_right, "y: ", gameState.y_right);
  // console.log("x: ", gameState.x_right, "y: ", gameState.y_right);

  const handlePlayerPaired = useCallback((data) => {
    setGameState((prev) => ({
      ...prev,
      waitingMsg: data.message,
      playerTwoN:
        prev.player_name === data.player2_name
          ? data.player1_name
          : data.player2_name,
      playerTwoI:
        prev.player_name === data.player2_name
          ? data.player1_img
          : data.player2_img,
    }));
  }, []);

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

  const handleGameMessage = useCallback(
    (event) => {
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
        case "right_positions":
          handleRightPositions(data);
          break;
        case "ball_positions":
          handleBallPositions(data);
          break;
        // case "canvas_resize":
        //   // Handle canvas resize from the other player
        //   if (gameObjRef.current && gameObjRef.current.render) {
        //     const { render } = gameObjRef.current;
        //     render.canvas.width = data.width;
        //     render.canvas.height = data.height;
        //     // You might need to adjust other elements based on the new canvas size
        //   }
        //   break;
        case "error":
          console.error("Game error:", data.message);
          break;
        default:
          console.log("Unhandled message type:", data.type);
      }
    },
    [
      handlePlayerPaired,
      handlePlayerCancel,
      handleCountdown,
      handleRightPositions,
      handleBallPositions,
    ]
  );

  const {
    sendJsonMessage: sendGameMessage,
    lastJsonMessage: lastGameMessage,
    readyState: gameReadyState,
  } = useWebSocket(
    gameState.currentUser
      ? `${config.wsUrl}/game/${gameState.currentUser}/`
      : null,
    {
      reconnectInterval: 3000,
      onOpen: () => {
        console.log("WebSocket connection opened 😃😃😃😃😃😃😃😃");
      },
      onMessage: handleGameMessage,
      onClose: () => {
        console.log("WebSocket connection closed 🥴🥴🥴🥴🥴🥴🥴🥴");
      },
    }
  );

  const setUser = useCallback((username) => {
    setGameState((prev) => ({ ...prev, currentUser: username }));
  }, []);

  const setPlayer1Name = useCallback((playerName) => {
    setGameState((prev) => ({ ...prev, player_name: playerName }));
  }, []);

  const contextValue = {
    gameState,
    sendGameMessage,
    gameReadyState,
    lastGameMessage,
    setUser,
    setPlayer1Name,
    positionRef,
    gameObjRef,
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
