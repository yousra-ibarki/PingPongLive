"use client";

import { updatePaddle, scaling } from "./Paddles";
import { rightPaddle, fil, draw, leftPaddle, Ball } from "./Draw";
import React, { useState, useEffect, useRef } from "react";
import { initialCanvas, GAME_CONSTANTS } from "./GameHelper";
import { useSearchParams } from "next/navigation";
import { GameWinModal, GameLoseModal } from "./GameModal";
import { GameAlert } from "./GameHelper";

export function OfflineGame() {
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
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  var map;

  //setting scores
  // useEffect(() => {
  //   if (
  //     gameState.scoreA === GAME_CONSTANTS.MAX_SCORE ||
  //     gameState.scoreB === GAME_CONSTANTS.MAX_SCORE
  //   ) {
  //     if (!isGameOver) {

  //       setIsGameOver(true);
  //       if (
  //         playerName === positionRef.current.left_player &&
  //         gameState.scoreA === GAME_CONSTANTS.MAX_SCORE
  //       )
  //         setWinner(true);
  //       else if (
  //         playerName === positionRef.current.left_player &&
  //         gameState.scoreB === GAME_CONSTANTS.MAX_SCORE
  //       )
  //         setLoser(true);
  //       else if (
  //         playerName === positionRef.current.right_player &&
  //         gameState.scoreA === GAME_CONSTANTS.MAX_SCORE
  //       )
  //         setWinner(true);
  //       else if (
  //         playerName === positionRef.current.right_player &&
  //         gameState.scoreB === GAME_CONSTANTS.MAX_SCORE
  //       )
  //         setLoser(true);
  //     }
  //     setEndModel(true);
  //   }
  // }, [gameState.scoreA, gameState.scoreB, isGameOver]);
  // const Ball = {
  //   x: window.innerWidth * 0.35, // initial position
  //   y: window.innerHeight * 0.3,
  //   radius: 13,
  //   vx: 5, // velocity x
  //   vy: 3, // velocity y
  // };

  // const leftPaddle = {
  //   x: 10,
  //   y: window.innerHeight * 0.3 - 39,
  //   width: 20,
  //   height: 130,
  //   dy: 0,
  // };

  // const rightPaddle = {
  //   x: window.innerWidth * 0.7 - 30,
  //   y: window.innerHeight * 0.3 - 39,
  //   width: 20,
  //   height: 110,
  //   dy: 0,
  // };

  // const fil = {
  //   x: (window.innerWidth* 0.7) / 2,
  //   y: (window.innerHeight *0.3) ,

  // };

  useEffect(() => {
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

    initialCanvas(divRef, canvas);

    const handleKeyDown = (event) => {
      if (event.code === "KeyW") leftPaddle.dy = -12;
      if (event.code === "KeyS") leftPaddle.dy = 12;
      if (event.code === "ArrowUp") rightPaddle.dy = -12;
      if (event.code === "ArrowDown") rightPaddle.dy = 12;
    };

    const handleKeyUp = (event) => {
      if (event.code === "KeyW" || event.code === "KeyS") leftPaddle.dy = 0;
      if (event.code === "ArrowUp" || event.code === "ArrowDown")
        rightPaddle.dy = 0;
    };

    const gameLoop = () => {
      if (!canvas || !contextRef.current) return;
      update();
      draw(contextRef, canvasRef, mapNum);
      requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Update positions
  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { scaleX, scaleY } = scaling(0, 0, canvas);
    const scaledBallRadius =
      GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY);

    // Update Ball position
    Ball.x += Ball.vx;
    Ball.y += Ball.vy;

    // Bounce Ball off top and bottom walls
    if (
      Ball.y - scaledBallRadius < 0 ||
      Ball.y + scaledBallRadius > canvas.height
    ) {
      Ball.vy *= -1;
    }

    // Check collision with rackets
    if (checkCollision(Ball, leftPaddle)) {
      Ball.vx = Math.abs(Ball.vx); // Ensure ball moves right
      Ball.vy += leftPaddle.dy * 0.2; // Add paddle momentum
    }

    if (checkCollision(Ball, rightPaddle)) {
      Ball.vx = -Math.abs(Ball.vx); // Ensure ball moves left
      Ball.vy += rightPaddle.dy * 0.2; // Add paddle momentum
    }

    // Score handling
    if (Ball.x - scaledBallRadius < 0) {
      setScoreB((prevNumber) => prevNumber + 1);
      resetBall(1);
    }

    if (Ball.x + scaledBallRadius > canvas.width) {
      setScoreA((prevNumber) => prevNumber + 1);
      resetBall(-1);
    }

    // Move rackets
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;

    // Keep rackets within bounds
    leftPaddle.y = Math.max(
      0,
      Math.min(canvas.height - GAME_CONSTANTS.PADDLE_HEIGHT, leftPaddle.y)
    );
    rightPaddle.y = Math.max(
      0,
      Math.min(canvas.height - GAME_CONSTANTS.PADDLE_HEIGHT, rightPaddle.y)
    );
  };

  const checkCollision = (ball, paddle) => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const { scaleX, scaleY } = scaling(0, 0, canvas);
    const scaledBallRadius =
      GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY);
    const scaledPaddleWidth = GAME_CONSTANTS.PADDLE_WIDTH * scaleX;
    const scaledPaddleHeight = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY;

    return (
      ball.x - scaledBallRadius < paddle.x + scaledPaddleWidth &&
      ball.x + scaledBallRadius > paddle.x &&
      ball.y > paddle.y &&
      ball.y < paddle.y + scaledPaddleHeight
    );
  };

  const resetBall = (direction) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    Ball.x = canvas.width / 2;
    Ball.y = canvas.height / 2;
    Ball.vx = 5 * direction;
    Ball.vy = (Math.random() - 0.5) * 6; // Add some random vertical movement
    // Ball.radius = GAME_CONSTANTS.BALL_RADIUS;
  };

  // const draw = () => {
  //   const context = contextRef.current;
  //   const canvas = canvasRef.current;
  //   if (!context || !canvas) return;
  //   context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw left racket
  // context.fillStyle = "#EEEEEE";
  // context.fillRect(leftPaddle.x, leftPaddle.y, GAME_CONSTANTS.PADDLE_WIDTH, GAME_CONSTANTS.PADDLE_HEIGHT);

  // // Draw right racket
  // context.fillStyle = "#FFD369";
  // context.fillRect(rightPaddle.x, rightPaddle.y,  GAME_CONSTANTS.PADDLE_WIDTH, GAME_CONSTANTS.PADDLE_HEIGHT);

  // // Draw fil
  // context.fillStyle = "#000000";
  // context.fillRect(fil.x, fil.y - canvas.height / 2, 1, canvas.height);

  // // Draw ball
  // context.beginPath();
  // context.arc(Ball.x, Ball.y, GAME_CONSTANTS.BALL_RADIUS, 0, Math.PI * 2);
  // context.fillStyle = "#00FFD1";
  // context.fill();

  // };

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

  const leaving = () => {
    if (!isGameOver) {
      setShowAlert(true);
      setIsReloader(false);
      window.location.assign("/"); // Navigate to the home page
    } else window.location.assign("/"); // Navigate to the home page
  };

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
        <div className="flex p-6">
          <img
            src="playerA.jpeg"
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50 "
            style={{ borderColor: "#FFD369" }}
          />
          <div
            className="hidden lg:flex -ml-4 h-12 w-64  mt-5 z-2 text-black justify-center items-center rounded-lg text-lg "
            style={{ backgroundColor: "#FFD369" }}
          >
            Player A
          </div>
        </div>

        <div className="flex p-6">
          <div
            className="hidden lg:flex -mr-4 h-12 w-64 mt-4 z-2 text-black justify-center items-center rounded-lg text-lg"
            style={{ backgroundColor: "#FFD369" }}
          >
            Player B
          </div>
          <img
            src="./playerB.jpeg"
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
        </div>
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
                {scoreA}
              </h1>
              <span className="font-extralight text-5xl flex items-center">
                VS
              </span>
              <h1 className="text-7xl ml-52" style={{ color: "#FFD369" }}>
                {scoreB}
              </h1>
            </div>
            <div>
              <canvas
                ref={canvasRef}
                width={window.innerWidth * 0.7}
                height={window.innerHeight * 0.6}
                style={{ backgroundColor: bgColor, borderColor: borderColor }}
                className="block mx-auto z-3  border-2 rotate-90 sm:rotate-0 sm:w-full "
              />
              <div className="text-center mt-4"></div>
            </div>
            {isGameOver && EndModel && winner && (
              <GameWinModal setEndModel={setEndModel} scoreA={0} scoreB={0} />
            )}
            {isGameOver && EndModel && loser && (
              <GameLoseModal setEndModel={setEndModel} scoreA={0} scoreB={0} />
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
