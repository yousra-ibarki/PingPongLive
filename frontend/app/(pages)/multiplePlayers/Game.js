"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { scaling } from "./GameHelper";
import { rightPaddle, draw, leftPaddle, topPaddle, bottomPaddle, Ball } from "./Draw";
import { initialCanvas, GAME_CONSTANTS } from "./GameHelper";
import { GameResultModal } from "./GameModal";
import { GameAlert } from "./GameHelper";

const FourPlayerScoreDisplay = ({ scores }) => {
  return (
    <div className="grid grid-cols-2 gap-8 mb-8">
      <div className="col-span-2 flex justify-center">
        <div className="flex items-center gap-4">
          <img
            src="playerTop.jpeg"
            alt="Top Player"
            className="w-16 h-16 rounded-full border-2 border-green-400"
          />
          <div className="text-4xl font-bold text-green-400">
            {scores.playerTop}
          </div>
        </div>
      </div>
      
      <div className="flex justify-start items-center gap-4">
        <img
          src="playerA.jpeg"
          alt="Left Player"
          className="w-16 h-16 rounded-full border-2"
          style={{ borderColor: "#EEEEEE" }}
        />
        <div className="text-4xl font-bold" style={{ color: "#EEEEEE" }}>
          {scores.playerLeft}
        </div>
      </div>
      
      <div className="flex justify-end items-center gap-4">
        <div className="text-4xl font-bold" style={{ color: "#FFD369" }}>
          {scores.playerRight}
        </div>
        <img
          src="playerB.jpeg"
          alt="Right Player"
          className="w-16 h-16 rounded-full border-2"
          style={{ borderColor: "#FFD369" }}
        />
      </div>
      
      <div className="col-span-2 flex justify-center">
        <div className="flex items-center gap-4">
          <img
            src="playerBottom.jpeg"
            alt="Bottom Player"
            className="w-16 h-16 rounded-full border-2"
            style={{ borderColor: "#FF00FF" }}
          />
          <div className="text-4xl font-bold" style={{ color: "#FF00FF" }}>
            {scores.playerBottom}
          </div>
        </div>
      </div>
    </div>
  );
};

