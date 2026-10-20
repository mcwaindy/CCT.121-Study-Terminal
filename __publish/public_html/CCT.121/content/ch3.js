CCT.addChapter({
  id: "ch3", num: 3, title: "Understanding Hard Disks and File Systems",
  summary: "HDD/SSD anatomy, addressing, interfaces, logical structure, clusters and slack, MBR, GPT, and the boot process.",

  notes: [
    { id: "hdd", title: "Hard Disk Drive Anatomy", category: "apps",
      summary: "Platters, heads, actuator, spindle, tracks, sectors, cylinders.",
      body: `
<div class="key"><b>HDD:</b> non-volatile storage; spinning platters coated with magnetic material. Faster RPM = better performance. Moving parts = <b>susceptible to physical damage</b>.</div>
<table><tr><th>Part</th><th>Function</th></tr>
<tr><td>Platter</td><td>Spinning disk (aluminum/glass), magnetic coating; data stored as magnetic patterns</td></tr>
<tr><td>Read/write head</td><td>Above each platter on an actuator arm; changes magnetic orientation to write, senses to read</td></tr>
<tr><td>Actuator arm</td><td>Positions heads over the correct track</td></tr>
<tr><td>Spindle motor</td><td>Spins platters. Common: <b>5,400 and 7,200 RPM</b></td></tr>
<tr><td>Controller &amp; firmware</td><td>Read/write, error correction, power management, bad sector management</td></tr>
<tr><td>Cache</td><td>Small high-speed RAM for frequently accessed data</td></tr>
<tr><td>Interface</td><td>SATA and SAS common; NVMe for SSDs</td></tr></table>
<h3>Tracks, sectors, cylinders</h3>
<ul>
<li><b>Track:</b> concentric circle on a platter. Numbered from <b>0 at the outer edge</b> inward.</li>
<li><b>Sector:</b> smallest physical storage unit. <b>512 bytes</b> (legacy) or <b>4096 bytes (4K)</b> on newer drives (eight 512-byte sectors combined).</li>
<li><b>Cylinder:</b> all tracks of the same diameter across all stacked platters (heads move together, so location is given by cylinder).</li>
</ul>
<h3>Contents of a sector</h3>
<p>ID info, synchronization fields, <b>data</b>, <b>ECC</b> (error-correction code), gaps. These form the sector overhead.</p>` },

    { id: "density", title: "Data Density, LBA & Capacity", category: "apps",
      summary: "Zoned bit recording, density formulas, LBA, capacity math, performance terms.",
      body: `
<ul>
<li><b>Zoned bit recording (ZBR):</b> tracks grouped into zones; <b>outer tracks hold more sectors</b>. Higher total capacity.</li>
<li><b>Track density (TPI):</b> how closely tracks are spaced. <b>Bit density (BPI):</b> bits per inch along a track.</li>
</ul>
<div class="key"><b>Areal density (bpsi) = Bit density (BPI) &times; Track density (TPI)</b></div>
<h3>LBA (Logical Block Addressing)</h3>
<ul><li>Linear: every block/sector gets a consecutive number: LBA 0, 1, 2...</li><li><b>Replaces CHS</b> (cylinder-head-sector). Needs BIOS, drive, OS support.</li></ul>
<div class="key"><b>Disk capacity = number of LBAs &times; block size</b><br>Example: 1,000,215,216 LBAs &times; 512 B = 512,110,190,592 bytes (&asymp; 512 GB).</div>
<h3>Performance terms</h3>
<table><tr><th>Term</th><th>Meaning</th></tr>
<tr><td>Seek time</td><td>Position heads over the track</td></tr>
<tr><td>Rotational latency</td><td>Platter rotates to the correct sector</td></tr>
<tr><td>Access time</td><td>Seek + rotational latency (+ transfer)</td></tr>
<tr><td>Sequential / random transfer rate</td><td>Large in-order blocks vs. scattered access</td></tr>
<tr><td>IOPS</td><td>Read/write operations per second</td></tr>
<tr><td>Burst rate</td><td>Peak transfer for short bursts</td></tr>
<tr><td>Throughput</td><td>Actual data transferred</td></tr></table>` },

    { id: "ssd", title: "Solid State Drives", category: "apps",
      summary: "NAND, cell types, components.",
      body: `
<ul><li><b>NAND-based:</b> non-volatile flash, <b>no moving parts</b>.</li><li><b>Volatile-based:</b> DRAM, for very fast access; needs battery and backup storage.</li></ul>
<table><tr><th>Cell</th><th>Trait</th></tr>
<tr><td>SLC (single)</td><td>Highest durability/performance, expensive</td></tr>
<tr><td>MLC (multi)</td><td>Balanced</td></tr>
<tr><td>TLC (triple)</td><td>High capacity, lower durability/performance</td></tr>
<tr><td>QLC (quad)</td><td>Highest capacity, lowest endurance</td></tr></table>
<p><b>Components:</b> NAND flash (floating-gate transistors; main storage), <b>controller</b> (bridge between flash and host), DRAM (needs power), host interface (SATA, PCIe, SCSI).</p>` },

    { id: "interfaces", title: "Disk Interfaces", category: "apps",
      summary: "SATA/AHCI, SCSI, SAS, PCIe, NVMe.",
      body: `
<table><tr><th>Interface</th><th>Key facts</th></tr>
<tr><td><b>SATA</b> (AHCI)</td><td>Replaced parallel ATA. SATA III = 3rd gen, backward compatible; <b>7-pin data, 15-pin power</b>. mSATA is smaller. <b>AHCI</b> = protocol between OS and SATA controller; <b>NCQ</b> reorders commands; hot-swap.</td></tr>
<tr><td><b>SCSI</b></td><td>ANSI standard; up to <b>16 devices</b>; daisy-chain; command queueing; hot-swap; RAID.</td></tr>
<tr><td><b>SAS</b></td><td>Serial Attached SCSI; successor to parallel SCSI; serial, <b>full-duplex</b>; dual ports/multipath; redundancy; backward compatible.</td></tr>
<tr><td><b>PCIe</b></td><td>High-speed expansion bus.</td></tr>
<tr><td><b>NVMe</b></td><td>Protocol AND interface optimized for SSDs; high transfer, <b>low latency</b>. Form factors: PCIe, M.2, U.2.</td></tr></table>` },

    { id: "logical", title: "Logical Structure of a Disk", category: "apps",
      summary: "Bits to file system; partitions; FAT/inode tables.",
      body: `
<p>Different OSes organize the same disk differently, so a logical structure is needed to understand it.</p>
<ol>
<li><b>Bit:</b> lowest level.</li><li><b>Sector:</b> smallest addressable unit (512 B).</li><li><b>Cluster (block):</b> successive sectors; smallest file system allocation unit.</li><li><b>File system:</b> files, directories, metadata.</li>
</ol>
<ul>
<li><b>Allocation table (FAT / inode table):</b> tracks file locations and clusters.</li>
<li><b>Partition table:</b> divides a disk into partitions, each with its own file system. <b>MBR or GPT.</b></li>
<li><b>RAID:</b> several disks forming one logical volume (redundancy, performance).</li>
</ul>
<h3>Clusters</h3>
<ul>
<li>Also called <b>allocation units</b>; formed from contiguous sectors. Typically 4 to 64 sectors (up to 128).</li>
<li>Larger volumes use larger clusters; partitioning decides size.</li>
<li>Files may become <b>fragmented</b> (non-contiguous), slowing access.</li>
</ul>
<div class="key warn"><b>Lost clusters:</b> allocation table error: the OS marks clusters <b>in use</b> but no file is linked to them. <b>Logical, not physical</b> error; caused by improper closing of files. Detect/fix: <code>chkdsk.exe</code>, file system check, disk diagnostics.</div>
<div class="key"><b>Orphan file:</b> file data still exists but no directory entry points to it.</div>` },

    { id: "slack", title: "Slack Space", category: "apps",
      summary: "RAM slack vs. drive slack and why it is forensic gold.",
      body: `
<div class="key"><b>Slack space (file slack):</b> wasted area between the <b>end of a file</b> and the <b>end of its last cluster</b>. Example: 900-byte file in a 4096-byte cluster wastes the rest.</div>
<table><tr><th>RAM slack</th><th>Drive slack</th></tr>
<tr><td>End of file to the end of the <b>last sector</b></td><td>End of the last sector to the end of the <b>last cluster</b></td></tr></table>
<ul>
<li>Reduce it: smaller clusters (NTFS on large partitions), partitioning, archiving unused files.</li>
<li><b>Forensic value:</b> data recovery, metadata, reconstructing fragments, hidden or encrypted data, file signatures.</li>
</ul>` },

    { id: "mbr", title: "Master Boot Record (MBR)", category: "apps",
      summary: "Layout, 446/64/2 bytes, partition limits, dd backup.",
      body: `
<p>First sector (<b>sector 0</b>) of the disk. Holds the partition table, bootstraps the OS (boot code loads the rest of the OS into RAM).</p>
<table><tr><th>Structure</th><th>Size</th><th>Role</th></tr>
<tr><td>Master boot code (bootstrap)</td><td><b>446 bytes</b></td><td>Executable; loaded by BIOS; finds active partition, loads its boot sector, transfers control</td></tr>
<tr><td>Partition table</td><td><b>64 bytes</b></td><td>4 entries: start/end sector, FS type, bootable flag</td></tr>
<tr><td>Disk (boot) signature</td><td><b>2 bytes</b></td><td>End of MBR (0x55AA)</td></tr></table>
<div class="key"><b>MBR limits:</b> only <b>4 primary partitions</b> (extra are logical inside one extended). 32-bit LBAs: max ~2 TB. Modern systems use <b>GPT</b>.</div>
<h3>Backup / restore the MBR</h3>
<pre>dd if=/dev/sda of=mbr.backup bs=512 count=1   # backup
dd if=mbr.backup of=/dev/sda bs=512 count=1   # restore</pre>
<p><code>if</code> input, <code>of</code> output, <code>bs</code> block size, <code>count=1</code> read one block.</p>` },

    { id: "partitions", title: "Partitions & BIOS Parameter Block", category: "apps",
      summary: "Primary/extended partitions, hidden data, BPB, GUID.",
      body: `
<ul>
<li><b>Partitioning:</b> creating logical drives for OS-specific formatting; organizes data, multiple OSes, encryption/access control.</li>
<li><b>Primary partition:</b> holds file system, OS info, boot info (up to 4). <b>Extended:</b> a logical drive container.</li>
<li><b>Inter-partition gap:</b> space between partitions. <b>Hidden partitions and gaps can hide data.</b></li>
</ul>
<h3>BIOS Parameter Block (BPB)</h3>
<p>In the <b>volume boot record (VBR)</b>, sector 1 of the volume. Describes the volume's physical layout: <b>bytes per sector, sectors per cluster</b>, reserved sectors, number of FATs, root directory entries, media descriptor, hidden sectors. Fields vary by file system.</p>
<h3>GUID</h3>
<p><b>128-bit</b> unique number, shown as 32 hex digits with hyphens. Windows uses it for devices, documents, users, COM, DLLs. In GPT, every partition gets a GUID.</p>` },

    { id: "gpt", title: "GUID Partition Table (GPT)", category: "apps",
      summary: "Layout: protective MBR, header, entries, advantages.",
      body: `
<p>Part of <b>UEFI</b>. Overcomes MBR limits.</p>
<table><tr><th>LBA</th><th>Content</th></tr>
<tr><td><b>0</b></td><td><b>Protective MBR</b> (one partition, type <b>0xEE</b>)</td></tr>
<tr><td><b>1</b></td><td><b>GPT header</b> (signature <code>EFI PART</code>, disk GUID, pointer to the array)</td></tr>
<tr><td><b>2 to 33</b></td><td>Partition entry array: 128 entries &times; 128 bytes = 16,384 bytes</td></tr>
<tr><td><b>34</b></td><td>First usable sector</td></tr>
<tr><td>-33 to -2</td><td>Backup partition array</td></tr>
<tr><td><b>-1</b></td><td>Secondary (backup) GPT header</td></tr></table>
<ul>
<li>Negative addressing counts from the end: <b>-1 is the last block</b>.</li>
<li><b>Advantages:</b> disks &gt; 2 TB, up to <b>128 partitions</b>, CRC checks, GUID per partition, backup copy.</li>
<li><b>Protective MBR:</b> legacy tools see one 0xEE partition and mark the disk unknown instead of overwriting it.</li>
</ul>
<table><tr><th></th><th>MBR</th><th>GPT</th></tr><tr><td>Partitions</td><td>4 primary</td><td>128</td></tr><tr><td>Max size</td><td>~2 TB</td><td>&gt; 2 TB</td></tr><tr><td>Firmware</td><td>BIOS</td><td>UEFI</td></tr><tr><td>Integrity</td><td>None</td><td>CRC + backup header</td></tr></table>` },

    { id: "boot", title: "Boot Process & Windows Boot Files", category: "apps",
      summary: "Cold vs warm boot, POST, key Windows files.",
      body: `
<table><tr><th>Cold (hard) boot</th><th>Warm (soft) boot</th></tr>
<tr><td>Power first turned on / fully cut. Full init: hardware check, BIOS load, <b>POST</b>, start OS. Clears memory, resets components.</td><td>Restart via the OS. Faster. <b>No POST.</b></td></tr></table>
<p>Boot: BIOS stores the first instruction, runs POST (checks BIOS chip and CMOS RAM), then loads boot code.</p>
<table><tr><th>File</th><th>Role</th></tr>
<tr><td>Bootmgr</td><td>Primary bootloader for modern Windows</td></tr>
<tr><td>Winload.exe</td><td>Loads kernel and essential system files</td></tr>
<tr><td>Ntoskrnl.exe</td><td>Kernel: hardware, memory, processes, services</td></tr>
<tr><td>Ntkrnlpa.exe</td><td>Kernel variant with PAE support</td></tr>
<tr><td>Hal.dll</td><td>Hardware abstraction layer</td></tr>
<tr><td>Registry hives</td><td>Hardware/software configuration</td></tr>
<tr><td>System32</td><td>Essential system files and DLLs</td></tr>
<tr><td>Win32k.sys</td><td>Kernel-mode graphics and user input</td></tr>
<tr><td>Ntdll.dll</td><td>Internal support functions; native API</td></tr></table>` },

    { id: "ntfs", title: "NTFS Concepts: MFT, Resident Files", category: "apps",
      summary: "MFT, resident vs non-resident files, orphan files, registry.",
      body: `
<div class="key"><b>MFT (Master File Table):</b> core NTFS structure: a record for <b>every file and folder</b> (size, timestamps, permissions, location, metadata). The central index.</div>
<table><tr><th>Resident file</th><th>Non-resident file</th></tr>
<tr><td>Entire content stored <b>inside the MFT record</b> (small, roughly &lt; 700-900 bytes). No external clusters; may be missed by carving.</td><td>Content in <b>external clusters</b>; MFT holds <b>data runs</b> (pointers). Most files. Recoverable via clusters/carving.</td></tr></table>
<ul>
<li><b>Deleted-file recovery:</b> MFT entries reveal recently deleted files, original paths, timestamps.</li>
<li><b>Orphan file:</b> data clusters exist but no directory entry points to them.</li>
<li><b>Windows Registry:</b> hierarchical database of system and user config: hives, keys, values.</li>
<li><b>File signature check:</b> compare extension with header magic bytes (e.g. FF D8 FF = JPEG, 89 50 4E 47 = PNG, 25 50 44 46 = PDF, 50 4B 03 04 = ZIP/Office).</li>
</ul>` },

	{ id: "fat", title: "FAT File System & Boot Sector", category: "apps",
	  summary: "FAT12/16/32 comparison, chain following, boot sector layout.",
	  body: `
<p>FAT was the first Windows file system (DOS, Windows, OpenDOS). It is named for the <b>file allocation table at the start of the volume</b>.</p>
<table><tr><th>Version</th><th>Max volume</th><th>Cluster size</th><th>Cluster count</th></tr>
<tr><td>FAT12</td><td>16 MB</td><td>4 KB or less</td><td>&lt; 4,087</td></tr>
<tr><td>FAT16</td><td>4 GB</td><td>2 KB to 32 KB</td><td>4,087 to 65,526</td></tr>
<tr><td>FAT32</td><td>2 TB</td><td>4 KB to 32 KB</td><td>65,526 to 268,435,456</td></tr></table>
<p><b>How it works:</b> a directory entry (e.g. File1.dat, 4,000 bytes) points to its first cluster (34); the FAT chains cluster 34 &rarr; 35 &rarr; <b>EOF</b>.</p>
<h3>FAT partition boot sector</h3>
<p>First sector (512 bytes) of the file system. The MBR uses it to load system kernel files.</p>
<table><tr><th>Offset (hex)</th><th>Length</th><th>Content</th></tr>
<tr><td>00</td><td>3 B</td><td>Jump instruction (EB 3C 90)</td></tr>
<tr><td>03</td><td>8 B</td><td>OEM name (MS-DOS 5.0)</td></tr>
<tr><td>0B</td><td>25 B</td><td>BIOS Parameter Block (BPB)</td></tr>
<tr><td>24</td><td>26 B</td><td>Extended BPB</td></tr>
<tr><td>3E</td><td>448 B</td><td>Bootstrap code</td></tr>
<tr><td>1FE</td><td>2 B</td><td><b>0x55AA</b> end-of-sector marker</td></tr></table>
<h3>NTFS vs FAT (recap)</h3>
<p>NTFS adds file-level security (ACLs), compression, auditing, <b>journaling</b> (logs changes to restore a consistent state after a crash), better metadata, and advanced structures for performance and reliability.</p>` },

	{ id: "encoding", title: "ASCII, Unicode & Hexadecimal", category: "apps",
	  summary: "Character encodings and the hex/binary/decimal table.",
	  body: `
<table><tr><th>ASCII</th><th>Unicode</th></tr>
<tr><td>128 characters in <b>7-bit</b> integers; from telegraph codes. Digits, a-z, A-Z, basic punctuation, space, control codes (from teletypes)</td><td>International standard; a unique number for every character regardless of platform, program, language. Forms: <b>UTF-8, UTF-16, UTF-32</b></td></tr></table>
<h3>Hexadecimal</h3>
<ul>
<li>Base 16: 0-9 and A-F (A=10 ... F=15). Each hex digit = 4 bits.</li>
<li>Example: <b>2BA</b> = 0010 1011 1010.</li>
<li>Makes powers of 2 easy compared with writing whole values in binary.</li>
</ul>
<table><tr><th>Hex</th><th>Bin</th><th>Dec</th><th>Hex</th><th>Bin</th><th>Dec</th></tr>
<tr><td>0</td><td>0000</td><td>0</td><td>8</td><td>1000</td><td>8</td></tr>
<tr><td>1</td><td>0001</td><td>1</td><td>9</td><td>1001</td><td>9</td></tr>
<tr><td>2</td><td>0010</td><td>2</td><td>A</td><td>1010</td><td>10</td></tr>
<tr><td>3</td><td>0011</td><td>3</td><td>B</td><td>1011</td><td>11</td></tr>
<tr><td>4</td><td>0100</td><td>4</td><td>C</td><td>1100</td><td>12</td></tr>
<tr><td>5</td><td>0101</td><td>5</td><td>D</td><td>1101</td><td>13</td></tr>
<tr><td>6</td><td>0110</td><td>6</td><td>E</td><td>1110</td><td>14</td></tr>
<tr><td>7</td><td>0111</td><td>7</td><td>F</td><td>1111</td><td>15</td></tr></table>` },

	{ id: "hddrecap", title: "HDD Components & Sector Recap (Midterm)", category: "apps",
	  summary: "Components, tracks, sectors, performance and the capacity example.",
	  body: `
<ul>
<li>HDD: non-volatile, records magnetically on metallic platters. <b>Read/write performance is proportional to RPM.</b> Moving parts mean physical damage and wear.</li>
<li><b>Components:</b> slider (and head), actuator and actuator axis, actuator arm, platters, spindle, power connector, jumper pins, SCSI connector.</li>
<li><b>Tracks:</b> concentric circles, numbered; the head reads one position at a time. <b>Sectors:</b> smallest physical unit; <b>512 B</b> standard, newest drives <b>4,096 B (4 KB)</b>. <b>Clusters:</b> groups of sectors allocated to a file. Best storage is <b>contiguous</b>.</li>
<li><b>Data density:</b> track density (track spacing), bit density (BPI), areal density (data per unit area). Zoned recording groups tracks into zones by distance from center.</li>
<li><b>Capacity = total LBAs &times; block size.</b> Example: 1,000,000 &times; 4,096 = 4,096,000,000 bytes &asymp; <b>3.81 GB</b> (binary GB).</li>
<li><b>GUID:</b> 128-bit, 32 hex digits with hyphens; used for COM/DLLs in the registry, database primary keys, browser session tracking, Windows user accounts.</li>
</ul>` }
  ],

  glossary: [
    ["Sector", "Smallest addressable storage unit of a disk: 512 bytes or 4096 bytes. Basic building block of physical organization.", "A damaged sector stopped the file system loading; examiners worked from the raw image."],
    ["Cluster", "Group of one or more sectors allocated by the file system as one unit; the minimum allocation size, so even a tiny file uses a whole cluster.", "With 4096-byte clusters a 900-byte log file consumed an entire cluster."],
    ["Slack Space", "Leftover bytes in a file's final allocated cluster not used by its data. May contain remnants of earlier data.", "Slack space held fragments of an older report."],
    ["Master File Table (MFT)", "Core NTFS structure storing a record for every file and folder (size, timestamps, permissions, location). The central index.", "MFT entries exposed recently deleted files and their paths."],
    ["Resident File", "File whose whole content is stored in its MFT record because it is small enough (~700-900 bytes).", "The config file's contents were found inside the MFT entry."],
    ["Non-resident File", "File whose content lives in external clusters; MFT holds data runs pointing to them. Most NTFS files.", "Investigators followed data runs to find the video's clusters."],
    ["Orphan File", "File whose data still exists but has no directory entry pointing to it (metadata corrupted, deleted, or overwritten).", "Orphan files were found by scanning raw clusters."],
    ["Partition", "Logically defined section of a storage device with its own boundaries that can host a file system, OS, or system data (EFI, Recovery).", ""],
    ["Registry", "Windows hierarchical database of configuration, settings, device info, installed software; organized into hives, keys, values.", ""],
    ["LBA", "Logical Block Addressing: linear numbering of sectors/blocks (0, 1, 2...) replacing CHS.", ""],
    ["Cylinder", "Set of all tracks at the same diameter across stacked platters; read/write heads sit over the same track number together.", ""],
    ["ZBR", "Zoned bit recording: tracks grouped in zones; outer zones hold more sectors per track.", ""],
    ["MBR", "Master Boot Record: sector 0; 446-byte boot code, 64-byte partition table (4 entries), 2-byte signature.", ""],
    ["GPT", "GUID Partition Table: UEFI scheme; up to 128 partitions, >2 TB, CRC, backup header; LBA 0 protective MBR, LBA 1 header.", ""],
    ["BPB", "BIOS Parameter Block: in the VBR, describes volume layout (bytes per sector, sectors per cluster...).", ""],
    ["GUID", "128-bit unique identifier displayed as 32 hex digits with hyphens.", ""],
    ["POST", "Power-On Self-Test: hardware check performed during cold boot (not warm boot).", ""],
    ["NVMe", "Non-volatile memory express: protocol and interface optimized for SSDs; high throughput, low latency.", ""],
    ["AHCI", "Advanced Host Controller Interface: protocol between OS and SATA controller; supports NCQ and hot-swap.", ""],
    ["Lost Cluster", "Clusters marked in use but linked to no file; a logical allocation table error (fix with chkdsk).", ""],
    ["Drive Slack", "Space from the end of a file's last sector to the end of its last cluster.", ""],
    ["RAM Slack", "Space from the end of a file to the end of its last sector.", ""],
	["FAT (File Allocation Table)", "File system whose allocation table sits at the start of the volume; FAT12, FAT16, FAT32 differ in entry size.", ""],
	["FAT32 Limits", "Up to 2 TB volumes; 4 KB to 32 KB clusters; 65,526 to 268,435,456 clusters.", ""],
	["Boot Sector Marker (0x55AA)", "2-byte end-of-sector marker at offset 1FE of the boot sector.", ""],
	["ASCII", "7-bit encoding of 128 characters.", ""],
	["Unicode", "Universal character encoding with forms UTF-8, UTF-16, UTF-32.", ""],
	["Hexadecimal", "Base-16 notation; each digit is 4 bits (0-9, A-F).", "2BA = 0010 1011 1010."],
	["Bootstrap Code", "Boot sector code (448 bytes in the FAT boot sector) that loads the system.", ""]
  ],

  cards: [
    ["Which components make up an HDD?", "Platters, read/write heads, actuator arm, spindle motor, controller/firmware, cache, interface."],
    ["Common HDD speeds?", "5,400 and 7,200 RPM."],
    ["Where does track numbering start?", "Track 0 at the outer edge, moving inward."],
    ["Sector size: legacy vs modern?", "512 bytes vs 4096 bytes (4K = eight 512-byte sectors)."],
    ["What is a cylinder?", "All tracks with the same diameter across the stacked platters."],
    ["Sector contents?", "ID info, sync fields, data, ECC, gaps."],
    ["Areal density formula?", "Bit density (BPI) x Track density (TPI)."],
    ["What does ZBR do?", "Zones: outer tracks hold more sectors, giving higher capacity."],
    ["Disk capacity formula?", "Number of LBAs x block size."],
    ["LBA replaces what?", "CHS (cylinder-head-sector) addressing."],
    ["Seek time vs rotational latency?", "Seek: position heads over track. Rotational: platter turns to the sector."],
    ["SLC / MLC / TLC / QLC?", "Single/multi/triple/quad-level cell: capacity rises, durability and performance fall."],
    ["SATA III connectors?", "7-pin data cable, 15-pin power cable."],
    ["What does NCQ do?", "Lets the drive queue and reorder read/write commands (AHCI feature)."],
    ["SCSI device limit?", "Up to 16 peripherals; daisy-chained."],
    ["SAS vs parallel SCSI?", "SAS is the serial successor: full-duplex, dual ports, multipath, redundancy."],
    ["NVMe form factors?", "PCIe, M.2, U.2."],
    ["What are lost clusters?", "Clusters marked in-use with no file linked. Logical error; fix with chkdsk."],
    ["RAM slack vs drive slack?", "RAM slack: end of file to end of last sector. Drive slack: end of last sector to end of last cluster."],
    ["MBR structure sizes?", "446-byte boot code, 64-byte partition table, 2-byte signature = 512 bytes."],
    ["Max partitions in MBR vs GPT?", "4 primary vs 128."],
    ["Back up the MBR with dd?", "dd if=/dev/sda of=mbr.backup bs=512 count=1"],
    ["GPT: what is at LBA 0, 1, -1?", "Protective MBR (type 0xEE), primary GPT header, secondary GPT header."],
    ["GPT header signature?", "EFI PART (ASCII)."],
    ["First usable sector in GPT with 512-byte sectors?", "LBA 34."],
    ["Where is the BPB?", "In the volume boot record (sector 1 of the volume)."],
    ["Cold vs warm boot?", "Cold: from power off, includes POST. Warm: OS restart, no POST."],
    ["Windows boot chain files?", "Bootmgr, then Winload.exe, then Ntoskrnl.exe (plus Hal.dll, registry hives)."],
    ["Resident vs non-resident file?", "Resident: content inside the MFT record. Non-resident: content in clusters via data runs."],
    ["Why is the MFT valuable to examiners?", "Shows deleted entries, original paths, timestamps for every file."],
    ["JPEG header bytes?", "FF D8 FF."],
	["FAT12 / FAT16 / FAT32 max volume?", "16 MB / 4 GB / 2 TB."],
	["FAT12 cluster count?", "Fewer than 4,087."],
	["FAT16 cluster count?", "4,087 to 65,526."],
	["FAT32 cluster count?", "65,526 to 268,435,456."],
	["How does FAT locate a file?", "The directory entry points to the first cluster; the FAT chains clusters until EOF."],
	["FAT boot sector size and end marker?", "512 bytes; 0x55AA at offset 1FE."],
	["Boot sector offsets: jump, OEM, BPB, extended BPB, bootstrap?", "00 (3 B), 03 (8 B), 0B (25 B), 24 (26 B), 3E (448 B)."],
	["ASCII width and size?", "7 bits; 128 characters."],
	["Unicode encoding forms?", "UTF-8, UTF-16, UTF-32."],
	["Convert hex 2BA to binary.", "0010 1011 1010."],
	["Hex F in binary and decimal?", "1111 and 15."],
	["Common HDD sector sizes?", "512 bytes standard; 4,096 (4 KB) on newer drives."],
	["Capacity of 1,000,000 LBAs at 4 KB?", "4,096,000,000 bytes, about 3.81 GB."],
	["HDD performance is proportional to what?", "RPM."],
	["Four uses of a GUID?", "COM/DLL IDs in registry, database primary keys, browser session tracking, Windows user accounts."]
  ],

  quiz: [
    ["A drive has 1,953,525,168 LBAs of 512 bytes. Approximate capacity?", ["500 GB", "1 TB", "2 TB", "250 GB"], 1, "1,953,525,168 x 512 = ~1.0 x 10^12 bytes = 1 TB."],
    ["Which partitioning scheme stores a protective MBR at LBA 0?", ["MBR", "GPT", "FAT", "NTFS"], 1, ""],
    ["Which has the 446-byte bootstrap code?", ["GPT header", "MBR", "BPB", "MFT"], 1, ""],
    ["Maximum primary partitions in MBR?", ["2", "4", "16", "128"], 1, ""],
    ["Which is NOT a benefit of GPT?", ["Disks > 2 TB", "CRC integrity checks", "Up to 4 partitions only", "GUID per partition"], 2, ""],
    ["A 900-byte file sits in a 4096-byte cluster. The unused rest is...", ["Lost cluster", "Slack space", "Unallocated space", "Orphan"], 1, ""],
    ["Clusters marked used but linked to no file are called...", ["Slack", "Lost clusters", "Resident data", "ECC"], 1, ""],
    ["Which tool fixes lost clusters on Windows?", ["chkdsk.exe", "dd", "regedit", "ping"], 0, ""],
    ["Which file is stored directly inside its MFT record?", ["Non-resident", "Resident", "Orphan", "Fragmented"], 1, ""],
    ["Track numbering starts at 0 at the...", ["Center", "Outer edge", "Random", "Spindle"], 1, ""],
    ["What is areal density?", ["BPI + TPI", "BPI x TPI", "BPI / TPI", "TPI - BPI"], 1, ""],
    ["Which boot type does NOT perform POST?", ["Cold", "Warm", "Hard", "Power-on"], 1, ""],
    ["Which Windows file is the primary bootloader?", ["Ntoskrnl.exe", "Bootmgr", "Hal.dll", "Win32k.sys"], 1, ""],
    ["Which interface is both a protocol and interface optimized for SSDs?", ["SATA", "SCSI", "NVMe", "PATA"], 2, ""],
    ["Which SSD cell type has the best durability and performance?", ["SLC", "MLC", "TLC", "QLC"], 0, ""],
    ["A file named report.txt begins with bytes FF D8 FF. What is it likely?", ["Text file", "JPEG image with a changed extension", "PDF", "ZIP"], 1, "FF D8 FF is the JPEG signature."],
    ["The BIOS Parameter Block lives in the...", ["MBR", "Volume boot record", "GPT header", "Registry"], 1, ""],
	["Maximum FAT16 volume size?", ["16 MB", "4 GB", "2 TB", "256 TB"], 1, ""],
	["Which FAT version supports up to 2 TB?", ["FAT12", "FAT16", "FAT32", "All"], 2, ""],
	["Where is the FAT located?", ["End of the disk", "Beginning of the volume", "In the MBR", "In the registry"], 1, ""],
	["The 0x55AA marker is at which boot sector offset?", ["00", "0B", "3E", "1FE"], 3, ""],
	["The BPB in the FAT boot sector starts at offset...", ["00", "03", "0B", "24"], 2, "Offset 0B, 25 bytes."],
	["ASCII uses how many bits per character?", ["5", "7", "8", "16"], 1, ""],
	["Which is NOT a Unicode encoding form?", ["UTF-8", "UTF-16", "UTF-32", "UTF-7-bit ASCII"], 3, ""],
	["Hex 2BA in binary is...", ["0010 1011 1010", "0101 1011 1010", "0010 1010 1011", "1011 0010 1010"], 0, ""],
	["Capacity of 1,000,000 LBAs at 4,096 bytes?", ["4,096,000 bytes", "4,096,000,000 bytes", "512,000,000 bytes", "40,960,000,000 bytes"], 1, ""],
	["Which statement about HDD sectors is true?", ["Always 4 KB", "Smallest physical unit; 512 B or 4 KB", "Larger than clusters", "Only on SSDs"], 1, ""]
  ],

  /* Simulated disk images for the Image Explorer and Faux Terminal */
  images: [
    {
      id: "img-laptop", title: "Case HC-2026-041: Suspect laptop (MBR)",
      story: "A laptop belonging to a departing employee. Suspected of copying design documents to an external drive before resigning. Explore the volume, check signatures, and find the evidence.",
      scheme: "MBR", sectorSize: 512, totalSectors: 1000215216,
      parts: [
        { name: "Partition 1", type: "NTFS (0x07)", fs: "NTFS", start: 2048, sectors: 1000000000, boot: true, clusterSize: 4096 },
        { name: "Gap", type: "Unallocated", fs: "-", start: 1000002048, sectors: 213168, note: "Inter-partition gap. Small; nothing recovered here." }
      ],
      tree: { n: "C:", d: [
        { n: "$MFT", size: 262144, m: "2026-03-01 08:00", a: "2026-09-16 22:03", c: "2026-03-01 08:00", hdr: "46 49 4C 45 30 00 03 00", text: "(NTFS Master File Table)" },
        { n: "Users", d: [
          { n: "jmorgan", d: [
            { n: "Desktop", d: [
              { n: "vacation.jpg", size: 2480112, m: "2026-07-02 10:14", a: "2026-07-02 10:14", c: "2026-07-02 10:14", hdr: "FF D8 FF E1 00 18 45 78 69 66", text: "[JPEG image data, EXIF: Canon EOS, 2026-07-01]" },
              { n: "notes.txt", size: 214, m: "2026-09-12 16:40", a: "2026-09-12 16:40", c: "2026-09-12 16:39", hdr: "49 20 6E 65 65 64 20 74", text: "I need to finish the transfer before Friday. Keep the Orion files off the share." }
            ]},
            { n: "Documents", d: [
              { n: "budget_2026.xlsx", size: 88213, m: "2026-08-20 09:00", a: "2026-08-21 09:00", c: "2026-01-10 09:00", hdr: "50 4B 03 04 14 00 06 00", text: "[Office Open XML spreadsheet]" },
              { n: "Orion_design_v7.pdf", size: 5102345, m: "2026-09-10 13:22", a: "2026-09-14 20:15", c: "2026-09-10 13:22", hdr: "25 50 44 46 2D 31 2E 37", text: "[PDF 1.7: Orion Project design spec, CONFIDENTIAL]", flag: "evidence" },
              { n: "family_pic.png", size: 148221, m: "2026-09-14 20:41", a: "2026-09-14 20:41", c: "2026-09-14 20:41", hdr: "50 4B 03 04 14 00 00 00", text: "[Actually a ZIP archive containing Orion_design_v7.pdf and Orion_cad.dwg]", flag: "mismatch", note: "Extension says PNG; header 50 4B 03 04 is a ZIP signature (PNG would be 89 50 4E 47)." }
            ]},
            { n: "AppData", d: [
              { n: "Temp", d: [
                { n: "~wrk3492.tmp", size: 4096, m: "2026-09-14 20:40", a: "2026-09-14 20:40", c: "2026-09-14 20:40", hdr: "50 4B 03 04", text: "Temp working copy of the archive", del: true, flag: "deleted" },
                { n: "usb_copy.log", size: 612, m: "2026-09-14 20:44", a: "2026-09-14 20:44", c: "2026-09-14 20:44", hdr: "5B 32 30 32 36 2D 30 39", text: "[2026-09-14 20:44] copy family_pic.png -> E:\\ (SanDisk Cruzer, S/N 4C530001)", del: true, flag: "deleted" }
              ]}
            ]}
          ]}
        ]},
        { n: "Windows", d: [
          { n: "System32", d: [
            { n: "ntoskrnl.exe", size: 11000000, m: "2026-01-15 00:00", a: "2026-09-16 22:03", c: "2026-01-15 00:00", hdr: "4D 5A 90 00 03 00 00 00", text: "[PE executable]" },
            { n: "config", d: [ { n: "SYSTEM", size: 14680064, m: "2026-09-16 22:03", a: "2026-09-16 22:03", c: "2026-01-15 00:00", hdr: "72 65 67 66 00 00 00 00", text: "[Registry hive: USBSTOR entries show SanDisk Cruzer last connected 2026-09-14 20:43]", flag: "evidence" } ] }
          ]}
        ]}
      ]},
      questions: [
        { q: "Which file's extension does NOT match its signature?", opts: ["vacation.jpg", "family_pic.png", "budget_2026.xlsx", "Orion_design_v7.pdf"], a: 1, why: "family_pic.png starts with 50 4B 03 04 (ZIP), not 89 50 4E 47 (PNG)." },
        { q: "Which Registry hive likely shows the USB drive history?", opts: ["Desktop", "SYSTEM", "notes.txt", "$MFT"], a: 1, why: "SYSTEM hive stores USBSTOR device entries." },
        { q: "Why is the deleted usb_copy.log still readable?", opts: ["Deleted files are always removed instantly", "Data remains in clusters/MFT until overwritten", "Windows keeps a backup copy", "It was resident and encrypted"], a: 1, why: "Deletion unlinks the entry; data persists until overwritten." },
        { q: "Order these: what do you do FIRST before analysis?", opts: ["Open the files on the original drive", "Hash the image and verify against the original", "Delete temp files", "Boot the laptop"], a: 1, why: "Verify the forensic image with matching hashes, then analyze the copy." },
        { q: "notes.txt is 214 bytes. How is it stored in NTFS?", opts: ["Probably resident in its MFT record", "Always in drive slack", "In a lost cluster", "In the registry"], a: 0, why: "Small files (under ~700-900 bytes) can be resident in the MFT record." }
      ]
    },
    {
      id: "img-gpt-usb", title: "Case PD-26-1180: External SSD (GPT)",
      story: "An external SSD seized from a suspect. It uses GPT. Inspect the layout, find the hidden partition, and identify what is stored where.",
      scheme: "GPT", sectorSize: 512, totalSectors: 1953525168,
      parts: [
        { name: "EFI System", type: "EFI System Partition", fs: "FAT32", start: 2048, sectors: 204800 },
        { name: "Data", type: "Microsoft Basic Data", fs: "exFAT", start: 206848, sectors: 1500000000, clusterSize: 32768 },
        { name: "(no label)", type: "Linux filesystem (hidden from Windows)", fs: "ext4", start: 1500206848, sectors: 453000000, hidden: true, clusterSize: 4096 }
      ],
      tree: { n: "DATA:", d: [
        { n: "Photos", d: [
          { n: "IMG_0043.jpg", size: 3101220, m: "2026-08-02 18:01", a: "2026-08-02 18:01", c: "2026-08-02 18:01", hdr: "FF D8 FF E1 3A 6C 45 78 69 66", text: "[JPEG: EXIF GPS 41.8781 N, 87.6298 W; iPhone 14]", flag: "evidence" }
        ]},
        { n: "Work", d: [
          { n: "contacts.csv", size: 902, m: "2026-09-01 11:11", a: "2026-09-01 11:11", c: "2026-09-01 11:10", hdr: "6E 61 6D 65 2C 70 68 6F 6E 65", text: "name,phone,notes\nC. Danner,555-0199,primary\nR. Voss,555-0177,supplier" }
        ]},
        { n: "$RECYCLE.BIN", d: [
          { n: "ledger.xlsx", size: 40960, m: "2026-09-29 23:10", a: "2026-09-29 23:10", c: "2026-09-29 23:10", hdr: "50 4B 03 04 14 00 06 00", text: "[Spreadsheet of payments]", del: true, flag: "deleted" }
        ]}
      ]},
      hiddenTree: { n: "HIDDEN(ext4):", d: [
        { n: "vault", d: [ { n: "keys.txt", size: 220, m: "2026-09-20 02:14", a: "2026-09-20 02:14", c: "2026-09-20 02:14", hdr: "42 54 43 3A 20 62 63 31", text: "BTC: bc1q... (wallet seed phrase)", flag: "evidence" } ] }
      ]},
      questions: [
        { q: "The GPT header is located at which LBA?", opts: ["0", "1", "2", "34"], a: 1, why: "LBA 0 protective MBR, LBA 1 GPT header." },
        { q: "What type does the protective MBR's single partition have?", opts: ["0x07", "0xEE", "0x83", "0x0C"], a: 1, why: "0xEE marks a GPT disk to legacy tools." },
        { q: "Why is the 3rd partition significant?", opts: ["It is the EFI partition", "A hidden ext4 partition not shown by Windows may conceal data", "It is the backup header", "It is slack"], a: 1, why: "Hidden partitions can hide data; always review the partition table." },
        { q: "How many partitions can GPT support (max)?", opts: ["4", "16", "128", "256"], a: 2, why: "128 entries x 128 bytes = 16,384 bytes of array." },
        { q: "ledger.xlsx is in $RECYCLE.BIN. What does that indicate?", opts: ["Permanently destroyed", "Deleted by the user, still recoverable", "A system file", "A GPT backup"], a: 1, why: "Recycle bin items are recoverable; examine metadata for deletion time." }
      ]
    }
  ]
});
