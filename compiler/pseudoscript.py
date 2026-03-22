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

from lexer import Lexer
from parser import Parser
from semantic import SemanticAnalyzer


# ═════════════════════════════════════════════════════════════════════
#  SYMBOL TABLE PRINTER
# ═════════════════════════════════════════════════════════════════════
def print_symbol_table(table):
    if not table:
        print("\n  Symbol Table is empty.")
        return

    print()
    print("─" * 60)
    print("  SYMBOL TABLE")
    print("─" * 60)
    print(f"  {'Name':<20} {'Type':<12} {'Value'}")
    print(f"  {'─'*20} {'─'*12} {'─'*20}")
    for name, info in table.items():
        dtype = info['datatype']
        val   = info['value']
        print(f"  {name:<20} {dtype:<12} {val!r}")
    print()


# ═════════════════════════════════════════════════════════════════════
#  COMPILER PIPELINE -- runs all three phases
# ═════════════════════════════════════════════════════════════════════
def compile_line(source, symbol_table):
    """
    Run a single line/statement of PseudoScript through
    Lexical -> Syntax -> Semantic analysis.
    Returns True if no errors.
    """
    # Phase 1: Lexer
    lexer = Lexer(source.strip())
    tokens = lexer.tokenize()

    if not tokens:
        return True  # empty line

    # Phase 2: Parser
    parser = Parser(tokens)
    ast = parser.parse()

    if parser.errors:
        return False

    # Phase 3: Semantic Analyzer
    analyzer = SemanticAnalyzer(symbol_table)
    ok = analyzer.analyze(ast)

    return ok


# ═════════════════════════════════════════════════════════════════════
#  DEMO: RUN PREDEFINED TEST CASES
# ═════════════════════════════════════════════════════════════════════
def run_demo():
    symbol_table = {}

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
    symbol_table = {}

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
            line = input("ps> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not line:
            continue

        cmd = line.lower()

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
            compile_line(line, symbol_table)


# ═════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ═════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        run_demo()
    else:
        repl()
