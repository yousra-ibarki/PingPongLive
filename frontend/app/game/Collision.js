// import React, { useState, useEffect, useRef } from "react";
// import Matter from "matter-js";

// export const Collision = (
//   Events,
//   Body,
//   engine,
//   Ball,
//   setScoreA,
//   setScoreB,
//   initialBallPos,
//   sendGameMessage,
//   positionRef,
//   gameState,
//   playerName
// ) => {
//   // const BallSound = new Audio("./BallSound.mp3");
//   // const Fail = new Audio("./Fail.mp3");

//   Events.on(engine, "collisionStart", (event) => {
//     const pairs = event.pairs;

//     pairs.forEach((pair) => {
//       const { bodyA, bodyB } = pair;
//       const ball = Ball;
//       let bodyC = bodyA === ball ? bodyB : bodyA;

//       if (bodyC.label === "left") {
//         setScoreB((prevNumber) => prevNumber + 1);
        
//         const initialVelocity =
//         playerName === positionRef.current.ball_owner
//         ? { x: -5, y: 0 }
//         : { x: 5, y: 0 };
        
//         Body.setPosition(Ball, initialBallPos);
//         Body.setVelocity(Ball, initialVelocity);

//         sendGameMessage({
//           type: "Ball_reset",
//           x_ball: initialBallPos.x,
//           y_ball: initialBallPos.y,
//           x_velocity: initialVelocity.x,
//           y_velocity: initialVelocity.y,
//           ball_owner: positionRef.current.ball_owner,
//         });
//       } 
      
//       else if (bodyC.label === "right") {
//         setScoreA((prevNumber) => prevNumber + 1);
//         Body.setPosition(Ball, initialBallPos);

//         const initialVelocity = playerName === positionRef.current.ball_owner 
//         ? { x: 5, y: 0 }  // Start moving right if ball owner
//         : { x: -5, y: 0 };  // Start moving left if not ball owner
        
//         Body.setPosition(Ball, initialBallPos);
//       Body.setVelocity(Ball, initialVelocity);
      
//       // Notify opponent about ball reset
//       sendGameMessage({
//         type: 'Ball_reset',
//         x_ball: initialBallPos.x,
//         y_ball: initialBallPos.y,
//         x_velocity: initialVelocity.x,
//         y_velocity: initialVelocity.y,
//         ball_owner: positionRef.current.ball_owner
//       });
//       } 
      
      
//       else if (
//         (bodyC.label === "RacketR" || bodyC.label === "RacketL")// &&
//         // Ball.velocity.x <= 12.086963859830433 &&
//         // Ball.velocity.x >= -12.086963859830433
//       ) {
//         const offsetY = Ball.position.y - bodyC.position.y; 
//         const newXVelocity = Ball.velocity.x ; 
//         const newYVelocity = Ball.velocity.y + offsetY; 

        
//         const maxVelocity = 5; 
//         const clampedXVelocity = Math.min(Math.max(newXVelocity, -maxVelocity),maxVelocity);
//         const clampedYVelocity = Math.min(Math.max(newYVelocity, -maxVelocity),maxVelocity);

//         Body.setVelocity(Ball, {
//           x: clampedXVelocity,
//           y: clampedYVelocity,
//         });

//         sendGameMessage({
//           type: "Ball_move",
//           x_ball: Ball.position.x,
//           y_ball: Ball.position.y,
//           x_velocity: clampedXVelocity,
//           y_velocity: clampedYVelocity,
//         });
//       }
//     });
//   });
// };





// ... existing imports and initial code ...

export function Game() {
  // Add canvas and context refs
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    contextRef.current = context;

    const handleKeyDown = (event) => {
      if (event.code === "KeyW") leftPaddle.dy = -12;
      if (event.code === "KeyS") leftPaddle.dy = 12;
      if (event.code === "ArrowUp") rightPaddle.dy = -12;
      if (event.code === "ArrowDown") rightPaddle.dy = 12;
    };

    const handleKeyUp = (event) => {
      if (event.code === "KeyW" || event.code === "KeyS") leftPaddle.dy = 0;
      if (event.code === "ArrowUp" || event.code === "ArrowDown") rightPaddle.dy = 0;
    };

    const gameLoop = () => {
      if (!canvas || !contextRef.current) return;
      update();
      draw();
      requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update Ball position
    Ball.x += Ball.vx;
    Ball.y += Ball.vy;

    // Bounce Ball off top and bottom walls
    if (Ball.y - BallRadius < 0 || Ball.y + BallRadius > canvas.height) {
      Ball.vy *= -1;
    }

    // ... rest of update logic ...
  };

  const draw = () => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw left racket
    context.fillStyle = "#EEEEEE";
    context.fillRect(leftPaddle.x, leftPaddle.y, RacketWidth, RacketHeight);

    // ... rest of draw logic ...
  };

  // Update the canvas element in the return statement
  return (
    // ... existing JSX ...
    <canvas 
      ref={canvasRef}
      width={window.innerWidth * 0.7} 
      height={window.innerHeight * 0.6} 
      className="block mx-auto z-3"
    />
    // ... rest of JSX ...
  );
}


// ... existing code ...

const update = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  // Update Ball position
  Ball.x += Ball.vx;
  Ball.y += Ball.vy;

  // Check collision with fil (middle line)
  if (Math.abs(Ball.x - fil.x) < Ball.radius) {
    // If ball is below the fil's midpoint, force it above
    if (Ball.y > fil.y) {
      Ball.y = fil.y - Ball.radius;
      Ball.vy = Math.abs(Ball.vy) * -1; // Force ball to move upward
    }
  }

  // Rest of the update function remains the same...
  // ... existing collision checks and position updates ...
};

