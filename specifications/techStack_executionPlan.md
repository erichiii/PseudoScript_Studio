# PseudoScript Studio: Tech Stack & Execution Plan

---

## Part 1: Technology Stack Summary

### Frontend Framework
- **Framework:** React.js (with TypeScript for type safety)
- **Reasoning:** Component-based architecture perfect for the UI's modular design (desktop, compiler UI, game mode). Rich ecosystem for animations and interactive elements.
- **Key Libraries:**
  - `React Three Fiber` - 3D rendering of the cute computer asset
  - `Babel` - JSX compilation
  - `Webpack/Vite` - Bundling and dev server

### Compiler Implementation
- **Language:** JavaScript/TypeScript
- **Architecture:** Classic three-phase compiler design
  - **Lexer (Lexical Analyzer):** Tokenization engine with regex-based pattern matching
  - **Parser (Syntax Analyzer):** Recursive descent parser generating AST (Abstract Syntax Tree) with parse tree visualization
  - **Semantic Analyzer:** Type checking, scope management, and symbol table management
  - **Error Handler:** Multi-level error recovery (lexical, syntax phrase-level, semantic)

### Styling & UI
- **CSS Framework:** Tailwind CSS with custom themes for pastel purple, pinks, and blues
- **Animations:** Framer Motion for smooth page transitions (computer zoom-in effect)
- **Icons:** Optional custom icon set for compiler phases

### State Management
- **Redux Toolkit** or **Zustand** - Manage compilation state across phases
- **Context API** - For phase communication and error state

### Data Visualization
- **Parse Tree Display:** Custom SVG/Canvas rendering or `react-tree` library
- **Symbol Table Display:** HTML table with scope-level visualization
- **Memory Management UI:** Bar charts showing memory per scope level

### Development & Build Tools
- **Package Manager:** npm or yarn
- **Testing:** Jest + React Testing Library
- **Linting:** ESLint + Prettier
- **Version Control:** Git

---

## Part 2: Detailed Execution Plan

### Phase A: Project Setup & Infrastructure (Weeks 1-2)

#### A1. Initialize Project Structure
- [ ] Create React app using Vite or Create React App
- [ ] Set up TypeScript configuration
- [ ] Configure ESLint, Prettier, and testing environment
- [ ] Create folder structure:
  ```
  src/
    ├── components/
    │   ├── LandingPage/
    │   ├── Desktop/
    │   ├── Compiler/
    │   ├── GameMode/
    │   └── Shared/
    ├── compiler/
    │   ├── lexer/
    │   ├── parser/
    │   ├── semantic/
    │   ├── symbolTable/
    │   └── errorHandler/
    ├── store/          (Redux/Zustand state)
    ├── styles/         (Tailwind + custom CSS)
    ├── types/          (TypeScript interfaces)
    └── utils/          (Helper functions)
  ```

#### A2. Set Up Design System
- [ ] Create Tailwind configuration with pastel colors (purple, pink, blue palette)
- [ ] Define reusable component styles
- [ ] Set up Framer Motion for animations
- [ ] Create theme provider/context

---

### Phase B: UI Development (Weeks 3-5)

#### B1. Landing Page
- [ ] Implement 3D computer asset (using Three.js/React Three Fiber)
- [ ] Make computer respond to click and spacebar press
- [ ] Implement zoom-in animation transitioning to Desktop
- [ ] Style with pastel cozy vibes

#### B2. Desktop Page
- [ ] Create desktop background
- [ ] Implement draggable application icons ("Compiler", "Game Mode", "Cheatsheet")
- [ ] Add click handlers to open applications in windows
- [ ] Implement window management (open/close/minimize)

#### B3. Compiler UI Layout
- [ ] **Left Panel:**
  - Code editor with syntax highlighting (using Monaco Editor or CodeMirror)
  - Below editor: Phase introduction card (animated)
  - "Generate Random Code" button
  - "Cheatsheet" button (opens modal with language syntax)
  
