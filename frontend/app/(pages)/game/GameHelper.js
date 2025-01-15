import { scaling } from "./Paddles";
import {leftPaddle, rightPaddle, fil } from "./Draw";
import React, { useEffect } from 'react';



export const GAME_CONSTANTS = {
  ORIGINAL_WIDTH: 800,
  ORIGINAL_HEIGHT: 610,
  PADDLE_HEIGHT: 90,
  PADDLE_WIDTH: 17,
  BALL_RADIUS: 10,
  OFFSET_X: 30,
  MAX_SCORE :2,
};


export const GameAlert = ({ message, isReloader }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 border-l-4 border-red-500">
        <div className="flex items-center mb-4">
          <svg 
            className="w-6 h-6 text-red-500 mr-2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">
            {isReloader ? 'Warning: Game Progress Will Be Lost' : 'Player Left'}
          </h3>
        </div>
        <div className="text-gray-700 mb-4">
          {message}
        </div>
        <div className="text-sm text-gray-600">
          You will be redirected to the Game page in a few seconds...
        </div>
      </div>
    </div>
  );
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


