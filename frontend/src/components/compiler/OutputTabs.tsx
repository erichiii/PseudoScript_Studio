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
  const [isAnnotatedTreeOpen, setIsAnnotatedTreeOpen] = useState(false);
  const hasParseTree = parseTree.length > 0;
  const hasAnnotatedTree = annotatedTree.length > 0;
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
          success,
          isCompiling,
          error,
          hasParseTree,
          hasAnnotatedTree,
          onOpenParseTree: hasParseTree ? () => setIsParseTreeOpen(true) : undefined,
          onOpenAnnotatedTree: hasAnnotatedTree ? () => setIsAnnotatedTreeOpen(true) : undefined,
        })}
      </div>

      {isParseTreeOpen && (
        <TreeModal title="Parse Tree" nodes={parseTree} onClose={() => setIsParseTreeOpen(false)} />
      )}
      {isAnnotatedTreeOpen && (
        <TreeModal
          title="Annotated Parse Tree"
          nodes={annotatedTree}
          includeNotes
          onClose={() => setIsAnnotatedTreeOpen(false)}
        />
      )}
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
  success,
  isCompiling,
  error,
  hasParseTree,
  hasAnnotatedTree,
  onOpenParseTree,
  onOpenAnnotatedTree,
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
  success?: boolean | null;
  isCompiling?: boolean;
  error?: string | null;
  hasParseTree?: boolean;
  hasAnnotatedTree?: boolean;
  onOpenParseTree?: () => void;
  onOpenAnnotatedTree?: () => void;
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
      return (
        <SemanticTab
          logs={semanticLogs}
          fallbackOutput={output}
          annotatedTree={annotatedTree}
          hasAnnotatedTree={hasAnnotatedTree}
          onOpenAnnotatedTree={onOpenAnnotatedTree}
        />
      );
    case "symbol":
      return <SymbolTableTab data={symbolTable} success={success} />;
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
              style={{ animationName: "bubbleFadeIn", animationDuration: "0.35s", animationFillMode: "both", animationDelay: `${index * 0.07}s` }}
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
            const mentionsHint = /^↳\s*hint/i.test(line) || /^hint[:\s]/i.test(line);
            const isLastMessage = index === statusLogs.length - 1;

            let bubbleClasses = "border border-white/10 bg-white/5 text-white/85";
            let labelColor = "text-white/60";

            if (mentionsRecovery || mentionsHint) {
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
                style={{ animationName: "bubbleFadeIn", animationDuration: "0.35s", animationFillMode: "both", animationDelay: `${(logs.length + index) * 0.07}s` }}
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

const classifyLogLine = (line: string): "error" | "success" | "warning" | "info" => {
  // ── Success FIRST so "no errors" lines are never misclassified as error ──
  if (
    /no\s+\w*\s*errors?/i.test(line) ||
    /no structural errors?/i.test(line) ||
    /completed|success/i.test(line) ||
    /types? match/i.test(line) ||
    /no coercion needed/i.test(line) ||
    /variables? .*declared/i.test(line) ||
    /types are compatible/i.test(line) ||
    /all good/i.test(line) ||
    /binding.*symbol table/i.test(line) ||
    /i'm now binding/i.test(line) ||
    /entry recorded/i.test(line) ||
    /everything checks out/i.test(line) ||
    /matches expected rule/i.test(line) ||
    /initialized/i.test(line) ||
    /has been updated/i.test(line) ||
    /done!/i.test(line) ||
    /properly terminated/i.test(line)
  ) {
    return "success";
  }
  // ── Warning: yellow messages from the backend (_yellow()) ──
  if (
    /i'll discard/i.test(line) ||
    /discard this assignment/i.test(line) ||
    /inferred type/i.test(line) ||
    /wasn't able to evaluate/i.test(line) ||
    /go ahead and create an entry/i.test(line) ||
    /phrase-level recovery/i.test(line) ||
    /panic mode recovery/i.test(line)
  ) {
    return "warning";
  }
  // ── Error: red messages from the backend (_red()) ──
  if (
    /error|mismatch|unexpected|invalid/i.test(line) ||
    /can't allow/i.test(line) ||
    /can't find.*symbol table/i.test(line) ||
    /can't output/i.test(line) ||
    /never declared/i.test(line) ||
    /isn't numeric/i.test(line) ||
    /hasn't been declared yet.*can't/i.test(line)
  ) {
    return "error";
  }
  if (/found|accept/i.test(line)) {
    return "success";
  }
  return "info";
};

const parserBubbleClass = (severity: "error" | "success" | "warning" | "info") => {
  if (severity === "error") {
    return "border-rose-500/40 bg-rose-500/5 text-rose-100";
  }
  if (severity === "success") {
    return "border-emerald-500/30 bg-emerald-500/5 text-emerald-100";
  }
  if (severity === "warning") {
    return "border-amber-400/40 bg-amber-400/10 text-amber-100";
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

const humanizeSemanticLine = (line: string): string => {
  const trimmed = line.trim();
  if (!trimmed) {
    return line;
  }

  if (/type mismatch/i.test(trimmed)) {
    const match = trimmed.match(/Type mismatch.*'([^']+)'.*Expected\s+(\w+)[,)]?\s*received\s+(\w+)/i);
    if (match) {
      return `I found a type mismatch. '${match[1]}' is '${match[2]}' but the value is '${match[3]}'.`;
    }
    return `I found a type mismatch. ${trimmed}`;
  }

  if (/no\s+\w*\s*errors?/i.test(trimmed)) {
    return "I did not find any semantic errors.";
  }

  if (/types? match/i.test(trimmed) || /no coercion needed/i.test(trimmed)) {
    return "I checked the types and they match, so no coercion is needed.";
  }

  if (/binding variable/i.test(trimmed)) {
    return trimmed.replace(/binding variable/i, "I am binding the variable");
  }

  if (/reassignment/i.test(trimmed)) {
    return trimmed.replace(/reassignment of/i, "I am reassigning");
  }

  if (/output evaluated to/i.test(trimmed)) {
    return trimmed.replace(/output evaluated to/i, "I evaluated the output to");
  }

  if (/condition variables are valid/i.test(trimmed)) {
    return "I checked the condition variables and they look valid.";
  }

  if (/else block header processed/i.test(trimmed)) {
    return "I processed the else block header.";
  }

  if (/^hint[:\s]/i.test(trimmed) || /hint/i.test(trimmed)) {
    const cleanedHint = trimmed.replace(/^hint[:\s]*/i, "").trim();
    if (cleanedHint) {
      return `To fix this, ${cleanedHint} and try again.`;
    }
    return "To fix this, update the code and try again.";
  }

  return trimmed;
};

const isSemanticErrorLine = (line: string): boolean => {
  if (/no\s+\w*\s*errors?/i.test(line) || /no errors found/i.test(line)) {
    return false;
  }
  return /error|mismatch|invalid/i.test(line);
};

const buildSemanticFailureMessage = (logs: string[]): string | null => {
  const mismatchLine = logs.find((line) => /type mismatch/i.test(line));
  if (mismatchLine) {
    const match = mismatchLine.match(/Type mismatch.*'([^']+)'.*Expected\s+(\w+)[,)]?\s*received\s+(\w+)/i);
    if (match) {
      const identifier = match[1];
      const expected = match[2];
      const received = match[3];
      return `Semantic Analyzer detected a type mismatch. The identifier ${identifier} was defined as ${expected}, but you are trying to provide a ${received} value. That conflicts with PseudoScript rules for ${expected} assignments. Assignment blocked.`;
    }
    return `Semantic Analyzer detected a type mismatch. ${mismatchLine.trim()} That conflicts with PseudoScript assignment rules. Assignment blocked.`;
  }
  if (logs.some((line) => isSemanticErrorLine(line))) {
    return "Semantic Analyzer detected an error. That input conflicts with PseudoScript rules. Assignment blocked.";
  }
  return null;
};

const buildParserSuccessMessage = (logs: string[]): string | null => {
  const hasErrors = logs.some((line) => /error|invalid|unexpected/i.test(line));
  if (hasErrors || logs.length === 0) {
    return null;
  }
  return "Parser has successfully created the Parse Tree. The sentence structure is grammatically correct according to PseudoScript rules. The Abstract Syntax Tree (AST) is complete.";
};

const formatSemanticText = (text: string): string => {
  const lines = text.split("\n");
  const formatted: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    const isHint = /^hint[:\s]/i.test(trimmed) || /hint/i.test(trimmed);
    const humanized = humanizeSemanticLine(line);
    if (isHint && formatted.length > 0) {
      formatted[formatted.length - 1] = `${formatted[formatted.length - 1]} ${humanized}`.trim();
      return;
    }
    formatted.push(humanized);
  });

  return formatted.join("\n");
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
  const parserSuccessMessage = useMemo(() => buildParserSuccessMessage(filteredLogs), [filteredLogs]);
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
        {parserSuccessMessage && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-100">
            <span className="text-[0.6rem] uppercase tracking-[0.4em] text-emerald-200">Parser</span>
            <p className="mt-1 whitespace-pre-wrap font-mono text-xs">{parserSuccessMessage}</p>
          </div>
        )}
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
          const parserLabelColor =
            severity === "error" ? "text-rose-200" :
            severity === "success" ? "text-emerald-200" :
            severity === "warning" ? "text-amber-200" :
            "text-white/60";
            return (
              <div
                key={`${cleaned}-${index}`}
                className={clsx("rounded-2xl border px-4 py-3", bubbleClasses)}
                style={{ animationName: "bubbleFadeIn", animationDuration: "0.35s", animationFillMode: "both", animationDelay: `${index * 0.07}s` }}
              >
                <span className={clsx("text-[0.6rem] uppercase tracking-[0.4em]", parserLabelColor)}>Parser</span>
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
  hasAnnotatedTree,
  onOpenAnnotatedTree,
}: {
  logs: string[];
  fallbackOutput: string;
  annotatedTree: ParseTreeNode[];
  hasAnnotatedTree?: boolean;
  onOpenAnnotatedTree?: () => void;
}) => {
  const filteredLogs = useMemo(() => filterSemanticLogs(logs), [logs]);
  const groupedLogs = useMemo(() => groupSemanticLogs(filteredLogs), [filteredLogs]);
  const failureMessage = useMemo(() => buildSemanticFailureMessage(filteredLogs), [filteredLogs]);
  const fixMessage = useMemo(() => {
    const hintLine = filteredLogs.find((line) => /hint/i.test(line));
    if (hintLine) {
      const cleanedHint = hintLine.replace(/^hint[:\s]*/i, "").trim();
      if (cleanedHint) {
        return `To fix this, ${cleanedHint} and try again.`;
      }
    }
    if (failureMessage) {
      return "To fix this, make the value match the declared datatype and try again.";
    }
    return null;
  }, [filteredLogs, failureMessage]);
  const hasLogs = groupedLogs.length > 0;
  const hasFallback = Boolean(fallbackOutput.trim());
  const hasTree = annotatedTree.length > 0;

  if (hasLogs) {
    return (
      <div className="space-y-4">
        {failureMessage && (
          <div
            className="rounded-2xl border border-rose-500/40 bg-rose-500/5 px-4 py-3"
            style={{ animationName: "bubbleFadeIn", animationDuration: "0.35s", animationFillMode: "both", animationDelay: "0s" }}
          >
            <span className="text-[0.6rem] uppercase tracking-[0.4em] text-rose-200">Semantic</span>
            <p className="mt-1 whitespace-pre-wrap font-mono text-xs text-rose-100">{failureMessage}</p>
          </div>
        )}
        <div className="space-y-2">
          {groupedLogs.map((text, index) => {
            const lines = text.split("\n");
            const firstLine = lines[0] ?? text;
            const severity = classifyLogLine(firstLine);
            const bubbleClasses = parserBubbleClass(severity);
            const labelColor =
              severity === "error" ? "text-rose-200" :
              severity === "success" ? "text-emerald-200" :
              severity === "warning" ? "text-amber-200" :
              "text-white/60";
            const formattedText = formatSemanticText(text);
            return (
              <div
                key={`semantic-${index}`}
                className={clsx("rounded-2xl border px-4 py-3", bubbleClasses)}
                style={{ animationName: "bubbleFadeIn", animationDuration: "0.35s", animationFillMode: "both", animationDelay: `${(failureMessage ? 1 : 0) * 0.1 + index * 0.07}s` }}
              >
                <span className={clsx("text-[0.6rem] uppercase tracking-[0.4em]", labelColor)}>Semantic</span>
                <p className="mt-1 whitespace-pre-wrap font-mono text-xs">{formattedText}</p>
              </div>
            );
          })}
        </div>
        {fixMessage && (
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/85">
            <span className="text-[0.6rem] uppercase tracking-[0.4em] text-white/60">Fix</span>
            <p className="mt-1 whitespace-pre-wrap font-mono text-xs">{fixMessage}</p>
          </div>
        )}
        {hasTree && hasAnnotatedTree && onOpenAnnotatedTree && (
          <div>
            <button
              type="button"
              onClick={onOpenAnnotatedTree}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
            >
              View Annotated Parse Tree
            </button>
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
        {hasTree && hasAnnotatedTree && onOpenAnnotatedTree && (
          <div>
            <button
              type="button"
              onClick={onOpenAnnotatedTree}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
            >
              View Annotated Parse Tree
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-white/40">Semantic analyzer idle. Run the compiler to populate this tab.</p>
      {hasTree && hasAnnotatedTree && onOpenAnnotatedTree && (
        <div>
          <button
            type="button"
            onClick={onOpenAnnotatedTree}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
          >
            View Annotated Parse Tree
          </button>
        </div>
      )}
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

const SymbolTableTab = ({ data, success }: { data: SymbolTableData | null; success?: boolean | null }) => {
  if (success === false) {
    return (
      <p className="text-white/70">
        Because the other phases have failed, I am not able to generate a symbol table. Please fix it and try again.
      </p>
    );
  }
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
        <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0e1222]">
          <table className="w-full text-left text-[0.75rem]">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-2 font-semibold">Scope Level</th>
                <th className="px-4 py-2 font-semibold">Total Space</th>
              </tr>
            </thead>
            <tbody>
              {data.scopes.map((scope) => (
                <tr key={scope.level} className="border-t border-white/5 text-white/80">
                  <td className="px-4 py-2 font-semibold">{scope.label}</td>
                  <td className="px-4 py-2">{scope.memory} bytes</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TreeModal = ({
  nodes,
  onClose,
  title,
  includeNotes = false,
}: {
  nodes: ParseTreeNode[];
  onClose: () => void;
  title: string;
  includeNotes?: boolean;
}) => {
  const diagramDefinition = useMemo(() => buildMermaidGraph(nodes, includeNotes), [nodes, includeNotes]);
  const hasNodes = nodes.length > 0;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div className="relative flex h-full w-full items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-[#05070f] p-6 text-white shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40">Modal</p>
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
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
            Visual representation generated with Mermaid. Use the zoom controls to inspect details.
          </p>
          <div className="mt-6 max-h-[70vh] overflow-auto rounded-2xl border border-white/10 bg-[#0a0d17]/80 p-4">
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
  const [scale, setScale] = useState(1);

  const zoomIn = () => setScale((value) => Math.min(value + 0.15, 2.5));
  const zoomOut = () => setScale((value) => Math.max(value - 0.15, 0.5));
  const resetZoom = () => setScale(1);

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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-[0.6rem] uppercase tracking-[0.3em]">
        <button
          type="button"
          onClick={zoomOut}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/70 transition hover:bg-white/10"
        >
          Zoom Out
        </button>
        <button
          type="button"
          onClick={resetZoom}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/70 transition hover:bg-white/10"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={zoomIn}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/70 transition hover:bg-white/10"
        >
          Zoom In
        </button>
      </div>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
    </div>
  );
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
  let inLexemeTable = false;

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
      // Filter lexeme table output — already shown in the UI's dedicated table
      if (/^Lexeme Table/i.test(cleaned) || /^Lexeme\s+Token/i.test(cleaned)) {
        inLexemeTable = true;
        return;
      }
      if (inLexemeTable) {
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
        /PLEASE FIX/i.test(cleaned) ||
        /^↳\s*hint/i.test(cleaned) ||
        /^hint[:\s]/i.test(cleaned);
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
