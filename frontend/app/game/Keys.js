import { leftPaddle, rightPaddle } from "./Bodies";
import { useWebSocketContext } from "./webSocket";
import { scaling, unscaling, GAME_CONSTANTS } from "./Game";


export const update = (
  canvasRef,
  RacketHeight,
  positionRef,
  sendGameMessage
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const newY = leftPaddle.y + leftPaddle.dy;
  const gameCoords = unscaling(0, positionRef.current.y_right, canvas);
  rightPaddle.y = gameCoords.y;
  // rightPaddle.y = positionRef.current.y_right * scaleY;
  
  // Keep paddles within bounds
  leftPaddle.y = Math.max(
    0,
    Math.min(GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT, newY)
  );
  rightPaddle.y = Math.max(
    0,
    Math.min(GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT, gameCoords.y)
  );

  // const {y} = unscaling(leftPaddle.x, leftPaddle.y, canvas)

  sendGameMessage({
    type: "PaddleLeft_move",
    // y_position: y,//need to change to game coordinates not screen coordinates
    y_position: leftPaddle.y
  });
};
