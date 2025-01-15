"use client"
import { leftPaddle, rightPaddle, fil, Ball } from "../Components/GameFunctions";

export const GAME_CONSTANTS = {
  ORIGINAL_WIDTH: 800,
  ORIGINAL_HEIGHT: 610,
  PADDLE_HEIGHT: 90,
  PADDLE_WIDTH: 17,
  MIN_PADDLE_WIDTH: 12,
  BALL_RADIUS: 10,
  OFFSET_X: 30,
  MAX_SCORE: 5,
  INITIAL_BALL_SPEED: 4,
  MAX_BALL_SPEED: 10,
  MIN_BALL_SPEED: 5,
  SPEED_FACTOR: 1.08,
  PADDLE_IMPACT: 0.2,

};

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


export const initialCanvas = (divRef, canvas) => {
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
    GAME_CONSTANTS.ORIGINAL_WIDTH - 2 * GAME_CONSTANTS.PADDLE_WIDTH - 10;
  rightPaddle.y =
    GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;

  fil.x = GAME_CONSTANTS.ORIGINAL_WIDTH / 2;
  fil.y = GAME_CONSTANTS.ORIGINAL_HEIGHT / 2;
  // Initialize the ball position
  Ball.x = GAME_CONSTANTS.ORIGINAL_WIDTH / 2;
  Ball.y = GAME_CONSTANTS.ORIGINAL_HEIGHT / 2;
  Ball.radius = GAME_CONSTANTS.BALL_RADIUS;
  Ball.vx = GAME_CONSTANTS.INITIAL_BALL_SPEED; // Initial velocity
  Ball.vy = (Math.random() * 4 + 1) * (Math.random() < 0.5 ? -1 : 1);
  // Ball.vy = (Math.random() * 4 - 2);  // Random initial vertical direction
  leftPaddle.width = GAME_CONSTANTS.PADDLE_WIDTH;
  leftPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT;
  rightPaddle.width = GAME_CONSTANTS.PADDLE_WIDTH;
  rightPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT;

};
