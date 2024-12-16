"use client";
import { config } from "../Components/config";
import { GAME_CONSTANTS } from "./Game";
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
    left_player: null,
    right_player: null,
    left_paddle_y: 0,
    right_paddle_y: 0,
    isPlayerOnRight: null,
    x_paddle_right: 0,
    y_paddle_right: 0,
    height_paddle_right: 0,
    x_paddle_left: 0,
    y_paddle_left: 0,
    height_paddle_left: 0,
  });
  const RacketWidth = 20;
  const RacketHeight = 130;
  const gameObjRef = useRef(null);

  const [gameState, setGameState] = useState({
    playerTwoN: "Loading...",
    playerTwoI: "./hourglass.svg",
    waitingMsg: "Searching for an opponent ...",
    count: 0,
    isStart: false,
    currentUser: null,
    player_name: null,
    scoreA: 0,
    scoreB: 0,
  });

  const setUser = useCallback((username) => {
    setGameState((prev) => ({ ...prev, currentUser: username }));
  }, []);

  const setPlayer1Name = useCallback((playerName) => {
    setGameState((prev) => ({ ...prev, player_name: playerName }));
  }, []);

  const handlePaddleMove = useCallback(
    (data) => {
      positionRef.current.y_right = data.y_right;
    },
    [positionRef.current.y_right]
  );

  const handleBallPositions = useCallback((data) => {
    const { ball, canvas_width, paddles } = data;

    const isPlayerOnRight =
      gameState.player_name !== positionRef.current.left_player;
    
    if (isPlayerOnRight) {
      positionRef.current = {
        ...positionRef.current,
        x_ball: GAME_CONSTANTS.ORIGINAL_WIDTH - ball.x,
        y_ball: ball.y,
        x_velocity: -ball.vx,
        y_velocity: ball.vy,
        ball_radius: ball.radius,
        // Mirror paddle positions too
        y_right: paddles.left.y, // Note the swap
        y_left: paddles.right.y,
      };
    } else {
      positionRef.current = {
        ...positionRef.current,
        x_ball: ball.x,
        y_ball: ball.y,
        x_velocity: ball.vx,
        y_velocity: ball.vy,
        ball_radius: ball.radius,
        y_right: paddles.right.y,
        y_left: paddles.left.y,
      };
    }

    if (data.scored) {
      if (data.scored === "left") {
        setGameState((prev) => ({
          ...prev,
          scoreA: isPlayerOnRight ? prev.scoreB + 1 : prev.scoreA + 1,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          scoreB: isPlayerOnRight ? prev.scoreA + 1 : prev.scoreB + 1,
        }));
      }
    }
    }, [gameState.player_name]);

    const handleRightPositions = useCallback((data) => {
      positionRef.current = {
        ...positionRef.current,
        // x_right: data.x_right,
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
        is_left_player: isLeftPlayer, // Store which paddle this player controls
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
        case "PaddleLeft_move":
          handlePaddleMove(data);
          break;
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

  const contextValue = {
    gameState,
    sendGameMessage,
    gameReadyState,
    lastGameMessage,
    setUser,
    setPlayer1Name,
    positionRef,
    gameObjRef,
    RacketWidth,
    RacketHeight,
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
