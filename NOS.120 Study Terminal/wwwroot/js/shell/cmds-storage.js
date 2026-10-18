/* Storage commands: lsblk, blkid, fdisk/parted, mkfs, mount, df, du, fsck, LVM, swap, RAID, quotas. */
(() => {
  const NOS = window.NOS, V = NOS.vfs, def = NOS.defCmd, po = NOS.parseOpts;
  const FS = ["ext2", "ext3", "ext4", "xfs", "btrfs", "vfat", "swap", "iso9660"];
  const kids = (sys, d) => Object.entries(sys.blk).filter(([, b]) => b.parent === d).map(([k]) => k);
  const sizeStr = m => V.humanMiB(m);
  const rootOnly = (c, n) => c.root(`${n}: Permission denied`);
  const nextPart = (sys, d) => { let i = 1; while (sys.blk[d + i]) i++; return d + i; };

  def("lsblk", "List block devices", c => {
    const sh = c.sh, sys = sh.sys, { f } = po(c.args);
    c.p(f.f ? "NAME FSTYPE LABEL UUID MOUNTPOINT" : "NAME           MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS");
    const mp = d => { const m = sys.mounts.find(x => x.dev === d); const s = sys.swaps.find(x => x.dev === d); return m ? m.dir : s ? "[SWAP]" : ""; };
    const row = (d, b, pre) => c.p(f.f ? `${pre}${d.slice(5)} ${b.fs || ""} ${b.label || ""} ${b.uuid || ""} ${mp(d)}` : `${(pre + d.replace("/dev/mapper/", "").replace("/dev/", "")).padEnd(14)} ${"8:0".padStart(7)}  0 ${sizeStr(b.size).padStart(6)}  0 ${b.type.padEnd(4)} ${mp(d)}`);
    const tree = (d, pre) => {
      const k = kids(sys, d); k.forEach((x, i) => { row(x, sys.blk[x], pre + (i === k.length - 1 ? "└─" : "├─")); tree(x, pre + (i === k.length - 1 ? "  " : "│ ")); });
    };
    for (const [d, b] of Object.entries(sys.blk)) if (!b.parent && !d.startsWith("/dev/mapper") && b.type !== "raid") { row(d, b, ""); tree(d, ""); }
    for (const [d, b] of Object.entries(sys.blk)) if (b.type === "raid" && !b.parent) row(d, b, "");
  });
  def("blkid", "Print block device attributes", c => {
    for (const [d, b] of Object.entries(c.sh.sys.blk)) if (b.fs) c.p(`${d}: ${b.label ? `LABEL="${b.label}" ` : ""}UUID="${b.uuid}" TYPE="${b.fs}"`);
  }, { sbin: true });
  def("findmnt", "List mounted filesystems", c => { c.p("TARGET      SOURCE    FSTYPE OPTIONS"); for (const m of c.sh.sys.mounts) c.p(`${m.dir.padEnd(11)} ${m.dev.padEnd(9)} ${m.fs.padEnd(6)} ${m.opts}`); });

  const printTable = (c, d) => {
    const sys = c.sh.sys, b = sys.blk[d];
    c.p(`Disk ${d}: ${sizeStr(b.size)}, ${b.size * 1048576} bytes\nDisklabel type: ${b.ptable || "none"}\n\nDevice       Start      End  Sectors  Size Type`);
    for (const p of kids(sys, d).filter(k => !k.startsWith("/dev/mapper"))) { const x = sys.blk[p]; c.p(`${p.padEnd(12)} ${String(x.start * 2048).padStart(6)} ${String((x.start + x.size) * 2048 - 1).padStart(8)} ${String(x.size * 2048).padStart(8)} ${sizeStr(x.size).padStart(5)} ${x.ptype || "Linux filesystem"}`); }
  };
  def(["fdisk", "gdisk", "cfdisk"], "Partition table manipulator", c => {
    const sh = c.sh, sys = sh.sys, { f, rest } = po(c.args);
    if (f.l || !rest.length) { for (const [d, b] of Object.entries(sys.blk)) if (b.type === "disk" && !d.startsWith("/dev/mapper")) { printTable(c, d); c.p(""); } return; }
    if (!rootOnly(c, c.name)) return;
    const d = rest[0]; if (!sys.blk[d] || sys.blk[d].type !== "disk") return c.fail(`${c.name}: cannot open ${d}: No such file or directory`);
    c.p(`Welcome to ${c.name}. This simulator is non-interactive; use 'parted -s ${d} mklabel gpt mkpart ...' to change the table.`); printTable(c, d);
  }, { sbin: true });
  def("parted", "Partition editor", c => {
    const sh = c.sh, sys = sh.sys, { f, rest } = po(c.args), d = rest[0];
    if (rest[0] === "-l" || !d) { for (const [k, b] of Object.entries(sys.blk)) if (b.type === "disk") { printTable(c, k); c.p(""); } return; }
    if (!sys.blk[d] || sys.blk[d].type !== "disk") return c.fail(`Error: Could not stat device ${d} - No such file or directory.`);
    const KW = ["mklabel", "mkpart", "rm", "set", "print"], ix = rest.map((x, i) => i > 1 && KW.includes(x) ? i : -1).filter(i => i > 0);
    if (ix.length) {
      const cuts = [1, ...ix, rest.length];
      for (let i = 0; i < cuts.length - 1; i++) { const r = c.sh.invoke(["parted", d, ...rest.slice(cuts[i], cuts[i + 1])], c.stdin); c.o += r.o; c.e += r.e; c.status = r.status; if (r.status) return; }
      return;
    }
    const cmd = rest[1]; if (!cmd || cmd === "print") return printTable(c, d);
    if (!rootOnly(c, "parted")) return;
    const b = sys.blk[d];
    if (cmd === "mklabel") { for (const p of kids(sys, d)) delete sys.blk[p]; b.ptable = rest[2] === "msdos" ? "dos" : rest[2]; }
    else if (cmd === "mkpart") {
      if (!b.ptable) return c.fail("Error: /dev/sdX: unrecognised disk label");
      const a = rest.slice(2); const fs = a.find(x => FS.includes(x)) || "ext4"; const nums = a.filter(x => /^\d/.test(x)); const start = V.parseMiB(nums[0] || "1"), end = nums[1] === "100%" ? b.size : V.parseMiB(nums[1] || "100");
      if (!(end > start) || end > b.size) return c.fail("Error: Can't have a partition outside the disk!");
      const dev = nextPart(sys, d); sys.blk[dev] = { type: "part", parent: d, size: end - start, start, fs: null, ptype: "Linux filesystem", used: 0 }; sys.syncDev();
    } else if (cmd === "rm") { const dev = d + rest[2]; if (!sys.blk[dev]) return c.fail("Error: Partition doesn't exist."); if (sys.mountOf(dev)) return c.fail(`Error: Partition ${dev} is being used. You must unmount it before you modify it with Parted.`); delete sys.blk[dev]; sys.syncDev(); }
    else if (cmd === "set") { /* flags accepted */ }
    else return c.fail(`Error: Expecting a command, got '${cmd}'`);
    sys.syncDev();
  }, { sbin: true });
  def("partprobe", "Re-read partition tables", c => { if (c.root("partprobe: Permission denied")) c.sh.sys.syncDev(); }, { sbin: true });

  const mkfs = (c, type, args) => {
    const sh = c.sh, sys = sh.sys; if (!rootOnly(c, "mkfs")) return;
    const { v, rest } = po(args, { val: "Ltn" }); const d = rest[0]; if (!d) return c.fail("mkfs: no device specified");
    const b = sys.blk[d]; if (!b) return c.fail(`mkfs.${type}: ${d}: No such file or directory`);
    if (b.type === "disk" && kids(sys, d).length) return c.fail(`mkfs.${type}: ${d} contains a partition table; use a partition`);
    if (sys.mountOf(d)) return c.fail(`mkfs.${type}: ${d} is mounted; will not make a filesystem here!`);
    if (!FS.includes(type)) return c.fail(`mkfs: unknown filesystem type '${type}'`);
    b.fs = type; b.uuid = type === "vfat" ? V.shortUuid() : V.uuid(); b.label = v.L || null; b.used = 1;
    c.p(`mke2fs 1.46.5 (30-Dec-2021)`.replace("mke2fs 1.46.5 (30-Dec-2021)", type.startsWith("ext") ? "mke2fs 1.46.5 (30-Dec-2021)" : `meta-data=${d}  isize=512`));
    c.p(`Creating filesystem with ${b.size * 256} 4k blocks\nFilesystem UUID: ${b.uuid}\nAllocating group tables: done\nWriting inode tables: done\nWriting superblocks and filesystem accounting information: done`);
  };
  def("mkfs", "Build a Linux filesystem", c => { const { v, rest } = po(c.args, { val: "t" }); mkfs(c, v.t || "ext2", rest); }, { sbin: true });
  for (const t of FS.filter(x => x !== "swap" && x !== "iso9660")) def("mkfs." + t, `Create a ${t} filesystem`, c => mkfs(c, t, c.args), { sbin: true });
  def("mkswap", "Set up a swap area", c => {
    if (!rootOnly(c, "mkswap")) return; const sys = c.sh.sys, b = sys.blk[c.args.find(a => !a.startsWith("-"))];
    if (!b) return c.fail(`mkswap: cannot open ${c.args[0]}: No such file or directory`);
    b.fs = "swap"; b.uuid = V.uuid(); c.p(`Setting up swapspace version 1, size = ${sizeStr(b.size)}\nno label, UUID=${b.uuid}`);
  }, { sbin: true });
  def("swapon", "Enable swap devices", c => {
    const sys = c.sh.sys, { f, rest } = po(c.args); if (f.s || f.show || !rest.length) { c.p("NAME       TYPE      SIZE USED PRIO"); for (const s of sys.swaps) c.p(`${s.dev.padEnd(10)} partition ${sizeStr(s.size).padStart(4)} ${s.used}B   -2`); return; }
    if (!rootOnly(c, "swapon")) return; const d = rest[0], b = sys.blk[d];
    if (!b) return c.fail(`swapon: cannot stat ${d}: No such file or directory`);
    if (b.fs !== "swap") return c.fail(`swapon: ${d}: read swap header failed`);
    if (!sys.swaps.some(s => s.dev === d)) sys.swaps.push({ dev: d, size: b.size, used: 0 });
  }, { sbin: true });
  def("swapoff", "Disable swap devices", c => { if (!rootOnly(c, "swapoff")) return; const sys = c.sh.sys; sys.swaps = sys.swaps.filter(s => s.dev !== c.args[0] && c.args[0] !== "-a"); }, { sbin: true });
  def("free", "Display memory usage", c => {
    const { f } = po(c.args), sys = c.sh.sys, tot = sys.totalMem, sw = sys.swaps.reduce((a, s) => a + s.size, 0);
    const u = f.m ? 1 : 1024, fm = v => String(f.h ? V.humanMiB(v) : Math.round(v * u));
    c.p("               total        used        free      shared  buff/cache   available");
    c.p(`Mem:   ${fm(tot).padStart(12)} ${fm(tot * 0.31 | 0).padStart(11)} ${fm(tot * 0.55 | 0).padStart(11)} ${fm(12).padStart(11)} ${fm(tot * 0.14 | 0).padStart(11)} ${fm(tot * 0.72 | 0).padStart(11)}`);
    c.p(`Swap:  ${fm(sw).padStart(12)} ${fm(0).padStart(11)} ${fm(sw).padStart(11)}`);
  });

  // ---------- mounting ----------
  def("mount", "Mount a filesystem", c => {
    const sh = c.sh, sys = sh.sys, { f, v, rest } = po(c.args, { val: "to" });
    if (!rest.length && !v.t) { for (const m of sys.mounts) c.p(`${m.dev} on ${m.dir} type ${m.fs} (${m.opts})`); return; }
    if (!rootOnly(c, "mount")) return;
    if (f.a) { for (const l of V.text(sh.get("/etc/fstab")).split("\n")) { const [spec, dir, fs, opts] = l.split(/\s+/); if (!spec || fs === "swap") continue; const dev = spec.startsWith("UUID=") ? Object.keys(sys.blk).find(d => sys.blk[d].uuid === spec.slice(5)) : spec; if (dev && !sys.mountOf(dev) && !sys.mounts.some(m => m.dir === dir)) sys.mounts.push({ dev, dir, fs, opts: (opts || "defaults").replace("defaults", "rw,relatime") }); } return; }
    let dev = rest[0], dir = rest[1];
    if (rest.length === 1) { const ent = V.text(sh.get("/etc/fstab")).split("\n").map(l => l.split(/\s+/)).find(p => p[1] === rest[0] || p[0] === rest[0]); if (!ent) return c.fail(`mount: ${rest[0]}: can't find in /etc/fstab.`); dev = ent[0]; dir = ent[1]; }
    if (dev.startsWith("UUID=")) dev = Object.keys(sys.blk).find(d => sys.blk[d].uuid === dev.slice(5)) || dev;
    if (dev.startsWith("LABEL=")) dev = Object.keys(sys.blk).find(d => sys.blk[d].label === dev.slice(6)) || dev;
    const b = sys.blk[dev]; if (!b) return c.fail(`mount: ${dev}: special device ${dev} does not exist.`);
    const dn = sh.get(dir); if (!dn || dn.t !== "d") return c.fail(`mount: ${dir}: mount point does not exist.`);
    if (!b.fs) return c.fail(`mount: ${dir}: wrong fs type, bad option, bad superblock on ${dev}, missing codepage or helper program, or other error.`);
    if (b.fs === "swap") return c.fail(`mount: ${dir}: unknown filesystem type 'swap'.`);
    if (sys.mountOf(dev)) return c.fail(`mount: ${dir}: ${dev} already mounted on ${sys.mountOf(dev).dir}.`);
    sys.mounts.push({ dev, dir: sh.abs(dir), fs: v.t || b.fs, opts: v.o ? "rw," + v.o : "rw,relatime" });
  });
  def("umount", "Unmount a filesystem", c => {
    const sh = c.sh, sys = sh.sys; if (!rootOnly(c, "umount")) return; const t = c.args.find(a => !a.startsWith("-"));
    const i = sys.mounts.findIndex(m => m.dev === t || m.dir === sh.abs(t || "/x")); if (i < 0) return c.fail(`umount: ${t}: not mounted.`);
    const m = sys.mounts[i]; if (["/", "/proc", "/sys", "/dev"].includes(m.dir)) return c.fail(`umount: ${m.dir}: target is busy.`);
    if (sh.cwd === m.dir || sh.cwd.startsWith(m.dir + "/")) return c.fail(`umount: ${m.dir}: target is busy.`);
    sys.mounts.splice(i, 1);
  });
  def("df", "Report filesystem disk space usage", c => {
    const sh = c.sh, sys = sh.sys, { f, rest } = po(c.args, { val: "t" }); let ms = sys.mounts.filter(m => !["sysfs", "proc", "devtmpfs"].includes(m.fs));
    if (rest.length) { ms = [...sys.mounts].reverse().filter(m => { const a = sh.abs(rest[0]); return a === m.dir || a.startsWith(m.dir === "/" ? "/" : m.dir + "/"); }).slice(0, 1); }
    if (f.i) { c.p("Filesystem      Inodes IUsed   IFree IUse% Mounted on"); for (const m of ms) { const b = sys.blk[m.dev], n = b ? b.size * 64 : 490000, u = Math.round(n * 0.04); c.p(`${m.dev.padEnd(15)} ${String(n).padStart(6)} ${String(u).padStart(5)} ${String(n - u).padStart(7)}   ${"4%".padStart(3)} ${m.dir}`); } return; }
    c.p(f.T ? "Filesystem     Type  Size  Used Avail Use% Mounted on" : `Filesystem      ${f.h ? "Size  Used Avail" : "1K-blocks    Used Available"} Use% Mounted on`);
    for (const m of ms) {
      const b = sys.blk[m.dev], size = b ? b.size : 1966, used = b ? sys.usedOf(m.dev) : 1, av = size - used, pc = Math.round(used / size * 100);
      const fm = x => f.h ? V.humanMiB(x).padStart(5) : String(x * 1024).padStart(10);
      c.p(`${m.dev.padEnd(15)} ${f.T ? m.fs.padEnd(5) + " " : ""}${fm(size)} ${fm(used)} ${fm(av)} ${String(pc + "%").padStart(4)} ${m.dir}`);
    }
  });
  def("du", "Estimate file space usage", c => {
    const sh = c.sh, { f, rest } = po(c.args, { val: "d" }), sz = n => { let t = 0; const w = x => { t += x.t === "d" ? 4096 : Math.max(1, V.size(x)); if (x.t === "d") Object.values(x.kids).forEach(w); }; w(n); return t; };
    for (const t of rest.length ? rest : ["."]) { const n = sh.get(t); if (!n) { c.err(`du: cannot access '${t}': No such file or directory`); continue; } const fmt = b => f.h ? V.humanBytes(b) : Math.ceil(b / 1024); if (f.s || n.t !== "d") c.p(`${fmt(sz(n))}\t${t}`); else { const walk = (x, p) => { for (const [k, v] of Object.entries(x.kids)) if (v.t === "d") walk(v, p + "/" + k); c.p(`${fmt(sz(x))}\t${p}`); }; walk(n, t.replace(/\/$/, "") || "/"); } }
  });
  def(["fsck", "e2fsck", "xfs_repair"], "Check and repair a filesystem", c => {
    const sys = c.sh.sys; if (!rootOnly(c, c.name)) return; const d = c.args.find(a => !a.startsWith("-")); const b = sys.blk[d || ""];
    if (!b) return c.fail(`${c.name}: No such file or directory while trying to open ${d || ""}`, 8);
    if (sys.mountOf(d)) c.p(`WARNING!!! The filesystem is mounted. Running ${c.name} on a mounted filesystem may cause SEVERE filesystem damage.`);
    c.p(`fsck from util-linux 2.37\nPass 1: Checking inodes, blocks, and sizes\nPass 2: Checking directory structure\nPass 3: Checking directory connectivity\nPass 4: Checking reference counts\nPass 5: Checking group summary information\n${d}: 11/65536 files (0.0% non-contiguous), 12900/262144 blocks`);
  }, { sbin: true });
  def(["tune2fs", "resize2fs", "e2label", "xfs_growfs", "xfs_info", "dumpe2fs"], "Filesystem tuning (simulated)", c => {
    const sys = c.sh.sys, d = c.args.filter(a => !a.startsWith("-")).pop(); const b = sys.blk[d]; if (!b && c.name !== "xfs_growfs") return c.fail(`${c.name}: No such file or directory while trying to open ${d}`);
    if (c.name === "resize2fs" || c.name === "xfs_growfs") { if (!rootOnly(c, c.name)) return; c.p(`${c.name}: filesystem resized to fill the device.`); }
    else if (c.name === "e2label" && c.args[1]) b.label = c.args[1];
    else c.p(`Filesystem UUID:          ${b.uuid}\nFilesystem volume name:   ${b.label || "<none>"}\nFilesystem features:      has_journal ext_attr resize_inode dir_index filetype extent`);
  }, { sbin: true });

  // ---------- LVM ----------
  const vgFree = (sys, vg) => sys.vgs[vg].size - sys.lvs.filter(l => l.vg === vg).reduce((a, l) => a + l.size, 0);
  const lvDev = l => `/dev/mapper/${l.vg}-${l.lv}`;
  def("pvcreate", "Initialize physical volumes", c => {
    if (!rootOnly(c, "pvcreate")) return; const sys = c.sh.sys;
    for (const d of c.args.filter(a => !a.startsWith("-"))) { const b = sys.blk[d]; if (!b) { c.err(`  Device ${d} not found.`); continue; } if (sys.pvs.some(p => p.dev === d)) { c.err(`  Physical volume ${d} already exists`); continue; } if (sys.mountOf(d)) { c.err(`  Can't open ${d} exclusively. Mounted filesystem?`); continue; } sys.pvs.push({ dev: d, vg: null }); b.fs = "LVM2_member"; c.p(`  Physical volume "${d}" successfully created.`); }
  }, { sbin: true });
  def("vgcreate", "Create a volume group", c => {
    if (!rootOnly(c, "vgcreate")) return; const sys = c.sh.sys, { v, rest } = po(c.args, { val: "s" }), name = rest.shift();
    if (!name || !rest.length) return c.fail("  Please provide volume group name and physical volumes");
    if (sys.vgs[name]) return c.fail(`  A volume group called ${name} already exists.`);
    for (const d of rest) { const pv = sys.pvs.find(p => p.dev === d); if (!pv) return c.fail(`  Device ${d} not found (or ignored by filtering). Run pvcreate first.`); if (pv.vg) return c.fail(`  Physical volume '${d}' is already in volume group '${pv.vg}'`); }
    let size = 0; for (const d of rest) { const pv = sys.pvs.find(p => p.dev === d); pv.vg = name; size += sys.blk[d].size; }
    sys.vgs[name] = { size, pe: v.s ? V.parseMiB(v.s) : 4 }; c.p(`  Volume group "${name}" successfully created`);
  }, { sbin: true });
  def("vgextend", "Add physical volumes to a VG", c => {
    if (!rootOnly(c, "vgextend")) return; const sys = c.sh.sys, [name, ...ds] = c.args.filter(a => !a.startsWith("-")); if (!sys.vgs[name]) return c.fail(`  Volume group "${name}" not found`);
    for (const d of ds) { const pv = sys.pvs.find(p => p.dev === d); if (!pv) return c.fail(`  Device ${d} not found. Run pvcreate first.`); pv.vg = name; sys.vgs[name].size += sys.blk[d].size; } c.p(`  Volume group "${name}" successfully extended`);
  }, { sbin: true });
  def("lvcreate", "Create a logical volume", c => {
    if (!rootOnly(c, "lvcreate")) return; const sys = c.sh.sys, { v, rest } = po(c.args, { val: "nLln" }), vg = rest[0]; if (!sys.vgs[vg]) return c.fail(`  Volume group "${vg}" not found`);
    const lv = v.n; if (!lv) return c.fail("  Please specify a name with -n"); if (sys.lvs.some(l => l.vg === vg && l.lv === lv)) return c.fail(`  Logical volume "${lv}" already exists in volume group "${vg}"`);
    let size = v.L ? V.parseMiB(v.L) : NaN; if (v.l) { const m = /^(\d+)%(FREE|VG)$/.exec(v.l); size = m ? Math.floor(vgFree(sys, vg) * (+m[1] / 100)) : +v.l * sys.vgs[vg].pe; }
    if (isNaN(size) || size <= 0) return c.fail("  Invalid size specified"); if (size > vgFree(sys, vg)) return c.fail(`  Volume group "${vg}" has insufficient free space (${vgFree(sys, vg) / sys.vgs[vg].pe} extents): ${size / sys.vgs[vg].pe} required.`);
    const l = { vg, lv, size }; sys.lvs.push(l); sys.blk[lvDev(l)] = { type: "lvm", size, fs: null, vg, lv, used: 0 }; sys.syncDev(); c.p(`  Logical volume "${lv}" created.`);
  }, { sbin: true });
  def("lvextend", "Extend a logical volume", c => {
    if (!rootOnly(c, "lvextend")) return; const sys = c.sh.sys, { f, v, rest } = po(c.args, { val: "Ll" }), path = rest[0];
    const l = sys.lvs.find(x => path === `/dev/${x.vg}/${x.lv}` || path === lvDev(x)); if (!l) return c.fail(`  Failed to find logical volume "${path}"`);
    let add; const spec = v.L || v.l || ""; add = /^\+/.test(spec) ? V.parseMiB(spec.slice(1)) : V.parseMiB(spec) - l.size; if (/%FREE/.test(spec)) add = vgFree(sys, l.vg);
    if (isNaN(add) || add <= 0) return c.fail("  New size given is not larger than existing size."); if (add > vgFree(sys, l.vg)) return c.fail(`  Insufficient free space: ${add / 4} extents needed, but only ${vgFree(sys, l.vg) / 4} available`);
    l.size += add; sys.blk[lvDev(l)].size = l.size; c.p(`  Size of logical volume ${l.vg}/${l.lv} changed.`);
    if (f.r) c.p(`  Filesystem resized.`);
  }, { sbin: true });
  def("lvremove", "Remove a logical volume", c => {
    if (!rootOnly(c, "lvremove")) return; const sys = c.sh.sys, path = c.args.find(a => !a.startsWith("-")); const i = sys.lvs.findIndex(x => path === `/dev/${x.vg}/${x.lv}` || path === lvDev(x)); if (i < 0) return c.fail(`  Failed to find logical volume "${path}"`);
    const d = lvDev(sys.lvs[i]); if (sys.mountOf(d)) return c.fail(`  Logical volume ${path} contains a filesystem in use.`); delete sys.blk[d]; sys.lvs.splice(i, 1); sys.syncDev(); c.p(`  Logical volume "${path}" successfully removed.`);
  }, { sbin: true });
  def("vgremove", "Remove a volume group", c => { if (!rootOnly(c, "vgremove")) return; const sys = c.sh.sys, n = c.args.find(a => !a.startsWith("-")); if (!sys.vgs[n]) return c.fail(`  Volume group "${n}" not found`); if (sys.lvs.some(l => l.vg === n)) return c.fail(`  Volume group "${n}" still contains logical volumes`); delete sys.vgs[n]; sys.pvs.forEach(p => { if (p.vg === n) p.vg = null; }); c.p(`  Volume group "${n}" successfully removed`); }, { sbin: true });
  def("pvremove", "Remove physical volumes", c => { if (!rootOnly(c, "pvremove")) return; const sys = c.sh.sys; for (const d of c.args.filter(a => !a.startsWith("-"))) { const p = sys.pvs.find(x => x.dev === d); if (!p) { c.err(`  Device ${d} not found.`); continue; } if (p.vg) { c.err(`  PV ${d} is used by VG ${p.vg}`); continue; } sys.pvs = sys.pvs.filter(x => x !== p); sys.blk[d].fs = null; c.p(`  Labels on physical volume "${d}" successfully wiped.`); } }, { sbin: true });
  def(["pvs", "pvdisplay"], "Report physical volumes", c => { const sys = c.sh.sys; c.p("  PV         VG   Fmt  Attr PSize   PFree"); for (const p of sys.pvs) c.p(`  ${p.dev.padEnd(10)} ${(p.vg || "").padEnd(4)} lvm2 a--  ${sizeStr(sys.blk[p.dev].size).padStart(6)} ${sizeStr(p.vg ? Math.round(vgFree(sys, p.vg) / sys.pvs.filter(x => x.vg === p.vg).length) : sys.blk[p.dev].size).padStart(6)}`); }, { sbin: true });
  def(["vgs", "vgdisplay"], "Report volume groups", c => { const sys = c.sh.sys; c.p("  VG   #PV #LV #SN Attr   VSize   VFree"); for (const [n, v] of Object.entries(sys.vgs)) c.p(`  ${n.padEnd(4)} ${String(sys.pvs.filter(p => p.vg === n).length).padStart(3)} ${String(sys.lvs.filter(l => l.vg === n).length).padStart(3)}   0 wz--n- ${sizeStr(v.size).padStart(7)} ${sizeStr(vgFree(sys, n)).padStart(7)}`); }, { sbin: true });
  def(["lvs", "lvdisplay"], "Report logical volumes", c => { const sys = c.sh.sys; c.p("  LV   VG   Attr       LSize"); for (const l of sys.lvs) c.p(`  ${l.lv.padEnd(4)} ${l.vg.padEnd(4)} -wi-a----- ${sizeStr(l.size).padStart(6)}`); }, { sbin: true });

  // ---------- RAID ----------
  def("mdadm", "Manage Linux software RAID", c => {
    const sh = c.sh, sys = sh.sys, { f, v, rest } = po(c.args, { val: "lnCx", long: { level: "v", "raid-devices": "v", create: "v", detail: "v" } });
    if (f.D || f.detail) { for (const r of sys.raid.filter(x => !rest[0] || x.name === rest[0])) c.p(`${r.name}:\n   Raid Level : ${r.level}\n   Array Size : ${r.size * 1024}\n State : clean\n Active Devices : ${r.devs.length}\n${r.devs.map((d, i) => `   ${i}   ${d}  active sync`).join("\n")}`); return; }
    if (!rootOnly(c, "mdadm")) return;
    if (c.args.some(a => a === "-C" || a === "--create") || rest[0]?.startsWith("/dev/md")) {
      const li = c.args.findIndex(a => a === "--level" || a === "-l"), la = c.args.find(a => a.startsWith("--level=")); const level = la ? la.split("=")[1] : li >= 0 ? c.args[li + 1] : (v.level || v.l); const name = c.args.find(a => /^\/dev\/md/.test(a)); const rest2 = rest.filter(a => a !== name); const devs = rest2.filter(d => d.startsWith("/dev/")); const need = { "0": 2, "1": 2, "5": 3, "6": 4, "10": 4, raid0: 2, raid1: 2, raid5: 3, raid6: 4, raid10: 4 };
      const lv = String(level).replace("raid", ""); if (!["0", "1", "5", "6", "10"].includes(lv)) return c.fail(`mdadm: invalid raid level: ${level}`);
      if (devs.length < need[lv]) return c.fail(`mdadm: not enough devices for RAID${lv}: need ${need[lv]}`);
      for (const d of devs) if (!sys.blk[d]) return c.fail(`mdadm: cannot open ${d}: No such file or directory`);
      const sizes = devs.map(d => sys.blk[d].size), mn = Math.min(...sizes); const size = lv === "0" ? mn * devs.length : lv === "1" ? mn : lv === "5" ? mn * (devs.length - 1) : lv === "6" ? mn * (devs.length - 2) : mn * devs.length / 2;
      sys.raid.push({ name, level: "raid" + lv, devs, size }); sys.blk[name] = { type: "raid", size, fs: null, used: 0 }; sys.syncDev(); c.p(`mdadm: array ${name} started.`);
    } else if (f.S || f.stop) { const r = sys.raid.findIndex(x => x.name === rest[0]); if (r >= 0) { delete sys.blk[rest[0]]; sys.raid.splice(r, 1); sys.syncDev(); c.p(`mdadm: stopped ${rest[0]}`); } }
    else return c.fail("mdadm: unsupported in the simulator; try: mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc");
  }, { sbin: true });

  // ---------- quotas ----------
  def(["quotacheck", "quotaon", "quotaoff", "edquota", "setquota"], "Disk quota tools (simulated)", c => { if (!rootOnly(c, c.name)) return; c.p(`${c.name}: done (quotas are simulated; see Module 5 notes for the workflow)`); }, { sbin: true });
  def(["repquota", "quota"], "Report disk quotas", c => { c.p("*** Report for user quotas on device /dev/sda4\nBlock grace time: 7days; Inode grace time: 7days\n                        Block limits                File limits\nUser            used    soft    hard  grace    used  soft  hard  grace\n----------------------------------------------------------------------\nstudent   --   12400       0       0              213     0     0"); });
  def("lsof", "List open files (simulated)", c => { c.p("COMMAND  PID    USER   FD   TYPE DEVICE NODE NAME\nbash    4242 " + c.sh.user + "  cwd    DIR    8,3 1001 " + c.sh.cwd); });
  def("sync", "Flush file system buffers", () => 0);
})();