- [ ] **Right Panel:**
  - Tabbed output view:
    - Lexer output (tokens list)
    - Parser output (parse tree visualization)
    - Semantic output (type checking results)
    - Symbol Table (with scope levels and memory usage)
    - Error messages (color-coded by severity)

#### B4. Game Mode UI (Skeleton)
- [ ] Create placeholder for game mode interface
- [ ] Basic layout/styling

---

### Phase C: Compiler Implementation (Weeks 6-10)

#### C1. Lexer Implementation
**Objectives:**
- Break input string into tokens
- Classify each token (DATATYPE, IDENTIFIER, OPERATOR, LITERAL, DELIMITER, KEYWORD)
- Report invalid tokens

**Key Components:**
- [ ] Token class/interface
  ```typescript
  interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
  }
  
  enum TokenType {
    DATATYPE,      // whole, decimal, logic, text
    IDENTIFIER,    // valid identifiers
    ASSIGN_OP,     // is
    OUTPUT_KW,     // show
    KEYWORD,       // if, while, etc.
    OPERATOR,      // +, -, *, /, =, !=, etc.
    LITERAL,       // numbers, strings, true/false
    DELIMITER,     // . : , ( )
    UNKNOWN
  }
  ```

- [ ] Lexer class with methods:
  - `tokenize(input: string): Token[]`
  - Pattern matching for each token type
  - Error collection and reporting

- [ ] **Explainability Layer:**
  ```
  [LEXER] Reading the input...
  [LEXER] Tokenizing...
  [LEXER] Found 'whole' -> Identified as DATATYPE
  [LEXER] Found 'score' -> Identified as IDENTIFIER
  [LEXER] Found 'is' -> Identified as ASSIGN_OPERATOR
  [LEXER] Found '100' -> Identified as NUMERIC_LITERAL
  [LEXER] Found '.' -> Identified as DELIMITER
  ✓ Lexical Analysis Complete. 0 Unknown Tokens.
  ```
  Or with errors:
  ```
  [LEXER] I found the following invalid tokens:
  - @invalid (line 1, col 6) - Invalid character. Ensure your code uses only valid characters.
  ```

#### C2. Parser Implementation
**Objectives:**
- Check if token sequence forms valid statement(s)
- Generate AST and parse tree
- Show where syntax errors occur in the tree
- Implement phrase-level error recovery (e.g., insert missing period)

**Key Components:**
- [ ] AST Node classes
  ```typescript
  interface ASTNode {
    type: string;
    children?: ASTNode[];
    token?: Token;
    error?: string;
  }
  ```

- [ ] Parser class with recursive descent parsing:
  - `parse(tokens: Token[]): AST`
  - `parseStatement()`
  - `parseExpression()`
  - `parseControlStructure()`
  - Error recovery strategies:
    - Missing delimiter → insert period
    - Missing identifier → report error
    - Missing operator → report error

- [ ] Parse tree visualization builder
  - Convert AST to tree structure for UI rendering

- [ ] **Explainability Layer:**
  ```
  [PARSER] Checking statement structure...
  [PARSER] Expected rule: [DATATYPE] [IDENTIFIER] [ASSIGN_OP] [LITERAL] [DELIMITER]
  [PARSER] Actual sequence matches expected rule perfectly.
  ✓ Syntax Analysis Complete. No structural errors.
  ```
  Or with recovery:
  ```
  [PARSER] Found missing period at end of statement.
  [PARSER] Inserting delimiter and continuing...
  ✓ Syntax Analysis Complete with 1 auto-correction.
  ```

- [ ] Parse tree error highlighting
  - Show incorrect/missing nodes in red
  - Mark error location on tree

#### C3. Semantic Analyzer Implementation
**Objectives:**
- Check type compatibility
- Manage variable scopes
- Build and maintain symbol table
- Calculate memory usage per scope

**Key Components:**
- [ ] Symbol class
  ```typescript
  interface Symbol {
    name: string;
    type: DataType;      // whole, decimal, logic, text
    value: any;
    scope: number;       // 0 = global, 1+ = nested scopes
    line: number;
    memorySize: number;  // 1, 4, 8 bytes based on type
  }
  ```

