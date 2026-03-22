"""
PseudoScript Compiler Front-End
===============================
Phase 3: The Semantic Analyzer

Validates types and binds variables into a Symbol Table.
Prints every check it performs (Explainability Layer).
"""

from tokens import TokenType


class SemanticAnalyzer:
    """
    Validates types and binds variables into a Symbol Table.
    Prints every check it performs (Explainability Layer).
    """

    def __init__(self, symbol_table=None):
        self.symbol_table = symbol_table if symbol_table is not None else {}
        self.errors = []

    # ── type compatibility map ──────────────────────────────────────
    TYPE_MAP = {
        "whole":   {"NUMERIC_LITERAL"},
        "decimal": {"NUMERIC_LITERAL", "DECIMAL_LITERAL"},
        "logic":   {"BOOL_LITERAL"},
        "text":    {"STRING_LITERAL"},
    }

    TYPE_LABELS = {
        "whole":   "Numeric (Integer)",
        "decimal": "Numeric (Decimal)",
        "logic":   "Boolean",
        "text":    "String",
    }

    # ── main entry ──────────────────────────────────────────────────
    def analyze(self, ast):
        print()
        print("─" * 60)
        print("  STARTING SEMANTIC ANALYSIS")
        print("─" * 60)

        for stmt in ast:
            stype = stmt.get("type")
            if stype == "declaration":
                self._analyze_declaration(stmt)
            elif stype == "reassignment":
                self._analyze_reassignment(stmt)
            elif stype == "show":
                self._analyze_show(stmt)
            elif stype == "inc_dec":
                self._analyze_inc_dec(stmt)
            elif stype in ("if", "elseif", "while"):
                self._analyze_condition_block(stmt)
            elif stype == "step":
                self._analyze_step(stmt)
            elif stype == "else":
                print("  [SEMANTICS] 'else' block header -- no semantic checks needed.")
            else:
                print(f"  [SEMANTICS] Statement type '{stype}' -- no semantic action.")

        # ── summary ─────────────────────────────────────────────────
        if not self.errors:
            print(f"\n  Semantic Analysis Complete.")
        else:
            print(f"\n  X Semantic Analysis Complete. {len(self.errors)} error(s) found.")
            for e in self.errors:
                print(f"    - {e}")

        return len(self.errors) == 0

    # ── evaluate expression to a value ──────────────────────────────
    def _eval_expr(self, expr_tokens):
        if not expr_tokens:
            return None, None

        # Single-token expression
        if len(expr_tokens) == 1:
            tok = expr_tokens[0]
            if tok.type == TokenType.NUMERIC_LITERAL:
                return int(tok.value), TokenType.NUMERIC_LITERAL
            elif tok.type == TokenType.DECIMAL_LITERAL:
                return float(tok.value), TokenType.DECIMAL_LITERAL
            elif tok.type == TokenType.STRING_LITERAL:
                return tok.value.strip('"'), TokenType.STRING_LITERAL
            elif tok.type == TokenType.BOOL_LITERAL:
                return tok.value == "true", TokenType.BOOL_LITERAL
            elif tok.type == TokenType.IDENTIFIER:
                if tok.value in self.symbol_table:
                    entry = self.symbol_table[tok.value]
                    ttype_map = {"whole": TokenType.NUMERIC_LITERAL,
                                 "decimal": TokenType.DECIMAL_LITERAL,
                                 "logic": TokenType.BOOL_LITERAL,
                                 "text": TokenType.STRING_LITERAL}
                    return entry["value"], ttype_map.get(entry["datatype"], TokenType.IDENTIFIER)
                return tok.value, TokenType.IDENTIFIER
            return tok.value, tok.type

        # Multi-token expression
        has_string = any(t.type == TokenType.STRING_LITERAL for t in expr_tokens)
        has_decimal = any(t.type == TokenType.DECIMAL_LITERAL for t in expr_tokens)

        if has_string:
            parts = []
            for tok in expr_tokens:
                if tok.type == TokenType.STRING_LITERAL:
                    parts.append(tok.value.strip('"'))
                elif tok.type == TokenType.IDENTIFIER:
                    if tok.value in self.symbol_table:
                        parts.append(str(self.symbol_table[tok.value]["value"]))
                    else:
                        parts.append(tok.value)
                elif tok.type == TokenType.ARITH_OP and tok.value == "+":
                    continue
                elif tok.type in (TokenType.NUMERIC_LITERAL, TokenType.DECIMAL_LITERAL):
                    parts.append(tok.value)
                else:
                    continue
            return "".join(parts), TokenType.STRING_LITERAL

        # Numeric expression
        expr_str = ""
        for tok in expr_tokens:
            if tok.type in (TokenType.NUMERIC_LITERAL, TokenType.DECIMAL_LITERAL):
                expr_str += tok.value
            elif tok.type == TokenType.ARITH_OP:
                expr_str += f" {tok.value} "
            elif tok.type == TokenType.LPAREN:
                expr_str += "("
            elif tok.type == TokenType.RPAREN:
                expr_str += ")"
            elif tok.type == TokenType.IDENTIFIER:
                if tok.value in self.symbol_table:
                    expr_str += str(self.symbol_table[tok.value]["value"])
                else:
                    return None, TokenType.IDENTIFIER
            else:
                expr_str += tok.value

        try:
            val = eval(expr_str)
            if has_decimal or isinstance(val, float):
                return val, TokenType.DECIMAL_LITERAL
            return int(val), TokenType.NUMERIC_LITERAL
        except Exception:
            return expr_str, TokenType.NUMERIC_LITERAL

    # ── declaration ─────────────────────────────────────────────────
    def _analyze_declaration(self, stmt):
        dtype = stmt["datatype"]
        ident = stmt["identifier"]
        expr  = stmt["expression"]

        value, val_type = self._eval_expr(expr)

        print("  [SEMANTICS] Checking Type Compatibility...")

        val_type_label = {
            TokenType.NUMERIC_LITERAL: "Numeric",
            TokenType.DECIMAL_LITERAL: "Decimal",
            TokenType.STRING_LITERAL:  "String",
            TokenType.BOOL_LITERAL:    "Boolean",
        }.get(val_type, "Expression")

        raw_value = self._expr_display(expr)
        print(f"  [SEMANTICS] Variable '{ident}' is declared as '{dtype}'. Value is {raw_value} ({val_type_label}).")

        # Type check
        allowed = self.TYPE_MAP.get(dtype, set())
        if val_type and val_type not in allowed and val_type != TokenType.IDENTIFIER:
            self.errors.append(f"Type mismatch: '{ident}' is '{dtype}' but value {raw_value} is {val_type_label}")
            print(f"  [SEMANTICS] FATAL ERROR: Variable '{ident}' is declared as '{dtype}', but value {raw_value} is a {val_type_label.upper()}.")
            print(f"  [SEMANTICS] Recovery Strategy: Compiler will discard assignment to prevent memory corruption.")
            return

        print(f"  [SEMANTICS] Types match. No coercion needed.")

        # Bind to symbol table
        self.symbol_table[ident] = {"datatype": dtype, "value": value}
        print(f"  [SEMANTICS] Binding variable '{ident}' to Symbol Table.")
        print(f"  [SEMANTICS]   -> Symbol Table Entry: {{ name: '{ident}', type: '{dtype}', value: {value!r} }}")

    # ── reassignment ────────────────────────────────────────────────
    def _analyze_reassignment(self, stmt):
        ident = stmt["identifier"]
        expr  = stmt["expression"]

        value, val_type = self._eval_expr(expr)

        print(f"  [SEMANTICS] Reassignment of '{ident}'...")

        if ident not in self.symbol_table:
            self.symbol_table[ident] = {"datatype": "unknown", "value": value}
            print(f"  [SEMANTICS] Warning: '{ident}' was not previously declared. Creating entry with inferred type.")
        else:
            dtype = self.symbol_table[ident]["datatype"]
            allowed = self.TYPE_MAP.get(dtype, set())

            val_type_label = {
                TokenType.NUMERIC_LITERAL: "Numeric",
                TokenType.DECIMAL_LITERAL: "Decimal",
                TokenType.STRING_LITERAL:  "String",
                TokenType.BOOL_LITERAL:    "Boolean",
            }.get(val_type, "Expression")

            if val_type and val_type not in allowed and val_type != TokenType.IDENTIFIER:
                self.errors.append(f"Type mismatch on reassignment: '{ident}' is '{dtype}' but new value is {val_type_label}")
                print(f"  [SEMANTICS] FATAL ERROR: Cannot assign {val_type_label} to '{ident}' (declared as '{dtype}').")
                return

            self.symbol_table[ident]["value"] = value
            print(f"  [SEMANTICS] Updated '{ident}' in Symbol Table -> value: {value!r}")

    # ── show ────────────────────────────────────────────────────────
    def _analyze_show(self, stmt):
        expr = stmt["expression"]
        value, val_type = self._eval_expr(expr)

        raw = self._expr_display(expr)
        print(f"  [SEMANTICS] Output statement: show {raw}")

        for tok in expr:
            if tok.type == TokenType.IDENTIFIER and tok.value not in self.symbol_table:
                self.errors.append(f"Undeclared variable '{tok.value}' used in show statement")
                print(f"  [SEMANTICS] X Undeclared variable '{tok.value}' -- has it been defined?")
                return

        print(f"  [SEMANTICS] Output will display: {value!r}")

    # ── increase / decrease ─────────────────────────────────────────
    def _analyze_inc_dec(self, stmt):
        action = stmt["action"]
        ident  = stmt["identifier"]
        expr   = stmt["expression"]

        print(f"  [SEMANTICS] {action.capitalize()} operation on '{ident}'...")

        if ident not in self.symbol_table:
            self.errors.append(f"Undeclared variable '{ident}' in {action}")
            print(f"  [SEMANTICS] X Variable '{ident}' is not declared.")
            return

        entry = self.symbol_table[ident]
        if entry["datatype"] not in ("whole", "decimal"):
            self.errors.append(f"Cannot {action} non-numeric variable '{ident}' (type: {entry['datatype']})")
            print(f"  [SEMANTICS] X Cannot {action} variable '{ident}' of type '{entry['datatype']}'.")
            return

        delta_val, _ = self._eval_expr(expr)
        try:
            if action == "increase":
                entry["value"] = entry["value"] + delta_val
            else:
                entry["value"] = entry["value"] - delta_val
            print(f"  [SEMANTICS] '{ident}' updated -> new value: {entry['value']!r}")
        except Exception:
            print(f"  [SEMANTICS] Could not evaluate {action} expression at compile time.")

    # ── condition check (if / while) ────────────────────────────────
    def _analyze_condition_block(self, stmt):
        stype = stmt["type"]
        cond  = stmt.get("condition", [])

        print(f"  [SEMANTICS] '{stype}' block -- checking condition variables...")

        for tok in cond:
            if tok.type == TokenType.IDENTIFIER and tok.value not in self.symbol_table:
                self.errors.append(f"Undeclared variable '{tok.value}' in {stype} condition")
                print(f"  [SEMANTICS] X Undeclared variable '{tok.value}' in condition.")
                return

        print(f"  [SEMANTICS] All variables in condition are declared.")

    # ── step loop ───────────────────────────────────────────────────
    def _analyze_step(self, stmt):
        print("  [SEMANTICS] 'step' loop -- checking loop parameters...")

        if "iter_var" in stmt and "iter_type" in stmt:
            var = stmt["iter_var"]
            dtype = stmt["iter_type"]
            self.symbol_table[var] = {"datatype": dtype, "value": 0}
            print(f"  [SEMANTICS] Bound loop variable '{var}' as '{dtype}' in Symbol Table.")

        print(f"  [SEMANTICS] Step loop parameters are valid.")

    # ── helper: expression display ──────────────────────────────────
    @staticmethod
    def _expr_display(expr_tokens):
        return " ".join(t.value for t in expr_tokens)
