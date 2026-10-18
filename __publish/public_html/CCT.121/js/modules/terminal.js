/* Faux terminal: Sleuth Kit / Linux style commands against the simulated images */
CCT.addModule({
  id: "terminal", title: "Faux Terminal", group: "Practice", order: 2,
  render(el) {
    const imgs = CCT.img.all();
    let img = imgs.find(i => i.id === CCT.store.get("img", "")) || imgs[0] || null;
    const hist = CCT.store.get("hist", []); let hi = hist.length;

    el.innerHTML = `<h1>Faux Terminal</h1><div class="sub">Practice forensic CLI against the simulated images. Type <code>help</code>. Tab completes commands, up/down recalls history.</div>
      <div class="term" id="term"><div id="out"></div><div class="in"><span id="ps"></span><input id="inp" autocomplete="off" spellcheck="false"></div></div>`;
    const out = CCT.$("#out", el), inp = CCT.$("#inp", el), term = CCT.$("#term", el), ps = CCT.$("#ps", el);
    const setPs = () => ps.textContent = `examiner@lab:${img ? img.id : "~"}$`;
    const print = (t, c = "") => { const d = document.createElement("div"); d.className = "l " + c; d.textContent = t; out.appendChild(d); term.scrollTop = 1e9; };
    const entries = () => img ? CCT.img.entries(img) : [];
    const find = name => { const e = entries().filter(x => !x.dir); return e.find(x => x.path === name) || e.find(x => x.node.n.toLowerCase() === (name || "").toLowerCase()); };
    const need = () => { if (!img) { print("No image loaded. Use: images / use <id>", "err"); return false; } return true; };

    const C = {
      help: { h: "help                 list commands", f: () => Object.values(C).forEach(c => print(c.h)) },
      images: { h: "images               list disk images", f: () => imgs.forEach(i => print(`${i.id}  ${i.title}`)) },
      use: { h: "use <id>             select an image", f: a => { const i = imgs.find(x => x.id === a[0]); if (!i) return print("unknown image id (see: images)", "err"); img = i; CCT.store.set("img", i.id); setPs(); print("image set: " + i.title); } },
      mmls: { h: "mmls                 show partition layout", f: () => { if (!need()) return; print(`${img.scheme} partition table (${img.sectorSize}-byte sectors)`); print("Slot  Start         End           Length        Description"); img.parts.forEach((p, i) => print(`${String(i).padEnd(5)} ${String(p.start).padEnd(13)} ${String(p.start + p.sectors - 1).padEnd(13)} ${String(p.sectors).padEnd(13)} ${p.type}${p.hidden ? "  [hidden]" : ""}`)); } },
      fsstat: { h: "fsstat [n]           file system details for partition n", f: a => { if (!need()) return; const p = img.parts[+a[0] || 0]; if (!p) return print("no such partition", "err"); print(`File System Type: ${p.fs}`); if (p.clusterSize) print(`Cluster Size: ${p.clusterSize}  (${p.clusterSize / img.sectorSize} sectors per cluster)`); print(`Sector Size: ${img.sectorSize}`); print(`Range: ${p.start} - ${p.start + p.sectors - 1}`); } },
      fls: { h: "fls [-r] [-d]        list files (-r recursive, -d deleted only)", f: a => { if (!need()) return; let l = entries(); if (a.includes("-d")) l = l.filter(e => e.node.del); else if (!a.includes("-r")) l = l.filter(e => e.path.split("/").length <= 3); l.forEach(e => print(`${e.node.del ? "-/r *" : e.dir ? "d/d  " : "r/r  "} ${e.path}${e.dir ? "/" : ""}`)); } },
      istat: { h: "istat <file>         file metadata (MAC times)", f: a => { if (!need()) return; const e = find(a[0]); if (!e) return print("file not found", "err"); const n = e.node; print(`Name: ${n.n}\nPath: ${e.path}\nSize: ${n.size}\nAllocated: ${n.del ? "No (deleted)" : "Yes"}\nModified: ${n.m}\nAccessed: ${n.a}\nCreated:  ${n.c}\nStorage: ${n.size < 700 ? "resident (in MFT record)" : "non-resident (data runs)"}`); } },
      icat: { h: "icat <file>          print file content", f: a => { if (!need()) return; const e = find(a[0]); if (!e) return print("file not found", "err"); print(e.node.text || ""); } },
      xxd: { h: "xxd <file>           hex dump of header", f: a => { if (!need()) return; const e = find(a[0]); if (!e) return print("file not found", "err"); print(CCT.img.hexDump(e.node.hdr, e.node.text, e.node.size)); } },
      file: { h: "file <file>          identify type by signature", f: a => { if (!need()) return; const e = find(a[0]); if (!e) return print("file not found", "err"); const st = CCT.img.status(e.node); print(`${e.node.n}: ${st.sig || "ASCII text / unknown"}${st.mismatch ? `   *** MISMATCH: extension implies ${st.exp} ***` : ""}`); } },
      md5sum: { h: "md5sum <file>        hash a file (simulated)", f: a => { if (!need()) return; const e = find(a[0]); if (!e) return print("file not found", "err"); print(CCT.img.hashOf(img, e).md5 + "  " + e.node.n); } },
      sha256sum: { h: "sha256sum <file>     hash a file (simulated)", f: a => { if (!need()) return; const e = find(a[0]); if (!e) return print("file not found", "err"); print(CCT.img.hashOf(img, e).sha256 + "  " + e.node.n); } },
      sigs: { h: "sigs                 common file signatures", f: () => CCT.img.SIGS.forEach(s => print(s[0].padEnd(14) + s[1])) },
      dd: { h: "dd if=.. of=.. bs=.. count=..   explain a dd command", f: a => { const m = Object.fromEntries(a.map(x => x.split("="))); if (!m.if || !m.of) return print("usage: dd if=/dev/sda of=mbr.backup bs=512 count=1", "err"); const bytes = (+m.bs || 512) * (+m.count || 0); print(`${m.count || "all"}+0 records in\n${m.count || "all"}+0 records out\n${bytes ? bytes + " bytes copied" : "entire device copied"}`); if (m.bs == 512 && m.count == 1) print("(That is exactly one sector: the 512-byte MBR.)", "dim"); } },
      calc: { h: "calc <lbas> <blocksize>   disk capacity", f: a => { const l = +String(a[0]).replace(/,/g, ""), b = +a[1] || 512; if (!l) return print("usage: calc 1953525168 512", "err"); const by = l * b; print(`${l} x ${b} = ${by.toLocaleString()} bytes = ${(by / 1e9).toFixed(2)} GB (${(by / 1099511627776).toFixed(3)} TiB)`); } },
      hexdec: { h: "hexdec <hex>         hex to decimal / binary", f: a => { const n = parseInt(a[0], 16); if (isNaN(n)) return print("usage: hexdec 3F2A", "err"); print(`${a[0]} = ${n} = 0b${n.toString(2)}`); } },
      volatility: { h: "volatility           order of volatility", f: () => ["1 Registers, cache, RAM", "2 Swap files", "3 Routing/ARP/process tables, kernel stats", "4 File system info, temp files", "5 Raw disk blocks", "6 Remote logging/monitoring", "7 Physical config, topology", "8 Offline media"].forEach(l => print(l)) },
      exhibit: { h: "exhibit <AAA> <ddmmyy> <n> [part]   build exhibit number", f: a => { if (a.length < 3) return print("usage: exhibit DRS 170926 1 A", "err"); print(`${a[0].toUpperCase()}/${a[1]}/${String(a[2]).padStart(4, "0")}${a[3] ? "/" + a[3].toUpperCase() : ""}`); } },
      clear: { h: "clear                clear screen", f: () => out.innerHTML = "" }
    };

    CCT.chapters.flatMap(c => c.cli || []).forEach(x => {
      C[x.cmd] = { h: x.help, f: a => { const r = x.run(a, { img: () => img }); String(r ?? "").split("\n").forEach(s => print(s)); } };
    });

    print("CCT.121 forensic shell. Type 'help'.", "dim");
    if (img) print("Image loaded: " + img.title, "dim"); setPs();
    term.onclick = () => inp.focus(); inp.focus();
    inp.onkeydown = e => {
      if (e.key === "ArrowUp") { hi = Math.max(0, hi - 1); inp.value = hist[hi] ?? ""; e.preventDefault(); }
      else if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] ?? ""; }
      else if (e.key === "Tab") { e.preventDefault(); const m = Object.keys(C).filter(k => k.startsWith(inp.value)); if (m.length === 1) inp.value = m[0] + " "; }
      else if (e.key === "Enter") {
        const line = inp.value.trim(); inp.value = ""; print(ps.textContent + " " + line, "dim");
        if (!line) return;
        hist.push(line); hi = hist.length; CCT.store.set("hist", hist.slice(-60));
        const [cmd, ...args] = line.match(/(?:[^\s"]+|"[^"]*")+/g).map(s => s.replace(/^"|"$/g, ""));
        if (C[cmd]) C[cmd].f(args); else print(cmd + ": command not found (try help)", "err");
      }
    };
  }
});
