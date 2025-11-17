import { useEffect, useState } from 'react';

const SnowAnimation = () => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; animationDuration: number; animationDelay: number }>>([]);

  useEffect(() => {
    const generateSnowflakes = () => {
      const flakes = [];
      for (let i = 0; i < 50; i++) {
        flakes.push({
          id: i,
          left: Math.random() * 100,
          animationDuration: Math.random() * 10 + 10, // 10-20 seconds
          animationDelay: Math.random() * 10, // 0-10 seconds delay
        });
      }
      setSnowflakes(flakes);
    };

    generateSnowflakes();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-snowfall"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
          }}
        >
          <div className="text-white text-opacity-80">
            ❄
          </div>
        </div>
      ))}
    </div>
  );
};

export default SnowAnimation;