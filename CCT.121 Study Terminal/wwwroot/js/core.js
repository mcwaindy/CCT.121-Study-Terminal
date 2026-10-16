/* CCT.121 core: registry, storage, router, shell.
   Chapters (content/*.js) call CCT.addChapter({...}); modules (js/modules/*.js) call CCT.addModule({...}). */
(() => {
  const CCT = window.CCT = { chapters: [], modules: [], manifest: [], scope: "all", query: "", failed: [] };
  const $ = (s, r = document) => r.querySelector(s);
  CCT.$ = $;
  CCT.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  CCT.esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  CCT.CATS = { legal: "Legal", ops: "Operational", apps: "Applied" };

  CCT.store = {
    get: (k, d) => { try { const v = JSON.parse(localStorage.getItem("cct121." + k)); return v ?? d; } catch { return d; } },
    set: (k, v) => localStorage.setItem("cct121." + k, JSON.stringify(v))
  };

  // small stable string hash -> ids that survive reordering of content
  CCT.hash = s => { let h = 5381; for (const ch of String(s)) h = ((h << 5) + h + ch.charCodeAt(0)) | 0; return (h >>> 0).toString(36); };

  // deterministic fake hex digest (for simulated hashes)
  CCT.pseudoHash = (str, len) => {
    let a = 0x811c9dc5, out = "";
    while (out.length < len) {
      for (const ch of str + out.length) { a ^= ch.charCodeAt(0); a = Math.imul(a, 16777619) >>> 0; }
      out += a.toString(16).padStart(8, "0");
    }
    return out.slice(0, len);
  };

  CCT.shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  CCT.highlight = (html, q) => {
    if (!q) return html;
    const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![^<]*>)", "gi");
    return html.replace(re, "<mark>$1</mark>");
  };

  // ---- registry ----
  CCT.addChapter = c => {
    const id = c.id;
    const tag = (arr, f) => (arr || []).map(f);
    c.notes = tag(c.notes, n => ({ ...n, chapter: id }));
    c.glossary = tag(c.glossary, x => { const o = Array.isArray(x) ? { term: x[0], def: x[1], use: x[2] } : x; return { ...o, id: id + ":g:" + CCT.hash(o.term), chapter: id }; });
    c.cards = tag(c.cards, x => { const o = Array.isArray(x) ? { q: x[0], a: x[1] } : x; return { ...o, id: id + ":c:" + CCT.hash(o.q), chapter: id }; });
    c.quiz = tag(c.quiz, x => { const o = Array.isArray(x) ? { q: x[0], c: x[1], a: x[2], why: x[3] } : x; return { ...o, id: id + ":q:" + CCT.hash(o.q), chapter: id }; });
    for (const k of ["images", "custody", "procedures"]) c[k] = tag(c[k], x => ({ ...x, chapter: id }));
    CCT.chapters = CCT.chapters.filter(x => x.id !== id).concat(c).sort((a, b) => a.num - b.num);
  };
  CCT.addModule = m => CCT.modules.push(m);
  CCT.items = key => CCT.chapters.filter(c => CCT.scope === "all" || c.id === CCT.scope).flatMap(c => c[key] || []);
  CCT.chapter = id => CCT.chapters.find(c => c.id === id);
  CCT.chapterLabel = id => { const c = CCT.chapter(id); return c ? `Module ${c.num}` : id; };

  // ---- shell ----
  const GROUPS = ["Study", "Practice", "Reference"];
  function buildSidebar() {
    let html = "";
    for (const g of GROUPS) {
      const ms = CCT.modules.filter(m => m.group === g && !m.hidden).sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
      if (!ms.length) continue;
      html += `<div class="group">${g}</div>` + ms.map(m => `<a href="#${m.id}" data-mod="${m.id}">${m.title}</a>`).join("");
    }
    $("#sidebar").innerHTML = `<a href="#home" data-mod="home">Dashboard</a>` + html;
  }
  function buildScope() {
    const sel = $("#scope");
    sel.innerHTML = `<option value="all">All modules</option>` + CCT.chapters.map(c => `<option value="${c.id}">Module ${c.num}: ${CCT.esc(c.title)}</option>`).join("");
    if (!CCT.chapters.some(c => c.id === CCT.scope)) CCT.scope = "all";
    sel.value = CCT.scope;
    sel.onchange = () => { CCT.scope = sel.value; CCT.store.set("scope", CCT.scope); route(); };
  }
  function route() {
    const [id, ...rest] = (location.hash.slice(1) || "home").split("/");
    const m = CCT.modules.find(x => x.id === id) || CCT.modules.find(x => x.id === "home");
    CCT.$$("#sidebar a").forEach(a => a.classList.toggle("active", a.dataset.mod === m.id));
    const el = $("#content");
    el.innerHTML = ""; el.scrollTop = 0;
    if (CCT._cleanup) { try { CCT._cleanup(); } catch { } CCT._cleanup = null; }
    CCT._cleanup = m.render(el, rest.join("/")) || null;
  }
  CCT.refresh = route;
  CCT.go = h => { if (location.hash === "#" + h) route(); else location.hash = h; };

  CCT.start = () => {
    CCT.scope = CCT.store.get("scope", "all");
    if (CCT.store.get("light", false)) document.body.classList.add("light");
    buildScope(); buildSidebar();
    window.addEventListener("hashchange", route);
    $("#search").addEventListener("input", e => { CCT.query = e.target.value.trim(); CCT.go(CCT.query ? "search" : "notes"); });
    document.addEventListener("keydown", e => {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $("#search").focus(); }
    });
    $("#themeBtn").onclick = () => { document.body.classList.toggle("light"); CCT.store.set("light", document.body.classList.contains("light")); };
    route();
  };
})();
