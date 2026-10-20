/* Terminal UI for the simulated Linux shell. A single Shell instance persists across page navigation. */
NOS.getShell = () => NOS._shell || (NOS._shell = new NOS.Shell());

NOS.mountTerminal = (el, opts = {}) => {
  const sh = NOS.getShell();
  el.innerHTML = `<div class="term" id="term"><div id="out"></div><div class="in"><span id="ps"></span><input id="inp" autocomplete="off" spellcheck="false" autocapitalize="off"></div></div>`;
  const out = NOS.$("#out", el), inp = NOS.$("#inp", el), term = NOS.$("#term", el), ps = NOS.$("#ps", el);
  const add = l => { const d = document.createElement("div"); d.className = "l " + (l.cls || ""); d.textContent = l.text; out.appendChild(d); };
  const setPs = () => ps.textContent = sh.prompt();
  const scroll = () => term.scrollTop = 1e9;
  if (!sh.screen.length) sh.print("NOS.120 simulated Linux shell (bash-like). Type 'help'. Tab completes, Up/Down recalls history.", "dim");
  sh.screen.forEach(add); setPs(); scroll();
  sh.onPrint = l => { add(l); scroll(); };
  sh.onClear = () => { out.innerHTML = ""; };
  sh.onRun = line => { setPs(); if (opts.onRun) opts.onRun(line); };
  term.onclick = () => { if (!getSelection().toString()) inp.focus(); };
  inp.onkeydown = e => {
    if (e.key === "Enter") { const v = inp.value; inp.value = ""; sh.run(v); setPs(); scroll(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (sh.hpos > 0) inp.value = sh.hist[--sh.hpos]; }
    else if (e.key === "ArrowDown") { e.preventDefault(); inp.value = sh.hpos < sh.hist.length - 1 ? sh.hist[++sh.hpos] : (sh.hpos = sh.hist.length, ""); }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); sh.clearScreen(); }
    else if (e.key === "c" && e.ctrlKey) { e.preventDefault(); sh.print(sh.prompt() + " " + inp.value + "^C", "cmd"); inp.value = ""; }
    else if (e.key === "Tab") {
      e.preventDefault(); const r = sh.complete(inp.value);
      if (!r.cands.length) return;
      let pre = r.cands[0]; for (const c of r.cands) while (!c.startsWith(pre)) pre = pre.slice(0, -1);
      if (pre.length > r.word.length) inp.value = r.head + pre + (r.cands.length === 1 && !pre.endsWith("/") ? " " : "");
      else if (r.cands.length > 1) sh.print(r.cands.join("  "), "dim");
    }
  };
  inp.focus();
  return () => { sh.onPrint = null; sh.onClear = null; sh.onRun = null; };
};

NOS.addModule({
  id: "terminal", title: "Linux Terminal", group: "Practice", order: 1,
  render(el) {
    el.innerHTML = `<h1>Linux Terminal</h1><div class="sub">A simulated single-user Linux system with a full virtual filesystem. Nothing here touches your real computer. Type <code>help</code>.</div><div class="row"><button class="btn" id="rst">Reset machine</button><button class="btn" id="clr">Clear screen</button></div><div id="tm"></div>`;
    const cleanup = NOS.mountTerminal(NOS.$("#tm", el));
    NOS.$("#rst", el).onclick = () => { const s = NOS.getShell(); s.reset(); s.clearScreen(); s.print("Machine reset to defaults.", "dim"); };
    NOS.$("#clr", el).onclick = () => NOS.getShell().clearScreen();
    return cleanup;
  }
});
