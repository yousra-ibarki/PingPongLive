import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./Paddles";
import { defaultMap } from "./DefaultMap";
import { mapNum2 } from "./mapNum2"
import { mapNum3 } from "./mapNum3"
import { mapNum4 } from "./mapNum4"
import { mapNum5 } from "./mapNum5"
import { mapNum6 } from "./mapNum6"



export const Ball = {
  x: window.innerWidth * 0.35, // initial position
  y: window.innerHeight * 0.3,
  radius: 17,
  vx: 5, // velocity x
  vy: 3, // velocity y
};

export const leftPaddle = {
  x: 0,
  y: 0,
  width: 20,
  height: 130,
  dy: 0,
};

export const rightPaddle = {
  x: 0,
  y: 0,
  width: 20,
  height: 130,
  dy: 0,
};

export const fil = {
  x: 0,
  y: 0,
};
// export const Ball = {
//   x: window.innerWidth * 0.35, // initial position
//   y: window.innerHeight * 0.3,
//   radius: 17,
//   vx: 5, // velocity x
//   vy: 3, // velocity y
// };

// export const leftPaddle = {
//   x: 10,
//   y: window.innerHeight * 0.3 - 39,
//   width: 20,
//   height: 130,
//   dy: 0,
// };

// export const rightPaddle = {
//   x: window.innerWidth * 0.7 - 30,
//     y: window.innerHeight * 0.3 - 39,
//     width: 20,
//     height: 110,
//     dy: 0,
// };

// export const fil = {
//   x: (window.innerWidth* 0.7) / 2,
//   y: (window.innerHeight *0.3) ,
// };





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
