// gameUtils.js
export const GAME_CONSTANTS = {
    ORIGINAL_WIDTH: 800,
    ORIGINAL_HEIGHT: 610,
    PADDLE_HEIGHT: 130,
    PADDLE_WIDTH: 20,
    BALL_RADIUS: 13
  };
  
  export const scaling = (gameX, gameY, canvas) => { //front
    const scaleX = canvas.width / GAME_CONSTANTS.ORIGINAL_WIDTH;
    const scaleY = canvas.height / GAME_CONSTANTS.ORIGINAL_HEIGHT;
    
    return {
      x: gameX * scaleX,
      y: gameY * scaleY,
      scaleX,
      scaleY
    };
  };
  
  export const unscaling = (screenX, screenY, canvas) => { //backend
    const scaleX = canvas.width / GAME_CONSTANTS.ORIGINAL_WIDTH;
    const scaleY = canvas.height / GAME_CONSTANTS.ORIGINAL_HEIGHT;
    
    return {
      x: screenX / scaleX,
      y: screenY / scaleY
    };
  };