"use client"

import { rightPaddle, leftPaddle, Ball } from "../Components/GameFunctions";
import { GAME_CONSTANTS, scaling } from "./OfflineGameHelper";

const checkCollision = (ball, paddle) => {
  return (
    ball.x - GAME_CONSTANTS.BALL_RADIUS < paddle.x + paddle.width &&
    ball.x + GAME_CONSTANTS.BALL_RADIUS > paddle.x &&
    ball.y > paddle.y &&
    ball.y < paddle.y + paddle.height
  );
};

const resetBall = (direction) => {
  Ball.x = GAME_CONSTANTS.ORIGINAL_WIDTH / 2;
  Ball.y = GAME_CONSTANTS.ORIGINAL_HEIGHT / 2;
  Ball.vx = GAME_CONSTANTS.INITIAL_BALL_SPEED * direction;
  Ball.vy = (Math.random() * 6 + 1) * (Math.random() < 0.5 ? -1 : 1);
  Ball.radius = GAME_CONSTANTS.BALL_RADIUS;
};



export const update = (canvasRef, setScoreA, setScoreB, setIsGameOver, setLoser, setWinner, setEndModel, isGameOver) => {
    const canvas = canvasRef.current;
    if (!canvas || isGameOver) return;

    const { scaleX, scaleY } = scaling(0, 0, canvas);

    // Update Ball position
    Ball.x += Ball.vx;
    Ball.y += Ball.vy;

    // Bounce Ball off top and bottom walls
    if (
      Ball.y < GAME_CONSTANTS.BALL_RADIUS ||
      Ball.y > GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.BALL_RADIUS
    ) {
      Ball.vy *= -1;
      Ball.vy += (Math.random() - 0.5) * 0.5;

    }

    if (checkCollision(Ball, leftPaddle)) {
      // Calculate how far up or down the paddle the ball hit
      const hitLocation =
        (Ball.y - leftPaddle.y) / GAME_CONSTANTS.PADDLE_HEIGHT;

      // Base speed calculation
      let newSpeed = Math.abs(Ball.vx) * GAME_CONSTANTS.SPEED_FACTOR;
      newSpeed = Math.min(newSpeed, GAME_CONSTANTS.MAX_BALL_SPEED);
      newSpeed = Math.max(newSpeed, GAME_CONSTANTS.MIN_BALL_SPEED);

      // Change ball direction based on where it hit the paddle
      Ball.vx = newSpeed;
      // hitLocation is between 0 and 1, convert to -1 to 1 range
      const angle = (hitLocation - 0.5) * 2;
      Ball.vy = angle * 8 + leftPaddle.dy * GAME_CONSTANTS.PADDLE_IMPACT;
    }

    if (checkCollision(Ball, rightPaddle)) {
      const hitLocation =
        (Ball.y - rightPaddle.y) / GAME_CONSTANTS.PADDLE_HEIGHT;

      let newSpeed = Math.abs(Ball.vx) * GAME_CONSTANTS.SPEED_FACTOR;
      newSpeed = Math.min(newSpeed, GAME_CONSTANTS.MAX_BALL_SPEED);
      newSpeed = Math.max(newSpeed, GAME_CONSTANTS.MIN_BALL_SPEED);

      Ball.vx = -newSpeed;
      const angle = (hitLocation - 0.5) * 2;
      Ball.vy = angle * 8 + rightPaddle.dy * GAME_CONSTANTS.PADDLE_IMPACT;
    }

    // Score handling
    if (Ball.x < GAME_CONSTANTS.BALL_RADIUS) {
      setScoreB((prevNumber) => {
        const newScore = prevNumber + 1;
        if (newScore >= GAME_CONSTANTS.MAX_SCORE) {
          setIsGameOver(true);
          setWinner("playerB");
          setLoser("playerA");
          setEndModel(true);
        }
        return newScore;
      });
      resetBall(1);
    }

    if (Ball.x > GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.BALL_RADIUS) {
      setScoreA((prevNumber) => {
        const newScore = prevNumber + 1;
        if (newScore >= GAME_CONSTANTS.MAX_SCORE) {
          setIsGameOver(true);
          setWinner("playerA");
          setLoser("playerB");
          setEndModel(true);
        }
        return newScore;
      });
      resetBall(-1);
    }

    // Move rackets
    leftPaddle.y += leftPaddle.dy / scaleY;
    rightPaddle.y += rightPaddle.dy / scaleY;

    // Keep rackets within bounds
    leftPaddle.y = Math.max(
      0,
      Math.min(
        GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT,
        leftPaddle.y
      )
    );
    rightPaddle.y = Math.max(
      0,
      Math.min(
        GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT,
        rightPaddle.y
      )
    );
  };