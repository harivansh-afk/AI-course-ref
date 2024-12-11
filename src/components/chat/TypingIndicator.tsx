import React from 'react';
import { cn } from '../../lib/utils';

export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 rounded-full bg-purple-500/40",
              "animate-bounce",
              i === 0 && "animation-delay-0",
              i === 1 && "animation-delay-150",
              i === 2 && "animation-delay-300"
            )}
          />
        ))}
      </div>
    </div>
  );
};
