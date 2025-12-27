
import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  isActive: boolean;
  color?: string;
}

const Waveform: React.FC<WaveformProps> = ({ isActive, color = '#3b82f6' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bars = 20;
    const barWidth = 4;
    const gap = 4;
    const heights = new Array(bars).fill(2);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      for (let i = 0; i < bars; i++) {
        if (isActive) {
          // Randomly fluctuate heights when active
          heights[i] = Math.max(4, Math.random() * 30);
        } else {
          // Smooth transition to idle
          heights[i] = Math.max(2, heights[i] * 0.9);
        }

        const x = i * (barWidth + gap);
        const y = (canvas.height - heights[i]) / 2;
        ctx.fillRect(x, y, barWidth, heights[i]);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isActive, color]);

  return (
    <div className="flex items-center justify-center h-12">
      <canvas ref={canvasRef} width={160} height={40} className="rounded" />
    </div>
  );
};

export default Waveform;
