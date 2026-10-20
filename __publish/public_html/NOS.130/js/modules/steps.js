/* Windows Steps: step-by-step procedures with completion tracking */
NOS.addModule({
  id: "steps", title: "Windows Steps", group: "Practice", order: 2,
  render(el, arg) {
    const done = NOS.store.get("tasks", {});
    const chs = NOS.chapters.filter(c => NOS.scope === "all" || c.id === NOS.scope);
    let html = `<h1>Windows Steps</h1><div class="sub">Where to click in Settings, Control Panel and admin tools. Tick tasks as you practice them on a VM.</div>`;
    for (const c of chs) {
      if (!(c.tasks || []).length) continue;
      html += `<h2>Module ${c.num}: ${NOS.esc(c.title)}</h2>`;
      html += c.tasks.map(t => { const k = c.id + ":" + t.id; return `<details class="card"${arg === k ? " open" : ""}><summary><b>${done[k] ? "&#10003; " : ""}${NOS.esc(t.title)}</b> <span class="tag dim">${NOS.esc(t.where)}</span></summary>
        <div class="sub">${NOS.esc(t.goal)}</div><ol>${t.steps.map(s => `<li>${NOS.md(s)}</li>`).join("")}</ol>
        ${t.tip ? `<div class="dim">Note: ${NOS.esc(t.tip)}</div>` : ""}
        <button class="btn" data-k="${k}">${done[k] ? "Completed - undo" : "Mark complete"}</button></details>`; }).join("");
    }
    el.innerHTML = html;
    NOS.$$("[data-k]", el).forEach(b => b.onclick = () => {
      const open = NOS.$$("details", el).findIndex(d => d.contains(b));
      done[b.dataset.k] = !done[b.dataset.k]; NOS.store.set("tasks", done);
      this.render(el, b.dataset.k);
    });
  }
});
