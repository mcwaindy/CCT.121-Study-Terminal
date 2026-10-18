/* Virtual filesystem + simulated machine state for the NOS.120 shell. No DOM access in this file.
   Node shape: { t: d|f|l|b|c, ino, mode, owner, group, links, mtime, atime, ctime,
                 kids (d) | content (f) | target (l) | major,minor (b/c),
                 acl, attrs, mounted, gen (computed file) }. Hard links share the SAME node object. */
(() => {
  const NOS = window.NOS;
  const V = NOS.vfs = {};
  let ino = 1000;
  const BASE = new Date(new Date().getFullYear(), 8, 2, 9, 30);

  V.node = (t, o = {}) => {
    const n = { t, ino: ++ino, mode: t === "d" ? 0o755 : t === "l" ? 0o777 : 0o644, owner: "student", group: "student", links: 1, mtime: BASE, atime: BASE, ctime: BASE };
    if (t === "d") n.kids = {};
    if (t === "f") n.content = "";
    return Object.assign(n, o);
  };

  V.text = n => (n.gen ? n.gen() : (n.content || ""));
  V.size = n => n.t === "d" ? 4096 : n.t === "l" ? n.target.length : (n.t === "b" || n.t === "c") ? 0 : V.text(n).length;

  V.clone = n => {
    const c = { ...n, ino: ++ino, links: 1 };
    delete c.mounted;
    if (n.t === "d") { c.kids = {}; for (const [k, v] of Object.entries(n.kids)) c.kids[k] = V.clone(v); }
    if (n.gen) { c.content = V.text(n); delete c.gen; }
    if (n.acl) c.acl = JSON.parse(JSON.stringify(n.acl));
    if (n.attrs) c.attrs = { ...n.attrs };
    return c;
  };

  V.modeStr = n => {
    const m = n.mode;
    const type = { d: "d", l: "l", b: "b", c: "c", f: "-" }[n.t] || "-";
    const trip = (sh, special, ch) => {
      const r = (m >> (sh + 2)) & 1 ? "r" : "-", w = (m >> (sh + 1)) & 1 ? "w" : "-", x = (m >> sh) & 1;
      return r + w + (special ? (x ? ch : ch.toUpperCase()) : (x ? "x" : "-"));
    };
    return type + trip(6, m & 0o4000, "s") + trip(3, m & 0o2000, "s") + trip(0, m & 0o1000, "t") + (n.acl ? "+" : "");
  };
  V.permStr = bits => (bits & 4 ? "r" : "-") + (bits & 2 ? "w" : "-") + (bits & 1 ? "x" : "-");
  V.permBits = s => (/r/.test(s) ? 4 : 0) | (/w/.test(s) ? 2 : 0) | (/x/.test(s) ? 1 : 0);

  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  V.fmtDate = d => `${MON[d.getMonth()]} ${String(d.getDate()).padStart(2, " ")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  V.fmtFull = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.000000000 -0500`;

  // sizes: bytes -> human (K/M/G), MiB -> human
  V.humanBytes = b => {
    if (b < 1024) return String(b);
    const u = ["K", "M", "G", "T"]; let i = -1, v = b;
    while (v >= 1024 && i < 3) { v /= 1024; i++; }
    return (v >= 10 ? Math.ceil(v) : Math.ceil(v * 10) / 10) + u[i];
  };
  V.humanMiB = m => V.humanBytes(m * 1048576);
  // "5G" / "500M" / "2T" / "100" (MiB) -> MiB, or NaN
  V.parseMiB = s => {
    const m = /^(\d+(?:\.\d+)?)([KMGT]?)(?:i?B)?$/i.exec(String(s || "").trim());
    if (!m) return NaN;
    const v = parseFloat(m[1]), u = m[2].toUpperCase();
    return Math.round(u === "K" ? v / 1024 : u === "G" ? v * 1024 : u === "T" ? v * 1048576 : v);
  };

  const hex = n => Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  V.uuid = () => `${hex(8)}-${hex(4)}-${hex(4)}-${hex(4)}-${hex(12)}`;
  V.shortUuid = () => `${hex(4)}-${hex(4)}`.toUpperCase();

  V.newSystem = () => {
    const root = V.node("d", { owner: "root", group: "root" });
    const sys = { root, hostname: "nos120", kernel: "5.15.16", arch: "x86_64", bootTime: Date.now() - 3 * 3600 * 1000 };
    const own = { owner: "root", group: "root" };
    const add = (path, node) => {
      const parts = path.split("/").filter(Boolean); let d = root;
      for (const p of parts.slice(0, -1)) d = d.kids[p] || (d.kids[p] = V.node("d", { ...own }));
      d.kids[parts[parts.length - 1]] = node; return node;
    };
    const dir = (p, o = {}) => add(p, V.node("d", { ...own, ...o }));
    const file = (p, content, o = {}) => add(p, V.node("f", { ...own, content, ...o }));
    const link = (p, target, o = {}) => add(p, V.node("l", { ...own, target, ...o }));
    sys.add = add; sys.dir = dir; sys.file = file; sys.link = link;

    // ---------- accounts ----------
    sys.users = {
      root: { uid: 0, gid: 0, home: "/root", shell: "/bin/bash", gecos: "root" },
      student: { uid: 1000, gid: 1000, home: "/home/student", shell: "/bin/bash", gecos: "Student" }
    };
    sys.groups = { root: { gid: 0, members: [] }, wheel: { gid: 10, members: ["student"] }, student: { gid: 1000, members: [] } };
    sys.groupsOf = u => {
      const p = sys.users[u], out = [];
      if (p) for (const [n, g] of Object.entries(sys.groups)) if (g.gid === p.gid) out.push(n);
      for (const [n, g] of Object.entries(sys.groups)) if (g.members.includes(u) && !out.includes(n)) out.push(n);
      return out;
    };

    // ---------- block devices, mounts, LVM, swap ----------
    const B = sys.blk = {};
    B["/dev/sda"] = { type: "disk", size: 51200, ptable: "gpt", model: "VBOX HARDDISK" };
    B["/dev/sda1"] = { type: "part", parent: "/dev/sda", size: 512, start: 1, fs: "vfat", uuid: "9C0D-1E2F", ptype: "EFI System", used: 6 };
    B["/dev/sda2"] = { type: "part", parent: "/dev/sda", size: 4096, start: 513, fs: "swap", uuid: "3a4b-5c6d", ptype: "Linux swap" };
    B["/dev/sda3"] = { type: "part", parent: "/dev/sda", size: 30720, start: 4609, fs: "ext4", uuid: "1a2b-3c4d", ptype: "Linux filesystem", used: 8240 };
    B["/dev/sda4"] = { type: "part", parent: "/dev/sda", size: 15872, start: 35329, fs: "ext4", uuid: "5e6f-7a8b", ptype: "Linux filesystem", used: 2150 };
    B["/dev/sdb"] = { type: "disk", size: 20480, ptable: null, model: "VBOX HARDDISK" };
    B["/dev/sdc"] = { type: "disk", size: 20480, ptable: null, model: "VBOX HARDDISK" };
    B["/dev/sdd"] = { type: "disk", size: 10240, ptable: null, model: "VBOX HARDDISK" };
    B["/dev/sr0"] = { type: "rom", size: 1024, fs: "iso9660", label: "NOS120_ISO", uuid: "2025-01-01-00-00-00-00", used: 1024 };
    sys.mounts = [
      { dev: "sysfs", dir: "/sys", fs: "sysfs", opts: "rw,nosuid,nodev,noexec,relatime" },
      { dev: "proc", dir: "/proc", fs: "proc", opts: "rw,nosuid,nodev,noexec,relatime" },
      { dev: "devtmpfs", dir: "/dev", fs: "devtmpfs", opts: "rw,nosuid,size=1966540k" },
      { dev: "tmpfs", dir: "/run", fs: "tmpfs", opts: "rw,nosuid,nodev,mode=755" },
      { dev: "/dev/sda3", dir: "/", fs: "ext4", opts: "rw,relatime" },
      { dev: "/dev/sda1", dir: "/boot/efi", fs: "vfat", opts: "rw,relatime,fmask=0077" },
      { dev: "/dev/sda4", dir: "/home", fs: "ext4", opts: "rw,relatime" }
    ];
    sys.mountOf = dev => sys.mounts.find(m => m.dev === dev);
    sys.pvs = []; sys.vgs = {}; sys.lvs = [];
    sys.swaps = [{ dev: "/dev/sda2", size: 4096, used: 0 }];
    sys.raid = [];
    sys.totalMem = 3912;
    sys.usedOf = dev => { const b = B[dev]; return b ? (b.used != null ? b.used : Math.round((b.size || 0) * 0.005 + 1)) : 0; };

    // ---------- services / targets / locale ----------
    sys.services = {
      sshd: { desc: "OpenSSH server daemon", active: true, enabled: true, pid: 812 },
      crond: { desc: "Command Scheduler", active: true, enabled: true, pid: 640 },
      chronyd: { desc: "NTP client/server", active: true, enabled: true, pid: 611 },
      NetworkManager: { desc: "Network Manager", active: true, enabled: true, pid: 701 },
      firewalld: { desc: "firewalld - dynamic firewall daemon", active: true, enabled: true, pid: 655 },
      rsyslog: { desc: "System Logging Service", active: true, enabled: true, pid: 598 },
      gdm: { desc: "GNOME Display Manager", active: true, enabled: true, pid: 1021 },
      httpd: { desc: "The Apache HTTP Server", active: false, enabled: false },
      cups: { desc: "CUPS Scheduler", active: false, enabled: true },
      bluetooth: { desc: "Bluetooth service", active: false, enabled: false },
      smb: { desc: "Samba SMB Daemon", active: false, enabled: false }
    };
    sys.target = "graphical.target";
    sys.defaultTarget = "graphical.target";
    sys.locale = "en_US.UTF-8"; sys.keymap = "us"; sys.tz = "America/New_York"; sys.ntp = true;
    sys.pkgs = new Set(["bash", "coreutils", "systemd", "kernel", "util-linux", "grub2", "lvm2", "mdadm", "e2fsprogs", "xfsprogs", "vim-minimal", "dnf", "openssh-server", "chrony", "firewalld", "NetworkManager", "gdm", "xorg-x11-server-Xorg", "tar", "gzip", "findutils", "grep", "sed", "gawk", "man-db", "sudo", "shadow-utils", "less"]);
    sys.nextPid = 4300;

    // ---------- file tree ----------
    for (const d of ["boot", "boot/efi", "boot/grub2", "dev", "dev/shm", "etc", "etc/default", "etc/ssh", "etc/sysconfig", "etc/X11", "etc/rc.d", "etc/rc.d/init.d", "etc/rc.d/rc3.d", "etc/rc.d/rc5.d", "etc/systemd", "etc/systemd/system", "media", "mnt", "opt", "proc", "run", "srv", "sys", "usr", "usr/bin", "usr/sbin", "usr/lib", "usr/lib/systemd", "usr/lib/systemd/system", "usr/local", "usr/local/bin", "usr/share", "usr/share/zoneinfo", "usr/share/zoneinfo/America", "usr/share/zoneinfo/Europe", "var", "var/log", "var/lib", "var/spool", "var/cache"]) dir("/" + d);
    link("/bin", "usr/bin"); link("/sbin", "usr/sbin"); link("/lib", "usr/lib");
    dir("/root", { mode: 0o700 }); dir("/tmp", { mode: 0o1777 }); dir("/var/tmp", { mode: 0o1777 });
    dir("/home"); dir("/home/student", { owner: "student", group: "student" });
    for (const d of ["Documents", "Downloads"]) dir("/home/student/" + d, { owner: "student", group: "student" });
    const own1 = { owner: "student", group: "student" };
    file("/home/student/notes.txt", "Linux is a kernel.\nThe shell interprets commands.\nUse man for help.\n", own1);
    file("/home/student/Documents/todo.txt", "study permissions\nstudy LVM\nstudy systemd\n", own1);
    file("/home/student/Documents/report.txt", "Quarterly report draft\nstatus: draft\nowner: student\n", own1);
    file("/home/student/.bashrc", "# .bashrc\nalias rm='rm -i'\nexport EDITOR=vi\n", own1);
    file("/home/student/.bash_profile", "# .bash_profile\nif [ -f ~/.bashrc ]; then . ~/.bashrc; fi\n", own1);
    file("/home/student/.bash_logout", "# ~/.bash_logout\n", own1);
    file("/root/.bashrc", "# root .bashrc\nalias cp='cp -i'\nalias mv='mv -i'\n", { ...own, mode: 0o644 });

    file("/etc/hostname", "nos120\n");
    file("/etc/hosts", "127.0.0.1   localhost localhost.localdomain\n::1         localhost\n");
    file("/etc/resolv.conf", "nameserver 192.168.1.1\n");
    file("/etc/os-release", 'NAME="Nos Linux"\nVERSION="9 (Single User)"\nID=nos\nPRETTY_NAME="Nos Linux 9"\n');
    file("/etc/issue", "Nos Linux 9\nKernel \\r on an \\m\n");
    file("/etc/shells", "/bin/sh\n/bin/bash\n/usr/bin/sh\n/usr/bin/bash\n");
    file("/etc/fstab", "UUID=1a2b-3c4d / ext4 defaults 1 1\nUUID=5e6f-7a8b /home ext4 defaults 1 2\nUUID=9C0D-1E2F /boot/efi vfat umask=0077 0 2\nUUID=3a4b-5c6d none swap defaults 0 0\n");
    file("/etc/passwd", "root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:Student:/home/student:/bin/bash\n", { gen: () => Object.entries(sys.users).map(([n, u]) => `${n}:x:${u.uid}:${u.gid}:${u.gecos}:${u.home}:${u.shell}`).join("\n") + "\n" });
    file("/etc/group", "", { gen: () => Object.entries(sys.groups).map(([n, g]) => `${n}:x:${g.gid}:${g.members.join(",")}`).join("\n") + "\n" });
    file("/etc/shadow", "", { mode: 0o000, gen: () => Object.keys(sys.users).map(n => `${n}:${n === "root" ? "!!" : "$6$salt$hashedpassword"}:19000:0:99999:7:::`).join("\n") + "\n" });
    file("/etc/sudoers", "root\tALL=(ALL)\tALL\n%wheel\tALL=(ALL)\tALL\n", { mode: 0o440 });
    file("/etc/profile", "# system-wide profile\nexport PATH=$PATH:/usr/local/bin\n");
    file("/etc/bashrc", "# system-wide bashrc\n");
    file("/etc/locale.conf", "LANG=en_US.UTF-8\n", { gen: () => `LANG=${sys.locale}\n` });
    file("/etc/vconsole.conf", "KEYMAP=us\n", { gen: () => `KEYMAP=${sys.keymap}\n` });
    file("/etc/inittab", "# inittab is only used by SysV init; systemd ignores it.\n# 0 halt, 1 single user, 2 multi (no NFS), 3 full multi-user, 4 unused, 5 X11, 6 reboot\nid:5:initdefault:\n");
    file("/etc/default/grub", 'GRUB_TIMEOUT=5\nGRUB_DEFAULT=saved\nGRUB_DISABLE_SUBMENU=true\nGRUB_CMDLINE_LINUX="rhgb quiet"\n');
    file("/etc/ssh/sshd_config", "Port 22\nPermitRootLogin prohibit-password\nPasswordAuthentication yes\n");
    file("/etc/sysconfig/i18n", "LANG=en_US.UTF-8\n");
    file("/etc/X11/xorg.conf", 'Section "Device"\n  Identifier "Card0"\n  Driver "modesetting"\nEndSection\n');
    link("/etc/localtime", "/usr/share/zoneinfo/America/New_York");
    file("/usr/share/zoneinfo/America/New_York", "TZif2 (binary timezone data)\n"); file("/usr/share/zoneinfo/America/Chicago", "TZif2 (binary timezone data)\n"); file("/usr/share/zoneinfo/America/Los_Angeles", "TZif2 (binary timezone data)\n");
    file("/usr/share/zoneinfo/Europe/London", "TZif2 (binary timezone data)\n");
    link("/etc/systemd/system/default.target", "/usr/lib/systemd/system/graphical.target");
    const unit = (name, desc, extra = "") => file(`/usr/lib/systemd/system/${name}`, `[Unit]\nDescription=${desc}\n${extra}`);
    unit("sshd.service", "OpenSSH server daemon", "After=network.target\n\n[Service]\nExecStart=/usr/sbin/sshd -D\n\n[Install]\nWantedBy=multi-user.target\n");
    unit("crond.service", "Command Scheduler", "\n[Service]\nExecStart=/usr/sbin/crond -n\n\n[Install]\nWantedBy=multi-user.target\n");
    unit("httpd.service", "The Apache HTTP Server", "After=network.target\n\n[Service]\nExecStart=/usr/sbin/httpd -DFOREGROUND\n\n[Install]\nWantedBy=multi-user.target\n");
    unit("graphical.target", "Graphical Interface", "Requires=multi-user.target\nAllowIsolate=yes\n");
    unit("multi-user.target", "Multi-User System", "Requires=basic.target\nAllowIsolate=yes\n");
    unit("rescue.target", "Rescue Mode", "Requires=sysinit.target\nAllowIsolate=yes\n");
    unit("emergency.target", "Emergency Mode", "AllowIsolate=yes\n");
    unit("poweroff.target", "System Power Off", "AllowIsolate=yes\n"); unit("reboot.target", "System Reboot", "AllowIsolate=yes\n");
    for (const s of ["network", "sshd", "crond"]) file(`/etc/rc.d/init.d/${s}`, `#!/bin/bash\n# chkconfig: 2345 10 90\n# description: ${s} SysV init script\ncase "$1" in start|stop|restart|status) ;; esac\n`, { mode: 0o755 });
    link("/etc/rc.d/rc3.d/S10network", "../init.d/network"); link("/etc/rc.d/rc3.d/S55sshd", "../init.d/sshd"); link("/etc/rc.d/rc5.d/S10network", "../init.d/network");

    file("/boot/grub2/grub.cfg", "", { gen: () => `# DO NOT EDIT: generated by grub2-mkconfig\nset default="\${saved_entry}"\nset timeout=5\nmenuentry 'Nos Linux (${sys.kernel}) 9' --class gnu-linux {\n  linux /boot/vmlinuz-${sys.kernel} root=UUID=1a2b-3c4d ro rhgb quiet\n  initrd /boot/initramfs-${sys.kernel}.img\n}\nmenuentry 'Nos Linux rescue' --class gnu-linux {\n  linux /boot/vmlinuz-0-rescue root=UUID=1a2b-3c4d ro single\n}\n` });
    file("/boot/grub2/grubenv", "# GRUB Environment Block\nsaved_entry=Nos Linux\n");
    file("/boot/vmlinuz-5.15.16", "\x7fELF compressed kernel image\n"); file("/boot/initramfs-5.15.16.img", "\x1f\x8b compressed initramfs\n");

    file("/var/log/messages", "Oct 13 08:00:01 nos120 kernel: Booting Linux\nOct 13 08:00:05 nos120 systemd[1]: Reached target Multi-User System.\n");
    file("/var/log/secure", "Oct 13 08:10:22 nos120 sshd[812]: Server listening on 0.0.0.0 port 22.\nOct 13 08:12:40 nos120 sudo[1530]: student : TTY=pts/0 ; USER=root ; COMMAND=/bin/dnf update\n", { mode: 0o600 });
    file("/var/log/dmesg", "[    0.000000] Linux version 5.15.16 (gcc 11.2.1)\n[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-5.15.16 root=UUID=1a2b-3c4d ro rhgb quiet\n[    0.512000] sda: sda1 sda2 sda3 sda4\n[    1.204000] EXT4-fs (sda3): mounted filesystem with ordered data mode\n[    2.980000] systemd[1]: Reached target Graphical Interface.\n");
    file("/var/log/boot.log", "[  OK  ] Started OpenSSH server daemon.\n[  OK  ] Reached target Multi-User System.\n[  OK  ] Started GNOME Display Manager.\n");
    file("/var/www/index.html", "<h1>It works</h1>\n", { owner: "root" });

    file("/proc/version", "Linux version 5.15.16 (mockbuild@nos) (gcc 11.2.1) #1 SMP\n");
    file("/proc/cmdline", "BOOT_IMAGE=(hd0,gpt3)/boot/vmlinuz-5.15.16 root=UUID=1a2b-3c4d ro rhgb quiet\n");
    file("/proc/cpuinfo", "processor\t: 0\nmodel name\t: Virtual CPU @ 2.40GHz\ncpu MHz\t\t: 2400.000\ncpu cores\t: 2\n\nprocessor\t: 1\nmodel name\t: Virtual CPU @ 2.40GHz\ncpu MHz\t\t: 2400.000\ncpu cores\t: 2\n");
    file("/proc/meminfo", "", { gen: () => { const tot = sys.totalMem * 1024, sw = sys.swaps.reduce((a, s) => a + s.size, 0) * 1024; return `MemTotal:        ${tot} kB\nMemFree:         ${Math.round(tot * 0.55)} kB\nMemAvailable:    ${Math.round(tot * 0.72)} kB\nBuffers:           41212 kB\nCached:           802112 kB\nSwapTotal:       ${sw} kB\nSwapFree:        ${sw} kB\n`; } });
    file("/proc/uptime", "", { gen: () => `${Math.round((Date.now() - sys.bootTime) / 1000)}.00 9999.00\n` });
    file("/proc/mounts", "", { gen: () => sys.mounts.map(m => `${m.dev} ${m.dir} ${m.fs} ${m.opts} 0 0`).join("\n") + "\n" });
    file("/proc/swaps", "", { gen: () => "Filename\t\t\t\tType\t\tSize\t\tUsed\t\tPriority\n" + sys.swaps.map(s => `${s.dev}\t\t\t\tpartition\t${s.size * 1024}\t\t${s.used * 1024}\t\t-2`).join("\n") + "\n" });
    file("/proc/filesystems", "nodev\tsysfs\nnodev\tproc\nnodev\ttmpfs\n\text4\n\txfs\n\tvfat\n\tiso9660\n\tbtrfs\n");
    file("/proc/partitions", "", { gen: () => "major minor  #blocks  name\n\n" + Object.keys(sys.blk).filter(d => /^\/dev\/(sd|md)/.test(d)).map(d => `   8        0 ${String(sys.blk[d].size * 1024).padStart(9)} ${d.slice(5)}`).join("\n") + "\n" });
    file("/proc/mdstat", "", {
      gen: () => "Personalities : [raid0] [raid1] [raid5]\n" + (sys.raid.length ? sys.raid.map(r => `${r.name} : active ${r.level} ${r.devs.map(d => d.slice(5) + "[0]").join(" ")}\n      ${r.size * 1024} blocks super 1.2 [${r.devs.length}/${r.devs.length}] [${"U".repeat(r.devs.length)}]\n`).join("\n") : "") + "unused devices: <none>\n"
    });

    // ---------- /dev (static part; dynamic devices are rebuilt by syncDev) ----------
    const devs = root.kids.dev;
    const chr = (n, ma, mi, mode = 0o666) => { devs.kids[n] = V.node("c", { ...own, mode, major: ma, minor: mi }); };
    chr("null", 1, 3); chr("zero", 1, 5); chr("full", 1, 7); chr("random", 1, 8); chr("urandom", 1, 9); chr("tty", 5, 0); chr("console", 5, 1, 0o600);
    sys.syncDev = () => {
      for (const k of Object.keys(devs.kids)) if (/^(sd|sr|md|loop)/.test(k) || (devs.kids[k].t === "d" && !["mapper", "shm", "pts"].includes(k))) delete devs.kids[k];
      const mapper = devs.kids.mapper = V.node("d", { ...own });
      mapper.kids.control = V.node("c", { ...own, mode: 0o600, major: 10, minor: 236 });
      let n = 0;
      for (const [d, b] of Object.entries(B)) {
        const name = d.slice(5); n++;
        if (d.startsWith("/dev/mapper/")) {
          mapper.kids[d.slice(12)] = V.node("b", { ...own, mode: 0o660, group: "disk", major: 253, minor: n });
          const vgd = devs.kids[b.vg] || (devs.kids[b.vg] = V.node("d", { ...own }));
          vgd.kids[b.lv] = V.node("l", { ...own, target: "../mapper/" + d.slice(12) });
        } else {
          devs.kids[name] = V.node("b", { ...own, mode: 0o660, group: b.type === "rom" ? "cdrom" : "disk", major: b.type === "raid" ? 9 : b.type === "rom" ? 11 : 8, minor: n });
        }
      }
    };
    sys.syncDev();

    // ---------- executables for which/whereis/ls /usr/bin ----------
    sys.populateBins = () => {
      const cmds = NOS.shellCommands || {};
      for (const [name, c] of Object.entries(cmds)) {
        if (c.builtin) continue;
        const p = `${c.sbin ? "/usr/sbin" : "/usr/bin"}/${name}`;
        file(p, "\x7fELF 64-bit executable (simulated)\n", { mode: name === "passwd" ? 0o4755 : name === "sudo" ? 0o4111 : 0o755 });
      }
    };
    sys.populateBins();
    return sys;
  };
})();
