import { Suspense, useCallback, useMemo, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";

import BgLight from "../../../assets/images/bg2.png";
import BgDark from "../../../assets/images/bg2_dark.png";
import TitleGif from "../../../assets/images/title.gif";

type LandingPageProps = {
  onEnter: () => void;
};

type Sparkle = {
  id: number;
  x: number;
  y: number;
  created: number;
};

const MODEL_PATH = "/desktop_design_cute/scene.gltf";

type DesktopModelProps = {
  onMoonToggle: () => void;
};

const DesktopModel = ({ onMoonToggle }: DesktopModelProps) => {
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const hitName = event.object?.name?.toLowerCase();
      if (hitName?.includes("moon")) {
        event.stopPropagation();
        onMoonToggle();
      }
    },
    [onMoonToggle]
  );

  return (
    <primitive
      object={clonedScene}
      scale={3.15}
      position={[0, -2.65, 0]}
      onPointerDown={handlePointerDown}
    />
  );
};

useGLTF.preload(MODEL_PATH);

const LandingPage = ({ onEnter }: LandingPageProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const handleMoonToggle = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const timestamp = Date.now();

    setSparkles((prev) => {
      const alive = prev.filter((sparkle) => timestamp - sparkle.created < 550);
      const next = [...alive, { id: timestamp + Math.random(), x, y, created: timestamp }];
      return next.slice(-20);
    });
  };

  const handlePointerLeave = () => {
    setSparkles([]);
  };

  const currentBackground = isDarkMode ? BgDark : BgLight;
  const lightConfig = isDarkMode
    ? {
        hemisphere: { sky: "#f8e8ff", ground: "#f0ebff", intensity: 0.35 },
        ambient: { intensity: 0.85, color: "#f5ecff" },
        key: { position: [3, 5.5, 4] as [number, number, number], intensity: 1.1, color: "#f3d9ff" },
        fill: { position: [-2.5, 3, 2] as [number, number, number], intensity: 0.6, color: "#d6e5ff" },
      }
    : {
        hemisphere: { sky: "#ffeefe", ground: "#f3e6ff", intensity: 0.6 },
        ambient: { intensity: 1.15, color: "#fff4ff" },
        key: { position: [3, 6.6, 4] as [number, number, number], intensity: 1.75, color: "#ffe5ff" },
        fill: { position: [-2.3, 3.4, 2.1] as [number, number, number], intensity: 0.95, color: "#e8f5ff" },
      };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#dacaef]">
      <img
        src={currentBackground}
        alt="PseudoScript Studio background"
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable={false}
      />
      <div className={`absolute inset-0 ${isDarkMode ? "bg-[#0c0620]/45" : "bg-white/30"}`} />

      <div
        className="absolute inset-0 z-0"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <Canvas
          camera={{ position: [0, 1.25, 6.8], fov: 30 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          className="h-full w-full cursor-grab active:cursor-grabbing"
        >
          <hemisphereLight
            skyColor={lightConfig.hemisphere.sky}
            groundColor={lightConfig.hemisphere.ground}
            intensity={lightConfig.hemisphere.intensity}
          />
          <ambientLight intensity={lightConfig.ambient.intensity} color={lightConfig.ambient.color} />
          <directionalLight
            position={lightConfig.key.position}
            intensity={lightConfig.key.intensity}
            color={lightConfig.key.color}
            castShadow
          />
          <directionalLight
            position={lightConfig.fill.position}
            intensity={lightConfig.fill.intensity}
            color={lightConfig.fill.color}
          />
          <Suspense fallback={null}>
            <DesktopModel onMoonToggle={handleMoonToggle} />
            <Html
              transform
              position={[0.1, 1.22, -0.45]}
              distanceFactor={2.35}
              className="pointer-events-none select-none"
            >
              <div className="rounded-2xl border border-white/35 bg-black/75 px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-[0_0_25px_rgba(255,255,255,0.2)] animate-[pulse_1.6s_ease-in-out_infinite]">
                Press [space]
                <div className="text-[0.85em] tracking-[0.35em]">to access computer</div>
              </div>
            </Html>
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            target={[0, 1.5, 0]}
            maxPolarAngle={Math.PI / 1.95}
            minPolarAngle={Math.PI / 4.4}
          />
        </Canvas>

        {sparkles.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-20">
            {sparkles.map((sparkle) => (
              <span
                key={sparkle.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: sparkle.x, top: sparkle.y }}
              >
                <span className="relative block h-3 w-3">
                  <span className="absolute inset-0 rounded-full bg-white/85 opacity-90" />
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ffe6ff] via-white to-[#ffd6ff] blur-[2px] animate-ping" />
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between py-8 px-4 pointer-events-none">
        <img
          src={TitleGif}
          alt="PseudoScript Studio"
          className="w-full max-w-4xl select-none drop-shadow-[0_8px_15px_rgba(82,57,123,0.35)]"
          draggable={false}
        />

        <div className="text-xs font-semibold tracking-wide text-white/85 bg-black/45 px-5 py-1.5 rounded-full">
          Drag vertically to tilt the desktop • Click the moon to toggle day/night mode
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
