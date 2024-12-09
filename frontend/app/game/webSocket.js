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
    left_player: null,
    right_player: null,
    left_paddle_y: 0,
    right_paddle_y: 0,
  });
  const RacketWidth = 20;
  const RacketHeight = 150;
  const BallRadius = 17;
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
    const { ball, canvas_width } = data;

    const isPlayerOnRight = gameState.player_name !== positionRef.current.left_player

    // Calculate normalized positions
    const normalizedX = isPlayerOnRight ? canvas_width - ball.x : ball.x;
    // const mirroredBall = {
    //   x: isPlayerOnRight ? canvasWidth - ball.x : ball.x,
    //   vx: isPlayerOnRight ? -data.ball.vx : data.ball.vx,
    // }


    positionRef.current = {
      ...positionRef.current,
      x_ball: normalizedX,
      y_ball:  ball.y,
      x_velocity: isPlayerOnRight ? -ball.vx : ball.vx,
      y_velocity: ball.vy,
      ball_radius:  ball.radius,
    };


    if(data.scored){
      if(data.scored === 'left'){
        setGameState((prev) => ({...prev, scoreA: prev.scoreA + 1}))
      }else{
        setGameState((prev) => ({...prev, scoreB: prev.scoreB + 1}))
      }
    }
  }, [gameState.player_name]);

  const handleRightPositions = useCallback((data) => {
    positionRef.current = {
      ...positionRef.current,
      // x_right: data.x_right,
      y_right: data.y_right,
    };
    setGameState((prev) => ({ ...prev }));
  }, []);


  const handlePlayerPaired = useCallback((data) => {
    positionRef.current = {
      ...positionRef.current,
      left_player: data.left_player,
      right_player: data.right_player,
    };
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
    // console.log("AAAAAAAAAAAA", gameState.player_name)
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
        case "ball_reset":
          handleBallReset(data);
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
    RacketWidth,
    RacketHeight,
    BallRadius,
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
