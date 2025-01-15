import { GAME_CONSTANTS, scaling } from "./MultiPlayerHelper";
import { leftPaddle, rightPaddle,topPaddle, bottomPaddle, fil, Ball } from "../Components/GameFunctions";
import { dashedLine } from "./mapNum2";
import { drawCorners } from "./DefaultMap";

export const mapNum6 = (context, canvas) => {

    const { scaleX, scaleY } = scaling(0, 0, canvas);

  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);



  context.strokeStyle = "#ECF0F1"
  context.lineWidth = 1
  context.beginPath();
  context.rect(20, 30, canvas.width - 40, canvas.height - 60)
  context.stroke()

  dashedLine(context, canvas.width / 4, 30, canvas.width / 4, canvas.height - 30, 0, "#ECF0F1", 1)
  dashedLine(context, canvas.width - canvas.width / 4, 30, canvas.width - canvas.width / 4, canvas.height - 30, 0, "#ECF0F1", 1)

  // Draw leftPaddle
  context.fillStyle = "#E74C3C";
  context.fillRect(
    leftPaddleScreen.x,
    leftPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  //Draw rightPaddle
  context.fillStyle = "#27AE60";
  context.fillRect(
    rightPaddleScreen.x,
    rightPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

    
  //Draw topPaddle
  context.fillStyle = "#F1C40F";
  context.fillRect(
    topPaddle.x * scaleX,
    topPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );
 

  // Draw bottomPaddle
  context.fillStyle = "#1ABC9C";
  context.fillRect(
    bottomPaddle.x * scaleX,
    bottomPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );

  // Draw fil
  // context.fillStyle = "#ECF0F1";
  // context.fillRect(fil.x * scaleX, 0, 2, canvas.height);

  // Draw ball
  context.beginPath();
  context.arc(
    Ball.x * scaleX,
    Ball.y * scaleY,
    GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
    0,
    Math.PI * 2
  );
  context.fillStyle = "#ECF0F1";
  context.fill();
  drawCorners(context, canvas);

}