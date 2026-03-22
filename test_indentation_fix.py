from compiler.pseudoscript import compile_line
from compiler.symbol_table import SymbolTable

# Test 1: Basic if/else with proper indentation
print("=" * 70)
print("Test 1: If/Else with Proper Multi-Line Indentation")
print("=" * 70)

code1 = '''whole age is 0.
if age = 0 then
    show "Newborn".
else
    show "Not newborn".'''

symbol_table1 = SymbolTable()
compile_line(code1, symbol_table1)

# Test 2: Nested control structures
print("\n" + "=" * 70)
print("Test 2: Nested Control Structures")
print("=" * 70)

code2 = '''whole x is 0.
while x < 2
    whole y is 0.
    while y < 2
        show x.
        increase y by 1.
    increase x by 1.'''

symbol_table2 = SymbolTable()
compile_line(code2, symbol_table2)

print("\n" + "=" * 70)
print("All tests completed!")
print("=" * 70)
