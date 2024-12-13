const handleBallPositions = useCallback((data) => {
  const { ball, canvas_width } = data;
  
  const isPlayerOnRight = gameState.player_name !== positionRef.current.left_player;

  positionRef.current = {
      ...positionRef.current,
      x_ball: ball.x,
      y_ball: ball.y,
      ball_radius: ball.radius,
      originalWidth: data.original_width,
      originalHeight: data.original_height,
      isPlayerOnRight: isPlayerOnRight
  };

  if(data.scored){
      if(data.scored === 'left'){
          setGameState((prev) => ({...prev, scoreA: prev.scoreA + 1}))
      }else{
          setGameState((prev) => ({...prev, scoreB: prev.scoreB + 1}))
      }
  }
}, [gameState.player_name]);






export const draw = (contextRef, canvasRef, positionRef) => {
  const context = contextRef.current;
  const canvas = canvasRef.current;
  if (!context || !canvas) return;
  
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate scale factors
  const scaleX = canvas.width / positionRef.current.originalWidth;
  const scaleY = canvas.height / positionRef.current.originalHeight;

  // Scale ball position
  const scaledBallX = positionRef.current.x_ball * scaleX;
  const scaledBallY = positionRef.current.y_ball * scaleY;
  const scaledBallRadius = positionRef.current.ball_radius * Math.min(scaleX, scaleY);

  // Handle ball position for right player
  const finalBallX = positionRef.current.isPlayerOnRight ? canvas.width - scaledBallX : scaledBallX;

  // Draw ball with scaling
  context.beginPath();
  context.arc(
      finalBallX,
      scaledBallY,
      scaledBallRadius,
      0,
      Math.PI * 2
  );
  context.fillStyle = "#00FFD1";
  context.fill();

  // Draw paddles with scaling
  context.fillStyle = "#EEEEEE";
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width * scaleX, leftPaddle.height * scaleY);

  context.fillStyle = "#FFD369";
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width * scaleX, rightPaddle.height * scaleY);

  // Draw fil
  context.fillStyle = "#000000";
  context.fillRect(fil.x, fil.y - canvas.height / 2, 1, canvas.height);
};






useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const context = canvas.getContext("2d");
  contextRef.current = context;

  const originalWidth = 800;  
  const originalHeight = 600;

  // Set initial canvas size while maintaining aspect ratio
  const container = divRef.current;
  const containerWidth = container.clientWidth * 0.7;
  const containerHeight = window.innerHeight * 0.6;

  const aspectRatio = originalWidth / originalHeight;
  let width = containerWidth;
  let height = width / aspectRatio;

  if (height > containerHeight) {
      height = containerHeight;
      width = height * aspectRatio;
  }

  canvas.width = width;
  canvas.height = height;

  // Calculate scale factors
  const scaleX = width / originalWidth;
  const scaleY = height / originalHeight;

  // Initialize paddle positions with scaling
  leftPaddle.x = 10 * scaleX;  // 10 is the original x position
  leftPaddle.y = (originalHeight/2 - 39) * scaleY;  // Original y position
  leftPaddle.height = RacketHeight * scaleY;

  rightPaddle.x = (originalWidth - 30) * scaleX;  // Original x position
  rightPaddle.y = (originalHeight/2 - 39) * scaleY;  // Original y position
  rightPaddle.height = RacketHeight * scaleY;

  fil.x = width / 2;
  fil.y = height / 2;

  const resizeCanvas = () => {
      const container = divRef.current;
      if (!canvas || !container) return;
      
      const newWidth = container.clientWidth * 0.7;
      const newHeight = window.innerHeight * 0.6;
      
      const aspectRatio = originalWidth / originalHeight;
      let width = newWidth;
      let height = width / aspectRatio;

      if (height > newHeight) {
          height = newHeight;
          width = height * aspectRatio;
      }

      // Calculate new scale factors
      const newScaleX = width / originalWidth;
      const newScaleY = height / originalHeight;

      canvas.width = width;
      canvas.height = height;

      // Update paddle positions with new scaling
      leftPaddle.x = 10 * newScaleX;
      leftPaddle.height = RacketHeight * newScaleY;
      leftPaddle.y = (originalHeight/2 - RacketHeight/2) * newScaleY;

      rightPaddle.x = (originalWidth - 30) * newScaleX;
      rightPaddle.height = RacketHeight * newScaleY;
      rightPaddle.y = (originalHeight/2 - RacketHeight/2) * newScaleY;

      fil.x = width / 2;
      fil.y = height / 2;

      sendGameMessage({
          type: "canvas_resize",
          canvas_width: width,
          canvas_height: height,
      });
  };

  window.addEventListener("resize", resizeCanvas);
  return () => window.removeEventListener("resize", resizeCanvas);
}, [gameState.playerTwoN]);