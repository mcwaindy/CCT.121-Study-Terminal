/* Multiple-choice quiz with per-question stats */
CCT.addModule({
  id: "quiz", title: "Quiz", group: "Study", order: 3,
  render(el) {
    const stats = CCT.store.get("quizstats", {});
    const all = CCT.items("quiz");
    let run = null;

    const menu = () => {
      const missed = all.filter(q => stats[q.id] && stats[q.id].w > 0 && stats[q.id].r === 0 || (stats[q.id] && stats[q.id].last === 0));
      el.innerHTML = `<h1>Quiz</h1><div class="sub">${all.length} questions in this scope. Options are shuffled each time.</div>
        <div class="row"><label>Questions <select id="n"><option>10</option><option>20</option><option value="0">All</option></select></label>
        <button class="btn pri" id="go">Start</button>
        <button class="btn" id="miss" ${missed.length ? "" : "disabled"}>Retry last-missed (${missed.length})</button></div>`;
      CCT.$("#go", el).onclick = () => { const n = +CCT.$("#n", el).value; begin(CCT.shuffle(all).slice(0, n || all.length)); };
      CCT.$("#miss", el).onclick = () => begin(CCT.shuffle(missed));
      if (!all.length) CCT.$("#go", el).disabled = true;
    };
    const begin = qs => { run = { qs, i: 0, score: 0, missed: [] }; show(); };
    const show = () => {
      if (run.i >= run.qs.length) return finish();
      const q = run.qs[run.i];
      const order = CCT.shuffle(q.c.map((t, i) => ({ t, i })));
      el.innerHTML = `<div class="sub">Question ${run.i + 1} / ${run.qs.length} &middot; ${CCT.esc(CCT.chapterLabel(q.chapter))}</div>
        <div class="card"><b>${CCT.esc(q.q)}</b></div><div id="opts">${order.map((o, k) => `<button class="btn opt" data-i="${o.i}">${k + 1}. ${CCT.esc(o.t)}</button>`).join("")}</div><div id="fb"></div>`;
      CCT.$$(".opt", el).forEach(b => b.onclick = () => answer(q, +b.dataset.i));
    };
    const answer = (q, pick) => {
      const ok = pick === q.a;
      const s = stats[q.id] = stats[q.id] || { r: 0, w: 0 };
      ok ? s.r++ : s.w++; s.last = ok ? 1 : 0;
      CCT.store.set("quizstats", stats);
      if (ok) run.score++; else run.missed.push(q);
      CCT.$$(".opt", el).forEach(b => { b.disabled = true; const i = +b.dataset.i; if (i === q.a) b.classList.add("right"); else if (i === pick) b.classList.add("wrong"); });
      CCT.$("#fb", el).innerHTML = `<div class="key ${ok ? "" : "warn"}"><b>${ok ? "Correct." : "Incorrect."}</b> ${CCT.esc(q.why || "")}</div><button class="btn pri" id="nx">${run.i + 1 >= run.qs.length ? "Finish" : "Next"}</button>`;
      CCT.$("#nx", el).onclick = () => { run.i++; show(); };
    };
    const finish = () => {
      el.innerHTML = `<h1>Result</h1><div class="card"><div class="stat">${run.score} / ${run.qs.length}</div></div>
        ${run.missed.length ? `<h2>Missed</h2>` + run.missed.map(q => `<div class="card"><b>${CCT.esc(q.q)}</b><div class="good">Answer: ${CCT.esc(q.c[q.a])}</div><div class="dim">${CCT.esc(q.why || "")}</div></div>`).join("") : ""}
        <button class="btn" id="m">Back</button>`;
      CCT.$("#m", el).onclick = menu;
    };
    const key = e => { const n = +e.key; if (run && n >= 1 && n <= 4) { const b = CCT.$$(".opt", el)[n - 1]; if (b && !b.disabled) b.click(); } else if (e.key === "Enter") { const nx = CCT.$("#nx", el); if (nx) nx.click(); } };
    document.addEventListener("keydown", key);
    menu();
    return () => document.removeEventListener("keydown", key);
  }
});
