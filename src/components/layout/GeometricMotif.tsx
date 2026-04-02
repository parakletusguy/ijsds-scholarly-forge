import React from 'react';

export const HalfCircle = ({ className = "" }: { className?: string }) => (
  <div 
    className={`bg-secondary/10 geometric-mask-half-circle ${className}`}
    style={{ clipPath: 'circle(50% at 50% 100%)' }}
  />
);

export const Triangle = ({ className = "" }: { className?: string }) => (
  <div 
    className={`bg-primary/10 geometric-mask-triangle ${className}`}
    style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
  />
);

export const AfroPattern = ({ className = "" }: { className?: string }) => (
  <div 
    className={`opacity-10 pointer-events-none ${className}`}
    style={{ 
      backgroundImage: 'url("/src/images/textures/pattern_motif.png")',
      backgroundSize: '300px',
      backgroundRepeat: 'repeat'
    }}
  />
);

export const VibrantMotif = ({ className = "" }: { className?: string }) => (
  <div 
    className={`pointer-events-none ${className}`}
    style={{ 
      backgroundImage: 'url("/src/images/textures/vibrant_motif.png")',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    }}
  />
);
