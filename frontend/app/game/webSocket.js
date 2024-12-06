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
  const RacketHeight = 130;
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
    // const { Ball } = gameObjRef.current;
    const { ball } = data;

    // const interpolationFactor = 0.1;
    // console.log("Received ball positions:", data); // Debug here
    console.log("left", positionRef.current.left_player)
    console.log("right", positionRef.current.right_player)
    console.log("gameState.playerTwoN", gameState.player_name)
    // const direction = data.ball_owner === gameState.playerTwoN ? 1 : -1;

    // const mirroredBall = {
    //   x: 
    // }
    const canvasWidth = data.canvas_width
    const isPlayerOnRight = gameState.player_name !== positionRef.current.right_player

    // if(gameState.player_name === positionRef.current.left_player)
    // {
    //   x_ball = ball.x;
    //   y_ball = ball.y
    //   radius = ball.radius
    // }
    // else
    // {
    //   canvas.width - ball.x
    // }
    const mirroredBall = {
      x: isPlayerOnRight ? canvasWidth - ball.x : ball.x,
      y: ball.y,
      radius: ball.radius,
    }


    positionRef.current = {
      ...positionRef.current,
      x_ball: mirroredBall.x,
      y_ball: mirroredBall.y,
      x_velocity: data.ball.vx,
      y_velocity: data.ball.vy,
      ball_radius: data.ball.radius,

      // left_paddle_y: data.paddles.left.y,
      // right_paddle_y: data.paddles.right.y,
      // dy_left: data.paddles.left.dy,
      // dy_right: data.paddles.right.dy,

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
    console.log("AAAAAAAAAAAA", gameState.player_name)
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

  // const handleBallReset = useCallback((data) => {
  //   // const { Ball } = gameObjRef.current;
  //   // Ensure the ball is reset to the exact position for both players
  //   if (positionRef.current && gameObjRef.current) {
  //     // Update the position reference with the reset data
  //     if (positionRef.current && Ball) {
  //       positionRef.current = {
  //         ...positionRef.current,
  //         x_ball: data.x_ball,
  //         y_ball: data.y_ball,
  //         x_velocity: data.x_velocity,
  //         y_velocity: data.y_velocity,
  //       };

  //       // If Matter.js Ball body is available, directly set the ball position and velocity
  //       Body.setPosition(Ball, {
  //         x: data.x_ball,
  //         y: data.y_ball,
  //       });

  //       Body.setVelocity(Ball, {
  //         x: data.x_velocity,
  //         y: data.y_velocity,
  //       });
  //     }
  //   }
  // }, []);

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
