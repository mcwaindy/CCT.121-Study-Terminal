/* NOS.120 shell core: tokenizer, expansion, pipelines, redirection, permissions, users. No DOM access.
   Commands register with NOS.defCmd(names, description, fn, opts); fn(ctx) writes via ctx.p()/ctx.w()/ctx.err(). */
(() => {
  const NOS = window.NOS, V = NOS.vfs;
  const cmds = NOS.shellCommands = NOS.shellCommands || {};
  NOS.defCmd = (names, desc, f, o = {}) => { for (const n of [].concat(names)) cmds[n] = { name: n, desc, f, ...o }; };

  class ShellError extends Error { }
  NOS.ShellError = ShellError;

  // Generic option parser. val = short options that take a value; long = { name: "v" } for long options with values.
  NOS.parseOpts = (args, { val = "", long = {} } = {}) => {
    const f = {}, v = {}, rest = []; let done = false;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (done || a === "-" || !a.startsWith("-")) { rest.push(a); continue; }
      if (a === "--") { done = true; continue; }
      if (a.startsWith("--")) { const [k, ...r] = a.slice(2).split("="); if (long[k] === "v") v[k] = r.length ? r.join("=") : args[++i]; else f[k] = r.length ? r.join("=") : true; continue; }
      if (/^-\d+$/.test(a)) { v.num = a.slice(1); continue; }
      for (let j = 1; j < a.length; j++) {
        const c = a[j];
        if (val.includes(c)) { const r2 = a.slice(j + 1); v[c] = r2 !== "" ? r2 : args[++i]; break; }
        f[c] = true;
      }
    }
    return { f, v, rest };
  };

  class Shell {
    constructor() { this.onPrint = null; this.onClear = null; this.onRun = null; this.quiet = false; this.capture = null; this.depth = 0; this.reset(true); }

    reset(silent) {
      this.sys = V.newSystem(); this.root = this.sys.root;
      this.user = "student"; this.userStack = [];
      const home = "/home/student";
      this.cwd = home; this.oldcwd = home; this.umask = 0o022;
      this.env = { HOME: home, USER: "student", LOGNAME: "student", SHELL: "/bin/bash", PATH: "/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin", LANG: this.sys.locale, HOSTNAME: "nos120", TERM: "xterm-256color", DISPLAY: ":0" };
      this.vars = {}; this.aliases = {}; this.argv = [];
      this.hist = []; this.hpos = 0; this.used = new Set(); this.log = []; this.status = 0; this.screen = [];
      this.sys.locateDb = this.allPaths();
      if (!silent) this.print("Filesystem reset to defaults.", "dim");
    }

    // ---------- output ----------
    print(text, cls = "") {
      if (this.quiet) return;
      for (const line of String(text).split("\n")) {
        const l = { text: line, cls }; this.screen.push(l);
        if (this.onPrint) this.onPrint(l);
      }
      if (this.screen.length > 3000) this.screen.splice(0, this.screen.length - 3000);
    }
    emit(text) { if (this.capture) this.capture.push(text); else if (text !== "") this.print(text.replace(/\n$/, "")); }
    emitErr(text) { if (text !== "") this.print(text.replace(/\n$/, ""), "err"); }
    clearScreen() { this.screen.length = 0; if (this.onClear) this.onClear(); }
    capturing(fn) { const saved = this.capture; this.capture = []; let out; try { fn(); } finally { out = this.capture.join(""); this.capture = saved; } return out; }

    prompt() {
      const h = this.env.HOME;
      const d = this.cwd === h ? "~" : this.cwd === "/" ? "/" : this.cwd.slice(this.cwd.lastIndexOf("/") + 1);
      return `[${this.user}@${this.sys.hostname} ${d}]${this.user === "root" ? "#" : "$"}`;
    }

    // ---------- paths ----------
    abs(path) {
      let p = String(path);
      if (p === "~" || p.startsWith("~/")) p = this.env.HOME + p.slice(1);
      else if (/^~[A-Za-z_][\w-]*/.test(p)) { const m = /^~([\w-]+)(.*)$/.exec(p), u = this.sys.users[m[1]]; if (u) p = u.home + m[2]; }
      if (!p.startsWith("/")) p = this.cwd + "/" + p;
      const out = [];
      for (const s of p.split("/")) { if (!s || s === ".") continue; if (s === "..") out.pop(); else out.push(s); }
      return "/" + out.join("/");
    }
    get(path, follow = true, depth = 0) {
      if (depth > 10) return null;
      const parts = this.abs(path).split("/").filter(Boolean);
      let n = this.root, cur = "";
      const dirOf = c => c.slice(0, c.lastIndexOf("/")) || "/";
      for (let i = 0; i < parts.length; i++) {
        if (n.t === "l") n = this.linkTarget(n, dirOf(cur), depth);
        if (!n || n.t !== "d") return null;
        n = n.kids[parts[i]]; if (!n) return null;
        cur += "/" + parts[i];
      }
      if (follow && n && n.t === "l") n = this.linkTarget(n, dirOf(cur), depth);
      return n;
    }
    linkTarget(n, dir, depth) { return this.get(n.target.startsWith("/") ? n.target : dir + "/" + n.target, true, depth + 1); }
    split(path) { const a = this.abs(path), i = a.lastIndexOf("/"); return [a.slice(0, i) || "/", a.slice(i + 1)]; }
    parent(path) { const [d, name] = this.split(path); const p = this.get(d); return [p && p.t === "d" ? p : null, name]; }
    exists(path) { return !!this.get(path, false); }

    // ---------- permissions ----------
    can(n, bit, user = this.user) {
      if (user === "root") return bit !== 1 || n.t === "d" || (n.mode & 0o111) !== 0;
      const m = n.mode, acl = n.acl, mask = (m >> 3) & 7; let perm;
      if (n.owner === user) perm = (m >> 6) & 7;
      else if (acl && acl.users[user] != null) perm = acl.users[user] & mask;
      else {
        const ug = this.sys.groupsOf(user); let g = null;
        if (ug.includes(n.group)) g = acl ? (acl.groupObj & mask) : (m >> 3) & 7;
        if (acl) for (const [gn, gp] of Object.entries(acl.groups)) if (ug.includes(gn)) g = (g || 0) | (gp & mask);
        perm = g != null ? g : m & 7;
      }
      return (perm & bit) !== 0;
    }
    immutable(n) { return !!(n.attrs && n.attrs.i); }
    canRemove(parent, name) {
      const n = parent.kids[name];
      if (!n) return "No such file or directory";
      if (this.immutable(n) || this.immutable(parent)) return "Operation not permitted";
      if (this.user === "root") return null;
      if (!this.can(parent, 2) || !this.can(parent, 1)) return "Permission denied";
      if ((parent.mode & 0o1000) && n.owner !== this.user && parent.owner !== this.user) return "Operation not permitted";
      return null;
    }
    newNode(t, parent, mode) {
      const sgid = parent && (parent.mode & 0o2000);
      const base = mode != null ? mode : ((t === "d" ? 0o777 : 0o666) & ~this.umask);
      const n = V.node(t, { mode: base | (t === "d" && sgid ? 0o2000 : 0), owner: this.user, group: sgid ? parent.group : (this.sys.groupsOf(this.user)[0] || this.user) });
      n.mtime = n.atime = n.ctime = new Date();
      return n;
    }
    touch(n) { n.mtime = n.ctime = new Date(); }

    readFile(path) {
      const n = this.get(path);
      if (!n) return { err: `${path}: No such file or directory` };
      if (n.t === "d") return { err: `${path}: Is a directory` };
      if (n.t === "b" || n.t === "c") return { text: "", node: n };
      if (!this.can(n, 4)) return { err: `${path}: Permission denied` };
      return { text: V.text(n), node: n };
    }
    // returns an error string or null
    writeFile(path, text, append = false) {
      const [p, name] = this.parent(path);
      if (!p) return `${path}: No such file or directory`;
      if (!name) return `${path}: Is a directory`;
      const ex = this.get(path);
      if (ex) {
        if (ex.t === "d") return `${path}: Is a directory`;
        if (ex.t === "c" || ex.t === "b") return null;
        if (!this.can(ex, 2)) return `${path}: Permission denied`;
        if (ex.attrs && (ex.attrs.i || (ex.attrs.a && !append))) return `${path}: Operation not permitted`;
        const base = append ? V.text(ex) : ""; delete ex.gen; ex.content = base + text; this.touch(ex); return null;
      }
      if (!this.can(p, 2) || !this.can(p, 1)) return `${path}: Permission denied`;
      if (this.immutable(p)) return `${path}: Operation not permitted`;
      const f = this.newNode("f", p); f.content = text; p.kids[name] = f; this.touch(p);
      return null;
    }
    // text filters: [{name,text}] from file args, or stdin when none
    inputs(ctx, files) {
      if (!files.length) return [{ name: "-", text: ctx.stdin == null ? "" : ctx.stdin }];
      const res = [];
      for (const f of files) {
        if (f === "-") { res.push({ name: "-", text: ctx.stdin || "" }); continue; }
        const r = this.readFile(f);
        if (r.err) ctx.err(`${ctx.name}: ${r.err}`); else res.push({ name: f, text: r.text });
      }
      return res;
    }
    walk(path, cb, depth = 0) {
      const n = this.get(path, false); if (!n) return;
      const a = this.abs(path); cb(a, n, depth);
      if (n.t === "d") for (const k of Object.keys(n.kids).sort()) this.walk((a === "/" ? "" : a) + "/" + k, cb, depth + 1);
    }
    allPaths() {
      const out = [];
      const walk = (n, p) => { for (const [k, v] of Object.entries(n.kids)) { const q = (p === "/" ? "" : p) + "/" + k; out.push(q); if (v.t === "d" && q !== "/proc" && q !== "/sys") walk(v, q); } };
      walk(this.root, "/"); return out;
    }

    // ---------- users ----------
    switchUser(name, login) {
      this.userStack.push({ user: this.user, cwd: this.cwd, env: { ...this.env } });
      this.user = name; const u = this.sys.users[name];
      this.env.USER = this.env.LOGNAME = name; this.env.HOME = u.home;
      if (login) { this.cwd = u.home; this.env.PATH = "/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin"; }
    }
    popUser() { const s = this.userStack.pop(); if (!s) return false; this.user = s.user; this.cwd = s.cwd; this.env = s.env; return true; }

    // ---------- running ----------
    run(line) {
      this.print(`${this.prompt()} ${line}`, "cmd");
      if (!line.trim()) return;
      try { line = this.histExpand(line); } catch (e) { this.print("bash: " + e.message, "err"); return; }
      this.hist.push(line); this.hpos = this.hist.length; this.log.push(line);
      this.execTop(line);
      if (this.onRun && !this.quiet) this.onRun(line);
    }
    runSilent(line) { const q = this.quiet; this.quiet = true; try { this.execTop(line); } finally { this.quiet = q; } }
    execTop(line) {
      try { this.execLine(line); }
      catch (e) {
        if (e instanceof ShellError) { this.print("bash: " + e.message, "err"); this.status = 2; }
        else { this.print("bash: internal error: " + e.message, "err"); this.status = 1; if (window.console) console.error(e); }
      }
    }
    histExpand(line) {
      if (!line.includes("!")) return line;
      let changed = false;
      const out = line.replace(/(^|[\s;|&])!(!|-?\d+|[A-Za-z][^\s;|&]*)/g, (m, pre, ref) => {
        let h;
        if (ref === "!") h = this.hist[this.hist.length - 1];
        else if (/^-?\d+$/.test(ref)) { const n = +ref; h = n > 0 ? this.hist[n - 1] : this.hist[this.hist.length + n]; }
        else h = [...this.hist].reverse().find(x => x.startsWith(ref));
        if (h == null) throw new ShellError(`!${ref}: event not found`);
        changed = true; return pre + h;
      });
      if (changed) this.print(out, "dim");
      return out;
    }

    execLine(line) {
      if (++this.depth > 12) { this.depth--; throw new ShellError("maximum nesting level exceeded"); }
      try {
        const list = this.parse(this.tokenize(line));
        let prev = ";";
        for (const it of list) {
          const go = prev === ";" || prev === "&" || (prev === "&&" && this.status === 0) || (prev === "||" && this.status !== 0);
          if (go) { this.runPipeline(it.stages); if (it.next === "&") this.emit_job(); }
          prev = it.next;
        }
      } finally { this.depth--; }
    }
    emit_job() { if (!this.capture) this.print(`[1] ${++this.sys.nextPid}`, "dim"); }

    // ---------- tokenizer ----------
    matchParen(s, i) {
      let d = 0;
      for (; i < s.length; i++) {
        const c = s[i];
        if (c === "'") { const j = s.indexOf("'", i + 1); if (j < 0) break; i = j; }
        else if (c === '"') { i++; while (i < s.length && s[i] !== '"') { if (s[i] === "\\") i++; i++; } }
        else if (c === "(") d++;
        else if (c === ")") { d--; if (d === 0) return i; }
      }
      throw new ShellError("unexpected EOF while looking for matching `)'");
    }
    tokenize(line) {
      const toks = []; let segs = [], cur = "", has = false;
      const flush = () => { if (cur !== "") { segs.push({ t: cur, q: 0 }); cur = ""; } };
      const endWord = () => { flush(); if (has) toks.push({ k: "w", segs }); segs = []; has = false; };
      const op = v => toks.push({ k: "op", v });
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === "'") {
          flush(); const j = line.indexOf("'", i + 1);
          if (j < 0) throw new ShellError("unexpected EOF while looking for matching `''");
          segs.push({ t: line.slice(i + 1, j), q: 1 }); has = true; i = j; continue;
        }
        if (c === '"') {
          flush(); let j = i + 1, s = "";
          while (j < line.length && line[j] !== '"') {
            const d = line[j];
            if (d === "\\" && j + 1 < line.length && '"\\$`'.includes(line[j + 1])) { const e = line[j + 1]; s += e === "$" ? "\u0001" : e === "`" ? "\u0002" : e; j += 2; continue; }
            if (d === "$" && line[j + 1] === "(") { const e = this.matchParen(line, j + 1); s += line.slice(j, e + 1); j = e + 1; continue; }
            if (d === "`") { const e = line.indexOf("`", j + 1); if (e < 0) throw new ShellError("unexpected EOF while looking for matching ``'"); s += "$(" + line.slice(j + 1, e) + ")"; j = e + 1; continue; }
            s += d; j++;
          }
          if (j >= line.length) throw new ShellError("unexpected EOF while looking for matching `\"'");
          segs.push({ t: s, q: 2 }); has = true; i = j; continue;
        }
        if (c === "\\" && i + 1 < line.length) { flush(); segs.push({ t: line[i + 1], q: 1 }); has = true; i++; continue; }
        if (c === "$" && line[i + 1] === "(") { const e = this.matchParen(line, i + 1); cur += line.slice(i, e + 1); has = true; i = e; continue; }
        if (c === "`") { const e = line.indexOf("`", i + 1); if (e < 0) throw new ShellError("unexpected EOF while looking for matching ``'"); cur += "$(" + line.slice(i + 1, e) + ")"; has = true; i = e; continue; }
        if (c === " " || c === "\t") { endWord(); continue; }
        if (c === "#" && !has && cur === "") break;
        if (c === "|") { endWord(); if (line[i + 1] === "|") { op("||"); i++; } else op("|"); continue; }
        if (c === "&") {
          endWord();
          if (line[i + 1] === "&") { op("&&"); i++; } else if (line[i + 1] === ">") { op("&>"); i++; } else op("&");
          continue;
        }
        if (c === ";") { endWord(); op(";"); continue; }
        if (c === ">" || c === "<") {
          let fd = null;
          if ((cur === "1" || cur === "2") && !segs.length) { fd = cur; cur = ""; has = false; }
          endWord();
          if (c === "<") { op("<"); continue; }
          if (line[i + 1] === "&" && /\d/.test(line[i + 2] || "")) { op((fd || "1") + ">&" + line[i + 2]); i += 2; continue; }
          let o = ">"; if (line[i + 1] === ">") { o = ">>"; i++; }
          op((fd === "2" ? "2" : "") + o); continue;
        }
        cur += c; has = true;
      }
      endWord();
      return toks;
    }
    parse(toks) {
      const list = []; let stages = [], st = { words: [], redirs: [] }, pend = null;
      const stEmpty = () => !st.words.length && !st.redirs.length;
      const finish = next => {
        if (stEmpty() && !stages.length) { if (next !== ";" && next !== "&") throw new ShellError(`syntax error near unexpected token \`${next}'`); return; }
        if (stEmpty()) throw new ShellError(`syntax error near unexpected token \`${next}'`);
        stages.push(st); list.push({ stages, next }); stages = []; st = { words: [], redirs: [] };
      };
      for (const t of toks) {
        if (t.k === "w") { if (pend) { pend.target = t; st.redirs.push(pend); pend = null; } else st.words.push(t); continue; }
        if (pend) throw new ShellError(`syntax error near unexpected token \`${t.v}'`);
        if ([">", ">>", "<", "2>", "2>>", "&>"].includes(t.v)) pend = { op: t.v };
        else if (/^[12]>&[12]$/.test(t.v)) st.redirs.push({ op: t.v });
        else if (t.v === "|") { if (stEmpty()) throw new ShellError("syntax error near unexpected token `|'"); stages.push(st); st = { words: [], redirs: [] }; }
        else finish(t.v);
      }
      if (pend) throw new ShellError("syntax error near unexpected token `newline'");
      if (!stEmpty() || stages.length) { if (stEmpty()) throw new ShellError("syntax error: unexpected end of file"); stages.push(st); list.push({ stages, next: ";" }); }
      return list;
    }

    // ---------- expansion ----------
    tilde(t) {
      const m = /^~([\w-]*)(\/.*)?$/.exec(t); if (!m) return t;
      const rest = m[2] || "";
      if (m[1] === "") return this.env.HOME + rest;
      const u = this.sys.users[m[1]]; return u ? u.home + rest : t;
    }
    getVar(spec) {
      const d = /^(\w+):-(.*)$/.exec(spec);
      if (d) { const v = this.getVar(d[1]); return v !== "" ? v : d[2]; }
      if (spec === "?") return String(this.status);
      if (spec === "PWD") return this.cwd;
      if (spec === "OLDPWD") return this.oldcwd;
      if (spec === "UID" || spec === "EUID") return String((this.sys.users[this.user] || {}).uid ?? 0);
      if (spec === "RANDOM") return String(Math.floor(Math.random() * 32768));
      if (spec === "0") return "bash";
      if (/^\d$/.test(spec)) return this.argv[+spec - 1] ?? "";
      if (spec === "#") return String(this.argv.length);
      if (spec === "@" || spec === "*") return this.argv.join(" ");
      return this.vars[spec] ?? this.env[spec] ?? "";
    }
    subst(cmd) { return this.capturing(() => this.execLine(cmd)).replace(/\n+$/, ""); }
    expandText(s) {
      let out = "", expanded = false;
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === "$") {
          const n = s[i + 1];
          if (n === "(") { const e = this.matchParen(s, i + 1); out += this.subst(s.slice(i + 2, e)); i = e; expanded = true; continue; }
          if (n === "{") { const e = s.indexOf("}", i); if (e > 0) { out += this.getVar(s.slice(i + 2, e)); i = e; expanded = true; continue; } }
          if (n === "$") { out += "4242"; i++; expanded = true; continue; }
          if (n && /[?#@*0-9]/.test(n)) { out += this.getVar(n); i++; expanded = true; continue; }
          if (n && /[A-Za-z_]/.test(n)) { const m = /^[A-Za-z_]\w*/.exec(s.slice(i + 1)); out += this.getVar(m[0]); i += m[0].length; expanded = true; continue; }
        }
        out += c;
      }
      return { value: out.replace(/\u0001/g, "$").replace(/\u0002/g, "`"), expanded };
    }
    expandSimple(w) { return w.segs.map((sg, i) => sg.q === 1 ? sg.t : this.expandText(i === 0 && sg.q === 0 ? this.tilde(sg.t) : sg.t).value).join(""); }
    braces(s) {
      let depth = 0, start = -1;
      for (let i = 0; i < s.length; i++) {
        if (s[i] === "{") { if (depth === 0) start = i; depth++; }
        else if (s[i] === "}" && depth > 0) {
          depth--;
          if (depth === 0) {
            const body = s.slice(start + 1, i), pre = s.slice(0, start), post = s.slice(i + 1);
            const parts = []; let d = 0, last = 0;
            for (let j = 0; j < body.length; j++) {
              if (body[j] === "{") d++; else if (body[j] === "}") d--;
              else if (body[j] === "," && d === 0) { parts.push(body.slice(last, j)); last = j + 1; }
            }
            parts.push(body.slice(last));
            let items = null;
            if (parts.length > 1) items = parts;
            else {
              let m = /^(-?\d+)\.\.(-?\d+)$/.exec(body);
              if (m) { const a = +m[1], b = +m[2]; items = []; for (let x = a; a <= b ? x <= b : x >= b; x += a <= b ? 1 : -1) items.push(String(x)); }
              else if ((m = /^([a-zA-Z])\.\.([a-zA-Z])$/.exec(body))) { const a = m[1].charCodeAt(0), b = m[2].charCodeAt(0); items = []; for (let x = a; a <= b ? x <= b : x >= b; x += a <= b ? 1 : -1) items.push(String.fromCharCode(x)); }
            }
            if (!items) return [s];
            return items.flatMap(it => this.braces(pre + it + post));
          }
        }
      }
      return [s];
    }
    expandWords(words) {
      const out = [];
      for (const w of words) {
        const br = w.segs.length === 1 && w.segs[0].q === 0 && /\{[^{}]*,|\{[^{}]*\.\.[^{}]*\}/.test(w.segs[0].t) ? this.braces(w.segs[0].t) : null;
        const ws = br ? br.map(t => ({ segs: [{ t, q: 0 }] })) : [w];
        for (const x of ws) for (const f of this.expandWord(x)) out.push(f);
      }
      return out;
    }
    expandWord(w) {
      const fields = [{ t: "", p: "", g: false }];
      const cur = () => fields[fields.length - 1];
      const lit = s => { const f = cur(); f.t += s; f.p += s.replace(/[\\*?[\]]/g, "\\$&"); };
      w.segs.forEach((sg, idx) => {
        if (sg.q === 1) { lit(sg.t); return; }
        const text = idx === 0 && sg.q === 0 ? this.tilde(sg.t) : sg.t;
        const { value, expanded } = this.expandText(text);
        if (sg.q === 2) { lit(value); return; }
        if (expanded) {
          const parts = value.trim() === "" ? [] : value.trim().split(/\s+/);
          parts.forEach((pt, k) => {
            if (k > 0) fields.push({ t: "", p: "", g: false });
            const f = cur(); f.t += pt; f.p += pt; if (/[*?[]/.test(pt)) f.g = true;
          });
        } else { const f = cur(); f.t += value; f.p += value; if (/[*?[]/.test(value)) f.g = true; }
      });
      const unquoted = w.segs.every(s => s.q === 0), res = [];
      for (const f of fields) {
        if (f.t === "" && unquoted) continue;
        if (f.g) { const m = this.glob(f.p); if (m.length) { res.push(...m); continue; } }
        res.push(f.t);
      }
      return res;
    }
    glob(pat) {
      const hasGlob = s => /(^|[^\\])[*?[]/.test(s);
      const un = s => s.replace(/\\(.)/g, "$1");
      const re = seg => {
        let r = "";
        for (let i = 0; i < seg.length; i++) {
          const c = seg[i];
          if (c === "\\" && i + 1 < seg.length) { r += seg[++i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
          else if (c === "*") r += "[^/]*"; else if (c === "?") r += "[^/]";
          else if (c === "[") { const j = seg.indexOf("]", i + 2); if (j > 0) { let cls = seg.slice(i + 1, j); if (cls[0] === "!") cls = "^" + cls.slice(1); r += "[" + cls + "]"; i = j; } else r += "\\["; }
          else r += c.replace(/[.+^${}()|\\]/g, "\\$&");
        }
        return new RegExp("^" + r + "$");
      };
      const parts = pat.split("/"), isAbs = pat.startsWith("/");
      let bases = [isAbs ? "/" : ""];
      const join = (b, s) => b === "" ? s : b === "/" ? "/" + s : b + "/" + s;
      for (let i = isAbs ? 1 : 0; i < parts.length; i++) {
        const seg = parts[i]; if (seg === "") continue;
        const next = [];
        for (const b of bases) {
          if (!hasGlob(seg)) { next.push(join(b, un(seg))); continue; }
          const dir = this.get(b || "."); if (!dir || dir.t !== "d") continue;
          const rx = re(seg);
          for (const k of Object.keys(dir.kids).sort((a, c) => a.localeCompare(c))) if (rx.test(k) && (!k.startsWith(".") || seg.startsWith("."))) next.push(join(b, k));
        }
        bases = next;
      }
      return bases.filter(p => this.get(p, false));
    }

    // ---------- execution ----------
    runPipeline(stages) {
      let input = null, res = { o: "", status: 0 };
      for (let i = 0; i < stages.length; i++) { res = this.runStage(stages[i], input, i === stages.length - 1); input = res.o; }
      this.status = res.status;
    }
    isAssign(w) { return w.segs.length && w.segs[0].q === 0 && /^[A-Za-z_]\w*=/.test(w.segs[0].t); }
    runStage(st, stdin, last) {
      let words = st.words.slice();
      for (let n = 0; n < 5 && words.length && !this.isAssign(words[0]) && words[0].segs.length === 1 && words[0].segs[0].q === 0; n++) {
        const al = this.aliases[words[0].segs[0].t]; if (al == null) break;
        words = this.tokenize(al).filter(t => t.k === "w").concat(words.slice(1));
        if (words.length && words[0].segs.length === 1 && words[0].segs[0].t === al.split(/\s+/)[0] && n > 0) break;
      }
      const assigns = [];
      while (words.length && this.isAssign(words[0])) { const full = this.expandSimple(words.shift()), i = full.indexOf("="); assigns.push([full.slice(0, i), full.slice(i + 1)]); }
      const argv = this.expandWords(words);

      // redirections
      let stdout = null, stderr = null, e2o = false, o2e = false, inp = stdin;
      for (const r of st.redirs) {
        if (r.op === "2>&1") { e2o = true; continue; }
        if (r.op === "1>&2") { o2e = true; continue; }
        const file = this.expandSimple(r.target);
        if (r.op === "<") {
          const rd = this.readFile(file);
          if (rd.err) { this.emitErr(`bash: ${rd.err}\n`); return { o: "", status: 1 }; }
          inp = rd.text; continue;
        }
        const append = r.op.endsWith(">>");
        const err = this.writeFile(file, "", append);
        if (err) { this.emitErr(`bash: ${err}\n`); return { o: "", status: 1 }; }
        const dest = { file, append: true };
        if (r.op === "2>" || r.op === "2>>") stderr = dest;
        else if (r.op === "&>") { stdout = dest; stderr = dest; }
        else stdout = dest;
      }

      if (!argv.length) {
        for (const [k, v] of assigns) { if (k in this.env) this.env[k] = v; else this.vars[k] = v; }
        return { o: "", status: 0 };
      }
      const saved = {};
      for (const [k, v] of assigns) { saved[k] = this.env[k]; this.env[k] = v; }
      let ctx;
      try { ctx = this.invoke(argv, inp); }
      finally { for (const k of Object.keys(saved)) { if (saved[k] === undefined) delete this.env[k]; else this.env[k] = saved[k]; } }

      let o = ctx.o, e = ctx.e;
      if (e2o) { o += e; e = ""; }
      if (o2e) { e += o; o = ""; }
      const put = (dest, text) => { if (!text) return; const er = this.writeFile(dest.file, text, true); if (er) this.emitErr(`bash: ${er}\n`); };
      if (stderr) { put(stderr, e); e = ""; }
      if (stdout) { put(stdout, o); o = ""; }
      this.emitErr(e);
      if (last) { this.emit(o); o = ""; }
      return { o, status: ctx.status };
    }
    invoke(argv, stdin) {
      const name = argv[0], args = argv.slice(1);
      const ctx = {
        sh: this, name, args, stdin, o: "", e: "", status: 0,
        p(s = "") { this.o += s + "\n"; }, w(s) { this.o += s; },
        err(s) { this.e += s + "\n"; if (!this.status) this.status = 1; },
        fail(s, st = 1) { this.e += s + "\n"; this.status = st; },
        root(msg) { if (this.sh.user === "root") return true; this.fail(msg || `${this.name}: Permission denied`); return false; }
      };
      const c = !name.includes("/") && cmds[name];
      if (c) {
        this.used.add(name);
        const r = c.f(ctx);
        if (typeof r === "number") ctx.status = r;
      } else if (name.includes("/")) this.execPath(ctx, argv);
      else ctx.fail(`bash: ${name}: command not found`, 127);
      return ctx;
    }
    execPath(ctx, argv) {
      const path = argv[0], n = this.get(path);
      if (!n) return ctx.fail(`bash: ${path}: No such file or directory`, 127);
      if (n.t === "d") return ctx.fail(`bash: ${path}: Is a directory`, 126);
      if (!this.can(n, 1)) return ctx.fail(`bash: ${path}: Permission denied`, 126);
      this.runScript(ctx, n, argv.slice(1), path);
    }
    runScript(ctx, n, args, path) {
      const text = V.text(n);
      if (text.startsWith("\x7fELF")) {
        const base = this.abs(path).split("/").pop();
        if (cmds[base]) { const c2 = this.invoke([base, ...args], ctx.stdin); ctx.o += c2.o; ctx.e += c2.e; ctx.status = c2.status; }
        else ctx.fail(`bash: ${path}: cannot execute binary file`, 126);
        return;
      }
      const savedArgv = this.argv; this.argv = args;
      try { ctx.o += this.capturing(() => { for (const l of text.split("\n")) { if (l.trim() && !l.trim().startsWith("#")) this.execLine(l); } }); }
      finally { this.argv = savedArgv; }
      ctx.status = this.status;
    }

    // ---------- tab completion ----------
    complete(buf) {
      const m = /^([\s\S]*?)(\S*)$/.exec(buf), head = m[1], word = m[2];
      const first = !/\S/.test(head) || /[|;&]\s*$/.test(head);
      let cands = [];
      if (first && !word.includes("/")) cands = [...new Set([...Object.keys(cmds), ...Object.keys(this.aliases)])].filter(n => n.startsWith(word)).sort();
      else {
        const i = word.lastIndexOf("/"), dirPart = i >= 0 ? word.slice(0, i + 1) : "", base = word.slice(i + 1);
        const d = this.get(dirPart || ".");
        if (d && d.t === "d") cands = Object.keys(d.kids).filter(k => k.startsWith(base) && (base.startsWith(".") || !k.startsWith("."))).sort().map(k => dirPart + k + (d.kids[k].t === "d" ? "/" : ""));
      }
      return { head, word, cands };
    }
  }
  NOS.Shell = Shell;
})();
