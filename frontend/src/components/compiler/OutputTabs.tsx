import clsx from "clsx";
import mermaid from "mermaid";
import { useEffect, useMemo, useState } from "react";

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
  symbolTable: SymbolTableData | null;
};

type TabId = "lexer" | "parser" | "semantic" | "symbol";

const tabs: { id: TabId; label: string }[] = [
  { id: "lexer", label: "Lexer" },
  { id: "parser", label: "Parser" },
  { id: "semantic", label: "Semantic" },
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
  symbolTable,
}: OutputTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("lexer");
  const [isParseTreeOpen, setIsParseTreeOpen] = useState(false);
  const hasParseTree = parseTree.length > 0;
  const statusLabel = success === null ? "idle" : success ? "success" : "failed";
  const statusColor = success === null ? "bg-white/30" : success ? "bg-emerald-400" : "bg-rose-400";
  const { lexerLogs, parserLogs, lexerStatusLogs, semanticLogs } = splitCompilerLog(output);

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
                activeTab === id ? "bg-white text-[#090c16]" : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[0.55rem] tracking-[0.2em]">
          <span className="flex items-center gap-2">
            <span className={clsx("h-2 w-2 rounded-full", statusColor)} />
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="border-t border-white/5 bg-[#05070f] px-6 py-5 text-sm leading-relaxed text-[#cdd5f5]">
        {renderActiveTab({
          activeTab,
          output,
          lexerLogs,
          lexerStatusLogs,
          parserLogs,
          semanticLogs,
          tokens,
          annotatedTree,
          symbolTable,
          isCompiling,
          error,
          hasParseTree,
          onOpenParseTree: hasParseTree ? () => setIsParseTreeOpen(true) : undefined,
        })}
      </div>

      {isParseTreeOpen && <ParseTreeModal nodes={parseTree} onClose={() => setIsParseTreeOpen(false)} />}
    </div>
  );
};

