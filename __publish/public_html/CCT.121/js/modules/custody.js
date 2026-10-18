/* Chain of Custody builder: fill a form from a scenario, get checked field by field */
CCT.addModule({
  id: "custody", title: "Chain of Custody", group: "Practice", order: 4,
  render(el) {
    const sc = CCT.items("custody");
    const norm = s => String(s ?? "").toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ").trim();
    const matches = (f, v) => { const n = norm(v); return n === norm(f.expect) || (f.accept || []).some(a => norm(a) === n); };
    const list = () => {
      el.innerHTML = `<h1>Chain of Custody Builder</h1><div class="sub">Read the scenario, complete the evidence record, then check it.</div>
        <div class="grid">${sc.map(s => `<div class="card click" data-id="${s.id}"><b>${CCT.esc(s.title)}</b><div class="sub">${CCT.esc(CCT.chapterLabel(s.chapter))}</div></div>`).join("")}</div>
        ${sc.length ? "" : '<div class="empty">No scenarios in this scope.</div>'}`;
      CCT.$$(".click", el).forEach(c => c.onclick = () => form(sc.find(s => s.id === c.dataset.id)));
    };
    const form = s => {
      el.innerHTML = `<a href="#custody" id="bk">&larr; Scenarios</a><h1>${CCT.esc(s.title)}</h1>
        <div class="card">${s.story}</div>
        <div class="key"><b>Reminder:</b> exhibit number = <code>aaa/ddmmyy/nnnn/zz</code>. Chain of custody records: case number, who it came from, contact, location, date/time, item description.</div>
        <div id="f">${s.fields.map(f => `<div class="field" data-k="${f.key}"><label>${CCT.esc(f.label)}</label>${f.type === "select"
          ? `<select><option value=""></option>${f.options.map(o => `<option>${CCT.esc(o)}</option>`).join("")}</select>`
          : `<input type="text" autocomplete="off" placeholder="${CCT.esc(f.hint || "")}">`}</div>`).join("")}</div>
        <div class="row"><button class="btn pri" id="ck">Check</button><button class="btn" id="rv">Reveal answers</button></div><div id="res"></div>`;
      CCT.$("#bk", el).onclick = e => { e.preventDefault(); list(); };
      const rows = () => CCT.$$(".field", el);
      CCT.$("#ck", el).onclick = () => {
        let good = 0;
        rows().forEach((r, i) => { const f = s.fields[i], v = CCT.$("input,select", r).value; const ok = matches(f, v); if (ok) good++; r.classList.toggle("ok", ok); r.classList.toggle("err", !ok); });
        CCT.$("#res", el).innerHTML = `<div class="key ${good === s.fields.length ? "" : "warn"}"><b>${good} / ${s.fields.length} correct.</b> ${good === s.fields.length ? "Record is complete and defensible." : "Red fields need another look. An incomplete record can break the chain of custody."}</div>`;
      };
      CCT.$("#rv", el).onclick = () => { rows().forEach((r, i) => { CCT.$("input,select", r).value = s.fields[i].expect; r.classList.remove("err"); r.classList.add("ok"); }); };
    };
    list();
  }
});
