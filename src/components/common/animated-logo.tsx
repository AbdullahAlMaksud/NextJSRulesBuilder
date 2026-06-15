"use client";

import { useEffect, useRef } from "react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
  /** Play animation on mount */
  animate?: boolean;
  /** Replay animation on hover */
  hoverReplay?: boolean;
  color?: string;
  accentColor?: string;
}

export default function AnimatedLogo({
  size = 32,
  className = "",
  animate = true,
  hoverReplay = true,
  color = "#6366F1",
  accentColor = "#818CF8",
}: AnimatedLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animatingRef = useRef(false);

  // All paths with their total lengths (precomputed from the SVG)
  // We animate them sequentially: brackets first, then hexagon outline, then center dot
  const playAnimation = () => {
    if (animatingRef.current) return;
    const svg = svgRef.current;
    if (!svg) return;

    animatingRef.current = true;

    const paths = svg.querySelectorAll<SVGPathElement>("path[data-anim]");

    paths.forEach((path) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      path.style.transition = "none";
      path.style.opacity = "1";
      // Fill starts transparent
      path.style.fillOpacity = "0";
    });

    // Force reflow
    svg.getBoundingClientRect();

    const delays: Record<string, number> = {
      "bracket-left":  0,
      "bracket-right": 120,
      "hex-outline":   280,
      "center-dot":    520,
    };
    const durations: Record<string, number> = {
      "bracket-left":  420,
      "bracket-right": 420,
      "hex-outline":   480,
      "center-dot":    220,
    };

    paths.forEach((path) => {
      const key = path.getAttribute("data-anim") ?? "";
      const delay    = delays[key]    ?? 0;
      const duration = durations[key] ?? 400;

      setTimeout(() => {
        path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.4,0,0.2,1), fill-opacity ${duration * 0.6}ms ease ${duration * 0.4}ms`;
        path.style.strokeDashoffset = "0";

        setTimeout(() => {
          path.style.fillOpacity = "1";
        }, duration * 0.5);

      }, delay);
    });

    setTimeout(() => {
      animatingRef.current = false;
    }, 900);
  };

  // Play on mount
  useEffect(() => {
    if (!animate) {
      // Just show static immediately
      const svg = svgRef.current;
      if (!svg) return;
      svg.querySelectorAll<SVGPathElement>("path[data-anim]").forEach((p) => {
        p.style.strokeDasharray  = "none";
        p.style.strokeDashoffset = "0";
        p.style.fillOpacity      = "1";
        p.style.opacity          = "1";
      });
      return;
    }
    // Small delay so the DOM is fully painted
    const t = setTimeout(playAnimation, 80);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  const handleMouseEnter = () => {
    if (hoverReplay) playAnimation();
  };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 430.666 430.666"
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      style={{ overflow: "visible" }}
    >
      {/* ── Left bracket ── */}
      <path
        data-anim="bracket-left"
        d="M5.4,208.433c-2.987,0-5.4,2.413-5.4,5.4c0,2.984,2.413,5.399,5.4,5.399
           c6.281,0,11.232,2.025,15.135,6.191c11.401,12.176,9.867,37.731,9.84,38.359v68.85
           c0,17.345,4.817,30.718,14.304,39.73c11.388,10.82,25.763,11.58,29.586,11.58
           c0.53,0,0.854-0.016,0.939-0.016c2.982-0.153,5.271-2.695,5.115-5.675
           c-0.156-2.989-2.742-5.3-5.677-5.115c-0.14,0.059-12.877,0.564-22.528-8.605
           c-7.267-6.898-10.94-17.63-10.94-31.899l-0.01-68.486
           c0.087-1.239,1.88-30.47-12.722-46.079c-1.508-1.614-3.138-3.027-4.865-4.234
           c1.727-1.208,3.356-2.621,4.865-4.235c14.602-15.623,12.809-44.848,12.732-45.715
           v-68.85c0-14.209,3.649-24.907,10.853-31.812c9.542-9.146,22.454-8.717,22.644-8.693
           c2.974,0.182,5.492-2.144,5.648-5.115c0.145-2.979-2.138-5.513-5.115-5.674
           c-0.744,0.01-17.55-0.757-30.515,11.567c-9.497,9.018-14.304,22.386-14.304,39.727
           l0.01,69.211c0.485,7.116-0.345,27.82-9.833,37.971C16.643,206.402,11.691,208.433,5.4,208.433z"
        fill={color}
        fillOpacity="0"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0 }}
      />

      {/* ── Right bracket ── */}
      <path
        data-anim="bracket-right"
        d="M425.261,211.434c-6.286,0-11.232-2.025-15.135-6.188
           c-11.401-12.177-9.872-37.739-9.841-38.362v-68.85
           c0-17.344-4.83-30.715-14.312-39.728c-12.957-12.316-29.811-11.572-30.507-11.567
           c-2.99,0.158-5.279,2.695-5.115,5.677c0.158,2.979,2.689,5.271,5.68,5.113
           c0.142-0.048,12.877-0.562,22.527,8.608c7.277,6.896,10.933,17.629,10.933,31.896
           l0.01,68.489c-0.089,1.236-1.882,30.462,12.726,46.076
           c1.508,1.619,3.132,3.027,4.872,4.224c-1.74,1.224-3.364,2.621-4.872,4.24
           c-14.607,15.631-12.814,44.851-12.735,45.71v68.851
           c0,14.212-3.649,24.906-10.854,31.825c-9.55,9.128-22.485,8.686-22.633,8.686
           c-2.874-0.158-5.495,2.141-5.653,5.109c-0.143,2.979,2.136,5.517,5.115,5.68
           c0.095,0,0.406,0.011,0.938,0.011c3.808,0,18.183-0.76,29.589-11.581
           c9.503-9.018,14.297-22.391,14.297-39.729l-0.011-69.198
           c-0.485-7.119,0.343-27.823,9.835-37.974c3.907-4.172,8.864-6.197,15.15-6.197
           c3.001,0,5.4-2.415,5.4-5.399C430.66,213.859,428.245,211.434,425.261,211.434z"
        fill={color}
        fillOpacity="0"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0 }}
      />

      {/* ── Hexagon outline ── */}
      <path
        data-anim="hex-outline"
        d="M272.088,122.085c-0.97-1.674-2.752-2.7-4.672-2.7H164.587
           c-1.922,0-3.715,1.025-4.673,2.7l-51.413,89.047c-0.965,1.682-0.965,3.723,0,5.4
           l51.413,89.047c0.968,1.677,2.75,2.7,4.673,2.7h102.829c1.92,0,3.713-1.023,4.672-2.7
           l51.416-89.047c0.96-1.678,0.96-3.719,0-5.4L272.088,122.085z
           M216,261.083c-26.056,0-47.25-21.194-47.25-47.25c0-26.057,21.194-47.25,47.25-47.25
           c26.051,0,47.25,21.193,47.25,47.25C263.25,239.889,242.062,261.083,216,261.083z"
        fill={color}
        fillOpacity="0"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fillRule="evenodd"
        style={{ opacity: 0 }}
      />

      {/* ── Center dot ── */}
      <path
        data-anim="center-dot"
        d="M216,177.383c-20.11,0-36.45,16.351-36.45,36.45
           c0,20.103,16.345,36.45,36.45,36.45c20.103,0,36.45-16.348,36.45-36.45
           C252.45,193.733,236.103,177.383,216,177.383z"
        fill={accentColor}
        fillOpacity="0"
        stroke={accentColor}
        strokeWidth="2"
        style={{ opacity: 0 }}
      />
    </svg>
  );
}
