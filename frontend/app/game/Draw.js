import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./Paddles";
import { defaultMap } from "./DefaultMap";
import { mapNum2 } from "./mapNum2"

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
  console.log("hahahahahahahaha ", mapNum);
  // const { scaleX, scaleY } = scaling(0, 0, canvas);

  // const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  // const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);
  // const ballScreen = scaling(
  //   positionRef.current.x_ball,
  //   positionRef.current.y_ball,
  //   canvas
  // );


  switch (mapNum) {
    case "2":
      mapNum2(context, canvas, positionRef);
      break;
    case "3":
      mapNum3();
      break;
    case "4":
      mapNum4();
      break;
    case "5":
      mapNum5();
      break;
    case "6":
      mapNum6();
      break;
    default:
      defaultMap(context, canvas, positionRef);
  }
};
