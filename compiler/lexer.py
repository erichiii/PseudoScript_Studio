"""
PseudoScript Compiler Front-End
===============================
Phase 1: The Lexer (Lexical Analysis)

Breaks a raw source string into a list of Tokens using regex pattern matching.
Prints every token it finds (Explainability Layer).
"""

import re

try:
    from .tokens import Token, TokenType
except ImportError:  # pragma: no cover
    from tokens import Token, TokenType


# ─────────────────────────────────────────────────────────────────────
#  REGEX TOKEN PATTERNS
#  Order matters! Patterns listed first take priority.
# ─────────────────────────────────────────────────────────────────────
TOKEN_PATTERNS = [
    # ── Keywords & Data Types ───────────────────────────────────────
    ("DATATYPE",        r"\b(whole|decimal|logic|text)\b"),
    ("SHOW",            r"\bshow\b"),
    ("IF",              r"\bif\b"),
    ("THEN",            r"\bthen\b"),
    ("ELSEIF",          r"\belseif\b"),
    ("ELSE",            r"\belse\b"),
    ("WHILE",           r"\bwhile\b"),
    ("STEP",            r"\bstep\b"),
    ("FROM",            r"\bfrom\b"),
    ("TO",              r"\bto\b"),
    ("BY",              r"\bby\b"),
    ("TIMES",           r"\btimes\b"),
    ("INCREASE",        r"\bincrease\b"),
    ("DECREASE",        r"\bdecrease\b"),
    ("LOGICAL_OP",      r"\b(and|or|not)\b"),
    ("BOOL_LITERAL",    r"\b(true|false)\b"),
    ("ASSIGN_OP",       r"\bis\b"),

    # ── Literals ────────────────────────────────────────────────────
    ("STRING_LITERAL",  r'"[^"\n]*"'),
    ("DECIMAL_LITERAL", r"\b\d+\.\d+\b"),
    ("NUMERIC_LITERAL", r"\b\d+\b"),

    # ── Multi-char Operators ────────────────────────────────────────
    ("INCREMENT",       r"\+\+"),
    ("DECREMENT",       r"--"),
    ("COMP_OP",         r"!=|<=|>="),

    # ── Single-char Operators & Delimiters ──────────────────────────
    ("COMP_OP_SINGLE",  r"[=<>]"),
    ("ARITH_OP",        r"[+\-*/]"),
    ("DELIMITER",       r"\."),
    ("COLON",           r":"),
    ("COMMA",           r","),
    ("LPAREN",          r"\("),
    ("RPAREN",          r"\)"),

    # ── Identifiers ─────────────────────────────────────────────────
    ("IDENTIFIER",      r"\b[a-zA-Z_][a-zA-Z0-9_]*\b"),

    # ── Unknown / Invalid ──────────────────────────────────────────
    ("UNKNOWN",         r"[^\s]"),

    # ── Whitespace (skipped) ────────────────────────────────────────
    ("WHITESPACE",      r"\s+"),
]

# Compile all patterns into one master regex with named groups
TOKEN_REGEX = re.compile(
    "|".join(f"(?P<{name}>{pattern})" for name, pattern in TOKEN_PATTERNS)
)

# Map regex group names to TokenType constants
GROUP_TO_TOKEN_TYPE = {
    "DATATYPE":        TokenType.DATATYPE,
    "SHOW":            TokenType.SHOW,
    "IF":              TokenType.IF,
    "THEN":            TokenType.THEN,
    "ELSEIF":          TokenType.ELSEIF,
    "ELSE":            TokenType.ELSE,
    "WHILE":           TokenType.WHILE,
    "STEP":            TokenType.STEP,
    "FROM":            TokenType.FROM,
    "TO":              TokenType.TO,
    "BY":              TokenType.BY,
    "TIMES":           TokenType.TIMES,
    "INCREASE":        TokenType.INCREASE,
    "DECREASE":        TokenType.DECREASE,
    "LOGICAL_OP":      TokenType.LOGICAL_OP,
    "BOOL_LITERAL":    TokenType.BOOL_LITERAL,
    "ASSIGN_OP":       TokenType.ASSIGN_OP,
    "STRING_LITERAL":  TokenType.STRING_LITERAL,
    "DECIMAL_LITERAL": TokenType.DECIMAL_LITERAL,
    "NUMERIC_LITERAL": TokenType.NUMERIC_LITERAL,
    "INCREMENT":       TokenType.INCREMENT,
    "DECREMENT":       TokenType.DECREMENT,
    "COMP_OP":         TokenType.COMP_OP,
    "COMP_OP_SINGLE":  TokenType.COMP_OP,
    "ARITH_OP":        TokenType.ARITH_OP,
    "DELIMITER":       TokenType.DELIMITER,
    "COLON":           TokenType.COLON,
    "COMMA":           TokenType.COMMA,
    "LPAREN":          TokenType.LPAREN,
    "RPAREN":          TokenType.RPAREN,
    "IDENTIFIER":      TokenType.IDENTIFIER,
    "UNKNOWN":         TokenType.UNKNOWN,
}


