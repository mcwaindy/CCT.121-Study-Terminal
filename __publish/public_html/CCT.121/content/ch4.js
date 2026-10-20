CCT.addChapter({
  id: "ch4", num: 4, title: "Data Acquisition and Duplication",
  summary: "Live vs. dead acquisition, eDiscovery, the 8-step acquisition methodology, imaging with FTK/dd/dcfldd, validation hashing, and preparing images for examination.",

  notes: [
    { id: "fundamentals", title: "Acquisition Fundamentals: Live vs. Dead", category: "ops",
      summary: "What acquisition is, and the live/dead split.",
      body: `
<div class="key"><b>Data acquisition:</b> imaging or collecting <b>ESI</b> from suspect computers/media using established methods. Must be <b>forensically sound, verified, and repeatable</b> to be admissible. Improper acquisition can alter evidence.</div>
<p><b>Time is the key factor:</b> disk data survives shutdown; RAM does not.</p>
<table><tr><th></th><th>Live acquisition</th><th>Dead (static) acquisition</th></tr>
<tr><td>System state</td><td>Powered on (locked or sleeping)</td><td>Powered off / drive removed</td></tr>
<tr><td>Collects</td><td><b>Volatile</b>: registers, cache, RAM, DLLs</td><td><b>Non-volatile</b>: HDD/SSD, slack, swap, unallocated, USB, cards, phones, cameras</td></tr>
<tr><td>Why</td><td>Lost at power-off; must be collected <b>in real time</b></td><td>Unchanged by shutdown; <b>repeatable</b>; avoids legal constraints on a seized system</td></tr></table>
<h3>Live acquisition can also reveal</h3>
<ul>
<li>Evidence in the cloud (Dropbox, Google Drive) via open sessions.</li>
<li>Data inside <b>unencrypted containers/disks that are open</b> and will auto-encrypt at shutdown.</li>
<li>Traces of data the suspect <b>overwrote on disk</b> (still visible in RAM).</li>
<li>A logical timeline of the incident and the users likely responsible.</li>
</ul>
<p>Live is usually followed by dead acquisition (shut down, remove drive, image).</p>
<h3>Two kinds of volatile data</h3>
<table><tr><th>System data</th><th>Network data</th></tr>
<tr><td>System profile, login activity, date/time, command history, uptime, running processes, open files, startup files, clipboard, logged-in users, DLLs/shared libraries, <b>slack space</b></td><td>Open connections and ports, routing info/config, <b>ARP cache</b>, shared files, accessed services</td></tr></table>
<h3>Static data from a hard drive</h3>
<p>Temp files, system registries, event/system logs, boot sectors, browser cache, cookies, hidden files (plus emails, documents, spreadsheets, slack, swap, unallocated, deleted files).</p>` },

    { id: "rfc3227", title: "Order of Volatility (RFC 3227)", category: "ops",
      summary: "Seven levels with lifespans; collect most volatile first.",
      body: `
<div class="key"><b>Rule:</b> collect the <b>most volatile first</b>, weighing the impact of collection on the suspect system. Source: <b>RFC 3227</b> (Guidelines for Evidence Collection and Archiving).</div>
<table><tr><th>#</th><th>Source</th><th>Lifespan / note</th></tr>
<tr><td>1</td><td>Registers, processor cache</td><td><b>Nanoseconds</b>; most volatile. Encryption keys, running processes, system state</td></tr>
<tr><td>2</td><td>Routing table, ARP cache, process table, kernel statistics, memory</td><td>~10 ns; in ordinary memory</td></tr>
<tr><td>3</td><td>Temporary file systems</td><td>Seconds to minutes</td></tr>
<tr><td>4</td><td>Disk / other storage media</td><td>A few minutes; can be erased/overwritten</td></tr>
<tr><td>5</td><td>Remote logging and monitoring data (firewall, router, switch logs)</td><td>Hour/day/week; generally less volatile</td></tr>
<tr><td>6</td><td>Physical configuration, network topology</td><td>Longer lifespan</td></tr>
<tr><td>7</td><td>Archival media (USB, memory cards, DVDs)</td><td><b>Least volatile</b>; changes only by physical damage</td></tr></table>
<p class="dim">Note: Module 1's list shows RAM, swap, then tables; this RFC 3227 version groups routing/ARP/process tables with memory. Know both framings; the principle (most volatile first) is the same.</p>` },

    { id: "rules", title: "Rules of Thumb for Acquisition", category: "ops",
      summary: "Preserve, document, verify, authorize.",
      body: `
<div class="key warn"><b>Never</b> perform any forensic process on the <b>original</b> evidence: it may alter data and make it inadmissible.</div>
<ul>
<li><b>Document every process:</b> person, date, time, location, tools.</li>
<li><b>Use a recognized methodology</b> (e.g. Digital Investigation Framework, DIF).</li>
<li><b>Preserve the original:</b> make a duplicate bitstream image. Make <b>two copies</b> before starting: a <b>working copy</b> (analysis) and a <b>library/control copy</b> (disclosure, or backup if the working copy corrupts). Drive-to-drive: blank, <b>shrink-wrapped new</b> drives.</li>
<li><b>Verify hash values</b> (e.g. MD5) of copies against the original.</li>
<li><b>Legal authorization</b> before acquiring/examining.</li>
<li><b>Maintain chain of custody;</b> document all changes with name and purpose.</li>
<li><b>Reduce data exposure:</b> acquire only relevant data.</li>
<li><b>Quality assurance:</b> controls for reliability and accuracy.</li>
</ul>` },

    { id: "types", title: "Types of Acquisition", category: "apps",
      summary: "Logical, sparse, bitstream disk-to-image, disk-to-disk.",
      body: `
<p>A full bit-by-bit copy is ideal but slow on big disks. Alternatives when time/resources are limited:</p>
<table><tr><th>Type</th><th>What</th><th>Use</th></tr>
<tr><td><b>Logical</b></td><td>Only the files needed for the case</td><td>Known targets, time limits (Outlook .pst/.ost, records from a large RAID server)</td></tr>
<tr><td><b>Sparse</b></td><td>Specific areas/sectors with needed data; <b>excludes unallocated space</b></td><td>Quick targeted acquisition (still useful for inspecting the entire drive)</td></tr>
<tr><td><b>Bitstream disk-to-image file</b></td><td>Bit-by-bit copy into one or more image files, includes all sectors/clusters and <b>latent data</b> (deleted files)</td><td><b>Most common</b>; flexible; many copies. Tools: ProDiscover, EnCase, FTK Imager, Sleuth Kit, X-Ways</td></tr>
<tr><td><b>Bitstream disk-to-disk</b> (clone)</td><td>Whole disk copied to another disk; target cylinder/track geometry can be adjusted to match the suspect drive</td><td>When disk-to-image isn't possible. Tools: EnCase, Tableau Forensic Imager, EaseUS Todo Backup</td></tr></table>
<div class="key warn"><b>Disk-to-image NOT possible when:</b> the suspect drive is very old/incompatible with imaging software, or you must recover credentials used for websites/accounts.</div>` },

    { id: "formats", title: "Acquisition Formats", category: "apps",
      summary: "Raw, proprietary, AFF, AFF4.",
      body: `
<table><tr><th>Format</th><th>Pros</th><th>Cons</th></tr>
<tr><td><b>Raw</b> (binary/dd)</td><td>Faster evidence search; supported by nearly every tool (dd, dc3dd, dcfldd)</td><td><b>No metadata</b>, no file system interpretation, <b>no compression</b> (same size as source)</td></tr>
<tr><td><b>Proprietary</b> (E01, .AD1, etc.)</td><td><b>Compression</b>, <b>segmentation</b>, embedded <b>metadata</b></td><td>May be unreadable by other tools; slower search than raw</td></tr>
<tr><td><b>AFF</b> (Advanced Forensics Format)</td><td><b>Open source</b>, no lock-in; compression (<b>zlib</b> faster/less efficient, <b>LZMA</b> slower/more efficient); metadata; one file of segments</td><td></td></tr>
<tr><td><b>AFF4</b></td><td>Redesign for large-capacity media; object-oriented; Zip/Zip64 containers; <b>network storage via WebDAV</b>; <b>zero-copy maps</b>; image signing, cryptography; GUIDs for all evidence</td><td></td></tr></table>
<ul>
<li>AFFv3 extensions: <b>.aff, .afd (image files), .afm (metadata)</b>.</li>
<li>AFF4 object types: <b>volumes</b> (store segments), <b>streams</b> (read/write objects), <b>graphs</b> (RDF statements).</li>
<li>Raw images carry <b>no metadata</b>, so validate them manually.</li>
</ul>` },

    { id: "ediscovery", title: "eDiscovery & EDRM", category: "legal",
      summary: "Definition, the EDRM stages, collection methods, tools, metrics.",
      body: `
<div class="key"><b>eDiscovery:</b> discovering, protecting, collecting, reviewing, and presenting <b>ESI</b> for legal proceedings, regulatory compliance, litigation. ESI ranges from email/databases/documents to social media and smartphone apps.</div>
<h3>EDRM (Electronic Discovery Reference Model)</h3>
<p>Conceptual framework: <b>not linear or waterfall</b>; stages may be skipped, repeated, or reordered.</p>
<table><tr><th>Stage</th><th>What happens</th></tr>
<tr><td>Information governance</td><td>Org policies for handling data: control, retention, compliance</td></tr>
<tr><td>Identification</td><td>Find sources/custodians with relevant ESI</td></tr>
<tr><td>Preservation</td><td>Keep ESI intact; legal "freezes" it (no deletion/alteration)</td></tr>
<tr><td>Collection</td><td>Forensically gather preserved data, maintaining integrity</td></tr>
<tr><td>Processing</td><td>Filter, dedupe, remove irrelevant; convert to reviewable format</td></tr>
<tr><td>Review</td><td>Legal team judges relevance</td></tr>
<tr><td>Analysis</td><td>Patterns, context, content, relationships</td></tr>
<tr><td>Production</td><td>Non-privileged ESI turned over per agreed protocols/court orders</td></tr>
<tr><td>Presentation</td><td>Depositions, hearings, trial: authenticity and relevance</td></tr>
<tr><td>(Review after presentation)</td><td>Further discovery based on opposing responses</td></tr>
<tr><td>Retention &amp; disposition</td><td>Secure retain/dispose after the case</td></tr></table>
<h3>Collection methodologies</h3>
<table><tr><th>Method</th><th>Description</th></tr>
<tr><td>Full disk acquisition</td><td>Bit-by-bit images, incl. deleted/slack/unallocated</td></tr>
<tr><td>Directed collection</td><td>Limited to certain file types/directories</td></tr>
<tr><td>Custodian self-collection</td><td>Custodians follow guidelines to collect their own ESI</td></tr>
<tr><td>Remote acquisition</td><td>Secure remote access; no physical access; good when onsite is infeasible/expensive</td></tr>
<tr><td>Incremental collection</td><td>Frequent collection from changing devices; good when new custodians appear</td></tr>
<tr><td>Sampling / targeted</td><td>Subset by keyword or metadata filters</td></tr>
<tr><td>By source</td><td>Cloud (tools/APIs), network (servers/shares), email (archiving tools), mobile</td></tr></table>
<div class="key warn">Collect <b>without modifying application metadata</b> (last saved date, author, track changes, last accessed/printed by). Document to maintain custody and authenticity.</div>
<h3>Tools</h3>
<p><b>Intella Pro</b> (search/process/filter/produce >250 GB ESI; cluster maps, social link graphs, email threading, MD5 hash filtering, mobile analysis). Others: Logikcull, Nuix, Nextpoint, RelativityOne, DISCO.</p>
<h3>Metrics and tracking</h3>
<p>Define KPIs (speed, cost, efficiency); use software; log every step and timestamp; track data volume/growth and costs; maintain chain of custody; <b>audit trails</b> (all user actions); regular <b>sampling</b>; track delivery and production; document; continuous improvement.</p>
<h3>Best practices</h3>
<ul>
<li>Define the strategy <b>before</b> collection (legal obligations, retention policies); collect only relevant data.</li>
<li>Map data to identify <b>custodians</b> (data topology mapping); limit custodians, exclude duplicates (e.g. subordinates with copies).</li>
<li>Label documents; link emails/attachments; streamline vendors/tools.</li>
<li>Train IT and legal; follow information governance; use <b>TAR</b> (technology-assisted review) / data reduction; maintain chain of custody.</li>
</ul>` },

    { id: "methodology", title: "Acquisition Methodology (8 Steps)", category: "ops",
      summary: "The ordered process and how to pick the method.",
      body: `
<div class="key"><b>Follow policy, standards, law.</b> Validate image integrity with hashes. The 8 steps:</div>
<ol>
<li><b>Determine</b> the acquisition method</li>
<li><b>Select</b> the acquisition tool</li>
<li><b>Sanitize</b> target media</li>
<li><b>Acquire volatile</b> data</li>
<li><b>Enable write protection</b> on evidence media</li>
<li><b>Acquire non-volatile</b> data</li>
<li><b>Plan for contingency</b></li>
<li><b>Validate</b> the acquisition</li>
</ol>
<p class="dim">Mnemonic idea: Method, Tool, Sanitize, Volatile, Write-protect, Non-volatile, Contingency, Validate. (Note volatile comes <i>before</i> write protection: the live system is running; write protection applies to the removed evidence drive.)</p>
<h3>Step 1: choosing the method</h3>
<ul>
<li><b>Size of suspect drive:</b> large drive: disk-to-image. If the target is much smaller, reduce data: compression tools (WinZip, WinRAR; DriveSpace/DoubleSpace exclude slack between files). <b>Test lossless compression</b> by hashing (MD5/SHA-2/SHA-3) before and after: success only if hashes match.</li>
<li><b>Time required:</b> grows with size (1 TB can take 11+ hours). Prioritize evidence of value.</li>
<li><b>Can the drive be retained?</b> If not, check whether <b>logical acquisition</b> is acceptable. If yes, copy with a reliable tool: usually only <b>one opportunity</b> to capture data.</li>
</ul>` },

    { id: "toolreq", title: "Imaging Tool Requirements", category: "apps",
      summary: "Mandatory vs. optional requirements.",
      body: `
<p>Tools must be rigorously <b>validated and tested</b>.</p>
<h3>Mandatory</h3>
<ul>
<li>Must <b>not alter</b> original content.</li>
<li><b>Log I/O errors</b> readably (type and location).</li>
<li><b>Compare source and destination</b>; alert if destination is smaller.</li>
<li>Pass <b>scientific and peer review</b>; repeatable and verifiable by a third party.</li>
<li>Acquire <b>all visible and hidden</b> data sectors.</li>
<li>Create a <b>bitstream copy</b> when no errors; a <b>qualified bitstream copy</b> (identical except identified error areas) when I/O errors occur.</li>
<li>Copy only if destination &ge; source size; document destination contents not part of the copy.</li>
<li>Documentation must be correct.</li>
</ul>
<h3>Optional (desirable)</h3>
<ul>
<li>Hash the full copy and compare with the source hash; <b>block-level hashing</b>.</li>
<li>Log tool version, subject disk ID, errors, actions, start/finish times, settings, comments.</li>
<li>Align cylinder boundaries if geometry differs; copy individual partitions; show/record the partition table.</li>
<li>Create image files on fixed/removable media; copy over a network link.</li>
</ul>` },

    { id: "sanitize", title: "Sanitizing Target Media", category: "ops",
      summary: "Why formatting isn't enough; wipe standards.",
      body: `
<div class="key"><b>Formatting or deleting partitions does NOT erase data.</b> Overwrite with sequences of zeros/ones so <b>no remnants</b> of previous data contaminate evidence images. Also sanitize after the case.</div>
<table><tr><th>Standard</th><th>Passes</th><th>Pattern</th></tr>
<tr><td>German VSITR</td><td>7</td><td>Six alternating 0x00/0xFF, last pass 0xAA</td></tr>
<tr><td>US NAVSO P-5239-26 (MFM)</td><td>3</td><td>0x01, 0x7FFFFFFF, random (verify)</td></tr>
<tr><td>US NAVSO P-5239-26 (RLL)</td><td>3</td><td>Character, complement, random (verify)</td></tr>
<tr><td>US DoD 5220.22-M (ECE)</td><td>7</td><td>0, 1, random, 0, 0, 1, random; verify on 7th</td></tr>
<tr><td>Russian GOST R 50739-95</td><td>2</td><td>Zeros, then random; no verify</td></tr>
<tr><td>NCSC-TG-025</td><td>3</td><td>Zeros, ones, random; verified</td></tr>
<tr><td>NSA 130-1</td><td>3</td><td>Random, random, known chars + verify pass</td></tr>
<tr><td>Canadian CSEC ITSG-06</td><td>1-3</td><td>0/1, complement, random; verified</td></tr>
<tr><td>Secure Erase</td><td>1</td><td>Binary 0 or 1 via Secure Erase commands</td></tr></table>
<h3>NIST SP 800-88</h3>
<ul>
<li><b>Clear:</b> overwrite all storage areas with standard read/write commands.</li>
<li><b>Purge:</b> make recovery infeasible even with lab techniques (overwrite, block erase, <b>cryptographic erase</b>).</li>
<li><b>Destroy:</b> physically destroy (incineration, disintegration, melting, shredding); media unusable.</li>
</ul>
<p>Physical destruction (e.g. cross-cut shredding): onsite or via a confidentiality-compliant third party. Get a <b>certificate of destruction</b> for audits.</p>` },

    { id: "volatileacq", title: "Acquiring Volatile Data (Win / Linux / Mac)", category: "apps",
      summary: "Belkasoft, dd+fmem, netcat, LiME, Mac tools.",
      body: `
<div class="key warn">Working on a live system <b>alters RAM and processes</b>: file access times change, DLLs load, malware may trigger, a reboot may lock you out. Be careful and minimize footprint.</div>
<table><tr><th>OS</th><th>Tool / method</th></tr>
<tr><td><b>Windows</b></td><td><b>Belkasoft Live RAM Capturer</b>: runs from USB, tiny footprint, 32/64-bit kernel drivers, beats anti-dumping; saves <b>.mem</b></td></tr>
<tr><td><b>Linux</b> (local)</td><td><code>dd if=/dev/fmem of=file.dd bs=1MB</code> (kernel memory is restricted in modern Linux, so the <b>fmem</b> module is needed; older: /dev/mem)</td></tr>
<tr><td><b>Linux</b> (remote, dd + netcat)</td><td>Workstation: <code>nc -l &lt;port&gt; &gt; filename.dd</code><br>Suspect: <code>dd if=/dev/fmem bs=1024 | nc &lt;workstation IP&gt; &lt;port&gt;</code></td></tr>
<tr><td><b>Linux</b> (LiME local)</td><td>Compile <b>LiME</b> (loadable kernel module) against the suspect's kernel version, then <code>insmod lime-&lt;kernel&gt;.ko "path=&lt;dir&gt; format=lime"</code></td></tr>
<tr><td><b>Linux</b> (LiME remote)</td><td>Suspect listens: <code>insmod lime-&lt;kernel&gt;.ko "path=tcp:&lt;port&gt; format=lime"</code><br>Workstation: <code>nc &lt;suspect IP&gt;:&lt;port&gt; &gt; filename.mem</code></td></tr>
<tr><td><b>Mac</b></td><td><b>Cellebrite Digital Collector</b> (also physical images of Macs with the Apple T2 chip), Surge, BlackBag MACQUISITION</td></tr></table>
<ul>
<li><b>Local</b> = physical access to the machine. <b>Remote</b> = no/limited physical access; saves time; <b>only on live machines</b>.</li>
<li><b>LiME</b> minimizes user/kernel interaction, so captures are forensically sound.</li>
<li>In dd+netcat, the <b>listener runs on the forensic workstation</b>. In LiME+netcat, the <b>listener runs on the suspect machine</b>.</li>
</ul>` },

    { id: "writeprotect", title: "Write Protection", category: "apps",
      summary: "Why and how to prevent writes to evidence media.",
      body: `
<div class="key"><b>Write protection:</b> read-only access via hardware or software. Needed so the investigator is confident of evidence integrity.</div>
<ul>
<li>Hardware <b>jumper</b> making the disk read-only.</li>
<li>OS/software that cannot write unless instructed.</li>
<li>Hard disk <b>write blocker</b>.</li>
<li>Hardware <b>write-protect switch</b> on USB/SD media.</li>
<li>Linux: <code>mount -o ro &lt;device&gt;</code> (the <b>ro</b> flag = read-only).</li>
<li><b>Physically remove</b> the media after acquisition to prevent accidental writes.</li>
<li><b>Test</b> that no writes occur; <b>document</b> measures and check results for each medium.</li>
</ul>
<table><tr><th>Hardware write blocker</th><th>Software write blocker</th></tr>
<tr><td>Install device; boot with an <b>examiner-controlled OS</b>. Examples: CRU WiebeTech USB WriteBlocker, Tableau Forensic Bridges, Logicube WriteProtect</td><td>Boot examiner-controlled OS; activate protection. Examples: SAFE Block, X-Ways Forensics</td></tr></table>` },

    { id: "nonvolatile", title: "Acquiring Non-volatile Data", category: "apps",
      summary: "FTK Imager, dd, dcfldd, macOS single-user and target disk, CAINE/Guymager.",
      body: `
<p><b>Dead acquisition steps:</b> remove drive from suspect, connect to forensic workstation, <b>write-block</b>, run the imaging tool. (Live disk acquisition: remote tools like Netcat or bootable USBs such as CAINE.)</p>
<h3>Windows: FTK Imager</h3>
<p>Stand-alone (no install). <b>File &gt; Create Disk Image</b>; select source; select destination (enough space); options: image type <b>Physical</b> (bit-for-bit), compression, <b>verify images</b>, <b>segmented images</b>; set <b>hashing options</b>; Start; verify displayed hashes.</p>
<h3>Linux: dd</h3>
<p>Built in; disk-to-disk or disk-to-image; needs no extra resources; not forensics-specific (limited).</p>
<pre>dd if=&lt;source&gt; of=&lt;target&gt; bs=&lt;bytes&gt; skip= seek= conv=&lt;conversion&gt;</pre>
<ul>
<li><b>if</b> source; <b>of</b> target; <b>bs</b> block size (default 512; powers of 2); <b>skip</b> blocks skipped at start of <i>input</i>; <b>seek</b> blocks skipped at start of <i>output</i>; <b>conv</b> conversions.</li>
<li><code>dd if=/dev/hda of=/dev/case5img1</code>: full physical backup</li>
<li><code>dd if=/dev/sda2 of=/dev/sdb2 bs=4096 conv=notrunc,noerror</code>: partition to partition</li>
<li><code>dd if=/dev/hdc of=/home/sam/mycd.iso bs=2048 conv=notrunc</code>: CD to ISO</li>
<li><code>dd if=/home/sam/partition.image of=/dev/sdb2 bs=4096 conv=notrunc,noerror</code>: restore partition</li>
<li><code>dd if=/dev/fmem of=/home/sam/mem.bin bs=1024</code>: RAM to file</li>
<li><b>noerror</b> = continue past read errors; <b>sync</b> = pad failed blocks so alignment is preserved.</li>
</ul>
<h3>Linux: dcfldd (DCFL, Nicholas Harbour)</h3>
<p>Like dd, built for forensics: <b>on-the-fly hashing</b>, status output, flexible wipes, <b>image/wipe verify</b>, multiple outputs, <b>split output</b>, piped output/logs. Hashes: <b>MD5, SHA-1, SHA-256, SHA-384, SHA-512</b>. Run from a <b>root shell</b>.</p>
<pre>dcfldd if=/dev/sda of=/media/image.dd
dcfldd if=/dev/sda split=10M of=/media/image.dd
dcfldd if=/dev/sda hash=sha256,sha512 hashwindow=3G sha256log=sha256_hashes.txt \\
       sha512log=sha512_hashes.txt hashconv=after bs=8k conv=noerror,sync \\
       split=3G splitformat=aa of=sda_image.dd</pre>
<ul><li><b>hashwindow</b> hashes in chunks (3 GB); <b>*log</b> saves hashes to a file; <b>hashconv=after|before</b> hash after/before conversion; <b>split</b> segments the image.</li></ul>
<h3>macOS</h3>
<ul>
<li><b>Single-user mode:</b> hold <b>Cmd+S</b> at boot; UNIX console. Mount external USB; <code>diskutil list</code> (or <code>ls /dev/disk*</code>) to identify the disk; <code>dd if=&lt;target&gt; bs=4k conv=noerror,sync of=&lt;dest&gt;</code>.</li>
<li><b>Target disk mode:</b> hold <b>T</b> at boot (or Apple menu &gt; System Preferences &gt; Startup Disk &gt; Target Disk Mode). Connect with FireWire/Thunderbolt/USB-C to a Mac workstation with <b>disk arbitration disabled</b> (no auto-mount). Image with dd or FTK Imager, eject, shut down.</li>
<li><b>Linux bootable USB:</b> when FireWire/drive removal is impractical. <b>Rufus</b> (creates bootable USB) + <b>CAINE</b> (Italian forensic Linux live distro). Boot Mac holding <b>Option (Alt)</b>, choose EFI Boot. CAINE mounts disks <b>read-only</b>; use Mounter to <b>Make WRITEABLE</b> only for the external destination. Image with <b>Guymager</b> (flat dd, <b>E01</b>, AFF; disk cloning; optional MD5).</li>
<li><b>Cellebrite Digital Collector</b> also does non-volatile acquisition of Macs.</li>
</ul>` },

    { id: "raid", title: "RAID Acquisition", category: "apps",
      summary: "Identifying and rebuilding RAID.",
      body: `
<h3>Identify RAID on Windows</h3>
<ol>
<li>Open <b>Device Manager</b>; expand Disk drives, Storage controllers, Other devices; look for RAID drivers.</li>
<li>Run <code>diskpart</code>, then <code>list disk</code> (<code>lis dis</code>), <code>select disk &lt;n&gt;</code> (<code>sel dis</code>), <code>detail disk</code> (<code>det dis</code>).</li>
</ol>
<h3>Rebuild RAID (recover data, validate integrity, support credibility)</h3>
<p>Tool example: <b>SalvageData Total Recovery Pro</b>.</p>
<ol>
<li>Record the array state: drive labels, cables, configuration.</li>
<li>Disconnect array drives individually; attach to a controller that supports separate disks.</li>
<li>Run the tool; recover array parameters.</li>
<li>Try to create the array <b>without disk initialization</b> (if controller allows) or from the recovery software's specs.</li>
<li>Hardware RAID: write the array to a disk and mount it; <b>do not write to the original member disks</b>.</li>
<li>Rebuild the original RAID and copy the data back.</li>
</ol>` },

    { id: "contingency", title: "Contingency Planning", category: "ops",
      summary: "Plan B for failed tools, bad copies, HPA, and encryption.",
      body: `
<div class="key"><b>Contingency plan:</b> backup plan if acquisition, hardware, or software fails.</div>
<ul>
<li><b>Hard disk acquisition:</b> create <b>at least two images</b>; if one is corrupt use the other.</li>
<li><b>Imaging tools:</b> with 2+ tools (ProDiscover Pro, FTK Imager) make one image with <b>each</b>. With one tool, make 2+ images with it.</li>
<li><b>Hardware acquisition tools</b> (UFED Ultimate, IM Solo-4 G3 PLUS IT Enterprise) access the drive at the <b>BIOS level</b> to copy the <b>Host Protected Area (HPA)</b>.</li>
<li><b>Drive decryption:</b> be ready for encrypted drives needing a key (e.g. Windows <b>BitLocker</b>).</li>
</ul>` },

    { id: "validation", title: "Validating Acquisition (Hashing)", category: "apps",
      summary: "Hash algorithms and Windows/Linux/Mac validation commands.",
      body: `
<div class="key"><b>Validation:</b> hash the target (image) and compare with the source. Same hash = identical content (filenames irrelevant). <b>Any change, however small, completely changes the hash.</b> A hash is <b>one-way</b>.</div>
<table><tr><th>Algorithm</th><th>Size</th><th>Notes</th></tr>
<tr><td>CRC-32</td><td>32-bit</td><td>Polynomial division; detects transmission/storage errors (checksum)</td></tr>
<tr><td>MD5</td><td>128-bit</td><td>Message digest, any-length input</td></tr>
<tr><td>SHA-1</td><td>160-bit (20 B)</td><td>NSA-developed; NIST FIPS; 40 hex digits</td></tr>
<tr><td>SHA-256</td><td>256-bit (32 B)</td><td>SHA-2; anti-tampering, signatures</td></tr>
<tr><td>SHA-512</td><td>512-bit (64 B)</td><td>SHA-2; high-security</td></tr>
<tr><td>SHA-3</td><td>224/256/384/512</td><td>Newest; resistant to known attacks</td></tr>
<tr><td>BLAKE2</td><td>variable</td><td>Faster than SHA-2/SHA-3/MD5; security like SHA-3</td></tr></table>
<h3>Windows</h3>
<ul>
<li>PowerShell: <code>Get-FileHash &lt;file&gt; -Algorithm SHA256</code></li>
<li>Commercial tools validate automatically. <b>ProDiscover .eve</b> files hold the original media's hash; if image and original hashes differ, the tool warns the image is <b>corrupt/unreliable</b>.</li>
<li><b>Raw images have no metadata</b>: validate manually.</li>
</ul>
<h3>Linux / Mac (dd and md5sum)</h3>
<pre>dd if=/dev/sda of=/image_sda.dd
md5sum /dev/sda > md5_hashes.txt
cat image_sda.dd | md5sum >> md5_hashes.txt
cat md5_hashes.txt        # hashes should be identical</pre>
<p>Swap md5sum for <code>sha1sum</code>, <code>sha256sum</code>, <code>sha512sum</code>. Ubuntu has dd and dcfldd; <b>macOS ships only dd</b>.</p>
<h3>dcfldd validation</h3>
<pre>dcfldd if=/dev/sda split=100M of=/media/image.dd hash=sha256
dcfldd if=/dev/sda split=100M of=/media/image.dd hash=sha256 hashlog=/media/sha256.txt
dcfldd if=/dev/sda vf=image.dd      # verify file (NOT for segmented images)</pre>` },

    { id: "guidelines", title: "Acquisition Guidelines & Best Practices", category: "ops",
      summary: "Checklist for a sound acquisition.",
      body: `
<ul>
<li>Define <b>purpose and requirements</b> first; identify data sources; devise a strategy (sources, sampling, time).</li>
<li>Select tools for data needs, source type, workstation compatibility. Follow an <b>SOP</b>.</li>
<li><b>Gather only relevant data</b> (privacy, volume, time).</li>
<li><b>Volatile first,</b> then non-volatile.</li>
<li>Know limits: <b>prior notification, authorization, agreement</b> before collection. Get <b>direct permission</b> from data source owners.</li>
<li>Check data for errors/inconsistencies; clean or transform as needed. Minimize duplication; combine sources into one dataset considering formats.</li>
<li>Comply with legal/ethical <b>data protection</b> laws.</li>
<li><b>Document</b> sources, methods, tools, metadata, plan changes. Documents <b>signed and dated</b>.</li>
<li>Decide <b>retention duration</b> and archiving scope.</li>
<li><b>Access controls, read-only modes, encryption</b> for evidence data.</li>
<li>Use data <b>only for original purpose</b>; no manipulation or misinterpretation.</li>
<li><b>Regularly evaluate</b> the collection plan's quality and efficiency.</li>
</ul>` },

    { id: "prepimage", title: "Preparing Images for Examination", category: "apps",
      summary: "Linux, Windows, Mac scenarios: conversion, mounting, tools.",
      body: `
<p><b>Default pairings:</b> dd images on Linux; E01 (and some others) on Windows; APFS on macOS. When format and workstation OS mismatch, convert or mount the image.</p>
<h3>Linux workstation scenarios</h3>
<table><tr><th>Scenario</th><th>Method</th></tr>
<tr><td>E01 to dd</td><td><code>xmount --in ewf file.E01 &lt;mount_dir&gt;</code> (--in = input format)</td></tr>
<tr><td>E01 to raw</td><td><code>ewfmount file.E01 &lt;mount_dir&gt;</code>, then <code>mount &lt;raw&gt; &lt;dir&gt; -o ro,loop,show_sys_files,streams_interface=windows</code></td></tr>
<tr><td>dd to VHDX (boot as a VM)</td><td><code>qemu-img convert -f raw image.dd -O vhdx image.vhdx</code>, create a Hyper-V VM on it, boot (live analysis; need authorized login if locked)</td></tr>
<tr><td>Examine a dd file</td><td>See below</td></tr>
<tr><td>Physical Windows disk</td><td><code>lshw</code> (file system), <code>lsblk</code> (partitions), then <code>mount -t ntfs-3g -o ro &lt;partition&gt; /media/windows</code>. <b>Use a write blocker first.</b></td></tr>
<tr><td>Mac APFS image</td><td><code>losetup -f</code> (find unused loop device), <code>losetup -r /dev/loopN evidence.dd</code>, <code>mkdir /mnt/apfs</code>, then <code>mount /dev/loopN /mnt/apfs</code> or <code>apfs-fuse /dev/loopN /mnt/apfs</code></td></tr>
<tr><td>PyTSK</td><td>Python wrapper for Sleuth Kit; script analysis of images</td></tr>
<tr><td>Also listed</td><td>EWF via <b>libewf</b>; <b>dfvfs</b> library</td></tr></table>
<h3>Mounting a dd image (Scenario 1.4)</h3>
<ol>
<li><code>fdisk -l image.dd</code>: sector size, <b>start sector</b>, type.</li>
<li><code>mkdir /mnt/evidence</code></li>
<li><code>mount -t ntfs -o ro,offset=&lt;bytes&gt; image.dd /mnt/evidence</code></li>
<li><code>ls -l</code> to browse; <code>umount /mnt/evidence</code> when done.</li>
<li>Re-hash the image; compare with the hash taken before mounting.</li>
</ol>
<div class="key"><b>Offset (bytes) = start sector &times; sector size.</b> Example: start 2048 &times; 512 = 1,048,576. <code>ro</code> keeps it read-only. Mount one volume at a time.</div>
<h3>Windows workstation</h3>
<ul>
<li><b>Autopsy</b> (GUI for The Sleuth Kit): views .img, .dd, .raw, .bin, .vhd, .001, .aa. Timeline, registry analysis, tags. Steps: create case &rarr; <b>Add Data Source</b> &rarr; choose type and path &rarr; select ingest <b>modules</b> &rarr; Finish; view after ingest.</li>
<li><b>FTK Imager</b>, <b>Volatility Framework</b> also examine images.</li>
<li><b>Mac HFS+ on Windows:</b> (1) Apple HFS+ drivers: copy <b>AppleHFS.sys</b> and <b>AppleMNT.sys</b> to <code>C:\\Windows\\System32\\drivers\\</code>, merge <b>Add AppleHFS.reg</b>, restart; <b>read-only</b>. (2) <b>Paragon HFS+ for Windows</b>: read/write/modify HFS+ (HDD, SSD, flash).</li>
</ul>
<h3>Mac workstation</h3>
<p><b>R-Studio</b> (recovery for HFS/HFS+/APFS, also Windows/Linux; works on formatted/damaged/deleted partitions), <b>Digital Collector</b>, <b>OSForensics</b>.</p>` },

    { id: "imagingtools", title: "Digital Forensic Imaging Tools", category: "apps",
      summary: "Tool roster from the module.",
      body: `
<p>Imaging tools create bit-by-bit copies so the original stays unchanged, and let you back up a drive before it fails.</p>
<table><tr><th>Tool</th><th>Notes</th></tr>
<tr><td><b>OSFClone</b></td><td>Self-booting; clones raw-disk images independent of installed OS; AFF and <b>EWF</b>; preserves fragmentation, slack, unused sectors, undeleted file records</td></tr>
<tr><td><b>FTK Imager</b></td><td>Preview and image; no install; Windows</td></tr>
<tr><td><b>Guymager</b></td><td>Linux imager: dd, E01, AFF; cloning</td></tr>
<tr><td><b>CAINE</b></td><td>Forensic Linux live distro (with Guymager)</td></tr>
<tr><td><b>Autopsy / Sleuth Kit</b></td><td>Analysis GUI and CLI</td></tr>
<tr><td><b>Belkasoft Live RAM Capturer</b>, <b>LiME</b>, <b>Cellebrite Digital Collector</b></td><td>Memory acquisition (Win, Linux, Mac)</td></tr>
<tr><td>Others</td><td>Talon Ultimate and Falcon-NEO (Logicube), PALADIN (SUMURI), OpenText EnCase Forensic, Belkasoft X, Tableau Forensic Imager</td></tr></table>` },

	{ id: "mtacq", title: "Midterm Add-ons: Acquisition Layers & RAID Factors", category: "apps",
	  summary: "Layer model, RAID acquisition checklist, step 6.1/6.2 recap.",
	  body: `
<h3>Acquisition layers (highest to lowest)</h3>
<table><tr><th>Layer</th><th>Acquisition possible</th></tr>
<tr><td>Application</td><td>Logical / sparse</td></tr>
<tr><td>File system</td><td>Logical / sparse</td></tr>
<tr><td>Partition / volume</td><td>Logical / sparse <b>or full image</b></td></tr>
<tr><td>Disk</td><td><b>Full image</b></td></tr></table>
<h3>Acquiring RAID: factors before acquiring</h3>
<ul>
<li>Storage needed to hold all data; the <b>RAID format</b> (0, 1, 5, 10 ...); <b>hardware or software</b> managed.</li>
<li>Tools able to image and read RAID images; <b>disk imaging (bit-by-bit) vs. logical (file-level)</b> by configuration; tool compatibility with the <b>RAID controller</b>.</li>
<li>Reconstruct the array on a separate forensic workstation or with RAID recovery tools; <b>compare checksums</b> with the original array.</li>
<li>Tools with RAID recovery: <b>OpenText EnCase Forensic, X-Ways Forensics, ProDiscover</b>.</li>
</ul>
<h3>Recap</h3>
<ul>
<li><b>FTK Imager</b> shows MD5 and SHA1 results with a "Match" status when the image verifies.</li>
<li><b>dcfldd</b> from a root shell: <code>dcfldd if=/dev/sda of=/media/image.dd</code>; split into 10 MB segments: <code>dcfldd if=/dev/sda split=10M of=/media/image.dd</code>.</li>
<li>Live disk acquisition: remote tools (<b>Netcat</b>) or bootable USB (<b>CAINE</b>). Dead: remove disk, write-block, image on a workstation.</li>
<li>Contingency: 2+ images; 2+ tools when available (FTK Imager and ProDiscover Pro).</li>
<li>Validation: CRC-32, MD5, SHA-1, SHA-3, SHA-256, SHA-512, BLAKE2.</li>
</ul>` }
  ],

  glossary: [
    ["Data Acquisition", "Imaging or collecting ESI from suspect computers or storage media by established, verified, repeatable methods so it is forensically sound and admissible.", "The acquisition followed a documented, repeatable procedure."],
    ["Live Acquisition", "Collecting volatile data (RAM, cache, DLLs) from a powered-on device in real time before it is lost.", "RAM was captured live before the machine was shut down."],
    ["Dead (Static) Acquisition", "Collecting non-volatile data from media that is powered off or removed, typically via write-blocker and imaging tool.", "The drive was removed and imaged through a write blocker."],
    ["Volatile Data", "Dynamic data lost at power-off: registers, cache, RAM, DLLs, running processes, network connections.", ""],
    ["Non-volatile (Static) Data", "Data that survives shutdown: HDD/SSD contents, slack, swap files, unallocated space, USB, cards.", ""],
    ["RFC 3227", "Guidelines for Evidence Collection and Archiving; source of the order of volatility.", ""],
    ["Logical Acquisition", "Collecting only the files needed for the case; fast when targets are known.", "Only the Outlook .pst was collected."],
    ["Sparse Acquisition", "Collecting specific areas/sectors with needed data; excludes unallocated space.", ""],
    ["Bitstream Disk-to-Image", "Bit-by-bit copy of a suspect drive into image file(s); the most common acquisition type.", ""],
    ["Bitstream Disk-to-Disk (Cloning)", "Copying one disk entirely onto another bit by bit; target geometry can be adjusted.", ""],
    ["Qualified Bitstream Copy", "Copy identical to the source except in identified areas where I/O errors occurred.", ""],
    ["Raw Format", "Bit-by-bit image with no metadata or compression; same size as source; widely supported (dd).", ""],
    ["AFF / AFF4", "Advanced Forensic Format (open, compressed, metadata) and its object-oriented redesign for large media with network storage and zero-copy maps.", ""],
    ["E01 (EWF)", "Expert Witness Format: compressed, segmented proprietary image with metadata and hashes.", ""],
    ["eDiscovery", "Discovering, protecting, collecting, reviewing, and presenting ESI for legal proceedings and compliance.", ""],
    ["EDRM", "Electronic Discovery Reference Model: conceptual, non-linear framework of eDiscovery stages.", ""],
    ["Custodian", "Person or entity holding or controlling data relevant to a case.", "Custodians were identified through data mapping."],
    ["TAR", "Technology-Assisted Review: automated review/data reduction to filter ESI volume.", ""],
    ["Legal Hold / Freeze", "Legal instruction to custodians to stop deleting or altering relevant information.", ""],
    ["Sanitization", "Overwriting or destroying data on media so it cannot be recovered (Clear, Purge, Destroy per NIST SP 800-88).", ""],
    ["Cryptographic Erase", "Purging by destroying the encryption key so data becomes unreadable.", ""],
    ["LiME", "Linux Memory Extractor: loadable kernel module for forensically sound RAM capture, local or remote.", ""],
    ["fmem", "Linux kernel module giving direct access to RAM at /dev/fmem for dd acquisition.", ""],
    ["Netcat (nc)", "Utility to send/receive data over a network; used to pipe RAM or disk images to a forensic workstation.", ""],
    ["dd", "Built-in Unix/Linux command to copy data block by block; if= input, of= output, bs= block size.", ""],
    ["dcfldd", "Forensic extension of dd with on-the-fly hashing, split output, verify, and logging.", ""],
    ["Write Protection", "Hardware/software measures giving read-only access to evidence media.", ""],
    ["Host Protected Area (HPA)", "Hidden region of a drive that some hardware acquisition tools can reach at BIOS level.", ""],
    ["Contingency Plan", "Backup plan for acquisition failure: duplicate images, second tool, hardware tools, decryption readiness.", ""],
    ["CRC-32", "32-bit cyclic redundancy check; error-detection checksum.", ""],
    ["MD5 / SHA-1 / SHA-256", "Hash algorithms producing 128-, 160-, and 256-bit digests used to verify image integrity.", ""],
    ["Get-FileHash", "PowerShell cmdlet that computes a file's hash with a chosen algorithm.", ""],
    ["CAINE", "Computer Aided Investigative Environment: Italian forensic Linux live distribution.", ""],
    ["Guymager", "Linux forensic imager producing dd, E01, and AFF images.", ""],
    ["Autopsy", "GUI for The Sleuth Kit; ingest modules, timeline, registry analysis, tags.", ""],
    ["APFS / HFS+", "Apple file systems: APFS (modern) and HFS+ (older).", ""],
	["Acquisition Layers", "Application, file system, partition/volume, disk: higher layers allow logical/sparse; disk layer needs a full image.", ""],
	["RAID Format", "Level such as 0, 1, 5, 10; determines how to acquire and reconstruct the array.", ""]
  ],

  cards: [
    ["What is data acquisition?", "Imaging/collecting ESI from suspect media by established, verified, repeatable methods."],
    ["Live vs dead acquisition?", "Live: powered-on system, volatile data (RAM, cache), real time. Dead: powered off, non-volatile data from media."],
    ["Two types of volatile data?", "System data (processes, logins, clipboard, command history...) and network data (connections, ports, routes, ARP cache)."],
    ["What can live acquisition reveal that disk imaging can't?", "Cloud sessions, open unencrypted containers that re-encrypt at shutdown, traces of data overwritten on disk."],
    ["RFC 3227 order of volatility?", "Registers/cache; routing/ARP/process tables, kernel stats, memory; temp file systems; disk; remote logs; physical config/topology; archival media."],
    ["Lifespan of registers and cache?", "Nanoseconds: the most volatile."],
    ["Archival media volatility?", "Least volatile; changes only by physical damage."],
    ["Why two copies before analysis?", "A working copy for analysis, and a library/control copy for disclosure or if the working copy is corrupted."],
    ["Never do what on original evidence?", "Perform any forensic process; analyze copies only."],
    ["Logical vs sparse acquisition?", "Logical: only needed files. Sparse: specific sectors/areas; excludes unallocated space."],
    ["When can't you use disk-to-image?", "Suspect drive too old/incompatible with imaging software, or when recovering website/account credentials."],
    ["Raw format drawbacks?", "No metadata, no compression (same size as source)."],
    ["Proprietary format advantages/disadvantages?", "Compression, segmentation, metadata; but tool lock-in and slower search."],
    ["AFF compression algorithms?", "zlib (faster, less efficient) and LZMA (slower, more efficient)."],
    ["AFFv3 extensions?", ".aff, .afd (image), .afm (metadata)."],
    ["Key AFF4 features?", "Large media, Zip/Zip64, network storage (WebDAV), zero-copy maps, signing/crypto, GUIDs."],
    ["Define eDiscovery.", "Discovering, protecting, collecting, reviewing, presenting ESI for legal proceedings."],
    ["Is EDRM linear?", "No: conceptual, iterative; stages may be skipped, repeated, reordered."],
    ["EDRM stages in order?", "Information governance, identification, preservation, collection, processing, review, analysis, production, presentation (then retention/disposition)."],
    ["What is a legal hold at EDRM preservation?", "Legal instructs custodians to freeze ESI: no deletion or alteration."],
    ["Name six eDiscovery collection methods.", "Full disk, directed, custodian self-collection, remote, incremental, sampling/targeted."],
    ["eDiscovery collection and metadata rule?", "Don't modify application metadata (last saved, author, track changes, last accessed/printed)."],
    ["Name an eDiscovery tool and a feature.", "Intella Pro: >250 GB ESI, cluster maps, email threading, MD5 filtering."],
    ["The 8 steps of acquisition methodology?", "Determine method; select tool; sanitize target; acquire volatile; write-protect; acquire non-volatile; contingency; validate."],
    ["Factors when determining acquisition method?", "Drive size, time required, whether the drive can be retained."],
    ["How to test lossless compression?", "Hash before and after (MD5/SHA-2/SHA-3); matching hashes = success."],
    ["Mandatory imaging tool requirement: error logging?", "Must log I/O errors readably with type and location."],
    ["Qualified bitstream copy?", "Duplicate except in identified error areas."],
    ["Destination vs source size rule?", "Tool copies only if destination >= source and documents destination contents not part of the copy."],
    ["Does formatting sanitize a drive?", "No: overwrite with zeros/ones (or purge/destroy)."],
    ["DoD 5220.22-M (ECE) passes?", "7 passes (0, 1, random, 0, 0, 1, random); verify on 7th."],
    ["VSITR passes/pattern?", "7 passes: six alternating 0x00/0xFF, last 0xAA."],
    ["NIST SP 800-88 methods?", "Clear (overwrite), Purge (recovery infeasible, incl. crypto erase), Destroy (physical)."],
    ["Proof of physical media destruction?", "Certificate of destruction."],
    ["Windows RAM capture tool?", "Belkasoft Live RAM Capturer (.mem), runs from USB."],
    ["Linux RAM capture with dd?", "dd if=/dev/fmem of=file.dd bs=1MB (fmem module)."],
    ["Remote RAM with dd + netcat: who listens?", "The forensic workstation: nc -l <port> > file.dd; suspect pipes dd into nc."],
    ["Remote RAM with LiME: who listens?", "The suspect machine (tcp:<port>); the workstation connects with nc."],
    ["LiME local command?", "insmod lime-<kernel>.ko \"path=<dir> format=lime\""],
    ["Mac RAM tools?", "Cellebrite Digital Collector, Surge, BlackBag MACQUISITION."],
    ["Linux read-only mount flag?", "mount -o ro <device>."],
    ["Write blocker examples?", "Hardware: Tableau Forensic Bridge, WiebeTech, Logicube. Software: SAFE Block, X-Ways."],
    ["FTK Imager image type for bit-for-bit?", "Physical."],
    ["dd: skip vs seek?", "skip: blocks skipped at start of input. seek: blocks skipped at start of output."],
    ["dd conv=noerror,sync?", "Continue on read errors; pad failed blocks to keep alignment."],
    ["Why dcfldd over dd?", "On-the-fly hashing, status, verify, split, multiple outputs, logs."],
    ["dcfldd hashwindow / hashlog?", "hashwindow hashes data in chunks; hashlog saves hashes to a file."],
    ["dcfldd vf option?", "Verify file vs input; only for non-segmented images."],
    ["Mac single-user mode key combo?", "Cmd+S at boot."],
    ["Mac target disk mode key?", "T at boot."],
    ["Why disable disk arbitration in target disk mode?", "Stops macOS auto-mounting drives (prevents writes)."],
    ["Rufus + CAINE + Guymager?", "Bootable USB creator + forensic Linux live distro + imager (dd/E01/AFF)."],
    ["Boot a Mac from USB?", "Hold Option (Alt) at startup; choose EFI Boot."],
    ["How to identify RAID on Windows?", "Device Manager drivers, then diskpart: list disk, select disk, detail disk."],
    ["Rule when rebuilding hardware RAID?", "Don't write data onto the original member disks."],
    ["Contingency: two images with how many tools?", "At least two images; if two tools available, one with each."],
    ["Which tools reach the HPA?", "Hardware tools (UFED Ultimate, IM Solo-4 G3 PLUS) at BIOS level."],
    ["Hash sizes: MD5, SHA-1, SHA-256, SHA-512?", "128, 160, 256, 512 bits."],
    ["Windows hash cmdlet?", "Get-FileHash <file> -Algorithm SHA256."],
    ["Do raw images contain hash metadata?", "No; validate manually."],
    ["What does a ProDiscover .eve file hold?", "Metadata incl. hash of original media; mismatch means image corrupt/unreliable."],
    ["macOS default hashing/imaging command?", "dd only (no dcfldd by default)."],
    ["Calculate mount offset?", "Start sector x sector size (bytes)."],
    ["E01 to dd/raw on Linux?", "xmount, or ewfmount then mount."],
    ["Boot an acquired image as a VM?", "qemu-img convert to VHDX, create a Hyper-V VM, boot."],
    ["Examine a physical Windows disk on Linux?", "lshw, lsblk, mount -t ntfs-3g -o ro; use a write blocker."],
    ["Mount APFS on Linux?", "losetup -f, losetup -r /dev/loopN image, then mount or apfs-fuse."],
    ["HFS+ drivers on Windows?", "Copy AppleHFS.sys and AppleMNT.sys to System32\\drivers, merge AppleHFS.reg, restart (read-only). Or Paragon HFS+ (read/write)."],
    ["Autopsy workflow?", "Create case, Add Data Source, choose type/path, select ingest modules, Finish."],
    ["Autopsy image formats?", ".img, .dd, .raw, .bin, .vhd, .001, .aa."],
    ["R-Studio is used for?", "Data recovery/examination on macOS (HFS/HFS+/APFS) images and partitions."],
	["Acquisition layers highest to lowest?", "Application, file system, partition/volume, disk."],
	["Which layer requires a full image?", "Disk layer (partition/volume can use logical, sparse, or full)."],
	["Factors before acquiring RAID?", "Storage needed, RAID format, hardware vs software RAID, tool compatibility with controller, imaging vs logical, reconstruction plan, checksum comparison."],
	["Tools with RAID recovery?", "OpenText EnCase Forensic, X-Ways Forensics, ProDiscover."]
  ],

  quiz: [
    ["A suspect's PC is powered on and RAM may hold an encryption key. Which acquisition and why?", ["Dead: disk survives shutdown", "Live: RAM is lost at power-off", "Logical: faster", "Sparse: excludes unallocated space"], 1, "Volatile data must be collected in real time."],
    ["Which is NOT part of volatile network data?", ["Open ports", "ARP cache", "Routing information", "Boot sector"], 3, "Boot sectors are static data from the drive."],
    ["Per RFC 3227, which is the MOST volatile?", ["Disk", "Registers and processor cache", "Remote logs", "Archival media"], 1, ""],
    ["Per RFC 3227, which is the LEAST volatile?", ["Temporary file systems", "Archival media (USB, DVD)", "Routing table", "Remote logging"], 1, ""],
    ["Why make two copies of the original before the investigation begins?", ["One for each investigator", "Working copy and a library/control copy", "To compare hash algorithms", "Required by dd"], 1, ""],
    ["Which acquisition excludes unallocated space and targets specific sectors?", ["Sparse", "Bitstream disk-to-image", "Disk-to-disk", "Full disk"], 0, ""],
    ["Disk-to-image is NOT possible when:", ["Drive is large", "Drive is very old/incompatible with imaging software", "Drive uses NTFS", "Time is short"], 1, ""],
    ["Which format has no metadata and no compression?", ["E01", "AFF", "Raw", "AFF4"], 2, ""],
    ["Which format is open source and offers zlib and LZMA compression?", ["Raw", "AFF", "Proprietary", "CRC"], 1, ""],
    ["Which format adds WebDAV network storage and zero-copy maps?", ["AFF", "AFF4", "Raw", "E01"], 1, ""],
    ["EDRM is best described as...", ["A strict waterfall model", "A conceptual, iterative framework", "A hash algorithm", "A court rule"], 1, ""],
    ["At which EDRM stage do legal teams instruct custodians to freeze information?", ["Collection", "Processing", "Preservation", "Production"], 2, ""],
    ["Custodians are given guidelines and collect their own ESI. Which method?", ["Directed", "Custodian self-collection", "Remote", "Incremental"], 1, ""],
    ["Which eDiscovery collection method suits cases where new custodians appear later?", ["Full disk", "Sampling", "Incremental", "Self-collection"], 2, ""],
    ["Which is the FIRST step of the acquisition methodology?", ["Select tool", "Sanitize target", "Determine acquisition method", "Validate"], 2, ""],
    ["Where does 'Plan for contingency' fall?", ["Step 3", "Step 5", "Step 7", "Step 8"], 2, "Method, tool, sanitize, volatile, write-protect, non-volatile, contingency, validate."],
    ["How do you confirm lossless compression of an image?", ["Compare file sizes", "Hash before and after; they must match", "Open the file", "Check timestamps"], 1, ""],
    ["Which is a MANDATORY imaging tool requirement?", ["Compute block-level hashes", "Must not alter original content", "Log tool version", "Create partition-level copies"], 1, "The others are optional."],
    ["Why is formatting a drive insufficient before using it as the target?", ["It's slow", "Data physically remains; overwrite is required", "It voids the license", "It changes the cluster size"], 1, ""],
    ["NIST SP 800-88 'Purge' means:", ["Overwrite with normal commands", "Make recovery infeasible even with lab techniques", "Shred the media", "Delete partitions"], 1, ""],
    ["Which tool captures Windows RAM to a .mem file?", ["LiME", "Belkasoft Live RAM Capturer", "Guymager", "Rufus"], 1, ""],
    ["In dd + netcat remote RAM capture, what runs on the forensic workstation?", ["dd if=/dev/fmem | nc ...", "nc -l <port> > file.dd", "insmod lime", "mount -o ro"], 1, ""],
    ["LiME remote capture: where is the listener started?", ["On the forensic workstation", "On the suspect machine", "On the router", "On the write blocker"], 1, "insmod ... path=tcp:<port>; the workstation connects with nc."],
    ["Which Linux flag mounts media read-only?", ["-o rw", "-o ro", "-t ro", "-r rw"], 1, ""],
    ["Which is a hardware write blocker?", ["SAFE Block", "X-Ways Forensics", "Tableau Forensic Bridge", "mount -o ro"], 2, ""],
    ["In FTK Imager, which image type gives a bit-for-bit copy of the entire drive?", ["Logical", "Physical", "Contents of folder", "Custom"], 1, ""],
    ["In dd, 'skip=' applies to the...", ["Output start", "Input start", "Block size", "Hash"], 1, "seek skips output blocks."],
    ["Which dcfldd option saves hashes to a file?", ["split", "hashlog", "vf", "bs"], 1, ""],
    ["Which dcfldd option verifies an image but not segmented files?", ["hash", "vf", "hashconv", "splitformat"], 1, ""],
    ["Cmd+S held at boot starts what on a Mac?", ["Target disk mode", "Single-user mode", "Startup Manager", "Recovery"], 1, ""],
    ["Why disable disk arbitration for target disk mode?", ["Speed", "Prevent auto-mounting of the drive", "Enable FireWire", "Encrypt data"], 1, ""],
    ["Which pair creates a bootable forensic USB and images a Mac without removing the drive?", ["Rufus + CAINE (Guymager)", "Autopsy + LiME", "dd + netcat", "FTK + EnCase"], 0, ""],
    ["When rebuilding hardware RAID you must NOT...", ["Record array state", "Write data onto the original member disks", "Use recovery software", "Copy data back"], 1, ""],
    ["Which tools access the Host Protected Area at BIOS level?", ["Software hash tools", "Hardware acquisition tools (e.g. UFED Ultimate)", "dd only", "Autopsy"], 1, ""],
    ["Contingency with two imaging tools available:", ["Use only the best tool", "Make one image with each tool", "Make one image, hash twice", "Skip imaging"], 1, ""],
    ["A SHA-256 hash is how many bits?", ["128", "160", "256", "512"], 2, ""],
    ["Which Windows cmdlet computes a file hash?", ["Get-Hash", "Get-FileHash", "Compute-Hash", "Show-Hash"], 1, ""],
    ["Raw images lack metadata. What follows?", ["They can't be hashed", "They need separate manual validation", "They're invalid", "They're encrypted"], 1, ""],
    ["ProDiscover reports the image hash doesn't match the original. The image is...", ["Fine", "Corrupt/unreliable", "Compressed", "Segmented"], 1, ""],
    ["Which does macOS include by default?", ["dd and dcfldd", "dd only", "dcfldd only", "neither"], 1, ""],
    ["A volume starts at sector 2048 (512-byte sectors). The mount offset is?", ["2048", "1,048,576", "512", "4,194,304"], 1, "2048 x 512 = 1,048,576 bytes."],
    ["Which tool converts E01 into a mountable raw image on Linux?", ["ewfmount", "lsblk", "fdisk", "Rufus"], 0, ""],
    ["How do you make an acquired dd image bootable as a VM in Hyper-V?", ["xmount", "qemu-img convert to VHDX", "losetup", "dcfldd"], 1, ""],
    ["Before connecting a physical Windows disk to a Linux workstation you should...", ["Format it", "Use a write blocker", "Run chkdsk", "Delete partitions"], 1, ""],
    ["Which tools mount an APFS image on Linux?", ["losetup then mount or apfs-fuse", "ewfmount", "AppleHFS.sys", "Get-FileHash"], 0, ""],
    ["Reading HFS+ on Windows using Apple's driver package is...", ["Read/write", "Read-only", "Impossible", "Encrypted"], 1, ""],
    ["In Autopsy, which comes right after Add Data Source and choosing the path?", ["Select ingest modules", "Create case", "Export report", "Mount image"], 0, ""],
	["Which layer always needs a full image?", ["Application", "File system", "Disk", "None"], 2, ""],
	["Which is a RAID acquisition factor?", ["Monitor size", "Hardware vs software RAID and the controller", "BIOS date", "Printer type"], 1, ""],
	["Which tool has built-in RAID recovery?", ["Rufus", "X-Ways Forensics", "Netcat", "Guymager"], 1, ""],
	["After reconstructing a RAID array you should...", ["Discard the original", "Compare checksums to the original array", "Format the drives", "Write data to member disks"], 1, ""]
  ],

  procedures: [
    {
      id: "acq-method", title: "The 8-Step Acquisition Methodology",
      intro: "Walk the ordered process for a live suspect workstation, with a checkpoint at each step.",
      steps: [
        { title: "1. Determine the acquisition method", body: "Scenario: 1 TB suspect drive, you can retain it, and you have limited time. Factors: <b>drive size</b>, <b>time required</b> (1 TB can exceed 11 h), <b>can the drive be retained</b>. Retainable + large = disk-to-image with a reliable tool, because you usually get one chance.",
          check: { q: "Drive can't be retained. What do you check?", opts: ["Whether logical acquisition is acceptable", "Disk-to-disk only", "Skip acquisition"], a: 0 } },
        { title: "2. Select the tool", body: "Tool must satisfy the <b>mandatory</b> requirements: no alteration, error logging, source/destination size check, peer-reviewed, all hidden sectors, bitstream (or qualified bitstream on errors).",
          check: { q: "Which is mandatory?", opts: ["Block-level hash comparison", "Must not alter original content", "Partition-level copy"], a: 1 } },
        { title: "3. Sanitize the target media", body: "Overwrite the destination (e.g. DoD 5220.22-M or NIST Clear/Purge). Formatting alone leaves data behind.",
          check: { q: "Is a quick format enough?", opts: ["Yes", "No, overwrite is required"], a: 1 } },
        { title: "4. Acquire volatile data", body: "System is live: capture RAM first (Belkasoft on Windows, LiME or dd+fmem on Linux, Digital Collector on Mac). Collect network info too. Minimize footprint.",
          check: { q: "Volatile or non-volatile first?", opts: ["Volatile", "Non-volatile"], a: 0 } },
        { title: "5. Enable write protection", body: "Remove the drive; attach through a hardware write blocker (or software blocker with examiner-controlled OS). On Linux use <code>mount -o ro</code>. Test and document.",
          check: { q: "Purpose of write protection?", opts: ["Speed", "Prevent any modification to evidence media"], a: 1 } },
        { title: "6. Acquire non-volatile data", body: "Image the drive: FTK Imager (Physical, verify, segment, hash) on Windows; dd/dcfldd on Linux; single-user/target disk mode or CAINE+Guymager on Mac." },
        { title: "7. Plan for contingency", body: "At least <b>two images</b>; with two tools, one image each. Consider hardware tools for HPA. Be ready for BitLocker.",
          check: { q: "Minimum number of images?", opts: ["1", "2", "3"], a: 1 } },
        { title: "8. Validate", body: "Hash source and image (MD5/SHA-256). Match = successful. Windows: <code>Get-FileHash</code>. Linux: <code>md5sum</code>/<code>sha256sum</code> or dcfldd <code>vf</code>. Record algorithm and values in the report; update custody log.",
          check: { q: "What does a hash mismatch mean?", opts: ["Image differs from source; reacquire", "Nothing important"], a: 0 } }
      ]
    },
    {
      id: "ftk-imager-ch4", title: "FTK Imager: Acquire and Verify (Windows)",
      intro: "Dead acquisition on a Windows forensic workstation per your Module 4 notes.",
      steps: [
        { title: "Prepare", body: "Remove the suspect drive, connect to the forensic workstation, and <b>enable a write blocker</b>. FTK Imager is stand-alone: no installation needed.",
          check: { q: "Order: write blocker before or after connecting?", opts: ["Before reading the drive", "After imaging"], a: 0 } },
        { title: "File &gt; Create Disk Image", body: "Open the Create Disk Image dialog." },
        { title: "Select Source", body: "Choose the source device (internal or external storage)." },
        { title: "Select Destination", body: "Choose where the image goes; <b>ensure enough storage space</b> (and a sanitized target)." },
        { title: "Configure options", body: "<b>Image type: Physical</b> (bit-for-bit entire drive); <b>Compression</b> if space is a concern; <b>Verify images</b> after creation; <b>Segmented images</b> to split into smaller files.",
          check: { q: "Which option gives a bit-for-bit copy of the whole drive?", opts: ["Logical", "Physical", "Compression"], a: 1 } },
        { title: "Set hashing options", body: "Choose hash algorithms (MD5, SHA-1...) to calculate for the image." },
        { title: "Start", body: "Begin acquisition; FTK Imager creates the forensic image." },
        { title: "Verify hashes", body: "When done, FTK Imager displays hashes. <b>Verify them</b> to confirm integrity; record in report and custody log.",
          check: { q: "What do you do with the displayed hashes?", opts: ["Ignore them", "Verify and record them", "Delete them"], a: 1 } }
      ]
    },
    {
      id: "linux-dd-validate", title: "Linux: Image with dd and Validate with md5sum",
      intro: "A conceptual walkthrough of the dd + md5sum validation workflow, then mounting the image read-only.",
      steps: [
        { title: "Identify the source", body: "Use <code>lsblk</code> or <code>fdisk -l</code> to identify the evidence disk, e.g. <code>/dev/sda</code>. Evidence disk should be write-blocked.",
          check: { q: "Which lists block devices?", opts: ["lsblk", "ls -l", "umount"], a: 0 } },
        { title: "Image the disk", body: "<code>dd if=/dev/sda of=/image_sda.dd</code> (add <code>bs=</code> and <code>conv=noerror,sync</code> as needed)." },
        { title: "Hash the original", body: "<code>md5sum /dev/sda &gt; md5_hashes.txt</code>",
          check: { q: "Which device do you hash first?", opts: ["The original", "The image"], a: 0 } },
        { title: "Hash the image", body: "<code>cat image_sda.dd | md5sum &gt;&gt; md5_hashes.txt</code>" },
        { title: "Compare", body: "<code>cat md5_hashes.txt</code>. Identical hashes = successful acquisition. Sha1sum/sha256sum/sha512sum work the same way.",
          check: { q: "Identical hashes mean:", opts: ["Acquisition successful", "Image corrupt", "Need dcfldd"], a: 0 } },
        { title: "Find the partition offset", body: "<code>fdisk -l image_sda.dd</code>: note start sector and sector size. <b>Offset = start x sector size.</b>",
          check: { q: "Start 2048, sector 512. Offset?", opts: ["2048", "1,048,576", "512"], a: 1 } },
        { title: "Mount read-only and examine", body: "<code>mkdir /mnt/evidence</code><br><code>mount -t ntfs -o ro,offset=1048576 image_sda.dd /mnt/evidence</code><br><code>ls -l /mnt/evidence</code>, then <code>umount /mnt/evidence</code>." },
        { title: "Re-hash the image", body: "Compute the image hash again and confirm it still matches the value from before mounting." }
      ]
    }
  ],

  /* Extra Faux Terminal commands, merged by terminal.js. run(args, ctx) returns text. */
  cli: [
	{ cmd: "dcfldd", help: "dcfldd if=.. of=.. [hash=..] [hashlog=..] [split=..] [vf=..]   simulate forensic imaging",
	  run: a => {
		const m = Object.fromEntries(a.filter(x => x.includes("=")).map(x => { const i = x.indexOf("="); return [x.slice(0, i), x.slice(i + 1)]; }));
		if (m.vf) return `Verifying ${m.if || "<input>"} against ${m.vf} ...\nMatch. (vf works only on non-segmented images.)`;
		if (!m.if || !m.of) return "usage: dcfldd if=/dev/sda of=/media/image.dd hash=sha256 hashlog=/media/sha256.txt split=10M";
		const len = { md5: 32, sha1: 40, sha256: 64, sha384: 96, sha512: 128 };
		const out = (m.hash || "").split(",").filter(Boolean).map(al => len[al] ? `Total (${al}): ${CCT.pseudoHash(m.if + al, len[al])}` : `dcfldd: unknown hash '${al}' (valid: md5, sha1, sha256, sha384, sha512)`);
		return [m.split ? "Splitting output into " + m.split + " segments" : "", "1048576+0 records in", "1048576+0 records out", ...out, m.hashlog ? "Hashes written to " + m.hashlog : ""].filter(Boolean).join("\n");
	  } },
	{ cmd: "offset", help: "offset <start_sector> [sector_size]   mount offset in bytes",
	  run: a => { const s = +a[0], z = +a[1] || 512; if (isNaN(s)) return "usage: offset 2048 512"; return `${s} x ${z} = ${(s * z).toLocaleString()} bytes\nmount -t ntfs -o ro,offset=${s * z} image.dd /mnt/evidence`; } },
	{ cmd: "mount", help: "mount [-t type] [-o ro,offset=N] <image> <dir>   checks your options",
	  run: a => {
		const o = a.join(" "), ro = /(^|[\s,])ro([\s,]|$)/.test(o) || a.includes("-r");
		let msg = ro ? "Mounted READ-ONLY. Evidence is protected." : "WARNING: no 'ro' option. A writable mount can alter evidence and its hash. Use: mount -o ro,...";
		const off = o.match(/offset=(\d+)/); if (off) msg += `\nOffset ${off[1]} bytes = sector ${(+off[1] / 512).toFixed(0)} (512-byte sectors).`;
		return msg;
	  } },
	{ cmd: "Get-FileHash", help: "Get-FileHash <file> [-Algorithm SHA256]   PowerShell hash (simulated)",
	  run: a => { const ai = a.findIndex(x => x.toLowerCase() === "-algorithm"); const al = (ai >= 0 ? a[ai + 1] || "" : "SHA256").toUpperCase(); const n = a.find((x, i) => !x.startsWith("-") && i !== ai + 1); const len = { MD5: 32, SHA1: 40, SHA256: 64, SHA384: 96, SHA512: 128 }[al]; if (!n) return "usage: Get-FileHash <file> -Algorithm SHA256"; if (!len) return "Unsupported algorithm. Use MD5, SHA1, SHA256, SHA384, SHA512."; return `Algorithm       Hash\n---------       ----\n${al.padEnd(15)} ${CCT.pseudoHash(n + al, len).toUpperCase()}\nPath: ${n}`; } },
	{ cmd: "sha1sum", help: "sha1sum <file>   (simulated)", run: a => a[0] ? CCT.pseudoHash(a[0] + "sha1", 40) + "  " + a[0] : "usage: sha1sum <file>" },
	{ cmd: "nc", help: "nc -l <port> > file   explains which side sends/receives",
	  run: a => a.includes("-l") ? `Listening on port ${a[a.indexOf("-l") + 1] || "<port>"} ... this side RECEIVES (output redirected to a file).` : `Connecting to ${a[0] || "<host>"} ${a[1] || "<port>"} ... this side SENDS the piped data.` },
	{ cmd: "insmod", help: "insmod lime-<kernel>.ko \"path=<dir|tcp:port> format=lime\"   LiME RAM capture",
	  run: a => { const o = a.join(" "); if (!/lime/.test(o)) return "usage: insmod lime-5.15.0.ko \"path=/media/ram.lime format=lime\""; return /tcp:/.test(o) ? "LiME: listening on TCP. From the workstation: nc <suspect_ip>:<port> > filename.mem" : "LiME: dumping physical memory to the local path in lime format ... done."; } },
	{ cmd: "xmount", help: "xmount --in ewf <file.E01> <dir>   E01 to dd view",
	  run: a => a.includes("--in") ? `Mounted ${a[a.length - 2]} as a raw (dd) view in ${a[a.length - 1]}` : "usage: xmount --in ewf file.E01 /mnt/xmount" },
	{ cmd: "qemu-img", help: "qemu-img convert -f raw <src> -O vhdx <dst>   dd to VHDX",
	  run: a => a[0] === "convert" ? `Converted to VHDX ${a[a.length - 1]}. Create a Hyper-V VM on it to boot the evidence (live analysis).` : "usage: qemu-img convert -f raw image.dd -O vhdx image.vhdx" }
  ]
});