export function MultiplePlayersGame() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const lastPlayerRef = useRef(null);
  const scoreTimeoutRef = useRef(null);
  const divRef = useRef(null);
  const searchParams = useSearchParams();
  
  const [bgColor, setBgColor] = useState(null);
  const [borderColor, setBorderColor] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [EndModel, setEndModel] = useState(false);
  const [scores, setScores] = useState({
    playerLeft: 0,
    playerRight: 0,
    playerTop: 0,
    playerBottom: 0
  });

  const updateScores = (lastPlayer) => {
    if (!lastPlayer) return;
    
    setScores(prevScores => {
      const newScores = { ...prevScores };
      newScores[lastPlayer]++;
      
      // Check for game over
      if (newScores[lastPlayer] >= GAME_CONSTANTS.MAX_SCORE) {
        setIsGameOver(true);
        setWinner(lastPlayer);
        setEndModel(true);
      }
      
      return newScores;
    });
  };

  const handlePaddleHit = (paddleSide, playerType) => {
    // Clear any existing timeout to prevent double scoring
    if (scoreTimeoutRef.current) {
      clearTimeout(scoreTimeoutRef.current);
    }
    
    // Update last player
    lastPlayerRef.current = playerType;
    
    // Reverse ball direction and add some randomization
    if (paddleSide === 'left' || paddleSide === 'right') {
      Ball.vx *= -1;
      Ball.vy += (Math.random() - 0.5) * 2;
    } else {
      Ball.vy *= -1;
      Ball.vx += (Math.random() - 0.5) * 2;
    }
    
    // Ensure ball doesn't get too slow or too fast
    const speed = Math.sqrt(Ball.vx * Ball.vx + Ball.vy * Ball.vy);
    if (speed > GAME_CONSTANTS.MAX_BALL_SPEED) {
      Ball.vx *= GAME_CONSTANTS.MAX_BALL_SPEED / speed;
      Ball.vy *= GAME_CONSTANTS.MAX_BALL_SPEED / speed;
    }
  };

  const resetBall = (direction) => {
    // Update score before resetting
    const lastPlayer = lastPlayerRef.current;
    if (lastPlayer) {
      updateScores(lastPlayer);
    }
    
    // Reset ball position and velocity
    Ball.x = GAME_CONSTANTS.ORIGINAL_WIDTH / 2;
    Ball.y = GAME_CONSTANTS.ORIGINAL_HEIGHT / 2;
    const angle = Math.random() * Math.PI * 2;
    Ball.vx = Math.cos(angle) * GAME_CONSTANTS.INITIAL_BALL_SPEED * direction;
    Ball.vy = Math.sin(angle) * GAME_CONSTANTS.INITIAL_BALL_SPEED;
    Ball.radius = GAME_CONSTANTS.BALL_RADIUS;
    
    // Reset last player after a short delay
    scoreTimeoutRef.current = setTimeout(() => {
      lastPlayerRef.current = null;
    }, 100);
  };

  const checkCollision = (ball, paddle, isHorizontal = false) => {
    if (isHorizontal) {
      return (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        Math.abs(ball.y - paddle.y) < (ball.radius + paddle.height)
      );
    }
    return (
      ball.y > paddle.y &&
      ball.y < paddle.y + paddle.height &&
      Math.abs(ball.x - paddle.x) < (ball.radius + paddle.width)
    );
  };

  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas || isGameOver) return;

    // Update ball position
    Ball.x += Ball.vx;
    Ball.y += Ball.vy;

    // Handle collisions with paddles
    if (checkCollision(Ball, leftPaddle)) {
      handlePaddleHit('left', 'playerLeft');
    }
    if (checkCollision(Ball, rightPaddle)) {
      handlePaddleHit('right', 'playerRight');
    }
    if (checkCollision(Ball, topPaddle, true)) {
      handlePaddleHit('top', 'playerTop');
    }
    if (checkCollision(Ball, bottomPaddle, true)) {
      handlePaddleHit('bottom', 'playerBottom');
    }

    // Update paddle positions
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;
    topPaddle.x += topPaddle.dx;
    bottomPaddle.x += bottomPaddle.dx;

    // Keep paddles within bounds
    leftPaddle.y = Math.max(0, Math.min(GAME_CONSTANTS.ORIGINAL_HEIGHT - leftPaddle.height, leftPaddle.y));
    rightPaddle.y = Math.max(0, Math.min(GAME_CONSTANTS.ORIGINAL_HEIGHT - rightPaddle.height, rightPaddle.y));
    topPaddle.x = Math.max(0, Math.min(GAME_CONSTANTS.ORIGINAL_WIDTH - topPaddle.width, topPaddle.x));
    bottomPaddle.x = Math.max(0, Math.min(GAME_CONSTANTS.ORIGINAL_WIDTH - bottomPaddle.width, bottomPaddle.x));

    // Ball out of bounds checks
    if (Ball.x < GAME_CONSTANTS.BALL_RADIUS) {
      resetBall(1);
    }
    if (Ball.x > GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.BALL_RADIUS) {
      resetBall(-1);
    }
    if (Ball.y < GAME_CONSTANTS.BALL_RADIUS) {
      resetBall(1);
    }
    if (Ball.y > GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.BALL_RADIUS) {
      resetBall(-1);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isGameOver) return;
    
    const context = canvas.getContext("2d");
    contextRef.current = context;
    
    setBgColor("#393E46");
    setBorderColor("#FFD369");

    initialCanvas(divRef, canvas);

    const handleKeyDown = (event) => {
      if (isGameOver) return;
      if (event.code === "KeyW") leftPaddle.dy = -12;
      if (event.code === "KeyS") leftPaddle.dy = 12;
      if (event.code === "ArrowUp") rightPaddle.dy = -12;
      if (event.code === "ArrowDown") rightPaddle.dy = 12;
      if (event.code === "KeyA") topPaddle.dx = -12;
      if (event.code === "KeyD") topPaddle.dx = 12;
      if (event.code === "ArrowLeft") bottomPaddle.dx = -12;
      if (event.code === "ArrowRight") bottomPaddle.dx = 12;
    };

    const handleKeyUp = (event) => {
      if (isGameOver) return;
      if (event.code === "KeyW" || event.code === "KeyS") leftPaddle.dy = 0;
      if (event.code === "ArrowUp" || event.code === "ArrowDown") rightPaddle.dy = 0;
      if (event.code === "KeyA" || event.code === "KeyD") topPaddle.dx = 0;
      if (event.code === "ArrowLeft" || event.code === "ArrowRight") bottomPaddle.dx = 0;
    };

    let animationFrameId;

    const gameLoop = () => {
      if (!canvas || !contextRef.current || isGameOver) return;
      update();
      draw(contextRef, canvasRef, "4players");
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
      }
    };
  }, [isGameOver]);

  return (
    <div
      ref={divRef}
      className="text-sm h-lvh min-h-screen"
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <FourPlayerScoreDisplay scores={scores} />
        
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            style={{ 
              backgroundColor: bgColor, 
              borderColor: borderColor,
              maxWidth: "800px",
              maxHeight: "800px"
            }}
            className="border-2"
          />
        </div>

        {isGameOver && EndModel && (
          <GameResultModal
            setEndModel={setEndModel}
            scores={scores}
            winner={winner}
          />
        )}

        <div
          className="fixed left-10 bottom-10 cursor-pointer"
          onClick={() => {
            window.location.assign("/");
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
  );
}