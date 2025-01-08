"use client";
import Axios from "../Components/axios";
import { updatePaddle, scaling } from "./Paddles";
import { useWebSocketContext } from "./webSocket";
import { rightPaddle, fil, draw, leftPaddle } from "./Draw";
import React, { useState, useEffect, useRef } from "react";
import { initialCanvas, GAME_CONSTANTS } from "./GameHelper";
import { useSearchParams } from "next/navigation";
import { GameWinModal, GameLoseModal } from "./GameModal";
import { GameAlert } from "./GameHelper";
import { useRouter } from "next/navigation";

export function Game() {
  const { gameState, sendGameMessage, setGameState, setUser, setPlayer1Name, positionRef } =
    useWebSocketContext();
  const isIntentionalNavigation = useRef(false);
  const [playerName, setPlayerName] = useState(null);
  const [playerPic, setPlayerPic] = useState(null);
  const [mapNum, setMapNum] = useState(1);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const divRef = useRef(null);
  const searchParams = useSearchParams();
  const [bgColor, setBgColor] = useState(null);
  const [borderColor, setBorderColor] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(false);
  const [loser, setLoser] = useState(false);
  const [EndModel, setEndModel] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isReloader, setIsReloader] = useState(false);
  var map;

  const mode = searchParams.get("mode");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await Axios.get("api/user_profile/");
        setPlayerPic(response.data.image);
        setPlayerName(response.data.first_name);
        setPlayer1Name(response.data.first_name);
        setUser(response.data.username);
      } catch (err) {
        console.error("COULDN'T FETCH THE USER FROM PROFILE 😭:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isTournament = mode === "tournament";
      
      // Only handle if not an intentional navigation
      if (!isIntentionalNavigation.current) {
        if (isTournament && !isGameOver) {
          e.preventDefault();
          e.returnValue = '';
          
          sendGameMessage({
            type: "tournament_cancel"
          });
          return;
        }
        else {
          sendGameMessage({
            type: "reload_detected",
            playerName: playerName,
          });
        }
      }
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Handle reload detection
    const data = window.performance.getEntriesByType("navigation")[0]?.type;
    if (data === "reload" && !isGameOver && !isIntentionalNavigation.current) {
      setIsReloader(true);
      setShowAlert(true);
      setAlertMessage("You are about to leave the game. All progress will be lost!");
      setTimeout(() => {
        window.location.assign("/");
      }, 3000);
    }
    
    if (gameState.reason === "reload" && !isIntentionalNavigation.current) {
      setShowAlert(true);
      setIsReloader(false);
      setAlertMessage(gameState.leavingMsg);
      setTimeout(() => {
        window.location.assign("/");
      }, 3000);
    }
  
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [playerName, isGameOver, gameState.reason, gameState.leavingMsg, mode]);

  useEffect(() => {
    // Reset game state when room changes (new match starts)
      const roomName = searchParams.get("room_name");
      console.log("==> Room name:", roomName);
      console.log("==> Reseting states");
      if (roomName) {
        setIsGameOver(false);
        setWinner(false);
        setLoser(false);
        setEndModel(false);
        setGameState(prev => {
          console.log("==> Resetting scores from:", prev.scoreA, prev.scoreB);
          return {
            ...prev,
            scoreA: 0,
            scoreB: 0
          };
        });
      }
  }, [searchParams]);

  // In the score useEffect
  useEffect(() => {
    if (gameState.scoreA === GAME_CONSTANTS.MAX_SCORE || gameState.scoreB === GAME_CONSTANTS.MAX_SCORE) {
      console.log("Score threshold reached:", gameState.scoreA, gameState.scoreB);
      console.log("Game over:", isGameOver);
      if (!isGameOver) {
        console.log("Game not marked as over yet");
        const isClassicMode = !mode || mode === "classic";

        // Send game over for classic mode
        if (isClassicMode) {
          sendGameMessage({
            type: "game_over",
          });
        }
        
        setIsGameOver(true);
        let isWinner = false;
  
        // Determine winner/loser
        if (playerName === positionRef.current.left_player && gameState.scoreA === GAME_CONSTANTS.MAX_SCORE) {
          console.log("Left player wins");
          setWinner(true);
          isWinner = true;
        }
        else if (playerName === positionRef.current.left_player && gameState.scoreB === GAME_CONSTANTS.MAX_SCORE) {
          console.log("Left player loses");
          setLoser(true);
        }
        else if (playerName === positionRef.current.right_player && gameState.scoreA === GAME_CONSTANTS.MAX_SCORE) {
          console.log("Right player wins");
          setWinner(true);
          isWinner = true;
        }
        else if (playerName === positionRef.current.right_player && gameState.scoreB === GAME_CONSTANTS.MAX_SCORE) {
          console.log("Right player loses");
          setLoser(true);
        }
        
        // Show modal first before tournament logic
        console.log("Setting EndModel to true, Winner:", winner, "Loser:", loser);
        
        // Handle tournament mode
        if (mode === "tournament" && isWinner) {
          console.log("Tournament winner sending match end");
          setTimeout(() => {
            sendGameMessage({
              type: "t_match_end",
              match_id: searchParams.get("room_name"),
              winner_name: playerName,
              leaver: false
            });
          }, 5000);
        }
        setEndModel(true);
        if (mode === "tournament" && !isWinner) {
          console.log("RADII N5ERJOU MN L MATCH HIT MASHI WINNER --------------");
          setTimeout(() => {
          window.location.assign("/");
          }, 5000);
        }
      }
    }
  }, [gameState.scoreA, gameState.scoreB], isGameOver);


  useEffect(() => {
    var frame;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    contextRef.current = context;
    map = searchParams.get("mapNum");

    if (map) {
      setMapNum(mapNum);
    } else {
      console.log("Noooo parameter here");
    }
    switch (map) {
      case "2":
        setBgColor("#1A1A1A");
        setBorderColor("#444444");
        break;
      case "3":
        setBgColor("#1E3C72");
        setBorderColor("#ffffff");
        break;
      case "4":
        setBgColor("#E0C3FC");
        setBorderColor("#FFFFFF");
        break;
      case "5":
        setBgColor("#4A1033");
        setBorderColor("#E3E2E2");
        break;
      case "6":
        setBgColor("#2C3E50");
        setBorderColor("#ECF0F1");
        break;
      default:
        setBgColor("#393E46");
        setBorderColor("#FFD369");
    }

    initialCanvas(divRef, canvas, positionRef);

    const resizeCanvas = () => {
      const container = divRef.current;
      if (!canvas || !container) return;

      const containerWidth = window.innerWidth * 0.7;
      const containerHeight = window.innerHeight * 0.6;

      const aspectRatio =
        GAME_CONSTANTS.ORIGINAL_WIDTH / GAME_CONSTANTS.ORIGINAL_HEIGHT;
      let width = containerWidth;
      let height = width / aspectRatio;

      if (height > containerHeight) {
        height = containerHeight;
        width = height * aspectRatio;
      }
      canvas.width = width;
      canvas.height = height;

      leftPaddle.x = GAME_CONSTANTS.OFFSET_X;
      rightPaddle.x =
        GAME_CONSTANTS.ORIGINAL_WIDTH - 2 * GAME_CONSTANTS.PADDLE_WIDTH - 10;

      if (!leftPaddle.y) {
        leftPaddle.y =
          GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;
      }
      if (!rightPaddle.y) {
        rightPaddle.y =
          GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;
      }

      fil.x = canvas.width / 2;
      fil.y = canvas.height / 2;

      const { scaleY } = scaling(0, 0, canvas);
      leftPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY;
      rightPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY;

      sendGameMessage({
        type: "canvas_resize",
        canvas_width: width,
        canvas_height: height,
      });
    };
    const handleKeyDown = (event) => {
      if (isGameOver) return;
      if (event.code === "KeyW") {
        leftPaddle.dy = -10;
      }
      if (event.code === "KeyS") {
        leftPaddle.dy = 10;
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === "KeyW" || event.code === "KeyS") {
        leftPaddle.dy = 0;
      }
    };
    const gameLoop = () => {
      if (!canvas || !contextRef.current || isGameOver) return;
      updatePaddle(canvasRef, positionRef, sendGameMessage);
      draw(contextRef, canvasRef, positionRef, map);
      frame = requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    if (divRef.current) {
      const room_name = searchParams.get("room_name") || null;
      if (!isGameOver) {
        sendGameMessage({
          type: "play",
          canvas_width: canvas.width,
          canvas_height: canvas.height,
          room_name: room_name,
        });
      }
    }
    gameLoop();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gameState.playerTwoN, searchParams]);

  const leaving = () => {
    isIntentionalNavigation.current = true;
    if (!isGameOver) {
      sendGameMessage({
        type: "reload_detected",
        playerName: playerName,
      });
      setShowAlert(true);
      setIsReloader(false);
    }
    window.location.assign("/");
  };
  
  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      setTimeout(() => {
        isIntentionalNavigation.current = false;
      }, 3000)
    };
  }, []);

  return (
    <div
      ref={divRef}
      className=" text-sm h-lvh min-h-screen"
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      <div className="flex w-full justify-between mb-12">
        <a href="./profile" className="flex p-6">
          <img
            src={`${playerPic}`}
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
          <div
            className="hidden lg:flex -ml-4 h-12 w-64  mt-5 z-2 text-black justify-center items-center rounded-lg text-lg "
            style={{ backgroundColor: "#FFD369" }}
          >
            {playerName}
          </div>
        </a>
        <a href="#" className="flex p-6">
          <div
            className="hidden lg:flex -mr-4 h-12 w-64 mt-4 z-2 text-black justify-center items-center rounded-lg text-lg"
            style={{ backgroundColor: "#FFD369" }}
          >
            {gameState.playerTwoN}
          </div>
          <img
            src={`${gameState.playerTwoI}`}
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
        </a>
      </div>
      <div>
        <div className="flex justify-around items-center">
          <div
            className=""
            style={{
              height: "100%",
              backgroundColor: "#222831",
              color: "#FFD369",
            }}
          >
            <div className="flex text-7x justify-center mb-20">
              <h1 className="text-7xl mr-52" style={{ color: "#FFD369" }}>
                {gameState.scoreA}
              </h1>
              <span className="font-extralight text-5xl flex items-center">
                VS
              </span>
              <h1 className="text-7xl ml-52" style={{ color: "#FFD369" }}>
                {gameState.scoreB}
              </h1>
            </div>
            <div>
              <canvas
                ref={canvasRef}
                style={{ backgroundColor: bgColor, borderColor: borderColor }}
                className="block mx-auto z-3  border-2 rotate-90 sm:rotate-0 sm:w-full "
              />
              <div className="text-center mt-4"></div>
            </div>
            {isGameOver && EndModel && winner && (
              <GameWinModal
                setEndModel={setEndModel}
                scoreA={gameState.scoreA}
                scoreB={gameState.scoreB}
              />
            )}
            {isGameOver && EndModel && loser && (
              <GameLoseModal
                setEndModel={setEndModel}
                scoreA={gameState.scoreA}
                scoreB={gameState.scoreB}
              />
            )}
          </div>

          <div
            className="absolute left-10 bottom-10 cursor-pointer"
            onClick={() => {
              leaving();
            }}
          >
            <img
              src="https://127.0.0.1:8001/exit.svg"
              alt="exitpoint"
              className="w-10"
            />
          </div>
        </div>
      </div>
      {showAlert && <GameAlert message={alertMessage} isReload={isReloader} />}
    </div>
  );
}