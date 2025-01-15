import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./Paddles";
// import { fil, leftPaddle, rightPaddle } from "./Draw";
import { rightPaddle, fil, leftPaddle  } from "../Components/GameFunctions";

export const dashedLine = (context, x1, y1, x2, y2, dash, color, lineWidth) => {
  context.beginPath();
  context.setLineDash([dash, dash]);
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineWidth = lineWidth;
  context.strokeStyle = color;
  context.stroke();
};

const circle = (context, scaleX, scaleY, x, y) => {
//Draw circles in the corners
context.beginPath();
context.arc(x, y, GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY), 0, Math.PI * 2)
context.fillStyle = "#444444"
context.fill()

}

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
  // context.fillStyle = "rgba(0, 0, 0, 0)"
  context.strokeStyle = "#444444"
  context.lineWidth = 2
  context.beginPath();
  context.setLineDash([0,0])
  context.rect(20, 30, canvas.width - 40, canvas.height - 60)
  context.stroke()

  //Draw the 4 circles
  circle(context, scaleX, scaleY, 20, 30);
  circle(context, scaleX, scaleY, canvas.width - 20, 30)
  circle(context, scaleX, scaleY, 20, canvas.height - 30);
  circle(context, scaleX, scaleY, canvas.width - 20, canvas.height - 30);

  //Draw the two lines
  dashedLine(context, canvas.width / 4, 30, canvas.width / 4, canvas.height - 30, 0, "#444444", 2)
  dashedLine(context, canvas.width - canvas.width / 4, 30, canvas.width - canvas.width / 4, canvas.height - 30, 0, "#444444", 2)

  // Draw leftPaddle
  context.fillStyle = "#8C2022";
  context.fillRect(
    leftPaddleScreen.x,
    leftPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );
  context.strokeStyle = "#333333"
  context.lineWidth = 2;
  context.strokeRect(
    leftPaddleScreen.x,
    leftPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  )

  //Draw rightPaddle
  context.fillStyle = "#2C3E50";
  context.fillRect(
    rightPaddleScreen.x,
    rightPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );
  context.strokeStyle = "#33333";
  context.lineWidth = 2;
  context.strokeRect(
    rightPaddleScreen.x,
    rightPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  )

  dashedLine(context, fil.x, fil.y - canvas.height / 2, fil.x + 1, fil.y - canvas.height / 2 + canvas.height, 10, "#444444", 2);
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
