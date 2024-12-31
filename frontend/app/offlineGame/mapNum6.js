import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./Paddles";
import { fil, leftPaddle, rightPaddle } from "./Draw";
import { dashedLine } from "./mapNum2";

export const mapNum6 = (context, canvas, positionRef) => {

    const { scaleX, scaleY } = scaling(0, 0, canvas);

  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);
  const ballScreen = scaling(
    positionRef.current.x_ball,
    positionRef.current.y_ball,
    canvas
  );


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

  // Draw fil
  context.fillStyle = "#ECF0F1";
  context.fillRect(fil.x, fil.y - canvas.height / 2, 2, canvas.height);

  // Draw ball
  context.beginPath();
  context.arc(
    ballScreen.x,
    ballScreen.y,
    GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
    0,
    Math.PI * 2
  );
  context.fillStyle = "#ECF0F1";
  context.fill();
}