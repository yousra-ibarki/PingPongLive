import { drawFourPlayerMap } from "./DefaultMap";

<<<<<<< HEAD
=======
// ... other imports

>>>>>>> b60d79c1a45bf17cd9e66cdb7edc0c0eb3f6100d
export const Ball = {
  x: 0,
  y: 0,
  radius: 0,
  vx: 0,
  vy: 0,
};

export const leftPaddle = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  dy: 0,
};

export const rightPaddle = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  dy: 0,
};

// New paddles for top and bottom
export const topPaddle = {
  x: 0,
  y: 0,
  width: 0,  // This will be longer than height for horizontal paddles
  height: 0,
  dx: 0,     // Horizontal movement
};

export const bottomPaddle = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  dx: 0,
};

export const fil = {
  x: 0,
  y: 0,
};

export const draw = (contextRef, canvasRef, mapNum) => {
  const context = contextRef.current;
  const canvas = canvasRef.current;
  if (!context || !canvas) return;

  context.clearRect(0, 0, canvas.width, canvas.height);

  switch (mapNum) {
    case "4players":
      drawFourPlayerMap(context, canvas);
      break;
    // ... other cases
    default:
      defaultMap(context, canvas);
  }
};