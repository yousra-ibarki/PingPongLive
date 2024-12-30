"use client";
import Axios from "../Components/axios";
import { updatePaddle, scaling } from "./Paddles";
import { useWebSocketContext } from "./webSocket";
import { rightPaddle, fil, draw, leftPaddle } from "./Draw";
import React, { useState, useEffect, useRef } from "react";
import { initialCanvas, GAME_CONSTANTS } from "./GameHelper";
import { useSearchParams } from "next/navigation";
import { GameWinModal, GameLoseModal } from "./GameModal";
import { useRouter } from "next/navigation";

export function Game() {
  const { gameState, sendGameMessage, setUser, setPlayer1Name, positionRef } =
    useWebSocketContext();
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
  var map;

  const router = useRouter();

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

  // useEffect(() => {
  //   const data = window.performance.getEntriesByType("navigation")[0]?.type;
  //   console.log(data, isGameOver);

  //   if (data === "reload" && isGameOver === false) {
  //     console.log("yes i am here");

  //     // Show confirmation dialog
  //     // const userConfirmed = window.confirm('Warning: Reloading will end your current game. Do you want to continue?');
  //     alert("Reloaidng will end you current game and lose all your progress");
  //     // sendGameMessage({
  //     //   type: "disconnect",
  //     //   state: "reload",
  //     // });
  //     sendGameMessage({
  //       type: "game_over",
  //       isReload: true,
  //     });
  //     // window.location.assign("/");
  //     router.push("/");
  //   }
  // }, []);


  useEffect(() => {
    const handleBeforeUnload = () => {
      // Send reload message before connection closes
      sendGameMessage({
        type: "reload_detected",
        state: "reload",
        playerName: playerName  // send the player's name
      });
      router.push("/")
  
      return new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  //   useEffect(() => {
  //     const data = window.performance.getEntriesByType("navigation")[0]?.type;

  //     if (data === "reload") {
  //         sendGameMessage({
  //             type: "game_over",
  //             isReload: "true",
  //         });s
  //         setLoser(true);
  //         setWinner(false);
  //         setEndModel(true);
  //         setIsGameOver(true);
  //     }
  // // console.log("WINER LOSER : ", gameState.winner, gameState.loser)
  //     if (gameState.winner === true) {
  //         setWinner(true);
  //         setLoser(false);
  //         setEndModel(true);
  //         setIsGameOver(true);
  //     }
  // }, [gameState.isReload, gameState.gameOver]);

  // useEffect(() => {
  //   // Warn user before they leave the page
  //   // window.onbeforeunload = function() {
  //   //   return "Are you sure you want to leave?";
  //   // };
  //   const handleBeforeUnload = (event) => {
  //     // if ( ) {
  //       const message = "Are you sure you want to leave? Your game progress will be lost!";
  //       event.returnValue = message;  // Standard for most browsers
  //       return message;              // For some browsers
  //     }
  //   // };

  useEffect(() => {
    if (
      gameState.scoreA === GAME_CONSTANTS.MAX_SCORE ||
      gameState.scoreB === GAME_CONSTANTS.MAX_SCORE
    ) {
      if (!isGameOver) {
        sendGameMessage({
          type: "game_over",
        });
        setIsGameOver(true);
        if (
          playerName === positionRef.current.left_player &&
          gameState.scoreA === GAME_CONSTANTS.MAX_SCORE
        )
          setWinner(true);
        else if (
          playerName === positionRef.current.left_player &&
          gameState.scoreB === GAME_CONSTANTS.MAX_SCORE
        )
          setLoser(true);
        else if (
          playerName === positionRef.current.right_player &&
          gameState.scoreA === GAME_CONSTANTS.MAX_SCORE
        )
          setWinner(true);
        else if (
          playerName === positionRef.current.right_player &&
          gameState.scoreB === GAME_CONSTANTS.MAX_SCORE
        )
          setLoser(true);
      }
      setEndModel(true);
    }
  }, [gameState.scoreA, gameState.scoreB, isGameOver]);

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

      //changed * scaleX/Y
      leftPaddle.x = GAME_CONSTANTS.OFFSET_X;
      rightPaddle.x =
        GAME_CONSTANTS.ORIGINAL_WIDTH - 2 * GAME_CONSTANTS.PADDLE_WIDTH - 10;

      if (!leftPaddle.y) {
        // Only set if not already set
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
        leftPaddle.dy = -7;
      }
      if (event.code === "KeyS") {
        leftPaddle.dy = 7;
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
      // get room_name from url
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

  // useEffect(() => {
  //   const lockOrientation = async () => {
  //     if ("orientation" in screen && screen.orientation.lock) {
  //       try {
  //         await screen.orientation.lock("landscape-primary");
  //         console.log("⛔️⛔️⛔️ Orientation locked to landscape");
  //       } catch (err) {
  //         console.log("⛔️⛔️⛔️ Failed to lock orientation", err);
  //       }
  //     } else {
  //       console.warn("⛔️⛔️⛔️ Screen orientation API is not supported.");
  //     }
  //     const canvas = canvasRef.current;
  //     if (canvas && canvas.requestFullscreen) {
  //       try {
  //         await canvas.requestFullscreen();
  //         console.log("⛔️⛔️⛔️ Canvas is now fullscreen");
  //       } catch {
  //         console.log("⛔️⛔️⛔️ Faild to enter the fullscreen mode")
  //       }
  //     }
  //     else{
  //       console.warn("Fullscreen API is not supported.")
  //     }
  //   };
  //   lockOrientation();
  // }, []);

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
            // src="./avatar1.jpg"
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
              {/* <canvas className="block mx-auto z-3 text-white" ref={canva} /> */}
              <canvas
                ref={canvasRef}
                style={{ backgroundColor: bgColor, borderColor: borderColor }}
                className="block mx-auto z-3  border-2 rotate-90 sm:rotate-0 sm:w-full "
                // className="block mx-auto z-3 bg-[#2C3E50] border-2 border-[#ffffff]"
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
              if (gameState.isStart) {
                sendGameMessage({
                  type: "cancel",
                });
              }
              router.push("/");
            }}
          >
            <img
              src="https://127.0.0.1:8001/exit.svg"
              alt="exitpoint"
              className="w-10"
            />
          </div>
          {/* <div
            className="absolute left-10 bottom-10 cursor-pointer"
            onClick={() => {
              // setEndModel(true);
              // setLoser(true); // Mark the player as a loser
              window.location.assign("/"); // Navigate to the home page
            }}
          >
            <img
              src="https://127.0.0.1:8001/exit.svg"
              alt="exitpoint"
              className="w-10"
            />
          </div> */}
        </div>
      </div>
    </div>
  );
}
