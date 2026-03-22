from compiler.pseudoscript import compile_line
from compiler.symbol_table import SymbolTable

# Test 1: While loop with indented block
print("=" * 70)
print("Test 1: While Loop with Indented Block")
print("=" * 70)

code1 = '''whole counter is 0.
while counter < 3
    show counter.
    increase counter by 1.'''

symbol_table1 = SymbolTable()
compile_line(code1, symbol_table1)

# Test 2: If/Else with indented blocks
print("\n" + "=" * 70)
print("Test 2: If/Else with Indented Blocks")
print("=" * 70)

code2 = '''whole score is 85.
if score >= 80 then
    show "Pass".
else
    show "Fail".'''

symbol_table2 = SymbolTable()
compile_line(code2, symbol_table2)

# Test 3: Nested blocks
print("\n" + "=" * 70)
print("Test 3: Nested Control Structures")
print("=" * 70)

code3 = '''whole x is 0.
while x < 2
    whole y is 0.
    while y < 2
        show x.
        increase y by 1.
    increase x by 1.'''

symbol_table3 = SymbolTable()
compile_line(code3, symbol_table3)
