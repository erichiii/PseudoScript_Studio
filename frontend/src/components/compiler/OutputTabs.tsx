import clsx from "clsx";
import { useEffect, useState } from "react";

type Token = {
  type: string;
  value: string;
};

type ParseTreeNode = {
  label: string;
  note?: string;
  children?: ParseTreeNode[];
};

type SymbolTableEntry = {
  name: string;
  type: string;
  scope: number;
  bytes: number;
  value: string | number | boolean;
};

type SymbolScope = {
  level: number;
  label: string;
  memory: number;
};

type SymbolTableData = {
  entries: SymbolTableEntry[];
  scopes: SymbolScope[];
};

type OutputTabsProps = {
  output: string;
  isCompiling?: boolean;
  error?: string | null;
  success?: boolean | null;
  tokens: Token[];
  parseTree: ParseTreeNode[];
  annotatedTree: ParseTreeNode[];
  semanticNotes: string[];
  symbolTable: SymbolTableData;
};

type TabId = "lexer" | "parser" | "parse-tree" | "semantic" | "annotated" | "symbol";

const tabs: { id: TabId; label: string }[] = [
  { id: "lexer", label: "Lexer" },
  { id: "parser", label: "Parser" },
  { id: "parse-tree", label: "Parse Tree" },
  { id: "semantic", label: "Semantic" },
  { id: "annotated", label: "Annotated Tree" },
  { id: "symbol", label: "Symbol Table" },
];

