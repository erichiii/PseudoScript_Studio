"""
PseudoScript Compiler Front-End
===============================
Phase 3: The Semantic Analyzer

Validates types and binds variables into a Symbol Table.
Prints every check it performs (Explainability Layer).
"""

try:
    from .tokens import TokenType
    from .symbol_table import SymbolTable
except ImportError:  # pragma: no cover
    from tokens import TokenType
    from symbol_table import SymbolTable


class SemanticAnalyzer:
    """
    Validates types and binds variables into a Symbol Table.
    Prints every check it performs (Explainability Layer).
    """

    def __init__(self, symbol_table=None):
        self.symbol_table = symbol_table if symbol_table is not None else SymbolTable()
        self.errors = []
        self.parse_tree = []
        self._active_node = None
        self.node_map = {}
        self.snapshots = []
        self._last_snapshot_records = []
        self._statement_index = 0

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
    def analyze(self, ast, parse_tree=None, node_map=None):
        print()
        print("─" * 60)
        print("  STARTING SEMANTIC ANALYSIS")
        print("─" * 60)

        print("  [SEMANTICS] Hello! I'm the Semantic Analyzer (you can call me Sage). I'll check meanings, types, and memory bindings.")

        self.parse_tree = parse_tree or []
        self.node_map = node_map or {}

        for idx, stmt in enumerate(ast):
            node = self.node_map.get(id(stmt))
            if node is None and idx < len(self.parse_tree):
                node = self.parse_tree[idx]
            self._analyze_statement(stmt, node)

        # ── summary ─────────────────────────────────────────────────
        if not self.errors:
            print(f"\n  Semantic Analysis Complete.")
        else:
            print(f"\n  X Semantic Analysis Complete. {len(self.errors)} error(s) found.")
            for e in self.errors:
                print(f"    - {e}")

        return len(self.errors) == 0

    def _analyze_statement(self, stmt, node=None):
        if stmt is None:
            return
        previous_node = self._active_node
        if node is not None:
            self._active_node = node

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
            print("  [SEMANTICS] 'else' block -- analyzing nested statements...")
            self._annotate("Else block header processed.")
            self.symbol_table.push_scope()
            self._analyze_nested_block(stmt.get("block", []))
            self.symbol_table.pop_scope()
        else:
            print(f"  [SEMANTICS] Statement type '{stype}' -- no semantic action.")

        self._active_node = previous_node
        self._capture_snapshot(stmt, self._statement_index)
        self._statement_index += 1

    def _analyze_nested_block(self, statements):
        if not statements:
            return
        for inner in statements:
            node = self.node_map.get(id(inner))
            self._analyze_statement(inner, node)
            # Nested statements count toward snapshots as they are processed inside _analyze_statement

    @staticmethod
    def announce_blocked(reason):
        print()
        print("─" * 60)
        print("  STARTING SEMANTIC ANALYSIS")
        print("─" * 60)
        print("  [SEMANTICS] Because " + reason + ", I cannot perform semantic checks. Fix the earlier phase and try again.")

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
                    entry = self.symbol_table.lookup(tok.value)
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
                        parts.append(str(self.symbol_table.lookup(tok.value)["value"]))
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
                    expr_str += str(self.symbol_table.lookup(tok.value)["value"])
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
            self._annotate(
                f"Type mismatch: expected {dtype}, received {val_type_label}.",
                is_error=True,
                hint="Provide a literal that matches the declared datatype.",
            )
            return

        print(f"  [SEMANTICS] Types match. No coercion needed.")
        record = self.symbol_table.declare(ident, dtype, value)
        print(f"  [SEMANTICS] Binding variable '{ident}' to Symbol Table.")
        print(f"  [SEMANTICS]   -> Symbol Table Entry: {{ name: '{ident}', type: '{dtype}', value: {value!r}, scope: {record['scope']} }}")
        self._annotate(f"Bound '{ident}' as {dtype} = {value!r} (scope {record['scope']})")

    # ── reassignment ────────────────────────────────────────────────
    def _analyze_reassignment(self, stmt):
        ident = stmt["identifier"]
        expr  = stmt["expression"]

        value, val_type = self._eval_expr(expr)

        print(f"  [SEMANTICS] Reassignment of '{ident}'...")

        if ident not in self.symbol_table:
            self.symbol_table.assign(ident, value, datatype="unknown")
            print(f"  [SEMANTICS] Warning: '{ident}' was not previously declared. Creating entry with inferred type.")
            self._annotate(f"'{ident}' inferred as unknown type with value {value!r}")
        else:
            dtype = self.symbol_table.lookup(ident)["datatype"]
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
                self._annotate(
                    f"Reassignment mismatch on '{ident}': expected {dtype}, got {val_type_label}.",
                    is_error=True,
                    hint="Match the new value's type to the variable's declaration.",
                )
                return

            self.symbol_table.assign(ident, value)
            print(f"  [SEMANTICS] Updated '{ident}' in Symbol Table -> value: {value!r}")
            self._annotate(f"Updated '{ident}' = {value!r}")

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
                self._annotate(
                    f"Undeclared variable '{tok.value}' in output.",
                    is_error=True,
                    hint="Declare the variable before using it in show.",
                )
                return

        print(f"  [SEMANTICS] Output will display: {value!r}")
        self._annotate(f"Output evaluated to {value!r}")

    # ── increase / decrease ─────────────────────────────────────────
    def _analyze_inc_dec(self, stmt):
        action = stmt["action"]
        ident  = stmt["identifier"]
        expr   = stmt["expression"]

        print(f"  [SEMANTICS] {action.capitalize()} operation on '{ident}'...")

        if ident not in self.symbol_table:
            self.errors.append(f"Undeclared variable '{ident}' in {action}")
            print(f"  [SEMANTICS] X Variable '{ident}' is not declared.")
            self._annotate(
                f"Cannot {action} '{ident}' because it was never declared.",
                is_error=True,
                hint="Declare the variable before trying to update it.",
            )
            return

        entry = self.symbol_table.lookup(ident)
        if entry["datatype"] not in ("whole", "decimal"):
            self.errors.append(f"Cannot {action} non-numeric variable '{ident}' (type: {entry['datatype']})")
            print(f"  [SEMANTICS] X Cannot {action} variable '{ident}' of type '{entry['datatype']}'.")
            self._annotate(
                f"{action.title()} requires a numeric variable but '{ident}' is {entry['datatype']}.",
                is_error=True,
                hint="Change the datatype to whole/decimal or remove the {action} statement.",
            )
            return

        delta_val, _ = self._eval_expr(expr)
        try:
            if action == "increase":
                entry["value"] = entry["value"] + delta_val
            else:
                entry["value"] = entry["value"] - delta_val
            print(f"  [SEMANTICS] '{ident}' updated -> new value: {entry['value']!r}")
            self._annotate(f"{action.title()} applied: '{ident}' is now {entry['value']!r}")
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
                self._annotate(
                    f"Condition uses undeclared variable '{tok.value}'.",
                    is_error=True,
                    hint="Declare the variable before using it in the condition.",
                )
                return

        print(f"  [SEMANTICS] All variables in condition are declared.")
        self._annotate("Condition variables are valid.")
        self.symbol_table.push_scope()
        self._analyze_nested_block(stmt.get("block", []))
        self.symbol_table.pop_scope()

    def _capture_snapshot(self, stmt, index):
        records = [(name, info.copy()) for name, info in self.symbol_table.items()]
        if records == self._last_snapshot_records:
            return
        label = self._describe_statement(stmt, index)
        self.snapshots.append({
            "label": label,
            "records": records,
        })
        self._last_snapshot_records = records

    @staticmethod
    def _describe_statement(stmt, index):
        base = f"after statement {index + 1}"
        if not stmt:
            return base
        stype = stmt.get("type", "statement")
        if stype == "declaration":
            return f"{base} (declare {stmt.get('identifier', '?')})"
        if stype == "reassignment":
            return f"{base} (reassign {stmt.get('identifier', '?')})"
        if stype == "inc_dec":
            return f"{base} ({stmt.get('action', 'update')} {stmt.get('identifier', '?')})"
        if stype == "show":
            return f"{base} (show)"
        if stype in ("if", "elseif", "else", "while", "step"):
            return f"{base} ({stype} block)"
        return base

    # ── step loop ───────────────────────────────────────────────────
    def _analyze_step(self, stmt):
        print("  [SEMANTICS] 'step' loop -- checking loop parameters...")

        self.symbol_table.push_scope()
        if "iter_var" in stmt and "iter_type" in stmt:
            var = stmt["iter_var"]
            dtype = stmt["iter_type"]
            self.symbol_table.declare(var, dtype, 0)
            print(f"  [SEMANTICS] Bound loop variable '{var}' as '{dtype}' in Symbol Table.")
            self._annotate(f"Loop variable '{var}' initialized as {dtype}.")

        self._analyze_nested_block(stmt.get("block", []))
        self.symbol_table.pop_scope()

        print(f"  [SEMANTICS] Step loop parameters are valid.")
        self._annotate("Step loop parameters are valid.")

    def _annotate(self, message, is_error=False, hint=None):
        if self._active_node is None:
            return
        if is_error:
            self._active_node.mark_error(message, hint)
        else:
            self._active_node.add_annotation(message)

    # ── helper: expression display ──────────────────────────────────
    @staticmethod
    def _expr_display(expr_tokens):
        return " ".join(t.value for t in expr_tokens)
