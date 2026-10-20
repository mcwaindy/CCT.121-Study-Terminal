/* Dashboard */
NOS.addModule({
  id: "home", title: "Dashboard", group: "Study", hidden: true,
  render(el) {
    const rd = NOS.store.get("read", {}), fc = NOS.store.get("fc", {}), qs = NOS.store.get("quizstats", {}), tk = NOS.store.get("tasks", {}), bt = NOS.store.get("batch", {});
    const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
    const bar = p => `<div class="bar"><i style="width:${p}%"></i></div>`;
    let html = `<h1>NOS.130 Study Terminal</h1><div class="sub">Windows Single User. Pick a module below or use the sidebar.</div>`;
    if (NOS.failed.length) html += `<div class="key warn"><b>Note:</b> could not load ${NOS.failed.map(NOS.esc).join(", ")}. Check <code>content/manifest.js</code>.</div>`;
    html += `<div class="grid">`;
    for (const c of NOS.chapters) {
      const notes = c.notes.length, nr = c.notes.filter(n => rd[c.id + ":" + n.id]).length;
      const cards = c.cards.length, cm = c.cards.filter(x => (fc[x.id] || 0) >= 3).length;
      const qr = c.quiz.filter(x => qs[x.id] && qs[x.id].r > 0).length;
      const st = (c.tasks || []).length, sd = (c.tasks || []).filter(t => tk[c.id + ":" + t.id]).length;
      html += `<div class="card"><b>Module ${c.num}</b><div>${NOS.esc(c.title)}</div><div class="sub">${NOS.esc(c.summary)}</div>
        <div class="dim">Notes ${nr}/${notes}</div>${bar(pct(nr, notes))}
        <div class="dim">Flashcards mastered ${cm}/${cards}</div>${bar(pct(cm, cards))}
        <div class="dim">Quiz questions answered right ${qr}/${c.quiz.length}</div>${bar(pct(qr, c.quiz.length))}
        ${st ? `<div class="dim">Windows steps ${sd}/${st}</div>${bar(pct(sd, st))}` : ""}
        <div class="row"><button class="btn" data-go="notes" data-ch="${c.id}">Notes</button><button class="btn" data-go="flashcards" data-ch="${c.id}">Cards</button><button class="btn" data-go="quiz" data-ch="${c.id}">Quiz</button>${st ? `<button class="btn" data-go="steps" data-ch="${c.id}">Steps</button>` : ""}</div></div>`;
    }
    const labs = NOS.batchLabs || [], ld = labs.filter(l => bt[l.id]).length;
    html += `</div><h2>Practice</h2><div class="grid">
      <div class="card"><b>Batch File Lab</b><div class="sub">Write and export .bat scripts with auto-checked challenges (${ld}/${labs.length} done).</div><a href="#batch">Open</a></div>
      <div class="card"><b>Windows Steps</b><div class="sub">Step-by-step procedures showing where to go in Settings, Control Panel and admin tools.</div><a href="#steps">Open</a></div>
      <div class="card"><b>Command Reference</b><div class="sub">Important CMD and PowerShell commands with syntax and examples.</div><a href="#commands">Open</a></div></div>`;
    el.innerHTML = html;
    NOS.$$("[data-go]", el).forEach(b => b.onclick = () => { NOS.scope = b.dataset.ch; NOS.store.set("scope", NOS.scope); NOS.$("#scope").value = NOS.scope; NOS.go(b.dataset.go); });
  }
});
