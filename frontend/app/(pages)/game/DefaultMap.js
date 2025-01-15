import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./Paddles";
// import { fil, leftPaddle, rightPaddle } from "./Draw";
import { rightPaddle, fil, leftPaddle  } from "../Components/GameFunctions";


export const defaultMap = (context, canvas, positionRef) => {
  const { scaleX, scaleY } = scaling(0, 0, canvas);

  const leftPaddleScreen = scaling(leftPaddle.x, leftPaddle.y, canvas);
  const rightPaddleScreen = scaling(rightPaddle.x, rightPaddle.y, canvas);
  const ballScreen = scaling(
    positionRef.current.x_ball,
    positionRef.current.y_ball,
    canvas
  );

  // Draw leftPaddle
  context.fillStyle = "#EEEEEE";
  context.fillRect(
    leftPaddleScreen.x,
    leftPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  //Draw rightPaddle
  context.fillStyle = "#FFD369";
  context.fillRect(
    rightPaddleScreen.x,
    rightPaddleScreen.y,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  // Draw fil
  context.fillStyle = "#000000";
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
  context.fillStyle = "#00FFD1";
  context.fill();
};
