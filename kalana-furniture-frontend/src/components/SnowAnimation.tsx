import { useEffect, useState } from 'react';

interface SnowAnimationProps {
  containerClass?: string;
  numFlakes?: number;
  minDuration?: number;
  maxDuration?: number;
  minDelay?: number;
  maxDelay?: number;
  minSize?: number;
  maxSize?: number;
  opacity?: number;
}

const SnowAnimation = ({
  containerClass = "fixed inset-0 pointer-events-none z-0",
  numFlakes = 50,
  minDuration = 10,
  maxDuration = 20,
  minDelay = 0,
  maxDelay = 10,
  minSize = 10,
  maxSize = 20,
  opacity = 0.8
}: SnowAnimationProps) => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; animationDuration: number; animationDelay: number; size: number }>>([]);

  useEffect(() => {
    const generateSnowflakes = () => {
      const flakes = [];
      for (let i = 0; i < numFlakes; i++) {
        flakes.push({
          id: i,
          left: Math.random() * 100,
          animationDuration: Math.random() * (maxDuration - minDuration) + minDuration,
          animationDelay: Math.random() * (maxDelay - minDelay) + minDelay,
          size: Math.random() * (maxSize - minSize) + minSize,
        });
      }
      setSnowflakes(flakes);
    };

    generateSnowflakes();
  }, [numFlakes, minDuration, maxDuration, minDelay, maxDelay, minSize, maxSize]);

  return (
    <div className={containerClass}>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-snowfall text-white"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
            fontSize: `${flake.size}px`,
            opacity: opacity,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

export default SnowAnimation;