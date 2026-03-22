import clsx from "clsx";

type OutputTabsProps = {
  output: string;
  isCompiling?: boolean;
  error?: string | null;
  success?: boolean | null;
};

const OutputTabs = ({ output, isCompiling, error, success }: OutputTabsProps) => {
  const hasOutput = Boolean(output?.trim());
  const statusLabel = success === null ? "idle" : success ? "success" : "failed";
  const statusColor = success === null ? "bg-white/30" : success ? "bg-emerald-400" : "bg-rose-400";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#090c16] text-white shadow-glass">
      <div className="flex items-center gap-3 border-b border-white/5 bg-[#05070f] px-6 py-4 text-[0.7rem] uppercase tracking-[0.35em] text-white/40">
        <span className="inline-flex gap-1 text-white/25">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </span>
        Terminal Output
        <span className="ml-auto flex items-center gap-2 text-[0.55rem] tracking-[0.2em]">
          <span className={clsx("h-2 w-2 rounded-full", statusColor)} />
          {statusLabel}
        </span>
      </div>

      <div className="border-t border-white/5 bg-[#05070f] px-6 py-5 font-mono text-xs leading-relaxed text-[#cdd5f5]">
        {isCompiling && (
          <p className="animate-pulse text-white/60">Running lexer → parser → semantic analyzer...</p>
        )}

        {!isCompiling && error && (
          <p className="whitespace-pre-wrap text-rose-200">{error}</p>
        )}

        {!isCompiling && !error && hasOutput && (
          <pre className="whitespace-pre-wrap">{output}</pre>
        )}

        {!isCompiling && !error && !hasOutput && (
          <p className="text-white/40">
            Terminal standing by. Write some code on the left and hit Run Compiler to see the explainability logs.
          </p>
        )}
      </div>
    </div>
  );
};

export default OutputTabs;
