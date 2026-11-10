import React from 'react';

export default function TechLogo({ className = '' }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/0000/svg" 
      viewBox="0 0 96 96" 
      className={className}
      fill="none"
    >
      {/* Hexagon Base */}
      <path 
        d="M48 6L84.373 27V69L48 90L11.627 69V27L48 6Z" 
        stroke="currentColor" 
        strokeWidth="4"
        strokeLinejoin="round"
      />
      
      {/* Inner Geometric S */}
      <path 
        d="M64 32L48 24L32 32V44L64 52V64L48 72L32 64" 
        stroke="#E65100" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Circuit lines connecting to hexagon */}
      <path d="M48 6V24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M48 72V90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M11.627 27L32 32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M84.373 69L64 64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      
      {/* Nodes */}
      <circle cx="64" cy="32" r="5" fill="currentColor" />
      <circle cx="32" cy="64" r="5" fill="currentColor" />
    </svg>
  );
}
