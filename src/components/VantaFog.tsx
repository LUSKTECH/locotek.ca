"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function VantaFog() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadVanta = async () => {
      try {
        const FOG = (await import("vanta/dist/vanta.fog.min")).default;
        
        if (containerRef.current && !vantaEffect) {
          const effect = FOG({
            el: containerRef.current,
            THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            highlightColor: 0xffffff,
            midtoneColor: 0xcccccc,
            lowlightColor: 0x888888,
            baseColor: 0x000000,
            blurFactor: 0.6,
            speed: 1.5,
            zoom: 1,
          });
          setVantaEffect(effect);
        }
      } catch (error) {
        console.error("Failed to load Vanta fog:", error);
      }
    };

    loadVanta();

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}
