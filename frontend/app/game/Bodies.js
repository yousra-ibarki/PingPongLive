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
  x: 10,
  y: window.innerHeight * 0.3 - 39,
  width: 20,
  height: 100,
  dy: 0,
};

export const rightPaddle = {
  x: window.innerWidth * 0.7 - 30,
  y: window.innerHeight * 0.3 - 39,
  width: 20,
  height: 100,
  dy: 0,
};

export const fil = {
  x: (window.innerWidth * 0.7) / 2,
  y: window.innerHeight * 0.3,
};

export const draw = (contextRef, canvasRef, RacketWidth, RacketHeight, BallRadius, positionRef, playerName, sendGameMessage, gameState) => {
  // const { RacketWidth, RacketHeight, BallRadius } = useWebSocketContext();
  console.log("Drawing ball at:", positionRef.current.x_ball, positionRef.current.y_ball);
  const context = contextRef.current;
  const canvas = canvasRef.current;
  if (!context || !canvas) return;
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw left racket
  context.fillStyle = "#EEEEEE";
  context.fillRect(leftPaddle.x, leftPaddle.y, RacketWidth, RacketHeight);

  // Draw right racket
  context.fillStyle = "#FFD369";
  context.fillRect(rightPaddle.x, rightPaddle.y, RacketWidth, RacketHeight);

  // Draw fil
  context.fillStyle = "#000000";
  context.fillRect(fil.x, fil.y - canvas.height / 2, 1, canvas.height);

  context.beginPath();
  // const direction = positionRef.current.ball_owner === gameState.playerTwoN ? 1 : -1;
  context.arc(positionRef.current.x_ball, positionRef.current.y_ball, positionRef.current.ball_radius, 0, Math.PI * 2);
  context.fillStyle = "#00FFD1";
  context.fill();
};