- [ ] Semantic Analyzer class:
  - `analyze(ast: AST): SemanticResult`
  - `checkType(declaredType, actualValue): boolean`
  - `bindVariable(symbol): void`
  - Scope management (push/pop scopes for loops, conditionals)
  - Collect type mismatch errors

- [ ] Symbol Table class:
  - Insert, lookup, update symbols
  - Scope stack management
  - Memory calculation per scope
  - Display formatted symbol table

- [ ] **Explainability Layer:**
  ```
  [SEMANTICS] Checking Type Compatibility...
  [SEMANTICS] Variable 'score' is declared as 'whole'. Value is '100' (Numeric).
  [SEMANTICS] Types match. No coercion needed.
  [SEMANTICS] Binding variable 'score' to Symbol Table.
  [SEMANTICS] Scope Level: GLOBAL | Memory Used: 4 bytes
  ✓ Semantic Analysis Complete.
  ```
  Or with error:
  ```
  [SEMANTICS] Checking Type Compatibility...
  [SEMANTICS] Variable 'name' is declared as 'whole'. Value is '"John"' (String).
  ✗ TYPE MISMATCH ERROR: Cannot assign String to whole type.
  [SEMANTICS] Please ensure the value matches the declared data type.
  ```

#### C4. Symbol Table & Memory Management
**Objectives:**
- Visual display of all declared variables
- Show scope hierarchy
- Calculate and display memory per scope level

**Key Components:**
- [ ] Symbol Table UI component
  - Tabular display with columns: Name, Type, Value, Scope, Memory
  - Color-code by scope (global, local, nested)
  - Memory bar showing cumulative usage per scope

- [ ] Memory Calculator
  - `whole` = 4 bytes
  - `decimal` = 8 bytes
  - `logic` = 1 byte
  - `text` = 8 bytes
  - Calculate total per scope level

- [ ] **Explainability Layer:**
  ```
  [SEMANTICS] Symbol Table:
  
  SCOPE LEVEL 0 (GLOBAL) - Total Memory: 16 bytes
  ├─ score : whole = 100 (4 bytes)
  ├─ name : text = "" (8 bytes)
  └─ temperature : decimal = 36.5 (8 bytes)
  
  [SEMANTICS] All variables successfully bound to memory.
  ```

#### C5. Error Handling System
**Objectives:**
- Catch errors at all three phases
- Provide actionable error messages
- Guide user to fix errors
- Implement multi-level error recovery

**Key Components:**
- [ ] Error class hierarchy
  ```typescript
  abstract class CompilerError {
    phase: 'LEXER' | 'PARSER' | 'SEMANTIC';
    message: string;
    line: number;
    column: number;
    suggestion: string;
  }
  
  class LexicalError extends CompilerError {}
  class SyntaxError extends CompilerError {}
  class SemanticError extends CompilerError {}
  ```

- [ ] Error Reporter class
  - Collect errors from all phases
  - Format for display
  - Provide recovery suggestions

- [ ] **Explainability Layer:**
  ```
  [LEXER] I found the following issues:
  
  ERROR 1 (Line 1, Col 6): Invalid token '@score'
  → Identifier names must start with a letter.
  → Try: score (remove @)
  
  ERROR 2 (Line 2, Col 8): Unknown token '&'
  → The character '&' is not defined in PseudoScript.
  → Use 'and' for logical AND instead.
  
  Please fix these errors and try again.
  ```

---

### Phase D: Phase Introductions & Explainability (Week 5, integrated throughout)

#### D1. Phase Character System
**Objectives:**
- Make each phase a "character" with personality
- Show introduction on first use
- Display dynamic status messages

**Implementation:**
- [ ] Phase Character component
  ```typescript
  interface CompilerPhase {
    id: 'LEXER' | 'PARSER' | 'SEMANTIC';
    name: string;
    emoji: string;
    description: string;
    introduction: string;
  }
  
  const LEXER = {
    id: 'LEXER',
    name: 'Lexer',
    emoji: '🔤',
    description: 'Breaks input into tokens',
    introduction: '[LEXER] Hello! I am the Lexical Analyzer. You can call me Lexer! I am responsible for breaking down your input into tokens.',
  };
  ```

