"use client";
import { GAME_CONSTANTS, scaling } from "./MultiPlayerHelper";
// import { leftPaddle, rightPaddle, topPaddle, bottomPaddle, Ball } from "./Draw";
import { leftPaddle, rightPaddle, topPaddle, bottomPaddle, Ball } from "../Components/GameFunctions";
export const drawCorners = (context, canvas) => {
  //  Draw black corners
  const cornerSize = 70; // Adjust size as needed
  context.fillStyle = '#222831';
  // Top-left corner
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(cornerSize, 0);
  context.lineTo(0, cornerSize);
  context.fill();
  // Top-right corner
  context.beginPath();
  context.moveTo(canvas.width, 0);
  context.lineTo(canvas.width - cornerSize, 0);
  context.lineTo(canvas.width, cornerSize);
  context.fill();
  // Bottom-left corner
  context.beginPath();
  context.moveTo(0, canvas.height);
  context.lineTo(cornerSize, canvas.height);
  context.lineTo(0, canvas.height - cornerSize);
  context.fill();
  // Bottom-right corner
  context.beginPath();
  context.moveTo(canvas.width, canvas.height);
  context.lineTo(canvas.width - cornerSize, canvas.height);
  context.lineTo(canvas.width, canvas.height - cornerSize);
  context.fill();
};

export const defaultMap = (context, canvas) => {
  const { scaleX, scaleY } = scaling(0, 0, canvas);

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
  context.fillStyle = "#FF9F45";
  context.fillRect(
    topPaddle.x * scaleX,
    topPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );

  // Draw bottomPaddle
  context.fillStyle = "#A3C9B7";
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

  drawCorners(context, canvas);
};
