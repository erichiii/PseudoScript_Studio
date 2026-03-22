import { useState } from "react";

type CodeEditorProps = {
  initialValue: string;
  onChange?: (value: string) => void;
};

const CodeEditor = ({ initialValue, onChange }: CodeEditorProps) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
    onChange?.(event.target.value);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#1e1e30] shadow-glass">
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#161622] px-4 py-2 text-xs text-white/60">
        <span className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </span>
        <div className="ml-4 flex gap-3">
          <span className="rounded-t bg-[#1e1e30] px-3 py-1 text-white">main.ps</span>
          <span className="rounded-t px-3 py-1">scratch.ps</span>
        </div>
        <span className="ml-auto text-[0.65rem] uppercase tracking-[0.4em]">editor</span>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        className="h-72 w-full resize-none bg-transparent px-5 py-4 font-mono text-sm leading-relaxed text-[#f8f7ff] outline-none"
      />
      <div className="flex items-center justify-between border-t border-white/5 bg-[#161622] px-4 py-2 text-[0.65rem] text-white/60">
        <span>Spaces: 4 | UTF-8 | LF</span>
        <span>Ln 1, Col 1</span>
      </div>
    </div>
  );
};

export default CodeEditor;
