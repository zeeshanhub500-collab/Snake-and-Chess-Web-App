import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, AlertTriangle, Users, Bot } from 'lucide-react';
import { Button } from '../components/ui/Button';
// Types
type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type PieceColor = 'w' | 'b';
type Piece = {
  type: PieceType;
  color: PieceColor;
} | null;
type Board = Piece[][];
type Position = {
  r: number;
  c: number;
};
type GameMode = 'friend' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';
// Initial Board Setup
const initialBoard: Board = [[{
  type: 'r',
  color: 'b'
}, {
  type: 'n',
  color: 'b'
}, {
  type: 'b',
  color: 'b'
}, {
  type: 'q',
  color: 'b'
}, {
  type: 'k',
  color: 'b'
}, {
  type: 'b',
  color: 'b'
}, {
  type: 'n',
  color: 'b'
}, {
  type: 'r',
  color: 'b'
}], Array(8).fill({
  type: 'p',
  color: 'b'
}), Array(8).fill(null), Array(8).fill(null), Array(8).fill(null), Array(8).fill(null), Array(8).fill({
  type: 'p',
  color: 'w'
}), [{
  type: 'r',
  color: 'w'
}, {
  type: 'n',
  color: 'w'
}, {
  type: 'b',
  color: 'w'
}, {
  type: 'q',
  color: 'w'
}, {
  type: 'k',
  color: 'w'
}, {
  type: 'b',
  color: 'w'
}, {
  type: 'n',
  color: 'w'
}, {
  type: 'r',
  color: 'w'
}]];
// Unicode Pieces
const PIECE_SYMBOLS: Record<string, string> = {
  'w-k': '♔',
  'w-q': '♕',
  'w-r': '♖',
  'w-b': '♗',
  'w-n': '♘',
  'w-p': '♙',
  'b-k': '♚',
  'b-q': '♛',
  'b-r': '♜',
  'b-b': '♝',
  'b-n': '♞',
  'b-p': '♟'
};
// Piece values for AI evaluation
const PIECE_VALUES: Record<PieceType, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900
};
export function ChessGame() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [board, setBoard] = useState<Board>(initialBoard);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gameState, setGameState] = useState<'PLAYING' | 'CHECKMATE' | 'STALEMATE'>('PLAYING');
  const [inCheck, setInCheck] = useState<PieceColor | null>(null);
  const [lastMove, setLastMove] = useState<{
    from: Position;
    to: Position;
  } | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  // Helper: Check if position is on board
  const isValidPos = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
  // Helper: Get valid moves for a piece (without check validation)
  const getPseudoLegalMoves = (boardState: Board, pos: Position): Position[] => {
    const piece = boardState[pos.r][pos.c];
    if (!piece) return [];
    const moves: Position[] = [];
    const {
      type,
      color
    } = piece;
    const directions = {
      r: [[0, 1], [0, -1], [1, 0], [-1, 0]],
      b: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
      q: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]],
      n: [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]],
      k: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
    };
    if (type === 'p') {
      const direction = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      // Move forward 1
      if (isValidPos(pos.r + direction, pos.c) && !boardState[pos.r + direction][pos.c]) {
        moves.push({
          r: pos.r + direction,
          c: pos.c
        });
        // Move forward 2
        if (pos.r === startRow && !boardState[pos.r + direction * 2][pos.c]) {
          moves.push({
            r: pos.r + direction * 2,
            c: pos.c
          });
        }
      }
      // Capture
      ;
      [[direction, 1], [direction, -1]].forEach(([dr, dc]) => {
        const newR = pos.r + dr;
        const newC = pos.c + dc;
        if (isValidPos(newR, newC)) {
          const target = boardState[newR][newC];
          if (target && target.color !== color) {
            moves.push({
              r: newR,
              c: newC
            });
          }
        }
      });
    } else if (type === 'n' || type === 'k') {
      const dirs = directions[type];
      dirs.forEach(([dr, dc]) => {
        const newR = pos.r + dr;
        const newC = pos.c + dc;
        if (isValidPos(newR, newC)) {
          const target = boardState[newR][newC];
          if (!target || target.color !== color) {
            moves.push({
              r: newR,
              c: newC
            });
          }
        }
      });
    } else {
      // Sliding pieces (R, B, Q)
      const dirs = directions[type as 'r' | 'b' | 'q'];
      dirs.forEach(([dr, dc]) => {
        let r = pos.r + dr;
        let c = pos.c + dc;
        while (isValidPos(r, c)) {
          const target = boardState[r][c];
          if (!target) {
            moves.push({
              r,
              c
            });
          } else {
            if (target.color !== color) moves.push({
              r,
              c
            });
            break;
          }
          r += dr;
          c += dc;
        }
      });
    }
    return moves;
  };
  // Helper: Check if king is in check
  const isKingInCheck = (boardState: Board, kingColor: PieceColor): boolean => {
    let kingPos: Position | null = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = boardState[r][c];
        if (p && p.type === 'k' && p.color === kingColor) {
          kingPos = {
            r,
            c
          };
          break;
        }
      }
    }
    if (!kingPos) return false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = boardState[r][c];
        if (p && p.color !== kingColor) {
          const moves = getPseudoLegalMoves(boardState, {
            r,
            c
          });
          if (moves.some(m => m.r === kingPos!.r && m.c === kingPos!.c)) {
            return true;
          }
        }
      }
    }
    return false;
  };
  // Helper: Get legal moves (filtering out moves that leave king in check)
  const getLegalMoves = (boardState: Board, pos: Position): Position[] => {
    const piece = boardState[pos.r][pos.c];
    if (!piece) return [];
    const pseudoMoves = getPseudoLegalMoves(boardState, pos);
    return pseudoMoves.filter(move => {
      const newBoard = boardState.map(row => [...row]);
      newBoard[move.r][move.c] = newBoard[pos.r][pos.c];
      newBoard[pos.r][pos.c] = null;
      return !isKingInCheck(newBoard, piece.color);
    });
  };
  // AI: Evaluate board position
  const evaluateBoard = (boardState: Board): number => {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece) {
          const value = PIECE_VALUES[piece.type];
          score += piece.color === 'b' ? value : -value;
        }
      }
    }
    return score;
  };
  // AI: Get all possible moves for a color
  const getAllLegalMoves = (boardState: Board, color: PieceColor): Array<{
    from: Position;
    to: Position;
  }> => {
    const moves: Array<{
      from: Position;
      to: Position;
    }> = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (boardState[r][c]?.color === color) {
          const legalMoves = getLegalMoves(boardState, {
            r,
            c
          });
          legalMoves.forEach(to => {
            moves.push({
              from: {
                r,
                c
              },
              to
            });
          });
        }
      }
    }
    return moves;
  };
  // AI: Minimax algorithm with alpha-beta pruning
  const minimax = (boardState: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
    if (depth === 0) {
      return evaluateBoard(boardState);
    }
    const color = isMaximizing ? 'b' : 'w';
    const moves = getAllLegalMoves(boardState, color);
    if (moves.length === 0) {
      const inCheck = isKingInCheck(boardState, color);
      if (inCheck) return isMaximizing ? -10000 : 10000; // Checkmate
      return 0; // Stalemate
    }
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const newBoard = boardState.map(row => [...row]);
        newBoard[move.to.r][move.to.c] = newBoard[move.from.r][move.from.c];
        newBoard[move.from.r][move.from.c] = null;
        const evaluation = minimax(newBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const newBoard = boardState.map(row => [...row]);
        newBoard[move.to.r][move.to.c] = newBoard[move.from.r][move.from.c];
        newBoard[move.from.r][move.from.c] = null;
        const evaluation = minimax(newBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };
  // AI: Find best move
  const findBestMove = (boardState: Board, aiDifficulty: Difficulty): {
    from: Position;
    to: Position;
  } | null => {
    const moves = getAllLegalMoves(boardState, 'b');
    if (moves.length === 0) return null;
    // Difficulty settings
    const depthMap = {
      easy: 1,
      medium: 2,
      hard: 3
    };
    const depth = depthMap[aiDifficulty];
    // Easy mode: random moves sometimes
    if (aiDifficulty === 'easy' && Math.random() < 0.3) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    let bestMove = moves[0];
    let bestValue = -Infinity;
    for (const move of moves) {
      const newBoard = boardState.map(row => [...row]);
      newBoard[move.to.r][move.to.c] = newBoard[move.from.r][move.from.c];
      newBoard[move.from.r][move.from.c] = null;
      const value = minimax(newBoard, depth, -Infinity, Infinity, false);
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }
    return bestMove;
  };
  // AI Move execution
  useEffect(() => {
    if (gameMode === 'ai' && turn === 'b' && gameState === 'PLAYING' && !isAiThinking) {
      setIsAiThinking(true);
      // Delay for better UX
      setTimeout(() => {
        const bestMove = findBestMove(board, difficulty);
        if (bestMove) {
          const newBoard = board.map(row => [...row]);
          const movingPiece = newBoard[bestMove.from.r][bestMove.from.c];
          // Pawn Promotion
          if (movingPiece?.type === 'p' && bestMove.to.r === 0) {
            movingPiece.type = 'q';
          }
          newBoard[bestMove.to.r][bestMove.to.c] = movingPiece;
          newBoard[bestMove.from.r][bestMove.from.c] = null;
          setBoard(newBoard);
          setLastMove(bestMove);
          setTurn('w');
        }
        setIsAiThinking(false);
      }, 500);
    }
  }, [turn, gameMode, gameState, board, difficulty, isAiThinking]);
  // Check Game Status
  useEffect(() => {
    const currentInCheck = isKingInCheck(board, turn);
    setInCheck(currentInCheck ? turn : null);
    let hasMoves = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.color === turn) {
          if (getLegalMoves(board, {
            r,
            c
          }).length > 0) {
            hasMoves = true;
            break;
          }
        }
      }
      if (hasMoves) break;
    }
    if (!hasMoves) {
      setGameState(currentInCheck ? 'CHECKMATE' : 'STALEMATE');
    }
  }, [board, turn]);
  const handleSquareClick = (r: number, c: number) => {
    if (gameState !== 'PLAYING') return;
    if (gameMode === 'ai' && turn === 'b') return; // Block clicks during AI turn
    const clickedPiece = board[r][c];
    const isSameColor = clickedPiece?.color === turn;
    if (isSameColor) {
      setSelectedPos({
        r,
        c
      });
      setValidMoves(getLegalMoves(board, {
        r,
        c
      }));
      return;
    }
    if (selectedPos) {
      const isValidMove = validMoves.some(m => m.r === r && m.c === c);
      if (isValidMove) {
        const newBoard = board.map(row => [...row]);
        const movingPiece = newBoard[selectedPos.r][selectedPos.c];
        if (movingPiece?.type === 'p' && (r === 0 || r === 7)) {
          movingPiece.type = 'q';
        }
        newBoard[r][c] = movingPiece;
        newBoard[selectedPos.r][selectedPos.c] = null;
        setBoard(newBoard);
        setLastMove({
          from: selectedPos,
          to: {
            r,
            c
          }
        });
        setTurn(turn === 'w' ? 'b' : 'w');
        setSelectedPos(null);
        setValidMoves([]);
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    }
  };
  const resetGame = () => {
    setBoard(initialBoard);
    setTurn('w');
    setSelectedPos(null);
    setValidMoves([]);
    setGameState('PLAYING');
    setInCheck(null);
    setLastMove(null);
    setIsAiThinking(false);
  };
  const startNewGame = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  };
  // Mode Selection Screen
  if (!gameMode) {
    return <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col items-center justify-center p-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
          .font-display { font-family: 'Orbitron', sans-serif; }
        `}</style>

        <Link to="/" className="absolute top-8 left-8 text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold font-display text-fuchsia-500 drop-shadow-[0_0_10px_rgba(232,121,249,0.5)] mb-4">
          CHOOSE MODE
        </h1>
        <p className="text-zinc-400 mb-12">Select your opponent</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
          {/* Play vs Friend */}
          <button onClick={() => startNewGame('friend')} className="group relative p-8 bg-zinc-900 rounded-xl border-2 border-zinc-800 hover:border-cyan-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <Users className="w-16 h-16 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold font-display text-cyan-400 mb-2">
              VS FRIEND
            </h3>
            <p className="text-zinc-400 text-sm">Local 2-player mode</p>
          </button>

          {/* Play vs AI */}
          <button onClick={() => startNewGame('ai')} className="group relative p-8 bg-zinc-900 rounded-xl border-2 border-zinc-800 hover:border-fuchsia-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(232,121,249,0.3)]">
            <Bot className="w-16 h-16 text-fuchsia-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold font-display text-fuchsia-400 mb-2">
              VS ROBOT
            </h3>
            <p className="text-zinc-400 text-sm">Play against AI</p>
          </button>
        </div>

        {/* Difficulty Selection (shown when AI mode is hovered/selected) */}
        <div className="mt-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 max-w-md">
          <h4 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">
            AI Difficulty
          </h4>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => <button key={level} onClick={() => setDifficulty(level)} className={`flex-1 py-2 px-4 rounded-lg font-bold uppercase text-sm transition-all ${difficulty === level ? 'bg-fuchsia-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                {level}
              </button>)}
          </div>
        </div>
      </div>;
  }
  // Game Screen
  return <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        .font-display { font-family: 'Orbitron', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <button onClick={() => setGameMode(null)} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Change Mode
        </button>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-fuchsia-500 drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]">
          {gameMode === 'ai' ? 'VS ROBOT' : 'VS FRIEND'}
        </h1>
        <Button onClick={resetGame} variant="ghost" size="sm">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Game Board */}
        <div className="relative p-3 bg-zinc-900 rounded-lg border border-zinc-800 shadow-2xl">
          <div className={`absolute -inset-1 bg-gradient-to-br ${turn === 'w' ? 'from-cyan-500 to-blue-600' : 'from-fuchsia-500 to-pink-600'} rounded-lg blur opacity-40 transition-colors duration-500 -z-10`}></div>

          {/* AI Thinking Overlay */}
          {isAiThinking && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg z-20 flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-12 h-12 text-fuchsia-400 mx-auto mb-2 animate-pulse" />
                <p className="text-fuchsia-400 font-bold">AI Thinking...</p>
              </div>
            </div>}

          <div className="grid grid-cols-8 gap-0.5 bg-zinc-800 border-2 border-zinc-700">
            {board.map((row, r) => row.map((piece, c) => {
            const isBlackSquare = (r + c) % 2 === 1;
            const isSelected = selectedPos?.r === r && selectedPos?.c === c;
            const isValidMove = validMoves.some(m => m.r === r && m.c === c);
            const isLastMove = lastMove?.from.r === r && lastMove?.from.c === c || lastMove?.to.r === r && lastMove?.to.c === c;
            return <div key={`${r}-${c}`} onClick={() => handleSquareClick(r, c)} className={`
                      w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center text-3xl sm:text-4xl cursor-pointer select-none transition-all duration-200
                      ${isBlackSquare ? 'bg-zinc-800' : 'bg-zinc-700'}
                      ${isSelected ? 'bg-yellow-500/50 ring-inset ring-2 ring-yellow-400' : ''}
                      ${isValidMove ? 'after:content-[""] after:w-3 after:h-3 after:bg-green-500/50 after:rounded-full' : ''}
                      ${isValidMove && piece ? 'ring-inset ring-4 ring-red-500/50' : ''}
                      ${isLastMove ? 'bg-blue-500/20' : ''}
                      hover:bg-opacity-80
                    `}>
                    {piece && <span className={`
                        drop-shadow-lg transform transition-transform hover:scale-110
                        ${piece.color === 'w' ? 'text-cyan-100 drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]' : 'text-fuchsia-400 drop-shadow-[0_0_2px_rgba(232,121,249,0.8)]'}
                      `}>
                        {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
                      </span>}
                  </div>;
          }))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full md:w-64 bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
          <div className="mb-6">
            <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-2">
              Current Turn
            </h3>
            <div className={`flex items-center gap-3 text-xl font-bold ${turn === 'w' ? 'text-cyan-400' : 'text-fuchsia-400'}`}>
              <div className={`w-4 h-4 rounded-full ${turn === 'w' ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-fuchsia-400 shadow-[0_0_10px_#e879f9]'}`}></div>
              {gameMode === 'ai' ? turn === 'w' ? 'You' : 'Robot' : turn === 'w' ? 'White' : 'Black'}
            </div>
          </div>

          {gameMode === 'ai' && <div className="mb-6 p-3 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-fuchsia-400" />
                <span className="text-sm font-bold text-fuchsia-400">
                  AI Level
                </span>
              </div>
              <p className="text-xs text-zinc-400 capitalize">{difficulty}</p>
            </div>}

          {inCheck && gameState === 'PLAYING' && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold">CHECK!</span>
            </div>}

          {gameState !== 'PLAYING' && <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold font-display text-white mb-2">
                {gameState === 'CHECKMATE' ? 'CHECKMATE' : 'STALEMATE'}
              </h2>
              <p className="text-zinc-400 mb-4">
                {gameState === 'CHECKMATE' ? gameMode === 'ai' ? turn === 'w' ? 'Robot Wins!' : 'You Win!' : `${turn === 'w' ? 'Black' : 'White'} Wins!` : 'Draw'}
              </p>
              <Button onClick={resetGame} neonColor="fuchsia" className="w-full">
                Play Again
              </Button>
            </div>}

          <div className="text-xs text-zinc-500 mt-8">
            <p className="mb-2">Instructions:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Click piece to select</li>
              <li>Green dots show valid moves</li>
              <li>Red ring means capture</li>
              {gameMode === 'ai' && <li>You play as White</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>;
}