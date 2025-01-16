import { rightPaddle, fil, leftPaddle  } from "../Components/GameFunctions";
import { GAME_CONSTANTS } from "./GameHelper";
import { dashedLine } from "./mapNum2";
import { scaling } from "./Paddles";

export const mapNum4 = (context, canvas, positionRef) => {
  const { scaleX, scaleY } = scaling(0, 0, canvas);

  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);
  const ballScreen = scaling(
    positionRef.current.x_ball,
    positionRef.current.y_ball,
    canvas
  );

  context.strokeStyle = "#ffffff";
  context.lineWidth = 1;
  context.beginPath();
  context.rect(20, 30, canvas.width - 40, canvas.height - 60);
  context.stroke();

  dashedLine(
    context,
    canvas.width / 4,
    30,
    canvas.width / 4,
    canvas.height - 30,
    0,
    "#ffffff", 1
  );
  dashedLine(
    context,
    canvas.width - canvas.width / 4,
    30,
    canvas.width - canvas.width / 4,
    canvas.height - 30,
    0,
    "#ffffff", 1
  );

  // Draw leftPaddle
  context.fillStyle = "#BF9CFF";
  context.fillRect(
    leftPaddleScreen.x,
    leftPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  //Draw rightPaddle
  context.fillStyle = "#BF9CFF";
  context.fillRect(
    rightPaddleScreen.x,
    rightPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  // Draw fil
  dashedLine(context, canvas.width/2, 30, canvas.width/2, canvas.height - 30, 0, "#ffffff", 2)

  // Draw ball
  context.beginPath();
  context.arc(
    ballScreen.x,
    ballScreen.y,
    GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
    0,
    Math.PI * 2
  );
  context.fillStyle = "#ffffff";
  context.fill();
};
