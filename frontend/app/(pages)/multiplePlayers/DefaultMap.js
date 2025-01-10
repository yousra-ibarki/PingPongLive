import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./GameHelper";
import { leftPaddle, rightPaddle, topPaddle, bottomPaddle, Ball } from "./Draw";

export const drawFourPlayerMap = (context, canvas) => {
  const { scaleX, scaleY } = scaling(0, 0, canvas);

    // Draw walls first
    context.fillStyle = "#333333";  // Dark color for walls

  // Left side walls (top and bottom sections)
  // Top left wall
  context.fillRect(
    0,
    0,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.VERTICAL_PLAYABLE_START * scaleY
  );
  // Bottom left wall
  context.fillRect(
    0,
    GAME_CONSTANTS.VERTICAL_PLAYABLE_END * scaleY,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    (GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.VERTICAL_PLAYABLE_END) * scaleY
  );

  // Right side walls (top and bottom sections)
  // Top right wall
  context.fillRect(
    (GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH) * scaleX,
    0,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.VERTICAL_PLAYABLE_START * scaleY
  );
  // Bottom right wall
  context.fillRect(
    (GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH) * scaleX,
    GAME_CONSTANTS.VERTICAL_PLAYABLE_END * scaleY,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    (GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.VERTICAL_PLAYABLE_END) * scaleY
  );

  // Top side walls (left and right sections)
  // Left top wall
  context.fillRect(
    0,
    0,
    GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );
  // Right top wall
  context.fillRect(
    GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END * scaleX,
    0,
    (GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END) * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );

  // Bottom side walls (left and right sections)
  // Left bottom wall
  context.fillRect(
    0,
    (GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_WIDTH) * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );
  // Right bottom wall
  context.fillRect(
    GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END * scaleX,
    (GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_WIDTH) * scaleY,
    (GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END) * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );


  // Draw leftPaddle
  context.fillStyle = "#EEEEEE";
  context.fillRect(
    leftPaddle.x * scaleX,
    leftPaddle.y * scaleY,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  // Draw rightPaddle
  context.fillStyle = "#FFD369";
  context.fillRect(
    rightPaddle.x * scaleX,
    rightPaddle.y * scaleY,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  // Draw topPaddle
  context.fillStyle = "#00FF00";
  context.fillRect(
    topPaddle.x * scaleX,
    topPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );

  // Draw bottomPaddle
  context.fillStyle = "#FF00FF";
  context.fillRect(
    bottomPaddle.x * scaleX,
    bottomPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );

  // Draw ball
  context.beginPath();
  context.arc(
    Ball.x * scaleX,
    Ball.y * scaleY,
    GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
    0,
    Math.PI * 2
  );
  context.fillStyle = "#00FFD1";
  context.fill();
};