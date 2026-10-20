/* Dashboard */
NOS.addModule({
  id: "home", title: "Dashboard", group: "Study", hidden: true,
  render(el) {
    const rd = NOS.store.get("read", {}), fc = NOS.store.get("fc", {}), qs = NOS.store.get("quizstats", {}), lb = NOS.store.get("labs", {});
    const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
    const bar = p => `<div class="bar"><i style="width:${p}%"></i></div>`;
    let html = `<h1>NOS.120 Study Terminal</h1><div class="sub">Linux Single User. Pick a module below or use the sidebar.</div>`;
    if (NOS.failed.length) html += `<div class="key warn"><b>Note:</b> could not load ${NOS.failed.map(NOS.esc).join(", ")}. Check <code>content/manifest.js</code>.</div>`;
    html += `<div class="grid">`;
    for (const c of NOS.chapters) {
      const notes = c.notes.length, nr = c.notes.filter(n => rd[c.id + ":" + n.id]).length;
      const cards = c.cards.length, cm = c.cards.filter(x => (fc[x.id] || 0) >= 3).length;
      const qd = c.quiz.filter(x => qs[x.id]), qr = qd.filter(x => qs[x.id].r > 0).length;
      const lt = c.labs.length, ld = c.labs.filter(l => lb[l.id]).length;
      html += `<div class="card"><b>Module ${c.num}</b><div>${NOS.esc(c.title)}</div><div class="sub">${NOS.esc(c.summary)}</div>
        <div class="dim">Notes ${nr}/${notes}</div>${bar(pct(nr, notes))}
        <div class="dim">Flashcards mastered ${cm}/${cards}</div>${bar(pct(cm, cards))}
        <div class="dim">Quiz questions answered right ${qr}/${c.quiz.length}</div>${bar(pct(qr, c.quiz.length))}
        ${lt ? `<div class="dim">Lab challenges ${ld}/${lt}</div>${bar(pct(ld, lt))}` : ""}
        <div class="row"><button class="btn" data-go="notes" data-ch="${c.id}">Notes</button><button class="btn" data-go="flashcards" data-ch="${c.id}">Cards</button><button class="btn" data-go="quiz" data-ch="${c.id}">Quiz</button>${lt ? `<button class="btn" data-go="labs" data-ch="${c.id}">Labs</button>` : ""}</div></div>`;
    }
    html += `</div><h2>Practice</h2><div class="grid">
      <div class="card"><b>Linux Terminal</b><div class="sub">A simulated Linux machine: virtual filesystem, users, permissions, disks, services.</div><a href="#terminal">Open</a></div>
      <div class="card"><b>Lab Challenges</b><div class="sub">Guided, auto-checked tasks that run in the terminal.</div><a href="#labs">Open</a></div>
      <div class="card"><b>Command Reference</b><div class="sub">Syntax, options and examples for every command.</div><a href="#commands">Open</a></div></div>`;
    el.innerHTML = html;
    NOS.$$("[data-go]", el).forEach(b => b.onclick = () => { NOS.scope = b.dataset.ch; NOS.store.set("scope", NOS.scope); NOS.$("#scope").value = NOS.scope; NOS.go(b.dataset.go); });
  }
});
