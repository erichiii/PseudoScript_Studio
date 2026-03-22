"""
PseudoScript Compiler Front-End
===============================
Phase 2: The Parser (Syntax Analysis)

Validates whether the token sequence forms a legal PseudoScript
statement.  Prints every rule it checks (Explainability Layer).
"""

try:
    from .tokens import TokenType
except ImportError:  # pragma: no cover
    from tokens import TokenType


class ParseTreeNode:
    """Node used to visualize and annotate the parse tree."""

    def __init__(self, label):
        self.label = label
        self.children = []
        self.error = False
        self.hint = None
        self.annotations = []

    def add_child(self, node):
        if node is not None:
            self.children.append(node)

    def mark_error(self, message, hint=None):
        self.error = True
        self.hint = hint or message
        self.annotations.append(f"ERROR: {message}")

    def add_annotation(self, text):
        self.annotations.append(text)

    def render(self, prefix="", is_last=True, show_annotations=False):
        """Render parse tree as a visual tree structure."""
        # Tree branch characters
        connector = "└─ " if is_last else "├─ "
        status = "✗ " if self.error else "• "
        
        # Print the node label
        line = f"{prefix}{connector}{status}{self.label}"
        print(line)
        
        # Adjust prefix for child nodes
        extension = "    " if is_last else "│   "
        child_prefix = prefix + extension
        
        # Print error hint if present
        if self.error and self.hint:
            hint_connector = "└─ " if is_last else "├─ "
            print(f"{prefix}{hint_connector}⚠ Hint: {self.hint}")
        
        # Print annotations (semantic info)
        if show_annotations and self.annotations:
            for idx, note in enumerate(self.annotations):
                is_last_annot = (idx == len(self.annotations) - 1) and not self.children
                annot_connector = "└─ " if is_last_annot else "├─ "
                print(f"{child_prefix}{annot_connector}{note}")
        
        # Recursively render children
        for idx, child in enumerate(self.children):
            child.render(child_prefix, idx == len(self.children) - 1, show_annotations)


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
        self.tree_nodes = []
        self.node_map = {}
        self._active_node = None

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
            if self._active_node is not None:
                error_node = ParseTreeNode(f"Missing {lbl}")
                hint = f"Expected {lbl} before {actual_desc}." if actual else f"Expected {lbl} but reached end of input."
                error_node.mark_error(hint, hint)
                self._active_node.add_child(error_node)
            return None

    # ── main entry ──────────────────────────────────────────────────
    def parse(self):
        print()
        print("─" * 60)
        print("  STARTING SYNTAX ANALYSIS")
        print("─" * 60)
        print("  [PARSER] Hi! I'm the Syntax Analyzer. I make sure your tokens follow the grammar, and I'll build a parse tree so you can see what I understood.")

        # ── Panic Mode Recovery: skip leading UNKNOWN tokens ────────
        self._panic_mode_skip()

        if not self.tokens:
            print("  [PARSER] No tokens to parse.")
            self.render_parse_tree()
            return self.ast, self.tree_nodes

        # ── Parse multiple statements ───────────────────────────────
        while self.pos < len(self.tokens):
            # determine statement type
            first = self._peek_type()
            dispatcher = {
                TokenType.DATATYPE: self._parse_declaration,
                TokenType.SHOW: self._parse_show,
                TokenType.INCREASE: self._parse_inc_dec,
                TokenType.DECREASE: self._parse_inc_dec,
                TokenType.IF: self._parse_if,
                TokenType.ELSEIF: self._parse_elseif,
                TokenType.ELSE: self._parse_else,
                TokenType.WHILE: self._parse_while,
                TokenType.STEP: self._parse_step,
                TokenType.IDENTIFIER: self._parse_reassignment,
            }

            handler = dispatcher.get(first)
            result = handler() if handler else None

            if result:
                stmt, node = result
                if node:
                    self.tree_nodes.append(node)
                if stmt:
                    if node:
                        self.node_map[id(stmt)] = node
                    self.ast.append(stmt)
            elif self.pos < len(self.tokens):
                # Only raise an error if we still have tokens (not EOF)
                tok = self.tokens[self.pos]
                self.errors.append(f"Unexpected token '{tok.value}' at start of statement")
                error_node = ParseTreeNode("Unexpected token")
                error_node.mark_error(f"'{tok.value}' cannot start a statement.", "Start with a datatype, identifier, or keyword like 'show'.")
                self.tree_nodes.append(error_node)
                print(f"  [PARSER] X Unexpected token '{tok.value}' at start of statement.")
                self.pos += 1  # Skip to avoid infinite loop

        # ── summary ─────────────────────────────────────────────────
        if not self.errors:
            print("\n  Syntax Analysis Complete. No structural errors.")
        else:
            for w in self.warnings:
                print(f"  !! {w}")
            print(f"\n  X Syntax Analysis Complete. {len(self.errors)} error(s) found.")
            for e in self.errors:
                print(f"    - {e}")

        self.render_parse_tree(show_annotations=False)
        return self.ast, self.tree_nodes

    def render_parse_tree(self, show_annotations=False):
        if not self.tree_nodes:
            print("\n  [PARSER] Parse tree is empty.")
            return
        print("\n  Parse Tree (" + ("annotated" if show_annotations else "structural") + "):")
        for idx, node in enumerate(self.tree_nodes):
            node.render("", idx == len(self.tree_nodes) - 1, show_annotations)

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
    def _ensure_delimiter(self, node):
        if self._peek_type() == TokenType.DELIMITER:
            tok = self._advance()
            if node:
                node.add_child(ParseTreeNode(f"Delimiter: {tok.value}"))
            print(f"  [PARSER] Found [{TokenType.DELIMITER}] -> Statement properly terminated with '.'")
        else:
            self.warnings.append("Phrase-Level Recovery: inserted missing '.' delimiter")
            recovery_node = ParseTreeNode("Missing delimiter")
            recovery_node.mark_error("Missing '.' at the end of the statement.", "Add a period to terminate the statement.")
            if node:
                node.add_child(recovery_node)
            print(f"  [PARSER] !! Phrase-Level Recovery: Missing '.' at end of statement -- auto-inserted.")

    @staticmethod
    def _expression_node(label, expr_tokens):
        node = ParseTreeNode(label)
        if not expr_tokens:
            node.mark_error("Expression is missing.", "Provide a literal, identifier, or expression.")
            return node
        for tok in expr_tokens:
            node.add_child(ParseTreeNode(f"{tok.type}: {tok.value}"))
        return node

    # ── Parse: variable declaration ─────────────────────────────────
    def _parse_declaration(self):
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [DATATYPE] [IDENTIFIER] [ASSIGN_OP] [EXPRESSION] [DELIMITER]")

        node = ParseTreeNode("Declaration")
        self._active_node = node
        success = True

        datatype_tok = self._expect(TokenType.DATATYPE, "DATATYPE")
        if datatype_tok:
            node.add_child(ParseTreeNode(f"Datatype: {datatype_tok.value}"))
        else:
            success = False

        ident_tok = self._expect(TokenType.IDENTIFIER, "IDENTIFIER")
        if ident_tok:
            node.add_child(ParseTreeNode(f"Identifier: {ident_tok.value}"))
        else:
            success = False

        assign_tok = self._expect(TokenType.ASSIGN_OP, "ASSIGN_OP 'is'")
        if assign_tok:
            node.add_child(ParseTreeNode("Assignment Operator: is"))
        else:
            success = False

        expr_tokens = self._parse_expression()
        if expr_tokens:
            node.add_child(self._expression_node("Expression", expr_tokens))
        else:
            success = False
            self.errors.append("Expected a value or expression after 'is'")
            print("  [PARSER] X Expected a value or expression after 'is'")

        self._ensure_delimiter(node)

        stmt = None
        if success:
            stmt = {
                "type": "declaration",
                "datatype": datatype_tok.value,
                "identifier": ident_tok.value,
                "expression": expr_tokens,
            }
            if not self.errors:
                print("  [PARSER] Actual structure matches expected rule perfectly.")

        self._active_node = None
        return stmt, node

    # ── Parse: reassignment (identifier is expr.) ───────────────────
    def _parse_reassignment(self):
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [IDENTIFIER] [ASSIGN_OP] [EXPRESSION] [DELIMITER]")
        node = ParseTreeNode("Reassignment")
        self._active_node = node
        success = True

        ident_tok = self._advance()
        node.add_child(ParseTreeNode(f"Identifier: {ident_tok.value}"))

        assign_tok = self._expect(TokenType.ASSIGN_OP, "ASSIGN_OP 'is'")
        if assign_tok:
            node.add_child(ParseTreeNode("Assignment Operator: is"))
        else:
            success = False

        expr_tokens = self._parse_expression()
        if expr_tokens:
            node.add_child(self._expression_node("Expression", expr_tokens))
        else:
            success = False
            self.errors.append("Expected a value or expression after 'is'")

        self._ensure_delimiter(node)

        stmt = None
        if success:
            stmt = {
                "type": "reassignment",
                "identifier": ident_tok.value,
                "expression": expr_tokens,
            }
            if not self.errors:
                print("  [PARSER] Actual structure matches expected rule perfectly.")

        self._active_node = None
        return stmt, node

    # ── Parse: show statement ───────────────────────────────────────
    def _parse_show(self):
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [SHOW] [EXPRESSION] [DELIMITER]")
        node = ParseTreeNode("Show")
        self._active_node = node
        success = True

        keyword = self._advance()
        node.add_child(ParseTreeNode(f"Keyword: {keyword.value}"))

        expr_tokens = self._parse_expression()
        if expr_tokens:
            node.add_child(self._expression_node("Expression", expr_tokens))
        else:
            success = False
            self.errors.append("Expected a value or expression after 'show'")

        self._ensure_delimiter(node)

        stmt = None
        if success:
            stmt = {
                "type": "show",
                "expression": expr_tokens,
            }
            if not self.errors:
                print("  [PARSER] Actual structure matches expected rule perfectly.")

        self._active_node = None
        return stmt, node

    # ── Parse: increase / decrease ──────────────────────────────────
    def _parse_inc_dec(self):
        action = self._advance()
        action_name = action.value

        print("  [PARSER] Checking statement structure...")
        print(f"  [PARSER] Expected rule: [{action.type}] [IDENTIFIER] [BY] [EXPRESSION] [DELIMITER]")
        node = ParseTreeNode(action_name.title())
        self._active_node = node
        node.add_child(ParseTreeNode(f"Keyword: {action_name}"))
        success = True

        ident_tok = self._expect(TokenType.IDENTIFIER, "IDENTIFIER")
        if ident_tok:
            node.add_child(ParseTreeNode(f"Identifier: {ident_tok.value}"))
        else:
            success = False

        by_tok = self._expect(TokenType.BY, "BY")
        if by_tok:
            node.add_child(ParseTreeNode("Keyword: by"))
        else:
            success = False

        expr_tokens = self._parse_expression()
        if expr_tokens:
            node.add_child(self._expression_node("Expression", expr_tokens))
        else:
            success = False
            self.errors.append(f"Expected expression after 'by' in {action_name}")

        self._ensure_delimiter(node)

        stmt = None
        if success:
            stmt = {
                "type": "inc_dec",
                "action": action_name,
                "identifier": ident_tok.value,
                "expression": expr_tokens,
            }
            if not self.errors:
                print("  [PARSER] Actual structure matches expected rule perfectly.")

        self._active_node = None
        return stmt, node

    # ── Parse: if ───────────────────────────────────────────────────
    def _parse_if(self):
        self._advance()
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [IF] [CONDITION] [THEN] ([INDENT] [block] [DEDENT] | [statement])")
        node = ParseTreeNode("If Statement")
        self._active_node = node
        node.add_child(ParseTreeNode("Keyword: if"))

        cond = self._parse_condition()
        node.add_child(self._expression_node("Condition", cond))

        then_tok = self._expect(TokenType.THEN, "THEN")
        if then_tok:
            node.add_child(ParseTreeNode("Keyword: then"))

        if self._peek_type() == TokenType.COLON:
            self._advance()
            node.add_child(ParseTreeNode("Colon: :"))

        stmt = {
            "type": "if",
            "condition": cond,
        }

        # Handle indented block or inline body
        if self._peek_type() == TokenType.INDENT:
            block_stmts, block_nodes = self._parse_indented_block()
            for block_node in block_nodes:
                node.add_child(block_node)
            stmt["block"] = block_stmts
        elif self._current() is not None and self._peek_type() != TokenType.DELIMITER:
            inner = self._parse_inline_body()
            stmt["body"] = inner
            if inner:
                node.add_child(self._expression_node("Inline Body", inner))

        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

        self._active_node = None
        return stmt, node

    # ── Parse: elseif ───────────────────────────────────────────────
    def _parse_elseif(self):
        self._advance()
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [ELSEIF] [CONDITION] [THEN] ([INDENT] [block] [DEDENT] | [statement])")
        node = ParseTreeNode("ElseIf Clause")
        self._active_node = node
        node.add_child(ParseTreeNode("Keyword: elseif"))

        cond = self._parse_condition()
        node.add_child(self._expression_node("Condition", cond))

        then_tok = self._expect(TokenType.THEN, "THEN")
        if then_tok:
            node.add_child(ParseTreeNode("Keyword: then"))

        if self._peek_type() == TokenType.COLON:
            self._advance()
            node.add_child(ParseTreeNode("Colon: :"))

        stmt = {"type": "elseif", "condition": cond}

        # Handle indented block
        if self._peek_type() == TokenType.INDENT:
            block_stmts, block_nodes = self._parse_indented_block()
            for block_node in block_nodes:
                node.add_child(block_node)
            stmt["block"] = block_stmts

        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

        self._active_node = None
        return stmt, node

    # ── Parse: else ─────────────────────────────────────────────────
    def _parse_else(self):
        self._advance()
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [ELSE] ([INDENT] [block] [DEDENT] | [statement])")
        node = ParseTreeNode("Else Clause")
        self._active_node = node
        node.add_child(ParseTreeNode("Keyword: else"))

        if self._peek_type() == TokenType.COLON:
            self._advance()
            node.add_child(ParseTreeNode("Colon: :"))

        stmt = {"type": "else"}

        # Handle indented block
        if self._peek_type() == TokenType.INDENT:
            block_stmts, block_nodes = self._parse_indented_block()
            for block_node in block_nodes:
                node.add_child(block_node)
            stmt["block"] = block_stmts

        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

        self._active_node = None
        return stmt, node

    # ── Helper: Parse Indented Block ────────────────────────────────
    def _parse_indented_block(self):
        """
        Parse statements in an indented block.
        Consumes INDENT token at the start and DEDENT token at the end.
        Returns a list of parsed statements.
        """
        block_stmts = []
        block_nodes = []
        
        # Expect and consume INDENT token
        if self._peek_type() != TokenType.INDENT:
            return block_stmts, block_nodes
        
        self._advance()  # consume INDENT
        
        # Parse statements until DEDENT
        while self._peek_type() != TokenType.DEDENT and self.pos < len(self.tokens):
            first = self._peek_type()
            dispatcher = {
                TokenType.DATATYPE: self._parse_declaration,
                TokenType.SHOW: self._parse_show,
                TokenType.INCREASE: self._parse_inc_dec,
                TokenType.DECREASE: self._parse_inc_dec,
                TokenType.IF: self._parse_if,
                TokenType.ELSEIF: self._parse_elseif,
                TokenType.ELSE: self._parse_else,
                TokenType.WHILE: self._parse_while,
                TokenType.STEP: self._parse_step,
                TokenType.IDENTIFIER: self._parse_reassignment,
            }
            
            handler = dispatcher.get(first)
            if handler:
                result = handler()
                if result:
                    stmt, node = result
                    if stmt:
                        if node:
                            self.node_map[id(stmt)] = node
                        block_stmts.append(stmt)
                    if node:
                        block_nodes.append(node)
            else:
                break
        
        # Consume DEDENT token
        if self._peek_type() == TokenType.DEDENT:
            self._advance()
        
        return block_stmts, block_nodes

    # ── Parse: while ────────────────────────────────────────────────
    def _parse_while(self):
        self._advance()
        print("  [PARSER] Checking statement structure...")
        print("  [PARSER] Expected rule: [WHILE] [CONDITION] [INDENT] [block] [DEDENT]")
        node = ParseTreeNode("While Loop")
        self._active_node = node
        node.add_child(ParseTreeNode("Keyword: while"))

        cond = self._parse_condition()
        node.add_child(self._expression_node("Condition", cond))

        if self._peek_type() == TokenType.COLON:
            self._advance()
            node.add_child(ParseTreeNode("Colon: :"))

        # Parse indented block
        block_stmts, block_nodes = self._parse_indented_block()
        for block_node in block_nodes:
            node.add_child(block_node)

        stmt = {"type": "while", "condition": cond, "block": block_stmts}
        if not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

        self._active_node = None
        return stmt, node

    # ── Parse: step loop ────────────────────────────────────────────
    def _parse_step(self):
        self._advance()
        print("  [PARSER] Checking statement structure...")

        node = ParseTreeNode("Step Loop")
        self._active_node = node
        node.add_child(ParseTreeNode("Keyword: step"))

        stmt = {"type": "step"}
        success = True

        if self._peek_type() == TokenType.DATATYPE:
            dtype = self._advance().value
            stmt["iter_type"] = dtype
            node.add_child(ParseTreeNode(f"Iterator Type: {dtype}"))
            ident = self._expect(TokenType.IDENTIFIER, "IDENTIFIER (loop variable)")
            if ident:
                stmt["iter_var"] = ident.value
                node.add_child(ParseTreeNode(f"Iterator Name: {ident.value}"))
            else:
                success = False

        if self._peek_type() == TokenType.BY:
            self._advance()
            step_expr = self._parse_expression()
            stmt["step_by"] = step_expr
            node.add_child(self._expression_node("Step Size", step_expr))

        if self._peek_type() == TokenType.NUMERIC_LITERAL and self._peek_type(1) == TokenType.TIMES:
            count = self._advance().value
            self._advance()
            stmt["variant"] = "times"
            stmt["count"] = count
            node.add_child(ParseTreeNode(f"Repeat Count: {count}"))
            print("  [PARSER] Expected rule: [STEP] [COUNT] [TIMES] <colon | DELIMITER>")
        elif self._peek_type() == TokenType.FROM:
            self._advance()
            from_expr = self._parse_expression()
            stmt["from"] = from_expr
            node.add_child(self._expression_node("From", from_expr))
            to_tok = self._expect(TokenType.TO, "TO")
            if to_tok:
                node.add_child(ParseTreeNode("Keyword: to"))
            else:
                success = False
            to_expr = self._parse_expression()
            stmt["to"] = to_expr
            node.add_child(self._expression_node("To", to_expr))
            stmt["variant"] = "from_to"
            print("  [PARSER] Expected rule: [STEP] ... [FROM] [EXPR] [TO] [EXPR] <colon | newline>")
        else:
            self.errors.append("Invalid step loop syntax")
            node.mark_error("Step loop syntax is incomplete.", "Use 'step <count> times' or 'step from <a> to <b>'.")
            print("  [PARSER] X Invalid step loop syntax")
            self._active_node = None
            return stmt, node

        if self._peek_type() == TokenType.COLON:
            self._advance()
            node.add_child(ParseTreeNode("Colon: :"))

        # Handle indented block if present (colon optional)
        block_stmts = []
        if self._peek_type() == TokenType.INDENT:
            block_stmts, block_nodes = self._parse_indented_block()
            for block_node in block_nodes:
                node.add_child(block_node)
            stmt["block"] = block_stmts

        if success and not self.errors:
            print("  [PARSER] Actual structure matches expected rule perfectly.")

        self._active_node = None
        return stmt, node

    # ── Parse: condition (for if / while) ───────────────────────────
    def _parse_condition(self):
        cond_tokens = []
        stop_types = {TokenType.THEN, TokenType.COLON, TokenType.DELIMITER, TokenType.INDENT}
        while self._current() is not None and self._peek_type() not in stop_types:
            cond_tokens.append(self._advance())
        return cond_tokens

    # ── Parse: expression ───────────────────────────────────────────
    def _parse_expression(self):
        expr = []
        stop_types = {TokenType.DELIMITER, TokenType.COLON, TokenType.THEN,
                      TokenType.BY, TokenType.FROM, TokenType.TO, TokenType.TIMES, TokenType.INDENT}
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

    @staticmethod
    def announce_blocked(reason):
        print()
        print("─" * 60)
        print("  STARTING SYNTAX ANALYSIS")
        print("─" * 60)
        print("  [PARSER] Because " + reason + ", we failed to parse anything. It is important that your input follow the rules.")
