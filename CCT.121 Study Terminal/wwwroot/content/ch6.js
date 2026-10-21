CCT.addChapter({
  id: "ch6", num: 6, title: "Windows Forensics",
  summary: "Volatile and non-volatile collection, network/process tools, memory and registry analysis, USB and MRU artifacts, Electron apps, browsers, metadata, LNK/Jump Lists, and Windows event logs.",

  notes: [
    { id: "method", title: "Windows Forensics Methodology", category: "ops",
      summary: "Workflow and order of collection.",
      body: `
<div class="key"><b>Windows forensics:</b> collecting and analyzing evidence from Windows systems. Collect <b>volatile</b> data first (it is lost at power-off), then <b>non-volatile</b> data.</div>
<ul>
<li>Volatile: system time, logged-on users, open files, network info, connections, process info, process-to-port mapping, process memory, clipboard, service/driver info, command history, shares.</li>
<li>Non-volatile: file system, registry, event logs, hidden partitions, slack space, ESE databases, user accounts, installed apps, updates, browser and application artifacts.</li>
<li>Document every command and its output; hash outputs; use trusted binaries from external media rather than the suspect's own tools.</li>
</ul>` },

    { id: "network", title: "Volatile Data: Network Information", category: "ops",
      summary: "nbtstat, netstat, ipconfig, Promqry.",
      body: `
<p>Gather connection details promptly; they expire. Determine whether the attacker is still logged on and whether malware is sending data out. Look for other infected systems.</p>
<table><tr><th>Tool</th><th>Purpose / key switches</th></tr>
<tr><td><b>nbtstat</b></td><td>NetBIOS over TCP/IP stats. <code>-c</code> remote name cache, <code>-n</code> local names, <code>-r</code> names resolved by broadcast/WINS, <code>-S</code> sessions, <code>-a</code> remote name table by name, <code>-A</code> by IP</td></tr>
<tr><td><b>netstat</b></td><td>Built-in. <code>-a</code> all connections/listening ports, <code>-b</code> executables, <code>-e</code> Ethernet stats, <code>-n</code> numeric, <code>-o</code> PIDs, <code>-p</code> protocol, <code>-s</code> per-protocol stats, <code>-r</code> routing table. Common: <code>netstat -ano</code></td></tr>
<tr><td><b>ipconfig /all</b></td><td>IP, subnet mask, gateway, DNS/WINS, DHCP and NIC state</td></tr>
<tr><td><b>Promqry</b></td><td>Detects NICs in <b>promiscuous mode</b> (possible sniffer). CLI and GUI; cannot detect standalone sniffers or non-Windows sniffers. Nmap and NetScanTools Pro can also help</td></tr></table>
<p>Windows gives no obvious indicator of promiscuous mode, so detection tools are needed.</p>` },

    { id: "process", title: "Volatile Data: Process Information", category: "ops",
      summary: "tasklist, PsList, ListDLLs, Handle, Process Explorer, ProcDump.",
      body: `
<p>For each process capture: full image path, command line, running duration, security/user context, loaded modules, and memory contents.</p>
<table><tr><th>Tool</th><th>What it does</th></tr>
<tr><td><b>tasklist</b></td><td>Lists processes with PIDs, local or remote. <code>/svc</code> services per process, <code>/v</code> verbose (user, status, window title; no full path), <code>/fi</code> filter, <code>/m</code> by module</td></tr>
<tr><td><b>PsList</b></td><td>Process info incl. run time. <code>-d</code> threads, <code>-m</code> memory, <code>-x</code> all, <code>-t</code> tree</td></tr>
<tr><td><b>ListDLLs</b></td><td>DLLs loaded per process; <code>-u</code> unsigned DLLs, <code>-v</code> versions, <code>-d</code> who loaded a DLL. Useful for spotting DLL injection</td></tr>
<tr><td><b>Handle</b></td><td>Open handles: files, ports, registry keys, threads, processes. <code>-a</code> all types, <code>-p</code> by process, <code>-u</code> owner</td></tr>
<tr><td><b>Process Explorer</b></td><td>Two panes: processes on top; handles or DLLs below. Built-in VirusTotal check</td></tr>
<tr><td><b>ProcDump</b></td><td>Monitors CPU spikes and writes crash/process dumps</td></tr></table>
<div class="key"><b>Process-to-port mapping:</b> run <code>netstat -ano</code> to get PIDs, then correlate PIDs with <code>tasklist</code> to name the process behind each connection.</div>` },

    { id: "nonvolatile", title: "Non-volatile Data Collection", category: "ops",
      summary: "ESE databases, devices, slack, hidden partitions, accounts, apps, updates.",
      body: `
<h4>ESE (.edb) databases</h4>
<ul><li>Extensible Storage Engine: Exchange mailboxes, Windows Search index (<code>Windows.edb</code>), event log data, Active Directory (<code>ntds.dit</code>-style data).</li>
<li><code>Windows.edb</code>: <code>C:\\ProgramData\\Microsoft\\Search\\Data\\Applications\\Windows</code>; can reveal deleted data. Parse with <b>ESEDatabaseView</b> (NirSoft).</li></ul>
<h4>External devices</h4>
<ul><li><b>DriveLetterView</b> lists all drive letter assignments, including unplugged USB devices.</li><li><b>DevCon</b> (Device Console) lists/enables/disables/removes devices: <code>devcon listclass &lt;class&gt;</code>.</li></ul>
<h4>Hidden data</h4>
<ul><li><b>Slack space (file slack):</b> space between end of file and end of cluster; residual data may persist and can hide data.</li>
<li><b>Hidden partitions:</b> logical sections not accessible to the OS. <b>Partition Find and Mount</b> recovers lost partitions (even with a damaged MBR); <b>Partition Logic</b> manages partitions.</li></ul>
<h4>User accounts, apps, updates</h4>
<ul><li>User accounts live in the <b>SAM</b>: <code>C:\\Windows\\System32\\config\\SAM</code> (hive <code>HKLM\\SAM</code>). <b>Artifast</b> parses account metadata and timelines logons.</li>
<li>Thumbnails: <b>Thumbcache Viewer</b> reads <code>thumbcache_*.db</code>/<code>iconcache_*.db</code>, can show thumbnails of deleted files.</li>
<li>Installed apps: <code>wmic product get name,version,installlocation</code>, with <code>/format:csv</code> or <code>/format:htable</code> for export.</li>
<li>Updates: <code>wmic qfe list</code> (install date, description, HotFixID/KB).</li></ul>` },

    { id: "domain", title: "Domain Info and Compressed Files", category: "ops",
      summary: "AD and net commands; ZIP/RAR analysis.",
      body: `
<table><tr><th>Command</th><th>Result</th></tr>
<tr><td><code>Get-ADDomainController</code></td><td>Domain controller for the session; <code>-Discover</code> and <code>-Domain</code> find others</td></tr>
<tr><td><code>net users</code></td><td>Local/domain users</td></tr>
<tr><td><code>net accounts</code></td><td>Password and logon-limit policy</td></tr>
<tr><td><code>net group</code></td><td>Group accounts on server</td></tr>
<tr><td><code>net share</code></td><td>Shared resources</td></tr>
<tr><td><code>net use</code></td><td>Connect/disconnect shares; no options lists current connections</td></tr></table>
<p><b>Compressed files</b> (.zip, .rar, .gz) are used by attackers to deliver malware. Tools: <b>MailXaminer</b>, zipdump, Cellebrite Physical Analyzer. MailXaminer extracts contents automatically and exposes hidden content such as chats, SMS and calendar items.</p>` },

    { id: "memory", title: "Windows Memory Analysis", category: "ops",
      summary: "Dumps, tools, Volatility.",
      body: `
<div class="key">Memory holds processes, DLLs, network connections, passwords, keys, and malware that never touches disk.</div>
<ul>
<li><b>Dump types:</b> complete, kernel, small (minidump), and automatic memory dumps. <b>DumpChk</b> validates dump files.</li>
<li><b>Acquisition/analysis tools:</b> ProcDump, Userdump, adplus, <b>WinDbg</b>, <b>Redline</b>, <b>Volatility</b>, <b>Velociraptor</b>.</li>
<li><b>Volatility:</b> <code>imageinfo</code> (identify profile), <code>kdbgscan</code> (find KDBG), <code>pslist</code> (processes), <code>pstree</code> (parent/child tree).</li>
<li>Look for odd parent processes, misspelled names, unsigned DLLs, hidden/injected code.</li>
</ul>` },

    { id: "registry", title: "Windows Registry Structure and Analysis", category: "ops",
      summary: "Hives, root keys, tools.",
      body: `
<p>The registry is a hierarchical database of configuration; keys have <b>LastWrite</b> times that support timelines.</p>
<table><tr><th>Root key</th><th>Contents</th></tr>
<tr><td>HKEY_CLASSES_ROOT</td><td>File associations / COM</td></tr>
<tr><td>HKEY_CURRENT_USER</td><td>Current user settings (NTUSER.DAT)</td></tr>
<tr><td>HKEY_LOCAL_MACHINE</td><td>System-wide: SAM, SECURITY, SOFTWARE, SYSTEM</td></tr>
<tr><td>HKEY_USERS</td><td>All loaded user profiles</td></tr>
<tr><td>HKEY_CURRENT_CONFIG</td><td>Current hardware profile</td></tr></table>
<ul>
<li><b>Static analysis</b> of hive files from an image; <b>live analysis</b> on a running system (e.g., FTK Imager captures registry files).</li>
<li><b>RegScanner</b> finds keys modified in a time range. <b>fsutil</b> manages NTFS/FAT items (admin required).</li>
<li>Deleted keys do not go to a Recycle Bin: recover from a .reg backup or System Restore.</li>
</ul>` },

    { id: "persistence", title: "Autostart, VSS, and Startup Locations", category: "ops",
      summary: "Persistence keys, Autoruns, shadow copies.",
      body: `
<ul>
<li><b>Autoruns / autorunsc</b> shows everything set to run at boot/logon (startup folder, Run, RunOnce, services, drivers, scheduled tasks, shell extensions, Winlogon, browser helper objects) with VirusTotal integration.</li>
<li>Run keys: <code>HKLM\\...\\CurrentVersion\\Run</code>, <code>RunOnce</code>, and the HKCU equivalents. Ignored in safe mode. RunOnce values are deleted after they execute.</li>
<li>Also watch: <code>Winlogon</code> (Shell normally explorer.exe), Active Setup <code>StubPath</code>, <code>Session Manager\\BootExecute</code>, HKCU screensaver (<code>scrnsave.exe</code>), Winsock Protocol_Catalog (LSPs), <code>exefile\\shell\\open\\command</code>, Winlogon\\Notify.</li>
<li><b>Services Start value:</b> 2 automatic, 3 manual, 4 disabled.</li>
<li><b>Last login:</b> <code>HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon</code>. <b>SIDs:</b> <code>...\\ProfileList</code>.</li>
</ul>
<h4>Volume Shadow Copy Service (VSS)</h4>
<p>Block-level snapshots on NTFS even while files are in use; contain historical registry hives, SQLite databases and other artifacts. Access via the <b>Previous Versions</b> feature or <code>vssadmin list shadows|writers|volumes|providers</code>.</p>` },

    { id: "regartifacts", title: "Registry Artifacts: USB, MRU, and User Activity", category: "ops",
      summary: "What users did and which devices they plugged in.",
      body: `
<h4>USB devices</h4>
<ul>
<li><code>HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR</code>: subkey <code>Disk&amp;Ven_###&amp;Prod_###&amp;Rev_###</code> from the device descriptor; serial number is the unique instance ID.</li>
<li><b>ParentIdPrefix</b> correlates to <code>MountedDevices</code>, drive letters and <code>MountPoints2</code>. <code>DeviceClasses</code> GUIDs help find last connection time.</li>
<li><b>USBDeview</b> lists current and past USB devices; <code>setupapi.log</code> records first install time.</li>
</ul>
<h4>MRU / activity keys (HKCU)</h4>
<table><tr><th>Key</th><th>Shows</th></tr>
<tr><td>UserAssist</td><td>Programs run (ROT13-encoded names, run counts)</td></tr>
<tr><td>RecentDocs (MRUListEx)</td><td>Recently opened files</td></tr>
<tr><td>RunMRU</td><td>Commands typed into Run</td></tr>
<tr><td>TypedURLs</td><td>URLs typed in the address bar</td></tr>
<tr><td>OpenSavePidlMRU</td><td>Files opened/saved via dialogs</td></tr>
<tr><td>FileExts</td><td>Programs per file extension</td></tr>
<tr><td>TypedPaths</td><td>Last 25 paths typed into File Explorer</td></tr>
<tr><td>Map Network Drive MRU</td><td>Remote shares connected</td></tr>
<tr><td>MountPoints2</td><td>Volumes/shares added (also via net use)</td></tr></table>
<p><b>Restore points:</b> <code>SystemRestore</code> key; <code>RPSessionInterval</code> sets interval; <code>DisableSR = 1</code> disables restore points.</p>` },

    { id: "electron", title: "Electron Application Forensics", category: "apps",
      summary: "Chromium-based desktop apps.",
      body: `
<p>Electron apps (Teams, WhatsApp, Skype, Slack, Discord) bundle Chromium and Node.js. Data lives in localStorage, SQLite, file storage and <b>IndexedDB</b>, which Chromium stores in <b>LevelDB</b> (<code>.ldb</code> key-value files). Parse with Magnet AXIOM LevelDB Viewer or ccl_chrome_indexeddb.</p>
<table><tr><th>App</th><th>Locations</th></tr>
<tr><td>Teams</td><td><code>%AppData%\\Microsoft\\Teams\\Cache\\Cache_Data</code>; view with ChromeCacheView (data over 16 KB are stored in separate files). Cloud: chats in user mailbox, channel chats in group mailbox, files in SharePoint/OneDrive</td></tr>
<tr><td>WhatsApp</td><td><code>%LocalAppData%\\Packages\\&lt;WhatsApp-version&gt;\\LocalCache</code>, <code>%AppData%\\WhatsApp\\Cache</code>, Prefetch <code>WHATSAPP.EXE</code></td></tr>
<tr><td>Skype</td><td><code>%AppData%\\Skype</code>, <code>%LocalAppData%\\Skype</code>, IndexedDB under <code>%AppData%\\Skype\\&lt;username&gt;\\IndexedDB</code>; deleted history can remain in SQLite</td></tr></table>` },

    { id: "browsers", title: "Web Browser Forensics", category: "apps",
      summary: "Firefox, Chrome, Edge artifacts and tools.",
      body: `
<p><b>Workflow:</b> identify browsers, acquire artifacts without altering them, parse history/cookies/cache/downloads/forms, build a timeline, look for phishing/malware sites.</p>
<h4>Firefox (SQLite)</h4>
<ul><li><code>places.sqlite</code>: history (moz_places, moz_historyvisits), downloads (moz_annos), bookmarks. <code>cookies.sqlite</code> (moz_cookies), <code>formhistory.sqlite</code> (moz_formhistory), <code>signons</code> saved logins, <code>permissions.sqlite</code>, <code>addons</code>, <code>content-prefs</code>. Cache in <code>cache2</code>.</li>
<li>Tool: <b>SQLite Forensic Explorer</b> (index, view deleted records).</li></ul>
<h4>Chrome</h4>
<ul><li><code>...\\Google\\Chrome\\User Data\\Default\\</code>: History (visits table, <code>transition</code> value masked with <code>0xFF</code> CORE_MASK), <b>Preferences</b> (JSON; last_signin, last_synced_time, last clear time), <b>Web Data</b> (<code>token_service</code>), <b>Shortcuts</b> (omni_box_shortcuts), <b>Network Action Predictor</b>, Cache, Cookies.</li>
<li>Tools: ChromeCacheView, ChromeCookiesView, ChromeHistoryView.</li></ul>
<h4>Edge</h4>
<ul><li><code>Extensions</code> folder (manifest JSON: version, permissions); <code>visit_source</code> table: 0 synced, 1 user browsed, 2 extension, 3 Firefox import, 4 IE import, 5 Safari import; <code>Web Data token_service</code> for account IDs.</li>
<li>Tools: IECacheView, EdgeCookiesView, <b>BrowsingHistoryView</b> (combined history across browsers).</li></ul>
<h4>Private browsing</h4>
<p>Designed to leave little on disk, but artifacts may remain in RAM, pagefile.sys, database logs, cached data Type fields, and at the ISP/network. Pull-the-plug acquisition can preserve database logs.</p>` },

    { id: "metadata", title: "File Metadata and Timestamps", category: "apps",
      summary: "FAT vs NTFS time behavior.",
      body: `
<table><tr><th></th><th>FAT32</th><th>NTFS</th></tr>
<tr><td>Time base</td><td>Local time</td><td>UTC</td></tr>
<tr><td>Resolution</td><td>2 seconds (access: date only)</td><td>100 ns</td></tr>
<tr><td>Extra</td><td>No MFT</td><td>MFT entry changed time; last-access updates may be disabled</td></tr></table>
<ul><li>Metadata types: file system, document (author, software), image EXIF (camera, GPS), email headers.</li>
<li><b>Zone.Identifier</b> alternate data stream marks downloaded files and their source.</li>
<li>Tool: <b>ExifTool</b> for PDF/image/Office metadata.</li></ul>` },

    { id: "lnk", title: "ShellBags, LNK Files, and Jump Lists", category: "apps",
      summary: "Evidence of file and folder access.",
      body: `
<ul>
<li><b>ShellBags:</b> registry records of folders viewed in Explorer, including deleted or removable locations.</li>
<li><b>LNK (shortcut) files:</b> created when a file is opened; record target path, timestamps, volume info and size. Malicious LNKs may be placed in Startup.</li>
<li><b>Jump Lists:</b> recent items per application. <code>AutomaticDestinations</code> and <code>CustomDestinations</code> under <code>%AppData%\\Microsoft\\Windows\\Recent\\</code>; file names start with a 16-digit <b>AppID</b>. Tool: <b>JumpListsView</b>.</li>
</ul>` },

    { id: "eventlogs", title: "Windows Event Logs", category: "ops",
      summary: "Types, logon IDs, file structure.",
      body: `
<ul>
<li>Logs: <b>Application</b>, <b>Security</b> (needs auditing enabled; off by default), <b>System</b>. Files: <code>C:\\Windows\\System32\\winevt\\Logs\\*.evtx</code>.</li>
<li>Recording depends on audit policy (<code>secpol.msc</code> &rarr; Local Policies &rarr; Audit Policy). Domain GPO can override local changes by attackers.</li>
<li>System log: Event ID <b>7035</b> (control sent to service) and <b>7036</b> (service started/stopped).</li>
<li>Application log: antivirus alerts, VNC connections with IP and port.</li>
<li>Tools: Event Viewer (Filter Current Log), <b>Event Log Explorer</b>, Microsoft Log Parser.</li>
</ul>
<table><tr><th>Logon type</th><th>Meaning</th></tr>
<tr><td>2</td><td>Interactive</td></tr><tr><td>3</td><td>Network</td></tr><tr><td>4</td><td>Batch</td></tr><tr><td>5</td><td>Service</td></tr><tr><td>7</td><td>Unlock</td></tr><tr><td>8</td><td>NetworkCleartext</td></tr><tr><td>9</td><td>NewCredentials</td></tr><tr><td>10</td><td>RemoteInteractive (RDP)</td></tr><tr><td>11</td><td>CachedInteractive</td></tr></table>
<h4>Log file internals</h4>
<ul><li>Structure: <b>ELF_LOGFILE_HEADER</b> (size 0x30, signature 0x654c664c = "eLfL"), <b>EVENTLOGRECORD</b>s, <b>ELF_EOF_RECORD</b>.</li>
<li>Header flags: DIRTY 0x0001, WRAP 0x0002, LOGFULL_WRITTEN 0x0004, ARCHIVE_SET 0x0008.</li>
<li><b>Non-wrapping:</b> oldest record next to header (new or cleared log). <b>Wrapping:</b> circular buffer after size limit; oldest and newest records move; last record split.</li>
seconds since 1 Jan 1970 UTC.</li></ul>` },

    { id: "cmdref", title: "Command and Tool Reference", category: "ops",
      summary: "Every command and tool in the lesson, grouped by purpose.",
      body: `
<h4>Network</h4>
<table><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>netstat -ano</code></td><td>All connections/listeners with PIDs, numeric</td></tr>
<tr><td><code>netstat -b</code></td><td>Executable behind each connection (admin)</td></tr>
<tr><td><code>netstat -e / -s / -r</code></td><td>Ethernet stats / per-protocol stats / routing table</td></tr>
<tr><td><code>nbtstat -c / -n / -r / -S / -a</code></td><td>Name cache / local names / resolved names / sessions / remote name table</td></tr>
<tr><td><code>ipconfig /all</code></td><td>Full adapter configuration</td></tr>
<tr><td><code>net use / share / users / accounts / group</code></td><td>Connections, shares, users, password policy, groups</td></tr>
<tr><td><code>Get-ADDomainController</code></td><td>Domain controller info (PowerShell)</td></tr></table>
<h4>Processes</h4>
<table><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>tasklist /svc /v /m /fi</code></td><td>Services / verbose / modules / filter</td></tr>
<tr><td><code>pslist -d -m -x -t</code></td><td>Threads / memory / all / tree</td></tr>
<tr><td><code>listdlls -u -v -d</code></td><td>Unsigned / versions / by DLL name</td></tr>
<tr><td><code>handle -a -p -u</code></td><td>All handle types / by process / owner</td></tr>
<tr><td><code>procdump</code></td><td>Process or crash dump</td></tr></table>
<h4>System, disk and inventory</h4>
<table><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>wmic product get name,version,installlocation</code></td><td>Installed software</td></tr>
<tr><td><code>wmic qfe list</code></td><td>Installed updates/hotfixes</td></tr>
<tr><td><code>vssadmin list shadows | writers | volumes | providers</code></td><td>Volume Shadow Copy info</td></tr>
<tr><td><code>fsutil</code></td><td>File system management (admin)</td></tr>
<tr><td><code>devcon listclass</code></td><td>Device enumeration</td></tr>
<tr><td><code>autorunsc</code></td><td>Command-line Autoruns</td></tr></table>
<h4>Memory (Volatility)</h4>
<p><code>imageinfo</code> &rarr; <code>kdbgscan</code> &rarr; <code>pslist</code> &rarr; <code>pstree</code>. Also WinDbg, DumpChk, Redline, Velociraptor.</p>
<h4>GUI / NirSoft tools by artifact</h4>
<table><tr><th>Artifact</th><th>Tool</th></tr>
<tr><td>ESE databases</td><td>ESEDatabaseView</td></tr>
<tr><td>Drive letters</td><td>DriveLetterView</td></tr>
<tr><td>Registry changes</td><td>RegScanner</td></tr>
<tr><td>USB history</td><td>USBDeview</td></tr>
<tr><td>Thumbnails</td><td>Thumbcache Viewer</td></tr>
<tr><td>Chrome</td><td>ChromeCacheView, ChromeCookiesView, ChromeHistoryView</td></tr>
<tr><td>Edge/IE</td><td>IECacheView, EdgeCookiesView, BrowsingHistoryView</td></tr>
<tr><td>Jump Lists</td><td>JumpListsView</td></tr>
<tr><td>Metadata</td><td>ExifTool</td></tr>
<tr><td>Event logs</td><td>Event Viewer, Event Log Explorer</td></tr>
<tr><td>Promiscuous NICs</td><td>Promqry</td></tr>
<tr><td>Accounts</td><td>Artifast</td></tr>
<tr><td>Email/archives</td><td>MailXaminer</td></tr></table>` },

    { id: "regref", title: "Registry Hive and Key Reference", category: "ops",
      summary: "Hive files and the keys that matter, with what each proves.",
      body: `
<h4>Hive files</h4>
<table><tr><th>Hive</th><th>File</th></tr>
<tr><td>HKLM\\SAM</td><td><code>C:\\Windows\\System32\\config\\SAM</code></td></tr>
<tr><td>HKLM\\SECURITY</td><td><code>...\\config\\SECURITY</code></td></tr>
<tr><td>HKLM\\SOFTWARE</td><td><code>...\\config\\SOFTWARE</code></td></tr>
<tr><td>HKLM\\SYSTEM</td><td><code>...\\config\\SYSTEM</code></td></tr>
<tr><td>HKCU / HKU\\SID</td><td><code>C:\\Users\\&lt;user&gt;\\NTUSER.DAT</code></td></tr></table>
<h4>Key reference</h4>
<table><tr><th>Key</th><th>Evidence</th></tr>
<tr><td><code>HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR</code></td><td>USB storage devices, serial numbers</td></tr>
<tr><td><code>HKLM\\SYSTEM\\MountedDevices</code></td><td>Drive letter assignments</td></tr>
<tr><td><code>HKLM\\SYSTEM\\CurrentControlSet\\Control\\DeviceClasses</code></td><td>Device GUIDs, connection times</td></tr>
<tr><td><code>HKLM\\SYSTEM\\CurrentControlSet\\Services</code></td><td>Services and drivers; Start 2/3/4</td></tr>
<tr><td><code>HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run</code> / <code>RunOnce</code></td><td>Persistence (machine-wide)</td></tr>
<tr><td><code>HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run</code> / <code>RunOnce</code></td><td>Persistence (per user)</td></tr>
<tr><td><code>HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon</code></td><td>Shell/Userinit persistence; last logon</td></tr>
<tr><td><code>HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList</code></td><td>SID to profile path mapping</td></tr>
<tr><td><code>HKLM\\SYSTEM\\CurrentControlSet\\Services\\EventLog\\Security</code> / audit policy</td><td>Event logging configuration</td></tr>
<tr><td><code>HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SystemRestore</code></td><td>RPSessionInterval, DisableSR</td></tr>
<tr><td><code>...\\Explorer\\UserAssist</code></td><td>Programs run (ROT13), counts</td></tr>
<tr><td><code>...\\Explorer\\RecentDocs</code></td><td>Recent files (MRUListEx order)</td></tr>
<tr><td><code>...\\Explorer\\RunMRU</code></td><td>Run dialog commands</td></tr>
<tr><td><code>...\\Internet Explorer\\TypedURLs</code></td><td>Typed URLs</td></tr>
<tr><td><code>...\\Explorer\\TypedPaths</code></td><td>Last 25 typed Explorer paths</td></tr>
<tr><td><code>...\\Explorer\\ComDlg32\\OpenSavePidlMRU</code></td><td>Files opened/saved via dialogs</td></tr>
<tr><td><code>...\\Explorer\\FileExts</code></td><td>Programs per extension</td></tr>
<tr><td><code>...\\Explorer\\Map Network Drive MRU</code></td><td>Mapped shares</td></tr>
<tr><td><code>...\\Explorer\\MountPoints2</code></td><td>Volumes/shares the user accessed</td></tr></table>
<p><b>Data types:</b> REG_SZ, REG_EXPAND_SZ, REG_MULTI_SZ, REG_DWORD, REG_QWORD, REG_BINARY. Key LastWrite time is the only timestamp.</p>` }
  ],

  glossary: [
    ["Volatile Data", "Data lost at power-off: RAM, processes, connections, logged-on users, clipboard.", "Volatile data was collected first."],
    ["Non-volatile Data", "Data that persists after shutdown: files, registry, logs, slack space.", ""],
    ["nbtstat", "Utility for NetBIOS over TCP/IP statistics and name caches.", ""],
    ["netstat", "Built-in tool showing connections, listening ports, PIDs and routing tables.", "netstat -ano"],
    ["Promiscuous Mode", "NIC state that captures all network traffic; indicates a possible sniffer.", ""],
    ["Promqry", "Microsoft tool that detects NICs in promiscuous mode.", ""],
    ["tasklist", "Lists running processes and services with PIDs.", ""],
    ["PsList", "Sysinternals tool for process, thread, memory and run time details.", ""],
    ["ListDLLs", "Reports DLLs loaded into processes; can flag unsigned DLLs.", ""],
    ["Handle", "Sysinternals tool listing open handles per process.", ""],
    ["Process-to-Port Mapping", "Linking connections to processes via netstat PIDs and tasklist.", ""],
    ["ESE Database", "Extensible Storage Engine .edb database (Exchange, Windows Search, AD, event logs).", "Windows.edb"],
    ["Slack Space", "Unused space between end of file and end of cluster that may hold residual data.", ""],
    ["Hidden Partition", "Logical disk section not accessible to the OS.", ""],
    ["SAM", "Security Account Manager file/hive storing local user account data.", ""],
    ["Thumbcache", "Thumbnail database that can show images of deleted files.", ""],
    ["WMIC", "Command-line interface to WMI, used to list installed software and updates.", "wmic qfe list"],
    ["Volatility", "Memory forensics framework (imageinfo, pslist, pstree, kdbgscan).", ""],
    ["Redline", "Memory and host analysis tool.", ""],
    ["Registry Hive", "Registry file backing a root subtree, e.g. SAM, SYSTEM, SOFTWARE, NTUSER.DAT.", ""],
    ["LastWrite Time", "Timestamp of last modification of a registry key.", ""],
    ["Autoruns", "Sysinternals tool listing all autostart locations.", ""],
    ["VSS", "Volume Shadow Copy Service: block-level snapshots enabling Previous Versions.", "vssadmin list shadows"],
    ["USBSTOR", "Registry key recording USB mass storage devices connected.", ""],
    ["ParentIdPrefix", "USB value correlating a device to drive letters and mounted devices.", ""],
    ["UserAssist", "ROT13-encoded registry record of programs run and run counts.", ""],
    ["MRU List", "Most Recently Used list recording user activity.", "RunMRU, TypedURLs"],
    ["Electron", "Framework for Chromium-based desktop apps.", "Teams, Skype, WhatsApp"],
    ["LevelDB", "Key-value store Chromium uses for IndexedDB (.ldb).", ""],
    ["places.sqlite", "Firefox database of history, bookmarks and downloads.", ""],
    ["Preferences (Chrome)", "JSON file with sign-in and sync timestamps.", ""],
    ["Zone.Identifier", "Alternate data stream marking a file as downloaded.", ""],
    ["LNK File", "Windows shortcut recording target and timestamps.", ""],
    ["Jump List", "Per-application recent-items artifact (Automatic/CustomDestinations).", ""],
    ["EVTX", "Windows event log file format.", ""],
    ["Logon Type 10", "RemoteInteractive logon (Remote Desktop/Terminal Services).", ""],
    ["ELF_LOGFILE_HEADER", "Header of a legacy event log; signature 0x654c664c.", ""]
  ],

  cards: [
    ["Why collect volatile data first?", "It is lost at power-off or changes quickly."],
    ["Which netstat switches show PIDs and all connections?", "-ano (-o adds PIDs)."],
    ["How do you see the routing table with netstat?", "netstat -r"],
    ["What does ipconfig /all show?", "IP, mask, gateway, DNS/WINS, DHCP, NIC state."],
    ["How is a sniffer suggested on Windows?", "NIC in promiscuous mode; detect with Promqry."],
    ["tasklist /svc shows?", "Services hosted by each process."],
    ["Which tool detects unsigned DLLs?", "ListDLLs -u."],
    ["How do you map a connection to a process name?", "netstat -ano for PID, then match it in tasklist."],
    ["Which tool has built-in VirusTotal for processes?", "Process Explorer."],
    ["Where is Windows.edb?", "C:\\ProgramData\\Microsoft\\Search\\Data\\Applications\\Windows"],
    ["Which tool parses .edb files?", "ESEDatabaseView."],
    ["What is file slack?", "Space between end of file and end of cluster."],
    ["Where are user accounts stored?", "SAM: C:\\Windows\\System32\\config\\SAM."],
    ["Command listing installed software?", "wmic product get name,version,installlocation"],
    ["Command listing hotfixes?", "wmic qfe list"],
    ["Which Volatility plugin identifies the profile?", "imageinfo."],
    ["Which Volatility plugin shows parent/child?", "pstree."],
    ["Name the five registry root keys.", "HKCR, HKCU, HKLM, HKU, HKCC."],
    ["How to recover a deleted registry key?", "Restore from .reg backup or System Restore."],
    ["Which tool finds recently modified keys?", "RegScanner."],
    ["What does Autoruns show?", "Programs set to run at boot/logon, services, tasks, etc."],
    ["Service Start values?", "2 automatic, 3 manual, 4 disabled."],
    ["How to list shadow copies?", "vssadmin list shadows."],
    ["Key tracking USB devices?", "HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR."],
    ["Tool listing past USB devices?", "USBDeview."],
    ["How does UserAssist encode names?", "ROT13."],
    ["Key with last 25 typed Explorer paths?", "TypedPaths."],
    ["Key with Run dialog commands?", "RunMRU."],
    ["Restore point disabled value?", "DisableSR = 1."],
    ["What database does Chromium use for IndexedDB?", "LevelDB."],
    ["Teams cache location?", "%AppData%\\Microsoft\\Teams\\Cache\\Cache_Data."],
    ["Where are Firefox history and downloads?", "places.sqlite (moz_places, moz_annos)."],
    ["Firefox form history?", "formhistory.sqlite, moz_formhistory."],
    ["Chrome sign-in/sync timestamps?", "Preferences file: last_signin, last_synced_time."],
    ["Chrome transition masking value?", "CORE_MASK 0xFF."],
    ["Edge visit_source 0 and 1?", "0 synced from another device; 1 user browsed."],
    ["Tool for combined browser history?", "BrowsingHistoryView."],
    ["Where might private browsing remain?", "RAM, pagefile.sys, database logs, ISP/network."],
    ["FAT32 vs NTFS time base?", "FAT32 local time (2 s); NTFS UTC (100 ns)."],
    ["What is Zone.Identifier?", "ADS marking a file as downloaded."],
    ["Jump List paths?", "Recent\\AutomaticDestinations and CustomDestinations."],
    ["Event log folder?", "C:\\Windows\\System32\\winevt\\Logs."],
    ["Is Security logging on by default?", "No; it depends on audit policy."],
    ["Event IDs 7035/7036?", "Service control sent / service state changed."],
    ["Logon type 10?", "RemoteInteractive (RDP)."],
    ["Logon type 3?", "Network."],
    ["Wrapping vs non-wrapping log?", "Wrapping is a circular buffer after size limit; non-wrapping occurs when new or cleared."]
  ],

  quiz: [
    ["Which netstat switch shows process IDs?", ["-a", "-o", "-r", "-s"], 1, "-o adds PIDs."],
    ["Which tool detects a NIC in promiscuous mode?", ["Promqry", "Handle", "ListDLLs", "DevCon"], 0, ""],
    ["Which tasklist switch lists services per process?", ["/v", "/svc", "/m", "/fi"], 1, ""],
    ["Which tool shows unsigned loaded DLLs?", ["PsList", "ListDLLs", "tasklist", "nbtstat"], 1, ""],
    ["Where is the SAM hive file?", ["C:\\Windows\\System32\\config", "C:\\Users", "C:\\ProgramData", "C:\\Windows\\Prefetch"], 0, ""],
    ["Which tool parses Windows.edb?", ["ESEDatabaseView", "Autoruns", "Promqry", "RegScanner"], 0, ""],
    ["Which command lists installed hotfixes?", ["wmic qfe list", "net use", "net share", "ipconfig /all"], 0, ""],
    ["Which Volatility plugin identifies the profile?", ["pslist", "imageinfo", "pstree", "kdbgscan"], 1, ""],
    ["Where do deleted registry keys go?", ["Recycle Bin", "Nowhere; restore from backup", "Temp", "Prefetch"], 1, ""],
    ["Service Start value 4 means?", ["Automatic", "Manual", "Disabled", "Boot"], 2, ""],
    ["Which command lists shadow copies?", ["vssadmin list shadows", "wmic qfe", "net share", "fsutil"], 0, ""],
    ["USB serial numbers are in which key?", ["USBSTOR", "RunMRU", "TypedPaths", "Winlogon"], 0, ""],
    ["UserAssist names use which encoding?", ["Base64", "ROT13", "XOR", "Hex"], 1, ""],
    ["Which key records Run dialog commands?", ["TypedURLs", "RunMRU", "FileExts", "MountPoints2"], 1, ""],
    ["Which value disables restore points?", ["DisableSR=1", "RPSessionInterval", "Start=4", "LastWrite"], 0, ""],
    ["Chromium IndexedDB uses which store?", ["LevelDB", "ESE", "Registry", "MFT"], 0, ""],
    ["Where are Firefox downloads stored?", ["moz_annos in places.sqlite", "cookies.sqlite", "signons", "cache2"], 0, ""],
    ["Chrome sign-in timestamp location?", ["Preferences", "Shortcuts", "Web Data", "Cache"], 0, ""],
    ["Edge visit_source value 3?", ["Synced", "User browsed", "Extension", "Imported from Firefox"], 3, ""],
    ["Private browsing artifacts may remain in?", ["Pagefile/RAM", "Nowhere", "BIOS", "Boot sector"], 0, ""],
    ["NTFS timestamps use?", ["Local time, 2 s", "UTC, 100 ns", "Date only", "Epoch seconds"], 1, ""],
    ["Zone.Identifier indicates?", ["File was downloaded", "File encrypted", "File deleted", "File compressed"], 0, ""],
    ["Jump Lists file names begin with?", ["16-digit AppID", "SID", "GUID of disk", "Hash"], 0, ""],
    ["Event log folder?", ["winevt\\Logs", "Prefetch", "Temp", "config"], 0, ""],
    ["Event ID 7036 indicates?", ["Service state change", "Logon", "Audit policy change", "Log cleared"], 0, ""],
    ["Logon type 10 is?", ["Interactive", "Network", "RemoteInteractive", "Service"], 2, ""],
    ["ELF header signature ASCII?", ["eLfL", "MZ", "SQLite", "PK"], 0, ""],
    ["Wrapping event log organization is?", ["Circular buffer", "Linear only", "Compressed", "Encrypted"], 0, ""],
    ["Security log default state?", ["Off until auditing configured", "Always on", "Disabled by GPO only", "Deleted at boot"], 0, ""],
    ["Which tool shows combined browser history?", ["BrowsingHistoryView", "Handle", "DevCon", "Promqry"], 0, ""]
  ],

  procedures: [
    {
      id: "win-live-collection", title: "Windows Live Response: Volatile Collection",
      intro: "Collect volatile data from a running Windows suspect system in order of volatility.",
      steps: [
        { title: "Prepare trusted tools", body: "Run tools from external media (netstat, tasklist, PsList, ListDLLs, Handle). Do not trust binaries on the suspect system. Log every command and its output.",
          check: { q: "Where should the tools run from?", opts: ["The suspect's disk", "Trusted external media", "A network share on the suspect"], a: 1 } },
        { title: "Capture date, time and logged-on users", body: "Record system time first so all later output can be placed on a timeline." },
        { title: "Network state", body: "<code>netstat -ano</code>, <code>ipconfig /all</code>, <code>nbtstat -c</code>, <code>nbtstat -S</code>. Check for promiscuous NICs with Promqry.",
          check: { q: "Which switch adds PIDs to netstat?", opts: ["-r", "-o", "-s"], a: 1 } },
        { title: "Process state", body: "<code>tasklist /svc</code>, <code>pslist -t</code>, <code>listdlls -u</code>, <code>handle</code>.",
          check: { q: "How do you map a connection to a process?", opts: ["Match netstat PID to tasklist", "Run ipconfig", "Read the SAM"], a: 0 } },
        { title: "Memory", body: "Capture RAM before shutdown (e.g., Redline, ProcDump for a single process). Hash the dump.",
          check: { q: "Why capture RAM before powering off?", opts: ["It is lost at power-off", "It is faster", "Required by NTFS"], a: 0 } },
        { title: "Document", body: "Hash all outputs, update the chain of custody, then proceed to non-volatile acquisition." }
      ]
    },
    {
      id: "usb-registry", title: "Registry: Tracing a USB Device",
      intro: "Follow the registry artifacts that identify a USB device and when it was used.",
      steps: [
        { title: "Find the device", body: "<code>HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR</code>: vendor, product, revision and serial number.",
          check: { q: "Which key lists USB storage devices?", opts: ["USBSTOR", "RunMRU", "TypedPaths"], a: 0 } },
        { title: "Link to a drive letter", body: "Use ParentIdPrefix with <code>MountedDevices</code>.",
          check: { q: "Which value links a device to MountedDevices?", opts: ["ParentIdPrefix", "DisableSR", "Start"], a: 0 } },
        { title: "Find the user", body: "<code>MountPoints2</code> in NTUSER.DAT shows which user profile mounted the volume." },
        { title: "Find times", body: "DeviceClasses and key LastWrite times, plus setupapi.log for first connection. USBDeview summarizes these.",
          check: { q: "Which log shows first install time?", opts: ["setupapi.log", "Security.evtx", "places.sqlite"], a: 0 } }
      ]
    }
  ],

  custody: [
    {
      id: "cust-win-live", title: "Live Windows Workstation: RAM Captured",
      story: "On <b>12 Nov 2026</b> at <b>10:20</b>, analyst <b>Dylan Reyes Smith</b> (initials <b>DRS</b>) responded to <b>Desk 9, Brightline Logistics, 80 Dock Rd</b>. IT lead <b>Sam Ortiz</b> (555-0123) consented in writing. A running Windows 11 workstation (S/N <b>WK55821</b>) was live-collected: RAM was captured to a USB drive first, then the machine was powered down and bagged. This is the second item for case <b>BL-2026-077</b>.",
      fields: [
        { key: "case", label: "Case number", expect: "BL-2026-077" },
        { key: "from", label: "Received from", expect: "Sam Ortiz" },
        { key: "phone", label: "Handler phone", expect: "555-0123" },
        { key: "loc", label: "Evidence location", expect: "Desk 9, Brightline Logistics", accept: ["desk 9", "desk 9, brightline logistics, 80 dock rd"] },
        { key: "dt", label: "Date/time acquired (dd/mm/yyyy hh:mm)", expect: "12/11/2026 10:20", accept: ["12/11/2026 10:20", "2026-11-12 10:20", "12 nov 2026 10:20"] },
        { key: "desc", label: "Item description", expect: "Windows 11 workstation S/N WK55821", accept: ["windows 11 workstation sn wk55821", "windows 11 workstation s/n wk55821"] },
        { key: "exhibit", label: "Exhibit number (aaa/ddmmyy/nnnn/zz)", expect: "DRS/121126/0002/A", accept: ["drs/121126/0002/a", "drs/121126/002/a"] },
        { key: "state", label: "First action", type: "select", expect: "Captured RAM before power-down", options: ["Shut down via Start menu", "Captured RAM before power-down", "Browsed files", "Ran antivirus"] }
      ]
    }
  ],

  images: [
    {
      id: "img-win-artifacts", title: "Case BL-2026-077: Windows workstation artifacts (MBR)",
      story: "A workstation from a logistics firm. An employee is suspected of exfiltrating customer data over USB and a messaging app. Review registry, LNK, browser and event log artifacts.",
      scheme: "MBR", sectorSize: 512, totalSectors: 500118192,
      parts: [
        { name: "Partition 1", type: "NTFS (0x07)", fs: "NTFS", start: 2048, sectors: 500000000, boot: true, clusterSize: 4096 }
      ],
      tree: { n: "C:", d: [
        { n: "Windows", d: [ { n: "System32", d: [
          { n: "config", d: [
            { n: "SYSTEM", size: 15728640, m: "2026-11-11 18:00", a: "2026-11-11 18:00", c: "2026-01-10 08:00", hdr: "72 65 67 66 00 00 00 00", text: "[Registry hive: USBSTOR shows Kingston DataTraveler, serial 0019E06B, last connected 2026-11-10 21:07]", flag: "evidence" }
          ]},
          { n: "winevt", d: [ { n: "Security.evtx", size: 20971520, m: "2026-11-11 18:00", a: "2026-11-11 18:00", c: "2026-01-10 08:00", hdr: "45 6C 66 46 69 6C 65 00", text: "[EVTX: logon type 10 (RDP) from 10.0.4.77 at 2026-11-10 20:52]", flag: "evidence" } ] }
        ]} ]},
        { n: "Users", d: [ { n: "kpatel", d: [
          { n: "NTUSER.DAT", size: 8388608, m: "2026-11-11 17:59", a: "2026-11-11 17:59", c: "2026-01-12 09:00", hdr: "72 65 67 66 00 00 00 00", text: "[Registry hive: RunMRU shows cmd; TypedPaths shows E:\\ and \\\\fs01\\customers]", flag: "evidence" },
          { n: "customers_export.zip", size: 3342112, m: "2026-11-10 21:00", a: "2026-11-10 21:05", c: "2026-11-10 21:00", hdr: "50 4B 03 04 14 00 00 00", text: "[ZIP archive of customer records]", flag: "evidence" },
          { n: "report.pdf", size: 104221, m: "2026-11-10 21:02", a: "2026-11-10 21:02", c: "2026-11-10 21:02", hdr: "4D 5A 90 00 03 00 00 00", text: "[Actually a PE executable (MZ header) named report.pdf]", flag: "mismatch", note: "Extension says PDF; header 4D 5A is an executable (PDF would be 25 50 44 46)." },
          { n: "customers_export.lnk", size: 1024, m: "2026-11-10 21:06", a: "2026-11-10 21:06", c: "2026-11-10 21:06", hdr: "4C 00 00 00 01 14 02 00", text: "[LNK: target E:\\customers_export.zip, volume serial of Kingston DataTraveler]", flag: "evidence" },
          { n: "History", size: 524288, m: "2026-11-10 20:30", a: "2026-11-10 20:30", c: "2026-01-12 09:00", hdr: "53 51 4C 69 74 65 20 66", text: "[Chrome History SQLite: visited file-share site at 2026-11-10 20:31]" }
        ]} ]}
      ]},
      questions: [
        { q: "Which file's extension does NOT match its signature?", opts: ["customers_export.zip", "report.pdf", "NTUSER.DAT", "Security.evtx"], a: 1, why: "report.pdf begins 4D 5A (MZ), an executable." },
        { q: "Which key/hive identifies the USB device serial number?", opts: ["USBSTOR in SYSTEM", "RunMRU", "Security.evtx", "History"], a: 0, why: "USBSTOR lives under HKLM\\SYSTEM\\CurrentControlSet\\Enum." },
        { q: "What does the LNK file show?", opts: ["Files opened, including a target on removable media", "Browser cookies", "Event log wrapping", "Registry backup"], a: 0, why: "LNK files record the target path, timestamps and volume information." },
        { q: "Logon type 10 in Security.evtx means?", opts: ["Interactive at console", "Network", "RemoteInteractive (RDP)", "Service"], a: 2, why: "Type 10 is RemoteInteractive." },
        { q: "Which NTUSER.DAT value records paths typed into Explorer?", opts: ["TypedPaths", "UserAssist", "FileExts", "DisableSR"], a: 0, why: "TypedPaths stores the last 25 typed paths." }
      ]
    }
  ]
});
