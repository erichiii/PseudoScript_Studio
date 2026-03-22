"""
╔══════════════════════════════════════════════════════════════════════╗
║                    PSEUDOSCRIPT COMPILER FRONT-END                  ║
║                                                                    ║
║  A compiler front-end for PseudoScript -- an English-like language  ║
║  designed for beginner programmers. This module implements:         ║
║    - Lexical Analysis  (Tokenizer)          -> lexer.py            ║
║    - Syntax Analysis   (Parser)             -> parser.py           ║
║    - Semantic Analysis (Type Checker/Bind)  -> semantic.py         ║
║    - The Explainability Layer -- the compiler talks to you!        ║
║                                                                    ║
║  Shared components:                                                ║
║    - Token types & lookup tables            -> tokens.py           ║
║                                                                    ║
║  Language Quick Reference:                                         ║
║    Data Types : whole, decimal, logic, text                        ║
║    Assign Op  : is                                                 ║
║    Delimiter  : . (period)                                         ║
║    Output     : show                                               ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import sys
from collections import defaultdict

try:  # Support both package and standalone execution
    from .lexer import Lexer
    from .parser import Parser
    from .semantics import SemanticAnalyzer
    from .symbol_table import SymbolTable
except ImportError:  # pragma: no cover - fallback for script execution
    from lexer import Lexer
    from parser import Parser
    from semantics import SemanticAnalyzer
    from symbol_table import SymbolTable


# ═════════════════════════════════════════════════════════════════════
#  SYMBOL TABLE PRINTER
# ═════════════════════════════════════════════════════════════════════
def print_symbol_table(symbol_table, *, records=None, title="SYMBOL TABLE"):
    if records is None:
        records = list(symbol_table.items())
        totals = symbol_table.memory_per_scope()
    else:
        totals = defaultdict(int)
        for _, info in records:
            scope = info.get('scope', 0)
            totals[scope] += info.get('bytes', 0)

    if not records:
        print("\n  Symbol Table is empty.")
        return

    print()
    print("─" * 60)
    print(f"  {title}")
    print("─" * 60)
    print(f"  {'Name':<16} {'Type':<10} {'Scope':<5} {'Bytes':<5} {'Value'}")
    print(f"  {'─'*16} {'─'*10} {'─'*5} {'─'*5} {'─'*20}")
    for name, info in records:
        dtype = info['datatype']
        val = info['value']
        scope = info.get('scope', 0)
        memory = info.get('bytes', 0)
        print(f"  {name:<16} {dtype:<10} {scope:<5} {memory:<5} {val!r}")

    print("\n  Total Memory per Scope:")
    for scope, total in sorted(totals.items()):
        label = "GLOBAL" if scope == 0 else f"LEVEL {scope}"
        print(f"    - {label}: {total} byte(s)")
    print()


# ═════════════════════════════════════════════════════════════════════
#  COMPILER PIPELINE -- runs all three phases
# ═════════════════════════════════════════════════════════════════════
def compile_line(source, symbol_table):
    """
    Run a single line/statement of PseudoScript through
    Lexical -> Syntax -> Semantic analysis.
    Returns a report dictionary with success status.
    """
    report = {"success": False, "source": source}

    lexer = Lexer(source.strip())
    tokens = lexer.tokenize()
    report["tokens"] = tokens

    if not tokens:
        report["success"] = True
        return report

    if lexer.had_errors:
        Parser.announce_blocked("there's an error found in the lexical analysis phase")
        SemanticAnalyzer.announce_blocked("the syntax analyzer could not run because lexical analysis failed")
        return report

    parser = Parser(tokens)
    ast, tree = parser.parse()
    report["ast"] = ast
    report["parse_tree"] = tree
    report["node_map"] = parser.node_map

    if parser.errors:
        SemanticAnalyzer.announce_blocked("the syntax analysis phase reported structural errors")
        return report

    analyzer = SemanticAnalyzer(symbol_table)
    ok = analyzer.analyze(ast, tree, parser.node_map)
    report["success"] = ok

    # Annotated parse tree with semantic notes
    parser.render_parse_tree(show_annotations=True)

    # Show incremental symbol table snapshots for each statement that changed it
    for snapshot in analyzer.snapshots:
        print_symbol_table(symbol_table, records=snapshot["records"], title=f"SYMBOL TABLE ({snapshot['label']})")

    print_symbol_table(symbol_table)

    return report


class PseudoScriptCompiler:
    """Convenience wrapper that preserves the symbol table across compilations."""

    def __init__(self):
        self.symbol_table = SymbolTable()
        self._last_report = None

    def compile(self, source):
        self._last_report = compile_line(source, self.symbol_table)
        return self._last_report

    def reset(self):
        self.symbol_table.clear()

    def print_full_report(self):
        if not self._last_report:
            return "No compilation has been executed yet."
        status = "SUCCESS" if self._last_report.get("success") else "FAILED"
        tokens = self._last_report.get("tokens", [])
        token_summary = ", ".join(f"{tok.type}:{tok.value}" for tok in tokens) or "<no tokens>"
        return f"Last compilation {status}. Tokens => {token_summary}"


# ═════════════════════════════════════════════════════════════════════
#  DEMO: RUN PREDEFINED TEST CASES
# ═════════════════════════════════════════════════════════════════════
def run_demo():
    symbol_table = SymbolTable()

    test_cases = [
        ("Test 1 -- Perfect Assignment (whole)",                 'whole age is 20.'),
        ("Test 2 -- Semantic Error: Type Mismatch",              'whole age is "Twenty".'),
        ("Test 3 -- String Declaration",                         'text name is "Alice".'),
        ("Test 4 -- Decimal Declaration",                        'decimal pi is 3.14.'),
        ("Test 5 -- Boolean Declaration",                        'logic flag is true.'),
        ("Test 6 -- Math Expression in Assignment",              'whole total is 10 + 5.'),
        ("Test 7 -- Show Statement",                             'show "Hello, PseudoScript!".'),
        ("Test 8 -- Show with Variable Reference",               'show "Name is " + name.'),
        ("Test 9 -- Missing Delimiter (Phrase-Level Recovery)",  'whole score is 100'),
        ("Test 10 -- Unknown Token (Panic Mode Recovery)",       'whole x is @#$ 50.'),
        ("Test 11 -- While Loop Header",                         'while counter < 10'),
        ("Test 12 -- If-Then Header",                            'if score > 90 then'),
        ("Test 13 -- Increase Statement",                        'increase age by 1.'),
        ("Test 14 -- Step Loop (from-to)",                       'step whole i from 1 to 10'),
    ]

    for title, code in test_cases:
        print()
        print("=" * 60)
        print(f"  {title}")
        print("=" * 60)
        print(f"  Input: {code}")

        compile_line(code, symbol_table)

    # Print final symbol table
    print_symbol_table(symbol_table)


# ═════════════════════════════════════════════════════════════════════
#  INTERACTIVE REPL
# ═════════════════════════════════════════════════════════════════════
def repl():
    symbol_table = SymbolTable()

    banner = """
