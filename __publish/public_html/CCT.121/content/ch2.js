CCT.addChapter({
  id: "ch2", num: 2, title: "Computer Forensics Investigation Process",
  summary: "Pre-investigation lab setup, first response, search and seizure, evidence preservation, acquisition, analysis, reporting, expert witness.",

  notes: [
    { id: "overview", title: "Process Overview & Three Phases", category: "ops",
      summary: "Why a repeatable process matters; Pre-Investigation, Investigation, Post-Investigation.",
      body: `
<div class="key"><b>Goal:</b> understand an incident by identifying and analyzing its evidence. Scope: <b>investigate, seize, analyze, manage</b>, from search and seizure to the final report.</div>
<ul>
<li>Must comply with local law and standards. <b>Any deviation can jeopardize the whole investigation.</b></li>
<li>Digital evidence is <b>fragile</b>; strict guidelines protect integrity and admissibility.</li>
<li>Must be <b>repeatable and documented</b>: same findings every iteration, and a jury must be able to replicate it. Failure = findings invalidated in cross-examination.</li>
</ul>
<table><tr><th>Phase</th><th>What happens</th></tr>
<tr><td><b>1. Pre-Investigation</b></td><td>Lab setup, team, tools, validation, QA (before any case)</td></tr>
<tr><td><b>2. Investigation</b></td><td>First response, documenting, search and seizure, preservation, acquisition, analysis, case analysis</td></tr>
<tr><td><b>3. Post-Investigation</b></td><td>Reporting and expert witness testimony</td></tr></table>` },

    { id: "lab", title: "Setting Up a Forensic Lab", category: "ops",
      summary: "Seven consideration categories, accreditation.",
      body: `
<table><tr><th>#</th><th>Category</th><th>Key points</th></tr>
<tr><td>1</td><td>Planning &amp; budgeting</td><td>Case type (criminal/civil/corporate), investigator count, equipment/software</td></tr>
<tr><td>2</td><td>Physical &amp; structural design</td><td>Size, emergency/shipping access, work and evidence space, HVAC</td></tr>
<tr><td>3</td><td>Work area</td><td>2+ workstations with internet, dedicated ISDN line, lighting 90&deg; from windows, backup power</td></tr>
<tr><td>4</td><td>Physical security</td><td>Log register, alarms, CCTV, fire extinguishers, <b>TEMPEST</b> (copper lining vs. EM signals), swipe/biometric, <b>Faraday cage</b>, cooling</td></tr>
<tr><td>5</td><td>Human resources</td><td>Lab director, cybercrime investigator, forensic technician, analyst, lab manager</td></tr>
<tr><td>6</td><td>Lab facilities</td><td>Isolated labs per type, reception, restricted evidence storage, processing room, briefing area, isolated internet</td></tr>
<tr><td>7</td><td>Licensing</td><td>Licensed by the relevant authority</td></tr></table>
<h3>Accreditation</h3>
<ul>
<li><b>ASCLD/LAB:</b> certifies management, operations, personnel, procedures, physical plant security, safety.</li>
<li><b>ISO/IEC 17025</b> (ISO/IEC CASCO, 1999): 8 components: scope, normative references, terms, general, structural, resource, process, management system requirements.</li>
</ul>` },

    { id: "team", title: "Investigation Team & Toolkit", category: "ops",
      summary: "Team roles, hardware, software, validation, QA, custom tools.",
      body: `
<p>Set objectives, pick expertise, appoint a <b>technical lead</b>. Keep the team <b>small for confidentiality</b>.</p>
<table><tr><th>Role</th><th>Duty</th></tr>
<tr><td>Photographer</td><td>Photographs the scene; certified</td></tr>
<tr><td>Incident responder</td><td>Secures scene, collects evidence, disconnects affected systems</td></tr>
<tr><td>Incident analyzer</td><td>Analyzes incident type, threats, vulnerabilities</td></tr>
<tr><td>Evidence examiner</td><td>Examines and prioritizes acquired evidence</td></tr>
<tr><td>Evidence documenter</td><td>Documents all evidence and phases</td></tr>
<tr><td>Evidence manager</td><td>Maintains record of admissible evidence</td></tr>
<tr><td>Expert witness</td><td>Formal court testimony</td></tr>
<tr><td>Attorney</td><td>Legal advice on conduct</td></tr></table>
<h3>Hardware / software</h3>
<ul>
<li><b>Hardware:</b> 2+ forensic workstations, write blockers, drive duplicators, cables, media sterilization, camera, evidence bags, USB security key. Examples: Paraben First Responder, DeepSpar Disk Imager, FRED.</li>
<li><b>Software:</b> FTK, Sleuth Kit + Autopsy, CAINE, EnCase, Wireshark; categories include acquisition, analysis, recovery, password cracking, reporting, case management.</li>
</ul>
<div class="key"><b>Validation:</b> all tools validated before use (reproducible, repeatable). Licensed software only (avoid demos). Keep updated and tested. Reference: <b>NIST CFTT</b>.</div>
<h3>Quality assurance</h3>
<p>Documented QA manual and quality manager; review the system <b>at least every 3 years</b>.</p>
<ol><li>Formal documented training</li><li>Validate/document equipment</li><li><b>Annual</b> proficiency tests</li><li>Follow standards in casework</li><li>Policies and procedures</li><li>ASCLD/LAB and/or ISO 17025</li><li>Quality audits and reviews</li><li>Physical plant security and safety</li></ol>
<p><b>Custom tools</b> (Python/Bash/PowerShell scripts, bootable forensic USBs, hash checkers, timeline tools, stego detectors, etc.) must be <b>tested, validated, and peer-reviewed</b> before legal use.</p>` },

    { id: "firstresponse", title: "First Response", category: "ops",
      summary: "The first responder, three groups, six stages, common mistakes.",
      body: `
<div class="key"><b>First responder:</b> first person at the scene (admin, LEO, investigator, lab staff). Must protect and preserve evidence in a forensically sound way.</div>
<h3>Roles</h3>
<ol>
<li><b>Identify</b> the crime scene (perimeter, systems involved).</li>
<li><b>Protect</b> the scene (search warrant needed for digital evidence; wait for case officer).</li>
<li><b>Preserve fragile evidence:</b> photograph screen and programs. <b>Don't wait</b> if evidence may vanish.</li>
<li><b>Collect incident info:</b> preliminary interviews.</li>
<li><b>Document</b> everything (case number, reporter, location, date/time, description).</li>
<li><b>Package &amp; transport:</b> label, evidence bags (block wireless, heat, sun), to lab.</li>
</ol>
<table><tr><th>Group</th><th>Does</th><th>Does NOT</th></tr>
<tr><td>Non-forensic staff</td><td>Secure scene, notes/photos, hand off</td><td>Attempt data recovery</td></tr>
<tr><td>System/network admins</td><td>Report per procedure; may record screen, copy logs to clean media, isolate devices</td><td>Act unless directed</td></tr>
<tr><td>Lab forensic staff</td><td>Full six-stage process</td><td></td></tr></table>
<h3>Six stages (lab staff)</h3>
<ol><li>Document the scene</li><li>Collect incident info (interviews, verify crime)</li><li>Plan search and seizure (warrant, consent, witness signatures)</li><li>Identify and collect evidence</li><li>Package (exhibit numbers, labels)</li><li>Transport (strict chain of custody)</li></ol>
<div class="key warn"><b>Common mistakes:</b> shutting down or rebooting the victim system (loses volatile data: MAC times, logs, processes); trusting victim system components (trojans, time bombs); no baseline documentation; undocumented collection.</div>
<p><b>Safety:</b> document health and safety issues. Wear <b>latex gloves</b>: protects staff and preserves fingerprints.</p>` },

    { id: "scene", title: "Documenting the Scene", category: "ops",
      summary: "What to record, photography and sketching rules.",
      body: `
<p>Continuous process producing a permanent record. Capture: physical position of equipment, monitor contents, date/time of first action, chain of custody log, network info (IP, MAC, connections), visible data (even written passwords), witness statements, environmental hazards.</p>
<h3>Photography &amp; sketching</h3>
<ul>
<li>Photograph <b>first on arrival</b>; don't alter the scene.</li>
<li>Wide-angle and close-up; <b>scale/ruler</b> for small items; back of the computer (cables).</li>
<li>Photograph <b>before AND after</b> any action on a device.</li>
<li>Camera date/time must be accurate (EXIF feeds the timeline). Ideal: camera that hashes photos on capture.</li>
<li>Then sketch: measurement relationships and camera positions.</li>
</ul>` },

    { id: "searchseizure", title: "Search & Seizure and Warrants", category: "legal",
      summary: "Planning, consent, warrants, and when no warrant is needed.",
      body: `
<h3>Plan must include</h3>
<p>Incident description, case name, location, jurisdiction, legislation/policy, extent of authority, equipment to seize, type (<b>overt/covert</b>), management approval.</p>
<h3>Consent and witnesses</h3>
<ul>
<li><b>Written consent</b> from device/org owner is sufficient to begin. Keep forms in the forensic grab bag.</li>
<li>A <b>witness</b> confirms the form was explained, understood, voluntary. Usually <b>1</b> signature; <b>2</b> if jurisdiction requires.</li>
</ul>
<h3>Search warrant</h3>
<p>Written order from a judge directing law enforcement to search for specific evidence at a specific place. <b>Valid 10 days</b> from signing (federal rules of criminal procedure).</p>
<ul><li><b>Electronic storage device warrant:</b> hardware, software, storage, documents.</li><li><b>Service provider warrant:</b> service, billing, subscriber records from an ISP.</li></ul>
<div class="key warn"><b>Searching WITHOUT a warrant is allowed:</b> risk of evidence destruction; explicit owner consent; plain view; publicly available data; search incident to lawful arrest; corporate devices (diminished privacy); border crossings; third-party doctrine.</div>
<p><b>Preliminary interviews:</b> always with a witness present. Determine criminal act vs. policy violation vs. accident.</p>
<h3>Initial scene search</h3>
<ul><li>Make the environment safe, photograph before touching, survey for all evidence (including pen drives, secondary media).</li><li>Keep an S&amp;S evidence log; log everyone entering/leaving; <b>refuse offers of technical help</b>.</li></ul>` },

    { id: "seizing", title: "Seizing Evidence (Power State Rules)", category: "ops",
      summary: "ON vs OFF, laptops, networks, phones, shutdown commands.",
      body: `
<div class="key"><b>Golden rules:</b> don't turn ON a device that is OFF. Photograph first. Capture RAM/volatile data before power-off if crucial. <b>Never copy files to or from the computer.</b> Photograph and label every cable.</div>
<table><tr><th>State</th><th>Action</th></tr>
<tr><td><b>ON</b></td><td>Photograph screen, document running programs/open files. Screensaver? Move mouse <b>slowly, no click</b>, photograph.</td></tr>
<tr><td>ON: pull power immediately if</td><td>Data is being overwritten/deleted or destructive processes are running</td></tr>
<tr><td>ON: do NOT pull power if</td><td>Evidentiary data visible or programs open: photograph, collect volatile data, THEN pull the plug</td></tr>
<tr><td><b>Laptop</b></td><td>Remove battery and unplug; if non-removable, hold power 30 s</td></tr>
<tr><td><b>OFF</b></td><td>Leave OFF; photograph device, connections, surroundings; unique evidence number; make/model/serial; anti-static bags; dry, temperature-controlled storage</td></tr>
<tr><td><b>Networked</b></td><td>Capture connection data and RAM <i>before</i> severing; unplug from router/modem</td></tr>
<tr><td><b>Phone ON</b></td><td>Keep charged, <b>flight mode</b>, Faraday bag</td></tr>
<tr><td><b>Phone OFF</b></td><td>Don't turn on; collect/label chargers</td></tr></table>
<ul>
<li>Check for encryption (e.g. <b>BitLocker</b>): if running, collect unencrypted data before powering off.</li>
<li><b>microSD</b> = separate evidence. <b>SIM</b> = contacts and texts; remove, document, store separately.</li>
<li>Malware persists in the Windows <b>Startup folder</b> or Linux <b>rc.local</b>; look for unusual MAC times (<code>dir</code> / <code>ls</code>).</li>
</ul>
<h3>Orderly shutdown</h3>
<ul><li><b>Windows:</b> Start, Power, Shut Down, wait, unplug.</li><li><b>macOS:</b> Apple menu, Shut Down, deselect "Reopen windows", unplug.</li><li><b>Linux:</b> <code>shutdown now</code> or <code>shutdown -h 0</code> (sudo), unplug.</li></ul>
<h3>Social networks</h3>
<p>Data: footprints, communications, media, timestamps, geotags. Use <b>warrant or subpoena</b>, contact the platform. Tools: WebPreserver, X1 Social Discovery, Navigator, Netlytic.</p>` },

    { id: "preservation", title: "Evidence Preservation & Exhibit Numbers", category: "ops",
      summary: "Chain of custody contents, bag labels, numbering format, packaging.",
      body: `
<div class="key"><b>Chain of custody document:</b> case number; name/title of who it came from; address/phone of handlers; evidence location; date/time acquired; item number, quantity, description. Shows technology, method, people.</div>
<h3>Evidence bag front panel</h3>
<p>Date/time of seizure; who seized; <b>exhibit number</b>; site seized from; contents; submitting agency and address.</p>
<h3>Exhibit number format</h3>
<p class="mono"><b>aaa/ddmmyy/nnnn/zz</b></p>
<ul>
<li><b>aaa</b> = initials of analyst/LEO</li><li><b>ddmmyy</b> = date of seizure</li><li><b>nnnn</b> = sequential number from 001</li><li><b>zz</b> = part of same exhibit (A=CPU, B=monitor, C=keyboard...)</li>
</ul>
<h3>Packaging</h3>
<ul><li>Magnetic media in <b>anti-static</b> packaging, <b>never plastic bags</b> (static).</li><li>Antishock (bubble wrap, foam); seal with evidence tape.</li><li><b>Faraday bags</b> for wireless devices. Keep away from magnets, heat, water.</li></ul>` },

    { id: "acquisition", title: "Data Acquisition & Analysis", category: "apps",
      summary: "Imaging rules, hash verification, analysis, case analysis types.",
      body: `
<div class="key"><b>Acquisition</b> = extract <b>ESI</b> using established methods. The most critical step: mistakes can alter data and make it inadmissible.</div>
<ol>
<li>Ensure the destination is <b>forensically clean</b>; enable <b>write protection</b>.</li>
<li>Create a <b>bit-by-bit image</b>; document everything.</li>
<li>Make <b>2+ copies</b>; duplicate to lab, store the original safely.</li>
<li><b>Hash original AND image; they must match.</b></li>
<li><b>NEVER analyze the original.</b> Work on copies.</li>
</ol>
<h3>Data analysis</h3>
<p>Examine, identify, separate, convert, model data. Content, file create/modify dates, users linked to files, timeline, root cause. <b>Prioritize by relevance.</b></p>
<h3>Case analysis</h3>
<p>Relate evidence to the case. Evidence reconstruction builds the incident timeline via:</p>
<table><tr><th>Temporal</th><th>Relational</th><th>Functional</th></tr><tr><td>Sequence of events: what happened, who was involved</td><td>Correlates suspect and victim actions</td><td>Conditions under which the crime was possible</td></tr></table>` },

    { id: "reporting", title: "Reporting & Presentation", category: "legal",
      summary: "Audiences, report qualities, template, visual aids, mock trials.",
      body: `
<table><tr><th>Audience</th><th>Content focus</th></tr>
<tr><td>IT/Security</td><td>Root cause, IoCs, technical detail, remediation</td></tr>
<tr><td>Legal counsel</td><td>Chain of custody, findings relevant to case</td></tr>
<tr><td>Law enforcement</td><td>Detailed evidence and techniques</td></tr>
<tr><td>Judges / grand jury</td><td>Understandable explanation</td></tr>
<tr><td>Corporate management</td><td>Business impact, recommendations</td></tr>
<tr><td>Insurers</td><td>Incident, impact, liabilities</td></tr>
<tr><td>Affected parties</td><td>Data exposed, risks, actions</td></tr>
<tr><td>Public</td><td>Summary, no sensitive details</td></tr></table>
<h3>Report qualities</h3>
<ul>
<li>Clear, concise, audience-appropriate; <b>no jargon</b>; only case-relevant data.</li>
<li>Every statement backed by evidence; <b>facts, not opinions</b>.</li>
<li>Written assuming the <b>defense will scrutinize</b> it. State limitations (timestamps can be reset).</li>
<li>Name algorithms specifically (e.g. MD5). Logical order, simple to complex, unique identifiers, expert review before release.</li>
</ul>
<p><b>Template:</b> unique case number and authors; objectives and incident details; executive summary and daily progress; evidence list (location, collection, tools, process); findings; expert review (intentions, internet activity, recommendations).</p>
<p><b>Visual aids:</b> slides, video, diagrams, charts, timelines, maps. Tools: AEGIS, Tableau, Power BI, KronoGraph, MagicTree.</p>
<p><b>Mock trial:</b> unbiased jury, complainant attorney, defense attorney. Tests report accuracy, bias, and legal compliance.</p>` },

    { id: "expert", title: "Expert Witness", category: "legal",
      summary: "Types, qualities, ethics.",
      body: `
<div class="key"><b>Expert witness:</b> knowledge beyond average understanding through education, profession, or experience; may give opinions on technical matters.</div>
<table><tr><th>Type</th><th>Function</th></tr>
<tr><td>Consulting expert</td><td>Technical explanations for complex situations</td></tr>
<tr><td>Court expert</td><td>Advises the court on issues it can't grasp</td></tr>
<tr><td>Testifying expert</td><td>Testifies at trial</td></tr></table>
<p><b>Roles:</b> investigate, evaluate and present evidence; help lawyers establish facts; educate jury; aid settlement negotiation; create exhibits.</p>
<p><b>Qualities:</b> self-confidence, politeness, preparedness, knowledge, consistency, trustworthiness, objectivity without speculation, improvising (hypotheticals).</p>
<h3>Ethics</h3>
<ul><li>Unbiased: loyalty is to the <b>truth</b>, not the retaining party.</li><li>Never exaggerate or misrepresent findings or qualifications.</li><li>Testify only within expertise; disclose conflicts of interest.</li><li>Be consistent; welcome peer review.</li></ul>` },

	{ id: "mtseize", title: "Midterm Add-ons: Consent Forms, Monitors, Networks, Handhelds", category: "ops",
	  summary: "Details from the study guide not in the other seizure notes.",
	  body: `
<h3>Consent</h3>
<ul>
<li>If the user is at the scene, <b>consent is required</b> before searching. Use jurisdiction-appropriate forms, carried in the <b>forensic grab bag</b>. Search/seizure steps belong in a documented procedure spelled out in the consent.</li>
<li><b>Consent to Search Electronic Media:</b> permission to search devices and collect evidence (location, consentor signature, witness signature, date).</li>
<li><b>Voluntary Consent to Search:</b> affirms consent without threat or pressure (witness, signature, <b>DOB, SSN</b>, date).</li>
</ul>
<h3>Warrant types and warrantless searches</h3>
<ul>
<li><b>Electronic storage device warrant:</b> search/seize the victim computer and related components. <b>Service provider warrant:</b> obtain victim-computer information from the provider.</li>
<li>Warrantless possibilities: risk of evidence destruction; search incident to arrest; explicit consent; diminished privacy on <b>work devices</b>; <b>clearly visible</b> evidence; <b>border crossings</b>; public data (social posts); information shared with a third party (reduced privacy; changing law).</li>
</ul>
<h3>Powered-off computer: screens</h3>
<ul>
<li>Leave it OFF; photograph computer, connections, peripherals, surroundings. Remove power cord (wall and rear, or battery backup); disconnect and secure cables; secure removable media; tag; log; chain of custody.</li>
<li><b>Monitor OFF, blank display:</b> turn monitor ON, move mouse slightly, note changes, photograph.</li>
<li><b>Monitor ON, blank display:</b> move mouse slightly; if no change, <b>press no keys</b>; photograph.</li>
<li><b>Portable computer wakes up:</b> record the time/date, photograph the screen, document programs.</li>
<li><b>Do NOT disconnect power</b> when evidentiary data is on screen or programs are active (chatrooms, open text files, financial documents, IMs).</li>
</ul>
<h3>Networked computers</h3>
<ul>
<li>Unplug the network cable from router/modem to prevent further attack.</li>
<li>Photograph all connected devices (router, modem, printer, scanner) from different angles.</li>
<li>OFF: leave it and disassemble. ON: photograph screen and follow powered-on steps. Unplug the main power cord, then other cords; label them.</li>
</ul>
<h3>Smartphones and handhelds</h3>
<ol>
<li>Photograph the device and display.</li>
<li><b>OFF:</b> do NOT turn on. Collect/label power cables, package; record security features (pattern, password, biometrics); look for systems holding <b>backups</b>; tag, log, chain of custody.</li>
<li><b>ON:</b> leave as is; <b>keep it charged</b> or evidence may be lost.</li>
</ol>
<h3>Duplicating data</h3>
<ul><li>Bit-by-bit; hash original and image and compare; then work on the copy. Use <b>industry-standard or licensed</b> tools in a <b>contaminant-free environment</b> to avoid corruption.</li></ul>` }
  ],

  glossary: [
    ["Chain of Custody", "Legal document showing the progression of evidence from crime scene to forensic lab; ensures integrity and auditability.", ""],
    ["Write-Blocker", "Hardware or software preventing any write operation to media during acquisition.", ""],
    ["Forensic Image", "Bit-by-bit copy of original media used for analysis, preserving the original.", ""],
    ["First Responder", "First person to arrive at a scene; secures and preserves evidence.", ""],
    ["Volatile Data", "Data in RAM or temporary storage lost when power is removed.", ""],
    ["Faraday Bag", "Signal-blocking bag that stops wireless devices from sending/receiving during handling.", ""],
    ["ESI", "Electronically Stored Information: data extracted from computers/storage for analysis.", ""],
    ["MAC Times", "Modified, Accessed, Created timestamps on files; used for timelines.", ""],
    ["Expert Witness", "Court-recognized person with specialized knowledge who gives technical testimony and opinion.", ""],
    ["ASCLD/LAB", "American Society of Crime Laboratory Directors / Laboratory Accreditation Board; accredits forensic labs.", ""],
    ["TEMPEST", "Shielding with metallic (copper) lining that stops workstations emitting electromagnetic signals.", ""],
    ["ISO/IEC 17025", "International standard for testing and calibration lab competence; 8 components.", ""],
    ["NIST CFTT", "Computer Forensic Tool Testing project; reference for validating forensic tools.", ""],
    ["Exhibit Number", "Unique label in the form aaa/ddmmyy/nnnn/zz for evidence items.", "RCS/170926/0001/A = CPU."],
    ["Search Warrant", "Judge's written order to search for specific evidence at a specific place; valid 10 days.", ""],
    ["Third-Party Doctrine", "Data shared with a third party (e.g. ISP) may carry reduced privacy expectation.", ""],
    ["Plain View", "Evidence clearly visible to an officer lawfully present may be seized without a warrant.", ""],
    ["Temporal Analysis", "Sequential event trail: what happened and who was involved.", ""],
    ["Relational Analysis", "Correlating actions of suspect and victim.", ""],
    ["Functional Analysis", "Describing the conditions under which the crime could have occurred.", ""],
    ["Mock Trial", "Simulated trial used to test a forensic report's accuracy, bias, and legal compliance.", ""],
	["Consent to Search Electronic Media", "Form granting permission to search devices and collect forensic evidence; includes location, consentor and witness signatures, date.", ""],
	["Voluntary Consent to Search", "Form affirming consent without threat or pressure; includes witness, signature, DOB, SSN, date.", ""],
	["Forensic Grab Bag", "Kit carried to the scene, including jurisdiction-appropriate consent forms.", ""],
	["Service Provider Warrant", "Warrant letting investigators obtain victim-computer information from a service provider.", ""],
	["Electronic Storage Device Warrant", "Warrant to search and seize the victim computer and related components.", ""]
  ],

  cards: [
    ["Three phases of the investigation process?", "Pre-Investigation, Investigation, Post-Investigation."],
    ["Why must the process be repeatable?", "Every iteration must give the same findings; a jury must be able to replicate it, or findings are invalidated on cross-examination."],
    ["Lab: 7 consideration categories?", "Planning/budget; physical/structural design; work area; physical security; human resources; lab facilities; licensing."],
    ["What is TEMPEST?", "Copper lining that prevents EM signal emission from workstations."],
    ["How often should the QA system be reviewed?", "At least every 3 years; investigators take annual proficiency tests."],
    ["Eight QA steps (summary)?", "Training; validate equipment; annual proficiency; casework standards; policies; accreditation; audits; plant security/safety."],
    ["Name the investigation team roles.", "Photographer, incident responder, incident analyzer, evidence examiner, documenter, evidence manager, expert witness, attorney."],
    ["Why avoid demo software?", "Limited functionality; licensed tools help during trials. All tools validated (NIST CFTT)."],
    ["Three first-response groups?", "Non-forensic staff; system/network admins; lab forensic staff."],
    ["Six stages of lab-staff first response?", "Document scene; collect info; plan S&S; collect evidence; package; transport."],
    ["Common first responder mistakes?", "Shutting down/rebooting; trusting victim system; no baseline docs; undocumented collection."],
    ["Why latex gloves?", "Protect staff and preserve fingerprints on evidence."],
    ["How long is a search warrant valid?", "10 days from signing."],
    ["Two types of search warrant?", "Electronic storage device warrant; service provider warrant."],
    ["When is a warrantless search allowed? (list)", "Destruction risk, consent, plain view, public data, incident to arrest, corporate devices, border, third-party doctrine."],
    ["How many witness signatures for consent?", "Usually 1; 2 if required by jurisdiction."],
    ["Computer is OFF at the scene. What do you do?", "Leave it off; photograph and document before moving anything."],
    ["Computer is ON and data is being deleted. What do you do?", "Pull the power cord immediately."],
    ["Computer is ON and evidence is visible. What do you do?", "Photograph, collect volatile data, then pull the plug."],
    ["Laptop with non-removable battery?", "Unplug and hold the power button 30 seconds."],
    ["Phone is ON at the scene?", "Keep charged, flight mode, Faraday bag."],
    ["Where does malware hide for persistence?", "Windows Startup folder; Linux rc.local."],
    ["Exhibit number format?", "aaa/ddmmyy/nnnn/zz (initials / date / sequence / part)."],
    ["Packaging for magnetic media?", "Anti-static packaging, never plastic bags; antishock materials; seal with evidence tape."],
    ["Acquisition: how many copies, and what is verified?", "2+ copies; hashes of original and image must match."],
    ["Temporal vs relational vs functional analysis?", "Sequence of events; suspect/victim correlation; conditions enabling the crime."],
    ["Three types of expert witness?", "Consulting, court, testifying."],
    ["Expert witness core ethic?", "Unbiased; loyalty to the truth, not the party that hired you."],
    ["What should a report do about timestamps?", "State the limitation: timestamps can be reset, so don't rely on them alone."],
	["Which consent form includes DOB and SSN?", "Voluntary Consent to Search."],
	["When is consent required at a scene?", "If the user is present, consent is required before searching."],
	["Two warrant types for electronic evidence?", "Electronic storage device warrant; service provider warrant."],
	["Name warrantless search scenarios.", "Evidence destruction risk, search incident to arrest, consent, work-device privacy, plain view, border crossings, public data, third-party shared info."],
	["Monitor OFF with a blank display: what do you do?", "Turn the monitor on, move the mouse slightly, note changes, photograph."],
	["Monitor ON with a blank display and no change after mouse move?", "Press no keys; photograph the screen."],
	["A portable computer wakes up. What do you record?", "Time and date it woke; photograph the screen; document running programs."],
	["When must you NOT pull the power?", "When evidentiary data is visible or programs like chatrooms, open documents, financial files, IMs are active."],
	["First step for a networked computer?", "Unplug the network cable from the router/modem; photograph connected devices."],
	["Phone is OFF at the scene.", "Do not turn it on; collect chargers, note security features, look for backups, tag and log."],
	["Phone is ON at the scene.", "Leave it on and keep it charged."],
	["Duplicating data environment?", "Contaminant-free; industry-standard or licensed tools."]
  ],

  quiz: [
    ["Which phase includes lab setup and tool validation?", ["Investigation", "Pre-Investigation", "Post-Investigation", "Incident response"], 1, ""],
    ["What is the minimum number of forensic workstations a lab work area should have?", ["1", "2", "4", "8"], 1, ""],
    ["A first responder finds a running PC with files visibly being deleted. What is the best action?", ["Pull the power cord", "Photograph, then wait for the case officer", "Shut down normally", "Copy files to USB"], 0, "Active destruction: pull power immediately."],
    ["Evidence is visible on-screen of a powered-on PC. What is the order?", ["Pull plug, photograph, collect volatile", "Photograph, collect volatile data, pull plug", "Shut down, image, photograph", "Reboot, image"], 1, ""],
    ["Which warrantless search scenario applies to an employee's company laptop?", ["Plain view", "Corporate device (diminished privacy)", "Border crossing", "Third-party doctrine"], 1, ""],
    ["A search warrant signed on the 1st is valid until roughly which day?", ["3rd", "10 days after signing", "30 days after signing", "Indefinitely"], 1, ""],
    ["Which exhibit number fits the format aaa/ddmmyy/nnnn/zz for the monitor (part B) seized 17 Sep 2026 by Dylan Smith, 3rd item?", ["DS/170926/003/B", "DS/170926/0003/B", "DSM/170926/0003/B", "DS/260917/0003/B"], 1, "Initials / ddmmyy / four-digit sequence / part letter."],
    ["Which is the correct way to package a hard drive?", ["Plastic bag", "Anti-static bag with antishock padding", "Paper envelope near a speaker", "Wrapped in foil only"], 1, ""],
    ["Which tool category should be used for a phone found ON?", ["Mouse jiggler", "Faraday bag and flight mode", "Boot disk", "Screwdriver"], 1, ""],
    ["Which step is MOST critical, since errors can render evidence inadmissible?", ["Report formatting", "Data acquisition", "Lab licensing", "Interview scheduling"], 1, ""],
    ["After imaging, which confirms the image is identical to the original?", ["File count", "Matching hash values", "Same file size", "Same timestamp"], 1, ""],
    ["Which analysis shows a sequential event trail?", ["Temporal", "Relational", "Functional", "Logical"], 0, ""],
    ["Which expert type advises the court on technical issues it does not understand?", ["Consulting", "Court", "Testifying", "Lay"], 1, ""],
    ["Who must a report for a jury target?", ["Deep technical detail", "Understandable explanation without jargon", "Only IoCs", "Marketing summary"], 1, ""],
    ["Why not work directly on the original evidence?", ["It is slower", "Analysis may alter it; use bit-by-bit copies", "Originals are encrypted", "Tools need images"], 1, ""],
	["Which form asks for the consenting person's DOB and SSN?", ["Consent to Search Electronic Media", "Voluntary Consent to Search", "Warrant", "Evidence log"], 1, ""],
	["Which warrant gets subscriber data from an ISP?", ["Electronic storage device", "Service provider", "Arrest", "Bench"], 1, ""],
	["Which is a legitimate warrantless search scenario?", ["Hunch", "Evidence in plain view", "A coworker's request", "Anonymous tip only"], 1, ""],
	["A monitor is on but blank and a mouse move changes nothing. You should...", ["Press Enter", "Press no keys and photograph", "Pull the power", "Reboot"], 1, ""],
	["A laptop wakes up while you're at the scene. First, you...", ["Shut it down", "Record the time and photograph the screen", "Close the lid", "Log in"], 1, ""],
	["Which is a reason NOT to pull the power cord?", ["Data being overwritten", "An open chatroom with evidence on screen", "Wipe utility running", "Malware deleting files"], 1, ""],
	["For a networked computer, you first...", ["Unplug the network cable from the router/modem", "Install antivirus", "Run chkdsk", "Reboot"], 0, "Photograph connected devices too."],
	["A suspect phone is ON. You should...", ["Turn it off", "Keep it charged and leave it on", "Reset it", "Remove the SIM and discard"], 1, ""]
  ],

  /* Guided, step-by-step walkthroughs (Procedures lab) */
  procedures: [
    {
      id: "scene-response", title: "Scene Response: Seizing a Suspect PC",
      intro: "Walk through a first-response decision flow for a powered-on desktop at a suspected insider data theft.",
      steps: [
        { title: "Secure and identify", body: "Establish the perimeter, list systems involved, keep people away from devices. Refuse offers of technical help.",
          check: { q: "A coworker offers to 'just log in and show you the files'. You:", opts: ["Accept to save time", "Refuse, secure the scene", "Let them touch only the mouse"], a: 1 } },
        { title: "Photograph before touching", body: "Wide-angle, then close-ups of the screen, running programs, cables (back of the PC), with a scale. Confirm camera clock.",
          check: { q: "When do you photograph?", opts: ["Only before seizure", "Before and after any action", "After packaging"], a: 1 } },
        { title: "Assess power state", body: "Screen shows an active wipe utility deleting files. Decision: pull power immediately. If instead evidence were merely visible: photograph, capture RAM, then pull.",
          check: { q: "Wipe utility is running. You:", opts: ["Capture RAM first", "Pull power cord immediately", "Shut down via Start menu"], a: 1 } },
        { title: "Order of volatility", body: "If you can collect: cache/RAM, then network state, running processes, then disk. Never copy files to or from the machine.",
          check: { q: "Which first?", opts: ["Disk image", "RAM", "Backups"], a: 1 } },
        { title: "Tag, bag, document", body: "Exhibit number aaa/ddmmyy/nnnn/zz, anti-static bag, evidence tape, chain of custody entry with date/time and handler.",
          check: { q: "Plastic bag for the drive?", opts: ["Yes", "No, anti-static packaging"], a: 1 } },
        { title: "Transport", body: "Keep away from magnets, heat, and radio transmitters. Every transfer is logged." }
      ]
    },
    {
      id: "ftk-imaging", title: "FTK Imager: Creating a Forensic Image",
      intro: "Conceptual walkthrough of imaging a drive with FTK Imager. Menu names follow the typical workflow; your lab version may differ slightly.",
      steps: [
        { title: "1. Prepare destination and tools", body: "Use a <b>wiped, formatted</b> evidence drive (e.g. <code>format d: /fs exfat /p:1</code>). Run FTK Imager from your hashed, trusted-tools USB.",
          check: { q: "Why a wiped destination?", opts: ["Faster", "Forensically clean: no contamination of evidence", "License rule"], a: 1 } },
        { title: "2. Write-protect the source", body: "Connect the suspect drive through a <b>hardware write blocker</b> (or software registry write-block).",
          check: { q: "The write blocker prevents:", opts: ["Reading", "Writes to the suspect media", "Hashing"], a: 1 } },
        { title: "3. Choose source", body: "File &gt; Create Disk Image. Choose <b>Physical Drive</b> (captures deleted, slack, unallocated) over Logical Drive (only the volume). Select the suspect device.",
          check: { q: "To capture slack and unallocated space choose:", opts: ["Logical Drive", "Physical Drive", "Contents of a folder"], a: 1 } },
        { title: "4. Choose image type", body: "Raw (dd), SMART, <b>E01</b> (compressed, metadata, built-in hash), or AFF. E01 is the common evidence format. FTK's own container is .AD1 (logical custom content image).",
          check: { q: "Which FTK-proprietary format was in your notes?", opts: [".E01", ".AD1", ".dd"], a: 1 } },
        { title: "5. Evidence item information", body: "Fill case number, evidence/exhibit number, description, examiner name, notes. This feeds your chain of custody and report." },
        { title: "6. Destination, fragment size, compression", body: "Pick the destination folder and filename. Fragment size splits the image into segments. Compression saves space but costs time." },
        { title: "7. Create, then verify", body: "Tick <b>Verify images after they are created</b>. FTK computes MD5 and/or SHA-1 of the source and image and compares them.",
          check: { q: "Verification passes when:", opts: ["File sizes match", "Source and image hashes match", "Image opens"], a: 1 } },
        { title: "8. Record and store", body: "Record both hashes in the report (name the algorithm). Make a second copy, store the original securely, update custody log. Analyze only the copy." }
      ]
    }
  ],

  /* Chain-of-custody scenarios (Custody Builder) */
  custody: [
    {
      id: "cust-office", title: "Office Laptop: Suspected IP Theft",
      story: "On <b>17 Sep 2026</b> at <b>14:35</b>, forensic analyst <b>Dylan Reyes Smith</b> (initials <b>DRS</b>) seized a Dell Latitude 5540 laptop (S/N <b>8H2K9X3</b>) from <b>Room 214, Halden Corp HQ, 55 Main St, Springfield</b>. It was released by IT manager <b>Priya Nair</b> (555-0142) who gave written consent, witnessed by <b>Tom Okafor</b>. This is the first item seized for case <b>HC-2026-041</b>. The laptop was powered OFF and was left that way. Packaged in an anti-static bag, then transported to the lab evidence room.",
      fields: [
        { key: "case", label: "Case number", expect: "HC-2026-041" },
        { key: "from", label: "Received from (name/title)", expect: "Priya Nair", accept: ["priya nair", "priya nair it manager", "priya nair, it manager"] },
        { key: "phone", label: "Handler phone", expect: "555-0142" },
        { key: "loc", label: "Evidence location", expect: "Room 214, Halden Corp HQ", accept: ["room 214", "room 214 halden corp hq", "room 214, halden corp hq, 55 main st, springfield"] },
        { key: "dt", label: "Date/time acquired (dd/mm/yyyy hh:mm)", expect: "17/09/2026 14:35", accept: ["17/09/2026 14:35", "17 sep 2026 14:35", "2026-09-17 14:35"] },
        { key: "desc", label: "Item description", expect: "Dell Latitude 5540 laptop S/N 8H2K9X3", accept: ["dell latitude 5540 laptop sn 8h2k9x3", "dell latitude 5540 s/n 8h2k9x3", "dell latitude 5540 8h2k9x3", "dell latitude 5540 laptop s/n 8h2k9x3"] },
        { key: "exhibit", label: "Exhibit number (aaa/ddmmyy/nnnn/zz)", expect: "DRS/170926/0001/A", accept: ["drs/170926/0001/a", "drs/170926/001/a", "drs/170926/0001"], hint: "Initials / ddmmyy / sequence from 001 / part (A = main unit)" },
        { key: "witness", label: "Consent witness", expect: "Tom Okafor" },
        { key: "pack", label: "Packaging", type: "select", expect: "Anti-static bag", options: ["Plastic bag", "Anti-static bag", "Faraday bag", "Paper envelope"] },
        { key: "state", label: "Power state action", type: "select", expect: "Left OFF; photographed", options: ["Powered on to check contents", "Left OFF; photographed", "Rebooted to BIOS", "Copied files to USB"] }
      ]
    },
    {
      id: "cust-phone", title: "Seized Smartphone: Powered ON",
      story: "On <b>3 Oct 2026</b> at <b>09:10</b>, officer <b>Maya Lindqvist</b> (initials <b>ML</b>) seized an iPhone 14 (IMEI <b>356938035643809</b>) from a suspect's desk at <b>Unit 7, 12 Harbor Rd</b>. The phone was ON and unlocked. Case <b>PD-26-1180</b>. It was released by the suspect <b>Carl Danner</b> (555-0199). This is the <b>2nd</b> item seized that day (parts of a single device: the phone itself is part A).",
      fields: [
        { key: "case", label: "Case number", expect: "PD-26-1180" },
        { key: "from", label: "Received from", expect: "Carl Danner", accept: ["carl danner"] },
        { key: "phone", label: "Handler phone", expect: "555-0199" },
        { key: "loc", label: "Evidence location", expect: "Unit 7, 12 Harbor Rd", accept: ["unit 7, 12 harbor rd", "unit 7 12 harbor rd", "suspect's desk, unit 7, 12 harbor rd"] },
        { key: "dt", label: "Date/time acquired (dd/mm/yyyy hh:mm)", expect: "03/10/2026 09:10", accept: ["03/10/2026 09:10", "3/10/2026 09:10", "03 oct 2026 09:10", "2026-10-03 09:10"] },
        { key: "desc", label: "Item description", expect: "iPhone 14 IMEI 356938035643809", accept: ["iphone 14 imei 356938035643809", "iphone 14 imei: 356938035643809", "iphone 14 356938035643809"] },
        { key: "exhibit", label: "Exhibit number", expect: "ML/031026/0002/A", accept: ["ml/031026/0002/a", "ml/031026/002/a"] },
        { key: "pack", label: "Packaging", type: "select", expect: "Faraday bag", options: ["Plastic bag", "Anti-static bag", "Faraday bag", "Paper envelope"] },
        { key: "state", label: "Immediate handling", type: "select", expect: "Keep charged, flight mode", options: ["Power off immediately", "Keep charged, flight mode", "Factory reset", "Browse messages on scene"] }
      ]
    }
  ]
});
