import GameIcon from "../../../assets/images/game_icon.png";

type GameModeViewProps = {
  onBack: () => void;
};

const missions = [
  {
    title: "Token Tumble",
    text: "Drag and drop characters into the right lexer buckets before time runs out.",
  },
  {
    title: "AST Builder",
    text: "Assemble syntax trees like a puzzle to help the cat compile a bedtime story.",
  },
  {
    title: "Pipeline Rush",
    text: "Fix missing compiler stages so the output lights blink in the right order.",
  },
];

const GameModeView = ({ onBack }: GameModeViewProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#160828] to-[#05010c] text-white px-4 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={GameIcon} alt="Game mode" className="h-12 w-12" />
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/50">Playground</p>
              <h1 className="text-3xl font-display">Game Mode (coming soon)</h1>
              <p className="text-sm text-white/70">
                A cozy mini-game collection that teaches compiler stages through playful tasks.
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-xs uppercase tracking-[0.5em] text-white/50 hover:text-white transition"
          >
            ← desktop
          </button>
        </header>

        <section className="space-y-4">
          {missions.map((mission) => (
            <article key={mission.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <h2 className="text-xl font-semibold">{mission.title}</h2>
              <p className="text-sm text-white/70">{mission.text}</p>
            </article>
          ))}
        </section>

        <div className="rounded-3xl border border-dashed border-white/25 p-6 text-sm text-white/65">
          Hook up your mini-games here later — this page already feels like a launcher where you can drop WebGL or canvas scenes.
        </div>
      </div>
    </div>
  );
};

export default GameModeView;
