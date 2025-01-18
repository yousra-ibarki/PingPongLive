import { leftPaddle, rightPaddle,topPaddle, bottomPaddle, fil, Ball } from "../Components/GameFunctions";
import { GAME_CONSTANTS, scaling } from "./multiPlayerHelper";
import { decoratedCircles } from "./mapNum5";
import { drawCorners } from "./DefaultMap";
import { dashedLine } from "./mapNum2";

export const mapNum3 = (context, canvas) => {
  const { scaleX, scaleY } = scaling(0, 0, canvas);

  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);
  const topPaddleScreen = scaling(topPaddle.x, topPaddle.y, canvas)
  const bottomPaddleScreen = scaling(bottomPaddle.x, bottomPaddle.y, canvas)

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
  decoratedCircles(
    context,
    canvas,
    scaleX,
    scaleY,
    canvas.height / 8,
    "#ffffff",
    0.5
  );
  decoratedCircles(
    context,
    canvas,
    scaleX,
    scaleY,
    canvas.height / 8 + 5,
    "#ffffff",
    1
  );
  decoratedCircles(
    context,
    canvas,
    scaleX,
    scaleY,
    canvas.height / 4,
    "#ffffff",
    0.4
  );
  decoratedCircles(
    context,
    canvas,
    scaleX,
    scaleY,
    canvas.height / 3,
    "#ffffff",
    0.4
  );

  const width = GAME_CONSTANTS.PADDLE_WIDTH * scaleX;
  const height = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY;
  // Draw leftPaddle
  context.beginPath();


  context.fillStyle = "#FF6B6B";
  context.fillRect(
    leftPaddleScreen.x,
    leftPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );
  context.strokeStyle = "#ffffff"
  context.lineWidth = 2;
  context.strokeRect(
    leftPaddleScreen.x,
    leftPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  )


 //Draw rightPaddle
 context.fillStyle = "#4ECDC4";
 context.fillRect(
   rightPaddleScreen.x,
   rightPaddleScreen.y,
   GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
   GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
 );
 context.strokeStyle = "#ffffff";
 context.lineWidth = 2;
 context.strokeRect(
   rightPaddleScreen.x,
   rightPaddleScreen.y,
   GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
   GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
 )

  // Draw topPaddle
  context.fillStyle = "#A8E6CF";
  context.fillRect(
    topPaddle.x * scaleX,
    topPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );
  context.strokeStyle = "#ffffff";
  context.lineWidth = 2;
  context.strokeRect(
    topPaddleScreen.x,
    topPaddleScreen.y,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  )

  // Draw bottomPaddle
  context.fillStyle = "#FF9F80";
  context.fillRect(
    bottomPaddle.x * scaleX,
    bottomPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );
  context.strokeRect(
    bottomPaddleScreen.x,
    bottomPaddleScreen.y,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  )

  // Draw ball
  context.beginPath();
  context.arc(
    Ball.x * scaleX,
    Ball.y * scaleY,
    GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
    0,
    Math.PI * 2
  );
  context.fillStyle = "#ffffff";
  context.fill();

  drawCorners(context, canvas);

};
