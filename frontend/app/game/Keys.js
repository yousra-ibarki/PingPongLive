import { Ball, leftPaddle, rightPaddle } from "./Bodies";
import { useWebSocketContext } from "./webSocket";

const increaseSpeed = (speed) => {
  Ball.vx *= speed;
  Ball.vy *= speed;
};

//ensure the speed stays at maxSpeed
const controlSpeed = (minSpeed, maxSpeed) => {
  const speed = Math.sqrt(Ball.vx ** 2 + Ball.vy ** 2);
  if (speed < minSpeed || speed > maxSpeed) {
    const scale = Math.min(maxSpeed / speed, Math.max(minSpeed / speed, 1));
    Ball.vx *= scale;
    Ball.vy *= scale;
  }
};

const checkCollision = (
  Ball,
  paddle,
  BallRadius,
  RacketWidth,
  RacketHeight
) => {
  return (
    Ball.x - BallRadius < paddle.x + RacketWidth &&
    Ball.x + BallRadius > paddle.x &&
    Ball.y > paddle.y &&
    Ball.y < paddle.y + RacketHeight
  );
};

const resetBall = (direction, canvasRef, sendGameMessage) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  Ball.x = canvas.width / 2;
  Ball.y = canvas.height / 2;
  Ball.vx = 3 * direction;
  Ball.vy = Math.random() * 2 - 1;

  sendGameMessage({
    type: "Ball_reset",
    x_ball: Ball.x,
    y_ball: Ball.y,
    x_velocity: Ball.vx,
    y_velocity: Ball.vy,
  });
};

// Update positions
export const update = (
  canvasRef,
  RacketHeight,
  BallRadius,
  RacketWidth,
  setScoreA,
  setScoreB,
  sendGameMessage,
  positionRef,
  playerName
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  // const Ball = CreateBall(playerName, positionRef);
  // Determine direction based on ball owner
  const direction = positionRef.current.ball_owner === playerName ? 1 : -1;


  // Initialize ball if at starting position
  if (Ball.x === canvas.width / 2 && Ball.y === canvas.height / 2) {
    Ball.vx = 3 * direction;
    Ball.vy = Math.random() * 2 - 1;
  }

  // Update ball position
  Ball.x += Ball.vx;
  Ball.y += Ball.vy;

  // Bounce ball off top and bottom walls
  if (Ball.y - BallRadius < 0 || Ball.y + BallRadius > canvas.height) {
    Ball.vy *= -1;
  }

  // Check collision with paddles
  if (checkCollision(Ball, leftPaddle, BallRadius, RacketWidth, RacketHeight) ||
      checkCollision(Ball, rightPaddle, BallRadius, RacketWidth, RacketHeight)) {
    Ball.vx *= -1;
    // Ball.vy += leftPaddle.dy;

    increaseSpeed(1.08);
    controlSpeed(3, 14);

    // Send updated ball position and velocity to server
    sendGameMessage({
      type: "Ball_move",
      x_ball: Ball.x,
      y_ball: Ball.y,
      x_velocity: Ball.vx,
      y_velocity: Ball.vy,
    });
    sendGameMessage({
      type: "PaddleLeft_move",
      x_position: leftPaddle.x,
      y_position: leftPaddle.y,
    });
  }

  // Score handling
  if (Ball.x - BallRadius < 0) {
    setScoreB(prev => prev + 1);
    resetBall(direction, canvasRef, sendGameMessage);
  }

  if (Ball.x + BallRadius > canvas.width) {
    setScoreA(prev => prev + 1);
    resetBall(direction, canvasRef, sendGameMessage);
  }

  // Update paddle positions
  leftPaddle.y += leftPaddle.dy;
  sendGameMessage({
    type: "PaddleLeft_move",
    y_position: leftPaddle.y,
  });

  rightPaddle.y = positionRef.current.y_right;
  // rightPaddle.y += rightPaddle.dy;

  // Keep paddles within bounds
  leftPaddle.y = Math.max(0, Math.min(canvas.height - RacketHeight, leftPaddle.y));
  rightPaddle.y = Math.max(0, Math.min(canvas.height - RacketHeight, rightPaddle.y));
};
