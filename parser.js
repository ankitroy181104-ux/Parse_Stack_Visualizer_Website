/* Predictive LL(1) parser and parse-tree builder.
   Grammar:
   E -> TQ
   Q -> +TQ | epsilon
   T -> FR
   R -> *FR | epsilon
   F -> (E) | i
*/
(function (global) {
  "use strict";

  const GRAMMAR = {
    E: { i: ["T", "Q"], "(": ["T", "Q"] },
    Q: { "+": ["+", "T", "Q"], ")": [], "$": [] },
    T: { i: ["F", "R"], "(": ["F", "R"] },
    R: { "*": ["*", "F", "R"], "+": [], ")": [], "$": [] },
    F: { "(": ["(", "E", ")"], i: ["i"] }
  };
  const NONTERMINALS = new Set(["E", "Q", "T", "R", "F"]);
  const TERMINALS = new Set(["i", "+", "*", "(", ")"]);

  function tokenize(raw) {
    const tokens = [];
    let i = 0;
    while (i < raw.length) {
      const c = raw[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[A-Za-z_]/.test(c)) {
        let value = c; i++;
        while (i < raw.length && /[A-Za-z0-9_]/.test(raw[i])) value += raw[i++];
        tokens.push({ type: "i", value });
      } else if (/[0-9]/.test(c)) {
        let value = c; i++;
        while (i < raw.length && /[0-9.]/.test(raw[i])) value += raw[i++];
        if (!/^\d+(?:\.\d+)?$/.test(value)) throw new Error("Invalid numeric literal: " + value);
        tokens.push({ type: "i", value });
      } else if ("+*()".includes(c)) {
        tokens.push({ type: c, value: c }); i++;
      } else {
        throw new Error("Unsupported character “" + c + "”. Use identifiers, numbers, +, *, and parentheses.");
      }
    }
    if (!tokens.length) throw new Error("Please enter an expression first.");
    return tokens;
  }

  function parse(raw) {
    const tokens = tokenize(raw);
    const stream = tokens.map(t => t.type).concat("$");
    const displayStream = tokens.map(t => t.value).concat("$");
    const stack = ["$", "E"];
    const root = { symbol: "E", children: [], id: 0 };
    const nodeStack = [{ symbol: "$", node: null }, { symbol: "E", node: root }];
    let tokenIndex = 0, nextId = 1;
    const steps = [];
    const maxSteps = Math.max(80, tokens.length * 15);

    function snapshot(action, kind, stackBefore, inputIndex, nodeId) {
      steps.push({
        number: steps.length + 1,
        stack: stackBefore.slice(),
        input: displayStream.slice(inputIndex).join(" "),
        action, kind: kind || "normal", nodeId: nodeId == null ? null : nodeId,
        consumed: inputIndex
      });
    }

    snapshot("Initialize stack with $ and E", "system", stack, tokenIndex, root.id);
    while (nodeStack.length && steps.length < maxSteps) {
      const topItem = nodeStack[nodeStack.length - 1];
      const lookahead = stream[tokenIndex];
      const before = nodeStack.map(x => x.symbol);
      const x = topItem.symbol;

      if (x === "$" && lookahead === "$") {
        snapshot("Accept — input parsed successfully", "accept", before, tokenIndex);
        return { valid: true, tokens, steps, root, grammar: GRAMMAR };
      }

      if (NONTERMINALS.has(x)) {
        const rhs = GRAMMAR[x][lookahead];
        if (rhs === undefined) {
          snapshot("ERROR — no rule for " + x + " with lookahead " + (lookahead === "$" ? "end of input" : lookahead), "error", before, tokenIndex, topItem.node && topItem.node.id);
          return { valid: false, tokens, steps, root, error: "Unexpected " + (lookahead === "$" ? "end of input" : "“" + displayStream[tokenIndex] + "”") + " while parsing " + x + "." };
        }
        nodeStack.pop(); stack.pop();
        if (!rhs.length) {
          topItem.node.children.push({ symbol: "ε", children: [], id: nextId++, epsilon: true });
          snapshot(x + " → ε  (empty production)", "production", before, tokenIndex, topItem.node.id);
        } else {
          const children = rhs.map(symbol => ({ symbol, children: [], id: nextId++ }));
          topItem.node.children.push(...children);
          for (let i = rhs.length - 1; i >= 0; i--) {
            nodeStack.push({ symbol: rhs[i], node: children[i] });
            stack.push(rhs[i]);
          }
          snapshot(x + " → " + rhs.join(""), "production", before, tokenIndex, topItem.node.id);
        }
      } else if (TERMINALS.has(x)) {
        if (x !== lookahead) {
          snapshot("ERROR — expected " + x + ", found " + (lookahead === "$" ? "end of input" : displayStream[tokenIndex]), "error", before, tokenIndex, topItem.node && topItem.node.id);
          return { valid: false, tokens, steps, root, error: "Expected “" + x + "” but found " + (lookahead === "$" ? "end of input" : "“" + displayStream[tokenIndex] + "”") + "." };
        }
        nodeStack.pop(); stack.pop();
        if (topItem.node) topItem.node.lexeme = tokens[tokenIndex] ? tokens[tokenIndex].value : x;
        snapshot("Match terminal " + (x === "i" ? "“" + displayStream[tokenIndex] + "” (i)" : "“" + x + "”"), "match", before, tokenIndex, topItem.node && topItem.node.id);
        tokenIndex++;
      } else {
        snapshot("ERROR — unknown stack symbol", "error", before, tokenIndex);
        return { valid: false, tokens, steps, root, error: "Internal parser error." };
      }
    }
    if (steps.length >= maxSteps) return { valid: false, tokens, steps, root, error: "Parsing stopped: maximum step count reached." };
    return { valid: false, tokens, steps, root, error: "Input was not accepted." };
  }

  function countNodes(node) {
    return 1 + (node.children || []).reduce((sum, child) => sum + countNodes(child), 0);
  }
  global.ParseLabParser = { parse, tokenize, countNodes, grammar: GRAMMAR };
})(window);
