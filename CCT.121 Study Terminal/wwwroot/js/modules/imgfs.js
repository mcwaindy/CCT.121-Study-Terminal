/* Image Explorer: browse simulated disk images (data comes from chapter files' "images"). Exposes CCT.img helpers. */
(() => {
  const SIGS = [
    ["JPEG", "FF D8 FF"], ["PNG", "89 50 4E 47"], ["PDF", "25 50 44 46"], ["ZIP", "50 4B 03 04"],
    ["EXE", "4D 5A"], ["NTFS MFT", "46 49 4C 45"], ["Registry hive", "72 65 67 66"]
  ];
  const EXT = { jpg: "JPEG", jpeg: "JPEG", png: "PNG", pdf: "PDF", zip: "ZIP", xlsx: "ZIP", docx: "ZIP", exe: "EXE", dll: "EXE" };
  const sigOf = hdr => { const h = (hdr || "").toUpperCase(); const s = SIGS.find(x => h.startsWith(x[1])); return s ? s[0] : null; };

  function flatten(node, path = "", out = [], hidden = false) {
    const p = path ? path + "/" + node.n : node.n;
    if (node.d) { out.push({ path: p, node, dir: true, hidden }); node.d.forEach(c => flatten(c, p, out, hidden)); }
    else out.push({ path: p, node, dir: false, hidden });
    return out;
  }
  const entries = img => flatten(img.tree).concat(img.hiddenTree ? flatten(img.hiddenTree, "", [], true) : []);
  const status = node => {
    const ext = (node.n.split(".").pop() || "").toLowerCase();
    const sig = sigOf(node.hdr), exp = EXT[ext];
    return { sig, exp, mismatch: !!(sig && exp && sig !== exp) };
  };
  const hexDump = (hdr, text, size) => {
    const bytes = (hdr || "").split(" ").filter(Boolean);
    const tb = [...(text || "")].slice(0, 32).map(c => c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase());
    const all = bytes.concat(tb).slice(0, 64);
    let out = "";
    for (let i = 0; i < all.length; i += 16) {
      const row = all.slice(i, i + 16);
      const asc = row.map(h => { const c = parseInt(h, 16); return c >= 32 && c < 127 ? String.fromCharCode(c) : "."; }).join("");
      out += (i.toString(16).padStart(8, "0")) + "  " + row.join(" ").padEnd(47) + "  " + asc + "\n";
    }
    return out || "(empty)";
  };
  const hashOf = (img, e) => ({ md5: CCT.pseudoHash(img.id + e.path, 32), sha256: CCT.pseudoHash(img.id + e.path + "s", 64) });
  const allImages = () => CCT.itemsAny("images");
  CCT.img = { SIGS, sigOf, entries, status, hexDump, hashOf, all: allImages };

  CCT.addModule({
    id: "imgfs", title: "Image Explorer", group: "Practice", order: 1,
    render(el) {
      const imgs = allImages();
      if (!imgs.length) { el.innerHTML = `<h1>Image Explorer</h1><div class="empty">No disk images in this scope.</div>`; return; }
      let img = imgs.find(i => i.id === CCT.store.get("img", "")) || imgs[0];
      let sel = null, tab = "files";
      const found = CCT.store.get("found", {});

      const header = () => `<h1>Image Explorer</h1><div class="sub">Simulated Autopsy-style view. Data is fictional.</div>
        <div class="row"><select id="pick">${imgs.map(i => `<option value="${i.id}" ${i.id === img.id ? "selected" : ""}>${CCT.esc(i.title)}</option>`).join("")}</select>
        <button class="btn ${tab === "files" ? "pri" : ""}" data-tab="files">File tree</button>
        <button class="btn ${tab === "parts" ? "pri" : ""}" data-tab="parts">Partitions</button>
        <button class="btn ${tab === "quiz" ? "pri" : ""}" data-tab="quiz">Investigation questions</button></div>
        <div class="card"><i>${CCT.esc(img.story)}</i></div>`;

      const treeHtml = (node, path = "", hidden = false) => {
        const p = path ? path + "/" + node.n : node.n;
        if (node.d) return `<div><div class="n" data-p="${CCT.esc(p)}">📁 ${CCT.esc(node.n)}</div><div class="kids">${node.d.map(c => treeHtml(c, p, hidden)).join("")}</div></div>`;
        return `<div class="n ${node.del ? "del" : ""} ${sel && sel.path === p ? "sel" : ""}" data-p="${CCT.esc(p)}" data-h="${hidden ? 1 : 0}">📄 ${CCT.esc(node.n)}${node.del ? " (deleted)" : ""}</div>`;
      };
      const detail = () => {
        if (!sel) return `<div class="card dim">Select a file.</div>`;
        const n = sel.node, st = CCT.img.status(n), h = hashOf(img, sel);
        return `<div class="card"><b>${CCT.esc(n.n)}</b>${n.del ? ' <span class="tag" style="color:var(--bad)">deleted</span>' : ""}
          <table class="t"><tr><th>Path</th><td class="mono">${CCT.esc(sel.path)}</td></tr><tr><th>Size</th><td>${n.size} bytes</td></tr>
          <tr><th>Modified</th><td>${n.m}</td></tr><tr><th>Accessed</th><td>${n.a}</td></tr><tr><th>Created</th><td>${n.c}</td></tr>
          <tr><th>Header sig</th><td>${st.sig ? st.sig : "unknown / text"}</td></tr>
          <tr><th>Ext type</th><td>${st.exp || "n/a"}</td></tr>
          <tr><th>MD5</th><td class="mono" style="word-break:break-all">${h.md5}</td></tr></table>
          ${st.mismatch ? `<div class="key warn"><b>Signature mismatch:</b> extension suggests ${st.exp}, header says ${st.sig}. ${CCT.esc(n.note || "")}</div>` : ""}
          <div class="hex">${CCT.esc(hexDump(n.hdr, n.text, n.size))}</div>
          <p class="dim">Content: ${CCT.esc(n.text || "")}</p></div>`;
      };
      const partsHtml = () => `<div class="card"><b>${img.scheme}</b> &middot; ${img.sectorSize} B sectors &middot; ${img.totalSectors.toLocaleString()} LBAs &middot; capacity ${(img.totalSectors * img.sectorSize).toLocaleString()} bytes
        <div class="dim">${img.scheme === "GPT" ? "LBA 0 protective MBR (0xEE), LBA 1 GPT header, entries from LBA 2, first usable LBA 34, backup header at LBA -1." : "Sector 0: 446 B boot code + 64 B partition table (4 entries) + 2 B signature."}</div></div>
        <table class="t"><tr><th>#</th><th>Type</th><th>FS</th><th>Start LBA</th><th>Sectors</th><th>Size</th><th>Notes</th></tr>
        ${img.parts.map((p, i) => `<tr><td>${i + 1}</td><td>${CCT.esc(p.type)}${p.boot ? " (boot)" : ""}</td><td>${p.fs}</td><td>${p.start.toLocaleString()}</td><td>${p.sectors.toLocaleString()}</td><td>${(p.sectors * img.sectorSize / 1e9).toFixed(2)} GB</td><td>${p.hidden ? '<b class="bad">hidden</b> ' : ""}${CCT.esc(p.note || "")}</td></tr>`).join("")}</table>`;
      const quizHtml = () => (img.questions || []).map((q, qi) => {
        const done = found[img.id + ":" + qi];
        return `<div class="card"><b>${qi + 1}. ${CCT.esc(q.q)}</b>${q.opts.map((o, oi) => `<button class="btn opt ${done !== undefined ? (oi === q.a ? "right" : (oi === done ? "wrong" : "")) : ""}" data-q="${qi}" data-o="${oi}" ${done !== undefined ? "disabled" : ""}>${CCT.esc(o)}</button>`).join("")}
          ${done !== undefined ? `<div class="key"><b>${done === q.a ? "Correct." : "Not quite."}</b> ${CCT.esc(q.why)}</div>` : ""}</div>`;
      }).join("");

      const draw = () => {
        let body = "";
        if (tab === "files") body = `<div class="two"><div class="card tree">${treeHtml(img.tree)}${img.hiddenTree ? `<div class="dim" style="margin-top:8px">Hidden partition (ext4):</div>${treeHtml(img.hiddenTree, "", true)}` : ""}</div><div>${detail()}</div></div>`;
        else if (tab === "parts") body = partsHtml();
        else body = quizHtml();
        el.innerHTML = header() + body;
        CCT.$("#pick", el).onchange = e => { img = imgs.find(i => i.id === e.target.value); CCT.store.set("img", img.id); sel = null; draw(); };
        CCT.$$("[data-tab]", el).forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
        const all = entries(img);
        CCT.$$(".tree .n[data-h]", el).forEach(n => n.onclick = () => { sel = all.find(e => e.path === n.dataset.p && !e.dir); draw(); });
        CCT.$$("[data-q]", el).forEach(b => b.onclick = () => { found[img.id + ":" + b.dataset.q] = +b.dataset.o; CCT.store.set("found", found); draw(); });
      };
      draw();
    }
  });
})();