const renderActiveTab = ({
  activeTab,
  output,
  lexerLogs,
  lexerStatusLogs,
  parserLogs,
  semanticLogs,
  tokens,
  annotatedTree,
  symbolTable,
  isCompiling,
  error,
  hasParseTree,
  onOpenParseTree,
}: {
  activeTab: TabId;
  output: string;
  lexerLogs: string[];
  lexerStatusLogs: string[];
  parserLogs: string[];
  semanticLogs: string[];
  tokens: Token[];
  annotatedTree: ParseTreeNode[];
  symbolTable: SymbolTableData | null;
  isCompiling?: boolean;
  error?: string | null;
  hasParseTree?: boolean;
  onOpenParseTree?: () => void;
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
          tokens={tokens}
          hasParseTree={hasParseTree}
          onOpenParseTree={onOpenParseTree}
        />
      );
    case "semantic":
      return <SemanticTab logs={semanticLogs} fallbackOutput={output} annotatedTree={annotatedTree} />;
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
  const hasLexicalError = statusLogs.some(
    (line) => /(invalid|unknown|lexical|lexer error)/i.test(line) && !/no errors found/i.test(line)
  );
  const hasLexicalSuccess = statusLogs.some(
    (line) => /successfully generated tokens/i.test(line) || /no errors found/i.test(line)
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
        {tokens.length > 0 ? (
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
                  <tr
                    key={`${token.type}-${token.value}-${index}`}
                    className="border-t border-white/5 text-white/80"
                  >
                    <td className="px-4 py-2 text-white/50">{index + 1}</td>
                    <td className="px-4 py-2 font-mono text-xs text-white/90">{token.value}</td>
                    <td className="px-4 py-2 font-semibold">{token.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-2 rounded-2xl border border-dashed border-white/15 bg-[#0e1222]/70 px-4 py-6 text-sm text-white/50">
            Run the compiler to generate the lexeme table.
          </div>
        )}
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

const classifyLogLine = (line: string): "error" | "success" | "info" => {
  if (
    /no\s+\w*\s*errors?/i.test(line) ||
    /no structural errors?/i.test(line) ||
    /completed|success/i.test(line) ||
    /types? match/i.test(line) ||
    /no coercion needed/i.test(line) ||
    /variables? .*declared/i.test(line)
  ) {
    return "success";
  }
  if (/error|mismatch|unexpected|invalid/i.test(line)) {
    return "error";
  }
  if (/found|accept/i.test(line)) {
    return "success";
  }
  return "info";
};

const parserBubbleClass = (severity: "error" | "success" | "info") => {
  if (severity === "error") {
    return "border-rose-500/40 bg-rose-500/5 text-rose-100";
  }
  if (severity === "success") {
    return "border-emerald-500/30 bg-emerald-500/5 text-emerald-100";
  }
  return "border-white/15 bg-black/50 text-white/85";
};

const TREE_LINE_REGEX = /^[\s|│├┤┬┴┼└┌\-•⋅∙·]+/;
const SYMBOL_HEADER_REGEX = /^name\s+type\s+scope/i;
const SYMBOL_ROW_REGEX = /^[a-z_][a-z0-9_]*\s+\w+\s+\d+\s+\d+/i;
const MEMORY_ROW_REGEX = /^-\s*[A-Z]+.*byte/i;

const filterParserLogs = (logs: string[]): string[] => {
  let skippingTree = false;
  let skippingSymbol = false;
  let skippingMemory = false;
  return logs.filter((line) => {
    const normalized = line.replace(/^\[PARSER\]\s*/i, "").trim();
    if (!normalized) {
      skippingTree = false;
      skippingSymbol = false;
      skippingMemory = false;
      return false;
    }

    if (/^parse tree/i.test(normalized)) {
      skippingTree = true;
      return false;
    }

    if (skippingTree) {
      if (TREE_LINE_REGEX.test(normalized)) {
        return false;
      }
      skippingTree = false;
    }

    if (/^symbol table/i.test(normalized)) {
      skippingSymbol = true;
      return false;
    }

    if (skippingSymbol) {
      if (SYMBOL_HEADER_REGEX.test(normalized) || SYMBOL_ROW_REGEX.test(normalized)) {
        return false;
      }
      skippingSymbol = false;
    }

    if (/total memory per scope/i.test(normalized)) {
      skippingMemory = true;
      return false;
    }

    if (skippingMemory) {
      if (MEMORY_ROW_REGEX.test(normalized)) {
        return false;
      }
      skippingMemory = false;
    }

    if (/semantic/i.test(normalized)) {
      return false;
    }

    return true;
  });
};

const filterSemanticLogs = (logs: string[]): string[] => {
  let skippingSymbol = false;
  let skippingMemory = false;
  return logs.filter((line) => {
    const normalized = line.replace(/^\[SEMANTIC[S]?\]\s*/i, "").trim();
    if (!normalized) {
      skippingSymbol = false;
      skippingMemory = false;
      return false;
    }

    if (/^symbol table/i.test(normalized)) {
      skippingSymbol = true;
      return false;
    }

    if (skippingSymbol) {
      if (SYMBOL_HEADER_REGEX.test(normalized) || SYMBOL_ROW_REGEX.test(normalized)) {
        return false;
      }
      skippingSymbol = false;
    }

    if (/total memory per scope/i.test(normalized)) {
      skippingMemory = true;
      return false;
    }

    if (skippingMemory) {
      if (MEMORY_ROW_REGEX.test(normalized)) {
        return false;
      }
      skippingMemory = false;
    }

    return true;
  });
};

const groupSemanticLogs = (logs: string[]): string[] => {
  const grouped: string[] = [];
  let collectingTree = false;
  let treeLines: string[] = [];
  const isTreeContinuation = (line: string) => /^(│|├|└|┌|┬|┴|┼|─|\s|•|[|]|-)/.test(line.trim());

  const pushTree = () => {
    if (treeLines.length) {
      grouped.push(treeLines.join("\n"));
      treeLines = [];
    }
    collectingTree = false;
  };

  logs.forEach((line) => {
    const cleaned = line.replace(/^\[SEMANTIC[S]?\]\s*/i, "").trim();
    if (/parse tree/i.test(cleaned)) {
      pushTree();
      collectingTree = true;
      treeLines.push(cleaned);
      return;
    }

    if (collectingTree) {
      if (isTreeContinuation(cleaned)) {
        treeLines.push(cleaned);
        return;
      }
      pushTree();
    }

    grouped.push(cleaned || line);
  });

  pushTree();
  return grouped;
};

const ParserTab = ({
  logs,
  fallbackOutput,
  isCompiling,
  error,
  tokens,
  hasParseTree,
  onOpenParseTree,
}: {
  logs: string[];
  fallbackOutput: string;
  isCompiling?: boolean;
  error?: string | null;
  tokens: Token[];
  hasParseTree?: boolean;
  onOpenParseTree?: () => void;
}) => {
  const filteredLogs = useMemo(() => filterParserLogs(logs), [logs]);
  const hasVisibleLogs = filteredLogs.length > 0;
  const hasFallback = Boolean(fallbackOutput.trim());
  const statements = useMemo(() => buildStatementsFromTokens(tokens), [tokens]);
  if (isCompiling) {
    return <p className="animate-pulse text-white/60">Running lexer → parser → semantic analyzer...</p>;
  }

  if (error) {
    return (
      <p className="rounded-2xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 font-mono text-xs text-rose-100">
        {error}
      </p>
    );
  }

  if (hasVisibleLogs) {
    let activeStatementIdx = -1;
    let activeStatement: string | null = null;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {filteredLogs.map((line, index) => {
          const cleaned = line.replace(/^\[PARSER\]\s*/i, "");
          const severity = classifyLogLine(cleaned);
          const bubbleClasses = parserBubbleClass(severity);
          const isStructureCheck = /checking\s+statement\s+structure/i.test(cleaned);
          if (isStructureCheck) {
            if (activeStatementIdx + 1 < statements.length) {
              activeStatementIdx += 1;
              activeStatement = statements[activeStatementIdx] ?? null;
            }
          }
          const statementText = isStructureCheck ? activeStatement : null;
          const statementNumber = statementText && activeStatementIdx > -1 ? activeStatementIdx + 1 : null;
          const contentLines =
            isStructureCheck && statementNumber
              ? [
                  `[PROCESSING] Statement ${statementNumber}: ${statementText ?? "(unavailable)"}`,
                  cleaned || line,
                ]
              : [cleaned || line];
            return (
              <div key={`${cleaned}-${index}`} className={clsx("rounded-2xl border px-4 py-3", bubbleClasses)}>
                <span className="text-[0.6rem] uppercase tracking-[0.4em] text-white/60">Parser</span>
                {contentLines.map((text, idx) => (
                  <p key={`${cleaned}-${index}-line-${idx}`} className="mt-1 whitespace-pre-wrap font-mono text-xs">
                    {text}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
        {hasParseTree && onOpenParseTree && (
          <div>
            <button
              type="button"
              onClick={onOpenParseTree}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
            >
              Show Parse Tree
            </button>
          </div>
        )}
      </div>
    );
  }

  if (hasFallback) {
    return (
      <pre className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 font-mono text-xs text-emerald-100">
        {fallbackOutput}
      </pre>
    );
  }

  return <p className="text-white/40">Parser ready. Write some code on the left and hit Run to see the syntax logs.</p>;
};

const SemanticTab = ({
  logs,
  fallbackOutput,
  annotatedTree,
}: {
  logs: string[];
  fallbackOutput: string;
  annotatedTree: ParseTreeNode[];
}) => {
  const filteredLogs = useMemo(() => filterSemanticLogs(logs), [logs]);
  const groupedLogs = useMemo(() => groupSemanticLogs(filteredLogs), [filteredLogs]);
  const hasLogs = groupedLogs.length > 0;
  const hasFallback = Boolean(fallbackOutput.trim());
  const hasTree = annotatedTree.length > 0;
  const [showAnnotatedTree, setShowAnnotatedTree] = useState(false);

  if (hasLogs) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {groupedLogs.map((text, index) => {
            const firstLine = text.split("\n")[0] ?? text;
            const severity = classifyLogLine(firstLine);
            const bubbleClasses = parserBubbleClass(severity);
            return (
              <div key={`semantic-${index}`} className={clsx("rounded-2xl border px-4 py-3", bubbleClasses)}>
                <span className="text-[0.6rem] uppercase tracking-[0.4em] text-white/60">Semantic</span>
                <p className="mt-1 whitespace-pre-wrap font-mono text-xs">{text}</p>
              </div>
            );
          })}
        </div>
        {hasTree && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowAnnotatedTree((current) => !current)}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
            >
              {showAnnotatedTree ? "Hide Annotated Parse Tree" : "Show Annotated Parse Tree"}
            </button>
            {showAnnotatedTree && <AnnotatedTreeDiagram nodes={annotatedTree} />}
          </div>
        )}
      </div>
    );
  }

  if (hasFallback) {
    return (
      <div className="space-y-4">
        <pre className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 font-mono text-xs text-white/80">
          {fallbackOutput}
        </pre>
        {hasTree && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowAnnotatedTree((current) => !current)}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
            >
              {showAnnotatedTree ? "Hide Annotated Parse Tree" : "Show Annotated Parse Tree"}
            </button>
            {showAnnotatedTree && <AnnotatedTreeDiagram nodes={annotatedTree} />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-white/40">Semantic analyzer idle. Run the compiler to populate this tab.</p>
      {hasTree && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowAnnotatedTree((current) => !current)}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
          >
            {showAnnotatedTree ? "Hide Annotated Parse Tree" : "Show Annotated Parse Tree"}
          </button>
          {showAnnotatedTree && <AnnotatedTreeDiagram nodes={annotatedTree} />}
        </div>
      )}
    </div>
  );
};

const AnnotatedTreeDiagram = ({ nodes }: { nodes: ParseTreeNode[] }) => {
  const diagramDefinition = useMemo(() => buildMermaidGraph(nodes, true), [nodes]);
  const hasNodes = nodes.length > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e1222]/80 p-4">
      <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/50">Annotated Parse Tree</p>
      <div className="mt-4 max-h-[60vh] overflow-auto rounded-2xl border border-white/10 bg-[#0a0d17]/80 p-4">
        <ParseTreeDiagram diagram={diagramDefinition} hasNodes={hasNodes} />
      </div>
    </div>
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

const SymbolTableTab = ({ data }: { data: SymbolTableData | null }) => {
  if (!data) {
    return <p className="text-white/40">Symbol table will appear after a successful compilation.</p>;
  }

  return (
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
};

const ParseTreeModal = ({ nodes, onClose }: { nodes: ParseTreeNode[]; onClose: () => void }) => {
  const diagramDefinition = useMemo(() => buildMermaidGraph(nodes), [nodes]);
  const hasNodes = nodes.length > 0;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div className="relative flex h-full w-full items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#05070f] p-6 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40">Modal</p>
              <h2 className="text-2xl font-semibold text-white">Parse Tree</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <p className="mt-2 text-sm text-white/70">
            Visual representation generated with Mermaid. Run the parser to refresh the structure.
          </p>
          <div className="mt-6 max-h-[60vh] overflow-auto rounded-2xl border border-white/10 bg-[#0a0d17]/80 p-4">
            <ParseTreeDiagram diagram={diagramDefinition} hasNodes={hasNodes} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ParseTreeDiagram = ({
  diagram,
  hasNodes,
}: {
  diagram: string;
  hasNodes: boolean;
}) => {
  const [svg, setSvg] = useState<string>("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const [diagramId] = useState(() => `parseTree-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;

    if (!hasNodes) {
      setSvg("");
      setRenderError("Parse tree will appear after a successful run.");
      return () => {
        cancelled = true;
      };
    }

    const renderDiagram = async () => {
      try {
        mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
        const { svg } = await mermaid.render(diagramId, diagram);
        if (!cancelled) {
          setSvg(svg);
          setRenderError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setRenderError("Unable to render parse tree diagram.");
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [diagram, diagramId, hasNodes]);

  if (renderError) {
    return (
      <p className="rounded-2xl border border-dashed border-white/15 bg-[#0e1222]/80 px-4 py-6 text-sm text-white/60">
        {renderError}
      </p>
    );
  }

  if (!svg) {
    return <p className="text-sm text-white/60">Generating diagram...</p>;
  }

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
};

const buildMermaidGraph = (nodes: ParseTreeNode[], includeNotes = false): string => {
  if (!nodes.length) {
    return "graph TD\nempty[\"Awaiting parse tree\"]";
  }

  let counter = 0;
  const lines = ["graph TD"];

  const traverse = (node: ParseTreeNode, parentId?: string) => {
    const nodeId = `node_${counter++}`;
    const label = includeNotes && node.note ? `${node.label}<br/>${node.note}` : node.label;
    lines.push(`${nodeId}[\"${escapeMermaid(label)}\"]`);
    if (parentId) {
      lines.push(`${parentId}-->${nodeId}`);
    }
    node.children?.forEach((child) => traverse(child, nodeId));
  };

  nodes.forEach((node) => traverse(node));
  return lines.join("\n");
};

const escapeMermaid = (value: string) => value.replace(/"/g, '\\"');

const buildStatementsFromTokens = (tokens: Token[]): string[] => {
  if (!tokens.length) {
    return [];
  }

  const statements: string[] = [];
  let current: string[] = [];

  const flush = () => {
    if (!current.length) {
      return;
    }
    const joined = current
      .join(" ")
      .replace(/\s+([.,])/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    if (joined) {
      statements.push(joined);
    }
    current = [];
  };

  tokens.forEach(({ value, type }) => {
    if (value.trim()) {
      current.push(value);
    }
    if (type === "DELIMITER" && value.trim() === ".") {
      flush();
    }
  });

  flush();
  return statements;
};

const splitCompilerLog = (log: string): {
  lexerLogs: string[];
  lexerStatusLogs: string[];
  parserLogs: string[];
  semanticLogs: string[];
} => {
  const lines = log ? log.split(/\r?\n/) : [];
  const buckets = {
    lexerLogs: [] as string[],
    lexerStatusLogs: [] as string[],
    parserLogs: [] as string[],
    semanticLogs: [] as string[],
  };
  let currentPhase: "lexer" | "parser" | "semantic" | null = null;

  const detectPhase = (line: string): "lexer" | "parser" | "semantic" | null => {
    const upper = line.toUpperCase();
    if (upper.includes("LEXER") || upper.includes("LEXICAL")) {
      return "lexer";
    }
    if (upper.includes("PARSER") || upper.includes("SYNTAX")) {
      return "parser";
    }
    if (upper.includes("SEMANTIC")) {
      return "semantic";
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
      if (!cleaned) {
        return;
      }
      const upper = cleaned.toUpperCase();
      if (upper === "STARTING SYNTAX ANALYSIS" || upper === "SYNTAX ANALYSIS" || /────/.test(cleaned)) {
        return;
      }

      if (/^symbol table/i.test(cleaned) || SYMBOL_HEADER_REGEX.test(cleaned) || SYMBOL_ROW_REGEX.test(cleaned)) {
        buckets.semanticLogs.push(cleaned);
        return;
      }

      if (/total memory per scope/i.test(cleaned) || MEMORY_ROW_REGEX.test(cleaned)) {
        buckets.semanticLogs.push(cleaned);
        return;
      }

      buckets.parserLogs.push(cleaned);
    } else if (bucketKey === "semantic") {
      const cleaned = line.replace(/^\[SEMANTIC[S]?\]\s*/i, "").trim();
      if (!cleaned) {
        return;
      }
      const upper = cleaned.toUpperCase();
      if (upper === "STARTING SEMANTIC ANALYSIS" || upper === "SEMANTIC ANALYSIS" || /────/.test(cleaned)) {
        return;
      }

      buckets.semanticLogs.push(cleaned);
    }
  });

  return buckets;
};

export default OutputTabs;
