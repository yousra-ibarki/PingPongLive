import { useWebSocketContext } from "./webSocket";

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

export const draw = (contextRef, canvasRef, positionRef) => {

  const context = contextRef.current;
  const canvas = canvasRef.current;
  if (!context || !canvas) return;
  context.clearRect(0, 0, canvas.width, canvas.height);


  // const scaleX = canvas.width / 800;
  // const scaleY = canvas.height / 650;

  const scaledBallX = positionRef.current.x_ball;
  const scaledBallY = positionRef.current.y_ball;
  const scaledBallRadius = positionRef.current.ball_radius ;

  // Draw left racket
  context.fillStyle = "#EEEEEE";    
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  
  // Draw right racket
  context.fillStyle = "#FFD369";
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // Draw fil
  context.fillStyle = "#000000";
  context.fillRect(fil.x, fil.y - canvas.height / 2, 1, canvas.height);


  // Draw ball with scaling
  context.beginPath();
  context.arc(
    scaledBallX,
    scaledBallY,
    scaledBallRadius,
    0,
    Math.PI * 2
  );
  context.fillStyle = "#00FFD1";
  context.fill();
};
