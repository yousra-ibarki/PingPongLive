import { Ball, leftPaddle, rightPaddle } from "./Bodies";
import { useWebSocketContext } from "./webSocket";

const increaseSpeed = (speed, positionRef) => {
  positionRef.current.x_velocity *= speed;
  positionRef.current.y_velocity *= speed;
};

//ensure the speed stays at maxSpeed
const controlSpeed = (minSpeed, maxSpeed, positionRef) => {
  const speed = Math.sqrt(Ball.vx ** 2 + Ball.vy ** 2);
  if (speed < minSpeed || speed > maxSpeed) {
    const scale = Math.min(maxSpeed / speed, Math.max(minSpeed / speed, 1));
    positionRef.current.x_velocity *= scale;
    positionRef.current.y_velocity *= scale;
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

const resetBall = (direction, canvasRef, sendGameMessage, gameState, positionRef) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  Ball.x = canvas.width / 2;
  Ball.y = canvas.height / 2;
  if (gameState.playerTwoN !== "Loading...") {
    positionRef.current.x_velocity = 3 * direction;
    positionRef.current.y_velocity = 2;
  }
  // Ball.vy = Math.random() * 2 - 1;

  sendGameMessage({
    type: "Ball_move",
    x_ball: Ball.x,
    y_ball: Ball.y,
    x_velocity: positionRef.current.x_velocity,
    y_velocity: positionRef.current.y_velocity,
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
  gameState
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  // const Ball = CreateBall(playerName, positionRef);
  // Determine direction based on ball owner
  const direction =
    positionRef.current.ball_owner === gameState.playerTwoN ? 1 : -1;

  console.log(gameState.playerTwoN, positionRef.current.ball_owner);
  // Initialize ball if at starting position
  if (
    Ball.x === window.innerWidth * 0.35 &&
    Ball.y === window.innerHeight * 0.3
  ) {
    console.log("hello ", direction);
    if (gameState.playerTwoN !== "Loading...") {
      Ball.vx = 3 * direction;
      Ball.vy = 2;
    }
    // Ball.vy = Math.random() * 2 - 1;
    sendGameMessage({
      type: "Ball_move",
      x_ball: Ball.x,
      y_ball: Ball.y,
      x_velocity: Ball.vx,
      y_velocity: Ball.vy,
    });
  }

  // Update ball position
  // Ball.x += Ball.vx;
  // Ball.y += Ball.vy;
  Ball.x += positionRef.current.x_velocity;
  Ball.y += positionRef.current.y_velocity;

  // Bounce ball off top and bottom walls
  if (Ball.y - BallRadius < 0 || Ball.y + BallRadius > canvas.height) {
    positionRef.current.y_velocity *= -1;
    sendGameMessage({
      type: "Ball_move",
      x_ball: Ball.x,
      y_ball: Ball.y,
      x_velocity: Ball.vx,
      y_velocity: Ball.vy,
    });
  }

  // Check collision with paddles
  if (
    checkCollision(Ball, leftPaddle, BallRadius, RacketWidth, RacketHeight) ||
    checkCollision(Ball, rightPaddle, BallRadius, RacketWidth, RacketHeight)
  ) {
    positionRef.current.x_velocity *= -1;
    sendGameMessage({
      type: "Ball_move",
      x_ball: Ball.x,
      y_ball: Ball.y,
      x_velocity: Ball.vx,
      y_velocity: Ball.vy,
    });
    // Ball.vy += leftPaddle.dy;

    increaseSpeed(1.08, positionRef);
    controlSpeed(3, 4, positionRef);

    // Send updated ball position and velocity to server
    // sendGameMessage({
    //   type: "Ball_move",
    //   x_ball: Ball.x,
    //   y_ball: Ball.y,
    //   x_velocity: Ball.vx,
    //   y_velocity: Ball.vy,
    // });
    sendGameMessage({
      type: "PaddleLeft_move",
      x_position: leftPaddle.x,
      y_position: leftPaddle.y,
    });
  }

  // Score handling
  if (Ball.x - BallRadius < 0) {
    setScoreB((prev) => prev + 1);
    resetBall(direction, canvasRef, sendGameMessage, gameState, positionRef);
  }

  if (Ball.x + BallRadius > canvas.width) {
    setScoreA((prev) => prev + 1);
    resetBall(direction, canvasRef, sendGameMessage, gameState, positionRef);
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
  leftPaddle.y = Math.max(
    0,
    Math.min(canvas.height - RacketHeight, leftPaddle.y)
  );
  rightPaddle.y = Math.max(
    0,
    Math.min(canvas.height - RacketHeight, rightPaddle.y)
  );
};
