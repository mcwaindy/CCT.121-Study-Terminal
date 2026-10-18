/* Global search over notes, glossary, flashcards */
CCT.addModule({
  id: "search", title: "Search", group: "Reference", hidden: true,
  render(el) {
    const q = CCT.query.toLowerCase();
    const strip = h => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, " "); };
    const snip = (txt) => { const i = txt.toLowerCase().indexOf(q); if (i < 0) return ""; return (i > 40 ? "…" : "") + txt.slice(Math.max(0, i - 40), i + 110) + "…"; };
    const notes = CCT.items("notes").map(n => ({ n, t: strip(n.body) })).filter(x => (x.n.title + " " + x.t).toLowerCase().includes(q));
    const gl = CCT.items("glossary").filter(g => (g.term + " " + g.def).toLowerCase().includes(q));
    const cards = CCT.items("cards").filter(c => (c.q + " " + c.a).toLowerCase().includes(q));
    let html = `<h1>Search: "${CCT.esc(CCT.query)}"</h1><div class="sub">${notes.length} notes, ${gl.length} terms, ${cards.length} cards (current scope)</div>`;
    if (notes.length) html += `<h2>Notes</h2>` + notes.map(x => `<div class="card"><a href="#notes/${x.n.chapter}:${x.n.id}"><b>${CCT.esc(x.n.title)}</b></a> <span class="tag dim">${CCT.esc(CCT.chapterLabel(x.n.chapter))}</span><div class="dim">${CCT.highlight(CCT.esc(snip(x.t)), CCT.esc(CCT.query))}</div></div>`).join("");
    if (gl.length) html += `<h2>Glossary</h2>` + gl.map(g => `<div class="card"><b>${CCT.highlight(CCT.esc(g.term), CCT.esc(CCT.query))}</b><div>${CCT.highlight(CCT.esc(g.def), CCT.esc(CCT.query))}</div></div>`).join("");
    if (cards.length) html += `<h2>Flashcards</h2>` + cards.map(c => `<div class="card"><b>${CCT.highlight(CCT.esc(c.q), CCT.esc(CCT.query))}</b><div>${CCT.highlight(CCT.esc(c.a), CCT.esc(CCT.query))}</div></div>`).join("");
    if (!notes.length && !gl.length && !cards.length) html += `<div class="empty">Nothing found.</div>`;
    el.innerHTML = html;
  }
});
