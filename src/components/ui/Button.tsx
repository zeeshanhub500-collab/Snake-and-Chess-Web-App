import React from 'react';
import { Loader2 } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  neonColor?: 'cyan' | 'fuchsia' | 'lime';
}
export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  neonColor = 'cyan',
  disabled,
  ...props
}: ButtonProps) {
  const colorClasses = {
    cyan: 'shadow-cyan-500/50 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black',
    fuchsia: 'shadow-fuchsia-500/50 border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black',
    lime: 'shadow-lime-500/50 border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-black'
  };
  const baseStyles = 'relative inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: `bg-transparent border-2 ${colorClasses[neonColor]} shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(0,0,0,0.7)]`,
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border-2 border-transparent',
    outline: 'bg-transparent border-2 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white',
    ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50'
  };
  const sizes = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-12 px-6 text-sm',
    lg: 'h-14 px-8 text-base'
  };
  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>;
}