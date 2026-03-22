type ControlButtonsProps = {
  onGenerate?: () => void;
  onCheatsheet?: () => void;
};

const ControlButtons = ({ onGenerate, onCheatsheet }: ControlButtonsProps) => (
  <div className="flex flex-wrap gap-3">
    <button
      className="rounded-xl bg-midnight px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
      onClick={onGenerate}
    >
      Generate Random Code
    </button>
    <button
      className="rounded-xl border border-midnight/20 bg-white px-4 py-2 text-sm font-semibold text-midnight transition hover:border-midnight/40"
      onClick={onCheatsheet}
    >
      Cheatsheet
    </button>
  </div>
);

export default ControlButtons;
