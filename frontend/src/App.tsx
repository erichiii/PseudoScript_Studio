import { useState, useEffect } from "react";
import CompilerWorkspace from "./components/compiler/CompilerWorkspace";
import LandingPage from "./components/LandingPage";
import DesktopHub, { type DesktopSelection } from "./components/DesktopHub";
import CheatsheetView from "./components/CheatsheetView";
import GameModeView from "./components/GameModeView";

type Page = "landing" | "desktop" | "compiler" | "cheatsheet" | "game";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && currentPage === "landing") {
        e.preventDefault();
        setCurrentPage("desktop");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage]);

  const handleDesktopSelection = (selection: DesktopSelection) => {
    if (selection === "compiler") {
      setCurrentPage("compiler");
    } else if (selection === "cheatsheet") {
      setCurrentPage("cheatsheet");
    } else {
      setCurrentPage("game");
    }
  };

  const renderCompiler = (
    <div className="min-h-screen bg-[#0b0f1d] px-4 py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-white/50">PseudoScript Studio</p>
            <h1 className="font-display text-3xl text-white">Compiler Workspace</h1>
            <p className="text-sm text-white/60">
              Editor on the left, compiler characters below, terminal-style output on the right — just like your favorite IDE.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage("desktop")}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              ← Desktop
            </button>
            <button
              onClick={() => setCurrentPage("landing")}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Exit
            </button>
          </div>
        </header>
        <CompilerWorkspace />
      </div>
    </div>
  );

  return (
    <>
      {currentPage === "landing" && <LandingPage onEnter={() => setCurrentPage("desktop")} />}
      {currentPage === "desktop" && (
        <DesktopHub
          onSelect={handleDesktopSelection}
          onExitLanding={() => setCurrentPage("landing")} />
      )}
      {currentPage === "compiler" && renderCompiler}
      {currentPage === "cheatsheet" && <CheatsheetView onBack={() => setCurrentPage("desktop")} />}
      {currentPage === "game" && <GameModeView onBack={() => setCurrentPage("desktop")} />}
    </>
  );
}

export default App;
