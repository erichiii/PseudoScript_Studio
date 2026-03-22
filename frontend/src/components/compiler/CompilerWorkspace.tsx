import { useState } from "react";

import { compilePseudoScript } from "../../lib/api";
import { randomSnippets, starterCode } from "./data";
import CodeEditor from "./CodeEditor";
import OutputTabs from "./OutputTabs";

type CompilerWorkspaceProps = {
  onOpenCheatsheet: () => void;
};

const CompilerWorkspace = ({ onOpenCheatsheet }: CompilerWorkspaceProps) => {
  const [code, setCode] = useState(starterCode.trim());
  const [output, setOutput] = useState("Tap run to see compiler output.");
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<boolean | null>(null);

  const handleCompile = async () => {
    if (!code.trim()) {
      setError("Write some PseudoScript before running the compiler.");
      setOutput("");
      setLastSuccess(null);
      return;
    }

    setIsCompiling(true);
    setError(null);
    try {
      const response = await compilePseudoScript(code);
      setOutput(response.output.trimEnd());
      setLastSuccess(response.success);
    } catch (err) {
      setLastSuccess(false);
      setOutput("");
      setError(err instanceof Error ? err.message : "Failed to run compiler.");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleGenerateRandom = () => {
    const snippet = randomSnippets[Math.floor(Math.random() * randomSnippets.length)] ?? starterCode;
    setCode(snippet.trim());
    setOutput("Random starter code loaded. Tap run to see it in action.");
    setError(null);
    setLastSuccess(null);
  };

  return (
    <div className="rounded-[36px] border border-white/10 bg-[#05070f] p-4 shadow-[0_25px_60px_rgba(3,0,12,0.55)] lg:p-6">
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-white/5">
        <div className="lg:pr-4">
          <CodeEditor
            value={code}
            onChange={setCode}
            onRun={handleCompile}
            isRunning={isCompiling}
            onGenerateRandom={handleGenerateRandom}
            onOpenCheatsheet={onOpenCheatsheet}
          />
        </div>
        <div className="lg:pl-4">
          <OutputTabs output={output} isCompiling={isCompiling} error={error} success={lastSuccess} />
        </div>
      </div>
    </div>
  );
};

export default CompilerWorkspace;