class Lexer:
    """
    Breaks a raw source string into a list of Tokens using regex.
    Tracks indentation levels and generates INDENT/DEDENT tokens.
    Prints every token it finds (Explainability Layer).
    """

    def __init__(self, source):
        self.source = source
        self.tokens = []
        self.unknown_count = 0
        self.invalid_tokens = []
        self.had_errors = False
        self.indent_stack = [0]  # Stack of indentation levels, starts at 0

    def tokenize(self):
        print()
        print("─" * 60)
        print("  STARTING LEXICAL ANALYSIS")
        print("─" * 60)
        print("  [LEXER] Hello! I am the Lexical Analyzer. You can call me Lexer! I am responsible for breaking down your input into tokens.")
        print("  [LEXER] Reading the input...")
        print("  [LEXER] Generating tokens...")

        lines = self.source.split("\n")
        
        for line in lines:
            # Calculate indentation (4 spaces = 1 level)
            stripped = line.lstrip()
            if not stripped or stripped.startswith("#"):  # Skip empty lines and comments
                continue
            
            indent_level = (len(line) - len(stripped)) // 4
            current_indent = self.indent_stack[-1]
            
            # Generate DEDENT tokens if indentation decreased
            while indent_level < current_indent:
                self.indent_stack.pop()
                current_indent = self.indent_stack[-1]
                self.tokens.append(Token(TokenType.DEDENT, ""))
                print(f"  [LEXER] DEDENT (indent level now {current_indent})")
            
            # Generate INDENT token if indentation increased
            if indent_level > current_indent:
                self.indent_stack.append(indent_level)
                self.tokens.append(Token(TokenType.INDENT, ""))
                print(f"  [LEXER] INDENT (indent level now {indent_level})")
            
            # Tokenize the content of the line
            for match in TOKEN_REGEX.finditer(stripped):
                group_name = match.lastgroup
                lexeme = match.group(group_name)

                # Skip whitespace
                if group_name == "WHITESPACE":
                    continue

                # Resolve to TokenType
                token_type = GROUP_TO_TOKEN_TYPE.get(group_name, TokenType.UNKNOWN)

                tok = Token(token_type, lexeme)
                self.tokens.append(tok)

                # ── Explainability output ───────────────────────────────
                if token_type == TokenType.UNKNOWN:
                    self.unknown_count += 1
                    hint = self._hint_for_unknown(lexeme)
                    self.invalid_tokens.append((lexeme, hint))
                    print(f"  [LEXER] Found '{lexeme}'  -> UNKNOWN TOKEN !!")
                    print(f"           ↳ Hint: {hint}")
                else:
                    print(f"  [LEXER] Found {f'{chr(39)}{lexeme}{chr(39)}':<16} -> Identified as {token_type}")

        # Generate remaining DEDENT tokens at EOF
        while len(self.indent_stack) > 1:
            self.indent_stack.pop()
            self.tokens.append(Token(TokenType.DEDENT, ""))
            print(f"  [LEXER] DEDENT (indent level now {self.indent_stack[-1]})")

        # ── summary ─────────────────────────────────────────────────
        if self.unknown_count == 0:
            print("\n  [LEXER] Successfully generated tokens: NO ERRORS FOUND.")
        else:
            self.had_errors = True
            print("\n  [LEXER] I found the following invalid tokens:")
            for lexeme, hint in self.invalid_tokens:
                print(f"    - {lexeme}: {hint}")
            print("  [LEXER] Please fix the issues above before we can continue.")

        return self.tokens

    @staticmethod
    def _hint_for_unknown(lexeme):
        if lexeme and not lexeme[0].isalpha():
            return "Ensure that your identifier starts with a letter and contains only letters, digits, or underscores."
        if any(ch in lexeme for ch in {'@', '#', '$', '%', '&'}):
            return "Remove special symbols that are not part of the PseudoScript alphabet."
        return "Double-check the spelling or remove unsupported characters."
