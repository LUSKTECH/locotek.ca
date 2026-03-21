"use client";

import { useEffect, useRef, useCallback } from "react";

interface Props {
  radius?: number;
  fillSpeed?: number;
}

export default function FogInteraction({ radius = 80, fillSpeed = 0.02 }: Readonly<Props>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: -999, y: -999, active: false });
  const spotsRef = useRef<{ x: number; y: number; opacity: number }[]>([]);
  const rafRef = useRef(0);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  }, []);

  const handlePointerLeave = useCallback(() => {
    pointerRef.current.active = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      canvas.width = p.clientWidth;
      canvas.height = p.clientHeight;
    };
    resize();
    globalThis.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spotsRef.current = spotsRef.current.filter((s) => {
        s.opacity -= fillSpeed;
        return s.opacity > 0.01;
      });

      if (pointerRef.current.active) {
        spotsRef.current.push({
          x: pointerRef.current.x,
          y: pointerRef.current.y,
          opacity: 1,
        });
        if (spotsRef.current.length > 80) spotsRef.current.shift();
      }

      for (const spot of spotsRef.current) {
        const r = radius * (0.4 + 0.6 * spot.opacity);
        const g = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, r);
        g.addColorStop(0, `rgba(0,0,0,${spot.opacity * 0.55})`);
        g.addColorStop(0.5, `rgba(0,0,0,${spot.opacity * 0.25})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      globalThis.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [radius, fillSpeed, handlePointerMove, handlePointerLeave]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "auto",
      }}
    />
  );
}
