const handleBallPositions = useCallback((data) => {
    const { ball } = data;

    // Mirror logic: Flip ball x-coordinate if the player is on the right
    const isPlayerOnRight = /* logic to determine if this client is on the right */;
    const canvasWidth = canvasRef.current?.width;

    const mirroredBall = {
        x: isPlayerOnRight ? canvasWidth - ball.x : ball.x,
        y: ball.y,
        radius: ball.radius,
    };

    positionRef.current = {
        x_ball: mirroredBall.x,
        y_ball: mirroredBall.y,
        ball_radius: mirroredBall.radius,
    };
}, []);
