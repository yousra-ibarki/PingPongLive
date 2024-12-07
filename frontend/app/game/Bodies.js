import { useWebSocketContext } from "./webSocket";

//creating bodies
// export const Ball = {
//   x: window.innerWidth * 0.35, // initial position
//   y: window.innerHeight * 0.3,
//   radius: 17,
//   vx: 0, // velocity x
//   vy: 0, // velocity y
// };

export const leftPaddle = {
  x: 0,
  y:0,
  width: 20,
  height: 130,
  dy: 0,
};

export const rightPaddle = {
  x: 0,
  y: 0,
  width: 20,
  height: 130,
  dy: 0,
};

export const fil = {
  x: 0,
  y: 0
};

export const draw = (contextRef, canvasRef, RacketWidth, RacketHeight, BallRadius, positionRef, playerName, sendGameMessage, gameState) => {

  const context = contextRef.current;
  const canvas = canvasRef.current;
  if (!context || !canvas) return;
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw left racket
  context.fillStyle = "#EEEEEE";
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);

  // Draw right racket
  context.fillStyle = "#FFD369";
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // Draw fil
  context.fillStyle = "#000000";
  context.fillRect(fil.x, fil.y - canvas.height / 2, 1, canvas.height);

  context.beginPath();
  // const direction = positionRef.current.ball_owner === gameState.playerTwoN ? 1 : -1;
  context.arc(positionRef.current.x_ball, positionRef.current.y_ball, positionRef.current.ball_radius, 0, Math.PI * 2);
  context.fillStyle = "#00FFD1";
  context.fill();
};
