// "use client";
// import { config } from "../Components/config";
// import useWebSocket from "react-use-websocket";
// import { GAME_CONSTANTS } from "./GameHelper";

// import React, {
//   createContext,
//   useContext,
//   useRef,
//   useState,
//   useCallback,
// } from "react";

// const WebSocketContext = createContext(null);

// export const WebSocketProvider = ({ children }) => {
//   const positionRef = useRef({
//     x_right: 13,
//     y_right: 39,
//     x_ball: 0,
//     y_ball: 0,
//     left_player: null,
//     right_player: null,
//     isPlayerOnRight: null,
//   });

//   const [tournamentState, setTournamentState] = useState({
//     status: null,
//     playersNeeded: 0,
//     currentRound: null,
//     position: null,
//     error: null,
//     current_players: []
//   });

//   const [gameState, setGameState] = useState({
//     playerTwoN: "Loading...",
//     playerTwoI: "./hourglass.svg",
//     waitingMsg: "Searching for an opponent ...",
//     count: 0,
//     isStart: false,
//     currentUser: null,
//     player_name: null,
//     scoreA: 0,
//     scoreB: 0,
//   });


//   const handlePaddleMove = useCallback((data) => {
//     positionRef.current.y_right = data.y_right;
//   },
//   [positionRef.current.y_right]
//   );

//   const handleBallPositions = useCallback((data) => {
//     const { ball, paddles } = data;

//     const isPlayerOnRight =
//       gameState.player_name !== positionRef.current.left_player;
//     if (isPlayerOnRight) {
//       positionRef.current = {
//         ...positionRef.current,
//         x_ball: GAME_CONSTANTS.ORIGINAL_WIDTH - ball.x,
//         y_ball: ball.y,
//         ball_radius: ball.radius,
//         // Mirror paddle positions too
//         y_right: paddles.left.y, // Note the swap
//         y_left: paddles.right.y,
//       };
//     } else {
//       positionRef.current = {
//         ...positionRef.current,
//         x_ball: ball.x,
//         y_ball: ball.y,
//         ball_radius: ball.radius,
//         y_right: paddles.right.y,
//         y_left: paddles.left.y,
//       };
//     }

//     if (data.scored) {
//       if (data.scored === "left" && !isPlayerOnRight) {
//         setGameState((prev) => ({
//           ...prev,
//           scoreA: prev.scoreA + 1,
//         }));
//       } else if (data.scored === "left" && isPlayerOnRight) {
//         setGameState((prev) => ({
//           ...prev,
//           scoreB: prev.scoreB + 1,
//         }));
//       } else if (data.scored == "right" && !isPlayerOnRight) {
//         setGameState((prev) => ({
//           ...prev,
//           scoreB: prev.scoreB + 1,
//         }));
//       } else if (data.scored == "right" && isPlayerOnRight) {
//         setGameState((prev) => ({
//           ...prev,
//           scoreA: prev.scoreA + 1,
//         }));
//       }
//     }
//   },
//   [gameState.player_name, gameState.scoreB]
//   );


//   const handleRightPositions = useCallback((data) => {
//   positionRef.current = {
//     ...positionRef.current,
//     // x_right: data.x_right,
//     y_right: data.y_right,
//   };
//   }, []);


//   const handlePlayerPaired = useCallback((data) => {
//       const isLeftPlayer = data.left_player === gameState.player_name;
//       positionRef.current = {
//         ...positionRef.current,
//         left_player: data.left_player,
//         right_player: data.right_player,
//         is_left_player: isLeftPlayer, // Store which paddle this player controls
//       };

    


//       setGameState((prev) => ({
//         ...prev,
//         waitingMsg: data.message,
//         is_left_player: isLeftPlayer,
//         playerTwoN:
//           prev.player_name === data.player2_name
//             ? data.player1_name
//             : data.player2_name,
//         playerTwoI:
//           prev.player_name === data.player2_name
//             ? data.player1_img
//             : data.player2_img,
//       }));
//     },
//     [gameState.player_name]
//   );


//   const handlePlayerCancel = useCallback((data) => {
//     setGameState((prev) => ({
//       ...prev,
//       waitingMsg: data.message,
//       playerTwoN:
//         data.playertwo_name === prev.playerTwoN
//           ? "Loading..."
//           : prev.playerTwoN,
//       playerTwoI:
//         data.playertwo_img === prev.playerTwoI
//           ? "./hourglass.svg"
//           : prev.playerTwoI,
//     }));
//   }, []);


//   const handleCountdown = useCallback((data) => {
//     setGameState((prev) => ({
//       ...prev,
//       count: data.time_remaining,
//       isStart: data.is_finished,
//     }));
//   }, []);


