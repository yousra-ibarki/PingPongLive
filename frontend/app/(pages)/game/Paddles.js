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
  positionRef,
  sendGameMessage
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const newY = leftPaddle.y + leftPaddle.dy;

  rightPaddle.y = positionRef.current.y_right;

  leftPaddle.y = Math.max(
    0,
    Math.min(GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT, newY)
  );
  rightPaddle.y = Math.max(
    0,
    Math.min(GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT, positionRef.current.y_right)
  );


  sendGameMessage({
    type: "PaddleLeft_move",
    y_position: leftPaddle.y
  });
};
