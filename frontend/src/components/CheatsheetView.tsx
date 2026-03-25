import CheatsheetIcon from "../../../assets/images/cheatsheet_icon.png";

type CheatsheetViewProps = {
  onBack: () => void;
  onGoToCompiler?: () => void;
};

const CheatsheetView = ({ onBack, onGoToCompiler }: CheatsheetViewProps) => {
  return (
    <div className="min-h-screen w-full bg-[#0f071c] text-white px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-xs uppercase tracking-[0.5em] text-white/50 hover:text-white transition"
            >
              ← desktop
            </button>
            {onGoToCompiler && (
              <button
                onClick={onGoToCompiler}
                className="rounded-xl bg-gradient-to-r from-[#c7b7ff] to-[#ffd9e2] px-4 py-2 text-xs font-semibold text-[#291022] transition hover:brightness-110"
              >
                Try in Compiler →
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <img src={CheatsheetIcon} alt="Cheatsheet" className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-display">PseudoScript Cheatsheet</h1>
              <p className="text-sm text-white/70">
                Keep this open on a second screen while you explore the studio.
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#f2ddff]">Data Types</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead className="text-white/60">
                  <tr>
                    <th className="py-2 pr-4">Keyword</th>
                    <th className="py-2 pr-4">Data Type</th>
                    <th className="py-2 pr-4">Width</th>
                    <th className="py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[
                    { keyword: "whole", type: "Integer", width: "4 bytes", note: "Non-fractional numbers." },
                    {
                      keyword: "decimal",
                      type: "Float / Double",
                      width: "8 bytes",
                      note: "Fractional numbers (unified precision).",
                    },
                    { keyword: "logic", type: "Boolean", width: "1 byte", note: "True or false states." },
                    { keyword: "text", type: "String / Char", width: "8 bytes", note: "Characters or sequences." },
                  ].map((row) => (
                    <tr key={row.keyword}>
                      <td className="py-2 pr-4 align-top">
                        <code className="rounded bg-white/10 px-2 py-0.5 text-xs text-white">{row.keyword}</code>
                      </td>
                      <td className="py-2 pr-4 align-top">{row.type}</td>
                      <td className="py-2 pr-4 align-top">{row.width}</td>
                      <td className="py-2 align-top">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#f2ddff]">Assignment Operator: `is`</h2>
            <p className="text-sm text-white/75">
              <strong className="text-white">Rule:</strong> `[data type] [identifier] is [literal | expression].`
            </p>
            <pre className="mt-3 rounded-xl bg-black/30 p-4 text-xs text-white/90">
{`whole score is 100.`}
            </pre>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#f2ddff]">Delimiters</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead className="text-white/60">
                  <tr>
                    <th className="py-2 pr-4">Purpose</th>
                    <th className="py-2 pr-4">Symbol</th>
                    <th className="py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[
                    { purpose: "Statement Terminator", symbol: ".", detail: "Marks the end of a statement." },
                    {
                      purpose: "Optional Block Header",
                      symbol: ":",
                      detail: "Introduces a single-line block or sets up indentation.",
                    },
                    { purpose: "Sequence Separator", symbol: ",", detail: "Distinguishes list items." },
                    { purpose: "Precedence & Grouping", symbol: "()", detail: "Override order of operations." },
                  ].map((row) => (
                    <tr key={row.purpose}>
                      <td className="py-2 pr-4 align-top">{row.purpose}</td>
                      <td className="py-2 pr-4 align-top">
                        <code className="rounded bg-white/10 px-2 py-0.5 text-xs text-white">{row.symbol}</code>
                      </td>
                      <td className="py-2 align-top text-white/80">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#f2ddff]">Output Keyword: `show`</h2>
            <p className="text-sm text-white/75">
              <strong className="text-white">Rule:</strong> `show [literal | identifier | expression].`
            </p>
            <p className="text-sm text-white/70">
              No parentheses required. Everything after `show` and before the period is output, and you can mix math
              or concatenation inline.
            </p>
            <pre className="mt-3 rounded-xl bg-black/30 p-4 text-xs text-white/90">
{`show 9 + 5.
show "The total is " + price.`}
            </pre>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#f2ddff]">Grouping / Scoping</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-white/75">
              <li>Off-side rule / indentation defines blocks.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#f2ddff]">Keywords</h2>
            <p className="text-sm text-white/80">
              `whole`, `decimal`, `logic`, `text`, `is`, `show`, `while`, `step`, `until`, `if`, `then`, `else`,
              `elseif`, `true`, `false`, `by`, `times`, `from`, `to`
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#f2ddff]">Valid Identifiers</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-white/75">
              <li>Must start with a letter.</li>
              <li>May include numbers and underscores.</li>
              <li>No spaces or special characters (e.g., @, $, %).</li>
              <li>Case-sensitive (`Score` ≠ `score`).</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#f2ddff]">Operators</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead className="text-white/60">
                  <tr>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2">Symbols / Keywords</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[
                    { label: "Assignment", values: ["is"] },
                    { label: "Arithmetic", values: ["+", "-", "*", "/", "++", "--", "increase", "decrease"] },
                    { label: "Comparison", values: ["=", "!=", "<", ">", "<=", ">="] },
                    { label: "Logical", values: ["and", "or", "not"] },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="py-2 pr-4 align-top">{row.label}</td>
                      <td className="py-2 align-top text-white/80">
                        <div className="flex flex-wrap gap-2">
                          {row.values.map((value) => (
                            <code key={value} className="rounded bg-white/10 px-2 py-0.5 text-xs text-white">
                              {value}
                            </code>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#f2ddff]">Control Structures</h2>
            <div className="space-y-5 text-sm text-white/80">
              <div>
                <h3 className="font-semibold text-white">`while` loop</h3>
                <p>Runs while the condition holds; compiler nudges counters by ±1 if you forget.</p>
                <pre className="mt-2 rounded-xl bg-black/30 p-4 text-xs text-white/90">
{`while counter < 10
    show "Counting Down: " + counter.
    increase counter by 1.`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white">`step-to` loop</h3>
                <p>Range-based iteration with friendly keywords.</p>
                <pre className="mt-2 rounded-xl bg-black/30 p-4 text-xs text-white/90">
{`step whole num by 2 from 1 to 10:
    show num.`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white">`if-then-else`</h3>
                <pre className="mt-2 rounded-xl bg-black/30 p-4 text-xs text-white/90">
{`if num = 0 then
    show "Zero.".
elseif num = 1 then
    show "One.".
else
    show "Others.".`}
                </pre>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#f2ddff]">Notes on the Statement Terminator (`.`)</h2>
            <p className="text-sm text-white/75">
              Acts as a synchronization point so the compiler can recover from errors. Use it at the end of every
              standalone statement and every line inside a control block.
            </p>
            <div className="mt-3 space-y-3">
              <pre className="rounded-xl bg-black/30 p-4 text-xs text-white/90">
{`whole num is 0.
sum is 9 + 5.
show num.`}
              </pre>
              <pre className="rounded-xl bg-black/30 p-4 text-xs text-white/90">
{`while num < 14
    show num.
    increase num by 1.`}
              </pre>
              <pre className="rounded-xl bg-black/30 p-4 text-xs text-white/90">
{`if num = 14 then
    show "Fourteen".
else
    show "Others".`}
              </pre>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Skip the period on headers (`while`, `if`, etc.). Indentation closes blocks automatically with no extra
              punctuation.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
};

export default CheatsheetView;