//   // Error handling helper
//   const handleError = useCallback((error, context) => {
//     console.error(`WebSocket error in ${context}:`, error);
//     setTournamentState(prev => ({
//       ...prev,
//       error: `Error in ${context}: ${error.message || 'Unknown error'}`
//     }));
//   }, []);

//   const clearError = useCallback(() => {
//     setTournamentState(prev => ({ ...prev, error: null }));
//   }, []);

// const handleTournamentUpdate = useCallback((data) => {
//   try {
//     console.log("Received tournament update:", data);
//     clearError();
    
//     setTournamentState(prev => ({
//       ...prev,
//       status: data.status,
//       playersNeeded: data.players_needed || prev.playersNeeded,
//       currentRound: data.current_round || prev.currentRound,
//       position: data.position || prev.position,
//       current_players: data.current_players || prev.current_players
//     }));
//     console.log("==> Tournament state:", tournamentState);
    
//     setGameState(prev => {
//       const updates = {
//         ...prev,
//         waitingMsg: data.message || prev.waitingMsg
//       };
      
//       if (data.opponent_name) {
//         updates.playerTwoN = data.opponent_name;
//       }
//       if (data.opponent_img) {
//         updates.playerTwoI = data.opponent_img;
//       }
      
//       if (data.status === 'countdown') {
//         updates.count = data.time_remaining;
//         updates.isStart = data.time_remaining === 0;
//       }
      
//       return updates;
//     });

//     if (data.status === 'match_start') {
//       window.location.assign("./game");
//     }
//   } catch (error) {
//     handleError(error, 'tournament update');
//   }
// }, [handleError, clearError]);

// const handleTournamentCancel = useCallback((data) => {
//   try {
//     clearError();
//     setGameState(prev => ({
//       ...prev,
//       waitingMsg: data.message,
//       playerTwoN: data.playertwo_name || "Loading...",
//       playerTwoI: data.playertwo_img || "./hourglass.svg",
//       tournamentStatus: null,
//       currentRound: null,
//       remainingPlayers: null,
//       isStart: false,
//       count: 0
//     }));
    
//     setTournamentState(prev => ({
//       ...prev,
//       status: 'cancelled',
//       playersNeeded: 0,
//       currentRound: null,
//       position: null,
//       current_players: []
//     }));
//   } catch (error) {
//     handleError(error, 'tournament cancellation');
//   }
// }, [handleError, clearError]);

//   const handleGameMessage = useCallback(
//     (event) => {
//       const data = JSON.parse(event.data);

//       switch (data.type) {
//         case "tournament_update":
//           handleTournamentUpdate(data);
//           break;
//         case "tournament_cancel":
//           handleTournamentCancel(data);
//         case "player_paired":
//           handlePlayerPaired(data);
//           break;
//         case "cancel":
//           handlePlayerCancel(data);
//           break;
//         case "countdown":
//           handleCountdown(data);
//           break;
//         case "right_positions":
//           handleRightPositions(data);
//           break;
//         case "ball_positions":
//           handleBallPositions(data);
//           break;
//         case "PaddleLeft_move":
//           handlePaddleMove(data);
//           break;
//         case "error":
//           console.error("Game error:", data.message);
//           break;
//         default:
//           console.log("Unhandled message type:", data.type);
//       }
//     },
//     [
//       handlePlayerPaired,
//       handlePlayerCancel,
//       handleCountdown,
//       handleRightPositions,
//       handleBallPositions,
//       handlePaddleMove,
//       handleTournamentUpdate,
//       handleTournamentCancel,
//     ]
//   );

//   const { sendJsonMessage: sendGameMessage } = useWebSocket(
//     gameState.currentUser
//       ? `${config.wsUrl}/game/${gameState.currentUser}/`
//       : null,
//     {
//       reconnectInterval: 3000,
//       onOpen: () => {
//         console.log("WebSocket connection opened 😃😃😃😃😃😃😃😃");
//       },
//       onMessage: handleGameMessage,
//       onClose: () => {
//         console.log("WebSocket connection closed 🥴🥴🥴🥴🥴🥴🥴🥴");
//       },
//     }
//   );

//   const setUser = useCallback((username) => {
//     setGameState((prev) => ({ ...prev, currentUser: username }));
//   }, []);

//   const setPlayer1Name = useCallback((playerName) => {
//     setGameState((prev) => ({ ...prev, player_name: playerName }));
//   }, []);


//   const contextValue = {
//     gameState,
//     sendGameMessage,
//     setUser,
//     setPlayer1Name,
//     positionRef,
//     setGameState,
//     tournamentState,
//   };

//   return (
//     <WebSocketContext.Provider value={contextValue}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// export const useWebSocketContext = () => {
//   const context = useContext(WebSocketContext);
//   if (!context) {
//     throw new Error(
//       "useWebSocketContext must be used within a WebSocketProvider"
//     );
//   }
//   return context;
// };

// export default WebSocketContext;