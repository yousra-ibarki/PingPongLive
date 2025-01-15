import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./Paddles";
// import { fil, leftPaddle, rightPaddle } from "./Draw";
import { rightPaddle, fil, leftPaddle  } from "../Components/GameFunctions";
import { dashedLine } from "./mapNum2";
import { decoratedCircles } from "./mapNum5";

export const mapNum3 = (context, canvas, positionRef) => {
  const { scaleX, scaleY } = scaling(0, 0, canvas);

  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);
  const ballScreen = scaling(
    positionRef.current.x_ball,
    positionRef.current.y_ball,
    canvas
  );

  //Draw rectangle
  context.strokeStyle = "#E3E2E2";
  context.lineWidth = 1;
  context.setLineDash([0, 0]);
  context.beginPath();
  context.rect(20, 30, canvas.width - 40, canvas.height - 60);
  context.stroke();

  //Draw Lines
  dashedLine(
    context,
    canvas.width / 4,
    30,
    canvas.width / 4,
    canvas.height - 30,
    0,
    "#ECF0F1",
    1
  );
  dashedLine(
    context,
    canvas.width - canvas.width / 4,
    30,
    canvas.width - canvas.width / 4,
    canvas.height - 30,
    0,
    "#ECF0F1",
    1
  );

  //Draw circles
  decoratedCircles(context, canvas, scaleX, scaleY, canvas.height / 8 , "#ffffff", 0.5)
  decoratedCircles(context, canvas, scaleX, scaleY, canvas.height / 8 + 5 , "#ffffff", 1)
  decoratedCircles(context, canvas, scaleX, scaleY, canvas.height / 4 , "#ffffff", 0.4)
  decoratedCircles(context, canvas, scaleX, scaleY, canvas.height / 3 , "#ffffff", 0.4)

  const width = GAME_CONSTANTS.PADDLE_WIDTH * scaleX;
  const height = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  // Draw leftPaddle
  context.beginPath();
  context.moveTo(leftPaddleScreen.x + 10, leftPaddleScreen.y)
  context.arcTo(leftPaddleScreen.x + width, leftPaddleScreen.y, leftPaddleScreen.x + width, leftPaddleScreen.y + height, 10)
  context.arcTo(leftPaddleScreen.x + width, leftPaddleScreen.y + height, leftPaddleScreen.x, leftPaddleScreen.y + height, 10)
  context.arcTo(leftPaddleScreen.x, leftPaddleScreen.y + height, leftPaddleScreen.x, leftPaddleScreen.y, 10)
  context.arcTo(leftPaddleScreen.x, leftPaddleScreen.y, leftPaddleScreen.x + width, leftPaddleScreen.y, 10)
  context.closePath();
  context.fillStyle = "#FF6B6B";
  context.fill();
  context.strokeStyle = "#ffffff"
  context.lineWidth = 2;
  context.stroke();


    
  //Draw rightPaddle
  context.beginPath();
  context.moveTo(rightPaddleScreen.x + 10, rightPaddleScreen.y)
  context.arcTo(rightPaddleScreen.x + width, rightPaddleScreen.y, rightPaddleScreen.x + width, rightPaddleScreen.y + height, 10)
  context.arcTo(rightPaddleScreen.x + width, rightPaddleScreen.y + height, rightPaddleScreen.x, rightPaddleScreen.y + height, 10)
  context.arcTo(rightPaddleScreen.x, rightPaddleScreen.y + height, rightPaddleScreen.x, rightPaddleScreen.y, 10)
  context.arcTo(rightPaddleScreen.x, rightPaddleScreen.y, rightPaddleScreen.x + width, rightPaddleScreen.y, 10)
  context.closePath();
  context.fillStyle = "#4ECDC4";
  context.fill();
  context.strokeStyle = "#ffffff"
  context.lineWidth = 2;
  context.stroke();

  // context.fillStyle = "#4ECDC4";
  // context.fillRect(
  //   rightPaddleScreen.x,
  //   rightPaddleScreen.y,
  //   GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
  //   GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  // );

  // Draw fil
  dashedLine(
    context,
    fil.x,
    fil.y - canvas.height / 2,
    fil.x + 1,
    fil.y - canvas.height / 2 + canvas.height,
    10,
    "#E3E2E2",
    2
  );

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
