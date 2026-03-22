import type { ChangeEvent } from "react";

type CodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  onRun?: () => void;
  isRunning?: boolean;
  onGenerateRandom?: () => void;
  onOpenCheatsheet?: () => void;
};

const CodeEditor = ({
  value,
  onChange,
  onRun,
  isRunning,
  onGenerateRandom,
  onOpenCheatsheet,
}: CodeEditorProps) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event.target.value);
  };

  const handleRun = () => onRun?.();
  const handleGenerate = () => onGenerateRandom?.();
  const handleCheatsheet = () => onOpenCheatsheet?.();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1e1e30] shadow-[0_25px_60px_rgba(4,1,18,0.55)]">
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#161622] px-4 py-2 text-xs text-white/60">
        <span className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[0.65rem] uppercase tracking-[0.4em] text-white/50">editor</span>
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-full border border-white/10 bg-[#262641] px-4 py-1.5 text-[0.65rem] font-semibold text-white/85 transition hover:-translate-y-0.5 hover:border-white/30"
          >
            Random Code
          </button>
          <button
            type="button"
            onClick={handleCheatsheet}
            className="rounded-full border border-[#a17bff]/40 bg-white/95 px-4 py-1.5 text-[0.65rem] font-semibold text-[#311356] transition hover:-translate-y-0.5 hover:border-[#a17bff]/80"
          >
            Cheatsheet
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7435c4] to-[#9b40f8] px-4 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
            aria-label="Run code"
          >
            <PlayIcon className="h-3.5 w-3.5" />
            {isRunning ? "Running" : "Run"}
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        className="h-[26rem] w-full resize-none bg-transparent px-5 py-4 font-mono text-sm leading-relaxed text-[#f8f7ff] outline-none"
        spellCheck={false}
      />
      <div className="border-t border-white/5 bg-[#161622] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[0.65rem] text-white/50">
          <span>Spaces: 4 | UTF-8 | LF</span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>
    </div>
  );
};

const PlayIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M5 3.8v12.4a.8.8 0 0 0 1.2.7l9.6-6.2a.8.8 0 0 0 0-1.4L6.2 3.1A.8.8 0 0 0 5 3.8Z" />
  </svg>
);

export default CodeEditor;
