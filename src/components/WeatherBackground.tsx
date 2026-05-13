import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WeatherBackgroundProps {
  condition: string;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition }) => {
  const [particles, setParticles] = useState<{ id: number; left: string; delay: string; duration: string; size: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isRain = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle');
    const isSnow = condition.toLowerCase().includes('snow');
    const isThunder = condition.toLowerCase().includes('thunder');

    if (isRain || isSnow) {
      const count = isRain ? 60 : 40;
      const newParticles = Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: isRain ? `${0.5 + Math.random() * 0.5}s` : `${5 + Math.random() * 5}s`,
        size: isRain ? '1px' : `${2 + Math.random() * 4}px`,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [condition]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-deep-space">
      {/* Dynamic atmospheric gradients */}
      <AnimatePresence mode="wait">
        <motion.div
          key={condition}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{
            background: getAtmosphericGradient(condition)
          }}
        />
      </AnimatePresence>

      {/* Weather particles */}
      {(condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle')) && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="weather-particle bg-blue-300/40"
              style={{
                left: p.left,
                width: '1px',
                height: '20px',
                top: '-20px',
                animation: `rain ${p.duration} linear infinite`,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>
      )}

      {condition.toLowerCase().includes('snow') && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="weather-particle bg-white/60 blur-[1px]"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                top: '-10px',
                animation: `snow ${p.duration} linear infinite`,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>
      )}

      {condition.toLowerCase().includes('thunder') && (
        <div className="thunder-overlay" />
      )}

      {/* Fog effect */}
      {condition.toLowerCase().includes('fog') && (
        <div className="absolute inset-0 bg-slate-500/20 backdrop-blur-md" />
      )}
      
      {/* Digital "scanning" line artifact for futuristic feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,242,255,0.02)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.01),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
    </div>
  );
};

function getAtmosphericGradient(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes('clear')) {
    return 'radial-gradient(circle at 50% -20%, #0ea5e9 0%, transparent 60%), radial-gradient(circle at 100% 100%, #3b82f6 0%, transparent 50%)';
  }
  if (c.includes('cloud')) {
    return 'radial-gradient(circle at 50% -20%, #64748b 0%, transparent 60%), radial-gradient(circle at 10% 80%, #334155 0%, transparent 50%)';
  }
  if (c.includes('rain') || c.includes('drizzle')) {
    return 'radial-gradient(circle at 50% -20%, #1e293b 0%, transparent 80%), radial-gradient(circle at 80% 90%, #0f172a 0%, transparent 40%)';
  }
  if (c.includes('snow')) {
    return 'radial-gradient(circle at 50% -20%, #f8fafc 0%, transparent 100%), radial-gradient(circle at 0% 100%, #cbd5e1 0%, transparent 50%)';
  }
  if (c.includes('thunder')) {
    return 'radial-gradient(circle at 50% -20%, #4c1d95 0%, transparent 100%), radial-gradient(circle at 90% 10%, #020617 0%, transparent 30%)';
  }
  return 'radial-gradient(circle at 50% -20%, #0f172a 0%, transparent 80%)';
}
