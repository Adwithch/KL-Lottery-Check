
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" /> {/* Emerald 400 */}
          <stop offset="100%" stopColor="#059669" /> {/* Emerald 600 */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Ticket Shape */}
      <path 
        d="M15 30C15 21.7157 21.7157 15 30 15H70C78.2843 15 85 21.7157 85 30V40C85 42.7614 87.2386 45 90 45V55C87.2386 55 85 57.2386 85 60V70C85 78.2843 78.2843 85 70 85H30C21.7157 85 15 78.2843 15 70V60C15 57.2386 12.7614 55 10 55V45C12.7614 45 15 42.7614 15 40V30Z" 
        fill="url(#logoGradient)" 
        filter="url(#glow)"
      />
      
      {/* Checkmark */}
      <path 
        d="M38 50L48 60L65 38" 
        stroke="white" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Decorative Dots */}
      <circle cx="50" cy="72" r="3" fill="white" fillOpacity="0.5" />
      <circle cx="50" cy="28" r="3" fill="white" fillOpacity="0.5" />
    </svg>
  );
};