- [ ] Character animation on first appearance
- [ ] Status messages in character voice during analysis
- [ ] Error-dependent messages (e.g., skip later phases if lexer fails)

#### D2. Visual Phase Indicator
**Objectives:**
- Show which phase is running
- Display phase icon/avatar in UI

**Implementation:**
- [ ] Phase indicator panel (left bottom corner)
- [ ] Icon/avatar for each phase (cute, cozy style)
- [ ] Animated message box showing current phase's messages

---

### Phase E: Additional Features (Week 11+)

#### E1. Code Generation (Random Code Generator)
- [ ] Template-based code generator
- [ ] Generate valid PseudoScript statements randomly
- [ ] Use cases: Testing, learning examples

#### E2. Cheatsheet Modal
- [ ] Display language syntax
- [ ] Include data types, operators, control structures
- [ ] Searchable/filterable

#### E3. Game Mode (Optional)
- [ ] Create small game for learning compiler concepts
- [ ] E.g., "Fix the Code" - identify and fix compilation errors
- [ ] Score-based progression

#### E4. Export & History
- [ ] Save compilation results
- [ ] View compilation history
- [ ] Export AST, symbol table, or analysis results

---

## Part 3: Implementation Workflow

### Week-by-Week Breakdown

| Week | Task | Deliverables |
|------|------|--------------|
| 1-2 | Project setup, design system | Folder structure, config files, theme colors |
| 3 | Landing page + Desktop | Clickable 3D computer, desktop with app icons |
| 4 | Compiler UI Layout | Editor + output panels ready |
| 5 | Phase intros + Lexer | Lexer implementation + character intro |
| 6 | Parser | Parser implementation + AST/Parse tree visualization |
| 7-8 | Semantic Analyzer | Type checking, symbol table, memory calculation |
| 9 | Error Handling | Error recovery, message formatting, UI display |
| 10 | Testing & Polish | Unit tests, bug fixes, performance optimization |
| 11+ | Game Mode, Extras | Advanced features, refinements |

---

## Part 4: Testing Strategy

### Unit Tests
- Lexer: Test tokenization of valid/invalid inputs
- Parser: Test AST generation for various statement types
- Semantic: Test type checking and symbol table binding
- Error Handler: Test error messages and recovery

### Integration Tests
- Full compilation pipeline: input → output
- Phase message cascading (if lexer fails, parser should skip)
- Symbol table population across scopes

### User Acceptance Tests
- Sample code from requirements works correctly
- Error messages are helpful and actionable
- UI is responsive and intuitive

---

## Part 5: Key Success Criteria

✓ **Lexer:** All tokens correctly identified; unknown tokens reported with suggestions  
✓ **Parser:** Parse tree accurate; missing delimiters auto-corrected  
✓ **Semantic:** Type mismatches caught; symbol table properly displayed  
✓ **Error Handling:** Errors at any phase prevent subsequent phases; suggestions provided  
✓ **Explainability:** Each phase introduces itself and explains its actions in user-friendly language  
✓ **UI:** Cozy, pastel aesthetic; smooth animations; intuitive layout  
✓ **Symbol Table:** Shows all variables with type, value, scope, and memory usage  

---

## Dependencies to Install

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "framer-motion": "^10.x",
    "@react-three/fiber": "^8.x",
    "three": "^r150.x",
    "zustand": "^4.x"
  },
  "devDependencies": {
    "vite": "^4.x",
    "@types/react": "^18.x",
    "eslint": "^8.x",
    "prettier": "^3.x",
    "jest": "^29.x",
    "@testing-library/react": "^14.x"
  }
}
```

---

## Next Steps

1. **Immediate:** Set up the React project with Vite
2. **Day 1-3:** Configure TypeScript, Tailwind, and ESLint
3. **Day 4-7:** Build Landing Page and Desktop UI
4. **Day 8+:** Begin Lexer implementation while UI is being refined

Good luck! 🎉
