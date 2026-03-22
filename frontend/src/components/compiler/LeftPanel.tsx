import CodeEditor from "./CodeEditor";
import ControlButtons from "./ControlButtons";
import PhaseCard from "./PhaseCard";
import { starterCode } from "./data";

type LeftPanelProps = {
  onCodeChange?: (value: string) => void;
};

const LeftPanel = ({ onCodeChange }: LeftPanelProps) => (
  <div className="space-y-6">
    <CodeEditor initialValue={starterCode} onChange={onCodeChange} />
    <PhaseCard
      title="Current Phase"
      emoji="🔤"
      description="[LEXER] Hi, I'm Lexer! I'm scanning your code character by character and tagging every meaningful token."
      status="Lexical Analysis"
    />
    <PhaseCard
      title="Next Phase"
      emoji="🌳"
      description="[PARSER] Once tokenization is clean, I'll build a parse tree showing how your statements connect."
      status="Syntax Analysis"
    />
    <ControlButtons />
  </div>
);

export default LeftPanel;
