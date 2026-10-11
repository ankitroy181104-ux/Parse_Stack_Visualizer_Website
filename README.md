# ParseLab — Interactive Parse Stack & Parse Tree Visualizer

A polished, responsive website for a Compiler Design PBL project. Built with HTML, CSS, and vanilla JavaScript. The parser demonstrates LL(1) predictive parsing and generates a parse tree for arithmetic expressions.

## Features
- Responsive dark UI with a light-theme toggle.
- LL(1) predictive parser implemented in JavaScript.
- Step-by-step trace: stack, remaining input, production or terminal match.
- Next/previous controls, clickable trace rows, and autoplay.
- Parse-tree rendering as responsive SVG.
- Valid/invalid sample expressions and helpful errors.
- Grammar reference with copy button.
- No framework or package installation required.

## Run the website
1. Extract the ZIP file.
2. Open `index.html` in a modern browser.
3. Enter an expression such as `a+b*c`, then press **Parse expression**.
4. Use **Next step**, **Previous**, or **Play** to inspect parsing.
5. Scroll to the parse tree to explore the generated tree.

For best clipboard behavior, you can serve the folder locally:
- VS Code: install/use Live Server, then right-click `index.html` → **Open with Live Server**.
- Python installed: run `python -m http.server 8000` from the project folder, then visit `http://localhost:8000`.

## Grammar
```text
E -> TQ
Q -> +TQ | epsilon
T -> FR
R -> *FR | epsilon
F -> (E) | i
```
`i` represents an identifier or number. The grammar makes `*` higher precedence than `+`.

## Project structure
```text
Parse_Stack_Visualizer_Website/
├── index.html
├── README.md
├── PROJECT_REPORT.md
├── css/
│   └── styles.css
├── js/
│   ├── parser.js
│   ├── tree.js
│   └── app.js
└── assets/
    └── (reserved for future images)
```

## Limitations / future scope
- This is an educational visualizer, not a full compiler.
- Supported operators: `+`, `*`, parentheses; identifiers and numeric literals.
- Could be extended with subtraction, division, unary operators, grammar editing, exportable traces, and a graphical FIRST/FOLLOW table.
