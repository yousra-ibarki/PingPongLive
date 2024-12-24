import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./Paddles";
import { defaultMap } from "./DefaultMap";
import { mapNum2 } from "./mapNum2"
import { mapNum3 } from "./mapNum3"
import { mapNum4 } from "./mapNum4"
import { mapNum5 } from "./mapNum5"
import { mapNum6 } from "./mapNum6"

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




export const draw = (contextRef, canvasRef, positionRef, mapNum) => {
  const context = contextRef.current;
  const canvas = canvasRef.current;
  if (!context || !canvas) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  // console.log("hahahahahahahaha ", mapNum);

  switch (mapNum) {
    case "2":
      mapNum2(context, canvas, positionRef);
      break;
    case "3":
      mapNum3(context, canvas, positionRef);
      break;
    case "4":
      mapNum4(context, canvas, positionRef);
      break;
    case "5":
      mapNum5(context, canvas, positionRef);
      break;
    case "6":
      mapNum6(context, canvas, positionRef);
      break;
    default:
      defaultMap(context, canvas, positionRef);
  }
};
