import { Ball, leftPaddle, rightPaddle } from "./Bodies";
import { useWebSocketContext } from "./webSocket";

export const update = (
  canvasRef,
  RacketHeight,
  positionRef,
  sendGameMessage,
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  // Update paddle positions
  leftPaddle.y += leftPaddle.dy;
  sendGameMessage({
    type: "PaddleLeft_move",
    y_position: leftPaddle.y,
    yr_position: rightPaddle.y,
  });

  rightPaddle.y = positionRef.current.y_right;
  // rightPaddle.y += rightPaddle.dy;

  // Keep paddles within bounds
  leftPaddle.y = Math.max(
    0,
    Math.min(canvas.height - RacketHeight, leftPaddle.y)
  );
  rightPaddle.y = Math.max(
    0,
    Math.min(canvas.height - RacketHeight, rightPaddle.y)
  );
};
