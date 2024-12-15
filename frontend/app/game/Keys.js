import { Ball, leftPaddle, rightPaddle } from "./Bodies";
import { useWebSocketContext } from "./webSocket";

export const update = (
  canvasRef,
  RacketHeight,
  positionRef,
  sendGameMessage
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  // Update paddle positions
  leftPaddle.y += leftPaddle.dy;

  rightPaddle.y = positionRef.current.y_right;
  
  // Keep paddles within bounds
  leftPaddle.y = Math.max(
    0,
    Math.min(canvas.height - RacketHeight, leftPaddle.y)
  );
  rightPaddle.y = Math.max(
    0,
    Math.min(canvas.height - RacketHeight, rightPaddle.y)
  );
  const gamePosition = (leftPaddle.y * 610) / canvas.height 
  sendGameMessage({
    type: "PaddleLeft_move",
    y_position: gamePosition,//need to change to game coordinates not screen coordinates
    // y_position: leftPaddle.y
  });
};
