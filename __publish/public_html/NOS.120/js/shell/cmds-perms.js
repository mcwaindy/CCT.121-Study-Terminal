/* Permission commands: chmod, chown, chgrp, ACLs, attributes. */
(() => {
  const NOS = window.NOS, V = NOS.vfs, def = NOS.defCmd, po = NOS.parseOpts;

  const applySym = (mode, spec, isDir, umask) => {
    for (const clause of spec.split(",")) {
      const m = /^([ugoa]*)([-+=])([rwxXst]*|[ugo])$/.exec(clause); if (!m) return null;
      let who = m[1] || "a", op = m[2], perms = m[3]; const w = who.includes("a") ? "ugo" : who;
      let bits = 0;
      if (/^[ugo]$/.test(perms)) { const src = perms === "u" ? (mode >> 6) & 7 : perms === "g" ? (mode >> 3) & 7 : mode & 7; for (const t of w) bits |= src << (t === "u" ? 6 : t === "g" ? 3 : 0); }
      else {
        const pb = (/r/.test(perms) ? 4 : 0) | (/w/.test(perms) ? 2 : 0) | (/x/.test(perms) || (/X/.test(perms) && (isDir || (mode & 0o111))) ? 1 : 0);
        for (const t of w) bits |= pb << (t === "u" ? 6 : t === "g" ? 3 : 0);
        if (/s/.test(perms)) { if (w.includes("u")) bits |= 0o4000; if (w.includes("g")) bits |= 0o2000; }
        if (/t/.test(perms)) bits |= 0o1000;
      }
      let clear = 0; for (const t of w) clear |= 7 << (t === "u" ? 6 : t === "g" ? 3 : 0);
      if (op === "+") mode |= bits; else if (op === "-") mode &= ~bits; else { mode &= ~(clear | (w.includes("u") ? 0o4000 : 0) | (w.includes("g") ? 0o2000 : 0)); mode |= bits; }
    }
    return mode;
  };

  def("chmod", "Change file permissions", c => {
    const sh = c.sh, { f, rest } = po(c.args.filter(a => !/^-[rwxst]/.test(a) || /^-[RcvfR]+$/.test(a)).length === c.args.length ? c.args : c.args.map(a => a)); // symbolic like -x handled below
    const args = c.args.slice(), opts = {}; while (args[0] && /^-[Rvcf]+$/.test(args[0])) for (const ch of args.shift().slice(1)) opts[ch] = true;
    if (args.length < 2) return c.fail(args.length ? `chmod: missing operand after '${args[0]}'` : "chmod: missing operand");
    const spec = args.shift();
    if (!/^[0-7]{1,4}$/.test(spec) && !/^([ugoa]*[-+=]([rwxXst]*|[ugo]),?)+$/.test(spec)) return c.fail(`chmod: invalid mode: '${spec}'`);
    for (const t of args) {
      const doOne = (p, n) => {
        if (sh.user !== "root" && n.owner !== sh.user) { c.err(`chmod: changing permissions of '${p}': Operation not permitted`); return; }
        if (sh.immutable(n)) { c.err(`chmod: changing permissions of '${p}': Operation not permitted`); return; }
        const old = n.mode & 0o7777;
        n.mode = /^[0-7]+$/.test(spec) ? parseInt(spec, 8) : applySym(old, spec, n.t === "d", sh.umask);
        if (n.t !== "d" && !/^[0-7]+$/.test(spec) && false) n.mode = old;
        n.ctime = new Date();
        if (opts.v) c.p(`mode of '${p}' changed from ${old.toString(8).padStart(4, "0")} (${V.modeStr({ t: n.t, mode: old }).slice(1)}) to ${n.mode.toString(8).padStart(4, "0")} (${V.modeStr(n).slice(1)})`);
      };
      const n = sh.get(t); if (!n) { c.err(`chmod: cannot access '${t}': No such file or directory`); continue; }
      if (opts.R) sh.walk(t, (p, nn) => doOne(p, nn)); else doOne(t, n);
    }
  });

  const resolveOwner = (sh, spec, c) => {
    const [u, g] = spec.split(/[:.]/); let owner = null, group = null;
    if (u) { if (sh.sys.users[u]) owner = u; else { const x = Object.entries(sh.sys.users).find(([, p]) => String(p.uid) === u); if (x) owner = x[0]; else { c.err(`chown: invalid user: '${spec}'`); return null; } } }
    if (g) { if (sh.sys.groups[g]) group = g; else { const x = Object.entries(sh.sys.groups).find(([, p]) => String(p.gid) === g); if (x) group = x[0]; else { c.err(`chown: invalid group: '${spec}'`); return null; } } }
    return { owner, group };
  };
  def("chown", "Change file owner and group", c => {
    const sh = c.sh, { f, rest } = po(c.args); if (rest.length < 2) return c.fail("chown: missing operand");
    if (!c.root(`chown: changing ownership of '${rest[1]}': Operation not permitted`)) return;
    const o = resolveOwner(sh, rest.shift(), c); if (!o) return 1;
    for (const t of rest) { const n = sh.get(t, !f.h); if (!n) { c.err(`chown: cannot access '${t}': No such file or directory`); continue; } const ap = x => { if (o.owner) x.owner = o.owner; if (o.group) x.group = o.group; if (x.t === "f") x.mode &= ~0o6000; x.ctime = new Date(); }; if (f.R) sh.walk(t, (p, x) => ap(x)); else ap(n); }
  });
  def("chgrp", "Change group ownership", c => {
    const sh = c.sh, { f, rest } = po(c.args); if (rest.length < 2) return c.fail("chgrp: missing operand");
    const g = rest.shift(); if (!sh.sys.groups[g]) return c.fail(`chgrp: invalid group: '${g}'`);
    for (const t of rest) { const n = sh.get(t); if (!n) { c.err(`chgrp: cannot access '${t}': No such file or directory`); continue; } if (sh.user !== "root" && (n.owner !== sh.user || !sh.sys.groupsOf(sh.user).includes(g))) { c.err(`chgrp: changing group of '${t}': Operation not permitted`); continue; } const ap = x => { x.group = g; x.ctime = new Date(); }; if (f.R) sh.walk(t, (p, x) => ap(x)); else ap(n); }
  });

  // ---------- ACLs ----------
  const ensureAcl = n => n.acl || (n.acl = { users: {}, groups: {}, groupObj: (n.mode >> 3) & 7, mask: null });
  const syncMask = n => { if (n.acl) { const all = [...Object.values(n.acl.users), ...Object.values(n.acl.groups), n.acl.groupObj]; const m = all.reduce((a, b) => a | b, 0); n.mode = (n.mode & ~0o070) | (m << 3); } };
  def("setfacl", "Set file access control lists", c => {
    const sh = c.sh, { f, v, rest } = po(c.args, { val: "mxM" });
    if (!rest.length) return c.fail("Usage: setfacl [-bkndRLP] { -m|-M|-x|-X ... } file ...");
    for (const t of rest) {
      const n = sh.get(t); if (!n) { c.err(`setfacl: ${t}: No such file or directory`); continue; }
      if (sh.user !== "root" && n.owner !== sh.user) { c.err(`setfacl: ${t}: Operation not permitted`); continue; }
      if (f.b) { delete n.acl; continue; }
      const apply = x => {
        if (v.m) for (const e of v.m.split(",")) {
          const m = /^(u|user|g|group|o|other|m|mask):([^:]*):?([rwx-]*)$/.exec(e) || /^(o|other|m|mask)::([rwx-]*)$/.exec(e); if (!m) { c.err(`setfacl: Option -m: Invalid argument near character 1`); return; }
          const kind = m[1][0], name = m[2], perm = V.permBits(m[3] ?? m[2]); ensureAcl(x);
          if (kind === "u") { if (name) x.acl.users[name] = perm; else x.mode = (x.mode & ~0o700) | (perm << 6); }
          else if (kind === "g") { if (name) x.acl.groups[name] = perm; else x.acl.groupObj = perm; }
          else if (kind === "o") x.mode = (x.mode & ~7) | perm;
          else if (kind === "m") { x.mode = (x.mode & ~0o070) | (V.permBits(m[3] || m[2]) << 3); }
        }
        if (v.x) for (const e of v.x.split(",")) { const [k, name] = e.split(":"); if (x.acl) { if (k[0] === "u") delete x.acl.users[name]; else delete x.acl.groups[name]; if (!Object.keys(x.acl.users).length && !Object.keys(x.acl.groups).length) delete x.acl; } }
      };
      if (f.R) sh.walk(t, (p, x) => apply(x)); else apply(n); n.ctime = new Date();
    }
  });
  def("getfacl", "Show file access control lists", c => {
    const sh = c.sh;
    for (const t of c.args.filter(a => !a.startsWith("-"))) {
      const n = sh.get(t); if (!n) { c.err(`getfacl: ${t}: No such file or directory`); continue; }
      c.p(`# file: ${t.replace(/^\//, "")}\n# owner: ${n.owner}\n# group: ${n.group}`);
      c.p(`user::${V.permStr((n.mode >> 6) & 7)}`);
      if (n.acl) { for (const [u, p] of Object.entries(n.acl.users)) c.p(`user:${u}:${V.permStr(p)}`); c.p(`group::${V.permStr(n.acl.groupObj)}`); for (const [g, p] of Object.entries(n.acl.groups)) c.p(`group:${g}:${V.permStr(p)}`); c.p(`mask::${V.permStr((n.mode >> 3) & 7)}`); }
      else c.p(`group::${V.permStr((n.mode >> 3) & 7)}`);
      c.p(`other::${V.permStr(n.mode & 7)}\n`);
    }
  });

  // ---------- attributes ----------
  def("chattr", "Change file attributes", c => {
    const sh = c.sh; if (!c.root("chattr: Permission denied while reading flags")) return;
    const m = /^([+\-=])([a-zA-Z]+)$/.exec(c.args[0] || ""); if (!m) return c.fail("Usage: chattr [-pRVf] [+-=aAcCdDeijsStTu] [-v version] files...");
    for (const t of c.args.slice(1).filter(a => !a.startsWith("-R"))) { const n = sh.get(t); if (!n) { c.err(`chattr: No such file or directory while trying to stat ${t}`); continue; } n.attrs = n.attrs || {}; for (const ch of m[2]) { if (m[1] === "-") delete n.attrs[ch]; else n.attrs[ch] = true; } if (m[1] === "=") { n.attrs = {}; for (const ch of m[2]) n.attrs[ch] = true; } }
  });
  def("lsattr", "List file attributes", c => {
    const sh = c.sh, { f, rest } = po(c.args); const al = ["a", "i", "d", "A", "c"], row = n => { const on = n.attrs || {}; return "----------------".split("").map((_, i) => "").length && ["s", "u", "S", "D", "i", "a", "A", "c", "d", "e"].map(k => on[k] ? k : "-").join("") + "-------"; };
    for (const t of rest.length ? rest : ["."]) { const n = sh.get(t); if (!n) { c.err(`lsattr: No such file or directory while trying to stat ${t}`); continue; } if (n.t === "d" && !f.d) for (const k of Object.keys(n.kids).filter(k => f.a || !k.startsWith(".")).sort()) c.p(`${row(n.kids[k])} ${t.replace(/\/$/, "")}/${k}`); else c.p(`${row(n)} ${t}`); }
  });
})();
