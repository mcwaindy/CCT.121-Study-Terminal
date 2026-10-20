/* Procedures: interactive step-by-step walkthroughs (e.g. FTK imaging) with checkpoint questions */
CCT.addModule({
  id: "procedures", title: "Procedures", group: "Practice", order: 3,
  render(el, arg) {
    const procs = CCT.items("procedures");
    const prog = CCT.store.get("proc", {});
    const list = () => {
      el.innerHTML = `<h1>Procedures</h1><div class="sub">Interactive walkthroughs of key forensic workflows.</div>
        <div class="grid">${procs.map(p => `<div class="card click" data-id="${p.id}"><b>${CCT.esc(p.title)}</b><div class="sub">${CCT.esc(p.intro)}</div><span class="tag dim">${CCT.esc(CCT.chapterLabel(p.chapter))}</span>${prog[p.id] === "done" ? '<span class="tag good">completed</span>' : ""}</div>`).join("")}</div>
        ${procs.length ? "" : '<div class="empty">No procedures in this scope.</div>'}`;
      CCT.$$(".click", el).forEach(c => c.onclick = () => run(procs.find(p => p.id === c.dataset.id)));
    };
    const run = p => {
      let i = 0, answered = {};
      const draw = () => {
        const s = p.steps[i], ok = !s.check || answered[i] === s.check.a;
        el.innerHTML = `<a href="#procedures" id="bk">&larr; All procedures</a><h1>${CCT.esc(p.title)}</h1>
          <div class="steps">${p.steps.map((x, k) => `<span class="step ${k === i ? "on" : (k < i ? "done" : "")}" data-k="${k}">${k + 1}</span>`).join("")}</div>
          <div class="card"><h3 style="margin-top:0">${s.title}</h3><div>${s.body}</div></div>
          ${s.check ? `<div class="card"><b>Checkpoint:</b> ${CCT.esc(s.check.q)}${s.check.opts.map((o, oi) => `<button class="btn opt ${answered[i] !== undefined ? (oi === s.check.a ? "right" : (oi === answered[i] ? "wrong" : "")) : ""}" data-o="${oi}">${CCT.esc(o)}</button>`).join("")}</div>` : ""}
          <div class="row"><button class="btn" id="pv" ${i === 0 ? "disabled" : ""}>Back</button>
          <button class="btn pri" id="nx" ${ok ? "" : "disabled"}>${i === p.steps.length - 1 ? "Finish" : "Next"}</button></div>`;
        CCT.$("#bk", el).onclick = e => { e.preventDefault(); list(); };
        CCT.$$("[data-o]", el).forEach(b => b.onclick = () => { answered[i] = +b.dataset.o; draw(); });
        CCT.$("#pv", el).onclick = () => { i--; draw(); };
        CCT.$("#nx", el).onclick = () => { if (i === p.steps.length - 1) { prog[p.id] = "done"; CCT.store.set("proc", prog); list(); } else { i++; draw(); } };
        CCT.$$("[data-k]", el).forEach(b => b.onclick = () => { if (+b.dataset.k <= i) { i = +b.dataset.k; draw(); } });
      };
      draw();
    };
    list();
  }
});
