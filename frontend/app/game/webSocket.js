"use client";
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
    player_side: null,
  });

  const [gameMode, setGameMode] = useState("game");

  const handleBallPositions = useCallback((data) => {
    // Only update if the ball position is from the other player
    // setGameState((prev) => ({ ...prev, player_side: data.player_side }));
    // if (
    //   gameObjRef.current &&
    //   gameObjRef.current.Ball &&
    //   data.player_side !== positionRef.current.player_side
    // ) {
      // const { Ball } = gameObjRef.current;

      // Update ball position and velocity
      // Body.setPosition(Ball, {
      //   x: data.x_ball,
      //   y: data.y_ball,
      // });
      // if (gameState.player_side === "right") {
      //   console.log("right");
      //   Body.setVelocity(Ball, {
      //     x: data.x_velocity,
      //     y: data.y_velocity,
      //   });
      // } else {
      //   console.log("left");
      //   Body.setVelocity(Ball, {
      //     x: -1 * data.x_velocity,
      //     y: data.y_velocity,
      //   });
      // }
      // Body.setVelocity(Ball, {
      //   x: data.x_velocity,
      //   y: data.y_velocity,
      // });

      // Update position reference
      positionRef.current = {
        ...positionRef.current,
        x_ball: data.x_ball,
        y_ball: data.y_ball,
        x_velocity: data.x_velocity,
        y_velocity: data.y_velocity,
      };
    // }
  }, []);

  // const handleBallPositions = useCallback((data) => {
  //   setGameState((prev) => ({ ...prev, player_side: data.player_side }));
  //   if (gameObjRef.current && gameObjRef.current.Ball) {
  //     const { Ball } = gameObjRef.current;
  //     const { render } = gameObjRef.current;
  //     const canvasWidth = render.canvas.width;

  //     // Mirror the x position for the right-side player
  //     const mirroredX = gameState.player_side === "right"
  //       ? canvasWidth - data.x_ball
  //       : data.x_ball;

  //     Body.setPosition(Ball, {
  //       x: mirroredX,
  //       y: data.y_ball,
  //     });

  //     // Mirror velocity for right-side player
  //     const mirroredVelocityX = gameState.player_side === "right"
  //       ? -data.x_velocity
  //       : data.x_velocity;

  //     Body.setVelocity(Ball, {
  //       x: mirroredVelocityX,
  //       y: data.y_velocity,
  //     });

  //     positionRef.current = {
  //       ...positionRef.current,
  //       x_ball: mirroredX,
  //       y_ball: data.y_ball,
  //       x_velocity: mirroredVelocityX,
  //       y_velocity: data.y_velocity,
  //     };
  //   }
  // }, [gameState.player_side]);

  // const handleBallPositions = useCallback(
  //   (data) => {
  //     setGameState((prev) => ({ ...prev, player_side: data.player_side }));
  //     if (gameObjRef.current && gameObjRef.current.Ball) {
  //       const { Ball, render } = gameObjRef.current;
  //       const canvasWidth = render.canvas.width;
  //       const canvasHeight = render.canvas.height;

  //       // Calculate the scale factors
  //       const scaleX = canvasWidth / data.canvasWidth;
  //       const scaleY = canvasHeight / data.canvasHeight;

  //       // Scale the ball's position
  //       const scaledX = data.x_ball * scaleX;
  //       const scaledY = data.y_ball * scaleY;

  //       // Mirror the x position for the right-side player
  //       const mirroredX =
  //         gameState.player_side === "right" ? canvasWidth - scaledX : scaledX;

  //       Body.setPosition(Ball, {
  //         x: mirroredX,
  //         y: scaledY,
  //       });

  //       // Scale and mirror velocity for right-side player
  //       const scaledVelocityX = data.x_velocity * scaleX;
  //       const scaledVelocityY = data.y_velocity * scaleY;
  //       const mirroredVelocityX =
  //         gameState.player_side === "right"
  //           ? -scaledVelocityX
  //           : scaledVelocityX;

  //       Body.setVelocity(Ball, {
  //         x: mirroredVelocityX,
  //         y: scaledVelocityY,
  //       });

  //       positionRef.current = {
  //         ...positionRef.current,
  //         x_ball: mirroredX,
  //         y_ball: scaledY,
  //         x_velocity: mirroredVelocityX,
  //         y_velocity: scaledVelocityY,
  //       };
  //     }
  //   },
  //   [gameState.player_side]
  // );

  const handleRightPositions = useCallback((data) => {
    positionRef.current = {
      ...positionRef.current,

      x_right: data.x_right,
      y_right: data.y_right,
    };
    setGameState((prev) => ({ ...prev, player_side: data.player_side }));
    console.log("player_side", data.player_side);
  }, []);
  // console.log("x: ", gameState.x_right, "y: ", gameState.y_right);
  // console.log("x: ", gameState.x_right, "y: ", gameState.y_right);

  const handlePlayerPaired = useCallback((data) => {
    // Log incoming data with mode highlight
    console.log(`Player Paired - ${data.mode.toUpperCase()} MODE:`, {
        message: data.message,
        player1_name: data.player1_name,
        player1_img: data.player1_img,
        player2_name: data.player2_name,
        player2_img: data.player2_img,
        mode: data.mode,
        match_number: data.match_number
    });

    // Log current state before update
    console.log("Current State Before Update:", {
        player_name: gameState.player_name,
        playerTwoN: gameState.playerTwoN,
        playerTwoI: gameState.playerTwoI,
        mode: gameState.mode
    });

    setGameState((prev) => {
        // Calculate new opponent info
        const newPlayerTwoN = prev.player_name === data.player2_name
            ? data.player1_name
            : data.player2_name;
        const newPlayerTwoI = prev.player_name === data.player2_name
            ? data.player1_img
            : data.player2_img;

        // Log opponent assignment logic with mode
        console.log(`${data.mode.toUpperCase()} MODE - Opponent Assignment:`, {
            current_player: prev.player_name,
            is_player2: prev.player_name === data.player2_name,
            selected_opponent_name: newPlayerTwoN,
            selected_opponent_img: newPlayerTwoI
        });

        const newState = {
            ...prev,
            waitingMsg: data.message,
            playerTwoN: newPlayerTwoN,
            playerTwoI: newPlayerTwoI,
            mode: data.mode,
            match_number: data.match_number,
        };

        // Log final state update
        console.log(`${data.mode.toUpperCase()} MODE - New State:`, newState);

        return newState;
    });
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

  const handleTournamentCancel = useCallback((data) => {
    setGameState((prev) => ({
      ...prev,
      waitingMsg: data.message,
      // Only reset player info if we got new values
      playerTwoN: data.playertwo_name || "Loading...",
      playerTwoI: data.playertwo_img || "./hourglass.svg",
      tournamentStatus: null,
      currentRound: null,
      remainingPlayers: null,
      isStart: false,
      count: 0
    }));
  }, []);


  const handleTournamentMatchResult = useCallback((data) => {
    setGameState((prev) => ({
      ...prev,
      waitingMsg: data.message,
      tournamentStatus: data.result
    }));
    
    // Handle tournament win/loss
    if (data.result === 'win') {
      // Could trigger next round or show victory screen
      console.log("Won match by forfeit");
    } else {
      // Handle elimination
      console.log("Match lost");
    }
  }, []);

  const handleCountdown = useCallback((data) => {
    setGameState((prev) => ({
      ...prev,
      count: data.time_remaining,
      isStart: data.is_finished,
    }));
  }, []);

  
  const [tournamentState, setTournamentState] = useState({
    status: null,  // 'waiting', 'pre_match', 'active'
    playersNeeded: 0,
    currentRound: null,
    position: null,
  });

  const handleTournamentUpdate = useCallback((data) => {
    setTournamentState(prev => ({
      ...prev,
      status: data.status,
      playersNeeded: data.players_needed || prev.playersNeeded,
      currentRound: data.current_round || prev.currentRound,
      position: data.position || prev.position
    }));
  
    setGameState(prev => ({
      ...prev,
      waitingMsg: data.message || prev.waitingMsg,
      playerTwoN: data.opponent_name || prev.playerTwoN,
      playerTwoI: data.opponent_img || prev.playerTwoI
    }));
  }, []);

  const handleGameMessage = useCallback(
    (event) => {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", {
            type: data.type,
            mode: data.mode
        });

        switch (data.type) {
            case "status":
                setTournamentState((prev) => ({
                    ...prev,
                    status: data.status,
                    playersNeeded: data.players_needed,
                    position: data.position
                }));
                break;
            case "tournament_update":
                handleTournamentUpdate(data);
                break;
            case "player_paired":
                console.log("Routing to handlePlayerPaired:", data);
                handlePlayerPaired(data);
                break;
            case "cancel":
                handlePlayerCancel(data);
                break;
            case "tournament_cancel":
                handleTournamentCancel(data);
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
            case "tournament_match_result":
                handleTournamentMatchResult(data);
                break;
            case "canvas_resize":
                // Handle canvas resize from the other player
                if (gameObjRef.current && gameObjRef.current.render) {
                    const { render } = gameObjRef.current;
                    render.canvas.width = data.width;
                    render.canvas.height = data.height;
                    // You might need to adjust other elements based on the new canvas size
                }
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
        handleTournamentUpdate,
        handleTournamentCancel,
        handleTournamentMatchResult
    ]
  );

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

  const selectGameMode = (mode) => {
    setGameMode(mode);
  };

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
    selectGameMode,
    startTournament: useCallback(() => {
      sendGameMessage({
        type: "play",
        mode: "tournament"
      });
    }, [sendGameMessage]),
    leaveTournament: useCallback(() => {
      sendGameMessage({
        type: "tournament_cancel"
      });
    }, [sendGameMessage])
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
