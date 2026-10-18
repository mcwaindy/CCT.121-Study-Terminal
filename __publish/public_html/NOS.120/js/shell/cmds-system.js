/* System commands: info, processes, systemd/SysV, packages, boot, X, locale/time, logs, network. */
(() => {
  const NOS = window.NOS, V = NOS.vfs, def = NOS.defCmd, po = NOS.parseOpts;
  const needRoot = (c, n) => c.root(`${n || c.name}: Permission denied`);
  const TARGETS = { poweroff: 0, rescue: 1, emergency: 1, "multi-user": 3, graphical: 5, reboot: 6 };
  const RL2T = { 0: "poweroff.target", 1: "rescue.target", 2: "multi-user.target", 3: "multi-user.target", 4: "multi-user.target", 5: "graphical.target", 6: "reboot.target" };
  const rlOf = t => ({ "poweroff.target": 0, "rescue.target": 1, "emergency.target": 1, "multi-user.target": 3, "graphical.target": 5, "reboot.target": 6 })[t] ?? 3;

  def("uname", "Print system information", c => {
    const { f } = po(c.args), s = c.sh.sys, parts = [];
    if (f.a) return c.p(`Linux ${s.hostname} ${s.kernel} #1 SMP PREEMPT_DYNAMIC ${s.arch} ${s.arch} ${s.arch} GNU/Linux`);
    if (f.s || !Object.keys(f).length) parts.push("Linux"); if (f.n) parts.push(s.hostname); if (f.r) parts.push(s.kernel); if (f.v) parts.push("#1 SMP"); if (f.m || f.p || f.i) parts.push(s.arch); if (f.o) parts.push("GNU/Linux");
    c.p(parts.join(" "));
  });
  def("arch", "Print machine architecture", c => c.p(c.sh.sys.arch));
  def("uptime", "Show how long the system has been running", c => c.p(" 09:41:02 up  3:00,  1 user,  load average: 0.00, 0.01, 0.05"));
  def("nproc", "Number of processing units", c => c.p("2"));
  def("lscpu", "Display CPU information", c => c.p("Architecture:        x86_64\nCPU(s):              2\nModel name:          Virtual CPU @ 2.40GHz\nThread(s) per core:  1\nVirtualization:      VT-x"));
  def("lspci", "List PCI devices", c => c.p("00:00.0 Host bridge: Intel 440FX\n00:02.0 VGA compatible controller: VMware SVGA II\n00:03.0 Ethernet controller: Intel 82540EM Gigabit\n00:0d.0 SATA controller: Intel 82801HM/HEM AHCI"));
  def("lsusb", "List USB devices", c => c.p("Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub"));
  def("lsmod", "Show loaded kernel modules", c => { const m = c.sh.sys.modules || (c.sh.sys.modules = ["ext4", "xfs", "e1000", "snd_hda_intel", "vboxguest"]); c.p("Module                  Size  Used by"); for (const x of m) c.p(`${x.padEnd(22)} 123456  1`); });
  def(["modprobe", "insmod", "rmmod"], "Load or unload kernel modules", c => { if (!needRoot(c)) return; const s = c.sh.sys, m = s.modules || (s.modules = ["ext4", "xfs", "e1000"]), a = c.args.filter(x => !x.startsWith("-")); const rm = c.name === "rmmod" || c.args.includes("-r"); for (const n of a) { if (rm) s.modules = m.filter(x => x !== n); else if (!m.includes(n)) m.push(n); } }, { sbin: true });
  def("dmidecode", "Show hardware info from DMI", c => { if (needRoot(c)) c.p("System Information\n\tManufacturer: innotek GmbH\n\tProduct Name: VirtualBox"); }, { sbin: true });
  def("hostnamectl", "Control the hostname", c => { const s = c.sh.sys; if (c.args[0] === "set-hostname") { if (!needRoot(c)) return; s.hostname = c.args[1]; c.sh.env.HOSTNAME = c.args[1]; return; } c.p(`   Static hostname: ${s.hostname}\n  Operating System: Nos Linux 9\n            Kernel: Linux ${s.kernel}\n      Architecture: x86-64`); });
  def(["ip", "ifconfig"], "Show network interfaces", c => c.p("1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: enp0s3: <BROADCAST,MULTICAST,UP> mtu 1500\n    inet 192.168.1.50/24 brd 192.168.1.255 scope global enp0s3"));
  def("ping", "Send ICMP echo requests (simulated)", c => { const h = c.args.find(a => !a.startsWith("-")) || "localhost"; c.p(`PING ${h} (127.0.0.1) 56(84) bytes of data.`); for (let i = 1; i <= 3; i++) c.p(`64 bytes from ${h}: icmp_seq=${i} ttl=64 time=0.0${40 + i} ms`); c.p(`\n--- ${h} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss`); });

  // ---------- processes ----------
  const procs = sh => [
    { pid: 1, user: "root", cmd: sh.sys.initCmd || "/usr/lib/systemd/systemd --switched-root --system", tty: "?" },
    { pid: 2, user: "root", cmd: "[kthreadd]", tty: "?" },
    ...Object.entries(sh.sys.services).filter(([, s]) => s.active && s.pid).map(([n, s]) => ({ pid: s.pid, user: "root", cmd: `/usr/sbin/${n.toLowerCase()}`, tty: "?" })),
    { pid: 1801, user: "student", cmd: "-bash", tty: "pts/0" }, { pid: 4242, user: sh.user, cmd: "-bash", tty: "pts/0" }, ...(sh.sys.bg || [])
  ];
  def("ps", "Report process status", c => {
    const sh = c.sh, { f, rest } = po(c.args.map(a => /^[aufxe]+$/.test(a) ? "-" + a : a)), all = f.e || f.A || f.a || f.x;
    const list = procs(sh).filter(p => all || p.tty === "pts/0");
    if (f.f || f.u) { c.p("UID          PID  PPID  C STIME TTY          TIME CMD"); for (const p of list) c.p(`${p.user.padEnd(8)} ${String(p.pid).padStart(7)} ${String(p.pid === 1 ? 0 : 1).padStart(5)}  0 09:30 ${p.tty.padEnd(8)} 00:00:00 ${p.cmd}`); }
    else { c.p("    PID TTY          TIME CMD"); for (const p of list) c.p(`${String(p.pid).padStart(7)} ${p.tty.padEnd(8)} 00:00:00 ${p.cmd.replace(/^-|.*\//, "")}`); }
  });
  def("pgrep", "Look up processes by name", c => { const p = procs(c.sh).filter(x => x.cmd.includes(c.args.find(a => !a.startsWith("-")) || "\0")); p.forEach(x => c.p(String(x.pid))); return p.length ? 0 : 1; });
  def("top", "Display running processes (snapshot)", c => { c.p(`top - 09:41:02 up 3:00, 1 user, load average: 0.00, 0.01, 0.05\nTasks: ${procs(c.sh).length} total\n%Cpu(s): 0.3 us, 0.2 sy, 99.5 id\nMiB Mem : ${c.sh.sys.totalMem} total\n\n    PID USER      %CPU %MEM COMMAND`); for (const p of procs(c.sh).slice(0, 8)) c.p(`${String(p.pid).padStart(7)} ${p.user.padEnd(9)} 0.0  0.1 ${p.cmd.replace(/.*\//, "")}`); });
  def(["kill", "killall", "pkill"], "Signal processes", c => { const sh = c.sh; for (const a of c.args.filter(x => !x.startsWith("-"))) { const pid = +a; const sv = Object.entries(sh.sys.services).find(([, s]) => s.pid === pid || (c.name !== "kill" && a === s.cmd)); if (pid === 1) { c.err("kill: (1) - Operation not permitted"); continue; } if (sv && sh.user === "root") { sv[1].active = false; delete sv[1].pid; } else if (!Number.isNaN(pid) && !procs(sh).some(p => p.pid === pid) && c.name === "kill") c.err(`bash: kill: (${pid}) - No such process`); } });
  def(["nice", "renice", "nohup", "bg", "fg", "jobs", "disown"], "Job and priority control (simulated)", c => { if (c.name === "nice" && c.args.length) { const a = c.args.filter(x => !/^-/.test(x) && !/^\d+$/.test(x)); if (a.length) { const r = c.sh.invoke(a, c.stdin); c.o += r.o; c.e += r.e; c.status = r.status; } } else if (c.name === "jobs") return; }, { builtin: false });

  // ---------- systemd ----------
  const unitName = n => n.replace(/\.service$/, "");
  def("systemctl", "Control the systemd system and service manager", c => {
    const sh = c.sh, sys = sh.sys, { f, rest } = po(c.args), cmd = rest[0], u = unitName(rest[1] || "");
    const svc = () => sys.services[u];
    const need = () => { if (!svc()) { c.fail(`Failed to ${cmd} ${rest[1]}.service: Unit ${rest[1]}.service not found.`, 5); return false; } return true; };
    const priv = () => c.root("Failed to " + cmd + " " + (rest[1] || "") + ": Interactive authentication required.");
    switch (cmd) {
      case "start": case "stop": case "restart": case "reload": if (!priv() || !need()) return; { const s = svc(); if (cmd === "stop") { s.active = false; delete s.pid; } else { s.active = true; s.pid = s.pid || ++sys.nextPid; } } break;
      case "enable": case "disable": if (!priv() || !need()) return; svc().enabled = cmd === "enable"; if (f.now) { svc().active = cmd === "enable"; } c.p(cmd === "enable" ? `Created symlink /etc/systemd/system/multi-user.target.wants/${u}.service → /usr/lib/systemd/system/${u}.service.` : `Removed /etc/systemd/system/multi-user.target.wants/${u}.service.`); break;
      case "mask": case "unmask": if (!priv() || !need()) return; svc().masked = cmd === "mask"; if (cmd === "mask") { svc().active = false; svc().enabled = false; } break;
      case "status": if (!need()) return; { const s = svc(); c.p(`● ${u}.service - ${s.desc}\n     Loaded: loaded (/usr/lib/systemd/system/${u}.service; ${s.masked ? "masked" : s.enabled ? "enabled" : "disabled"}; preset: ${s.enabled ? "enabled" : "disabled"})\n     Active: ${s.active ? "active (running)" : "inactive (dead)"}${s.pid ? `\n   Main PID: ${s.pid} (${u})` : ""}`); return s.active ? 0 : 3; }
      case "is-active": { const s = svc(); c.p(s && s.active ? "active" : "inactive"); return s && s.active ? 0 : 3; }
      case "is-enabled": { const s = svc(); c.p(s && s.enabled ? "enabled" : "disabled"); return s && s.enabled ? 0 : 1; }
      case "list-units": case "list-unit-files": case undefined: c.p("UNIT                LOAD   ACTIVE SUB     DESCRIPTION"); for (const [n, s] of Object.entries(sys.services)) if (cmd !== "list-units" || s.active) c.p(`${(n + ".service").padEnd(19)} loaded ${s.active ? "active  running" : "inactive dead   "} ${s.desc}`); break;
      case "get-default": c.p(sys.defaultTarget); break;
      case "set-default": { if (!priv()) return; const t = rest[1]; if (!/\.target$/.test(t || "") || !sh.get("/usr/lib/systemd/system/" + t)) return c.fail(`Failed to set default target: Unit file ${t} does not exist.`, 1); sys.defaultTarget = t; const d = sh.get("/etc/systemd/system"); d.kids["default.target"] = V.node("l", { owner: "root", group: "root", target: "/usr/lib/systemd/system/" + t }); c.p(`Removed /etc/systemd/system/default.target.\nCreated symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/${t}.`); break; }
      case "isolate": { if (!priv()) return; const t = rest[1]; if (!/^(poweroff|rescue|emergency|multi-user|graphical|reboot)\.target$/.test(t || "")) return c.fail(`Failed to start ${t}: Unit ${t} not found or cannot be isolated.`, 1); sys.target = t; if (t === "multi-user.target") sys.services.gdm.active = false; if (t === "graphical.target") sys.services.gdm.active = true; if (/^(poweroff|reboot)/.test(t)) c.p("(The simulated system would now go down; state is unchanged.)"); break; }
      case "rescue": case "emergency": if (priv()) sys.target = cmd + ".target"; break;
      case "daemon-reload": priv(); break;
      case "list-dependencies": c.p(`${rest[1] || sys.target}\n● ├─basic.target\n● └─sysinit.target`); break;
      case "poweroff": case "reboot": case "halt": c.p(`(simulated) system ${cmd}`); break;
      default: return c.fail(`Unknown command verb '${cmd}'.`, 1);
    }
  });
  def("runlevel", "Print previous and current runlevel", c => c.p(`N ${rlOf(c.sh.sys.target)}`), { sbin: true });
  def(["init", "telinit"], "Change the runlevel", c => { if (!needRoot(c)) return; const l = c.args[0]; if (!/^[0-6sS]$/.test(l || "")) return c.fail(`${c.name}: invalid runlevel '${l}'`); c.sh.sys.target = RL2T[l === "s" || l === "S" ? 1 : l]; c.p(`(simulated) switching to runlevel ${l}`); }, { sbin: true });
  def(["shutdown", "poweroff", "halt", "reboot"], "Power off or restart the system", c => { if (!needRoot(c)) return; const a = c.args.filter(x => !x.startsWith("-")); c.p(c.name === "shutdown" ? (c.args.includes("-c") ? "Shutdown cancelled." : `Shutdown scheduled for ${a[0] === "now" ? "now" : a[0] || "+1"}, use 'shutdown -c' to cancel. (simulated)`) : `(simulated) ${c.name}`); }, { sbin: true });
  def("chkconfig", "Manage SysV service runlevels", c => {
    const sys = c.sh.sys, { f, rest } = po(c.args); if (f.list || rest[0] === "--list" || !rest.length) { c.p("Note: This output shows SysV services only."); for (const s of ["network", "sshd", "crond"]) c.p(`${s.padEnd(15)}0:off 1:off 2:on  3:on  4:on  5:on  6:off`); return; }
    if (!needRoot(c)) return; const [n, st] = rest; if (!sys.services[n] && !["network"].includes(n)) return c.fail(`service ${n} supports chkconfig, but is not referenced in any runlevel (run 'chkconfig --add ${n}')`); if (sys.services[n]) sys.services[n].enabled = st === "on";
  }, { sbin: true });
  def("service", "Run a SysV init script", c => { const s = c.sh.sys.services[c.args[0]]; if (!s) return c.fail(`${c.args[0]}: unrecognized service`); if (c.args[1] === "status") c.p(`${c.args[0]} is ${s.active ? "running" : "stopped"}`); else { if (!needRoot(c)) return; s.active = c.args[1] !== "stop"; } }, { sbin: true });
  def("journalctl", "Query the systemd journal", c => { const sh = c.sh; const t = V.text(sh.get("/var/log/messages")); c.p("-- Logs begin at Mon 2024-09-02 06:41:00 EST. --"); for (const l of t.split("\n").filter(Boolean)) c.p(l); });
  def("dmesg", "Print kernel ring buffer", c => { const r = c.sh.readFile("/var/log/dmesg"); c.w(r.text || ""); });
  def("logger", "Write to the system log", c => { const msg = c.args.filter(a => !a.startsWith("-")).join(" "); const n = c.sh.get("/var/log/messages"); n.content = V.text(n) + `Sep  2 09:41:02 ${c.sh.sys.hostname} ${c.sh.user}: ${msg}\n`; });
  def("crontab", "Maintain crontab files (simulated)", c => { const sh = c.sh; if (c.args.includes("-l")) c.p(sh.cron ? sh.cron : `no crontab for ${sh.user}`); else if (c.args[0] === "-r") sh.cron = null; else c.p("crontab: interactive editing not simulated. Format: m h dom mon dow command"); });

  // ---------- packages ----------
  const pkgCmd = c => {
    const sh = c.sh, sys = sh.sys, { f, rest } = po(c.args), v = rest[0], pk = rest.slice(1);
    if (c.name === "rpm") { const o = po(c.args); if (o.f.qa) { for (const p of [...sys.pkgs].sort()) c.p(p + "-1.0-1.el9.x86_64"); return; } if (o.f.q) { for (const p of o.rest) { if (sys.pkgs.has(p)) c.p(p + "-1.0-1.el9.x86_64"); else c.p(`package ${p} is not installed`); } return; } if (o.f.i || o.f.U) { if (!needRoot(c)) return; o.rest.forEach(p => sys.pkgs.add(p.replace(/-\d.*$|\.rpm$/g, ""))); return; } if (o.f.e) { if (!needRoot(c)) return; o.rest.forEach(p => sys.pkgs.delete(p)); return; } return; }
    switch (v) {
      case "install": case "reinstall": case "remove": case "erase": case "update": case "upgrade": case "-y": if (!c.root(`Error: This command has to be run with superuser privileges (under the root user on most systems).`)) return; if (v === "update" || v === "upgrade") return c.p("Dependencies resolved.\nNothing to do.\nComplete!"); for (const p of pk.filter(x => !x.startsWith("-"))) { if (v === "remove" || v === "erase") { if (!sys.pkgs.has(p)) c.err(`No match for argument: ${p}`); else { sys.pkgs.delete(p); c.p(`Removed: ${p}`); } } else { sys.pkgs.add(p); c.p(`Installed: ${p}-1.0-1.el9.x86_64`); } } c.p("Complete!"); break;
      case "list": case "search": case "info": case "provides": case "whatprovides": for (const p of [...sys.pkgs].sort().filter(p => !pk[0] || p.includes(pk[0]) || pk[0] === "installed")) c.p(`${p}.x86_64   1.0-1.el9   @baseos`); break;
      case "update-index": case "makecache": case "clean": break;
      case "apt": break;
      default: c.fail(`Error: No such command: ${v || ""}. Please use ${c.name} --help`); return 1;
    }
  };
  def(["dnf", "yum", "rpm", "apt", "apt-get", "dpkg"], "Package manager (simulated)", pkgCmd);

  // ---------- boot / grub / X / locale / time ----------
  def(["grub2-mkconfig", "grub-mkconfig", "update-grub"], "Generate the GRUB configuration", c => { if (!needRoot(c)) return; c.p("Generating grub configuration file ...\nFound linux image: /boot/vmlinuz-5.15.16\nFound initrd image: /boot/initramfs-5.15.16.img\ndone"); }, { sbin: true });
  def(["grub2-install", "grub-install"], "Install GRUB to a device", c => { if (!needRoot(c)) return; const d = c.args.find(a => !a.startsWith("-")); if (!c.sh.sys.blk[d || ""]) return c.fail(`grub2-install: error: cannot find a device for ${d || "(unknown)"}.`); c.p("Installing for x86_64-efi platform.\nInstallation finished. No error reported."); }, { sbin: true });
  def(["grub2-set-default", "grubby"], "Set the default boot entry", c => { if (needRoot(c)) c.p("default boot entry updated"); }, { sbin: true });
  def("dracut", "Create an initramfs image", c => { if (needRoot(c)) c.p("dracut: *** Creating initramfs image file '/boot/initramfs-5.15.16.img' done ***"); }, { sbin: true });
  def(["startx", "xinit"], "Start an X session (simulated)", c => c.p("xinit: simulated X server started (no display available in the browser)."));
  def("xrandr", "Query display configuration", c => c.p("Screen 0: minimum 320 x 200, current 1920 x 1080\nVGA-1 connected primary 1920x1080+0+0"));
  def("xdpyinfo", "Display X server info", c => c.p("name of display:    :0\nversion number:    11.0\nvendor string:    The X.Org Foundation"));
  def("localectl", "Control locale and keyboard settings", c => {
    const sys = c.sh.sys, a = c.args; if (a[0] === "set-locale") { if (!needRoot(c)) return; sys.locale = a[1].replace(/^LANG=/, ""); c.sh.env.LANG = sys.locale; return; } if (a[0] === "set-keymap") { if (!needRoot(c)) return; sys.keymap = a[1]; return; }
    if (a[0] === "list-locales") return c.p("C.UTF-8\nen_US.UTF-8\nes_ES.UTF-8\nfr_FR.UTF-8\nde_DE.UTF-8"); if (a[0] === "list-keymaps") return c.p("us\nuk\nde\nfr\nes");
    c.p(`   System Locale: LANG=${sys.locale}\n       VC Keymap: ${sys.keymap}\n      X11 Layout: ${sys.keymap}`);
  });
  def("locale", "Show locale settings", c => { const l = c.sh.sys.locale; if (c.args[0] === "-a") return c.p("C\nC.UTF-8\nen_US.utf8\nPOSIX"); c.p(`LANG=${l}\nLC_CTYPE="${l}"\nLC_NUMERIC="${l}"\nLC_TIME="${l}"\nLC_ALL=`); });
  def(["loadkeys", "setxkbmap"], "Load a keyboard layout", c => { if (c.name === "loadkeys" && !needRoot(c)) return; c.sh.sys.keymap = c.args[c.args.length - 1] || "us"; });
  def("timedatectl", "Control the system time and date", c => {
    const sys = c.sh.sys, a = c.args;
    if (a[0] === "list-timezones") return c.p("America/Chicago\nAmerica/Los_Angeles\nAmerica/New_York\nEurope/London");
    if (a[0] === "set-timezone") { if (!needRoot(c)) return; const z = a[1]; const zn = c.sh.get("/usr/share/zoneinfo/" + z); if (!zn) return c.fail(`Failed to set time zone: Invalid time zone '${z}'`); sys.tz = z; c.sh.get("/etc", false).kids.localtime.target = "/usr/share/zoneinfo/" + z; return; }
    if (a[0] === "set-ntp") { if (needRoot(c)) sys.ntp = a[1] === "true" || a[1] === "yes" || a[1] === "1"; return; }
    if (a[0] === "set-time") { needRoot(c); return; }
    const d = new Date(); c.p(`               Local time: ${d.toString().slice(0, 24)}\n           Universal time: ${d.toUTCString()}\n                 Time zone: ${sys.tz}\nSystem clock synchronized: ${sys.ntp ? "yes" : "no"}\n              NTP service: ${sys.ntp ? "active" : "inactive"}`);
  });
  def(["chronyc", "ntpdate", "hwclock", "tzselect"], "Time synchronization (simulated)", c => c.p(c.name === "hwclock" ? new Date().toString().slice(0, 24) + "  -0.000000 seconds" : "Leap status     : Normal\nStratum         : 3"), { sbin: true });
  def("iconv", "Convert text encodings (pass-through)", c => { for (const i of c.sh.inputs(c, c.args.filter(a => !a.startsWith("-") && !/^[A-Za-z0-9_-]+$/.test(a) || /\./.test(a)))) c.w(i.text); });
  def(["exec", "eval"], "Run arguments as a command", c => { if (c.args.length) { c.sh.execLine(c.args.join(" ")); } }, { builtin: true });
  def("test", "Evaluate a conditional expression", c => {
    const sh = c.sh, a = c.args.slice(); if (a[a.length - 1] === "]") a.pop(); if (a[0] === "!") { a.shift(); const r = a; /* negate */ const n = (a.length === 2 ? (() => { const x = sh.get(a[1]); return a[0] === "-e" ? !!x : a[0] === "-d" ? x && x.t === "d" : a[0] === "-f" ? x && x.t === "f" : a[0] === "-z" ? a[1] === "" : false; })() : false); return n ? 1 : 0; }
    if (a.length === 2) { const x = sh.get(a[1]); const ok = a[0] === "-e" ? !!x : a[0] === "-d" ? x && x.t === "d" : a[0] === "-f" ? x && x.t === "f" : a[0] === "-r" ? x && sh.can(x, 4) : a[0] === "-w" ? x && sh.can(x, 2) : a[0] === "-x" ? x && sh.can(x, 1) : a[0] === "-s" ? x && V.size(x) > 0 : a[0] === "-z" ? a[1] === "" : a[0] === "-n" ? a[1] !== "" : false; return ok ? 0 : 1; }
    if (a.length === 3) { const [l, o, r] = a, n = [+l, +r]; const ok = o === "=" || o === "==" ? l === r : o === "!=" ? l !== r : o === "-eq" ? n[0] === n[1] : o === "-ne" ? n[0] !== n[1] : o === "-gt" ? n[0] > n[1] : o === "-lt" ? n[0] < n[1] : o === "-ge" ? n[0] >= n[1] : o === "-le" ? n[0] <= n[1] : false; return ok ? 0 : 1; }
    return a.length === 1 && a[0] !== "" ? 0 : 1;
  }, { builtin: true });
  NOS.shellCommands["["] = NOS.shellCommands.test;
})();
