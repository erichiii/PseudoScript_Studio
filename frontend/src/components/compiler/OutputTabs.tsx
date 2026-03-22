import { clsx } from "clsx";
import {
  sampleErrors,
  sampleParseTree,
  sampleSemanticNotes,
  sampleSymbolTable,
  sampleTokens,
} from "./data";

type TabId = "lexer" | "parser" | "semantic" | "symbol" | "errors";

type OutputTabsProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "lexer", label: "Lexer" },
  { id: "parser", label: "Parser" },
  { id: "semantic", label: "Semantic" },
  { id: "symbol", label: "Symbol Table" },
  { id: "errors", label: "Errors" },
];

type ParseNode = (typeof sampleParseTree)[number];

const formatParseTree = (nodes: ParseNode[], depth = 0): string[] =>
  nodes.flatMap((node) => {
    const indent = "  ".repeat(depth);
    const lines = [`${indent}> ${node.label}`];
    if (node.children) {
      lines.push(...formatParseTree(node.children, depth + 1));
    }
    return lines;
  });

const buildLexerLines = () => {
  const lines = [
    "PS C:\\PseudoScript_Studio> pseudoscript compile main.ps",
    "[LEXER] Starting lexical analysis...",
  ];

  sampleTokens.forEach((token, index) => {
    lines.push(`[LEXER] Token ${index + 1}: ${token.type} -> ${token.value}`);
  });

  lines.push("[LEXER] ✓ Lexical analysis complete. 0 unknown tokens detected.");
  return lines;
};

const buildParserLines = () => {
  const lines = ["[PARSER] Validating syntax rules..."];
  lines.push(...formatParseTree(sampleParseTree));
  lines.push("[PARSER] ✓ Syntax analysis complete. No recovery steps applied.");
  return lines;
};

const buildSemanticLines = () => {
  const lines = ["[SEMANTIC] Launching semantic analyzer..."];
  lines.push(...sampleSemanticNotes);
  lines.push("[SEMANTIC] ✓ Semantic analysis complete.");
  return lines;
};

const buildSymbolLines = () => {
  const lines = ["[SYMBOL TABLE] Building scope map..."];
  sampleSymbolTable.entries.forEach((symbol) => {
    lines.push(
      `[SYMBOL] ${symbol.name} :: type=${symbol.type} :: scope=${symbol.scope} :: bytes=${symbol.bytes} :: value=${symbol.value}`
    );
  });
  lines.push("", "[MEMORY] Scope usage overview:");
  sampleSymbolTable.scopes.forEach((scope) => {
    lines.push(`[MEMORY] Level ${scope.level} (${scope.label}) → ${scope.memory} bytes`);
  });
  lines.push("[SYMBOL TABLE] ✓ Symbol table ready.");
  return lines;
};

const buildErrorLines = () => {
  const lines = ["[ERRORS] Aggregating issues across phases..."];
  sampleErrors.forEach((error, index) => {
    lines.push(`[${error.phase}] ERROR ${index + 1}: ${error.message}`);
    lines.push(`  ↳ ${error.hint}`);
  });
  lines.push("[ERRORS] ✗ Compilation halted due to blocking issues.");
  return lines;
};

const terminalBuilders: Record<TabId, () => string[]> = {
  lexer: buildLexerLines,
  parser: buildParserLines,
  semantic: buildSemanticLines,
  symbol: buildSymbolLines,
  errors: buildErrorLines,
};

const getTerminalOutput = (tab: TabId) => terminalBuilders[tab]().join("\n");

const OutputTabs = ({ activeTab, onTabChange }: OutputTabsProps) => {
  const terminalOutput = getTerminalOutput(activeTab);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#090c16] text-white shadow-glass">
      <div className="flex items-center gap-3 border-b border-white/5 bg-[#05070f] px-6 py-4 text-[0.7rem] uppercase tracking-[0.35em] text-white/40">
        <span className="inline-flex gap-1 text-white/25">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </span>
        Terminal Output
      </div>

      <div className="flex flex-wrap gap-2 px-6 py-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={clsx(
              "rounded-full px-4 py-2 text-xs font-semibold transition",
              activeTab === tab.id
                ? "bg-white/10 text-white shadow"
                : "bg-white/5 text-white/50 hover:text-white"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="border-t border-white/5 bg-[#05070f] px-6 py-5 font-mono text-xs leading-relaxed text-[#cdd5f5]">
        <pre className="whitespace-pre-wrap">{terminalOutput}</pre>
      </div>
    </div>
  );
};

export default OutputTabs;
