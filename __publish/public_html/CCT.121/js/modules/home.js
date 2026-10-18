/* Dashboard */
CCT.addModule({
  id: "home", title: "Dashboard", group: "Study", hidden: true,
  render(el) {
    const rd = CCT.store.get("read", {}), fc = CCT.store.get("fc", {}), qs = CCT.store.get("quizstats", {});
    const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
    const bar = p => `<div class="bar"><i style="width:${p}%"></i></div>`;
    let html = `<h1>CCT.121 Study Terminal</h1><div class="sub">Computer Crime Investigations. Pick a module below or use the sidebar.</div>`;
    if (CCT.failed.length) html += `<div class="key warn"><b>Note:</b> could not load ${CCT.failed.map(CCT.esc).join(", ")}. Check <code>content/manifest.js</code>.</div>`;
    html += `<div class="grid">`;
    for (const c of CCT.chapters) {
      const notes = c.notes.length, nr = c.notes.filter(n => rd[c.id + ":" + n.id]).length;
      const cards = c.cards.length, cm = c.cards.filter(x => (fc[x.id] || 0) >= 3).length;
      const qd = c.quiz.filter(x => qs[x.id]), qr = qd.filter(x => qs[x.id].r > 0).length;
      html += `<div class="card"><b>Module ${c.num}</b><div>${CCT.esc(c.title)}</div><div class="sub">${CCT.esc(c.summary)}</div>
        <div class="dim">Notes ${nr}/${notes}</div>${bar(pct(nr, notes))}
        <div class="dim">Flashcards mastered ${cm}/${cards}</div>${bar(pct(cm, cards))}
        <div class="dim">Quiz questions answered right ${qr}/${c.quiz.length}</div>${bar(pct(qr, c.quiz.length))}
        <div class="row"><button class="btn" data-go="notes" data-ch="${c.id}">Notes</button><button class="btn" data-go="flashcards" data-ch="${c.id}">Cards</button><button class="btn" data-go="quiz" data-ch="${c.id}">Quiz</button></div></div>`;
    }
    html += `</div><h2>Practice</h2><div class="grid">
      <div class="card"><b>Image Explorer</b><div class="sub">Browse simulated disk images, partitions, hex, MAC times.</div><a href="#imgfs">Open</a></div>
      <div class="card"><b>Faux Terminal</b><div class="sub">TSK-style commands against the images.</div><a href="#terminal">Open</a></div>
      <div class="card"><b>Procedures</b><div class="sub">Step-by-step: scene response, FTK imaging.</div><a href="#procedures">Open</a></div>
      <div class="card"><b>Chain of Custody</b><div class="sub">Fill out forms from scenarios; get checked.</div><a href="#custody">Open</a></div></div>`;
    el.innerHTML = html;
    CCT.$$("[data-go]", el).forEach(b => b.onclick = () => { CCT.scope = b.dataset.ch; CCT.store.set("scope", CCT.scope); CCT.$("#scope").value = CCT.scope; CCT.go(b.dataset.go); });
  }
});
