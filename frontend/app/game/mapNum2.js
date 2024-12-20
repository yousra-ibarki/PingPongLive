import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./Paddles";
import { fil, leftPaddle, rightPaddle } from "./Draw";

export const dashedLine = (context, canvas, color) => {
  context.beginPath();
  context.setLineDash([10, 10]);
  context.moveTo(fil.x, fil.y - canvas.height / 2);
  context.lineTo(fil.x + 1, fil.y - canvas.height / 2 + canvas.height);
  context.lineWidth = 2;
  context.strokeStyle = color;
  context.stroke();
};


export const mapNum2 = (context, canvas, positionRef) => {
  const { scaleX, scaleY } = scaling(0, 0, canvas);

  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);
  const ballScreen = scaling(
    positionRef.current.x_ball,
    positionRef.current.y_ball,
    canvas
  );

  //Draw two TOP/BUTTOM fils
  // solidLine(context, canvas, "#444444")
  context.fillStyle = "#444444";

  context.fillRect(0, 10, canvas.width, 1);
  context.fillRect(0, canvas.height - 10, canvas.width, 1);

  //Draw rectangle in the background
  context.fillStyle = "rgba(0, 0, 0, 0)"
  context.strokeStyle = "#444444"
  context.fillRect(20, 30, canvas.width - 40, canvas.height - 60)
  context.stroke()

  // Draw leftPaddle
  context.fillStyle = "#8C2022";
  context.fillRect(
    leftPaddleScreen.x,
    leftPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  //Draw rightPaddle
  context.fillStyle = "#2C3E50";
  context.fillRect(
    rightPaddleScreen.x,
    rightPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  // Draw fil
  dashedLine(context, canvas, "#444444");
  //   context.beginPath();
  //   context.setLineDash([10, 10]);
  //   context.moveTo(fil.x, fil.y - canvas.height / 2);
  //   context.lineTo(fil.x + 1, fil.y - canvas.height / 2 + canvas.height);
  //   context.lineWidth = 2;
  //   context.strokeStyle = "#444444"; // Line color
  //   context.stroke();

  // Draw ball
  context.beginPath();
  context.arc(
    ballScreen.x,
    ballScreen.y,
    GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
    0,
    Math.PI * 2
  );
  context.fillStyle = "#666666";
  context.fill();
};
