"""
PseudoScript Compiler Front-End
===============================
Phase 2: The Parser (Syntax Analysis)

Validates whether the token sequence forms a legal PseudoScript
statement.  Prints every rule it checks (Explainability Layer).
"""

from tokens import TokenType


class Parser:
    """
    Validates whether the token sequence forms a legal PseudoScript
    statement.  Prints every rule it checks (Explainability Layer).
    Supports:
        - Variable declaration / assignment
        - show (output) statements
        - increase / decrease statements
        - if / elseif / else blocks
        - while loops
        - step loops
        - Mathematical / string expressions in assignments & show
    Error Recovery:
        - Phrase-Level Recovery  -- inserts missing delimiter
        - Panic Mode Recovery   -- skips unknown tokens
    """

    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
        self.errors = []
        self.warnings = []
        self.ast = []

    # ── helpers ──────────────────────────────────────────────────────
    def _current(self):
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def _peek_type(self, offset=0):
        idx = self.pos + offset
        if idx < len(self.tokens):
            return self.tokens[idx].type
        return None

    def _peek_value(self, offset=0):
        idx = self.pos + offset
        if idx < len(self.tokens):
            return self.tokens[idx].value
        return None

    def _advance(self):
        tok = self.tokens[self.pos]
        self.pos += 1
        return tok

    def _expect(self, ttype, label=None):
        if self._peek_type() == ttype:
            return self._advance()
        else:
            lbl = label or ttype
            actual = self._current()
            actual_desc = f"'{actual.value}' ({actual.type})" if actual else "END OF INPUT"
            self.errors.append(f"Expected {lbl} but found {actual_desc}")
            print(f"  [PARSER] X Expected [{lbl}] but found {actual_desc}")
            return None

    # ── main entry ──────────────────────────────────────────────────
    def parse(self):
        print()
        print("─" * 60)
        print("  STARTING SYNTAX ANALYSIS")
        print("─" * 60)

        # ── Panic Mode Recovery: skip leading UNKNOWN tokens ────────
        self._panic_mode_skip()

        if not self.tokens:
            print("  [PARSER] No tokens to parse.")
            return self.ast

        # ── determine statement type ────────────────────────────────
        first = self._peek_type()

        if first == TokenType.DATATYPE:
            self._parse_declaration()
        elif first == TokenType.SHOW:
            self._parse_show()
        elif first in (TokenType.INCREASE, TokenType.DECREASE):
            self._parse_inc_dec()
        elif first == TokenType.IF:
            self._parse_if()
        elif first == TokenType.ELSEIF:
            self._parse_elseif()
        elif first == TokenType.ELSE:
            self._parse_else()
        elif first == TokenType.WHILE:
            self._parse_while()
        elif first == TokenType.STEP:
            self._parse_step()
        elif first == TokenType.IDENTIFIER:
            self._parse_reassignment()
        else:
            self.errors.append(f"Unexpected token '{self.tokens[self.pos].value}' at start of statement")
            print(f"  [PARSER] X Unexpected token '{self.tokens[self.pos].value}' at start of statement.")

        # ── summary ─────────────────────────────────────────────────
        if not self.errors:
            print(f"\n  Syntax Analysis Complete. No structural errors.")
        else:
            for w in self.warnings:
                print(f"  !! {w}")
            print(f"\n  X Syntax Analysis Complete. {len(self.errors)} error(s) found.")
            for e in self.errors:
                print(f"    - {e}")

        return self.ast

    # ── Panic Mode Recovery ─────────────────────────────────────────
    def _panic_mode_skip(self):
        skipped = []
        while self.pos < len(self.tokens) and self.tokens[self.pos].type == TokenType.UNKNOWN:
            skipped.append(self.tokens[self.pos].value)
            self.pos += 1
        if skipped:
            print(f"  [PARSER] !! Panic Mode Recovery: Skipping unknown token(s): {', '.join(repr(s) for s in skipped)}")
            self.warnings.append(f"Panic Mode Recovery skipped {len(skipped)} unknown token(s)")
        cleaned = [t for t in self.tokens if t.type != TokenType.UNKNOWN]
        removed = len(self.tokens) - len(cleaned)
        if removed > len(skipped):
            extra = removed - len(skipped)
            print(f"  [PARSER] !! Panic Mode Recovery: Removed {extra} additional unknown token(s) from stream")
            self.warnings.append(f"Panic Mode Recovery removed {extra} additional unknown token(s)")
        self.tokens = cleaned
        self.pos = 0

    # ── phrase-level recovery: missing delimiter ────────────────────
    def _ensure_delimiter(self):
        if self._peek_type() == TokenType.DELIMITER:
            self._advance()
            print(f"  [PARSER] Found [{TokenType.DELIMITER}] -> Statement properly terminated with '.'")
        else:
            self.warnings.append("Phrase-Level Recovery: inserted missing '.' delimiter")
            print(f"  [PARSER] !! Phrase-Level Recovery: Missing '.' at end of statement -- auto-inserted.")

    # ── Parse: variable declaration ─────────────────────────────────
    def _parse_declaration(self):
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [DATATYPE] [IDENTIFIER] [ASSIGN_OP] [EXPRESSION] [DELIMITER]")

        datatype_tok = self._expect(TokenType.DATATYPE, "DATATYPE")
        if not datatype_tok:
            return

        ident_tok = self._expect(TokenType.IDENTIFIER, "IDENTIFIER")
        if not ident_tok:
            return

        assign_tok = self._expect(TokenType.ASSIGN_OP, "ASSIGN_OP 'is'")
        if not assign_tok:
            return

        expr_tokens = self._parse_expression()
        if not expr_tokens:
            self.errors.append("Expected a value or expression after 'is'")
            print("  [PARSER] X Expected a value or expression after 'is'")
            return

        self._ensure_delimiter()

        stmt = {
            "type": "declaration",
            "datatype": datatype_tok.value,
            "identifier": ident_tok.value,
            "expression": expr_tokens,
        }
        self.ast.append(stmt)
        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

    # ── Parse: reassignment (identifier is expr.) ───────────────────
    def _parse_reassignment(self):
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [IDENTIFIER] [ASSIGN_OP] [EXPRESSION] [DELIMITER]")

        ident_tok = self._advance()

        assign_tok = self._expect(TokenType.ASSIGN_OP, "ASSIGN_OP 'is'")
        if not assign_tok:
            return

        expr_tokens = self._parse_expression()
        if not expr_tokens:
            self.errors.append("Expected a value or expression after 'is'")
            return

        self._ensure_delimiter()

        stmt = {
            "type": "reassignment",
            "identifier": ident_tok.value,
            "expression": expr_tokens,
        }
        self.ast.append(stmt)
        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

    # ── Parse: show statement ───────────────────────────────────────
    def _parse_show(self):
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [SHOW] [EXPRESSION] [DELIMITER]")

        self._advance()

        expr_tokens = self._parse_expression()
        if not expr_tokens:
            self.errors.append("Expected a value or expression after 'show'")
            return

        self._ensure_delimiter()

        stmt = {
            "type": "show",
            "expression": expr_tokens,
        }
        self.ast.append(stmt)
        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

    # ── Parse: increase / decrease ──────────────────────────────────
    def _parse_inc_dec(self):
        action = self._advance()
        action_name = action.value

        print("  [PARSER] Checking statement structure...")
        print(f"  [PARSER] Expected rule: [{action.type}] [IDENTIFIER] [BY] [EXPRESSION] [DELIMITER]")

        ident_tok = self._expect(TokenType.IDENTIFIER, "IDENTIFIER")
        if not ident_tok:
            return

        by_tok = self._expect(TokenType.BY, "BY")
        if not by_tok:
            return

        expr_tokens = self._parse_expression()
        if not expr_tokens:
            self.errors.append(f"Expected expression after 'by' in {action_name}")
            return

        self._ensure_delimiter()

        stmt = {
            "type": "inc_dec",
            "action": action_name,
            "identifier": ident_tok.value,
            "expression": expr_tokens,
        }
        self.ast.append(stmt)
        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

    # ── Parse: if ───────────────────────────────────────────────────
    def _parse_if(self):
        self._advance()
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [IF] [CONDITION] [THEN] <colon | newline>")

        cond = self._parse_condition()

        self._expect(TokenType.THEN, "THEN")
        if self._peek_type() == TokenType.COLON:
            self._advance()

        stmt = {
            "type": "if",
            "condition": cond,
        }

        if self._current() is not None and self._peek_type() != TokenType.DELIMITER:
            inner = self._parse_inline_body()
            stmt["body"] = inner

        self.ast.append(stmt)
        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

    # ── Parse: elseif ───────────────────────────────────────────────
    def _parse_elseif(self):
        self._advance()
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [ELSEIF] [CONDITION] [THEN] <colon | newline>")

        cond = self._parse_condition()
        self._expect(TokenType.THEN, "THEN")
        if self._peek_type() == TokenType.COLON:
            self._advance()

        stmt = {"type": "elseif", "condition": cond}
        self.ast.append(stmt)
        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

    # ── Parse: else ─────────────────────────────────────────────────
    def _parse_else(self):
        self._advance()
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [ELSE] <colon | newline>")

        if self._peek_type() == TokenType.COLON:
            self._advance()

        stmt = {"type": "else"}
        self.ast.append(stmt)
        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

    # ── Parse: while ────────────────────────────────────────────────
    def _parse_while(self):
        self._advance()
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [WHILE] [CONDITION] <colon | newline>")

        cond = self._parse_condition()

        if self._peek_type() == TokenType.COLON:
            self._advance()

        stmt = {"type": "while", "condition": cond}
        self.ast.append(stmt)
        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

    # ── Parse: step loop ────────────────────────────────────────────
    def _parse_step(self):
        self._advance()
        print("  [PARSER] Checking statement structure...")

        stmt = {"type": "step"}

        if self._peek_type() == TokenType.DATATYPE:
            stmt["iter_type"] = self._advance().value
            ident = self._expect(TokenType.IDENTIFIER, "IDENTIFIER (loop variable)")
            if ident:
                stmt["iter_var"] = ident.value

        if self._peek_type() == TokenType.BY:
            self._advance()
            step_expr = self._parse_expression()
            stmt["step_by"] = step_expr

        if self._peek_type() == TokenType.NUMERIC_LITERAL and self._peek_type(1) == TokenType.TIMES:
            count = self._advance().value
            self._advance()
            stmt["variant"] = "times"
            stmt["count"] = count
            print("  [PARSER] Expected rule: [STEP] [COUNT] [TIMES] <colon | DELIMITER>")
        elif self._peek_type() == TokenType.FROM:
            self._advance()
            from_expr = self._parse_expression()
            stmt["from"] = from_expr
            self._expect(TokenType.TO, "TO")
            to_expr = self._parse_expression()
            stmt["to"] = to_expr
            stmt["variant"] = "from_to"
            print("  [PARSER] Expected rule: [STEP] ... [FROM] [EXPR] [TO] [EXPR] <colon | newline>")
        else:
            self.errors.append("Invalid step loop syntax")
            print("  [PARSER] X Invalid step loop syntax")
            self.ast.append(stmt)
            return

        if self._peek_type() == TokenType.COLON:
            self._advance()

        self.ast.append(stmt)
        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

    # ── Parse: condition (for if / while) ───────────────────────────
    def _parse_condition(self):
        cond_tokens = []
        stop_types = {TokenType.THEN, TokenType.COLON, TokenType.DELIMITER}
        while self._current() is not None and self._peek_type() not in stop_types:
            cond_tokens.append(self._advance())
        return cond_tokens

    # ── Parse: expression ───────────────────────────────────────────
    def _parse_expression(self):
        expr = []
        stop_types = {TokenType.DELIMITER, TokenType.COLON, TokenType.THEN,
                      TokenType.BY, TokenType.FROM, TokenType.TO, TokenType.TIMES}
        paren_depth = 0

        while self._current() is not None:
            tt = self._peek_type()
            if tt == TokenType.LPAREN:
                paren_depth += 1
                expr.append(self._advance())
            elif tt == TokenType.RPAREN:
                paren_depth -= 1
                expr.append(self._advance())
            elif tt in stop_types and paren_depth == 0:
                break
            else:
                expr.append(self._advance())

        return expr

    # ── Parse: inline body after colon ──────────────────────────────
    def _parse_inline_body(self):
        body_tokens = []
        while self._current() is not None:
            body_tokens.append(self._advance())
        return body_tokens
