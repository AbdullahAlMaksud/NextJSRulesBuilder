"use client";

import { useEffect, useRef } from "react";

import { useTheme, type Theme } from "@/shared/hooks/use-theme";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
}

function withAlpha(hex: string, alpha: string) {
  if (!hex.startsWith("#")) return hex;
  return `${hex}${alpha}`;
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, theme: Theme) {
  // Fill solid background (Full white in light mode, theme-specific bg in dark modes)
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Draw clean 20px dot grid background (Matches Aceternity UI style)
  ctx.fillStyle = theme.id === "light" ? "#d4d4d4" : "rgba(255, 255, 255, 0.08)";
  const grid = 20;
  for (let x = 10; x < width; x += grid) {
    for (let y = 10; y < height; y += grid) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(theme);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const onMouseMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
      if (particlesRef.current.length > 70) particlesRef.current.splice(0, 10);
      particlesRef.current.push({
        x: event.clientX + (Math.random() - 0.5) * 12,
        y: event.clientY + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.15 - Math.random() * 0.25,
        life: 1,
        radius: 1.2 + Math.random() * 1.5,
      });
    };

    const draw = () => {
      rafRef.current = window.requestAnimationFrame(draw);
      const currentTheme = themeRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mouse = mouseRef.current;

      // Draw dot grid
      drawBackground(ctx, width, height, currentTheme);

      // Draw Cursor Glow Follower
      if (mouse.x > -100) {
        const glowRadius = currentTheme.id === "light" ? 140 : 180;
        const cursorGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius);
        cursorGlow.addColorStop(0, withAlpha(currentTheme.accent, currentTheme.id === "light" ? "18" : "22"));
        cursorGlow.addColorStop(0.4, withAlpha(currentTheme.accent, "06"));
        cursorGlow.addColorStop(1, withAlpha(currentTheme.accent, "00"));
        ctx.fillStyle = cursorGlow;
        ctx.fillRect(mouse.x - glowRadius, mouse.y - glowRadius, glowRadius * 2, glowRadius * 2);

        // Subtly animate an outer ring
        ctx.save();
        ctx.globalAlpha = currentTheme.id === "light" ? 0.3 : 0.45;
        ctx.strokeStyle = currentTheme.accent;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 10 + Math.sin(Date.now() / 200) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Particle Trails
      particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0.02);
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.vy -= 0.003;

        ctx.globalAlpha = particle.life * 0.6;
        ctx.fillStyle = currentTheme.accent;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * particle.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    draw();

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />;
}
