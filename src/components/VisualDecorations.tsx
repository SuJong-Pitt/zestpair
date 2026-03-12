"use client";

import { useEffect, useState } from "react";

const DECORATIONS = [
  { emoji: "💊", size: 40, x: "10%", y: "15%", duration: 6, delay: 0 },
  { emoji: "🌿", size: 30, x: "85%", y: "20%", duration: 8, delay: 1 },
  { emoji: "🍊", size: 35, x: "75%", y: "60%", duration: 7, delay: 2 },
  { emoji: "🧬", size: 25, x: "15%", y: "70%", duration: 9, delay: 0.5 },
  { emoji: "✨", size: 20, x: "50%", y: "10%", duration: 5, delay: 3 },
  { emoji: "🧬", size: 15, x: "90%", y: "40%", duration: 10, delay: 1.5 },
];

export default function VisualDecorations() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Interactive Mouse Glow */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[100px] transition-transform duration-1000 ease-out"
        style={{
          left: mousePos.x - 250,
          top: mousePos.y - 250,
        }}
      />

      {DECORATIONS.map((item, i) => (
        <div
          key={i}
          className="absolute opacity-20 filter grayscale-[0.5] contrast-125 select-none"
          style={{
            left: item.x,
            top: item.y,
            fontSize: item.size,
          }}
        >
          <div 
            className="animate-float" 
            style={{ 
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`
            }}
          >
            {item.emoji}
          </div>
        </div>
      ))}
      
      {/* Soft Glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
    </div>
  );
}