const OutputTabs = ({
  output,
  isCompiling,
  error,
  success,
  tokens,
  parseTree,
  annotatedTree,
  semanticNotes,
  symbolTable,
}: OutputTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("lexer");
  const statusLabel = success === null ? "idle" : success ? "success" : "failed";
  const statusColor = success === null ? "bg-white/30" : success ? "bg-emerald-400" : "bg-rose-400";
  const { lexerLogs, parserLogs, lexerStatusLogs } = splitCompilerLog(output);

  useEffect(() => {
    if (!isCompiling) {
      setActiveTab("lexer");
    }
  }, [isCompiling, output]);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#090c16] text-white shadow-glass">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/5 bg-[#05070f] px-4 py-4 text-[0.7rem] uppercase tracking-[0.35em] text-white/40">
        <span className="inline-flex gap-1 text-white/25">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </span>
        <div className="flex flex-wrap gap-2 text-[0.55rem] tracking-[0.2em]">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={clsx(
                "rounded-full px-3 py-1 text-[0.6rem] font-semibold tracking-[0.2em] transition",
                activeTab === id
                  ? "bg-white text-[#090c16]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-2 text-[0.55rem] tracking-[0.2em]">
          <span className={clsx("h-2 w-2 rounded-full", statusColor)} />
          {statusLabel}
        </span>
      </div>

      <div className="border-t border-white/5 bg-[#05070f] px-6 py-5 text-sm leading-relaxed text-[#cdd5f5]">
        {renderActiveTab({
          activeTab,
          output,
          lexerLogs,
          lexerStatusLogs,
          parserLogs,
          tokens,
          parseTree,
          annotatedTree,
          semanticNotes,
          symbolTable,
          isCompiling,
          error,
        })}
      </div>
    </div>
  );
};

const renderActiveTab = ({
  activeTab,
  output,
  lexerLogs,
  lexerStatusLogs,
  parserLogs,
  tokens,
  parseTree,
  annotatedTree,
  semanticNotes,
  symbolTable,
  isCompiling,
  error,
}: {
  activeTab: TabId;
  output: string;
  lexerLogs: string[];
  lexerStatusLogs: string[];
  parserLogs: string[];
  tokens: Token[];
  parseTree: ParseTreeNode[];
  annotatedTree: ParseTreeNode[];
  semanticNotes: string[];
  symbolTable: SymbolTableData;
  isCompiling?: boolean;
  error?: string | null;
}) => {
  switch (activeTab) {
    case "lexer":
      return <LexerTab logs={lexerLogs} statusLogs={lexerStatusLogs} tokens={tokens} />;
    case "parser":
      return (
        <ParserTab
          logs={parserLogs}
          fallbackOutput={output}
          isCompiling={isCompiling}
          error={error}
        />
      );
    case "parse-tree":
      return <TreeTab title="Syntax Tree" nodes={parseTree} />;
    case "semantic":
      return <SemanticTab notes={semanticNotes} />;
    case "annotated":
      return <TreeTab title="Annotated Tree" nodes={annotatedTree} showNotes />;
    case "symbol":
      return <SymbolTableTab data={symbolTable} />;
    default:
      return null;
  }
};

const LexerTab = ({
  logs,
  statusLogs,
  tokens,
}: {
  logs: string[];
  statusLogs: string[];
  tokens: Token[];
}) => {
  const hasLexicalError = statusLogs.some((line) =>
    /(invalid|unknown|lexical|lexer error)/i.test(line) && !/no errors found/i.test(line)
  );
  const hasLexicalSuccess = statusLogs.some((line) =>
    /successfully generated tokens/i.test(line) || /no errors found/i.test(line)
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {logs.length > 0 ? (
          logs.map((line, index) => (
            <div
              key={`${line}-${index}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85"
            >
              <span className="text-[0.6rem] uppercase tracking-[0.4em] text-white/50">Lexer</span>
              <p className="mt-1 whitespace-pre-wrap font-mono text-xs text-white/90">{line}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-white/40">Run the compiler to see lexer narration here.</p>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/40">Lexeme Table</p>
        <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0e1222]">
          <table className="w-full text-left text-[0.75rem]">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-2 font-semibold">#</th>
                <th className="px-4 py-2 font-semibold">Lexeme</th>
                <th className="px-4 py-2 font-semibold">Token Type</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, index) => (
                <tr key={`${token.type}-${token.value}-${index}`} className="border-t border-white/5 text-white/80">
                  <td className="px-4 py-2 text-white/50">{index + 1}</td>
                  <td className="px-4 py-2 font-mono text-xs text-white/90">{token.value}</td>
                  <td className="px-4 py-2 font-semibold">{token.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {statusLogs.length > 0 && (
        <div className="space-y-2">
          {statusLogs.map((line, index) => {
            const mentionsRecovery = /recovery/i.test(line);
            const isLastMessage = index === statusLogs.length - 1;

            let bubbleClasses = "border border-white/10 bg-white/5 text-white/85";
            let labelColor = "text-white/60";

            if (mentionsRecovery) {
              bubbleClasses = "border border-amber-400/40 bg-amber-400/10 text-amber-100";
              labelColor = "text-amber-200";
            } else if (isLastMessage && hasLexicalError) {
              bubbleClasses = "border border-rose-500/40 bg-rose-500/10 text-rose-100";
              labelColor = "text-rose-200";
            } else if (isLastMessage && hasLexicalSuccess) {
              bubbleClasses = "border border-emerald-500/40 bg-emerald-500/10 text-emerald-100";
              labelColor = "text-emerald-200";
            } else if (isLastMessage) {
              bubbleClasses = "border border-white/15 bg-white/10 text-white";
            }

            return (
              <div
                key={`status-${line}-${index}`}
                className={clsx("rounded-2xl px-4 py-3 text-sm", bubbleClasses)}
              >
                <span className={clsx("text-[0.6rem] uppercase tracking-[0.4em]", labelColor)}>Lexer</span>
                <p className="mt-1 whitespace-pre-wrap font-mono text-xs">{line}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ParserTab = ({
  logs,
  fallbackOutput,
  isCompiling,
  error,
}: {
  logs: string[];
  fallbackOutput: string;
  isCompiling?: boolean;
  error?: string | null;
}) => {
  const hasLogs = logs.length > 0;
  const hasFallback = Boolean(fallbackOutput.trim());

  if (isCompiling) {
    return <p className="animate-pulse text-white/60">Running lexer → parser → semantic analyzer...</p>;
  }

  if (error) {
    return <p className="whitespace-pre-wrap font-mono text-xs text-rose-200">{error}</p>;
  }

  if (hasLogs) {
    return (
      <div className="space-y-2">
        {logs.map((line, index) => {
          const message = line.replace(/^\[PARSER\]\s*/i, "");
          return (
            <pre key={`${line}-${index}`} className="whitespace-pre-wrap font-mono text-xs text-[#cdd5f5]">
              {message || line}
            </pre>
          );
        })}
      </div>
    );
  }

  if (hasFallback) {
    return <pre className="whitespace-pre-wrap font-mono text-xs text-[#cdd5f5]">{fallbackOutput}</pre>;
  }

  return (
    <p className="text-white/40">
      Parser ready. Write some code on the left and hit Run to see the syntax and semantic logs.
    </p>
  );
};

const TreeTab = ({ title, nodes, showNotes }: { title: string; nodes: ParseTreeNode[]; showNotes?: boolean }) => (
  <div className="space-y-3">
    <p className="text-xs uppercase tracking-[0.4em] text-white/40">{title}</p>
    <div className="space-y-3 text-sm text-white/85">
      {nodes.map((node) => (
        <TreeNode key={node.label} node={node} depth={0} showNotes={showNotes} />
      ))}
    </div>
  </div>
);

const TreeNode = ({ node, depth, showNotes }: { node: ParseTreeNode; depth: number; showNotes?: boolean }) => (
  <div className={clsx("rounded-2xl border border-white/5 bg-[#0e1222]/80 px-4 py-3", depth > 0 && "ml-4")}>
    <p className="font-semibold text-white">{node.label}</p>
    {showNotes && node.note && <p className="text-xs uppercase tracking-[0.3em] text-white/40">{node.note}</p>}
    {node.children && node.children.length > 0 && (
      <div className="mt-3 space-y-2">
        {node.children.map((child) => (
          <TreeNode key={`${node.label}-${child.label}`} node={child} depth={depth + 1} showNotes={showNotes} />
        ))}
      </div>
    )}
  </div>
);

const SemanticTab = ({ notes }: { notes: string[] }) => (
  <div className="space-y-3">
    <p className="text-xs uppercase tracking-[0.4em] text-white/40">Semantic Analyzer</p>
    <ul className="space-y-2 text-sm text-white/80">
      {notes.map((note) => (
        <li key={note} className="rounded-xl border border-white/10 bg-[#0d111f] px-4 py-2 font-mono text-xs">
          {note}
        </li>
      ))}
    </ul>
  </div>
);

const SymbolTableTab = ({ data }: { data: SymbolTableData }) => (
  <div className="space-y-4 text-sm text-white/85">
    <div>
      <p className="text-xs uppercase tracking-[0.4em] text-white/40">Entries</p>
      <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0e1222]">
        <table className="w-full text-left text-[0.75rem]">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-2 font-semibold">Name</th>
              <th className="px-4 py-2 font-semibold">Type</th>
              <th className="px-4 py-2 font-semibold">Scope</th>
              <th className="px-4 py-2 font-semibold">Bytes</th>
              <th className="px-4 py-2 font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry) => (
              <tr key={entry.name} className="border-t border-white/5 text-white/80">
                <td className="px-4 py-2 font-semibold">{entry.name}</td>
                <td className="px-4 py-2">{entry.type}</td>
                <td className="px-4 py-2">{entry.scope}</td>
                <td className="px-4 py-2">{entry.bytes}</td>
                <td className="px-4 py-2 font-mono text-xs">{String(entry.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <p className="text-xs uppercase tracking-[0.4em] text-white/40">Scopes</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {data.scopes.map((scope) => (
          <div key={scope.level} className="rounded-2xl border border-white/10 bg-[#13182c] px-4 py-3">
            <p className="text-sm font-semibold text-white">{scope.label}</p>
            <p className="text-xs text-white/60">Level {scope.level}</p>
            <p className="text-xs text-white/60">Memory: {scope.memory} bytes</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const splitCompilerLog = (log: string): {
  lexerLogs: string[];
  lexerStatusLogs: string[];
  parserLogs: string[];
} => {
  const lines = log ? log.split(/\r?\n/) : [];
  const buckets = {
    lexerLogs: [] as string[],
    lexerStatusLogs: [] as string[],
    parserLogs: [] as string[],
  };
  let currentPhase: "lexer" | "parser" | null = null;

  const detectPhase = (line: string): "lexer" | "parser" | null => {
    const upper = line.toUpperCase();
    if (upper.includes("LEXER") || upper.includes("LEXICAL")) {
      return "lexer";
    }
    if (upper.includes("PARSER") || upper.includes("SYNTAX")) {
      return "parser";
    }
    return null;
  };

  const stripAnsi = (value: string) => value.replace(/\u001b\[[0-9;]*m/g, "");

  lines.forEach((rawLine) => {
    const line = stripAnsi(rawLine).trim();
    if (!line) {
      return;
    }

    const detected = detectPhase(line);
    if (detected) {
      currentPhase = detected;
    }

    const bucketKey = detected ?? currentPhase;
    if (bucketKey === "lexer") {
      let cleaned = line.replace(/^\[LEXER\]\s*/i, "").trim();
      cleaned = cleaned.replace(/^LEXER[:\-\s]*/i, "").trim();

      if (!cleaned) {
        return;
      }
      if (
        cleaned.toUpperCase() === "STARTING LEXICAL ANALYSIS" ||
        cleaned.includes("────────") ||
        /^Found\s+'/i.test(cleaned) ||
        /^INDENT/i.test(cleaned) ||
        /^DEDENT/i.test(cleaned) ||
        cleaned.toUpperCase() === "LEXER" ||
        (/->/i.test(cleaned) && !/NO ERRORS FOUND/i.test(cleaned))
      ) {
        return;
      }
      cleaned = cleaned.replace(/^\[LEXER\]\s*/i, "").trim();

      const isStatusLine =
        /^Successfully/i.test(cleaned) ||
        /NO ERRORS FOUND/i.test(cleaned) ||
        /^I\s+found.*invalid/i.test(cleaned) ||
        /INVALID TOKEN/i.test(cleaned) ||
        /^Lexer Error/i.test(cleaned) ||
        /^Error/i.test(cleaned) ||
        /RECOVERY/i.test(cleaned) ||
        /PLEASE FIX/i.test(cleaned);
      if (isStatusLine) {
        buckets.lexerStatusLogs.push(cleaned);
        return;
      }

      buckets.lexerLogs.push(cleaned);
    } else if (bucketKey === "parser") {
      const cleaned = line.replace(/^\[PARSER\]\s*/i, "").trim();
      if (cleaned) {
        buckets.parserLogs.push(cleaned);
      }
    }
  });

  return buckets;
};

export default OutputTabs;
