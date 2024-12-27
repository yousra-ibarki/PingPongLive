import { scaling } from "./Paddles";
import {leftPaddle, rightPaddle, fil } from "./Draw";

export const GAME_CONSTANTS = {
  ORIGINAL_WIDTH: 800,
  ORIGINAL_HEIGHT: 610,
  PADDLE_HEIGHT: 90,
  PADDLE_WIDTH: 17,
  BALL_RADIUS: 10,
  OFFSET_X: 30,
};


export const initialCanvas = (divRef, canvas, positionRef) => {
  const originalWidth = 800; 
  const originalHeight = 610;

  // Set initial canvas size while maintaining aspect ratio
  const container = divRef.current;
  const containerWidth = container.clientWidth * 0.7;
  const containerHeight = window.innerHeight * 0.6;

  const aspectRatio = originalWidth / originalHeight;
  let width = containerWidth;
  let height = width / aspectRatio;

  if (height > containerHeight) {
    height = containerHeight;
    width = height * aspectRatio;
  }

  canvas.width = width;
  canvas.height = height;

  leftPaddle.x = GAME_CONSTANTS.OFFSET_X;
  leftPaddle.y =
    GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;
  rightPaddle.x =
   ( GAME_CONSTANTS.ORIGINAL_WIDTH - 2 * GAME_CONSTANTS.PADDLE_WIDTH) - 10;
  rightPaddle.y =
    GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;

  fil.x = canvas.width / 2;
  fil.y = canvas.height / 2;
  // Initialize the ball position

  positionRef.current.x_ball = GAME_CONSTANTS.ORIGINAL_WIDTH / 2;
  positionRef.current.y_ball = GAME_CONSTANTS.ORIGINAL_HEIGHT / 2;
}


