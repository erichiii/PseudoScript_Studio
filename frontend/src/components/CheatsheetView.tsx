import CheatsheetIcon from "../../../assets/images/cheatsheet_icon.png";

type CheatsheetViewProps = {
  onBack: () => void;
};

const cards = [
  {
    title: "Syntax snippets",
    text: "Variables, loops, branches and compiler-inspired keywords you can reuse quickly.",
  },
  {
    title: "Compiler walkthrough",
    text: "Step-by-step notes on how source, tokens, AST and bytecode come together.",
  },
  {
    title: "Debug rituals",
    text: "Common runtime errors plus how the PseudoScript VM reports them.",
  },
  {
    title: "Shortcuts",
    text: "Key commands inside the studio so you keep flow while prototyping.",
  },
];

const CheatsheetView = ({ onBack }: CheatsheetViewProps) => {
  return (
    <div className="min-h-screen w-full bg-[#0f071c] text-white px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <button
            onClick={onBack}
            className="self-start text-xs uppercase tracking-[0.5em] text-white/50 hover:text-white transition"
          >
            ← desktop
          </button>
          <div className="flex items-center gap-4">
            <img src={CheatsheetIcon} alt="Cheatsheet" className="h-12 w-12" />
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-white/50">Reference</p>
              <h1 className="text-3xl font-display">Cheatsheet Drawer</h1>
              <p className="text-sm text-white/70">
                Keep this open on a second screen while you explore the studio.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="text-sm text-white/70">{card.text}</p>
            </article>
          ))}
        </div>

        <div className="rounded-3xl border border-dashed border-white/20 p-6 text-sm text-white/65">
          Need the full PDF? It lives in the project specs folder. Drop it into this panel later to render inline.
        </div>
      </div>
    </div>
  );
};

export default CheatsheetView;
