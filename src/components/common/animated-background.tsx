"use client";

import { useEffect, useRef } from "react";

import { useTheme, type Theme } from "@/shared/hooks/use-theme";

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

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
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  const topGlow = ctx.createRadialGradient(width * 0.5, 0, 0, width * 0.5, 0, height * 0.65);
  topGlow.addColorStop(0, withAlpha(theme.accent, "22"));
  topGlow.addColorStop(0.45, withAlpha(theme.accent, "08"));
  topGlow.addColorStop(1, "transparent");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = theme.id === "light" ? 0.28 : 0.42;
  ctx.fillStyle = theme.accent;
  const grid = 96;
  for (let x = 48; x < width; x += grid) {
    for (let y = 48; y < height; y += grid) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = theme.wave;
  [
    { x: -width * 0.06, y: height * 0.2, w: width * 1.08, h: height * 0.28 },
    { x: width * 0.12, y: height * 0.38, w: width * 1.05, h: height * 0.3 },
    { x: -width * 0.14, y: height * 0.68, w: width * 1.2, h: height * 0.34 },
  ].forEach((wave, index) => {
    ctx.save();
    ctx.globalAlpha = index === 0 ? 0.32 : 0.25;
    ctx.filter = "blur(44px)";
    ctx.beginPath();
    ctx.ellipse(wave.x + wave.w / 2, wave.y + wave.h / 2, wave.w / 2, wave.h / 2, index * -0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(theme);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const orbsRef = useRef<Orb[]>([]);
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

      orbsRef.current = Array.from({ length: 5 }, (_, index) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.28,
        radius: 180 + index * 50 + Math.random() * 120,
        alpha: 0.28 + Math.random() * 0.18,
      }));
    };

    const onMouseMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
      if (particlesRef.current.length > 95) particlesRef.current.splice(0, 16);
      particlesRef.current.push({
        x: event.clientX + (Math.random() - 0.5) * 16,
        y: event.clientY + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 0.42,
        vy: -0.2 - Math.random() * 0.28,
        life: 1,
        radius: 1.4 + Math.random() * 1.8,
      });
    };

    const draw = () => {
      rafRef.current = window.requestAnimationFrame(draw);
      const currentTheme = themeRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mouse = mouseRef.current;

      drawBackground(ctx, width, height, currentTheme);

      if (mouse.x > -100) {
        const cursorGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 170);
        cursorGlow.addColorStop(0, withAlpha(currentTheme.accent, "26"));
        cursorGlow.addColorStop(0.35, withAlpha(currentTheme.accent, "10"));
        cursorGlow.addColorStop(1, withAlpha(currentTheme.accent, "00"));
        ctx.fillStyle = cursorGlow;
        ctx.fillRect(mouse.x - 170, mouse.y - 170, 340, 340);

        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = currentTheme.accent;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 11 + Math.sin(Date.now() / 180) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      orbsRef.current.forEach((orb, index) => {
        const dx = mouse.x - orb.x;
        const dy = mouse.y - orb.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 420) {
          orb.vx += dx * 0.000018;
          orb.vy += dy * 0.000018;
        }

        orb.x += orb.vx;
        orb.y += orb.vy;
        orb.vx *= 0.996;
        orb.vy *= 0.996;

        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        const color = currentTheme.orbColors[index % currentTheme.orbColors.length];
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, withAlpha(color, "42"));
        gradient.addColorStop(0.54, withAlpha(color, "16"));
        gradient.addColorStop(1, withAlpha(color, "00"));

        ctx.globalAlpha = orb.alpha;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0.02);
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.018;
        particle.vy -= 0.004;

        ctx.globalAlpha = particle.life * 0.72;
        ctx.fillStyle = currentTheme.accent;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * particle.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.15, width / 2, height / 2, width * 0.72);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, currentTheme.id === "light" ? "rgba(237,241,247,0.32)" : "rgba(0,0,0,0.72)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
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
