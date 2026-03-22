import { useEffect, useState } from "react";

const isFinePointer = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(pointer: fine)").matches;
};

type IconProps = {
  active: boolean;
};

const MoonIcon = ({ active }: IconProps) => (
  <svg
    viewBox="0 0 90 90"
    className={`h-10 w-10 -rotate-[18deg] drop-shadow-[0_4px_10px_rgba(78,41,120,0.25)] transition-all ${
      active ? "scale-105" : "scale-100"
    }`}
  >
    <path
      d="M55 5A35 35 0 1 1 55 85 25 25 0 1 0 55 5Z"
      fill="url(#moonGradient)"
    />
    <path
      d="M55 5A35 35 0 1 1 55 85 25 25 0 1 0 55 5Z"
      fill="url(#moonGlow)"
      opacity="0.4"
    />
    <path
      d="M30 40c15-6 24-5 33 2"
      stroke="#bfe9ff"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M30 52c12-4 20-4 27 1"
      stroke="#cfe5ff"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.8"
    />
    <polygon
      points="68,8 73,19 86,20 76,28 79,41 68,34 57,41 60,28 50,20 63,19"
      fill="#fee57a"
    />
    <defs>
      <linearGradient id="moonGradient" x1="20" y1="10" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#c9a8ff" />
        <stop offset="1" stopColor="#7f66ff" />
      </linearGradient>
      <radialGradient id="moonGlow" cx="0.4" cy="0.35" r="0.9">
        <stop stopColor="#fff7ff" stopOpacity="0.9" />
        <stop offset="1" stopColor="#bfaaff" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

const CatIcon = ({ active }: IconProps) => (
  <svg
    viewBox="0 0 120 120"
    className={`h-14 w-14 drop-shadow-[0_8px_16px_rgba(44,9,71,0.35)] transition-all ${
      active ? "translate-y-0.5 scale-95" : "scale-100"
    }`}
  >
    <path
      d="M20 60 L28 25 L48 42 L60 25 L78 42 L92 25 L100 60 L95 97 Q60 115 25 97 Z"
      fill="url(#catFur)"
      stroke="#4a1b70"
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path
      d="M38 68 Q45 74 52 68"
      stroke="#2c0f50"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M68 68 Q75 74 82 68"
      stroke="#2c0f50"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <ellipse cx="50" cy="60" rx="10" ry="12" fill="#1c143a" />
    <ellipse cx="74" cy="60" rx="10" ry="12" fill="#1c143a" />
    <ellipse cx="50" cy="60" rx="6" ry="7" fill="#8ce9ff" />
    <ellipse cx="74" cy="60" rx="6" ry="7" fill="#8ce9ff" />
    <circle cx="62" cy="78" r="4" fill="#2c0f50" />
    <path d="M55 88 Q62 96 69 88" stroke="#2c0f50" strokeWidth="3" strokeLinecap="round" />
    <polygon
      points="62,38 67,52 82,52 70,61 74,76 62,67 50,76 54,61 42,52 57,52"
      fill="#fee57a"
    />
    <circle cx="34" cy="32" r="7" fill="#a47bff" stroke="#4a1b70" strokeWidth="3" />
    <circle cx="88" cy="32" r="7" fill="#a47bff" stroke="#4a1b70" strokeWidth="3" />
    <circle cx="34" cy="32" r="4" fill="#f0d3ff" />
    <circle cx="88" cy="32" r="4" fill="#f0d3ff" />
    <defs>
      <linearGradient id="catFur" x1="10" y1="30" x2="110" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#c3a5ff" />
        <stop offset="1" stopColor="#8d6dff" />
      </linearGradient>
    </defs>
  </svg>
);

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined" || !isFinePointer()) {
      return;
    }
    setEnabled(true);
    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "none";

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        setIsVisible(false);
        return;
      }
      setIsVisible(true);
      setPosition({ x: event.clientX, y: event.clientY });
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }
      setIsActive(true);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }
      setIsActive(false);
    };

    const handlePointerLeave = () => setIsVisible(false);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      document.body.style.cursor = previousCursor;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  if (!enabled || !isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      >
        <div className="relative">
          <div className="absolute -right-4 top-4">
            <MoonIcon active={isActive} />
          </div>
          <CatIcon active={isActive} />
          <span
            className={`absolute inset-0 -z-10 rounded-full blur-3xl transition-all duration-200 ${
              isActive ? "bg-[#bc91ff]/40" : "bg-[#f6e8ff]/25"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomCursor;
