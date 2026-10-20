CCT.addChapter({
  id: "ch1", num: 1, title: "Computer Forensics in Today's World",
  summary: "What digital forensics is, cybercrime, evidence handling basics, tools, and the legal tests and rules that govern admissibility.",

  notes: [
    { id: "what", title: "What Is Digital Forensics?", category: "ops",
      summary: "Purpose, when to use it, and scope.",
      body: `
<div class="key"><b>Definition:</b> forensic science of <b>recovering and investigating material found in digital devices</b>. Also used for non-criminal matters.</div>
<h3>Goals</h3>
<ul>
<li>Identify, gather, preserve evidence; keep it <b>admissible</b>; support prosecution.</li>
<li>Reconstruct a <b>timeline</b>, find intent and culprit, estimate impact.</li>
<li>Recover deleted, hidden, and temporary data.</li>
<li>Support <b>incident response</b>: scope, origin, recovery. Prevent repeat incidents.</li>
<li>Balance <b>privacy rights</b> against the need for evidence.</li>
</ul>
<h3>Scope</h3>
<table><tr><th>Area</th><th>Focus</th></tr>
<tr><td>Digital crime investigation</td><td>Stalking, spoofing, phishing, fraud, unauthorized access, breaches</td></tr>
<tr><td>Incident response</td><td>Root cause, artifacts, preserve evidence</td></tr>
<tr><td>eDiscovery</td><td>Identify, collect, preserve, analyze for litigation/regulation</td></tr>
<tr><td>Data recovery</td><td>Lost/deleted/corrupt data, forensically safe</td></tr>
<tr><td>Malware analysis</td><td>Behavior, impact, attack mechanism</td></tr>
<tr><td>Network forensics</td><td>Traffic, logs, attack paths</td></tr>
<tr><td>Corporate / litigation</td><td>Insider threat, IP theft, fraud, bribery, disputes</td></tr>
<tr><td>Law-enforcement collaboration</td><td>Collect evidence, support prosecution</td></tr></table>` },

    { id: "cybercrime", title: "Cybercrime & Attack Types", category: "ops",
      summary: "Crime tools vs. targets, internal vs. external, and the attack list.",
      body: `
<div class="key"><b>Three roles for a computer:</b> <b>target</b> of the attack, <b>tool</b> used to attack, or <b>evidence</b> of a crime.</div>
<ul>
<li><b>Crime tools:</b> hacking tools, hardware, software; usually taken into custody.</li>
<li><b>Target:</b> the victim (org, site, agency, government, even a virtual environment).</li>
</ul>
<table><tr><th></th><th>Internal (insider)</th><th>External</th></tr>
<tr><td>Source</td><td>Employees, ex-employees, contractors, partners, undertrained staff</td><td>Outsiders: criminals, hackers</td></tr>
<tr><td>Trait</td><td>Legitimate access; hard to detect</td><td>Exploits weak policy or vulnerabilities</td></tr>
<tr><td>Examples</td><td>Espionage, IP theft, record manipulation, Trojan</td><td>SQLi, brute force, phishing/spoofing, DoS, defamation</td></tr></table>
<h3>Attack quick-reference</h3>
<ul>
<li><b>Espionage:</b> spying on rivals or governments.</li>
<li><b>IP theft:</b> copyrights, trade secrets, inventions.</li>
<li><b>Data manipulation:</b> secret modification of data for advantage.</li>
<li><b>Trojan:</b> malware disguised as legitimate software; gives access.</li>
<li><b>SQL injection:</b> malicious query via input; read/modify the database.</li>
<li><b>Brute force:</b> trial-and-error on credentials or keys.</li>
<li><b>Phishing:</b> lure to steal info. <b>Spoofing:</b> impersonate a trusted source.</li>
<li><b>Privilege escalation:</b> illegitimate higher access; enables lateral movement.</li>
<li><b>DoS:</b> flood with false requests.</li>
<li><b>Cyber defamation:</b> false statements to ruin reputation.</li>
<li><b>Cyberterrorism:</b> attacks causing violence, unrest, panic. <b>Cyberwarfare:</b> nation-state attacks.</li>
</ul>` },

    { id: "investigations", title: "Investigation Types & Cybercrime Law", category: "legal",
      summary: "Criminal, administrative, civil, IP; CFAA and 18 USC 1029.",
      body: `
<table><tr><th>Type</th><th>Trigger / Focus</th></tr>
<tr><td><b>Criminal</b></td><td>Law enforcement, after a victim complaint or grand jury indictment, with a search warrant</td></tr>
<tr><td><b>Administrative</b></td><td>Inspecting an organization's employee networks and systems</td></tr>
<tr><td><b>Civil</b></td><td>Court case over property or money</td></tr>
<tr><td><b>Intellectual property</b></td><td>Examine devices and systems to gather IP evidence</td></tr></table>
<h3>Two main US cybercrime laws</h3>
<ul>
<li><b>Computer Fraud and Abuse Act, 18 U.S.C. 1030</b> (1984): protects computers from trespass. "Protected computers" originally meant financial institutions, government, and interstate/foreign commerce. <b>Today nearly all computers qualify.</b></li>
<li><b>18 U.S.C. 1029:</b> fraud with <b>access devices</b>; government can prosecute trafficking in or use of counterfeit access devices.</li>
</ul>` },

    { id: "evidence", title: "Evidence, Chain of Custody, Volatility", category: "ops",
      summary: "Core handling concepts and the order of volatility.",
      body: `
<div class="key"><b>Chain of custody:</b> record of evidence as it is <b>collected, handled, and stored</b>. Document every step.</div>
<h3>Order of volatility (most to least volatile)</h3>
<ol>
<li>Registers, cache, RAM (memory contents)</li>
<li>Swap files</li>
<li>Routing tables, ARP cache, process table, kernel stats</li>
<li>File system info and temp files</li>
<li>Raw disk blocks</li>
<li>Remote logging and monitoring data</li>
<li>Physical configuration and network topology</li>
<li>Offline media (backups, CD/DVD)</li>
</ol>
<h3>Best practices</h3>
<ul>
<li>Never alter the original. Copy or image all digital assets.</li>
<li>Same steps every time: <b>documentable and repeatable</b>.</li>
<li>Warrant specifies <b>location and type</b> of information; stay inside it.</li>
<li>Check power needs of devices holding volatile memory.</li>
<li>Hardware/software must be <b>approved, tested, baselined</b>.</li>
</ul>
<div class="key warn"><b>Keep the screen alive:</b> prevent lock from inactivity (move mouse every minute). <b>Mouse jigglers:</b> electronic (USB lookalike, random movement) or mechanical (under the mouse, not connected).</div>
<h3>Volatile collection order</h3>
<ol><li>Processor cache and RAM</li><li>Network details</li><li>Hard disk image</li></ol>
<p>Evidence drive prep: <code>format d: /fs exfat /p:1</code> (wipe to known state). Trusted-tools USB: hash the tools with MD5 / SHA-1 / SHA-256.</p>
<p><b>.AD1:</b> FTK's proprietary image format; includes deleted files, slack, unallocated space.</p>` },

    { id: "tools", title: "Forensic Tools", category: "apps",
      summary: "Hardware, software, commercial vs. open source.",
      body: `
<h3>Hardware</h3>
<ul>
<li><b>Forensic bridge / write blocker:</b> read suspect media with no risk of modification. A Windows registry edit can act as a <i>software</i> write blocker.</li>
<li><b>Forensic disk duplicator</b> (e.g. Tableau): bit-by-bit copy to a clean drive; original untouched.</li>
<li><b>Password recovery devices.</b></li>
</ul>
<h3>Software</h3>
<p>Computer forensics: <b>FTK, EnCase, Sleuth Kit (+Autopsy), SANS SIFT</b>. Mobile forensics tools read mobile file structures. <b>Encryption</b> is a major challenge: it disrupts collection and analysis.</p>
<table><tr><th></th><th>Commercial (FTK, EnCase)</th><th>Open source (TSK, SIFT)</th></tr>
<tr><td>Cost</td><td>License required (higher)</td><td>Low/free</td></tr>
<tr><td>Support, features</td><td>Better</td><td>Weaker</td></tr>
<tr><td>Flexibility</td><td>Lower</td><td>Higher</td></tr></table>
<ul>
<li><b>Sleuth Kit (TSK):</b> CLI tools for disk images; volume and file system analysis, file recovery.</li>
<li><b>SIFT:</b> workstation with everything for in-depth forensics or IR.</li>
<li><b>Trusted source:</b> software verified by hash so it is unmodified since creation.</li>
</ul>` },

    { id: "admissibility", title: "Frye, Daubert & Expert Standards", category: "legal",
      summary: "Tests for admitting scientific and expert evidence.",
      body: `
<div class="key"><b>Digital evidence is easy to change</b>, so method and documentation decide admissibility.</div>
<ul>
<li><b>Frye (Frye v. United States, 1928):</b> expert opinion must derive from a technique that is <b>generally accepted</b> as scientific. Digital forensics is accepted in most courts.</li>
<li><b>Daubert:</b> also admits newer practices from the scientific community if you show <b>R-R-E</b>:</li>
</ul>
<table><tr><th>Relevance</th><th>Reliability</th><th>Expertise</th></tr>
<tr><td>Helps judge/jury understand</td><td>Methods tested and validated</td><td>Witness qualified to testify</td></tr></table>` },

    { id: "fre", title: "Federal Rules of Evidence (FRE)", category: "legal",
      summary: "Each rule in plain English and its digital-evidence use.",
      body: `
<table><tr><th>Rule</th><th>Meaning</th><th>Digital use</th></tr>
<tr><td>101 Scope</td><td>FRE apply to all federal proceedings</td><td>Logs, drives, metadata follow the same rules as physical evidence</td></tr>
<tr><td>102 Purpose</td><td>Fairness, efficiency, truth-finding</td><td>Avoid overwhelming juries with technical detail</td></tr>
<tr><td>103 Rulings</td><td>Objections and errors</td><td>Defense objects to bad chain of custody / improper imaging</td></tr>
<tr><td>104 Preliminary questions</td><td>Judge decides foundation</td><td>Is the examiner qualified? Is the evidence authentic?</td></tr>
<tr><td>105 Limited admissibility</td><td>Admit for one purpose, not another</td><td>Log shows access, not intent/character</td></tr>
<tr><td>402 Relevance</td><td>Relevant is admissible unless excluded</td><td>Unrelated browsing history excluded</td></tr>
<tr><td>502 Privilege</td><td>Attorney-client, work product</td><td>Reports for legal defense may be privileged</td></tr>
<tr><td>608 Truthfulness</td><td>Attack witness honesty</td><td>Sloppy documentation hurts examiner credibility</td></tr>
<tr><td>609 Conviction</td><td>Impeach by criminal conviction</td><td>Fraud conviction weakens a forensic witness</td></tr>
<tr><td>614 Court's witness</td><td>Judge may question witnesses</td><td>Judge asks examiner to clarify hashing/imaging</td></tr>
<tr><td>701 Lay opinion</td><td>Non-experts: based on observation</td><td>Sysadmin: "logs looked unusual", not forensic conclusions</td></tr>
<tr><td>705 Expert basis</td><td>Opinion before listing underlying facts</td><td>Findings first, methods if challenged</td></tr>
<tr><td>801 Hearsay</td><td>Defines hearsay</td><td>Machine-generated logs usually aren't "statements"</td></tr>
<tr><td>803 Exceptions</td><td>Declarant available or not</td><td><b>Business records:</b> server, ISP, phone logs</td></tr>
<tr><td>804 Exceptions</td><td>Declarant unavailable</td><td>Log author unavailable; log may still come in</td></tr>
<tr><td>901 Authentication</td><td>Show it is what it claims</td><td>Hash, chain of custody, metadata, imaging</td></tr>
<tr><td>1001 Definitions</td><td>Originals, duplicates, writings</td><td>Properly acquired bitstream image = original</td></tr>
<tr><td>1002 Original required</td><td>Need original to prove content</td><td>Drive or forensic image</td></tr>
<tr><td>1003 Duplicates</td><td>Admissible unless authenticity questioned</td><td>Image admissible if hashes match</td></tr>
<tr><td>1004 Other evidence</td><td>Original lost (not bad faith)</td><td>Backups, logs, screenshots</td></tr></table>` },

    { id: "irlife", title: "Incident Response Lifecycle", category: "ops",
      summary: "Four phases, IoCs, containment, and analysis types.",
      body: `
<ol>
<li><b>Preparation:</b> build and train the IR team; prepare the toolkit; <b>wipe field drives to a known good state</b>.</li>
<li><b>Detection &amp; analysis:</b> identify, categorize, prioritize unusual activity. Know what "normal" is; correlate sensors, alerts, logs.</li>
<li><b>Containment, eradication, recovery:</b> isolation, mitigation, sandboxing; eradication (short); recovery and hardening (long).</li>
<li><b>Post-incident:</b> after-action report, lessons learned, metrics, retention.</li>
</ol>
<div class="key"><b>Event vs. incident:</b> an <b>incident</b> deviates from normal and needs immediate management (attack, breach, disaster).</div>
<h3>Indicators of Compromise (IoC)</h3>
<ul><li><b>Benign:</b> false positive</li><li><b>Malicious:</b> incident</li><li><b>Suspicious:</b> needs further analysis</li></ul>
<ul>
<li><b>Isolation:</b> oldest, most common; some malware checks whether it was isolated.</li>
<li><b>Metric</b> = unit of measure; <b>measure</b> = raw data used to compute it.</li>
<li><b>Retention:</b> prosecution evidence can be kept for years; data retention is regulated.</li>
<li>An incident responder is <b>less thorough</b> than a forensic investigator at collection and documentation.</li>
</ul>
<table><tr><th>Dynamic analysis</th><th>Static analysis</th></tr><tr><td>Run malware in isolation, observe. <b>Riskier.</b></td><td>Examine code/artifacts without executing. Doesn't expose the environment.</td></tr></table>` },

	{ id: "digev", title: "Digital Evidence: Types, Roles, Sources, Rules", category: "ops",
	  summary: "Locard, volatile vs non-volatile, 8 roles, evidence sources, 6 rules of evidence.",
	  body: `
<div class="key"><b>Digital evidence:</b> any electronic data stored or transmitted digitally that has <b>probative value</b> in legal proceedings. It is <b>circumstantial and fragile</b>, so tracing criminal activity is hard. Found by examining storage media, monitoring network traffic, or duplicating data.</div>
<p><b>Locard's Exchange Principle:</b> anyone or anything entering a scene <b>takes something of the scene with them and leaves something of themselves behind</b>.</p>
<h3>Types</h3>
<table><tr><th>Volatile (lost at power-off)</th><th>Non-volatile (secondary storage: HDD, SSD, flash)</th></tr>
<tr><td>System time, logged-on users, open files, network info, process info, <b>process-to-port mapping</b>, process memory, clipboard, service/driver info, command history</td><td>Hidden files, slack space, swap file, <b>index.dat</b>, unallocated clusters, unused and hidden partitions, registry settings, event logs</td></tr></table>
<h3>Roles of digital evidence</h3>
<table><tr><th>Role</th><th>Meaning</th></tr>
<tr><td>Proof of an act</td><td>A specific action occurred (unauthorized access, malware injection, exfiltration)</td></tr>
<tr><td>Corroborative / contradictory</td><td>Supports or challenges other evidence or testimony</td></tr>
<tr><td>Linking</td><td>Ties suspects to scenes, victims, other suspects (shared artifacts on two devices)</td></tr>
<tr><td>Exculpatory</td><td>Exonerates (records show the accused was inactive at the time)</td></tr>
<tr><td>Contextual</td><td>Clearer picture of what transpired</td></tr>
<tr><td>Timeline construction</td><td>Sequence from logs, metadata, timestamps</td></tr>
<tr><td>Identity verification</td><td>Identify unknown victims/suspects from personal info</td></tr>
<tr><td>Policy / compliance verification</td><td>Are employees following policy or regulation</td></tr></table>
<h3>Sources of potential evidence</h3>
<table><tr><th>User-created</th><th>User-protected</th><th>Computer-created</th></tr>
<tr><td>Address books, databases, media files, documents, bookmarks/favorites, email and cloud files, hidden partitions</td><td>Compressed, <b>misnamed</b>, encrypted, password-protected, hidden files, <b>steganography</b>, <b>blockchain ledgers</b></td><td>Backup, log, configuration, <b>printer spool</b>, cookies, swap, system, history, temp files</td></tr></table>
<h3>Rules of evidence (6)</h3>
<table><tr><th>Rule</th><th>Meaning</th></tr>
<tr><td>Understandable</td><td>Clear to judges</td></tr>
<tr><td>Admissible</td><td>Related to the fact being proved</td></tr>
<tr><td>Authentic</td><td>Real and appropriately related to the incident</td></tr>
<tr><td>Reliable</td><td>No doubt about authenticity or veracity</td></tr>
<tr><td>Complete</td><td>Proves the attacker's actions <i>or innocence</i></td></tr>
<tr><td>Materiality</td><td>Pertains directly to a matter at issue</td></tr></table>` },

	{ id: "civcrim", title: "Civil vs. Criminal vs. Administrative Investigation", category: "legal",
	  summary: "Side-by-side comparison and administrative misconduct examples.",
	  body: `
<table><tr><th></th><th>Criminal</th><th>Civil</th></tr>
<tr><td>Brought by</td><td>Law enforcement, for a suspected violation of law</td><td>Parties, for contract violations and lawsuits</td></tr>
<tr><td>Outcome</td><td>Fine, jail, or both (harsh)</td><td>Monetary damages/compensation to the plaintiff</td></tr>
<tr><td>Process</td><td>Standard forensic processes accepted in the jurisdiction</td><td>Show the opposing party proof to induce <b>settlement</b></td></tr>
<tr><td>Seizure</td><td>Court warrant; may <b>forcibly seize</b> devices</td><td>Searching generally by <b>mutual understanding</b></td></tr>
<tr><td>Report</td><td><b>Formal</b> investigation report required</td><td>Initial reporting generally <b>informal</b></td></tr>
<tr><td>Evidence handled by</td><td>Law enforcement collects and analyzes</td><td><b>Claimant</b> collects and analyzes</td></tr></table>
<h3>Administrative investigation</h3>
<ul>
<li>Internal investigation by an organization or agency: are employees, clients, partners <b>complying with rules/policies</b>? <b>Non-criminal</b>.</li>
<li>Covers: policy/rule/protocol violations, regulatory or legal violations, resource misuse, damage or theft, threatening or violent behavior, improper promotion or pay raises.</li>
<li>Outcomes: demotion, suspension, revocation, penalties, dismissal.</li>
<li>Run by <b>compliance, HR, internal affairs</b>.</li>
</ul>` },

	{ id: "irflow", title: "Incident Response Process Flow", category: "ops",
	  summary: "Step-by-step IH&R flow from report to disclosure.",
	  body: `
<ol>
<li><b>Recording and assignment:</b> IT Support receives a report. Security incident? No: not classified. Yes: <b>IH&amp;R team assigned</b>.</li>
<li><b>Incident triage:</b> analysis and validation, <b>classification</b>, <b>prioritization</b>.</li>
<li><b>Preparation for IH&amp;R</b>, then <b>notification</b> (management and other departments).</li>
<li><b>Containment.</b></li>
<li><b>Evidence gathering and forensic analysis</b> (forensics dept.).</li>
<li><b>Eradication</b>, then <b>recovery</b>.</li>
<li><b>Incident documentation.</b></li>
<li><b>Post-incident activities:</b> impact assessment; review and revise policies.</li>
<li><b>Incident disclosure:</b> disclosure procedure; if disclosure is required, make it, then <b>close the incident</b>.</li>
</ol>
<p class="dim">Complements the four-phase lifecycle note (preparation, detection/analysis, containment/eradication/recovery, post-incident).</p>` },

	{ id: "ethics", title: "Code of Ethics & Legal Compliance", category: "legal",
	  summary: "Investigator do/don't list and the regulations that matter.",
	  body: `
<div class="key">Ethics code: highest standards of <b>integrity, impartiality, professionalism</b>.</div>
<table><tr><th>Should</th><th>Should NOT</th></tr>
<tr><td><ul>
<li>Follow federal, state, local laws and policies</li>
<li>Testify honestly; give truthful, accurate information</li>
<li>Avoid bias, conflicts of interest, outside influence</li>
<li>Respect and protect privacy rights</li>
<li>Maintain a clear chain of custody</li></ul></td>
<td><ul>
<li>Refuse evidence because it may hurt the case</li>
<li>Disclose information without authorization</li>
<li>Take assignments beyond his/her skills</li>
<li>Act in conflict of interest; give personal or prejudiced opinions</li>
<li><b>Retain</b> evidence relevant to the case</li>
<li>Make <b>premature assumptions</b> without thorough analysis</li></ul></td></tr></table>
<h3>Regulations relevant to forensic work</h3>
<table><tr><th>Law / standard</th><th>Domain</th></tr>
<tr><td><b>GLBA</b> (Gramm-Leach-Bliley)</td><td>Financial institutions</td></tr>
<tr><td><b>FISMA</b> 2014</td><td>Federal information security</td></tr>
<tr><td><b>HIPAA</b> 1996</td><td>Health information</td></tr>
<tr><td><b>Electronic Communications Privacy Act</b></td><td>Electronic communications</td></tr>
<tr><td><b>GDPR</b>, <b>Data Protection Act 2018</b></td><td>EU / UK data protection</td></tr>
<tr><td><b>PCI DSS</b></td><td>Payment card data</td></tr>
<tr><td><b>Sarbanes-Oxley (SOX) 2002</b></td><td>Corporate financial reporting</td></tr></table>
<p>Evidence must be <b>admissible</b>; compliance is crucial to collection and analysis.</p>` }
  ],

  glossary: [
    ["Digital / Computer Forensics", "Identifying, collecting, preserving, analyzing, and reporting digital evidence from computers, mobile devices, networks. Stresses forensic soundness, chain of custody, admissibility.", "The investigator recovered deleted emails and rebuilt the suspect's activity timeline."],
    ["Acquisition", "Collecting data from a device in a forensically sound way, usually by a physical or logical image, preserving integrity and custody.", "The laptop was imaged during acquisition before any analysis."],
    ["Physical Image", "Bit-for-bit, sector-by-sector copy of the whole device: active and deleted files, slack, unallocated space, system areas. Most complete duplication.", "A physical image captured deleted files and hidden partitions."],
    ["Logical Image", "Copy of active, accessible data only (files/folders). No deleted data, slack, or unallocated space.", "The server stayed online, so a logical image of user directories was taken."],
    ["Bit-stream Image", "Sector-by-sector copy capturing every byte, preserving the exact binary structure of the original.", "A bit-stream image preserved all deleted and hidden data."],
    ["Forensic / Disk Image", "Complete bit-level copy of a storage device made in a forensically sound way, so analysis never touches the original.", "A forensic image kept the original drive untouched."],
    ["Write-blocking", "Method or device that blocks all write commands to media while allowing full read access.", "The drive was connected through a hardware write blocker."],
    ["Hash Value", "Fixed-length output of a cryptographic hash function. Any tiny change in the input yields a completely different value. Used to verify integrity.", "Hashes before and after acquisition matched."],
    ["Verification", "Confirming a tool, method, or image reflects the original source. Answers: did we get the right result?", "The examiner compared source and image hashes."],
    ["Repeatability", "Doing a process repeatedly and getting the same results; shows the method is reliable and valid.", "Documented steps let another analyst reproduce the findings."],
    ["Metadata", "Data about data: timestamps, size, owner, permissions, device IDs, GPS, app-specific details. Used to rebuild events and verify authenticity.", "Photo metadata showed 3:14 PM and GPS."],
    ["EXIF Data", "Exchangeable Image File Format: metadata embedded in photos (camera, shutter, ISO, date/time, orientation, GPS).", "EXIF placed the suspect at the warehouse during the burglary."],
    ["File Carving", "Recovering files from raw data using signatures and structure, without file system directory info. Used when metadata or tables are damaged.", "Images were carved by header/footer signatures."],
    ["File Signature", "Byte sequence at the start (header) or end (footer) of a file identifying its type regardless of extension.", "The altered extension was exposed: signature showed a JPEG."],
    ["Unallocated Space", "Areas of storage not assigned to any file. Often holds remnants of deleted data.", "Deleted chat logs were recovered from unallocated space."],
    ["Binary", "Base-2 numbering using 0 and 1; each digit is one bit.", "The header was converted from binary to hex to ID the file type."],
    ["Decimal", "Base-10 numbering, 0-9; human-readable form of stored values.", "A hex offset was converted to decimal to find the byte position."],
    ["Hexadecimal", "Base-16 using 0-9 and A-F (0-15); compresses long binary values.", "0x3F2A is easier to read than its binary form."],
    ["IMSI", "International Mobile Subscriber Identity: unique number on a SIM identifying the subscriber. Parts: MCC, MNC, MSIN.", "The IMSI confirmed which subscriber account was active."],
    ["IMEI", "International Mobile Equipment Identity: unique 15-digit ID for the handset hardware. Identifies the device, not the subscriber.", "IMEI proved the suspect swapped SIMs but kept the same phone."],
    ["SIM", "Subscriber Identity Module: removable smart card authenticating a subscriber; stores IMSI, keys, limited contacts, carrier config.", "The SIM was extracted to obtain the IMSI."],
    ["Certification", "Credential awarded to an individual who demonstrates knowledge/skills (e.g. Security+).", "Security+ met the baseline for an IAT Level II role."],
    ["Accreditation", "Formal recognition that an organization (lab, school, program) meets quality and compliance standards. Applies to the entity, not a person.", "The lab underwent accreditation to prove its procedures met national standards."],
    ["Chain of Custody", "Record showing the progression of evidence from scene to lab: who, when, where, what.", "Each transfer was logged."],
    ["Order of Volatility", "Ranking of data by how fast it is lost or changed; collect the most volatile first.", "RAM was captured before the disk."],
    ["Frye Test", "1928 standard: expert opinion must rest on a generally accepted scientific technique.", ""],
    ["Daubert Standard", "Admissibility standard requiring relevance, reliability, and expertise.", ""],
    ["Indicator of Compromise (IoC)", "Sign that a system or network is compromised or at risk (odd processes, unexpected traffic). Benign, malicious, or suspicious.", ""],
,
	["Locard's Exchange Principle", "Anyone or anything entering a scene takes something of it away and leaves something of themselves behind.", ""],
	["Probative Value", "Ability of evidence to help prove or disprove a fact in a legal proceeding.", ""],
	["Exculpatory Evidence", "Evidence that exonerates someone from blame.", "Logs showing the accused was inactive at the time."],
	["Linking Evidence", "Evidence connecting suspects to scenes, victims, or other suspects.", ""],
	["Materiality", "Rule of evidence: it pertains directly to a matter at issue in the case.", ""],
	["Steganography", "Hiding data inside other files; a user-protected evidence source.", ""],
	["Administrative Investigation", "Non-criminal internal investigation of rule/policy compliance, run by compliance, HR, or internal affairs.", ""],
	["GLBA / FISMA / HIPAA / SOX", "Regulations on financial institutions, federal information security, health information, and corporate financial reporting.", ""],
	["GDPR / PCI DSS", "EU data protection regulation; payment card industry security standard.", ""]
  ],

  cards: [
    ["Three roles a computer can play in a cybercrime?", "Target, tool (used to attack), and evidence."],
    ["Which law protects 'protected computers' from trespass (1984)?", "Computer Fraud and Abuse Act, 18 U.S.C. 1030."],
    ["What does 18 U.S.C. 1029 cover?", "Fraud and related activity involving access devices (counterfeit access device trafficking/use)."],
    ["Four investigation types?", "Criminal, administrative, civil, intellectual property."],
    ["Define chain of custody.", "Record of evidence as it is collected, handled, and stored; each step documented."],
    ["Order of volatility, first to last?", "Registers/cache/RAM, swap, routing/ARP/process tables, file system and temp, raw disk, remote logs, physical config/topology, offline media."],
    ["Why use a mouse jiggler?", "Prevents the suspect computer from locking from inactivity so volatile data stays accessible."],
    ["Frye vs. Daubert?", "Frye: generally accepted science (1928). Daubert: relevance, reliability, expertise."],
    ["What are the three Daubert elements?", "Relevance, Reliability, Expertise."],
    ["FRE 901?", "Authentication: evidence must be what it claims to be (hash, custody, metadata, imaging)."],
    ["FRE 803 key digital use?", "Business records exception: server/ISP/phone logs become admissible."],
    ["FRE 1003?", "Duplicates are admissible unless authenticity is questioned; image OK if hashes match."],
    ["FRE 701 vs. 705?", "701: lay witness opinion from observation. 705: expert may give opinion before listing underlying facts."],
    ["Why might machine-generated logs avoid hearsay?", "FRE 801: they often aren't a person's 'statement'."],
    ["Commercial vs. open-source forensic tools?", "Commercial: license, more support/features, less flexible. Open source: cheap, flexible, weaker support/features."],
    ["What is a forensic bridge?", "Write blocker that lets you read a suspect device without modifying it."],
    ["Four phases of IR lifecycle?", "Preparation; detection and analysis; containment, eradication, recovery; post-incident activity."],
    ["Three IoC categories?", "Benign (false positive), malicious (incident), suspicious (needs analysis)."],
    ["Static vs. dynamic malware analysis?", "Static: no execution, safer. Dynamic: run in isolation, riskier."],
    ["Which IR phase part is shortest / longest?", "Eradication shortest; recovery longest."],
    ["Physical vs. logical image?", "Physical: every sector incl. deleted/slack/unallocated. Logical: only active accessible files."],
    ["IMSI vs. IMEI?", "IMSI identifies the subscriber (SIM). IMEI identifies the handset (15 digits)."],
    ["What is a metric vs. a measure?", "Metric: unit of measurement for a characteristic. Measure: raw data used to compute it."],
    ["Why does the warrant matter during seizure?", "It specifies location and type of information you may search; staying inside it keeps evidence admissible."],
    ["What is the .AD1 file?", "FTK's proprietary image format including deleted files, slack, and unallocated space."],
    ["Command to prep an evidence drive in Windows?", "format d: /fs exfat /p:1"],
,
	["State Locard's Exchange Principle.", "Anyone or anything entering a scene takes something with them and leaves something behind."],
	["Name the 8 roles of digital evidence.", "Proof of an act, corroborative/contradictory, linking, exculpatory, contextual, timeline construction, identity verification, policy/compliance verification."],
	["Name the 6 rules of evidence.", "Understandable, admissible, authentic, reliable, complete, materiality."],
	["Rule: Complete means what?", "Evidence proves the attacker's actions or the person's innocence."],
	["Three categories of evidence sources?", "User-created, user-protected, computer-created."],
	["Examples of user-protected files?", "Compressed, misnamed, encrypted, password-protected, hidden files, steganography, blockchain ledgers."],
	["Examples of computer-created files?", "Backups, logs, config, printer spool, cookies, swap, system, history, temp files."],
	["Non-volatile evidence examples?", "Hidden files, slack, swap, index.dat, unallocated clusters, unused/hidden partitions, registry, event logs."],
	["Volatile evidence examples?", "System time, logged-on users, open files, network info, process info, process-to-port mapping, process memory, clipboard, services, command history."],
	["Criminal vs civil: who collects evidence?", "Criminal: law enforcement. Civil: the claimant."],
	["Criminal vs civil: outcomes?", "Criminal: fine, jail, or both. Civil: monetary compensation."],
	["Criminal vs civil: report?", "Criminal: formal report required. Civil: initial reporting generally informal."],
	["Who runs administrative investigations?", "Compliance, HR, internal affairs."],
	["Incident response flow start?", "IT support receives report; if a security incident, IH&R team assigned; then triage (analysis/validation, classification, prioritization)."],
	["Incident response flow end?", "Eradication, recovery, documentation, post-incident (impact assessment, policy review), disclosure, close."],
	["Name 4 'should NOT' items in the ethics code.", "Refuse evidence, disclose without authorization, exceed your skills, retain case evidence, premature assumptions."],
	["Which regulation covers health information?", "HIPAA."],
	["Which regulation covers payment card data?", "PCI DSS."]
  ],

  quiz: [
    ["A server log shows an admin account accessed files at 2 AM. A sysadmin says the logs 'looked unusual'. Which rule describes why they can say this but not draw forensic conclusions?", ["FRE 701 (lay opinion)", "FRE 705 (expert basis)", "FRE 901 (authentication)", "FRE 105 (limited admissibility)"], 0, "Non-experts may give opinions based on personal observation only."],
    ["Which Federal Rule of Evidence lets business, ISP, and phone logs into court despite hearsay concerns?", ["FRE 402", "FRE 803", "FRE 609", "FRE 1004"], 1, "803 lists hearsay exceptions including business records."],
    ["Which is the MOST volatile?", ["Swap file", "Raw disk blocks", "CPU cache and RAM", "Backup DVD"], 2, "Registers, caches, and RAM are at the top of the order."],
    ["A new forensic technique is admitted because it is relevant, reliable, and the expert is qualified. Which standard?", ["Frye", "Daubert", "CFAA", "ISO 17025"], 1, "Daubert: relevance, reliability, expertise."],
    ["Which law covers trafficking in counterfeit access devices?", ["18 U.S.C. 1029", "18 U.S.C. 1030", "FRE 1001", "HIPAA"], 0, "1029 = access device fraud; 1030 = CFAA."],
    ["A defendant claims a forensic image was altered. Which evidence best authenticates it?", ["Photo of the lab", "Matching hash values and chain of custody", "The examiner's résumé", "Disk size"], 1, "Rule 901 / 1003: hashes plus custody authenticate."],
    ["Which tool type allows reading a suspect drive without any risk of modification?", ["Password recovery device", "Forensic bridge (write blocker)", "Mouse jiggler", "Packet sniffer"], 1, "Write blockers block write commands."],
    ["Which IR phase is where lessons learned and metrics are documented?", ["Preparation", "Detection and analysis", "Containment", "Post-incident activity"], 3, ""],
    ["An alert is flagged but turns out to be normal behavior. What IoC category?", ["Malicious", "Benign (false positive)", "Suspicious", "Eradicated"], 1, ""],
    ["Which analysis executes malware in an isolated environment?", ["Static", "Dynamic", "Passive", "Logical"], 1, "Dynamic analysis is riskier."],
    ["A subject swapped SIM cards but kept the same phone. Which identifier proves it?", ["IMSI", "MAC address", "IMEI", "GUID"], 2, "IMEI identifies the handset hardware."],
    ["Which image type would preserve deleted files and slack space?", ["Logical image", "Physical (bit-stream) image", "Screenshot", "Directory listing"], 1, ""],
    ["An investigation launched by police after an indictment by a grand jury is which type?", ["Administrative", "Civil", "Criminal", "IP"], 2, ""],
    ["Which describes SQL injection?", ["Flooding a server with requests", "Inserting a malicious query through input into a database", "Impersonating a trusted sender", "Cracking passwords by trial and error"], 1, ""],
    ["A judge decides whether the examiner is qualified. Which rule?", ["FRE 104", "FRE 608", "FRE 801", "FRE 1002"], 0, "104: preliminary questions."],
,
	["Which principle says people leave something of themselves at a scene?", ["Frye", "Locard's Exchange Principle", "Daubert", "Best evidence"], 1, ""],
	["Records showing the accused was inactive during the crime are...", ["Linking", "Exculpatory", "Contextual", "Corroborative"], 1, ""],
	["Which is NOT one of the six rules of evidence?", ["Authentic", "Reliable", "Materiality", "Confidential"], 3, ""],
	["Process-to-port mapping is what type of evidence?", ["Volatile", "Non-volatile", "Archival", "User-created"], 0, ""],
	["Index.dat and the swap file are...", ["Volatile", "Non-volatile", "Network data", "Registers"], 1, ""],
	["Steganography falls under which source category?", ["User-created", "User-protected", "Computer-created", "Network"], 1, ""],
	["Printer spool files are...", ["User-created", "User-protected", "Computer-created", "Encrypted"], 2, ""],
	["In a civil case, who is responsible for evidence collection and analysis?", ["Law enforcement", "The claimant", "The judge", "Grand jury"], 1, ""],
	["Which is true of criminal cases?", ["Informal initial report", "May forcibly seize devices under warrant", "Search by mutual understanding", "Only monetary damages"], 1, ""],
	["Administrative investigations are...", ["Criminal", "Non-criminal, policy and misconduct focused", "Run by the FBI", "Only civil"], 1, ""],
	["In the IH&R flow, which comes right after classification?", ["Prioritization", "Eradication", "Disclosure", "Recovery"], 0, "Triage: analysis and validation, classification, prioritization."],
	["An investigator should NOT:", ["Maintain chain of custody", "Retain evidence relevant to the case", "Testify honestly", "Respect privacy"], 1, ""],
	["Which law governs financial institutions' data?", ["HIPAA", "GLBA", "PCI DSS", "FISMA"], 1, ""]
  ]
});
