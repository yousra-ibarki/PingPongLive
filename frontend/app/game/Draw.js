import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./Paddles"

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

  const {scaleX, scaleY} = scaling(0, 0, canvas);
  
  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);
  const ballScreen = scaling(positionRef.current.x_ball, positionRef.current.y_ball, canvas);


  // Draw paddles with proper positioning
  context.fillStyle = "#EEEEEE";    
  context.fillRect(
      leftPaddleScreen.x,
      leftPaddleScreen.y,
      GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
      GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );
  
  context.fillStyle = "#FFD369";
  context.fillRect(
      rightPaddleScreen.x,
      rightPaddleScreen.y,
      GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
      GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );


  //Draw fil
  context.fillStyle = "#000000";
  context.fillRect(fil.x, fil.y - canvas.height / 2, 1, canvas.height)



  // Draw ball
  context.beginPath();
  context.arc(
      ballScreen.x,
      ballScreen.y,
      GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
      0,
      Math.PI * 2
  );
  context.fillStyle = "#00FFD1";
  context.fill();
};