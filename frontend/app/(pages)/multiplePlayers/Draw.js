import { defaultMap } from "./DefaultMap";
import { mapNum2 } from "./mapNum2";
import { mapNum3 } from "./mapNum3";
import { mapNum4 } from "./mapNum4";
import { mapNum5 } from "./mapNum5";
import { mapNum6 } from "./mapNum6";


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
  // console.log("hahahahahahahaha ", mapNum);

  switch (mapNum) {
    case "2":
      mapNum2(context, canvas);
      break;
    case "3":
      mapNum3(context, canvas);
      break;
    case "4":
      mapNum4(context, canvas);
      break;
    case "5":
      mapNum5(context, canvas);
      break;
    case "6":
      mapNum6(context, canvas);
      break;
    default:
      defaultMap(context, canvas);
  }
};
