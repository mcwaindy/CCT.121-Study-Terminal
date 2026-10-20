/* NOS.120 core: registry, storage, router, shell.
   Chapters (content/*.js) call NOS.addChapter({...}); modules (js/modules/*.js) call NOS.addModule({...}). */
(() => {
  const NOS = window.NOS = { chapters: [], modules: [], manifest: [], scope: "all", query: "", failed: [] };
  const $ = (s, r = document) => r.querySelector(s);
  NOS.$ = $;
  NOS.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  NOS.esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  NOS.CATS = { core: "Basics", files: "Files & Storage", admin: "Accounts & Security", net: "Networking" };

  // Synchronous API backed by an in-memory cache. init() loads from api/state.php; writes are saved back to the
  // server (debounced) and mirrored to localStorage as a fallback (used when the PHP endpoint is unavailable).
  const PFX = "nos130.", API = "api/state.php";
  let cache = {}, serverOk = false, timer = null;
  const local = () => { const o = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(PFX)) o[k.slice(PFX.length)] = JSON.parse(localStorage.getItem(k)); } } catch { } return o; };
  const push = () => fetch(API, { method: "POST", headers: { "Content-Type": "application/json", "X-Requested-With": "nos130" }, body: JSON.stringify(cache), keepalive: true }).catch(() => { });
  NOS.store = {
    async init() {
      try {
        const r = await fetch(API, { cache: "no-store", headers: { "X-Requested-With": "nos130" } });
        const j = r.ok ? await r.json() : null;
        if (j && typeof j === "object" && j.ok === true) {
          serverOk = true; cache = j.data || {};
          if (!Object.keys(cache).length) { cache = local(); if (Object.keys(cache).length) await push(); }
          return;
        }
      } catch { }
      cache = local();
    },
    get: (k, d) => (cache[k] ?? d),
    set: (k, v) => {
      cache[k] = v;
      try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch { }
      if (serverOk) { clearTimeout(timer); timer = setTimeout(push, 400); }
    },
    get serverBacked() { return serverOk; }
  };
  window.addEventListener("pagehide", () => { if (serverOk && timer) { clearTimeout(timer); timer = null; push(); } });

  // small stable string hash -> ids that survive reordering of content
  NOS.hash = s => { let h = 5381; for (const ch of String(s)) h = ((h << 5) + h + ch.charCodeAt(0)) | 0; return (h >>> 0).toString(36); };

  NOS.shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  NOS.highlight = (html, q) => {
    if (!q) return html;
    const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![^<]*>)", "gi");
    return html.replace(re, "<mark>$1</mark>");
  };

  // ---- registry ----
  NOS.addChapter = c => {
    const id = c.id;
    const tag = (arr, f) => (arr || []).map(f);
    c.notes = tag(c.notes, n => ({ ...n, chapter: id }));
    c.glossary = tag(c.glossary, x => { const o = Array.isArray(x) ? { term: x[0], def: x[1], use: x[2] } : x; return { ...o, id: id + ":g:" + NOS.hash(o.term), chapter: id }; });
    c.cards = tag(c.cards, x => { const o = Array.isArray(x) ? { q: x[0], a: x[1] } : x; return { ...o, id: id + ":c:" + NOS.hash(o.q), chapter: id }; });
    c.quiz = tag(c.quiz, x => { const o = Array.isArray(x) ? { q: x[0], c: x[1], a: x[2], why: x[3] } : x; return { ...o, id: id + ":q:" + NOS.hash(o.q), chapter: id }; });
    NOS.chapters = NOS.chapters.filter(x => x.id !== id).concat(c).sort((a, b) => a.num - b.num);
  };
  NOS.addModule = m => NOS.modules.push(m);
  NOS.items = key => NOS.chapters.filter(c => NOS.scope === "all" || c.id === NOS.scope).flatMap(c => c[key] || []);
  NOS.chapter = id => NOS.chapters.find(c => c.id === id);
  NOS.chapterLabel = id => { const c = NOS.chapter(id); return c ? `Module ${c.num}` : id; };

  // ---- shell ----
  const GROUPS = ["Study", "Practice", "Reference"];
  function buildSidebar() {
    let html = "";
    for (const g of GROUPS) {
      const ms = NOS.modules.filter(m => m.group === g && !m.hidden).sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
      if (!ms.length) continue;
      html += `<div class="group">${g}</div>` + ms.map(m => `<a href="#${m.id}" data-mod="${m.id}">${m.title}</a>`).join("");
    }
    $("#sidebar").innerHTML = `<a href="#home" data-mod="home">Dashboard</a>` + html;
  }
  function buildScope() {
    const sel = $("#scope");
    sel.innerHTML = `<option value="all">All modules</option>` + NOS.chapters.map(c => `<option value="${c.id}">Module ${c.num}: ${NOS.esc(c.title)}</option>`).join("");
    if (!NOS.chapters.some(c => c.id === NOS.scope)) NOS.scope = "all";
    sel.value = NOS.scope;
    sel.onchange = () => { NOS.scope = sel.value; NOS.store.set("scope", NOS.scope); route(); };
  }
  function route() {
    const [id, ...rest] = (location.hash.slice(1) || "home").split("/");
    const m = NOS.modules.find(x => x.id === id) || NOS.modules.find(x => x.id === "home");
    NOS.$$("#sidebar a").forEach(a => a.classList.toggle("active", a.dataset.mod === m.id));
    const el = $("#content");
    el.innerHTML = ""; el.scrollTop = 0;
    if (NOS._cleanup) { try { NOS._cleanup(); } catch { } NOS._cleanup = null; }
    NOS._cleanup = m.render(el, rest.join("/")) || null;
  }
  NOS.refresh = route;
  NOS.go = h => { if (location.hash === "#" + h) route(); else location.hash = h; };

  NOS.start = () => {
    NOS.scope = NOS.store.get("scope", "all");
    if (NOS.store.get("light", false)) document.body.classList.add("light");
    buildScope(); buildSidebar();
    window.addEventListener("hashchange", route);
    $("#search").addEventListener("input", e => { NOS.query = e.target.value.trim(); NOS.go(NOS.query ? "search" : "notes"); });
    document.addEventListener("keydown", e => {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $("#search").focus(); }
    });
    $("#themeBtn").onclick = () => { document.body.classList.toggle("light"); NOS.store.set("light", document.body.classList.contains("light")); };
    route();
  };
})();

