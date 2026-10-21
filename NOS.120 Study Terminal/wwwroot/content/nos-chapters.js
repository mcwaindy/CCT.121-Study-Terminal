/* Builds NOS chapters from the legacy data files (notes, cards, quizzes, commands, challenges). */
(() => {
  const CAT = { 1: "core", 2: "core", 3: "files", 4: "files", 5: "admin", 6: "admin", 7: "core", 8: "boot" };
  const esc = NOS.esc;
  const fmt = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  const concepts = window.CONCEPTS || {};
  const strip = s => s.replace(/`|\*\*/g, "");
  const first = s => { const t = strip(s); const i = t.indexOf(". "); return (i > 20 && i < 170 ? t.slice(0, i + 1) : t.slice(0, 150) + (t.length > 150 ? "…" : "")); };

  // "- " paragraphs become bullet lists; "$ " paragraphs become code blocks; others stay paragraphs.
  const body = arr => {
    let out = "", kind = "", buf = [];
    const flush = () => {
      if (!buf.length) return;
      out += kind === "ul" ? "<ul>" + buf.map(x => "<li>" + fmt(x) + "</li>").join("") + "</ul>"
        : kind === "pre" ? "<pre><code>" + buf.map(x => esc(x)).join("\n") + "</code></pre>"
        : buf.map(x => "<p>" + fmt(x) + "</p>").join("");
      buf = [];
    };
    for (const p of arr) {
      const k = p.startsWith("- ") ? "ul" : p.startsWith("$ ") ? "pre" : "p";
      if (k !== kind) { flush(); kind = k; }
      buf.push(k === "ul" ? p.slice(2) : p);
    }
    flush();
    return out;
  };

  for (const m of window.NOTES || []) {
    const raw = (window.QUIZ_RAW || []).filter(q => q[0] === m.m).map(q => q[1]);
    const cards = (window.CARDS || []).filter(c => c[0] === m.m).map(c => [c[1], c[2]]);
    const commands = (window.COMMANDS || []).filter(c => c.m === m.m);
    const labs = (window.CHALLENGES || []).filter(c => c.m === m.m).map(c => ({ id: "m" + m.m + ":l:" + NOS.hash(c.t), title: c.t, task: c.task, hint: c.hint, setup: c.setup || [], check: c.check }));
    const used = new Set();
    const notes = m.sections.map((s, i) => {
      let id = s.c || "s" + i; if (used.has(id)) id += "-" + i; used.add(id);
      return { id, title: s.t, summary: first(s.b[0] || ""), category: CAT[m.m], body: body(s.b) };
    });
    const glossary = commands.map(c => ({ term: c.name, def: c.desc, use: (c.examples && c.examples[0]) || c.syntax || "" }));
    NOS.addChapter({
      id: "m" + m.m, num: m.m, title: m.title,
      summary: Object.values(concepts).filter(v => v[0] === m.m).map(v => v[1]).slice(0, 4).join(", "),
      notes, glossary, cards, quiz: raw, commands, labs
    });
  }
})();
