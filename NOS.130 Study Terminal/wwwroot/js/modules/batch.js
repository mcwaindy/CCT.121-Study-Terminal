/* Batch File Lab: editor, templates, export, challenges. Scripts are never executed. */
NOS.addModule({
  id: "batch", title: "Batch File Lab", group: "Practice", order: 1,
  render(el, arg) {
    const done = NOS.store.get("batch", {});
    const labs = NOS.batchLabs || [];
    let cur = labs.find(l => l.id === arg) || null;
    const draft = NOS.store.get("batchdraft", {});
    const key = cur ? cur.id : "free";
    const code = draft[key] ?? (cur ? "@echo off\r\nrem " + cur.title + "\r\n\r\n" : NOS.batchTemplates[1].code);
    const list = labs.map(l => `<a class="btn${l.id === key ? " active" : ""}" href="#batch/${l.id}">${done[l.id] ? "&#10003; " : ""}${NOS.esc(l.title)}</a>`).join(" ");
    el.innerHTML = `<h1>Batch File Lab</h1>
      <div class="sub">Write .bat scripts, check them against challenge goals, and export. Scripts are only text-checked here and never run.</div>
      <div class="row"><a class="btn${cur ? "" : " active"}" href="#batch">Free editor</a> ${list}</div>
      ${cur ? `<div class="card"><b>Level ${cur.level}: ${NOS.esc(cur.title)}</b><div>${NOS.esc(cur.task)}</div><div class="dim" id="hint" hidden>Hint: <code>${NOS.esc(cur.hint)}</code></div></div>` :
        `<div class="row">Templates: ${NOS.batchTemplates.map((t, i) => `<button class="btn" data-t="${i}">${t.name}</button>`).join(" ")}</div>`}
      <textarea id="ed" spellcheck="false" style="width:100%;min-height:300px;font-family:Consolas,monospace;font-size:14px;tab-size:4;box-sizing:border-box"></textarea>
      <div class="row"><input id="fn" value="${cur ? cur.id : "script"}" size="18"> .bat
        <button class="btn" id="exp">Export .bat</button>
        ${cur ? `<button class="btn" id="chk">Check</button><button class="btn" id="hb">Hint</button>` : ""}
        <button class="btn" id="rst">Reset</button></div>
      <div id="res"></div>`;
    const ed = NOS.$("#ed", el);
    ed.value = code;
    ed.oninput = () => { draft[key] = ed.value; NOS.store.set("batchdraft", draft); };
    ed.onkeydown = e => { if (e.key === "Tab") { e.preventDefault(); const s = ed.selectionStart; ed.setRangeText("    ", s, ed.selectionEnd, "end"); ed.oninput(); } };
    NOS.$$("[data-t]", el).forEach(b => b.onclick = () => { ed.value = NOS.batchTemplates[+b.dataset.t].code; ed.oninput(); });
    NOS.$("#rst", el).onclick = () => { delete draft[key]; NOS.store.set("batchdraft", draft); this.render(el, arg); };
    NOS.$("#exp", el).onclick = () => {
      const name = (NOS.$("#fn", el).value.trim().replace(/[^\w.-]/g, "_") || "script") + ".bat";
      const blob = new Blob([ed.value.replace(/\r?\n/g, "\r\n")], { type: "text/plain" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    if (cur) {
      NOS.$("#hb", el).onclick = () => NOS.$("#hint", el).hidden = false;
      NOS.$("#chk", el).onclick = () => {
        const rs = cur.checks.map(([n, re]) => [n, re.test(ed.value)]);
        const ok = rs.every(r => r[1]);
        if (ok) { done[cur.id] = true; NOS.store.set("batch", done); }
        NOS.$("#res", el).innerHTML = `<div class="card">${rs.map(([n, p]) => `<div class="${p ? "good" : "bad"}">${p ? "&#10003;" : "&#10007;"} ${NOS.esc(n)}</div>`).join("")}<b>${ok ? "Challenge complete!" : "Not there yet."}</b></div>`;
      };
    }
  }
});
