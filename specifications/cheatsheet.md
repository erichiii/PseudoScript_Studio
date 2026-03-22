# PseudoScript Cheatsheet

**PseudoScript** is an easy, descriptive, English-like programming language designed to make pseudocode the actual code. Its primary purpose is to transform coding into a process similar to writing an elementary english assignment, teaching your pet how to do certain things, or designing your program’s logic on paper. This allows users to focus on algorithmic design rather than the intimidating technical syntax.

This language is specifically designed for beginner programmers, including students and young children, who are just starting their journey into computer science. It serves as an ideal introductory tool for those who know what they want their program to do but often get lost in the sea of complex symbols and strict formatting in traditional languages.

---

## Data Types

| Keyword | Data Type | Width | Description |
| :--- | :--- | :--- | :--- |
| `whole` | Integer | 4 bytes | Non-fractional numbers. |
| `decimal` | Float / Double | 8 bytes | Fractional numbers (unified precision). |
| `logic` | Boolean | 1 byte | True or false states. |
| `text` | String / Char | 8 bytes | Characters or sequences. |

---

## Assignment Operator: `is`

* **Rule:** `[data type] [identifier] is [literal | expression].`
* **Example:** 
```text
whole score is 100.
```

---

## Delimiters

| Purpose | Symbol | Description |
| :--- | :--- | :--- |
| Statement Terminator | `.` (dot / period) | Marks the end of a statement. |
| Optional Block Header | `:` (colon) | Visually introduces an indented block (like in `if` or `while`) or when programmers want to put a statement (should only be one) following a control structure in one line. |
| Sequence Separator | `,` (comma) | Distinguishes between multiple items in a list, such as multiple variable declarations or function arguments. |
| Precedence & Grouping | `()` (parentheses) | Encloses mathematical or logical expressions to override standard order of operations (e.g., `(2 + 2) * 5`). |

---

## Output Keyword: `show`

* **Rule:** `show [literal | identifier | expression].`
* **Note:** No parentheses required. The `show` keyword automatically treats the remaining line (until the period) as the output payload. Also, you can perform math or concatenation directly within the output line.
* **Example:** 
```text
show 9 + 5. 
show "The total is " + price.
```

---

## Grouping / Scoping

* **Off-side rule / Indentation**

---

## Keywords

`whole`, `decimal`, `logic`, `text`, `is`, `show`, `while`, `step`, `until`, `if`, `then`, `else`, `elseif`, `true`, `false`, `by`, `times`, `from`, `to`

---

## Valid Identifiers

* Must start with a letter. 
* Can contain numbers and underscores. 
* No spaces or special symbols (e.g., `@`, `$`, `%`).
* Case-sensitive (e.g., `Score` is different from `score`).

---

## Operators

| Category | Symbols / Keywords |
| :--- | :--- |
| **Assignment** | `is` |
| **Arithmetic** | `+`, `-`, `*`, `/`, `++`, `--`, `increase`, `decrease` |
| **Comparison** | `=`, `!=`, `<`, `>`, `<=`, `>=` |
| **Logical** | `and`, `or`, `not` |

---

## Control Structures

### `while` loop
Runs as long as the condition is true. If the user forgets to increase the counter, the compiler defaults to increasing or decreasing it by 1 to prevent infinite loop.

**Syntax:**
```text
while [condition]:
    [indented block].
```
*or*
```text
while [condition]
    [indented block].
```

**Example:**
```text
while counter < 10 
    show "Counting Down: " + counter.
    increase counter by 1.
```

### `step-to` loop
Range-based iteration (rebranded `for` loop).

**Syntax:**
```text
step [num step] times: [statement].

step from [min|max] to [max|min]
    [indented block].

step by [num steps] from [min|max] to [max|min]
    [indented block].
```

**Example:**
```text
step whole num by 2 from 1 to 10:
    show num.
```

### `if-then-else`
Conditional branching.

**Syntax:**
```text
if [condition] then
    [indented block].
elseif [condition] then
    [indented block].
else
    [indented block].
```

**Example:**
```text
if num = 0 then
    show "Zero.".
elseif num = 1 then
    show "One.".
else
    show "Others.".
```

---

## Notes on the Statement Terminator (`.`)

The statement terminator marks the absolute end of a standalone instruction. It acts as a synchronization point for the compiler which allows for **Statement Mode Recovery** where the parser can skip to the next period to continue analysis in case a syntax error occurs.

### When to use: 

**Standalone Commands:** Every individual assignment, output, or calculation must end with a period.
**Example:** 
```text
whole num is 0. 
sum is 9 + 5. 
show num. 
```

**Nested Instructions:** Every statement located inside a control structure block (such as an `if` branch or a `while` loop) requires a period at its end.
**Example:** 
```text
while num < 14
   show num.
   increase num by 1.

if num = 14 then
   show "Fourteen".
else
   show "Others".
```

**Placement:** The period must end at the very end of the line, outside of any quotation marks or variables.

### When to omit it:
* **Headers:** Do not place a period at the end of a control structure header.
* **Block closures:** You do not need a standalone period to close a block. The indentation handles this automatically by looking for a change in spacing.
