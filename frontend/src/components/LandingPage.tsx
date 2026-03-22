import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

import BgLight from "../../../assets/images/bg2.png";
import BgDark from "../../../assets/images/bg2_dark.png";
import TitleGif from "../../../assets/images/title.gif";

type LandingPageProps = {
  onEnter: () => void;
};

const MODEL_PATH = "/desktop_design_cute/scene.gltf";

const DesktopModel = () => {
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return <primitive object={clonedScene} scale={3.15} position={[0, -2.65, 0]} />;
};

useGLTF.preload(MODEL_PATH);

const LandingPage = ({ onEnter }: LandingPageProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentBackground = isDarkMode ? BgDark : BgLight;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#dacaef]">
      <img
        src={currentBackground}
        alt="PseudoScript Studio background"
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable={false}
      />
      <div className={`absolute inset-0 ${isDarkMode ? "bg-[#0c0620]/45" : "bg-white/30"}`} />

      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 1.25, 6.8], fov: 30 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          onDoubleClick={onEnter}
        >
          <ambientLight intensity={0.85} />
          <directionalLight position={[4, 6, 4]} intensity={1.2} castShadow />
          <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#ffd6ff" />
          <Suspense fallback={null}>
            <DesktopModel />
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
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between py-8 px-4 pointer-events-none">
        <img
          src={TitleGif}
          alt="PseudoScript Studio"
          className="w-full max-w-4xl select-none drop-shadow-[0_8px_15px_rgba(82,57,123,0.35)]"
          draggable={false}
        />

        <div className="text-xs font-semibold tracking-wide text-white/85 bg-black/45 px-5 py-1.5 rounded-full">
          Drag vertically to tilt the desktop • double-click or press space to enter
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
