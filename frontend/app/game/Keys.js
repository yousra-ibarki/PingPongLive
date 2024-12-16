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