╔══════════════════════════════════════════════════════════════╗
║         ____                     __     ____        _       ║
║        / __ \\___  ___ __ _____  / /__  / __/_______(_)__  __║
║       / /_/ (_-< / -_) // / _ \\/ / _ \\_\\ \\/ __/ __/ / _ \\/ _║
║      / .___/___/ \\__/\\_,_/\\_,_/_/\\___/___/\\__/_/ /_/ .__/\\__║
║     /_/                                           /_/       ║
║                                                             ║
║         PseudoScript Compiler Front-End  v1.0               ║
║         Type your PseudoScript code below.                  ║
╠═════════════════════════════════════════════════════════════ ║
║  Multi-line Input:                                          ║
║    - Type your code, pressing Enter between lines           ║
║    - Type 's' (alone) to submit and compile                 ║
║    - Type 'q' (alone) to quit the compiler                  ║
║    - Type '<<' to step out one indent level                 ║
║    - Type 'clear indent' to reset indentation               ║
║                                                             ║
║  Commands:                                                  ║
║    table   -> View the Symbol Table                         ║
║    demo    -> Run all demo test cases                       ║
║    clear   -> Clear the Symbol Table                        ║
║    help    -> Show this help message                        ║
║    exit    -> Quit the compiler                             ║
╚══════════════════════════════════════════════════════════════╝
"""
    print(banner)

    while True:
        try:
            # Get multi-line input from the user
            print("\nEnter lines of code. Type 's' to submit, or 'q' to quit:")
            input_lines = []
            indent_level = 0  # Track current indentation level
            
            while True:
                # Calculate prompt based on current indentation level
                prompt = "    " * indent_level + ("  " if input_lines else "ps> ")
                line = input(prompt)
                
                if line.lower() == 'q':
                    print("\nGoodbye!")
                    return
                if line == 's':
                    break
                
                stripped = line.lstrip()
                stripped_lower = stripped.lower()
                user_indent = len(line) - len(stripped)

                # Support commands to adjust indentation manually
                if stripped_lower in {"<<", "dedent"}:
                    indent_level = max(0, indent_level - 1)
                    print(f"(indent level -> {indent_level})")
                    continue
                if stripped_lower in {"<<<", "reset indent", "clear indent"}:
                    indent_level = 0
                    print("(indent level reset to 0)")
                    continue

                # Skip empty lines but maintain current indentation context
                if not stripped:
                    continue

                # Determine the target indentation to apply to this line
                target_indent = indent_level
                if stripped_lower.startswith("elseif") or stripped_lower.startswith("else"):
                    target_indent = max(indent_level - 1, 0)

                # If user left indentation empty but we're inside a block, auto-indent
                if user_indent == 0 and target_indent > 0:
                    line = ("    " * target_indent) + stripped
                    user_indent = target_indent * 4

                input_lines.append(line)

                # Decide indentation level for the next prompt
                next_indent = indent_level
                if stripped_lower and not stripped_lower.startswith("show"):
                    opens_block = any(stripped_lower.startswith(kw) for kw in ["if", "while", "step", "for"])
                    if opens_block and ("then" in stripped_lower or stripped_lower.startswith("while") or stripped_lower.startswith("step") or stripped_lower.startswith("for") or ":" in stripped):
                        next_indent = target_indent + 1
                    elif stripped_lower.startswith("elseif") or stripped_lower.startswith("else"):
                        next_indent = target_indent + 1
                if next_indent == indent_level:
                    actual_indent = len(line) - len(line.lstrip())
                    next_indent = max(0, actual_indent // 4)

                indent_level = next_indent

            # Join lines and process
            user_input = "\n".join(input_lines).strip()

            if not user_input:
                continue

            cmd = user_input.lower()

            # Check for built-in commands
            if cmd == "exit" or cmd == "quit":
                print("\nGoodbye!")
                break
            elif cmd == "table":
                print_symbol_table(symbol_table)
            elif cmd == "demo":
                run_demo()
            elif cmd == "clear":
                symbol_table.clear()
                print("Symbol Table cleared.")
            elif cmd == "help":
                print("""
  PseudoScript Language Quick Reference:
  ──────────────────────────────────────
  Data Types:   whole, decimal, logic, text
  Assignment:   <type> <name> is <value>.
  Output:       show <expression>.
  If block:     if <condition> then
  While loop:   while <condition>
  Increment:    increase <var> by <expr>.
  Delimiter:    . (period at end of statement)

  Examples:
    whole score is 100.
    text greeting is "Hello".
    show greeting.
    increase score by 10.
""")
            else:
                # Treat the entire input block as one unit
                full_input = "\n".join(input_lines)
                print(f"\n  Input:\n{full_input}\n")
                compile_line(full_input, symbol_table)

        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break


# ═════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ═════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        run_demo()
    else:
        repl()
