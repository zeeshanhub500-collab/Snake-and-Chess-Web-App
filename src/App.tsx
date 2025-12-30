import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SnakeGame } from './pages/SnakeGame';
import { ChessGame } from './pages/ChessGame';
export function App() {
  return <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/snake" element={<SnakeGame />} />
        <Route path="/chess" element={<ChessGame />} />
      </Routes>
    </Router>;
}