import { GAME_CONSTANTS, scaling } from "./OfflineGameHelper";
import { leftPaddle, rightPaddle, fil, Ball } from "../Components/GameFunctions";
import { dashedLine } from "./mapNum2";

export const mapNum4 = (context, canvas) => {
  const { scaleX, scaleY } = scaling(0, 0, canvas);

  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);


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
  context.fillStyle = "#ffffff";
  context.fillRect(fil.x * scaleX, 0, 2 * scaleX, canvas.height);
  // dashedLine(context, canvas.width/2, 30, canvas.width/2, canvas.height - 30, 0, "#ffffff", 2)
  // context.fillStyle = "#ffffff";
  // context.fillRect(fil.x, fil.y - canvas.height / 2, 1, canvas.height);
  // context.lineWidth = 2;

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
};
