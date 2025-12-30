import React from 'react';
import { GameCard } from '../components/GameCard';
import { Gamepad2, Crown } from 'lucide-react';
export function HomePage() {
  return <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        .font-display { font-family: 'Orbitron', sans-serif; }
      `}</style>

      {/* Hero Section */}
      <div className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display mb-6 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              RETRO
            </span>
            <span className="text-white mx-4">ARCADE</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Experience the classics reimagined with neon aesthetics and modern
            gameplay. Choose your challenge.
          </p>
        </div>
      </div>

      {/* Game Grid */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <GameCard title="Neon Snake" description="The classic snake game remastered. Navigate the grid, collect energy, and survive the increasing speed." to="/snake" color="cyan" imageGradient="bg-gradient-to-br from-zinc-800 to-zinc-900" icon={<Gamepad2 className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />} />
          <GameCard title="Grandmaster Chess" description="Strategic warfare on the 64 squares. Challenge a friend in this local multiplayer classic." to="/chess" color="fuchsia" imageGradient="bg-gradient-to-br from-zinc-800 to-zinc-900" icon={<Crown className="w-24 h-24 text-fuchsia-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]" />} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-zinc-600">
        <p>© 2024 Retro Arcade. Built for gamers.</p>
      </footer>
    </div>;
}