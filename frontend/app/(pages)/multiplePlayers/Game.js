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
  const divRef = useRef(null);
  const lastPlayerRef = useRef(null);
  const scoreTimeoutRef = useRef(null);
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
  var map;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isGameOver) return;
    
    const context = canvas.getContext("2d");
    contextRef.current = context;
    map = searchParams.get("mapNum");

    
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
      if (isGameOver) return;
      if (event.code === "KeyW") leftPaddle.dy = -14;
      if (event.code === "KeyS") leftPaddle.dy = 14;
      if (event.code === "ArrowUp") rightPaddle.dy = -14;
      if (event.code === "ArrowDown") rightPaddle.dy = 14;
      if (event.code === "KeyA") topPaddle.dx = -14;
      if (event.code === "KeyD") topPaddle.dx = 14;
      if (event.code === "ArrowLeft") bottomPaddle.dx = -14;
      if (event.code === "ArrowRight") bottomPaddle.dx = 14;
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
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
      }
    };
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver) return;
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = divRef.current;
      const containerWidth = container.clientWidth * 0.7;
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
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas || isGameOver) return;

    const { scaleX, scaleY } = scaling(0, 0, canvas);

    // Update ball position
    Ball.x += Ball.vx;
    Ball.y += Ball.vy;

  // Left wall collision only in the top and bottom 15% areas
  if (Ball.x - GAME_CONSTANTS.BALL_RADIUS <= 0 &&
      (Ball.y < GAME_CONSTANTS.VERTICAL_PLAYABLE_START || 
       Ball.y > GAME_CONSTANTS.VERTICAL_PLAYABLE_END)) {
    Ball.x = GAME_CONSTANTS.BALL_RADIUS;
    Ball.vx = -Ball.vx;
  }
  
  // Right wall collision only in the top and bottom 15% areas
  if (Ball.x + GAME_CONSTANTS.BALL_RADIUS >= GAME_CONSTANTS.ORIGINAL_WIDTH &&
      (Ball.y < GAME_CONSTANTS.VERTICAL_PLAYABLE_START || 
       Ball.y > GAME_CONSTANTS.VERTICAL_PLAYABLE_END)) {
    Ball.x = GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.BALL_RADIUS;
    Ball.vx = -Ball.vx;
  }
  
  // Top wall collision only in the left and right 15% areas
  if (Ball.y - GAME_CONSTANTS.BALL_RADIUS <= 0 &&
      (Ball.x < GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START || 
       Ball.x > GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END)) {
    Ball.y = GAME_CONSTANTS.BALL_RADIUS;
    Ball.vy = -Ball.vy;
  }
  
  // Bottom wall collision only in the left and right 15% areas
  if (Ball.y + GAME_CONSTANTS.BALL_RADIUS >= GAME_CONSTANTS.ORIGINAL_HEIGHT &&
      (Ball.x < GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START || 
       Ball.x > GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END)) {
    Ball.y = GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.BALL_RADIUS;
    Ball.vy = -Ball.vy;
  }


    // Handle collisions with paddles
    if (checkCollision(Ball, leftPaddle)) {
      // Clear any existing timeout to prevent double scoring
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
      }
    
      // Update last player
      lastPlayerRef.current = 'playerLeft';

      // Calculate how far up or down the paddle the ball hit
      const hitLocation = (Ball.y - leftPaddle.y) / GAME_CONSTANTS.PADDLE_HEIGHT;

      // Base speed calculation
      let newSpeed = Math.abs(Ball.vx) * GAME_CONSTANTS.SPEED_FACTOR;
      newSpeed = Math.min(newSpeed, GAME_CONSTANTS.MAX_BALL_SPEED);
      newSpeed = Math.max(newSpeed, GAME_CONSTANTS.MIN_BALL_SPEED);

      // Change ball direction based on where it hit the paddle
      Ball.vx = newSpeed;
      // hitLocation is between 0 and 1, convert to -1 to 1 range
      const angle = (hitLocation - 0.5) * 2;
      Ball.vy = angle * 8 + leftPaddle.dy * GAME_CONSTANTS.PADDLE_IMPACT;
      // handlePaddleHit('left', 'playerLeft');
    }
    if (checkCollision(Ball, rightPaddle)) {
      // Clear any existing timeout to prevent double scoring
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
      }
    
      // Update last player
      lastPlayerRef.current = 'playerRight';

      const hitLocation =
      (Ball.y - rightPaddle.y) / GAME_CONSTANTS.PADDLE_HEIGHT;

      let newSpeed = Math.abs(Ball.vx) * GAME_CONSTANTS.SPEED_FACTOR;
      newSpeed = Math.min(newSpeed, GAME_CONSTANTS.MAX_BALL_SPEED);
      newSpeed = Math.max(newSpeed, GAME_CONSTANTS.MIN_BALL_SPEED);

      Ball.vx = -newSpeed;
      const angle = (hitLocation - 0.5) * 2;
      Ball.vy = angle * 8 + rightPaddle.dy * GAME_CONSTANTS.PADDLE_IMPACT;
        // handlePaddleHit('right', 'playerRight');
    }
    if (checkCollision(Ball, topPaddle, true)) {
      // Clear any existing timeout to prevent double scoring
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
      }

      // Update last player
      lastPlayerRef.current = 'playerTop';

      const hitLocation =
      (Ball.x - topPaddle.x) / GAME_CONSTANTS.PADDLE_WIDTH;

      let newSpeed = Math.abs(Ball.vy) * GAME_CONSTANTS.SPEED_FACTOR;
      newSpeed = Math.min(newSpeed, GAME_CONSTANTS.MAX_BALL_SPEED);
      newSpeed = Math.max(newSpeed, GAME_CONSTANTS.MIN_BALL_SPEED);

      Ball.vy = newSpeed;
      // const angle = (hitLocation - 0.5) * 2;
      const angle = (hitLocation - 0.5) * Math.PI / 3; // Reduced angle range
      // Ball.vx = angle * 4 + topPaddle.dx * GAME_CONSTANTS.PADDLE_IMPACT;
      Ball.vx = Math.sin(angle) * newSpeed * 0.8 + topPaddle.dx * 0.3;
      // handlePaddleHit('top', 'playerTop');
      // Ensure the total velocity doesn't exceed MAX_BALL_SPEED
      const totalSpeed = Math.sqrt(Ball.vx * Ball.vx + Ball.vy * Ball.vy);
      if (totalSpeed > GAME_CONSTANTS.MAX_BALL_SPEED) {
        const scale = GAME_CONSTANTS.MAX_BALL_SPEED / totalSpeed;
        Ball.vx *= scale;
        Ball.vy *= scale;
      }
    }
    if (checkCollision(Ball, bottomPaddle, true)) {
      // Clear any existing timeout to prevent double scoring
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
      }

      // Update last player
      lastPlayerRef.current = 'playerBottom';

      const hitLocation =
      (Ball.x - bottomPaddle.x) / GAME_CONSTANTS.PADDLE_WIDTH;

      let newSpeed = Math.abs(Ball.vy) * GAME_CONSTANTS.SPEED_FACTOR;
      newSpeed = Math.min(newSpeed, GAME_CONSTANTS.MAX_BALL_SPEED);
      newSpeed = Math.max(newSpeed, GAME_CONSTANTS.MIN_BALL_SPEED);

      Ball.vy = -newSpeed;
      // const angle = (hitLocation - 0.5) * 2;
      const angle = (hitLocation - 0.5) * Math.PI / 3; // Reduced angle range
      // Ball.vx = angle * 4 + bottomPaddle.dx * GAME_CONSTANTS.PADDLE_IMPACT;
      // handlePaddleHit('bottom', 'playerBottom');
      Ball.vx = Math.sin(angle) * newSpeed * 0.8 + bottomPaddle.dx * 0.3;

      // Ensure the total velocity doesn't exceed MAX_BALL_SPEED
      const totalSpeed = Math.sqrt(Ball.vx * Ball.vx + Ball.vy * Ball.vy);
      if (totalSpeed > GAME_CONSTANTS.MAX_BALL_SPEED) {
        const scale = GAME_CONSTANTS.MAX_BALL_SPEED / totalSpeed;
        Ball.vx *= scale;
        Ball.vy *= scale;
      }
    }

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

    // Update paddle positions
    leftPaddle.y += leftPaddle.dy / scaleY;
    rightPaddle.y += rightPaddle.dy / scaleY;
    topPaddle.x += topPaddle.dx / scaleX;
    bottomPaddle.x += bottomPaddle.dx / scaleX;


    // Keep paddles within restricted bounds (70% playable area)
    leftPaddle.y = Math.max(
      GAME_CONSTANTS.VERTICAL_PLAYABLE_START,
      Math.min(GAME_CONSTANTS.VERTICAL_PLAYABLE_END - GAME_CONSTANTS.PADDLE_HEIGHT,
      leftPaddle.y)
    );
  
    rightPaddle.y = Math.max(
      GAME_CONSTANTS.VERTICAL_PLAYABLE_START,
      Math.min(GAME_CONSTANTS.VERTICAL_PLAYABLE_END - GAME_CONSTANTS.PADDLE_HEIGHT,
      rightPaddle.y)
    );
  
    topPaddle.x = Math.max(
      GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START,
      Math.min(GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END - GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH,
      topPaddle.x)
    );
  
    bottomPaddle.x = Math.max(
      GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START,
      Math.min(GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END - GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH,
      bottomPaddle.x)
    );
  };

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

  const checkCollision = (ball, paddle, isHorizontal = false) => {
    if (isHorizontal) {
      return (
        ball.x - GAME_CONSTANTS.BALL_RADIUS < paddle.x + paddle.width &&
        ball.x + GAME_CONSTANTS.BALL_RADIUS > paddle.x &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height
      );
    }
    return (
      ball.x - GAME_CONSTANTS.BALL_RADIUS < paddle.x + paddle.width &&
      ball.x + GAME_CONSTANTS.BALL_RADIUS > paddle.x &&
      ball.y - GAME_CONSTANTS.BALL_RADIUS < paddle.y + paddle.height &&
      ball.y + GAME_CONSTANTS.BALL_RADIUS > paddle.y
    );
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
    Ball.vx = GAME_CONSTANTS.INITIAL_BALL_SPEED * direction;
    Ball.vy = (Math.random() * 4 + 1) * (Math.random() < 0.5 ? -1 : 1);
    Ball.radius = GAME_CONSTANTS.BALL_RADIUS;
    
    // Reset last player after a short delay
    scoreTimeoutRef.current = setTimeout(() => {
      lastPlayerRef.current = null;
    }, 100);
  };

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