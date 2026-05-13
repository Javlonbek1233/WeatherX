import React, { useEffect, useRef } from 'react';

interface RadarMapProps {
  conditionCode: number;
}

export const RadarMap: React.FC<RadarMapProps> = ({ conditionCode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    
    // Fake "radar pulses"
    const pulses: { x: number; y: number; r: number; opacity: number; color: string }[] = [];

    const isBadWeather = conditionCode > 50;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) - 10;

      // Axes and grid
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let r = radius / 4; r <= radius; r += radius / 4) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Satellite Noise Effect
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = 'rgba(0, 242, 255, 0.05)';
        ctx.fillRect(x, y, 1, 1);
      }

      // Scan line
      angle += 0.02;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const gradient = ctx.createLinearGradient(0, 0, radius, 0);
      gradient.addColorStop(0, 'rgba(0, 242, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 242, 255, 0.4)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, -0.2, 0);
      ctx.fill();
      ctx.restore();

      // Pulse logic for weather "anomalies"
      if (isBadWeather && Math.random() > 0.95) {
        pulses.push({
          x: cx + (Math.random() - 0.5) * radius * 1.5,
          y: cy + (Math.random() - 0.5) * radius * 1.5,
          r: 5,
          opacity: 0.8,
          color: conditionCode > 90 ? '#bc13fe' : '#00f2ff'
        });
      }

      ctx.save();
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 0.5;
        p.opacity -= 0.01;
        if (p.opacity <= 0) {
          pulses.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [conditionCode]);

  return (
    <div className="relative aspect-square w-full">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="w-full h-full"
      />
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-neon-blue/80">Satellite Live</span>
      </div>
    </div>
  );
};
