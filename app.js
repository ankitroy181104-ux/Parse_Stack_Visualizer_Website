/* UI controller: trace stepping, validation, theme, and copy helpers. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const input = $("expressionInput"), traceBody = $("traceBody"), treeCanvas = $("treeCanvas");
  let result = null, currentStep = -1, timer = null, toastTimer = null;

  function toast(message) {
    const el = $("toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function stackDisplay(stack) {
    return stack.map((symbol, index) => index === stack.length - 1 ? "▶" + symbol : symbol).join(" ");
  }
  function renderTrace() {
    if (!result || !result.steps.length) return;
    traceBody.innerHTML = "";
    result.steps.forEach((step, index) => {
      const tr = document.createElement("tr");
      if (index === currentStep) tr.classList.add("active-row");
      if (step.kind === "error") tr.classList.add("error-row");
      const kindClass = step.kind === "production" ? "action-production" : step.kind === "match" ? "action-match" : step.kind === "error" ? "action-error" : "";
      tr.innerHTML = `<td>${String(step.number).padStart(2, "0")}</td><td>${esc(stackDisplay(step.stack))}</td><td>${esc(step.input)}</td><td class="${kindClass}">${esc(step.action)}</td>`;
      tr.addEventListener("click", () => { currentStep = index; updateStepUI(); });
      traceBody.appendChild(tr);
    });
    const active = traceBody.querySelector(".active-row");
    if (active) active.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function updateStepUI() {
    if (!result) return;
    const total = result.steps.length;
    $("stepCount").innerHTML = `${currentStep + 1} <small>/ ${total}</small>`;
    $("prevStep").disabled = currentStep <= 0;
    $("nextStep").disabled = currentStep >= total - 1;
    $("playButton").disabled = currentStep >= total - 1;
    $("nextStep").innerHTML = currentStep >= total - 1 ? "Trace complete ✓" : 'Next step <span>→</span>';
    $("progressBar").style.width = `${((currentStep + 1) / total) * 100}%`;
    $("stepHint").textContent = currentStep >= total - 1 ? "End of parsing trace" : "Select a row or move step by step";
    const step = result.steps[currentStep];
    if (step && step.kind === "error") $("parseStatus").textContent = "Error at step " + step.number;
    else if (result.valid && currentStep === total - 1) $("parseStatus").textContent = "Accepted ✓";
    else $("parseStatus").textContent = "Step " + (currentStep + 1) + " of " + total;
    $("parseStatus").className = result.valid && currentStep === total - 1 ? "status-success" : step && step.kind === "error" ? "status-error" : "status-waiting";
    renderTrace();
  }
  function stopPlayback() {
    if (timer) clearInterval(timer);
    timer = null; $("playButton").textContent = "▶";
  }
  function renderTree() {
    if (!result || !result.valid) {
      treeCanvas.innerHTML = `<div class="tree-empty"><div class="empty-tree-icon">⌘</div><b>${result ? "No complete tree: expression is invalid" : "Waiting for a valid expression"}</b><span>${result ? esc(result.error || "Correct the expression and parse again.") : "Run the parser to build a syntax tree from the grammar."}</span></div>`;
      $("treeNodeCount").textContent = result ? "INVALID INPUT" : "NO TREE YET";
      $("expandTree").disabled = true;
      return;
    }
    const info = window.ParseLabTree.render(result.root, treeCanvas);
    $("treeNodeCount").textContent = info.count + " NODES";
    $("expandTree").disabled = false;
  }
  function parseInput() {
    stopPlayback();
    try {
      result = window.ParseLabParser.parse(input.value);
      currentStep = 0;
      $("tokenCount").textContent = result.tokens.length;
      $("validationMessage").textContent = result.valid ? "✓ Expression accepted by the grammar." : "⚠ " + result.error;
      $("validationMessage").className = "validation-message " + (result.valid ? "success" : "");
      if (!result.valid) {
        const last = result.steps[result.steps.length - 1];
        if (last && last.kind === "error") currentStep = result.steps.length - 1;
      }
      $("parseStatus").textContent = result.valid ? "Valid expression" : "Invalid expression";
      $("parseStatus").className = result.valid ? "status-success" : "status-error";
      $("stepCount").innerHTML = `1 <small>/ ${result.steps.length}</small>`;
      $("stepHint").textContent = "Click a row to inspect that step";
      renderTrace(); updateStepUI(); renderTree();
      toast(result.valid ? "Expression parsed successfully" : "Parsing error — check the trace");
    } catch (err) {
      result = null; currentStep = -1;
      $("validationMessage").textContent = "⚠ " + err.message;
      $("validationMessage").className = "validation-message";
      $("parseStatus").textContent = "Input error"; $("parseStatus").className = "status-error";
      $("stepCount").innerHTML = "— <small>/ —</small>";
      $("tokenCount").textContent = "—";
      $("traceBody").innerHTML = `<tr class="empty-row"><td colspan="4"><span class="empty-icon">!</span><b>Input needs attention</b><small>${esc(err.message)}</small></td></tr>`;
      $("prevStep").disabled = $("nextStep").disabled = $("playButton").disabled = true;
      $("progressBar").style.width = "0%";
      treeCanvas.innerHTML = `<div class="tree-empty"><div class="empty-tree-icon">!</div><b>Cannot build a parse tree</b><span>${esc(err.message)}</span></div>`;
      $("treeNodeCount").textContent = "INPUT ERROR"; $("expandTree").disabled = true;
    }
  }

  $("parseButton").addEventListener("click", parseInput);
  input.addEventListener("keydown", e => { if (e.key === "Enter") parseInput(); });
  $("clearInput").addEventListener("click", () => { input.value = ""; input.focus(); });
  document.querySelectorAll("[data-example]").forEach(btn => btn.addEventListener("click", () => {
    input.value = btn.dataset.example; parseInput();
  }));
  $("nextStep").addEventListener("click", () => { if (result && currentStep < result.steps.length - 1) { currentStep++; updateStepUI(); } });
  $("prevStep").addEventListener("click", () => { if (result && currentStep > 0) { currentStep--; updateStepUI(); } });
  $("resetButton").addEventListener("click", () => {
    stopPlayback();
    if (result) { currentStep = 0; updateStepUI(); } else { input.value = "a+b*c"; parseInput(); }
  });
  $("playButton").addEventListener("click", () => {
    if (!result) return;
    if (timer) { stopPlayback(); return; }
    if (currentStep >= result.steps.length - 1) currentStep = 0;
    $("playButton").textContent = "Ⅱ";
    timer = setInterval(() => {
      if (!result || currentStep >= result.steps.length - 1) { stopPlayback(); return; }
      currentStep++; updateStepUI();
      if (currentStep >= result.steps.length - 1) stopPlayback();
    }, 900);
  });
  $("expandTree").addEventListener("click", () => {
    const svg = treeCanvas.querySelector("svg");
    if (!svg) return;
    const expanded = svg.dataset.expanded === "true";
    svg.style.width = expanded ? "" : (Number(svg.getAttribute("width")) * 1.2) + "px";
    svg.dataset.expanded = String(!expanded);
    $("expandTree").textContent = expanded ? "Expand ↗" : "Zoomed ×";
  });
  $("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    toast(document.body.classList.contains("light") ? "Light theme enabled" : "Dark theme enabled");
  });
  $("copyGrammar").addEventListener("click", async () => {
    const text = "E -> TQ\\nQ -> +TQ | epsilon\\nT -> FR\\nR -> *FR | epsilon\\nF -> (E) | i";
    try { await navigator.clipboard.writeText(text); toast("Grammar copied to clipboard"); }
    catch (_) { toast("Copy is not available in this browser context"); }
  });

  // Initial page state: run the example so the interactive panels are not empty.
  parseInput();
})();
