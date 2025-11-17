import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HeroSnowAnimation = () => {
  const [heroSnowflakes, setHeroSnowflakes] = useState<Array<{ id: number; left: number; animationDuration: number; animationDelay: number; size: number }>>([]);

  useEffect(() => {
    const generateHeroSnowflakes = () => {
      const flakes = [];
      for (let i = 0; i < 30; i++) {
        flakes.push({
          id: i,
          left: Math.random() * 100,
          animationDuration: Math.random() * 8 + 8, // 8-16 seconds
          animationDelay: Math.random() * 5, // 0-5 seconds delay
          size: Math.random() * 20 + 10, // 10-30px
        });
      }
      setHeroSnowflakes(flakes);
    };

    generateHeroSnowflakes();
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {heroSnowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-hero-snowfall opacity-60"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
            fontSize: `${flake.size}px`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

const Hero = () => {
  return (
    <section className="relative h-[80vh] bg-wood-brown text-white flex items-center justify-center overflow-hidden">
      <HeroSnowAnimation />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
      <div className="relative z-10 text-center p-4 mt-16">
        <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Your Space, Your Style</h1>
        <p className="text-lg md:text-xl text-wood-light mb-8 drop-shadow-md">Find the perfect furniture to complete your home</p>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="Search for sofas, tables, chairs..."
              className="w-full py-4 px-6 border rounded-full bg-white text-gray-800 focus:outline-none focus:ring-4 focus:ring-wood-accent focus:ring-opacity-50 shadow-lg"
            />
            <button className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-wood-accent text-white rounded-full p-2 hover:bg-wood-accent-hover transition duration-300 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-8">
            <Link to="/products" className="bg-wood-accent text-white font-bold py-3 px-8 rounded-full hover:bg-wood-accent-hover transition duration-300 transform hover:scale-105 shadow-lg inline-block">
                Explore All Products
            </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
