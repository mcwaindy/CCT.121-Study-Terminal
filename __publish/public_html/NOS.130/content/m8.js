/* Module 8 - Lesson 12: Security and privacy */
(() => {
  const { note, Q, task } = NOS;
  NOS.addChapter({
    id: "m8", num: 8, title: "Windows 11 Security & Privacy",
    summary: "Windows Security, SmartScreen, updates, privacy, ransomware protection, Hello, LSA",
    notes: [
      note("threats", "Understanding security threats", "admin", [
        "Threats include **viruses, malware, phishing and ransomware**. They can originate from **emails, websites, downloads or network vulnerabilities**.",
        "Understanding threats helps users **recognize and avoid risky behavior**."
      ]),
      note("core", "Core security features", "admin", [
        "Windows 11 includes **User Account Control, SmartScreen, Defender Firewall, BitLocker and Microsoft Defender Antivirus**.",
        "Use **Windows Security** to monitor antivirus, firewall and device health. Check for alerts, resolve issues promptly, and enable notifications for real-time threat detection."
      ]),
      note("uac", "User Account Control (UAC)", "admin", [
        "UAC **prevents unauthorized changes** by requiring permission or an **administrator password** for important actions.",
        "- Mitigates malware by blocking **unauthorized software installations** and accidental system changes",
        "- Strictness is **configurable** by users and organizations, balancing security with usability",
        "- Adjust UAC settings to be stricter or more lenient"
      ]),
      note("smartscreen", "Microsoft Defender SmartScreen", "admin", [
        "SmartScreen uses a **cloud database** to continuously check files and web content against known threats.",
        "- Evaluates the **reputation of unrecognized files** and warns about unsafe downloads",
        "- Integrates with **Microsoft Edge and Windows** for real-time protection against malicious sites and software",
        "- Helps defend against **phishing and social engineering** by alerting users before harmful software runs"
      ]),
      note("firewall", "Windows Defender Firewall", "admin", [
        "The firewall **monitors and controls incoming and outgoing traffic** based on rules, acting as a barrier between the device and the internet.",
        "- Profiles: **private, public or domain** networks",
        "- Custom rules **allow or block specific applications and ports**"
      ]),
      note("bitlocker", "BitLocker Drive Encryption", "admin", [
        "Encryption converts data into **unreadable code**. **BitLocker** provides **full-disk encryption** on **Windows Pro and Enterprise** editions, protecting data on lost or stolen devices.",
        "- Keys are stored securely using a **TPM or a USB key**",
        "- Managed through **Control Panel or Settings**, with **recovery keys** to regain access after hardware changes"
      ]),
      note("defender", "Microsoft Defender Antivirus", "admin", [
        "Built into Windows Security, so no third-party antivirus is needed for baseline protection.",
        "- **Real-time protection** continuously scans files and apps",
        "- **Automatic updates** of threat definitions",
        "- **Cloud-delivered protection** uses machine learning and big data/AI to detect emerging threats",
        "Best practice: enable real-time protection, run **regular scans**, and avoid downloading files from **untrusted sources**."
      ]),
      note("update", "Windows Update and patch management", "admin", [
        "Windows Update delivers **security patches and feature updates**. Updates fix **vulnerabilities** and improve stability and performance. Enable **automatic updates** for timely protection, or choose manual installation for more control.",
        "Organizations use **WSUS** and **Microsoft Endpoint Manager** to deploy and control updates centrally."
      ]),
      note("phish", "Phishing awareness and SmartScreen alerts", "admin", [
        "Phishing emails often show **poor grammar and urgent requests**. User education combined with **SmartScreen** warnings reduces the risk of phishing scams."
      ]),
      note("privacy", "Privacy settings and data collection", "admin", [
        "Windows 11 provides extensive controls over data collection and sharing with Microsoft. The **Privacy Dashboard** manages permissions for **location, camera, microphone** and other features.",
        "- Review app permissions in **Settings > Privacy**",
        "- Use **diagnostic data** settings to limit data sent to Microsoft"
      ]),
      note("cfa", "Controlled Folder Access", "admin", [
        "**Controlled Folder Access** protects against **ransomware** by blocking unauthorized applications from changing protected folders.",
        "- Only **trusted applications specified by the user** can access protected folders",
        "- Users **designate which folders** to protect, tailored to critical data",
        "- Strengthens defense against data loss and corruption in business and academic settings"
      ]),
      note("exploit", "Exploit and Tamper Protection", "admin", [
        "**Exploit Protection** gives **system-wide and application-specific** defenses against known attack techniques. **Tamper Protection** prevents unauthorized changes to security settings, keeping antivirus and firewall settings intact. Together they provide integrated defense against advanced threats."
      ]),
      note("hello", "Windows Hello and the Local Security Authority", "admin", [
        "**Windows Hello** signs in with **facial recognition, fingerprint scanning or a secure PIN**. The **Local Security Authority (LSA)** enforces security policies and manages **user authentication**. Together they ensure only authorized users access system resources."
      ]),
      note("practices", "Best practices", "admin", [
        "- Stay informed about new threats and security features",
        "- Use **strong passwords** and enable **multi-factor authentication**",
        "- **Back up** important data regularly",
        "- Review security settings periodically"
      ])
    ],
    glossary: [
      ["SmartScreen", "Warns about unrecognized apps, files and sites.", ""],
      ["Microsoft Defender Antivirus", "Built-in real-time antivirus.", ""],
      ["WSUS", "Windows Server Update Services; central update control.", ""],
      ["Microsoft Endpoint Manager", "Cloud tool to manage devices and updates.", ""],
      ["Phishing", "Deceptive messages that steal information.", ""],
      ["Controlled Folder Access", "Ransomware protection for chosen folders.", ""],
      ["Exploit Protection", "Mitigations against known exploit techniques.", ""],
      ["Tamper Protection", "Locks security settings against unauthorized change.", ""],
      ["Windows Hello", "Face, fingerprint or PIN sign-in.", ""],
      ["LSA", "Local Security Authority; enforces policy and authenticates users.", ""]
    ],
    cards: [
      ["What blocks ransomware from changing protected folders?", "Controlled Folder Access."],
      ["What does Tamper Protection prevent?", "Unauthorized changes to antivirus and firewall settings."],
      ["Tools organizations use to manage updates?", "WSUS and Microsoft Endpoint Manager."],
      ["What does SmartScreen do?", "Warns before running unrecognized or malicious apps."],
      ["Windows Hello sign-in methods?", "Face, fingerprint, PIN."],
      ["What does the LSA do?", "Enforces security policy and manages authentication."],
      ["Where do you control app permissions for camera and mic?", "Settings > Privacy & security."],
      ["Signs of a phishing email?", "Poor grammar and urgent requests."]
    ],
    quiz: [
      Q("Which feature stops ransomware changing documents?", "Controlled Folder Access", "It only lets trusted apps modify protected folders.", "Snap Layouts", "AutoPlay", "Quick Access"),
      Q("What does Tamper Protection do?", "Prevents unauthorized changes to security settings", "It protects Defender and firewall settings.", "Encrypts files", "Installs updates", "Blocks USB drives"),
      Q("Which tools do organizations use to deploy updates?", "WSUS and Microsoft Endpoint Manager", "Central update tools.", "Paint and Notepad", "AutoPlay and Hello", "ping and tracert"),
      Q("What warns about an unrecognized application?", "SmartScreen", "SmartScreen reputation checks.", "Focus Assist", "File History", "Hyper-V"),
      Q("Which are Windows Hello methods?", "Face, fingerprint and PIN", "Hello supports biometrics and PINs.", "Only passwords", "Only smart cards", "CAPTCHA"),
      Q("Which component enforces security policy and authentication?", "Local Security Authority", "LSA handles authentication.", "Task Scheduler", "Print Spooler", "Widgets"),
      Q("Which hints suggest a phishing email?", "Poor grammar and urgent requests", "Classic phishing signs.", "Corporate signature", "Correct spelling", "No links")
    ],
    commands: [
      { name: "Get-MpComputerStatus", shell: "PowerShell", desc: "Show Defender status.", syntax: "Get-MpComputerStatus", examples: ["Get-MpComputerStatus"] },
      { name: "Start-MpScan", shell: "PowerShell (admin)", desc: "Run a Defender scan.", syntax: "Start-MpScan -ScanType QuickScan", examples: ["Start-MpScan -ScanType QuickScan"] },
      { name: "Update-MpSignature", shell: "PowerShell (admin)", desc: "Update Defender definitions.", syntax: "Update-MpSignature", examples: ["Update-MpSignature"] },
      { name: "netsh advfirewall", shell: "CMD (admin)", desc: "Show or change firewall state.", syntax: "netsh advfirewall show allprofiles", examples: ["netsh advfirewall show allprofiles"] },
      { name: "gpupdate", shell: "CMD", desc: "Refresh group policy.", syntax: "gpupdate /force", examples: ["gpupdate /force"] },
      { name: "wf.msc", shell: "Run", desc: "Firewall with Advanced Security.", syntax: "wf.msc", examples: [] }
    ],
    tasks: [
      NOS.task("cfa", "Enable Controlled Folder Access", "Windows Security > Virus & threat protection", "Protect from ransomware.", [
        "Open **Windows Security > Virus & threat protection**.",
        "Under **Ransomware protection**, click **Manage ransomware protection**.",
        "Turn **Controlled folder access** On, then use **Protected folders** and **Allow an app through Controlled folder access**."
      ]),
      NOS.task("update", "Check for updates", "Settings > Windows Update", "Install patches.", [
        "Open **Settings > Windows Update**.",
        "Click **Check for updates** and install.",
        "Use **Pause updates** or **Advanced options** to control install behavior."
      ]),
      NOS.task("tamper", "Turn on Tamper Protection", "Windows Security > Virus & threat protection settings", "Protect AV settings.", [
        "Open **Windows Security > Virus & threat protection > Manage settings**.",
        "Switch **Tamper Protection** On."
      ]),
      NOS.task("privacy", "Review app privacy permissions", "Settings > Privacy & security", "Limit camera and mic.", [
        "Open **Settings > Privacy & security**.",
        "Choose **Camera**, **Microphone** or **Location**.",
        "Switch off access for apps that do not need it."
      ]),
      NOS.task("hello", "Set up Windows Hello", "Settings > Accounts > Sign-in options", "Add PIN, face or fingerprint.", [
        "Open **Settings > Accounts > Sign-in options**.",
        "Choose **PIN (Windows Hello)**, **Facial recognition** or **Fingerprint recognition**.",
        "Follow the setup wizard."
      ])
    ]
  });
})();
