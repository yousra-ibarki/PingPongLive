import { useWebSocketContext } from "./webSocket";
import { scaling, GAME_CONSTANTS } from "./Game";

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

// export const draw = (contextRef, canvasRef, positionRef) => {

//   const context = contextRef.current;
//   const canvas = canvasRef.current;
//   if (!context || !canvas) return;
//   context.clearRect(0, 0, canvas.width, canvas.height);


//   const {scaleX, scaleY} = scaling(0, 0, canvas);
//   // const ballRadius = GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY);

  
//   // Scale everything from game coordinates to screen coordinates
//   const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
//   const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);
//   const ballScreen = scaling(positionRef.current.x_ball, positionRef.current.y_ball, canvas);
  

//   // Draw left racket
//   context.fillStyle = "#EEEEEE";    
//   context.fillRect(
//     leftPaddleScreen.x, 
//     leftPaddleScreen.y, 
//     GAME_CONSTANTS.PADDLE_WIDTH * scaleX, 
//     GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
//   );
  
//   // Draw right racket
//   context.fillStyle = "#FFD369";
//   context.fillRect(
//     rightPaddleScreen.x, 
//     rightPaddleScreen.y, 
//     GAME_CONSTANTS.PADDLE_WIDTH * scaleX, 
//     GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
//   );
 

//   // Draw fil
//   context.fillStyle = "#000000";
//   context.fillRect(fil.x, fil.y - canvas.height / 2, 1, canvas.height);


//   // Draw ball with scaling
//   context.beginPath();
//   context.arc(
//     ballScreen.x,
//     ballScreen.y,
//     GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
//     0,
//     Math.PI * 2
//   );
//   context.fillStyle = "#00FFD1";
//   context.fill();
// };


export const draw = (contextRef, canvasRef, positionRef) => {
  const context = contextRef.current;
  const canvas = canvasRef.current;
  if (!context || !canvas) return;
  context.clearRect(0, 0, canvas.width, canvas.height);

  const {scaleX, scaleY} = scaling(0, 0, canvas);
  
  // Get screen coordinates
  // const isPlayerOnRight = positionRef.current.isPlayerOnRight;
  // const leftPaddleScreen = scaling(
  //     isPlayerOnRight ? GAME_CONSTANTS.ORIGINAL_WIDTH - leftPaddle.x - GAME_CONSTANTS.PADDLE_WIDTH : leftPaddle.x,
  //     leftPaddle.y,
  //     canvas
  // );
  // const rightPaddleScreen = scaling(
  //     isPlayerOnRight ? GAME_CONSTANTS.ORIGINAL_WIDTH - rightPaddle.x - GAME_CONSTANTS.PADDLE_WIDTH : rightPaddle.x,
  //     rightPaddle.y,
  //     canvas
  // );
  const leftPaddlePos = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddlePos = scaling(rightPaddle.x, rightPaddle.y, canvas);
  const ballScreen = scaling(positionRef.current.x_ball, positionRef.current.y_ball, canvas);

  // Draw paddles with proper positioning
  context.fillStyle = "#EEEEEE";    
  context.fillRect(
      leftPaddlePos.x,
      leftPaddlePos.y,
      GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
      GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );
  
  context.fillStyle = "#FFD369";
  context.fillRect(
      rightPaddlePos.x,
      rightPaddlePos.y,
      GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
      GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

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