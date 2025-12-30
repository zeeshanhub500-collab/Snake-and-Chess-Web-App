import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '../components/ui/Button';
// Game Constants
const GRID_SIZE = 20;
const CELL_SIZE = 20; // Will be calculated dynamically based on canvas size
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 50;
type Point = {
  x: number;
  y: number;
};
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'IDLE' | 'PLAYING' | 'GAME_OVER';
export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  // Game Logic Refs (using refs for mutable game state to avoid re-renders during loop)
  const snake = useRef<Point[]>([{
    x: 10,
    y: 10
  }]);
  const food = useRef<Point>({
    x: 15,
    y: 5
  });
  const direction = useRef<Direction>('RIGHT');
  const nextDirection = useRef<Direction>('RIGHT'); // Buffer for next move to prevent self-collision on quick turns
  const speed = useRef(INITIAL_SPEED);
  const lastRenderTime = useRef(0);
  const gameLoopId = useRef<number>();
  // Initialize/Reset Game
  const resetGame = useCallback(() => {
    snake.current = [{
      x: 10,
      y: 10
    }, {
      x: 9,
      y: 10
    }, {
      x: 8,
      y: 10
    }];
    direction.current = 'RIGHT';
    nextDirection.current = 'RIGHT';
    scoreRef.current = 0;
    setScore(0);
    speed.current = INITIAL_SPEED;
    spawnFood();
    setGameState('PLAYING');
  }, []);
  // We need a ref for score to access inside game loop without dependency issues
  const scoreRef = useRef(0);
  const spawnFood = () => {
    let newFood;
    let isOnSnake;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Check if food spawned on snake
      // eslint-disable-next-line no-loop-func
      isOnSnake = snake.current.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (isOnSnake);
    food.current = newFood;
  };
  const gameOver = () => {
    setGameState('GAME_OVER');
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('snake_highscore', scoreRef.current.toString());
    }
    if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
  };
  const update = useCallback((timestamp: number) => {
    if (gameState !== 'PLAYING') return;
    const timeSinceLastRender = timestamp - lastRenderTime.current;
    if (timeSinceLastRender < speed.current) {
      gameLoopId.current = requestAnimationFrame(update);
      return;
    }
    lastRenderTime.current = timestamp;
    // Update direction from buffer
    direction.current = nextDirection.current;
    // Calculate new head position
    const head = {
      ...snake.current[0]
    };
    switch (direction.current) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }
    // Check collisions
    // 1. Walls
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameOver();
      return;
    }
    // 2. Self
    if (snake.current.some(segment => segment.x === head.x && segment.y === head.y)) {
      gameOver();
      return;
    }
    // Move Snake
    snake.current.unshift(head); // Add new head
    // Check Food
    if (head.x === food.current.x && head.y === food.current.y) {
      // Ate food
      scoreRef.current += 10;
      setScore(scoreRef.current);
      // Increase speed
      speed.current = Math.max(MIN_SPEED, speed.current - SPEED_INCREMENT);
      spawnFood();
    } else {
      // Didn't eat, remove tail
      snake.current.pop();
    }
    draw();
    gameLoopId.current = requestAnimationFrame(update);
  }, [gameState, highScore]);
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Clear canvas
    ctx.fillStyle = '#09090b'; // zinc-950
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Calculate cell size based on current canvas size
    const cellSize = canvas.width / GRID_SIZE;
    // Draw Grid (optional, subtle)
    ctx.strokeStyle = '#18181b'; // zinc-900
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
    // Draw Food
    ctx.fillStyle = '#22d3ee'; // cyan-400
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(food.current.x * cellSize + cellSize / 2, food.current.y * cellSize + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Draw Snake
    snake.current.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#ffffff' : '#06b6d4'; // white head, cyan-500 body
      if (isHead) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
      }
      ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
      ctx.shadowBlur = 0;
    });
  };
  // Handle Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.current !== 'DOWN') nextDirection.current = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.current !== 'UP') nextDirection.current = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.current !== 'RIGHT') nextDirection.current = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.current !== 'LEFT') nextDirection.current = 'RIGHT';
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);
  // Start/Stop Loop
  useEffect(() => {
    if (gameState === 'PLAYING') {
      gameLoopId.current = requestAnimationFrame(update);
    }
    return () => {
      if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
    };
  }, [gameState, update]);
  // Initial Draw
  useEffect(() => {
    draw();
  }, []);
  return <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        .font-display { font-family: 'Orbitron', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <Link to="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
          NEON SNAKE
        </h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Game Container */}
      <div className="relative group">
        {/* Neon Glow Border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>

        <div className="relative bg-zinc-900 p-4 rounded-lg border border-zinc-800 shadow-2xl">
          {/* Stats Bar */}
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-sm uppercase tracking-wider">
                Score
              </span>
              <span className="text-2xl font-bold font-display text-white">
                {score}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-zinc-400 text-sm uppercase tracking-wider">
                High
              </span>
              <span className="text-xl font-bold font-display text-yellow-500">
                {highScore}
              </span>
            </div>
          </div>

          {/* Canvas */}
          <canvas ref={canvasRef} width={400} height={400} className="bg-zinc-950 rounded border border-zinc-800 shadow-inner w-[300px] h-[300px] md:w-[400px] md:h-[400px]" />

          {/* Overlays */}
          {gameState === 'IDLE' && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg z-10">
              <Button onClick={resetGame} neonColor="cyan" size="lg">
                <Play className="mr-2 w-5 h-5" /> Start Game
              </Button>
              <p className="mt-4 text-zinc-400 text-sm">
                Use Arrow Keys or WASD to move
              </p>
            </div>}

          {gameState === 'GAME_OVER' && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg z-10">
              <h2 className="text-4xl font-bold font-display text-red-500 mb-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                GAME OVER
              </h2>
              <p className="text-zinc-300 mb-6">Final Score: {score}</p>
              <Button onClick={resetGame} neonColor="cyan">
                <RotateCcw className="mr-2 w-5 h-5" /> Try Again
              </Button>
            </div>}
        </div>
      </div>

      {/* Controls Hint (Mobile) */}
      <div className="mt-8 md:hidden grid grid-cols-3 gap-2">
        <div></div>
        <button className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center active:bg-cyan-500/20 active:text-cyan-400 transition-colors" onPointerDown={() => {
        if (direction.current !== 'DOWN') nextDirection.current = 'UP';
      }}>
          <ArrowLeft className="rotate-90" />
        </button>
        <div></div>
        <button className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center active:bg-cyan-500/20 active:text-cyan-400 transition-colors" onPointerDown={() => {
        if (direction.current !== 'RIGHT') nextDirection.current = 'LEFT';
      }}>
          <ArrowLeft />
        </button>
        <button className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center active:bg-cyan-500/20 active:text-cyan-400 transition-colors" onPointerDown={() => {
        if (direction.current !== 'UP') nextDirection.current = 'DOWN';
      }}>
          <ArrowLeft className="-rotate-90" />
        </button>
        <button className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center active:bg-cyan-500/20 active:text-cyan-400 transition-colors" onPointerDown={() => {
        if (direction.current !== 'LEFT') nextDirection.current = 'RIGHT';
      }}>
          <ArrowLeft className="rotate-180" />
        </button>
      </div>
    </div>;
}