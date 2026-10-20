/* CMD / PowerShell command reference */
NOS.addModule({
  id: "commands", title: "Command Reference", group: "Reference", order: 1,
  render(el) {
    const all = NOS.chapters.filter(c => NOS.scope === "all" || c.id === NOS.scope).flatMap(c => (c.commands || []).map(x => ({ ...x, ch: c })));
    el.innerHTML = `<h1>Command Reference</h1><div class="sub">Important CMD and PowerShell commands from the course.</div>
      <div class="row"><input id="cf" type="search" placeholder="Filter commands" size="30">
      <select id="cs"><option value="">All shells</option><option>CMD</option><option>PowerShell</option><option>Run</option><option>Shortcut</option></select></div><div id="cl"></div>`;
    const draw = () => {
      const q = NOS.$("#cf", el).value.toLowerCase(), s = NOS.$("#cs", el).value.toLowerCase();
      const r = all.filter(x => (!s || x.shell.toLowerCase().includes(s)) && (x.name + x.desc + x.syntax).toLowerCase().includes(q));
      NOS.$("#cl", el).innerHTML = r.length ? r.map(x => `<div class="card"><b><code>${NOS.esc(x.name)}</code></b> <span class="tag dim">${NOS.esc(x.shell)}</span> <span class="tag dim">Module ${x.ch.num}</span>
        <div>${NOS.esc(x.desc)}</div><div class="dim">Syntax: <code>${NOS.esc(x.syntax)}</code></div>
        ${(x.examples || []).map(e => `<div><code>${NOS.esc(e)}</code></div>`).join("")}</div>`).join("") : `<div class="empty">No matches.</div>`;
    };
    NOS.$("#cf", el).oninput = draw; NOS.$("#cs", el).onchange = draw; draw();
  }
});
