export const draw = (contextRef, canvasRef, positionRef) => {
  const context = contextRef.current;
  const canvas = canvasRef.current;
  if (!context || !canvas) return;
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Get the scaling factors based on the original canvas size vs current size
  const originalWidth = 800;  // Set this to your default/original canvas width
  const originalHeight = 600; // Set this to your default/original canvas height
  
  const scaleX = canvas.width / originalWidth;
  const scaleY = canvas.height / originalHeight;
  const scale = Math.min(scaleX, scaleY); // Use uniform scaling to prevent distortion

  // Scale the positions and dimensions while maintaining aspect ratio
  const scaledBallX = positionRef.current.x_ball * scaleX;
  const scaledBallY = positionRef.current.y_ball * scaleY;
  const scaledBallRadius = positionRef.current.ball_radius * scale;

  // Draw left racket with scaling
  context.fillStyle = "#EEEEEE";
  context.fillRect(
    leftPaddle.x * scaleX,
    leftPaddle.y * scaleY,
    leftPaddle.width * scale,
    leftPaddle.height * scale
  );

  // Draw right racket with scaling
  context.fillStyle = "#FFD369";
  context.fillRect(
    rightPaddle.x * scaleX,
    rightPaddle.y * scaleY,
    rightPaddle.width * scale,
    rightPaddle.height * scale
  );

  // Draw center line with scaling
  context.fillStyle = "#000000";
  context.fillRect(
    (canvas.width / 2) - (scale / 2),
    0,
    scale,
    canvas.height
  );

  // Draw ball with scaling
  context.beginPath();
  context.arc(
    scaledBallX,
    scaledBallY,
    scaledBallRadius,
    0,
    Math.PI * 2
  );
  context.fillStyle = "#00FFD1";
  context.fill();
};

// Add these helper functions for consistent coordinate transformations
export const screenToGame = (x, y, canvas, originalWidth = 800, originalHeight = 600) => {
  const scaleX = originalWidth / canvas.width;
  const scaleY = originalHeight / canvas.height;
  
  return {
    x: x * scaleX,
    y: y * scaleY
  };
};

export const gameToScreen = (x, y, canvas, originalWidth = 800, originalHeight = 600) => {
  const scaleX = canvas.width / originalWidth;
  const scaleY = canvas.height / originalHeight;
  
  return {
    x: x * scaleX,
    y: y * scaleY
  };
};
