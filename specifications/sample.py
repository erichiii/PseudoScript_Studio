import re

separator = r"\s,;(){}+\-*/><"

tokenPatterns = [
    ('KEYWORD',      r'\b(if|else|while|return|int|float|const|void|for|break|continue|switch|case|default|do|sizeof|struct|typedef|enum|char)\b'),
    ('INVALID_REAL', r'\d*\.\d+\.[\d\.]*'),
    ('REAL_NUMBER',  r'\d*\.\d+'),
    ('INVALID_START',r'\b\d+[a-zA-Z_]\w*\b'),
    ('INVALID_ID',   r'\b[a-zA-Z_][a-zA-Z0-9_]*[^' + separator + r'a-zA-Z0-9_\.]+[a-zA-Z0-9_]*'),
    ('OPERATOR',     r'==|!=|>=|<=|&&|\|\||\+|\-|\*|/|=|>|<'),
    ('INTEGER',      r'\b\d+\b'),
    ('STRING',       r'"[^"]*"'),
    ('IDENTIFIER',   r'\b[a-zA-Z_][0-9a-zA-Z_]*\b'),
    ('SEPARATOR',    r'[;,(){}]'),
    ('INVALID_CHAR', r'[^' + separator + r'a-zA-Z0-9_\.]+'),
    ('WHITESPACE',   r'\s+')
]

tokenRegex = re.compile('|'.join(f"(?P<{t}>{p})" for t, p in tokenPatterns))

print("============= Mini - Lexer =============")

while True:
    print("\nEnter lines of code. Type 's' on a new line to submit, or 'q' to quit.")
    input_lines = []
    while True:
        line = input()
        if line.lower() == 'q':
            print("Exiting the lexer...\nBye-bye!")
            raise SystemExit
        if line == 's':
            break
        input_lines.append(line)

    userInput = "\n".join(input_lines)

    if not userInput.strip():
        print("No input provided. Please enter a valid line of code.")
        continue

    print(f"{'Lexeme':<15} | {'Token Type'}")
    print("-" * 35)

    tokens = []
    lexicalError = None

    for match in tokenRegex.finditer(userInput):
        tokenType = match.lastgroup
        lexeme = match.group(tokenType)

        if tokenType == 'WHITESPACE':
            continue

        displayType = 'INVALID' if tokenType.startswith('INVALID') else tokenType
        print(f"{lexeme:<15} | {displayType}")

        if lexicalError is None:
            if tokenType == 'INVALID_REAL':
                lexicalError = f"Lexical Error - '{lexeme}' is an Invalid Literal."
            elif tokenType.startswith('INVALID'):
                lexicalError = f"Lexical Error - '{lexeme}' is an Invalid Identifier."

        tokens.append((tokenType, lexeme))

    print("-" * 35)

    if lexicalError:
        print(f"Error found: {lexicalError}")
        print("Recovery Strategy: Panic Mode Recovery.")
        print("Status: COMPILATION FAILED\nSymbol Table Generation halted...")
        continue

    print("\nChecking Lexical...OK.")

    # --- SYNTAX ANALYSIS ---
    syntaxError = None
    balance = 0

    for token, lexeme in tokens:
        if lexeme == '(':
            balance += 1
        elif lexeme == ')':
            balance -= 1
        if balance < 0:  # Fix: was missing colon
            syntaxError = "Syntax Error - Unbalanced Parentheses (Too many closing brackets)."
            break

    if not syntaxError and balance != 0:
        syntaxError = "Syntax Error - Unbalanced Parentheses (Missing closing bracket)."

    if not syntaxError:
        if not tokens or tokens[-1][1] != ';':
            syntaxError = "Syntax Error - Missing Semicolon at end of line."
        else:
            print("Checking Syntax... OK")

    if syntaxError:
        print(f"Error found: {syntaxError}")
        print("Status: COMPILATION FAILED\nSymbol Table Generation halted...")
        continue

    # --- SEMANTIC ANALYSIS ---
    semanticError = None

    for i in range(len(tokens) - 3):
        token1Type, token1Value = tokens[i]
        token2Type, token2Value = tokens[i + 1]
        token3Type, token3Value = tokens[i + 2]
        token4Type, token4Value = tokens[i + 3]

        if (token1Type == "KEYWORD" and token1Value in ['int', 'float', 'char']) or \
           (token1Type == "IDENTIFIER" and token1Value == 'string'):

            if token2Type == "IDENTIFIER" and token3Value == "=":

                if token1Value == "int" and token4Type == "STRING":
                    semanticError = f"Semantic Error - Type Mismatch. Cannot bind {token4Value} to a variable of type 'int'."
                    break

                if token1Value == "float" and token4Type == "STRING":
                    semanticError = f"Semantic Error - Type Mismatch. Cannot bind {token4Value} to a variable of type 'float'."
                    break

                # Fix: added parentheses around the 'or' condition
                if token1Value == "string" and (token4Type == "INTEGER" or token4Type == "REAL_NUMBER"):
                    semanticError = f"Semantic Error - Type Mismatch. Cannot bind {token4Value} to a variable of type 'string'."
                    break

                # Fix: added parentheses around the 'or' condition
                if token1Value == "char" and (token4Type == "INTEGER" or token4Type == "REAL_NUMBER"):
                    semanticError = f"Semantic Error - Type Mismatch. Cannot bind {token4Value} to a variable of type 'char'."
                    break

    if not semanticError:
        print("Checking Semantics...OK")

    if semanticError:
        print(f"Error found: {semanticError}")
        print("Recovery Strategy: Type Coercion or Discard Assignment.")
        print("Status: COMPILATION FAILED\nSymbol Table Generation halted...")
        continue

    print("\nNo errors found.\nStatus: COMPILATION SUCCESS")

    # --- SYMBOL TABLE ---
    print("\nGenerating Symbol Table...")

    symbolTable = {}
    width_map = {'int': 4, 'float': 4, 'char': 1, 'double': 8}
    typeKeywords = set(width_map.keys())
    currLevel = 0
    offsets_by_level = {0: 0}

    i = 0
    while i < len(tokens):
        tokenType, lexeme = tokens[i]

        if tokenType == 'SEPARATOR':
            if lexeme == '{':
                currLevel += 1
                offsets_by_level.setdefault(currLevel, 0)
            elif lexeme == '}':
                currLevel = max(0, currLevel - 1)

        if tokenType == 'KEYWORD' and lexeme in typeKeywords:
            declaredType = lexeme
            j = i + 1
            while j < len(tokens) and tokens[j][1] != ';':
                tType, tLexeme = tokens[j]
                if tType == 'IDENTIFIER':
                    name = tLexeme
                    w = width_map.get(declaredType, 4)
                    offsets_by_level.setdefault(currLevel, 0)
                    off = offsets_by_level[currLevel]
                    symbolTable[name] = {
                        'type': declaredType,
                        'level': currLevel,
                        'width': w,
                        'offset': off
                    }
                    offsets_by_level[currLevel] += w
                j += 1
            i = j

        i += 1

    print()
    print(f"{'NAME':<20}{'TYPE':<10}{'LVL':<6}{'WIDTH':<8}{'OFFSET':<8}")
    print("-" * 54)
    for name, info in symbolTable.items():
        print(f"{name:<20}{info['type']:<10}{info['level']:<6}{info['width']:<8}{info['offset']:<8}")
    print("-" * 54)
    print()
    print(f"Total Global Memory Required (Level 0): {offsets_by_level.get(0, 0)} Bytes")
    print()
    print(f"Total Local Memory Required (Level 1): {offsets_by_level.get(1, 0)} Bytes")