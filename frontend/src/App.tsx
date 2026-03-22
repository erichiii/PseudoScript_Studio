import CompilerWorkspace from "./components/compiler/CompilerWorkspace";

function App() {
  return (
    <div className="min-h-screen bg-[#0b0f1d] px-4 py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.6em] text-white/50">PseudoScript Studio</p>
          <h1 className="font-display text-3xl text-white">Compiler Workspace</h1>
          <p className="text-sm text-white/60">
            Editor on the left, compiler characters below, terminal-style output on the right — just like your favorite IDE.
          </p>
        </header>
        <CompilerWorkspace />
      </div>
    </div>
  );
}

export default App;
