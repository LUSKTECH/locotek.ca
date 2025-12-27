declare module "vanta/dist/vanta.fog.min" {
  interface VantaFogOptions {
    el: HTMLElement;
    THREE: typeof import("three");
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    highlightColor?: number;
    midtoneColor?: number;
    lowlightColor?: number;
    baseColor?: number;
    blurFactor?: number;
    speed?: number;
    zoom?: number;
  }

  interface VantaEffect {
    destroy: () => void;
  }

  export default function FOG(options: VantaFogOptions): VantaEffect;
}

declare module "vanta/dist/vanta.clouds.min" {
  interface VantaCloudsOptions {
    el: HTMLElement;
    THREE: typeof import("three");
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    backgroundColor?: number;
    skyColor?: number;
    cloudColor?: number;
    cloudShadowColor?: number;
    sunColor?: number;
    sunGlareColor?: number;
    sunlightColor?: number;
    speed?: number;
  }

  interface VantaEffect {
    destroy: () => void;
  }

  export default function CLOUDS(options: VantaCloudsOptions): VantaEffect;
}
