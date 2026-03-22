import CheatsheetIcon from "../../../assets/images/cheatsheet_icon.png";
import CompilerIcon from "../../../assets/images/compiler_icon.png";
import GameIcon from "../../../assets/images/game_icon.png";
import ComputerBg from "../../../assets/images/computer.png";

const ICONS = [
  {
    id: "cheatsheet",
    label: "Cheatsheet",
    icon: CheatsheetIcon,
    accent: "from-[#fdd6ff] to-[#ffdff3]",
  },
  {
    id: "compiler",
    label: "Compiler",
    icon: CompilerIcon,
    accent: "from-[#c7d8ff] to-[#d3f2ff]",
  },
  {
    id: "game",
    label: "Game Mode",
    icon: GameIcon,
    accent: "from-[#fef0c3] to-[#ffd4c7]",
  },
] as const;

export type DesktopSelection = "cheatsheet" | "compiler" | "game";

type DesktopHubProps = {
  onSelect: (selection: DesktopSelection) => void;
  onExitLanding: () => void;
};

const DesktopHub = ({ onSelect, onExitLanding }: DesktopHubProps) => {
  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden">
      <img
        src={ComputerBg}
        alt="Desktop background"
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable={false}
      />

      <header className="absolute top-12 left-[198px] space-y-1 text-left text-[#bda2ff]">
        <p className="text-xs uppercase tracking-[0.6em] text-[#4c18c5]">PseudoScript Studio</p>
        <h1 className="text-3xl font-display drop-shadow text-[#5a1fd8]">Your Desktop</h1>
        <p className="text-sm text-[#8f6de8] max-w-xs">
          Pick an icon to open the cheatsheet, compiler, or playful game mode.
        </p>
      </header>

      <button
        onClick={onExitLanding}
        className="absolute top-8 right-8 text-xs uppercase tracking-[0.4em] text-white/65 hover:text-white transition"
      >
        ← back
      </button>

      <div className="absolute left-[244px] top-[calc(58%-5px)] -translate-y-1/2 flex flex-col gap-5 pointer-events-auto">
        {ICONS.map((icon) => (
          <button
            key={icon.id}
            onClick={() => onSelect(icon.id)}
            className="flex w-32 flex-col items-center gap-3 rounded-2xl border border-white/25 bg-white/20 px-3 py-4 backdrop-blur-xl text-center shadow-[0_18px_30px_rgba(10,6,20,0.35)] transition-colors duration-200 hover:bg-[#2c0f50]/80 hover:border-[#c092ff]/40"
          >
            <span className={`rounded-xl bg-gradient-to-br ${icon.accent} p-3 shadow-[0_10px_25px_rgba(0,0,0,0.2)]`}>
              <img src={icon.icon} alt={icon.label} className="h-10 w-10 select-none" draggable={false} />
            </span>
            <p className="text-sm font-semibold tracking-wide text-[#f3e9ff]">{icon.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DesktopHub;
