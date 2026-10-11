# Compiler Design PBL Project Report
## Visualize Parse Stack Operation & Parse Tree

### 1. Abstract
ParseLab is an interactive website that helps learners understand predictive parsing. It visualizes stack operations, remaining input, grammar productions, and the parse tree generated from a valid arithmetic expression. The interface is implemented using HTML, CSS, and JavaScript.

### 2. Problem statement
Parsing is an important compiler phase, but the sequence of stack updates and grammar expansions can be difficult to understand from theory alone. A visual and step-based demonstration makes the process easier to learn and verify.

### 3. Objectives
- Visualize a predictive parser's stack at every step.
- Display the unprocessed input and the action taken.
- Explain how LL(1) lookahead selects a production.
- Build and display a parse tree for accepted input.
- Demonstrate valid and invalid expressions through examples.

### 4. Tools and technologies
- HTML5: website structure
- CSS3: responsive layout, colors, panels, and styling
- JavaScript: tokenization, LL(1) parsing, step trace, and tree layout
- SVG: scalable parse-tree drawing
- Modern web browser: runtime

### 5. Grammar
```text
E -> TQ
Q -> +TQ | epsilon
T -> FR
R -> *FR | epsilon
F -> (E) | i
```
`E`, `Q`, `T`, `R`, and `F` are non-terminals. `i` stands for an identifier or numeric literal. Epsilon is an empty production.

### 6. System workflow
1. User enters an arithmetic expression.
2. The tokenizer converts identifiers and numeric literals into grammar token `i` while preserving their displayed values.
3. The parser initializes the stack with `$` and `E`.
4. For a non-terminal, the parser selects a production using the lookahead token.
5. The right-hand side is added to the parse tree and pushed onto the stack in reverse order.
6. Matching terminals are popped and the input pointer advances.
7. The expression is accepted when the stack and input both reach `$`.
8. The interface shows the trace and generated parse tree.

### 7. Test cases
| Expression | Expected result |
|---|---|
| `a+b*c` | Valid |
| `(a+b)*c` | Valid |
| `x+12` | Valid |
| `a+*b` | Invalid |
| `(a+b` | Invalid |
| `a b` | Invalid under this grammar because there is no operator between identifiers |

### 8. Advantages
- Interactive and visually organized learning experience.
- No installation or backend server required.
- Clear step-by-step parsing actions.
- Responsive website suitable for laptop and mobile screens.
- SVG parse tree scales cleanly.

### 9. Limitations
The project supports a small arithmetic grammar. It does not generate machine code and is intended as a learning tool rather than a production compiler.

### 10. Future enhancements
- Add `-`, `/`, unary operators, and richer numeric validation.
- Show FIRST and FOLLOW sets and the LL(1) parsing table.
- Export the trace or tree as CSV, SVG, or PNG.
- Add a grammar editor and custom grammar support.
- Add syntax error recovery and guided exercises.

### 11. Conclusion
ParseLab makes the relationship between grammar rules, stack operations, and parse-tree construction visible. It provides a practical, interactive demonstration of LL(1) parsing for Compiler Design students.
