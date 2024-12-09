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


  // Get the scaling factors based on the original canvas size vs current size
  const originalWidth = 800;  // Set this to your default/original canvas width
  const originalHeight = 600; // Set this to your default/original canvas height
  
  const scaleX = canvas.width / originalWidth;
  const scaleY = canvas.height / originalHeight;
  const scale = Math.min(scaleX, scaleY); // Use uniform scaling to prevent distortion

  // Scale the positions and dimensions while maintaining aspect ratio
  const scaledBallX = positionRef.current.x_ball * scaleX;
  const scaledBallY = positionRef.current.y_ball * scaleY;
  const scaledBallRadius = positionRef.current.ball_radius * scale;


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
