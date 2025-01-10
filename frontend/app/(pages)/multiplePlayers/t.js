import { GAME_CONSTANTS } from "./GameHelper";
import { scaling } from "./GameHelper";
import { leftPaddle, rightPaddle, topPaddle, bottomPaddle, Ball } from "./Draw";

export const drawFourPlayerMap = (context, canvas) => {
  const { scaleX, scaleY } = scaling(0, 0, canvas);

  // Draw walls first
  context.fillStyle = "#333333";  // Dark color for walls

  // Left side walls (top and bottom sections)
  // Top left wall
  context.fillRect(
    0,
    0,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.VERTICAL_PLAYABLE_START * scaleY
  );
  // Bottom left wall
  context.fillRect(
    0,
    GAME_CONSTANTS.VERTICAL_PLAYABLE_END * scaleY,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    (GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.VERTICAL_PLAYABLE_END) * scaleY
  );

  // Right side walls (top and bottom sections)
  // Top right wall
  context.fillRect(
    (GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH) * scaleX,
    0,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.VERTICAL_PLAYABLE_START * scaleY
  );
  // Bottom right wall
  context.fillRect(
    (GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.PADDLE_WIDTH) * scaleX,
    GAME_CONSTANTS.VERTICAL_PLAYABLE_END * scaleY,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    (GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.VERTICAL_PLAYABLE_END) * scaleY
  );

  // Top side walls (left and right sections)
  // Left top wall
  context.fillRect(
    0,
    0,
    GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );
  // Right top wall
  context.fillRect(
    GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END * scaleX,
    0,
    (GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END) * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );

  // Bottom side walls (left and right sections)
  // Left bottom wall
  context.fillRect(
    0,
    (GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_WIDTH) * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PLAYABLE_START * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );
  // Right bottom wall
  context.fillRect(
    GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END * scaleX,
    (GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_WIDTH) * scaleY,
    (GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.HORIZONTAL_PLAYABLE_END) * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );

  // Draw leftPaddle
  context.fillStyle = "#EEEEEE";
  context.fillRect(
    leftPaddle.x * scaleX,
    leftPaddle.y * scaleY,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  // Draw rightPaddle
  context.fillStyle = "#FFD369";
  context.fillRect(
    rightPaddle.x * scaleX,
    rightPaddle.y * scaleY,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_HEIGHT * scaleY
  );

  // Draw topPaddle
  context.fillStyle = "#00FF00";
  context.fillRect(
    topPaddle.x * scaleX,
    topPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );

  // Draw bottomPaddle
  context.fillStyle = "#FF00FF";
  context.fillRect(
    bottomPaddle.x * scaleX,
    bottomPaddle.y * scaleY,
    GAME_CONSTANTS.HORIZONTAL_PADDLE_WIDTH * scaleX,
    GAME_CONSTANTS.PADDLE_WIDTH * scaleY
  );

  // Draw ball
  context.beginPath();
  context.arc(
    Ball.x * scaleX,
    Ball.y * scaleY,
    GAME_CONSTANTS.BALL_RADIUS * Math.min(scaleX, scaleY),
    0,
    Math.PI * 2
  );
  context.fillStyle = "#00FFD1";
  context.fill();
};

if (checkCollision(Ball, topPaddle, true)) {
    // Clear any existing timeout to prevent double scoring
    if (scoreTimeoutRef.current) {
      clearTimeout(scoreTimeoutRef.current);
    }
  
    // Update last player
    lastPlayerRef.current = 'playerTop';
  
    const hitLocation = (Ball.x - topPaddle.x) / GAME_CONSTANTS.PADDLE_WIDTH;
  
    // Calculate new vertical speed with better control
    let newSpeed = Math.abs(Ball.vy) * GAME_CONSTANTS.SPEED_FACTOR;
    newSpeed = Math.min(newSpeed, GAME_CONSTANTS.MAX_BALL_SPEED);
    newSpeed = Math.max(newSpeed, GAME_CONSTANTS.MIN_BALL_SPEED);
  
    // More controlled angle calculation
    const angle = (hitLocation - 0.5) * Math.PI / 3; // Reduced angle range
    
    // Update velocities with better control
    Ball.vy = newSpeed;
    // Reduce the paddle impact on horizontal velocity
    Ball.vx = Math.sin(angle) * newSpeed * 0.8 + topPaddle.dx * 0.3;
    
    // Ensure the total velocity doesn't exceed MAX_BALL_SPEED
    const totalSpeed = Math.sqrt(Ball.vx * Ball.vx + Ball.vy * Ball.vy);
    if (totalSpeed > GAME_CONSTANTS.MAX_BALL_SPEED) {
      const scale = GAME_CONSTANTS.MAX_BALL_SPEED / totalSpeed;
      Ball.vx *= scale;
      Ball.vy *= scale;
    }
  }
  
  if (checkCollision(Ball, bottomPaddle, true)) {
    // Clear any existing timeout to prevent double scoring
    if (scoreTimeoutRef.current) {
      clearTimeout(scoreTimeoutRef.current);
    }
  
    // Update last player
    lastPlayerRef.current = 'playerBottom';
  
    const hitLocation = (Ball.x - bottomPaddle.x) / GAME_CONSTANTS.PADDLE_WIDTH;
  
    // Calculate new vertical speed with better control
    let newSpeed = Math.abs(Ball.vy) * GAME_CONSTANTS.SPEED_FACTOR;
    newSpeed = Math.min(newSpeed, GAME_CONSTANTS.MAX_BALL_SPEED);
    newSpeed = Math.max(newSpeed, GAME_CONSTANTS.MIN_BALL_SPEED);
  
    // More controlled angle calculation
    const angle = (hitLocation - 0.5) * Math.PI / 3; // Reduced angle range
    
    // Update velocities with better control
    Ball.vy = -newSpeed; // Negative because it's the bottom paddle
    // Reduce the paddle impact on horizontal velocity
    Ball.vx = Math.sin(angle) * newSpeed * 0.8 + bottomPaddle.dx * 0.3;
    
    // Ensure the total velocity doesn't exceed MAX_BALL_SPEED
    const totalSpeed = Math.sqrt(Ball.vx * Ball.vx + Ball.vy * Ball.vy);
    if (totalSpeed > GAME_CONSTANTS.MAX_BALL_SPEED) {
      const scale = GAME_CONSTANTS.MAX_BALL_SPEED / totalSpeed;
      Ball.vx *= scale;
      Ball.vy *= scale;
    }
  }

  // Add this function to your code
const handleWallCollision = (velocity) => {
    const DAMPENING = 0.9; // Reduce this value to increase dampening
    return velocity * DAMPENING;
  };
  
  // Then modify the collision responses like this:
  // For example, in left/right wall collisions:
  Ball.vx = handleWallCollision(-Ball.vx);
  
  // And in top/bottom wall collisions:
  Ball.vy = handleWallCollision(-Ball.vy);


  // In your Draw.js file, modify the draw function
export function draw(contextRef, canvasRef, mode) {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;
  
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    // Your existing drawing code...
    
    // Draw the static balls
    Object.values(StaticBalls).forEach(ball => {
      const { scaleX, scaleY } = scaling(ball.x, ball.y, canvas);
      
      context.beginPath();
      context.arc(
        ball.x * scaleX,
        ball.y * scaleY,
        ball.radius * Math.min(scaleX, scaleY),
        0,
        Math.PI * 2
      );
      context.fillStyle = ball.color;
      context.fill();
      context.closePath();
    });
  
    // Draw the moving ball last so it appears on top
    const { scaleX, scaleY } = scaling(Ball.x, Ball.y, canvas);
    context.beginPath();
    context.arc(
      Ball.x * scaleX,
      Ball.y * scaleY,
      Ball.radius * Math.min(scaleX, scaleY),
      0,
      Math.PI * 2
    );
    context.fillStyle = Ball.color;
    context.fill();
    context.closePath();
  }


  const ErrorComponent = ({ error, resetError }) => {
    const router = useRouter();
  
    // Extract the message from the error
    const getErrorMessage = (error) => {
      if (typeof error === 'object' && error.error) {
        return error.error; // Extract the "error" property
      }
      return typeof error === 'string' ? error : 'An unknown error occurred';
    };
  
    const errorMessage = getErrorMessage(error);
  
    const redirectToLogin = () => {
      resetError();
      router.push("/login");
    };
  
    return (
      <div className="h-[800px] flex justify-center items-center bg-customGray">
        <div className="bg-blue_dark p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-golden text-xl font-bold mb-2">
              Authentication Error
            </h2>
            <p className="text-white text-sm mb-6">{errorMessage}</p>
          </div>
  
          <button
            onClick={redirectToLogin}
            className="w-full bg-golden text-blue_dark rounded-lg p-3 font-semibold hover:bg-golden/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };
  