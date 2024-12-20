import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./Paddles";

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


const mapNum2 = () => {

}

export const draw = (contextRef, canvasRef, positionRef, mapNum) => {
  const context = contextRef.current;
  const canvas = canvasRef.current;
  if (!context || !canvas) return;
  var leftPaddleColor;
  var rightPaddleColor;
  var filColor;
  var ballColor;
  context.clearRect(0, 0, canvas.width, canvas.height);
console.log("hahahahahahahaha ", mapNum)
  const { scaleX, scaleY } = scaling(0, 0, canvas);

  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);
  const ballScreen = scaling(
    positionRef.current.x_ball,
    positionRef.current.y_ball,
    canvas
  );

  switch (mapNum) {
    case "2":
      leftPaddleColor = "#8C2022";
      rightPaddleColor = "#2C3E50";
      filColor = "#444444";
      ballColor = "#666666";
      mapNum2();
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
      leftPaddleColor = "#EEEEEE";
      rightPaddleColor = "#FFD369";
      filColor = "#000000";
      ballColor = "#00FFD1";
  }

  // Draw leftPaddle
  context.fillStyle = leftPaddleColor;
  context.fillRect(
    leftPaddleScreen.x,
    leftPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  //Draw rightPaddle
  context.fillStyle = rightPaddleColor;
  context.fillRect(
    rightPaddleScreen.x,
    rightPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );
  

  //Draw fil
  context.fillStyle = filColor;
  context.fillRect(fil.x, fil.y - canvas.height / 2, 1, canvas.height);

  // Draw ball
  context.beginPath();
  context.arc(
    ballScreen.x,
    ballScreen.y,
    GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
    0,
    Math.PI * 2
  );
  context.fillStyle = ballColor;
  context.fill();
};
