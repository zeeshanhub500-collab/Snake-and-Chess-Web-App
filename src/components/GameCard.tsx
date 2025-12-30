import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color: 'cyan' | 'fuchsia';
  imageGradient: string;
}
export function GameCard({
  title,
  description,
  icon,
  to,
  color,
  imageGradient
}: GameCardProps) {
  const colorStyles = {
    cyan: {
      border: 'group-hover:border-cyan-500',
      text: 'text-cyan-400',
      bg: 'group-hover:shadow-cyan-500/20',
      glow: 'bg-cyan-500'
    },
    fuchsia: {
      border: 'group-hover:border-fuchsia-500',
      text: 'text-fuchsia-400',
      bg: 'group-hover:shadow-fuchsia-500/20',
      glow: 'bg-fuchsia-500'
    }
  };
  const styles = colorStyles[color];
  return <Link to={to} className={`group relative flex flex-col overflow-hidden rounded-xl bg-zinc-900 border-2 border-zinc-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${styles.border} ${styles.bg}`}>
      {/* Image/Gradient Area */}
      <div className={`h-48 w-full ${imageGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110">
          {icon}
        </div>

        {/* Overlay on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${styles.glow}`} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-6">
        <h3 className={`text-2xl font-bold mb-2 font-display uppercase tracking-wide ${styles.text}`}>
          {title}
        </h3>
        <p className="text-zinc-400 mb-6 flex-grow leading-relaxed">
          {description}
        </p>

        <div className="flex items-center text-sm font-bold uppercase tracking-wider text-zinc-100 group-hover:underline decoration-2 underline-offset-4">
          Play Now{' '}
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>;
}