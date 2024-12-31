import { leftPaddle, rightPaddle } from "./Draw";
import { GAME_CONSTANTS } from "./GameHelper";



export const scaling = (gameX, gameY, canvas) => {
  const scaleX = canvas.width / GAME_CONSTANTS.ORIGINAL_WIDTH;
  const scaleY = canvas.height / GAME_CONSTANTS.ORIGINAL_HEIGHT;

  return {
    x: gameX * scaleX,
    y: gameY * scaleY,
    scaleX,
    scaleY,
  };
};


export const updatePaddle = (
  canvasRef,
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // Keep rackets within bounds
  leftPaddle.y = Math.max(
    0,
    Math.min(canvas.height - GAME_CONSTANTS.PADDLE_HEIGHT, leftPaddle.y)
  );
  rightPaddle.y = Math.max(
    0,
    Math.min(canvas.height - GAME_CONSTANTS.PADDLE_HEIGHT, rightPaddle.y)
  );


};
