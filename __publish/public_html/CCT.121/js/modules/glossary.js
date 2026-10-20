/* Glossary */
CCT.addModule({
  id: "glossary", title: "Glossary", group: "Reference", order: 1,
  render(el) {
    const terms = CCT.items("glossary").sort((a, b) => a.term.localeCompare(b.term));
    el.innerHTML = `<h1>Glossary</h1><div class="sub">${terms.length} terms in this scope.</div>
      <div class="row"><input type="text" id="gf" placeholder="Filter terms..." style="width:300px"></div><div id="gl"></div>`;
    const draw = () => {
      const q = CCT.$("#gf", el).value.trim().toLowerCase();
      const list = terms.filter(t => !q || (t.term + " " + t.def).toLowerCase().includes(q));
      CCT.$("#gl", el).innerHTML = list.map(t => `<div class="card"><b>${CCT.esc(t.term)}</b> <span class="tag dim">${CCT.esc(CCT.chapterLabel(t.chapter))}</span>
        <div>${CCT.esc(t.def)}</div>${t.use ? `<div class="dim"><i>Usage: ${CCT.esc(t.use)}</i></div>` : ""}</div>`).join("") || `<div class="empty">No matches.</div>`;
    };
    CCT.$("#gf", el).oninput = draw; draw();
  }
});
