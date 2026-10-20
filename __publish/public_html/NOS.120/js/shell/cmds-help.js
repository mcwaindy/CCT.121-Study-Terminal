/* Help commands: help, man, info, whatis, apropos, commands. Uses window.COMMANDS (command reference) lazily. */
(() => {
  const NOS = window.NOS, def = NOS.defCmd;
  const ref = n => (window.COMMANDS || []).find(c => c.name === n);

  def("help", "Show built-in help", c => {
    const cmds = NOS.shellCommands;
    if (c.args[0]) { const r = ref(c.args[0]); if (!r) return c.fail(`bash: help: no help topics match \`${c.args[0]}'.`); return c.p(`${r.name}: ${r.desc}\nUsage: ${r.syntax}`); }
    c.p("NOS.120 simulated bash. Everything runs in a safe in-browser Linux model.\n");
    c.p("Try: ls -la, cd, cat, grep, find, chmod, ln, mount, lsblk, systemctl, man <cmd>, commands");
    c.p("Features: pipes |, redirects > >> 2>, && || ;, $VARS, $(...), globs * ? [], {a,b}, !!, aliases, Tab completion.");
    c.p("Type 'commands' for a list of every command available (" + Object.keys(cmds).length + " total).");
    c.p("Use the Lab Challenges page for guided tasks; use 'reset' to restore the default filesystem.");
  }, { builtin: true });
  def("commands", "List all available commands", c => { const n = Object.keys(NOS.shellCommands).sort(); c.p(n.join("  ")); });
  def("reset", "Reset the simulated machine to its initial state", c => { c.sh.reset(); }, { builtin: true });
  def(["man", "info", "tldr"], "Show a manual page", c => {
    const n = c.args.find(a => !a.startsWith("-")); if (!n) return c.fail("What manual page do you want?\nFor example, try 'man man'.");
    const r = ref(n), x = NOS.shellCommands[n];
    if (!r && !x) return c.fail(`No manual entry for ${n}`);
    const up = n.toUpperCase();
    c.p(`${up}(1)                    User Commands                    ${up}(1)\n\nNAME\n       ${n} - ${r ? r.desc : x.desc}`);
    if (r) {
      c.p(`\nSYNOPSIS\n       ${r.syntax}`);
      if (r.flags && r.flags.length) { c.p("\nOPTIONS"); for (const f of r.flags) c.p("       " + (Array.isArray(f) ? `${f[0]}  ${f[1]}` : f)); }
      if (r.examples && r.examples.length) { c.p("\nEXAMPLES"); for (const e of r.examples) c.p("       " + (Array.isArray(e) ? `${e[0]}   # ${e[1]}` : e)); }
    }
  });
  def("whatis", "One-line manual page descriptions", c => { for (const n of c.args) { const r = ref(n), x = NOS.shellCommands[n]; if (r || x) c.p(`${n.padEnd(16)}(1) - ${r ? r.desc : x.desc}`); else c.err(`${n}: nothing appropriate.`); } });
  def("apropos", "Search manual page descriptions", c => {
    const q = (c.args[0] || "").toLowerCase(); if (!q) return c.fail("apropos what?");
    const hits = new Map(); for (const r of window.COMMANDS || []) if ((r.name + " " + r.desc).toLowerCase().includes(q)) hits.set(r.name, r.desc);
    for (const [n, x] of Object.entries(NOS.shellCommands)) if (!hits.has(n) && (n + " " + x.desc).toLowerCase().includes(q)) hits.set(n, x.desc);
    if (!hits.size) return c.fail(`${q}: nothing appropriate.`);
    for (const [n, d] of [...hits].sort()) c.p(`${n.padEnd(16)}(1) - ${d}`);
  });
})();
