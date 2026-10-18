/* Core commands: navigation, file management, links, shell builtins, users. */
(() => {
  const NOS = window.NOS, V = NOS.vfs, def = NOS.defCmd, po = NOS.parseOpts;

  def("pwd", "Print working directory", c => c.p(c.sh.cwd), { builtin: true });
  def("cd", "Change directory", c => {
    const sh = c.sh; let t = c.args[0];
    if (t === undefined || t === "~") t = sh.env.HOME;
    else if (t === "-") { t = sh.oldcwd; c.p(t); }
    const n = sh.get(t);
    if (!n) return c.fail(`bash: cd: ${t}: No such file or directory`);
    if (n.t !== "d") return c.fail(`bash: cd: ${t}: Not a directory`);
    if (!sh.can(n, 1)) return c.fail(`bash: cd: ${t}: Permission denied`);
    sh.oldcwd = sh.cwd; sh.cwd = sh.abs(t === "-" ? sh.oldcwd : t);
    // resolve symlinked directories to physical-looking paths is not needed; keep logical path
  }, { builtin: true });
  def("clear", "Clear the screen", c => c.sh.clearScreen(), { builtin: true });
  def("echo", "Display text", c => {
    let nl = true, esc = false, a = c.args.slice();
    while (a[0] && /^-[neE]+$/.test(a[0])) { if (a[0].includes("n")) nl = false; if (a[0].includes("e")) esc = true; a.shift(); }
    let s = a.join(" ");
    if (esc) s = s.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\\\/g, "\\");
    c.w(s + (nl ? "\n" : ""));
  }, { builtin: true });
  def("true", "Do nothing, successfully", () => 0, { builtin: true });
  def("false", "Do nothing, unsuccessfully", () => 1, { builtin: true });
  def(["exit", "logout"], "Leave the current shell or su session", c => { const sh = c.sh; if (!sh.popUser()) c.p("logout (close the browser tab to leave the simulator)"); }, { builtin: true });
  def("history", "Show command history", c => {
    const sh = c.sh;
    if (c.args[0] === "-c") { sh.hist.length = 0; return; }
    const n = /^\d+$/.test(c.args[0] || "") ? +c.args[0] : sh.hist.length;
    const start = Math.max(0, sh.hist.length - n);
    sh.hist.slice(start).forEach((h, i) => c.p(`${String(start + i + 1).padStart(5)}  ${h}`));
  }, { builtin: true });
  def("alias", "Define or list aliases", c => {
    const sh = c.sh;
    if (!c.args.length) { for (const [k, v] of Object.entries(sh.aliases)) c.p(`alias ${k}='${v}'`); return; }
    for (const a of c.args) {
      const i = a.indexOf("=");
      if (i < 0) { if (sh.aliases[a]) c.p(`alias ${a}='${sh.aliases[a]}'`); else c.err(`bash: alias: ${a}: not found`); }
      else sh.aliases[a.slice(0, i)] = a.slice(i + 1);
    }
  }, { builtin: true });
  def("unalias", "Remove aliases", c => { for (const a of c.args) { if (a === "-a") c.sh.aliases = {}; else if (!(a in c.sh.aliases)) c.err(`bash: unalias: ${a}: not found`); else delete c.sh.aliases[a]; } }, { builtin: true });
  def("export", "Export variables to the environment", c => {
    const sh = c.sh;
    if (!c.args.length || c.args[0] === "-p") { for (const k of Object.keys(sh.env).sort()) c.p(`declare -x ${k}="${sh.env[k]}"`); return; }
    for (const a of c.args) { const i = a.indexOf("="); if (i < 0) { if (a in sh.vars) { sh.env[a] = sh.vars[a]; delete sh.vars[a]; } } else { sh.env[a.slice(0, i)] = a.slice(i + 1); delete sh.vars[a.slice(0, i)]; } }
  }, { builtin: true });
  def("unset", "Remove variables", c => { for (const a of c.args) { delete c.sh.env[a]; delete c.sh.vars[a]; } }, { builtin: true });
  def("set", "List shell variables", c => { for (const [k, v] of Object.entries({ ...c.sh.env, ...c.sh.vars })) c.p(`${k}=${v}`); }, { builtin: true });
  def(["env", "printenv"], "Print the environment", c => {
    const sh = c.sh;
    if (c.name === "printenv" && c.args.length) { const v = sh.env[c.args[0]]; if (v == null) return 1; c.p(v); return; }
    for (const [k, v] of Object.entries(sh.env)) c.p(`${k}=${v}`);
  });
  def("source", "Run a script in the current shell", c => {
    const f = c.sh.readFile(c.args[0] || ""); if (f.err) return c.fail("bash: " + c.name + ": " + f.err);
    for (const l of f.text.split("\n")) if (l.trim() && !l.trim().startsWith("#")) c.sh.execLine(l);
  }, { builtin: true });
  NOS.shellCommands["."] = NOS.shellCommands.source;
  def("umask", "Show or set the file creation mask", c => {
    const sh = c.sh, a = c.args.filter(x => x !== "-S");
    if (!a.length) { if (c.args.includes("-S")) { const p = b => V.permStr(7 & ~b); c.p(`u=${p(sh.umask >> 6)},g=${p((sh.umask >> 3) & 7)},o=${p(sh.umask & 7)}`.replace(/-/g, "")); } else c.p(String(sh.umask.toString(8)).padStart(4, "0")); return; }
    if (!/^[0-7]{1,4}$/.test(a[0])) return c.fail(`bash: umask: ${a[0]}: octal number out of range`);
    sh.umask = parseInt(a[0], 8);
  }, { builtin: true });
  def("type", "Describe how a name is interpreted", c => {
    for (const n of c.args) {
      if (c.sh.aliases[n]) c.p(`${n} is aliased to \`${c.sh.aliases[n]}'`);
      else if (NOS.shellCommands[n] && NOS.shellCommands[n].builtin) c.p(`${n} is a shell builtin`);
      else if (NOS.shellCommands[n]) c.p(`${n} is ${NOS.shellCommands[n].sbin ? "/usr/sbin" : "/usr/bin"}/${n}`);
      else c.err(`bash: type: ${n}: not found`);
    }
  }, { builtin: true });
  def("which", "Locate a command on the PATH", c => {
    for (const n of c.args) { const x = NOS.shellCommands[n]; if (x && !x.builtin) c.p(`${x.sbin ? "/usr/sbin" : "/usr/bin"}/${n}`); else if (!x) c.err(`/usr/bin/which: no ${n} in (${c.sh.env.PATH})`); }
  });
  def("whereis", "Locate binary and man page", c => {
    for (const n of c.args) { const x = NOS.shellCommands[n]; c.p(`${n}:${x && !x.builtin ? ` ${x.sbin ? "/usr/sbin" : "/usr/bin"}/${n} /usr/share/man/man1/${n}.1.gz` : ""}`); }
  });

  // ---------- listing ----------
  const owner = (n, numeric) => numeric ? String((window.NOS.curSys.users[n.owner] || { uid: 0 }).uid) : n.owner;
  def("ls", "List directory contents", c => {
    const sh = c.sh; NOS.curSys = sh.sys;
    const { f, rest } = po(c.args);
    const showAll = f.a || f.A, long = f.l || f.n || f.i && false;
    const targets = rest.length ? rest : ["."];
    const fmtLong = (name, n) => {
      const sz = f.h ? V.humanBytes(V.size(n)) : (n.t === "b" || n.t === "c") ? `${n.major}, ${n.minor}` : V.size(n);
      return `${f.i ? n.ino + " " : ""}${V.modeStr(n)} ${String(n.links).padStart(2)} ${owner(n, f.n).padEnd(8)} ${(f.n ? String((sh.sys.groups[n.group] || { gid: 0 }).gid) : n.group).padEnd(8)} ${String(sz).padStart(6)} ${V.fmtDate(n.mtime)} ${name}${n.t === "l" ? " -> " + n.target : ""}`;
    };
    const suffix = n => f.F ? (n.t === "d" ? "/" : n.t === "l" ? "@" : (n.mode & 0o111) && n.t === "f" ? "*" : "") : "";
    const out = (entries) => {
      let es = entries;
      if (f.S) es = es.slice().sort((a, b) => V.size(b[1]) - V.size(a[1]));
      else if (f.t) es = es.slice().sort((a, b) => b[1].mtime - a[1].mtime);
      if (f.r) es = es.slice().reverse();
      if (long) c.p(`total ${Math.ceil(es.reduce((a, [, n]) => a + (V.size(n) || 0), 0) / 1024) * 1 || 0}`);
      if (long) es.forEach(([k, n]) => c.p(fmtLong(k + suffix(n), n)));
      else if (f[1]) es.forEach(([k, n]) => c.p(k + suffix(n)));
      else if (es.length) c.p(es.map(([k, n]) => (f.i ? n.ino + " " : "") + k + suffix(n)).join("  "));
    };
    const list = (path, header, depth = 0) => {
      const n = sh.get(path, !f.d && !long);
      if (!n) { c.err(`ls: cannot access '${path}': No such file or directory`); return; }
      if (n.t !== "d" || f.d) { out([[path, n]]); return; }
      if (!sh.can(n, 4)) { c.err(`ls: cannot open directory '${path}': Permission denied`); return; }
      if (header) c.p(`${path}:`);
      let es = Object.entries(n.kids).filter(([k]) => showAll || !k.startsWith("."));
      es.sort((a, b) => a[0].localeCompare(b[0], "en", { sensitivity: "base" }));
      if (f.a) es = [[".", n], ["..", n], ...es];
      out(es);
      if (f.R) for (const [k, v] of es) if (v.t === "d" && k !== "." && k !== "..") { c.p(""); list((path === "/" ? "" : path) + "/" + k, true); }
    };
    targets.forEach((t, i) => { if (i > 0 && !f.R) c.p(""); list(t, targets.length > 1 || f.R); });
  });
  NOS.shellCommands.dir = NOS.shellCommands.ls;

  def("tree", "Display the directory tree", c => {
    const sh = c.sh, { f, rest } = po(c.args, { val: "L" }), start = rest[0] || ".", n = sh.get(start);
    if (!n) return c.fail(`${start} [error opening dir]`);
    let dirs = 0, files = 0; const max = f.L ? +f.L : 99;
    const walk = (node, prefix, depth) => {
      const ks = Object.keys(node.kids).filter(k => f.a || !k.startsWith(".")).sort();
      ks.forEach((k, i) => {
        const ch = node.kids[k], last = i === ks.length - 1;
        c.p(prefix + (last ? "└── " : "├── ") + k + (ch.t === "l" ? " -> " + ch.target : ""));
        if (ch.t === "d") { dirs++; if (depth < max) walk(ch, prefix + (last ? "    " : "│   "), depth + 1); } else files++;
      });
    };
    c.p(start === "." ? "." : start);
    if (n.t === "d") walk(n, "", 1);
    c.p(`\n${dirs} directories, ${files} files`);
  });

  // ---------- create / remove ----------
  def("mkdir", "Make directories", c => {
    const sh = c.sh, { f, v, rest } = po(c.args, { val: "m" });
    if (!rest.length) return c.fail("mkdir: missing operand");
    for (const t of rest) {
      const parts = sh.abs(t).split("/").filter(Boolean); let cur = "";
      for (let i = 0; i < parts.length; i++) {
        cur += "/" + parts[i]; const last = i === parts.length - 1, ex = sh.get(cur);
        if (ex) { if (last && !f.p) { c.err(`mkdir: cannot create directory '${t}': File exists`); } continue; }
        if (!last && !f.p) { c.err(`mkdir: cannot create directory '${t}': No such file or directory`); break; }
        const [p, name] = sh.parent(cur);
        if (!p || !sh.can(p, 2) || !sh.can(p, 1)) { c.err(`mkdir: cannot create directory '${t}': Permission denied`); break; }
        const mode = v.m && /^[0-7]+$/.test(v.m) ? parseInt(v.m, 8) : null;
        p.kids[name] = sh.newNode("d", p, mode); p.links++; sh.touch(p);
        if (f.v) c.p(`mkdir: created directory '${cur}'`);
      }
    }
  });
  def("rmdir", "Remove empty directories", c => {
    const sh = c.sh;
    for (const t of c.args.filter(a => !a.startsWith("-"))) {
      const n = sh.get(t, false); if (!n) { c.err(`rmdir: failed to remove '${t}': No such file or directory`); continue; }
      if (n.t !== "d") { c.err(`rmdir: failed to remove '${t}': Not a directory`); continue; }
      if (Object.keys(n.kids).length) { c.err(`rmdir: failed to remove '${t}': Directory not empty`); continue; }
      const [p, name] = sh.parent(t), e = sh.canRemove(p, name);
      if (e) { c.err(`rmdir: failed to remove '${t}': ${e}`); continue; }
      delete p.kids[name]; p.links--; sh.touch(p);
    }
  });
  def("touch", "Create files or update timestamps", c => {
    const sh = c.sh, { rest } = po(c.args, { val: "dtr" });
    if (!rest.length) return c.fail("touch: missing file operand");
    for (const t of rest) {
      const n = sh.get(t);
      if (n) { if (!sh.can(n, 2) && sh.user !== "root") c.err(`touch: cannot touch '${t}': Permission denied`); else if (sh.immutable(n)) c.err(`touch: cannot touch '${t}': Operation not permitted`); else sh.touch(n); continue; }
      const [p, name] = sh.parent(t);
      if (!p) { c.err(`touch: cannot touch '${t}': No such file or directory`); continue; }
      if (!sh.can(p, 2) || !sh.can(p, 1)) { c.err(`touch: cannot touch '${t}': Permission denied`); continue; }
      p.kids[name] = sh.newNode("f", p); sh.touch(p);
    }
  });
  const copyTree = (c, src, dst, f, srcNode) => {
    const sh = c.sh;
    if (srcNode.t === "d" && !f.r && !f.R && !f.a) { c.err(`cp: -r not specified; omitting directory '${src}'`); return; }
    const [p, name] = sh.parent(dst);
    if (!p || !sh.can(p, 2) || !sh.can(p, 1)) { c.err(`cp: cannot create regular file '${dst}': ${p ? "Permission denied" : "No such file or directory"}`); return; }
    if (srcNode.t !== "d" && !sh.can(srcNode, 4)) { c.err(`cp: cannot open '${src}' for reading: Permission denied`); return; }
    const ex = p.kids[name];
    if (ex && sh.immutable(ex)) { c.err(`cp: cannot create regular file '${dst}': Operation not permitted`); return; }
    const k = V.clone(srcNode);
    if (!f.p && !f.a) { k.owner = sh.user; k.group = sh.sys.groupsOf(sh.user)[0]; k.mtime = k.ctime = new Date(); k.mode = srcNode.t === "d" ? srcNode.mode : srcNode.mode & ~sh.umask & 0o777; if (srcNode.t === "f") k.mode = srcNode.mode & ~sh.umask & 0o7777 & ~0o7000; }
    p.kids[name] = k; sh.touch(p);
    if (f.v) c.p(`'${src}' -> '${dst}'`);
  };
  def("cp", "Copy files and directories", c => {
    const sh = c.sh, { f, rest } = po(c.args);
    if (rest.length < 2) return c.fail(rest.length ? `cp: missing destination file operand after '${rest[0]}'` : "cp: missing file operand");
    const dst = rest.pop(), dn = sh.get(dst), toDir = dn && dn.t === "d";
    if (rest.length > 1 && !toDir) return c.fail(`cp: target '${dst}' is not a directory`);
    for (const s of rest) {
      const n = sh.get(s, false);
      if (!n) { c.err(`cp: cannot stat '${s}': No such file or directory`); continue; }
      const target = toDir ? sh.abs(dst) + "/" + sh.split(s)[1] : dst;
      if (sh.get(target, false) === n && n.t !== "d") { c.err(`cp: '${s}' and '${target}' are the same file`); continue; }
      copyTree(c, s, target, f, n);
    }
  });
  def("mv", "Move or rename files", c => {
    const sh = c.sh, { rest } = po(c.args);
    if (rest.length < 2) return c.fail(rest.length ? `mv: missing destination file operand after '${rest[0]}'` : "mv: missing file operand");
    const dst = rest.pop(), dn = sh.get(dst), toDir = dn && dn.t === "d";
    if (rest.length > 1 && !toDir) return c.fail(`mv: target '${dst}' is not a directory`);
    for (const s of rest) {
      const n = sh.get(s, false);
      if (!n) { c.err(`mv: cannot stat '${s}': No such file or directory`); continue; }
      const [sp, sname] = sh.parent(s), e = sh.canRemove(sp, sname);
      if (e) { c.err(`mv: cannot move '${s}': ${e}`); continue; }
      const target = toDir ? sh.abs(dst) + "/" + sname : dst, [dp, dname] = sh.parent(target);
      if (!dp || !sh.can(dp, 2) || !sh.can(dp, 1)) { c.err(`mv: cannot move '${s}' to '${target}': ${dp ? "Permission denied" : "No such file or directory"}`); continue; }
      if (sh.abs(target).startsWith(sh.abs(s) + "/")) { c.err(`mv: cannot move '${s}' to a subdirectory of itself`); continue; }
      delete sp.kids[sname]; dp.kids[dname] = n; sh.touch(sp); sh.touch(dp); n.ctime = new Date();
      if (n.t === "d" && sp !== dp) { sp.links--; dp.links++; }
    }
  });
  const rmTree = (sh, c, path, f) => {
    const n = sh.get(path, false);
    if (!n) { if (!f.f) c.err(`rm: cannot remove '${path}': No such file or directory`); return; }
    if (n.t === "d" && !f.r && !f.R) { c.err(`rm: cannot remove '${path}': Is a directory`); return; }
    const [p, name] = sh.parent(path), e = sh.canRemove(p, name);
    if (e) { c.err(`rm: cannot remove '${path}': ${e}`); return; }
    if (n.t === "d") { for (const k of Object.keys(n.kids)) rmTree(sh, c, sh.abs(path) + "/" + k, f); if (Object.keys(n.kids).length) return; p.links--; }
    delete p.kids[name]; if (n.t !== "d") n.links--; sh.touch(p);
    if (f.v) c.p(`removed '${path}'`);
  };
  def("rm", "Remove files and directories", c => {
    const sh = c.sh, { f, rest } = po(c.args);
    if (!rest.length) return c.fail("rm: missing operand");
    for (const t of rest) {
      if (sh.abs(t) === "/" ) { c.err("rm: it is dangerous to operate recursively on '/'"); continue; }
      rmTree(sh, c, t, f);
    }
  });
  def("ln", "Create hard or symbolic links", c => {
    const sh = c.sh, { f, rest } = po(c.args);
    if (rest.length < 1) return c.fail("ln: missing file operand");
    const src = rest[0]; let dst = rest[1] || sh.split(src)[1];
    const dn = sh.get(dst); if (dn && dn.t === "d") dst = sh.abs(dst) + "/" + sh.split(src)[1];
    const [p, name] = sh.parent(dst);
    if (!p) return c.fail(`ln: failed to create ${f.s ? "symbolic" : "hard"} link '${dst}': No such file or directory`);
    if (p.kids[name]) return c.fail(`ln: failed to create ${f.s ? "symbolic" : "hard"} link '${dst}': File exists`);
    if (!sh.can(p, 2) || !sh.can(p, 1)) return c.fail(`ln: failed to create ${f.s ? "symbolic" : "hard"} link '${dst}': Permission denied`);
    if (f.s) { const l = sh.newNode("l", p, 0o777); l.target = src; p.kids[name] = l; }
    else {
      const n = sh.get(src, false);
      if (!n) return c.fail(`ln: failed to access '${src}': No such file or directory`);
      if (n.t === "d") return c.fail(`ln: ${src}: hard link not allowed for directory`);
      n.links++; p.kids[name] = n; n.ctime = new Date();
    }
    sh.touch(p);
  });
  def("readlink", "Print the target of a symbolic link", c => {
    const { f, rest } = po(c.args), sh = c.sh;
    for (const t of rest) { const n = sh.get(t, false); if (!n) return 1; if (n.t === "l") c.p(f.f ? sh.abs(sh.linkTarget(n, sh.split(t)[0], 0) ? sh.abs(n.target.startsWith("/") ? n.target : sh.split(t)[0] + "/" + n.target) : n.target) : n.target); else if (f.f) c.p(sh.abs(t)); else return 1; }
  });
  def("basename", "Strip directory from a path", c => { let b = (c.args[0] || "").replace(/\/+$/, "").split("/").pop(); if (c.args[1] && b.endsWith(c.args[1])) b = b.slice(0, -c.args[1].length); c.p(b); });
  def("dirname", "Strip the last component from a path", c => { const p = (c.args[0] || "").replace(/\/+$/, ""); const i = p.lastIndexOf("/"); c.p(i < 0 ? "." : i === 0 ? "/" : p.slice(0, i)); });
  def("realpath", "Print the resolved absolute path", c => { for (const t of c.args.filter(a => !a.startsWith("-"))) { const n = c.sh.get(t); if (!n) c.err(`realpath: ${t}: No such file or directory`); else c.p(c.sh.abs(t)); } });
  def("sleep", "Delay (instant in the simulator)", () => 0);
  def("date", "Print the date and time", c => { const d = new Date(); c.p(c.args[0] && c.args[0].startsWith("+") ? c.args[0].slice(1).replace(/%Y/g, d.getFullYear()).replace(/%m/g, String(d.getMonth() + 1).padStart(2, "0")).replace(/%d/g, String(d.getDate()).padStart(2, "0")).replace(/%H/g, String(d.getHours()).padStart(2, "0")).replace(/%M/g, String(d.getMinutes()).padStart(2, "0")).replace(/%S/g, String(d.getSeconds()).padStart(2, "0")) : d.toString().replace(/ GMT.*$/, "") + " EST"); });
  def("cal", "Show a calendar", c => { const d = new Date(), m = d.toLocaleString("en", { month: "long" }); c.p(`   ${m} ${d.getFullYear()}`); c.p("Su Mo Tu We Th Fr Sa"); const first = new Date(d.getFullYear(), d.getMonth(), 1).getDay(), days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); let l = "   ".repeat(first); for (let i = 1; i <= days; i++) { l += String(i).padStart(2) + " "; if ((first + i) % 7 === 0) { c.p(l.trimEnd()); l = ""; } } if (l) c.p(l.trimEnd()); });

  // ---------- users & privilege ----------
  def("whoami", "Print the effective user name", c => c.p(c.sh.user));
  def("id", "Print user and group IDs", c => {
    const sh = c.sh, u = c.args[0] || sh.user, p = sh.sys.users[u];
    if (!p) return c.fail(`id: '${u}': no such user`);
    const gs = sh.sys.groupsOf(u), gn = Object.entries(sh.sys.groups).find(([, g]) => g.gid === p.gid);
    c.p(`uid=${p.uid}(${u}) gid=${p.gid}(${gn ? gn[0] : p.gid}) groups=${gs.map(g => `${sh.sys.groups[g].gid}(${g})`).join(",")}`);
  });
  def("groups", "Print group memberships", c => c.p(c.sh.sys.groupsOf(c.args[0] || c.sh.user).join(" ")));
  def("who", "Show who is logged on", c => c.p(`${c.sh.user}   pts/0        ${V.fmtFull(new Date()).slice(0, 16)} (192.168.1.50)`));
  def("w", "Show who is logged on and what they are doing", c => { c.p(" 09:41:02 up 3:00,  1 user,  load average: 0.00, 0.01, 0.05"); c.p("USER     TTY      FROM             LOGIN@   IDLE   WHAT"); c.p(`${c.sh.user.padEnd(8)} pts/0    192.168.1.50     09:30    0.00s  w`); });
  def("last", "Show recent logins", c => { c.p(`${c.sh.user}   pts/0        192.168.1.50     Mon Sep  2 09:30   still logged in`); c.p("reboot   system boot  5.15.16         Mon Sep  2 06:41   still running"); c.p("\nwtmp begins Mon Sep  2 06:41:00 2024"); });
  def("hostname", "Show the system host name", c => {
    if (c.args[0] && !c.args[0].startsWith("-")) { if (!c.root("hostname: you must be root to change the host name")) return; c.sh.sys.hostname = c.args[0]; return; }
    c.p(c.sh.sys.hostname);
  });
  def("su", "Switch user", c => {
    const sh = c.sh, { f, rest } = po(c.args), login = f.l || rest[0] === "-" || c.args[0] === "-"; const t = rest.filter(x => x !== "-")[0] || "root";
    if (!sh.sys.users[t]) return c.fail(`su: user ${t} does not exist`);
    if (sh.user !== "root") c.p("Password: (simulated, accepted)");
    sh.switchUser(t, login);
  });
  def("sudo", "Run a command as another user (root)", c => {
    const sh = c.sh; let a = c.args.slice(), as = "root";
    while (a[0] && a[0].startsWith("-")) { if (a[0] === "-u") { as = a[1]; a = a.slice(2); } else if (a[0] === "-i" || a[0] === "-s") { sh.switchUser(as, true); return; } else a.shift(); }
    if (!a.length) return c.fail("usage: sudo [-u user] command");
    if (!sh.sys.users[as]) return c.fail(`sudo: unknown user ${as}`);
    if (sh.user !== "root" && !sh.sys.groups.wheel.members.includes(sh.user)) return c.fail(`${sh.user} is not in the sudoers file. This incident will be reported.`);
    const prev = sh.user, depth = sh.userStack.length; sh.user = as;
    try { const r = sh.invoke(a, c.stdin); c.o += r.o; c.e += r.e; c.status = r.status; }
    finally {
      if (sh.userStack.length === depth) sh.user = prev;
      else sh.userStack[depth].user = prev;
    }
  });
  def("passwd", "Change a password (simulated)", c => {
    const sh = c.sh, t = c.args.find(a => !a.startsWith("-")) || sh.user;
    if (t !== sh.user && sh.user !== "root") return c.fail("passwd: You may not view or modify password information for " + t + ".");
    if (!sh.sys.users[t]) return c.fail(`passwd: user '${t}' does not exist`);
    c.p(`Changing password for user ${t}.`); c.p("passwd: all authentication tokens updated successfully.");
  }, { sbin: false });
  const isRoot = (c, n) => c.root(`${n}: Permission denied.`);
  def("useradd", "Create a user account", c => {
    const sh = c.sh; if (!c.root("useradd: Permission denied.")) return;
    const { f, v, rest } = po(c.args, { val: "dgGsucU".replace("U", "") });
    const name = rest[0]; if (!name) return c.fail("Usage: useradd [options] LOGIN");
    if (sh.sys.users[name]) return c.fail(`useradd: user '${name}' already exists`);
    const uid = Math.max(999, ...Object.values(sh.sys.users).map(u => u.uid)) + 1;
    let gid = uid; if (v.g && sh.sys.groups[v.g]) gid = sh.sys.groups[v.g].gid; else sh.sys.groups[name] = { gid, members: [] };
    const home = v.d || "/home/" + name;
    sh.sys.users[name] = { uid, gid, home, shell: v.s || "/bin/bash", gecos: v.c || "" };
    if (v.G) for (const g of v.G.split(",")) if (sh.sys.groups[g]) sh.sys.groups[g].members.push(name);
    if (!f.M) {
      const root = sh.root; const hp = sh.parent(home);
      if (hp[0]) { const d = V.node("d", { owner: name, group: v.g || name, mode: 0o700 }); hp[0].kids[hp[1]] = d; for (const sk of [".bashrc", ".bash_profile", ".bash_logout"]) d.kids[sk] = V.node("f", { owner: name, group: v.g || name, content: sh.get("/home/student/" + sk) ? V.text(sh.get("/home/student/" + sk)) : "" }); }
    }
  }, { sbin: true });
  def("userdel", "Delete a user account", c => {
    const sh = c.sh; if (!c.root("userdel: Permission denied.")) return;
    const { f, rest } = po(c.args), n = rest[0], u = sh.sys.users[n];
    if (!u) return c.fail(`userdel: user '${n}' does not exist`);
    delete sh.sys.users[n]; for (const g of Object.values(sh.sys.groups)) g.members = g.members.filter(m => m !== n);
    if (sh.sys.groups[n] && sh.sys.groups[n].gid === u.gid) delete sh.sys.groups[n];
    if (f.r) { const hp = sh.parent(u.home); if (hp[0]) delete hp[0].kids[hp[1]]; }
  }, { sbin: true });
  def("usermod", "Modify a user account", c => {
    const sh = c.sh; if (!c.root("usermod: Permission denied.")) return;
    const { f, v, rest } = po(c.args, { val: "Gsdgcl" }), u = sh.sys.users[rest[0]];
    if (!u) return c.fail(`usermod: user '${rest[0]}' does not exist`);
    if (v.G) { if (!f.a) for (const g of Object.values(sh.sys.groups)) g.members = g.members.filter(m => m !== rest[0]); for (const g of v.G.split(",")) { if (!sh.sys.groups[g]) return c.fail(`usermod: group '${g}' does not exist`); if (!sh.sys.groups[g].members.includes(rest[0])) sh.sys.groups[g].members.push(rest[0]); } }
    if (v.s) u.shell = v.s; if (v.d) u.home = v.d; if (v.c) u.gecos = v.c; if (v.g && sh.sys.groups[v.g]) u.gid = sh.sys.groups[v.g].gid;
  }, { sbin: true });
  def("groupadd", "Create a group", c => {
    const sh = c.sh; if (!c.root("groupadd: Permission denied.")) return;
    const { v, rest } = po(c.args, { val: "g" }); const n = rest[0];
    if (sh.sys.groups[n]) return c.fail(`groupadd: group '${n}' already exists`);
    sh.sys.groups[n] = { gid: v.g ? +v.g : Math.max(999, ...Object.values(sh.sys.groups).map(g => g.gid)) + 1, members: [] };
  }, { sbin: true });
  def("groupdel", "Delete a group", c => { const sh = c.sh; if (!c.root("groupdel: Permission denied.")) return; if (!sh.sys.groups[c.args[0]]) return c.fail(`groupdel: group '${c.args[0]}' does not exist`); delete sh.sys.groups[c.args[0]]; }, { sbin: true });
  def("chsh", "Change login shell", c => { const { v } = po(c.args, { val: "s" }); const u = c.sh.sys.users[c.sh.user]; if (v.s) u.shell = v.s; });
})();
