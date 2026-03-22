"""
PseudoScript Compiler Front-End
===============================
Token types, Token class, and keyword/symbol lookup tables.
Shared across the lexer, parser, and semantic analyzer.
"""


# ─────────────────────────────────────────────────────────────────────
#  TOKEN TYPES
# ─────────────────────────────────────────────────────────────────────
class TokenType:
    DATATYPE        = "DATATYPE"
    IDENTIFIER      = "IDENTIFIER"
    ASSIGN_OP       = "ASSIGN_OP"
    NUMERIC_LITERAL = "NUMERIC_LITERAL"
    DECIMAL_LITERAL = "DECIMAL_LITERAL"
    STRING_LITERAL  = "STRING_LITERAL"
    BOOL_LITERAL    = "BOOL_LITERAL"
    DELIMITER       = "DELIMITER"
    COLON           = "COLON"
    COMMA           = "COMMA"
    LPAREN          = "LPAREN"
    RPAREN          = "RPAREN"
    ARITH_OP        = "ARITH_OP"
    INCREMENT       = "INCREMENT"
    DECREMENT       = "DECREMENT"
    COMP_OP         = "COMP_OP"
    LOGICAL_OP      = "LOGICAL_OP"
    SHOW            = "SHOW"
    IF              = "IF"
    THEN            = "THEN"
    ELSE            = "ELSE"
    ELSEIF          = "ELSEIF"
    WHILE           = "WHILE"
    STEP            = "STEP"
    FROM            = "FROM"
    TO              = "TO"
    BY              = "BY"
    TIMES           = "TIMES"
    INCREASE        = "INCREASE"
    DECREASE        = "DECREASE"
    INDENT          = "INDENT"
    DEDENT          = "DEDENT"
    UNKNOWN         = "UNKNOWN"


# ─────────────────────────────────────────────────────────────────────
#  TOKEN CLASS
# ─────────────────────────────────────────────────────────────────────
class Token:
    def __init__(self, token_type, value):
        self.type = token_type
        self.value = value

    def __repr__(self):
        return f"Token({self.type}, {self.value!r})"


# ─────────────────────────────────────────────────────────────────────
#  KEYWORD / SYMBOL MAPS
# ─────────────────────────────────────────────────────────────────────
DATATYPES = {"whole", "decimal", "logic", "text"}

KEYWORD_MAP = {
    "is":       TokenType.ASSIGN_OP,
    "show":     TokenType.SHOW,
    "if":       TokenType.IF,
    "then":     TokenType.THEN,
    "else":     TokenType.ELSE,
    "elseif":   TokenType.ELSEIF,
    "while":    TokenType.WHILE,
    "step":     TokenType.STEP,
    "from":     TokenType.FROM,
    "to":       TokenType.TO,
    "by":       TokenType.BY,
    "times":    TokenType.TIMES,
    "increase": TokenType.INCREASE,
    "decrease": TokenType.DECREASE,
    "and":      TokenType.LOGICAL_OP,
    "or":       TokenType.LOGICAL_OP,
    "not":      TokenType.LOGICAL_OP,
    "true":     TokenType.BOOL_LITERAL,
    "false":    TokenType.BOOL_LITERAL,
}

TWO_CHAR_SYMBOLS = {
    "++": TokenType.INCREMENT,
    "--": TokenType.DECREMENT,
    "!=": TokenType.COMP_OP,
    "<=": TokenType.COMP_OP,
    ">=": TokenType.COMP_OP,
}

ONE_CHAR_SYMBOLS = {
    ".": TokenType.DELIMITER,
    ":": TokenType.COLON,
    ",": TokenType.COMMA,
    "(": TokenType.LPAREN,
    ")": TokenType.RPAREN,
    "+": TokenType.ARITH_OP,
    "-": TokenType.ARITH_OP,
    "*": TokenType.ARITH_OP,
    "/": TokenType.ARITH_OP,
    "=": TokenType.COMP_OP,
    "<": TokenType.COMP_OP,
    ">": TokenType.COMP_OP,
}
