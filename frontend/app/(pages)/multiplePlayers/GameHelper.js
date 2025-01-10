import { leftPaddle, rightPaddle,topPaddle, bottomPaddle, fil, Ball } from "./Draw";
import React, { useEffect } from "react";

export const GAME_CONSTANTS = {
  // Making the game board square
  ORIGINAL_WIDTH: 800,
  ORIGINAL_HEIGHT: 800,  // Changed to be square
  
  // Vertical paddle dimensions (left and right)
  PADDLE_HEIGHT: 90,
  PADDLE_WIDTH: 17,
  
  // Horizontal paddle dimensions (top and bottom)
  HORIZONTAL_PADDLE_WIDTH: 90,  // Same as vertical paddle height
<<<<<<< HEAD

  // Movement restrictions (70% playable area)
  VERTICAL_PLAYABLE_START: 120, // 15% of 800
  VERTICAL_PLAYABLE_END: 680,   // 85% of 800
  HORIZONTAL_PLAYABLE_START: 120, // 15% of 800
  HORIZONTAL_PLAYABLE_END: 680,   // 85% of 800
  
  MIN_PADDLE_WIDTH: 12,
  BALL_RADIUS: 10,
  OFFSET_X: 0,
  OFFSET_Y: 0,  // Added for top/bottom padding
=======
  
  MIN_PADDLE_WIDTH: 12,
  BALL_RADIUS: 10,
  OFFSET_X: 30,
  OFFSET_Y: 30,  // Added for top/bottom padding
>>>>>>> b60d79c1a45bf17cd9e66cdb7edc0c0eb3f6100d
  MAX_SCORE: 50,
  INITIAL_BALL_SPEED: 4,
  MAX_BALL_SPEED: 10,
  MIN_BALL_SPEED: 5,
  SPEED_FACTOR: 1.08,
  PADDLE_IMPACT: 0.2,
<<<<<<< HEAD
  WALL_WIDTH: 14,
=======
>>>>>>> b60d79c1a45bf17cd9e66cdb7edc0c0eb3f6100d
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
  // Make canvas square
  const container = divRef.current;
  const containerSize = Math.min(container.clientWidth * 0.7, window.innerHeight * 0.7);
  
  canvas.width = containerSize;
  canvas.height = containerSize;

<<<<<<< HEAD
  // Initialize vertical paddles (left and right) within restricted area
  leftPaddle.x = GAME_CONSTANTS.OFFSET_X;
  leftPaddle.y = GAME_CONSTANTS.VERTICAL_PLAYABLE_START + 
                 (GAME_CONSTANTS.VERTICAL_PLAYABLE_END - GAME_CONSTANTS.VERTICAL_PLAYABLE_START - GAME_CONSTANTS.PADDLE_HEIGHT) / 2;
=======
  // Initialize vertical paddles (left and right)
  leftPaddle.x = GAME_CONSTANTS.OFFSET_X;
  leftPaddle.y = GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;
>>>>>>> b60d79c1a45bf17cd9e66cdb7edc0c0eb3f6100d
  leftPaddle.width = GAME_CONSTANTS.PADDLE_WIDTH;
  leftPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT;

  rightPaddle.x = GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH - GAME_CONSTANTS.OFFSET_X;
<<<<<<< HEAD
  rightPaddle.y = GAME_CONSTANTS.VERTICAL_PLAYABLE_START + 
                  (GAME_CONSTANTS.VERTICAL_PLAYABLE_END - GAME_CONSTANTS.VERTICAL_PLAYABLE_START - GAME_CONSTANTS.PADDLE_HEIGHT) / 2;
  rightPaddle.width = GAME_CONSTANTS.PADDLE_WIDTH;
  rightPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT;

  // Initialize horizontal paddles (top and bottom) within restricted area
  topPaddle.x = GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START + 
                (GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END - GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START - GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH) / 2;
=======
  rightPaddle.y = GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;
  rightPaddle.width = GAME_CONSTANTS.PADDLE_WIDTH;
  rightPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT;

  // Initialize horizontal paddles (top and bottom)
  topPaddle.x = GAME_CONSTANTS.ORIGINAL_WIDTH / 2 - GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH / 2;
>>>>>>> b60d79c1a45bf17cd9e66cdb7edc0c0eb3f6100d
  topPaddle.y = GAME_CONSTANTS.OFFSET_Y;
  topPaddle.width = GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH;
  topPaddle.height = GAME_CONSTANTS.PADDLE_WIDTH;

<<<<<<< HEAD
  bottomPaddle.x = GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START + 
                   (GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END - GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START - GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH) / 2;
=======
  bottomPaddle.x = GAME_CONSTANTS.ORIGINAL_WIDTH / 2 - GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH / 2;
>>>>>>> b60d79c1a45bf17cd9e66cdb7edc0c0eb3f6100d
  bottomPaddle.y = GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_WIDTH - GAME_CONSTANTS.OFFSET_Y;
  bottomPaddle.width = GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH;
  bottomPaddle.height = GAME_CONSTANTS.PADDLE_WIDTH;

  // Initialize ball in center
  Ball.x = GAME_CONSTANTS.ORIGINAL_WIDTH / 2;
  Ball.y = GAME_CONSTANTS.ORIGINAL_HEIGHT / 2;
  Ball.radius = GAME_CONSTANTS.BALL_RADIUS;
  Ball.vx = GAME_CONSTANTS.INITIAL_BALL_SPEED;
  Ball.vy = (Math.random() * 4 + 1) * (Math.random() < 0.5 ? -1 : 1);
};