import { useState, useEffect } from "react";
import CompilerWorkspace from "./components/compiler/CompilerWorkspace";
import LandingPage from "./components/LandingPage";

function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "compiler">("landing");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && currentPage === "landing") {
        e.preventDefault();
        setCurrentPage("compiler");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage]);

  return (
    <>
      {currentPage === "landing" ? (
        <LandingPage onEnter={() => setCurrentPage("compiler")} />
      ) : (
        <div className="min-h-screen bg-[#0b0f1d] px-4 py-8 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <header className="space-y-1 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.6em] text-white/50">PseudoScript Studio</p>
                <h1 className="font-display text-3xl text-white">Compiler Workspace</h1>
                <p className="text-sm text-white/60">
                  Editor on the left, compiler characters below, terminal-style output on the right — just like your favorite IDE.
                </p>
              </div>
              <button
                onClick={() => setCurrentPage("landing")}
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </header>
            <CompilerWorkspace />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
