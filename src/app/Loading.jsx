'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15 + 5);
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between p-12 bg-black text-white z-[99999] select-none">
      <div className="w-full flex items-center justify-between text-xs font-mono text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>INITIALIZING SYSTEM</span>
        </div>
        <span>PIXELIX // 2026</span>
      </div>

      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl border border-white/20 bg-neutral-950 flex items-center justify-center font-mono text-2xl font-bold tracking-tighter">
          P
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
          PIXELIX
        </h1>
        <p className="font-mono text-xs text-neutral-400 tracking-widest uppercase">
          FRONTEND ARCHITECTURE & CREATIVE DEV
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>LOADING ASSETS</span>
          <span>{Math.min(100, progress)}%</span>
        </div>
        <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-white transition-all duration-150 ease-out"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
