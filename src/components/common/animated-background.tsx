"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "../store/themeStore";

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
  targetAlpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  color: string;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const orbsRef = useRef<Orb[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init orbs
    const initOrbs = () => {
      const t = themeRef.current;
      orbsRef.current = Array.from({ length: 4 }, (_, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 200 + Math.random() * 250,
        color: t.orbColors[i % t.orbColors.length],
        alpha: 0.6 + Math.random() * 0.4,
        targetAlpha: 0.6 + Math.random() * 0.4,
      }));
    };
    initOrbs();

    // Mouse move
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Spawn particles on move
      if (Math.random() > 0.7) {
        const t = themeRef.current;
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.3 - Math.random() * 0.5,
          life: 1,
          maxLife: 60 + Math.random() * 60,
          r: 1.5 + Math.random() * 2,
          color: t.accent,
        });
        if (particlesRef.current.length > 80) {
          particlesRef.current.splice(0, 10);
        }
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const t = themeRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, W, H);

      // Orbs
      orbsRef.current.forEach((orb, i) => {
        // Update color when theme changes
        orb.color = t.orbColors[i % t.orbColors.length];

        // Move
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Mouse attraction (subtle)
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const dx = mx - orb.x;
        const dy = my - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 400) {
          orb.vx += dx * 0.00003;
          orb.vy += dy * 0.00003;
        }

        // Speed limit
        const speed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy);
        if (speed > 0.6) { orb.vx *= 0.98; orb.vy *= 0.98; }

        // Bounce
        if (orb.x < -orb.r) orb.x = W + orb.r;
        if (orb.x > W + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = H + orb.r;
        if (orb.y > H + orb.r) orb.y = -orb.r;

        // Alpha pulse
        orb.alpha += (orb.targetAlpha - orb.alpha) * 0.02;
        if (Math.abs(orb.alpha - orb.targetAlpha) < 0.01) {
          orb.targetAlpha = 0.4 + Math.random() * 0.6;
        }

        // Draw
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        const hex = orb.color.slice(0, 7);
        grad.addColorStop(0, hex + "50");
        grad.addColorStop(0.5, hex + "25");
        grad.addColorStop(1, hex + "00");
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Grid dots (subtle)
      const gridSize = 60;
      const dotR = 0.8;
      ctx.fillStyle = t.accent + "20";
      for (let x = gridSize / 2; x < W; x += gridSize) {
        for (let y = gridSize / 2; y < H; y += gridSize) {
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          const d = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
          const scale = d < 180 ? 1 + (1 - d / 180) * 2.5 : 1;
          const alpha = d < 180 ? 0.15 + (1 - d / 180) * 0.4 : 0.12;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(x, y, dotR * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Particles
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.01;
        p.life -= 1 / p.maxLife;
        const a = Math.max(0, p.life);
        ctx.globalAlpha = a * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
