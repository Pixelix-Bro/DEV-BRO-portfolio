'use client';

import { useEffect, useRef } from 'react';

export default function LoadingScreen() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;

    const particles = [];
    let animationFrameId;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      draw() {
        ctx.fillStyle = `rgba(124, 58, 237, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
    }

    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center
                    bg-gradient-to-br from-slate-950 via-slate-900 to-black z-50">
      <div className="text-center">
        {/* Canvas animation */}
        <canvas ref={canvasRef} className="mx-auto mb-6"></canvas>

        {/* Logo */}
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600
                        flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">P</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Pixelix
        </h1>

        {/* Text */}
        <p className="text-gray-400 text-sm animate-pulse">
          Loading amazing content...
        </p>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-gray-700 rounded-full mt-6 mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600
                          rounded-full w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
