/* Responsive SVG parse-tree renderer. */
(function (global) {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const NONTERMINALS = new Set(["E", "Q", "T", "R", "F"]);
  function svgEl(tag, attrs, text) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function layoutTree(root) {
    let leaf = 0;
    const nodes = [], edges = [];
    function visit(node, depth, parent) {
      const item = { node, depth, x: 0, y: depth * 78 + 24 };
      if (parent) edges.push({ parent, child: item });
      nodes.push(item);
      if (!node.children || !node.children.length) {
        item.x = leaf * 84 + 42;
        leaf++;
      } else {
        node.children.forEach(child => visit(child, depth + 1, item));
        item.x = node.children.reduce((sum, child) => sum + findItem(child).x, 0) / node.children.length;
      }
      return item;
    }
    function findItem(node) { return nodes.find(n => n.node === node); }
    visit(root, 0, null);
    return { nodes, edges, width: Math.max(leaf * 84, 120), height: Math.max(...nodes.map(n => n.y)) + 52 };
  }
  function render(root, container) {
    container.innerHTML = "";
    const layout = layoutTree(root);
    const svg = svgEl("svg", { class: "tree-svg", viewBox: `0 0 ${layout.width} ${layout.height}`, width: layout.width, height: layout.height, role: "img", "aria-label": "Generated parse tree" });
    layout.edges.forEach(edge => {
      const p = edge.parent, c = edge.child;
      svg.appendChild(svgEl("path", { class: "tree-edge", d: `M ${p.x} ${p.y + 15} L ${c.x} ${c.y - 15}` }));
    });
    layout.nodes.forEach(item => {
      const sym = item.node.symbol;
      const isEpsilon = sym === "ε";
      const isTerminal = !NONTERMINALS.has(sym) || isEpsilon;
      const width = Math.max(42, (sym.length > 2 ? sym.length * 7 : sym.length * 9) + 22);
      const group = svgEl("g", { class: "tree-node-group" });
      group.appendChild(svgEl("rect", {
        class: "tree-node-box " + (isEpsilon ? "epsilon" : isTerminal ? "terminal" : "nonterminal"),
        x: item.x - width / 2, y: item.y - 16, width, height: 32, rx: 8
      }));
      let label = sym;
      if (sym === "i" && item.node.lexeme) label = item.node.lexeme;
      group.appendChild(svgEl("text", {
        class: "tree-node-text " + (isEpsilon ? "epsilon-text" : isTerminal ? "terminal-text" : ""),
        x: item.x, y: item.y + 1
      }, label));
      group.appendChild(svgEl("title", {}, isEpsilon ? "Epsilon: empty production" : (NONTERMINALS.has(sym) ? "Non-terminal " : "Terminal ") + label));
      svg.appendChild(group);
    });
    container.appendChild(svg);
    return { count: layout.nodes.length, width: layout.width, height: layout.height };
  }
  global.ParseLabTree = { render };
})(window);
