import { GAME_CONSTANTS, scaling } from "./MultiPlayerHelper";
import { leftPaddle, rightPaddle,topPaddle, bottomPaddle, fil, Ball } from "../Components/GameFunctions";
import { dashedLine } from "./mapNum2";
import { drawCorners } from "./DefaultMap";

const DIAMOND_CONST = {
  diamond_width: 70,
  diamond_height: 120,
};

export const decoratedCircles = (
  context,
  canvas,
  scaleX,
  scaleY,
  radius,
  color,
  lineWidth
) => {
  context.beginPath();
  context.arc(
    canvas.width / 2,
    canvas.height / 2,
    radius * Math.min(scaleX, scaleY),
    0,
    Math.PI * 2
  );
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.stroke();
};

export const mapNum5 = (context, canvas) => {
  const { scaleX, scaleY } = scaling(0, 0, canvas);

  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);

  context.strokeStyle = "#E3E2E2";
  context.lineWidth = 1;
  context.setLineDash([0, 0]);
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
    "#FFD700",
    1
  );
  dashedLine(
    context,
    canvas.width - canvas.width / 4,
    30,
    canvas.width - canvas.width / 4,
    canvas.height - 30,
    0,
    "#FFD700",
    1
  );

  //Draw diamond around the ball
  context.beginPath();
  context.moveTo(
    canvas.width / 2,
    canvas.height / 2 - DIAMOND_CONST.diamond_height / 2
  );

  context.lineTo(
    canvas.width / 2 + DIAMOND_CONST.diamond_width / 2,
    canvas.height / 2
  );
  context.lineTo(
    canvas.width / 2,
    canvas.height / 2 + DIAMOND_CONST.diamond_height / 2
  );
  context.lineTo(
    canvas.width / 2 - DIAMOND_CONST.diamond_width / 2,
    canvas.height / 2
  );
  context.closePath();
  context.strokeStyle = "#FFD700";
  context.lineWidth = 0.5 * scaleX;
  context.stroke();

  //Draw the first circle (smaller)
  decoratedCircles(context, canvas, scaleX, scaleY, 40, "#E3E2E2", 1);
  decoratedCircles(context, canvas, scaleX, scaleY, 70, "#FFD700", 1);
  decoratedCircles(
    context,
    canvas,
    scaleX,
    scaleY,
    canvas.height / 3,
    "#E3E2E2",
    1
  );
  decoratedCircles(
    context,
    canvas,
    scaleX,
    scaleY,
    canvas.height / 2 - 20,
    "#E3E2E2",
    1
  );


  // Draw leftPaddle
  context.fillStyle = "#FFD700";
  context.fillRect(
    leftPaddleScreen.x,
    leftPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  //Draw rightPaddle
  context.fillStyle = "#00FF9D";
  context.fillRect(
    rightPaddleScreen.x,
    rightPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );


  
  //Draw topPaddle
  context.fillStyle = "#7FFFD4";
  context.fillRect(
    topPaddle.x * scaleX,
    topPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );
 

  // Draw bottomPaddle
  context.fillStyle = "#FF8C00";
  context.fillRect(
    bottomPaddle.x * scaleX,
    bottomPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );


 


  // Draw fil
  // dashedLine(
  //   context,
  //   fil.x * scaleX,
  //   0,
  //   fil.x * scaleX,
  //   fil.y - canvas.height / 2 + canvas.height * scaleY,
  //   10,
  //   "#E3E2E2",
  //   2
  // );

  // Draw ball
  context.beginPath();
  context.arc(
    Ball.x * scaleX,
    Ball.y * scaleY,
    GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
    0,
    Math.PI * 2
  );
  context.fillStyle = "#FFD700";
  context.fill();
  drawCorners(context, canvas);

};