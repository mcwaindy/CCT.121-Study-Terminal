/* Study Notes */
NOS.addModule({
  id: "notes", title: "Notes", group: "Study", order: 1,
  render(el, arg) {
    const read = NOS.store.get("read", {});
    if (arg) {
      const [chId, nid] = arg.split(":");
      const ch = NOS.chapter(chId), n = ch && ch.notes.find(x => x.id === nid);
      if (n) {
        const key = chId + ":" + nid, idx = ch.notes.indexOf(n);
        const prev = ch.notes[idx - 1], next = ch.notes[idx + 1];
        el.innerHTML = `<a href="#notes">&larr; All notes</a>
          <h1>${NOS.esc(n.title)}</h1>
          <div class="sub"><span class="tag dim">Module ${ch.num}</span><span class="tag ${n.category}">${NOS.CATS[n.category]}</span> ${NOS.esc(n.summary)}</div>
          <div class="note-body">${n.body}</div>
          <div class="row"><button class="btn" id="rd">${read[key] ? "Reviewed ✓" : "Mark as reviewed"}</button>
          ${prev ? `<a class="btn" href="#notes/${chId}:${prev.id}">&larr; ${NOS.esc(prev.title)}</a>` : ""}
          ${next ? `<a class="btn" href="#notes/${chId}:${next.id}">${NOS.esc(next.title)} &rarr;</a>` : ""}</div>`;
        NOS.$("#rd", el).onclick = () => { read[key] = !read[key]; NOS.store.set("read", read); this.render(el, arg); };
        return;
      }
    }
    let html = `<h1>Study Notes</h1><div class="sub">Dense but succinct. Use the Scope selector (top) to limit to one module.</div>`;
    const chs = NOS.chapters.filter(c => NOS.scope === "all" || c.id === NOS.scope);
    if (!chs.length) html += `<div class="empty">No content loaded.</div>`;
    for (const c of chs) {
      html += `<h2>Module ${c.num}: ${NOS.esc(c.title)}</h2><div class="grid">` + c.notes.map(n =>
        `<div class="card click" data-id="${c.id}:${n.id}"><span class="tag ${n.category}">${NOS.CATS[n.category]}</span>${read[c.id + ":" + n.id] ? '<span class="tag good">reviewed</span>' : ""}
        <div><b>${NOS.esc(n.title)}</b></div><div class="sub">${NOS.esc(n.summary)}</div></div>`).join("") + `</div>`;
    }
    el.innerHTML = html;
    NOS.$$(".card.click", el).forEach(c => c.onclick = () => NOS.go("notes/" + c.dataset.id));
  }
});
