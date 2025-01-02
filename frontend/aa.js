// GameState.js
import { useReducer, useMemo } from 'react';

const initialState = {
  scoreA: 0,
  scoreB: 0,
  winScore: 0,
  loseScore: 0,
  isGameOver: false,
  winner: null,
  loser: null
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SCORE_A':
      const newScoreA = state.scoreA + 1;
      return {
        ...state,
        scoreA: newScoreA,
        isGameOver: newScoreA >= GAME_CONSTANTS.MAX_SCORE,
        winner: newScoreA >= GAME_CONSTANTS.MAX_SCORE ? 'playerA' : state.winner,
        winScore: newScoreA >= GAME_CONSTANTS.MAX_SCORE ? newScoreA : state.winScore,
        loseScore: newScoreA >= GAME_CONSTANTS.MAX_SCORE ? state.scoreB : state.loseScore
      };
    // Similar case for SCORE_B
    // ... other cases
  }
};

// Ball physics improvements
const BallPhysics = {
  MAX_SPEED: 15,
  MIN_SPEED: 4,
  ACCELERATION: 0.2,

  updateVelocity(ball, paddle) {
    const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    const newSpeed = Math.min(currentSpeed + this.ACCELERATION, this.MAX_SPEED);
    
    // Calculate new angle based on hit position
    const hitPosition = (ball.y - paddle.y) / paddle.height;
    const angle = (hitPosition - 0.5) * Math.PI / 3; // Max 60° deflection
    
    ball.vx = newSpeed * Math.cos(angle) * Math.sign(ball.vx);
    ball.vy = newSpeed * Math.sin(angle);
  }
};

// Optimized game loop
const useGameLoop = (callback, deps = []) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  
  const animate = time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, deps);
};

// Memoized scaling
const useScaling = (canvas) => {
  return useMemo(() => {
    if (!canvas) return null;
    const scaleX = canvas.width / GAME_CONSTANTS.ORIGINAL_WIDTH;
    const scaleY = canvas.height / GAME_CONSTANTS.ORIGINAL_HEIGHT;
    return { scaleX, scaleY };
  }, [canvas?.width, canvas?.height]);
};