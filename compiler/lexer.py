"""
PseudoScript Compiler Front-End
===============================
Phase 1: The Lexer (Lexical Analysis)

Breaks a raw source string into a list of Tokens using regex pattern matching.
Prints every token it finds (Explainability Layer).
"""

import re

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
    Prints every token it finds (Explainability Layer).
    """

    def __init__(self, source):
        self.source = source
        self.tokens = []
        self.unknown_count = 0

    def tokenize(self):
        print()
        print("─" * 60)
        print("  STARTING LEXICAL ANALYSIS")
        print("─" * 60)

        for match in TOKEN_REGEX.finditer(self.source):
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
                print(f"  [LEXER] Found '{lexeme}'  -> UNKNOWN TOKEN  !!")
            else:
                print(f"  [LEXER] Found {f'{chr(39)}{lexeme}{chr(39)}':<16} -> Identified as {token_type}")

        # ── summary ─────────────────────────────────────────────────
        if self.unknown_count == 0:
            print(f"\n  Lexical Analysis Complete. 0 Unknown Tokens.")
        else:
            print(f"\n  !! Lexical Analysis Complete. {self.unknown_count} Unknown Token(s) found.")

        return self.tokens
