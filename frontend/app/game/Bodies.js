import { useWebSocketContext } from "./webSocket";

//creating bodies
export const Ball = {
  x: window.innerWidth * 0.35, // initial position
  y: window.innerHeight * 0.3,
  radius: 17,
  vx: 3, // velocity x
  vy: 0, // velocity y
};

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

export const draw = (contextRef, canvasRef, RacketWidth, RacketHeight, BallRadius, positionRef, playerName, sendGameMessage) => {
  // const { RacketWidth, RacketHeight, BallRadius } = useWebSocketContext();

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

  // Draw ball
  sendGameMessage({
    type: "Ball_move",
    x_ball: Ball.x,
    y_ball: Ball.y,
    x_velocity: Ball.vx,
    y_velocity: Ball.vy,
  });
  
  context.beginPath();
  context.arc(Ball.x, Ball.y, BallRadius, 0, Math.PI * 2);
  context.fillStyle = "#00FFD1";
  context.fill();
};
