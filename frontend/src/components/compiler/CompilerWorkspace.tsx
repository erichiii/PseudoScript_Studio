import { useState } from "react";

import { compilePseudoScript } from "../../lib/api";
import { starterCode } from "./data";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

const CompilerWorkspace = () => {
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

  return (
    <div className="grid gap-8 lg:grid-cols-[420px,1fr]">
      <LeftPanel code={code} onCodeChange={setCode} onCompile={handleCompile} isCompiling={isCompiling} />
      <RightPanel output={output} isCompiling={isCompiling} error={error} success={lastSuccess} />
    </div>
  );
};

export default CompilerWorkspace;
