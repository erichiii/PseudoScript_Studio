export const starterCode = `whole age is 20.
if age > 18 then
    show "Access granted".
else
    show "Too young".
`;

export const randomSnippets = [
  `whole counter is 0.
while counter < 5
    show "Counting: " + counter.
    increase counter by 1.
`,
  `text petName is "Pixel".
whole treats is 3.
while treats > 0
    show petName + " does a trick!".
    decrease treats by 1.
show "All done!".
`,
  `whole start is 2.
whole end is 10.
step by 2 from start to end
    show "Even: " + start.
    increase start by 2.
`,
];

export const sampleTokens = [
  { type: "DATATYPE", value: "whole" },
  { type: "IDENTIFIER", value: "age" },
  { type: "ASSIGN_OP", value: "is" },
  { type: "NUMERIC_LITERAL", value: "20" },
  { type: "DELIMITER", value: "." },
];

export const sampleParseTree = [
  {
    label: "Declaration",
    children: [
      { label: "Datatype: whole" },
      { label: "Identifier: age" },
      { label: "Assignment: is" },
      { label: "Literal: 20" },
    ],
  },
  {
    label: "If Statement",
    children: [
      { label: "Condition: age > 18" },
      { label: "Block: show \"Access granted\"" },
      { label: "Else Block: show \"Too young\"" },
    ],
  },
];

export const sampleSemanticNotes = [
  "[SEMANTICS] Variable 'age' bound at GLOBAL scope (4 bytes).",
  "[SEMANTICS] Condition variables validated.",
  "[SEMANTICS] Output will display: 'Access granted'.",
];

export const sampleSymbolTable = {
  entries: [
    { name: "age", type: "whole", scope: 0, bytes: 4, value: 20 },
    { name: "status", type: "text", scope: 1, bytes: 8, value: "Access granted" },
  ],
  scopes: [
    { level: 0, label: "GLOBAL", memory: 4 },
    { level: 1, label: "IF BLOCK", memory: 8 },
  ],
};

export const sampleErrors = [
  {
    phase: "LEXER",
    message: "Unknown token '@' at line 1, column 6.",
    hint: "Identifiers must start with a letter.",
  },
  {
    phase: "SEMANTIC",
    message: "Type mismatch on 'score'. Expected whole, received text.",
    hint: "Change the literal or the declared type.",
  },
];
