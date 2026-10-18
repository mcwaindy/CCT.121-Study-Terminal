/* Text commands: viewing, filtering, searching, editing (simulated), archives. */
(() => {
  const NOS = window.NOS, V = NOS.vfs, def = NOS.defCmd, po = NOS.parseOpts;
  const lines = t => { if (t === "") return []; const l = t.split("\n"); if (l[l.length - 1] === "") l.pop(); return l; };
  const out = (c, arr) => { if (arr.length) c.w(arr.join("\n") + "\n"); };

  def("cat", "Concatenate and print files", c => {
    const { f, rest } = po(c.args); let n = 0;
    for (const i of c.sh.inputs(c, rest)) {
      let ls = lines(i.text);
      if (f.n) ls = ls.map(l => `${String(++n).padStart(6)}\t${l}`);
      else if (f.b) ls = ls.map(l => l.trim() ? `${String(++n).padStart(6)}\t${l}` : l);
      if (f.A || f.E) ls = ls.map(l => l + "$");
      out(c, ls);
    }
  });
  def("tac", "Print files in reverse", c => { for (const i of c.sh.inputs(c, c.args)) out(c, lines(i.text).reverse()); });
  def(["more", "less"], "Page through a file", c => { for (const i of c.sh.inputs(c, c.args.filter(a => !a.startsWith("-")))) c.w(i.text); });
  def("head", "Output the first lines", c => {
    const { v, rest } = po(c.args, { val: "nc" }), n = +(v.n ?? v.num ?? 10), multi = rest.length > 1;
    c.sh.inputs(c, rest).forEach((i, k) => { if (multi) c.p(`${k ? "\n" : ""}==> ${i.name} <==`); if (v.c) c.w(i.text.slice(0, +v.c)); else out(c, lines(i.text).slice(0, n)); });
  });
  def("tail", "Output the last lines", c => {
    const { f, v, rest } = po(c.args, { val: "nc" }), n = +(v.n ?? v.num ?? 10), multi = rest.length > 1;
    c.sh.inputs(c, rest).forEach((i, k) => { if (multi) c.p(`${k ? "\n" : ""}==> ${i.name} <==`); if (v.c) c.w(i.text.slice(-v.c)); else out(c, lines(i.text).slice(-n)); });
  });
  def("wc", "Count lines, words and bytes", c => {
    const { f, rest } = po(c.args), all = !f.l && !f.w && !f.c && !f.m; let tl = 0, tw = 0, tc = 0;
    const row = (l, w, b, name) => { const p = []; if (all || f.l) p.push(String(l).padStart(all ? 7 : 1)); if (all || f.w) p.push(String(w).padStart(all ? 7 : 1)); if (all || f.c || f.m) p.push(String(b).padStart(all ? 7 : 1)); return p.join(" ") + (name && name !== "-" ? " " + name : ""); };
    const ins = c.sh.inputs(c, rest);
    for (const i of ins) { const l = (i.text.match(/\n/g) || []).length, w = (i.text.trim() ? i.text.trim().split(/\s+/).length : 0), b = i.text.length; tl += l; tw += w; tc += b; c.p(row(l, w, b, i.name)); }
    if (ins.length > 1) c.p(row(tl, tw, tc, "total"));
  });
  def("sort", "Sort lines", c => {
    const { f, v, rest } = po(c.args, { val: "kt" });
    let ls = c.sh.inputs(c, rest).flatMap(i => lines(i.text));
    const key = l => { if (!v.k) return l; const sep = v.t ? v.t : /\s+/; const p = l.trim().split(sep); return p[+v.k.split(",")[0] - 1] ?? ""; };
    ls.sort((a, b) => { const x = key(a), y = key(b); return f.n ? (parseFloat(x) || 0) - (parseFloat(y) || 0) : x.localeCompare(y, "en"); });
    if (f.r) ls.reverse(); if (f.u) ls = ls.filter((l, i) => i === 0 || l !== ls[i - 1]); out(c, ls);
  });
  def("uniq", "Report or omit repeated lines", c => {
    const { f, rest } = po(c.args); const ls = lines(c.sh.inputs(c, rest.slice(0, 1))[0]?.text || ""); const g = [];
    for (const l of ls) { const k = f.i ? l.toLowerCase() : l; if (g.length && g[g.length - 1].k === k) g[g.length - 1].n++; else g.push({ l, k, n: 1 }); }
    out(c, g.filter(x => f.d ? x.n > 1 : f.u ? x.n === 1 : true).map(x => f.c ? `${String(x.n).padStart(7)} ${x.l}` : x.l));
  });
  def("cut", "Remove sections from lines", c => {
    const { f, v, rest } = po(c.args, { val: "dfc" }), d = v.d ?? "\t";
    const pick = (spec, arr) => spec.split(",").flatMap(s => { const m = /^(\d*)-(\d*)$/.exec(s); if (m) { const a = +(m[1] || 1), b = +(m[2] || arr.length); return arr.slice(a - 1, b); } return [arr[+s - 1]]; }).filter(x => x !== undefined);
    out(c, c.sh.inputs(c, rest).flatMap(i => lines(i.text)).map(l => v.c ? pick(v.c, [...l]).join("") : v.f ? (l.includes(d) ? pick(v.f, l.split(d)).join(d) : l) : l));
  });
  def("tr", "Translate or delete characters", c => {
    const { f, rest } = po(c.args), ex = s => s.replace(/\[:upper:\]/g, "A-Z").replace(/\[:lower:\]/g, "a-z").replace(/\[:digit:\]/g, "0-9").replace(/\[:space:\]/g, " \t\n").replace(/(.)-(.)/g, (m, a, b) => { let r = ""; for (let i = a.charCodeAt(0); i <= b.charCodeAt(0); i++) r += String.fromCharCode(i); return r; }).replace(/\\n/g, "\n");
    let s = c.stdin || ""; const a = ex(rest[0] || ""), b = ex(rest[1] || "");
    if (f.d) s = [...s].filter(ch => !a.includes(ch)).join(""); else s = [...s].map(ch => { const i = a.indexOf(ch); return i < 0 ? ch : (b[Math.min(i, b.length - 1)] ?? ch); }).join("");
    c.w(s);
  });
  def("tee", "Copy input to files and output", c => { const { f, rest } = po(c.args); const t = c.stdin || ""; c.w(t); for (const r of rest) { const e = c.sh.writeFile(r, t, !!f.a); if (e) c.err("tee: " + e); } });
  def("rev", "Reverse each line", c => out(c, c.sh.inputs(c, c.args).flatMap(i => lines(i.text)).map(l => [...l].reverse().join(""))));
  def("nl", "Number lines", c => { let n = 0; out(c, c.sh.inputs(c, c.args.filter(a => !a.startsWith("-"))).flatMap(i => lines(i.text)).map(l => `${String(++n).padStart(6)}\t${l}`)); });
  def("paste", "Merge lines of files", c => { const ins = c.sh.inputs(c, c.args.filter(a => !a.startsWith("-"))).map(i => lines(i.text)); const m = Math.max(0, ...ins.map(x => x.length)); for (let i = 0; i < m; i++) c.p(ins.map(x => x[i] ?? "").join("\t")); });
  def("diff", "Compare files line by line", c => {
    const { rest } = po(c.args); const a = c.sh.readFile(rest[0] || ""), b = c.sh.readFile(rest[1] || "");
    if (a.err || b.err) return c.fail(`diff: ${(a.err || b.err)}`, 2);
    const x = lines(a.text), y = lines(b.text); let diff = false;
    for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) { diff = true; if (x[i] !== undefined) c.p(`${i + 1}c${i + 1}\n< ${x[i]}` + (y[i] !== undefined ? `\n---\n> ${y[i]}` : "")); else c.p(`${i}a${i + 1}\n> ${y[i]}`); }
    return diff ? 1 : 0;
  });
  def("sed", "Stream editor (s/// , d, p, -n supported)", c => {
    const { f, rest } = po(c.args, { val: "e" }); let expr = f.e || rest.shift();
    const m = /^(\d+|\/[^/]*\/)?(?:,(\d+))?\s*(s|d|p)(.?)(.*)$/.exec(expr || ""); if (!m) return c.fail("sed: -e expression #1: unsupported expression");
    const ins = c.sh.inputs(c, rest); const res = [];
    for (const i of ins) {
      lines(i.text).forEach((l, idx) => {
        const n = idx + 1; let on = true;
        if (m[1]) on = m[1][0] === "/" ? new RegExp(m[1].slice(1, -1)).test(l) : (m[2] ? n >= +m[1] && n <= +m[2] : n === +m[1]);
        if (m[3] === "d") { if (!on) res.push(l); return; }
        if (m[3] === "p") { if (!f.n || on) res.push(l); if (on && !f.n) res.push(l); return; }
        const parts = m[5].split(m[4]); const flags = parts[2] || ""; let r = l;
        if (on) { try { r = l.replace(new RegExp(parts[0], flags.includes("g") ? "g" : ""), parts[1] ?? ""); } catch { } }
        if (!f.n) res.push(r);
      });
    }
    out(c, res);
  });
  def("awk", "Pattern scanning (supports '{print $N}' and -F)", c => {
    const { v, rest } = po(c.args, { val: "F" }); const prog = rest.shift() || ""; const m = /\{\s*print\s*([^}]*)\}/.exec(prog);
    const ins = c.sh.inputs(c, rest); const pat = /^\/(.*)\/\s*\{/.exec(prog);
    for (const i of ins) for (const l of lines(i.text)) {
      if (pat && !new RegExp(pat[1]).test(l)) continue;
      const fld = [l, ...(v.F ? l.split(v.F) : l.trim().split(/\s+/))];
      c.p(m ? (m[1].trim() ? m[1].split(",").map(x => x.trim()).map(x => /^\$\d+$/.test(x) ? fld[+x.slice(1)] ?? "" : x === "$0" ? l : x === "NF" ? fld.length - 1 : x.replace(/^"|"$/g, "")).join(" ") : l) : l);
    }
  });

  // ---------- grep ----------
  def(["grep", "egrep", "fgrep"], "Search for patterns in text", c => {
    const sh = c.sh, { f, v, rest } = po(c.args, { val: "eAB" });
    let pat = v.e ?? rest.shift(); if (pat === undefined) return c.fail("Usage: grep [OPTION]... PATTERNS [FILE]...", 2);
    let rx; try { rx = new RegExp(f.F || c.name === "fgrep" ? pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : (f.E || c.name === "egrep" || f.P ? pat : pat.replace(/\\([|+?(){}])/g, "$1").replace(/(^|[^\\])([+?|(){}])/g, "$1\\$2")), f.i ? "i" : ""); } catch { return c.fail(`grep: Invalid regular expression`, 2); }
    const files = f.r || f.R ? [] : rest; let ins = [];
    if (f.r || f.R) { for (const t of rest.length ? rest : ["."]) sh.walk(t, (p, n) => { if (n.t === "f") { const r = sh.readFile(p); if (r.err) c.err("grep: " + r.err); else ins.push({ name: rest.length ? p : p.replace(sh.cwd + "/", ""), text: r.text }); } }); }
    else ins = sh.inputs(c, files);
    const multi = ins.length > 1 || f.r || f.R; let any = false;
    for (const i of ins) {
      const ls = lines(i.text); let cnt = 0, hit = false; const A = +(v.A || 0), B = +(v.B || 0), shown = new Set();
      ls.forEach((l, idx) => {
        const m = rx.test(l) !== !!f.v; if (!m) return; cnt++; hit = true; any = true;
        if (f.c || f.l || f.L || f.q) return;
        for (let k = Math.max(0, idx - B); k <= Math.min(ls.length - 1, idx + A); k++) if (!shown.has(k)) { shown.add(k); const body = f.o ? (new RegExp(rx.source, rx.flags + "g").exec(ls[k]) || [""])[0] : ls[k]; c.p(`${multi && !f.h ? i.name + ":" : ""}${f.n ? (k + 1) + ":" : ""}${body}`); }
      });
      if (f.c) c.p(`${multi && !f.h ? i.name + ":" : ""}${cnt}`);
      if (f.l && hit) c.p(i.name); if (f.L && !hit) c.p(i.name);
    }
    return any ? 0 : 1;
  });

  // ---------- find / locate ----------
  def("find", "Search for files in a directory hierarchy", c => {
    const sh = c.sh, a = c.args.slice(), starts = []; while (a.length && !a[0].startsWith("-") && a[0] !== "!" && a[0] !== "(") starts.push(a.shift());
    if (!starts.length) starts.push(".");
    const o = { type: null, name: null, iname: null, user: null, group: null, perm: null, size: null, mtime: null, depth: null, empty: false, exec: null, print: true, links: null, inum: null, newer: null }; let neg = false;
    for (let i = 0; i < a.length; i++) {
      const k = a[i];
      if (k === "!" || k === "-not") { neg = true; continue; }
      const val = () => a[++i];
      if (k === "-name") o.name = [val(), neg]; else if (k === "-iname") o.iname = [val(), neg]; else if (k === "-type") o.type = [val(), neg]; else if (k === "-user") o.user = [val(), neg]; else if (k === "-group") o.group = [val(), neg];
      else if (k === "-perm") o.perm = [val(), neg]; else if (k === "-size") o.size = [val(), neg]; else if (k === "-mtime") o.mtime = val(); else if (k === "-maxdepth") o.maxd = +val(); else if (k === "-mindepth") o.mind = +val();
      else if (k === "-empty") o.empty = true; else if (k === "-links") o.links = val(); else if (k === "-inum") o.inum = +val(); else if (k === "-newer") o.newer = val(); else if (k === "-print") o.print = true;
      else if (k === "-ls") o.ls = true; else if (k === "-delete") o.del = true;
      else if (k === "-exec" || k === "-ok") { const cmd = []; i++; while (i < a.length && a[i] !== ";" && a[i] !== "\\;") cmd.push(a[i++]); o.exec = cmd; o.print = false; }
      else return c.fail(`find: unknown predicate \`${k}'`);
      neg = false;
    }
    const globRx = g => new RegExp("^" + g.replace(/[.+^${}()|\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
    const newerN = o.newer ? sh.get(o.newer) : null; const results = [];
    for (const s of starts) {
      if (!sh.get(s, false)) { c.err(`find: '${s}': No such file or directory`); continue; }
      sh.walk(s, (p, n, d) => {
        if (o.maxd != null && d > o.maxd) return; if (o.mind != null && d < o.mind) return;
        const name = p === "/" ? "/" : p.split("/").pop(), disp = d === 0 ? s : p.replace(sh.abs(s) === "/" ? "" : sh.abs(s), s.replace(/\/$/, ""));
        const t = (x, f) => x ? f(x[0]) !== x[1] : true;
        if (!t(o.name, g => globRx(g).test(name))) return; if (!t(o.iname, g => new RegExp(globRx(g).source, "i").test(name))) return;
        if (!t(o.type, ty => n.t === ty)) return; if (!t(o.user, u => n.owner === u)) return; if (!t(o.group, g => n.group === g)) return;
        if (o.perm) { const [ps, ng] = o.perm; let ok; if (ps[0] === "-") ok = (n.mode & parseInt(ps.slice(1), 8)) === parseInt(ps.slice(1), 8); else if (ps[0] === "/") ok = (n.mode & parseInt(ps.slice(1), 8)) !== 0; else ok = (n.mode & 0o7777) === parseInt(ps, 8); if (ok === ng) return; }
        if (o.size) { const [sz, ng] = o.size; const m = /^([+-]?)(\d+)([kMGcb]?)$/.exec(sz); if (m) { const mult = { c: 1, b: 512, k: 1024, M: 1048576, G: 1073741824, "": 512 }[m[3]]; const units = Math.ceil(V.size(n) / mult), x = +m[2]; const ok = m[1] === "+" ? units > x : m[1] === "-" ? units < x : units === x; if (ok === ng) return; } }
        if (o.mtime) { const days = (Date.now() - n.mtime) / 86400000, m = /^([+-]?)(\d+)$/.exec(o.mtime); if (m) { const x = +m[2], ok = m[1] === "+" ? days > x : m[1] === "-" ? days < x : Math.floor(days) === x; if (!ok) return; } }
        if (o.empty && !(n.t === "d" ? !Object.keys(n.kids).length : V.size(n) === 0)) return;
        if (o.links && n.links !== +o.links) return; if (o.inum && n.ino !== o.inum) return; if (newerN && !(n.mtime > newerN.mtime)) return;
        results.push([disp, n, p]);
      });
    }
    for (const [d, n, p] of results) {
      if (o.del) { const [pp, nm] = sh.parent(p); if (pp && !sh.canRemove(pp, nm)) delete pp.kids[nm]; else c.err(`find: cannot delete '${d}'`); }
      else if (o.exec) { const r = sh.invoke(o.exec.map(x => x === "{}" ? d : x), null); c.o += r.o; c.e += r.e; }
      else if (o.ls) c.p(`${n.ino} ${V.modeStr(n)} ${n.links} ${n.owner} ${n.group} ${V.size(n)} ${V.fmtDate(n.mtime)} ${d}`);
      else c.p(d);
    }
  });
  def(["locate", "mlocate"], "Find files by name in the index", c => {
    const sh = c.sh, { f, rest } = po(c.args); const pat = rest[0]; if (!pat) return c.fail("locate: no pattern to search for specified");
    const db = sh.sys.locateDb || []; const rx = new RegExp(pat.replace(/[.+^${}()|\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, "."), f.i ? "i" : "");
    const hit = db.filter(p => (/[*?]/.test(pat) ? rx.test(p) : rx.test(p.split("/").pop()) || rx.test(p)) && sh.get(p, false));
    if (f.c) c.p(String(hit.length)); else out(c, hit.sort());
    return hit.length ? 0 : 1;
  });
  def("updatedb", "Rebuild the locate database", c => { if (!c.root("updatedb: can not open a temporary file for `/var/lib/mlocate/mlocate.db'")) return; c.sh.sys.locateDb = c.sh.allPaths(); }, { sbin: true });
  def("xargs", "Build and run commands from input", c => {
    const a = c.args.filter(x => !x.startsWith("-")); const items = (c.stdin || "").split(/\s+/).filter(Boolean); const cmd = a.length ? a : ["echo"];
    const r = c.sh.invoke([...cmd, ...items], null); c.o += r.o; c.e += r.e; c.status = r.status;
  });
  def("file", "Determine file type", c => {
    const sh = c.sh;
    for (const t of c.args.filter(a => !a.startsWith("-"))) {
      const n = sh.get(t, false); if (!n) { c.p(`${t}: cannot open \`${t}' (No such file or directory)`); continue; }
      let d; if (n.t === "d") d = "directory"; else if (n.t === "l") d = `symbolic link to ${n.target}`; else if (n.t === "b") d = "block special"; else if (n.t === "c") d = "character special";
      else { const x = V.text(n); d = x.startsWith("\x7fELF") ? "ELF 64-bit LSB executable, x86-64" : x.startsWith("#!") ? "Bourne-Again shell script, ASCII text executable" : x.startsWith("TZif") ? "timezone data" : x === "" ? "empty" : /[^\x00-\x7f]/.test(x) ? "UTF-8 Unicode text" : "ASCII text"; }
      c.p(`${t}: ${d}`);
    }
  });
  def("stat", "Display file status", c => {
    const sh = c.sh;
    for (const t of c.args.filter(a => !a.startsWith("-"))) {
      const n = sh.get(t, false); if (!n) { c.err(`stat: cannot statx '${t}': No such file or directory`); continue; }
      const ty = { d: "directory", f: "regular file", l: "symbolic link", b: "block special file", c: "character special file" }[n.t];
      c.p(`  File: ${t}${n.t === "l" ? " -> " + n.target : ""}\n  Size: ${V.size(n)}\tBlocks: ${Math.ceil(V.size(n) / 512)}\tIO Block: 4096   ${ty}\nDevice: 803h/2051d\tInode: ${n.ino}\tLinks: ${n.links}\nAccess: (${(n.mode & 0o7777).toString(8).padStart(4, "0")}/${V.modeStr(n)})  Uid: (${String((sh.sys.users[n.owner] || { uid: 0 }).uid).padStart(4)}/${n.owner.padStart(8)})   Gid: (${String((sh.sys.groups[n.group] || { gid: 0 }).gid).padStart(4)}/${n.group.padStart(8)})\nAccess: ${V.fmtFull(n.atime)}\nModify: ${V.fmtFull(n.mtime)}\nChange: ${V.fmtFull(n.ctime)}`);
    }
  });
  def("md5sum", "Compute an MD5-style checksum (simulated)", c => { for (const i of c.sh.inputs(c, c.args)) { let h = 5381; for (const ch of i.text) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0; c.p(`${h.toString(16).padStart(8, "0").repeat(4)}  ${i.name}`); } });
  NOS.shellCommands.sha256sum = NOS.shellCommands.md5sum;
  def("strings", "Print printable strings in files", c => { for (const i of c.sh.inputs(c, c.args)) out(c, lines(i.text).filter(l => /[ -~]{4,}/.test(l))); });
  def("od", "Dump a file in octal", c => { for (const i of c.sh.inputs(c, c.args.filter(a => !a.startsWith("-")))) { c.p([...i.text.slice(0, 16)].map(ch => ch.charCodeAt(0).toString(8).padStart(3, "0")).join(" ")); } });
  def("hexdump", "Display file contents in hex", c => { for (const i of c.sh.inputs(c, c.args.filter(a => !a.startsWith("-")))) { const b = [...i.text].map(ch => ch.charCodeAt(0).toString(16).padStart(2, "0")); for (let k = 0; k < b.length; k += 16) c.p(`${(k).toString(16).padStart(7, "0")} ${b.slice(k, k + 16).join(" ")}`); } });
  NOS.shellCommands.xxd = NOS.shellCommands.hexdump;

  // ---------- editors (simulated: append / create via arguments) ----------
  def(["vi", "vim", "nano", "emacs", "gedit"], "Text editor (simulated)", c => {
    const t = c.args.find(a => !a.startsWith("-")); if (!t) return c.p("Simulated editor: pass a file name. Use echo/redirection to put content in the file.");
    const sh = c.sh, n = sh.get(t);
    if (!n) { const e = sh.writeFile(t, ""); if (e) return c.fail(`${c.name}: ${e}`); }
    else if (n.t === "d") return c.fail(`${c.name}: ${t} is a directory`);
    c.p(`[${c.name}] "${t}" ${n ? "opened" : "new file"}. (Editors are simulated: use echo/printf with > and >> to change content. Real vi keys: i insert, Esc, :wq save, :q! quit.)`);
  });
  def("printf", "Format and print data", c => {
    const f = (c.args[0] || "").replace(/\\n/g, "\n").replace(/\\t/g, "\t"); let i = 1;
    c.w(f.replace(/%[sd]/g, () => c.args[i++] ?? ""));
  });
  def("seq", "Print a sequence of numbers", c => { const n = c.args.map(Number); const [a, s, b] = n.length === 1 ? [1, 1, n[0]] : n.length === 2 ? [n[0], 1, n[1]] : n; const r = []; for (let x = a; s > 0 ? x <= b : x >= b; x += s) r.push(x); out(c, r); });
  def("yes", "Repeat a string (limited)", c => { out(c, Array(5).fill(c.args[0] || "y")); });

  // ---------- archives & compression (content-faithful, simulated) ----------
  def("tar", "Archive files", c => {
    const sh = c.sh, a = c.args.slice(); const flagArg = a[0] && !a[0].startsWith("-") ? "-" + a.shift() : null; if (flagArg) a.unshift(flagArg);
    const { f, v, rest } = po(a, { val: "fCf" }); const arch = v.f, create = f.c, extract = f.x, list = f.t;
    if (!arch) return c.fail("tar: Refusing to read/write archive data from/to the terminal (specify -f)", 2);
    if (create) {
      const members = []; for (const t of rest) { if (!sh.get(t, false)) { c.err(`tar: ${t}: Cannot stat: No such file or directory`); continue; } sh.walk(t, (p, n) => { members.push({ path: p.replace(/^\//, "").replace(sh.cwd.slice(1) + "/", ""), n }); if (f.v) c.p(p.replace(/^\//, "")); }); }
      const e = sh.writeFile(arch, ""); if (e) return c.fail("tar: " + e);
      const an = sh.get(arch); delete an.gen; an.content = "\x1f\x8b simulated tar archive"; an.archive = members.map(m => ({ path: m.path, node: V.clone(m.n) }));
      if (f.z || /\.t?gz$/.test(arch)) an.content = "\x1f\x8b simulated tar.gz archive";
    } else if (extract || list) {
      const an = sh.get(arch); if (!an || !an.archive) return c.fail(`tar: ${arch}: Cannot open: No such file or directory`, 2);
      for (const m of an.archive) { if (list || f.v) c.p(m.path); if (extract) { const dest = (v.C ? sh.abs(v.C) : sh.cwd) + "/" + m.path, [p, nm] = sh.parent(dest); if (!p) { sh.runSilent(`mkdir -p ${dest.slice(0, dest.lastIndexOf("/"))}`); } const [p2] = sh.parent(dest); if (p2 && sh.can(p2, 2)) p2.kids[nm] = V.clone(m.node); } }
    } else return c.fail("tar: You must specify one of the '-Acdtrux' options", 2);
  });
  def(["gzip", "bzip2", "xz"], "Compress files", c => {
    const sh = c.sh, ext = { gzip: "gz", bzip2: "bz2", xz: "xz" }[c.name];
    for (const t of c.args.filter(a => !a.startsWith("-"))) { const n = sh.get(t); if (!n || n.t !== "f") { c.err(`${c.name}: ${t}: No such file or directory`); continue; } const [p, nm] = sh.parent(t); const z = V.clone(n); z.compressed = V.text(n); z.content = "\x1f\x8b compressed"; z.mode = n.mode; delete p.kids[nm]; p.kids[nm + "." + ext] = z; }
  });
  def(["gunzip", "bunzip2", "unxz"], "Decompress files", c => {
    const sh = c.sh;
    for (const t of c.args.filter(a => !a.startsWith("-"))) { const n = sh.get(t); if (!n || n.compressed == null) { c.err(`${c.name}: ${t}: not in compressed format or no such file`); continue; } const [p, nm] = sh.parent(t); const u = V.clone(n); u.content = n.compressed; delete u.compressed; delete p.kids[nm]; p.kids[nm.replace(/\.(gz|bz2|xz)$/, "")] = u; }
  });
  def("zcat", "Print a compressed file", c => { for (const t of c.args) { const n = c.sh.get(t); if (n && n.compressed != null) c.w(n.compressed); else c.err(`zcat: ${t}: not in gzip format`); } });
})();
