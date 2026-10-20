/* Shared helpers for NOS.130 content files. */
(() => {
  const esc = NOS.esc;
  NOS.md = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  const strip = s => s.replace(/`|\*\*/g, "");
  const first = s => { const t = strip(s), i = t.indexOf(". "); return i > 20 && i < 170 ? t.slice(0, i + 1) : t.slice(0, 150) + (t.length > 150 ? "…" : ""); };
  // note(id, title, category, [paragraphs or "- bullet"])
  NOS.note = (id, title, category, paras) => {
    let html = "", list = [];
    const flush = () => { if (list.length) { html += "<ul>" + list.map(x => `<li>${NOS.md(x)}</li>`).join("") + "</ul>"; list = []; } };
    for (const p of paras) { if (p.startsWith("- ")) list.push(p.slice(2)); else { flush(); html += `<p>${NOS.md(p)}</p>`; } }
    flush();
    return { id, title, category, summary: first(paras.find(p => !p.startsWith("- ")) || paras[0]), body: html };
  };
  // quiz question: Q(question, correct, why, ...wrong)  (options are shuffled when shown)
  NOS.Q = (q, right, why, ...wrong) => [q, [right, ...wrong], 0, why];
  // step-by-step task: guide through Windows UI
  NOS.task = (id, title, where, goal, steps, tip) => ({ id, title, where, goal, steps, tip: tip || "" });
})();
