/* Module 7 - Lesson 11: Networking and sharing */
(() => {
  const { note, Q, task } = NOS;
  NOS.addChapter({
    id: "m7", num: 7, title: "Networking, Sharing & Remote Access",
    summary: "Network profiles, Wi-Fi, Remote Desktop, file and printer sharing, ping, firewall",
    notes: [
      note("discovery", "Network discovery and profiles", "net", [
        "**Network discovery** lets your PC see and be seen by others. Profiles are **Private** (trusted, discovery on) and **Public** (untrusted, discovery off). Change them in **Settings > Network & internet**."
      ]),
      note("wifi", "Connecting to Wi-Fi", "net", [
        "Connect from **Quick Settings** or **Settings > Network & internet > Wi-Fi**. Use **WPA2/WPA3** security, and manage saved networks under **Manage known networks**. Avoid open public Wi-Fi without a VPN."
      ]),
      note("rdp", "Remote Desktop", "net", [
        "**Remote Desktop (RDP)** controls another PC over the network. Enable it in **Settings > System > Remote Desktop**. It requires **Windows Pro or higher** as the host, uses **TCP port 3389**, and the user must be allowed. Use **Network Level Authentication**. Connect with `mstsc`."
      ]),
      note("share", "File and printer sharing", "net", [
        "Share folders from **Properties > Sharing**. **Share permissions** combine with **NTFS permissions**, and **the most restrictive wins**. Access shares using a **UNC path** like `\\\\PC\\Share`. Share printers from **Printers & scanners > Printer properties > Sharing**."
      ]),
      note("diag", "Troubleshooting: ping and ipconfig", "net", [
        "**ping** tests connectivity using ICMP. **ipconfig** shows IP configuration. Typical order: ping `127.0.0.1` (the local stack), then the **default gateway**, then an outside IP, then a **name** (tests DNS)."
      ]),
      note("fw", "Windows Defender Firewall", "net", [
        "The firewall allows or blocks traffic by **inbound and outbound rules**, with different settings for **Private** and **Public** profiles. Allow apps through **Allow an app through firewall**, or create rules in **Windows Defender Firewall with Advanced Security**."
      ])
    ],
    glossary: [
      ["Network discovery", "Lets a PC find and be found on the network.", ""],
      ["Private network", "Trusted profile with discovery enabled.", ""],
      ["Public network", "Untrusted profile with discovery disabled.", ""],
      ["RDP", "Remote Desktop Protocol, TCP 3389.", "mstsc"],
      ["UNC path", "Network path in the form \\\\server\\share.", ""],
      ["ICMP", "Protocol used by ping.", ""],
      ["Default gateway", "Router address used to reach other networks.", ""],
      ["DNS", "Resolves names to IP addresses.", ""],
      ["WPA3", "Latest Wi-Fi security standard.", ""]
    ],
    cards: [
      ["Which network profile has discovery off by default?", "Public."],
      ["RDP port number?", "TCP 3389."],
      ["Client command to start Remote Desktop?", "mstsc."],
      ["Share vs NTFS permissions: which applies?", "The most restrictive combination."],
      ["Command to show IP configuration?", "ipconfig (use /all for details)."],
      ["Protocol used by ping?", "ICMP."],
      ["Loopback address?", "127.0.0.1."],
      ["Where do you create advanced firewall rules?", "Windows Defender Firewall with Advanced Security (wf.msc)."]
    ],
    quiz: [
      Q("Which profile should be used on public Wi-Fi?", "Public", "Public disables discovery and sharing.", "Private", "Domain", "Home"),
      Q("What port does Remote Desktop use?", "TCP 3389", "RDP default.", "TCP 22", "TCP 443", "UDP 53"),
      Q("What is the UNC format of a share?", "\\\\server\\share", "Two backslashes then server name.", "//server/share", "server:share", "C:\\share"),
      Q("When share and NTFS permissions differ, which applies?", "The most restrictive", "Combined permissions use the strictest.", "The share permissions only", "The NTFS permissions only", "The least restrictive"),
      Q("Which command tests connectivity to a host?", "ping", "Uses ICMP echo.", "ipconfig", "netstat", "tracert only"),
      Q("What does pinging a hostname but not its IP address indicate?", "A DNS problem", "If the IP works but the name does not, DNS is failing.", "A bad cable", "A firewall disabled", "A full disk"),
      Q("Which edition can host an RDP session?", "Windows Pro or higher", "Home cannot be an RDP host.", "Windows Home", "Any edition", "Only Server")
    ],
    commands: [
      { name: "ipconfig", shell: "CMD", desc: "Show IP config; renew or flush DNS.", syntax: "ipconfig [/all] [/release] [/renew] [/flushdns]", examples: ["ipconfig /all", "ipconfig /flushdns"] },
      { name: "ping", shell: "CMD", desc: "Test reachability.", syntax: "ping <host> [-t] [-n count]", examples: ["ping 127.0.0.1", "ping -n 4 google.com"] },
      { name: "tracert", shell: "CMD", desc: "Trace route to a host.", syntax: "tracert <host>", examples: ["tracert google.com"] },
      { name: "nslookup", shell: "CMD", desc: "Query DNS.", syntax: "nslookup <name>", examples: ["nslookup microsoft.com"] },
      { name: "netstat", shell: "CMD", desc: "Show connections and ports.", syntax: "netstat -ano", examples: ["netstat -ano"] },
      { name: "net use", shell: "CMD", desc: "Map a network drive.", syntax: "net use <drive>: \\\\server\\share", examples: ["net use Z: \\\\PC\\Share"] },
      { name: "mstsc", shell: "Run / CMD", desc: "Remote Desktop client.", syntax: "mstsc /v:<host>", examples: ["mstsc /v:PC01"] },
      { name: "Test-NetConnection", shell: "PowerShell", desc: "Test connectivity and ports.", syntax: "Test-NetConnection <host> [-Port n]", examples: ["Test-NetConnection server -Port 3389"] },
      { name: "Get-NetIPConfiguration", shell: "PowerShell", desc: "Show IP configuration.", syntax: "Get-NetIPConfiguration", examples: ["Get-NetIPConfiguration"] }
    ],
    tasks: [
      NOS.task("profile", "Change network profile to Private", "Settings > Network & internet", "Set trust level.", [
        "Open **Settings > Network & internet** and choose **Wi-Fi** or **Ethernet**.",
        "Click the connection's properties.",
        "Under **Network profile type**, choose **Private network**."
      ]),
      NOS.task("rdp-on", "Enable Remote Desktop", "Settings > System > Remote Desktop", "Allow incoming RDP.", [
        "Open **Settings > System > Remote Desktop**.",
        "Turn **Remote Desktop** On and confirm.",
        "Check **Select users that can remotely access this PC** and add users."
      ], "Requires Windows Pro or higher."),
      NOS.task("share-folder", "Share a folder", "Folder Properties > Sharing", "Share with a user.", [
        "Right-click the folder > **Properties > Sharing > Advanced Sharing**.",
        "Tick **Share this folder**, then **Permissions** to set Read or Change.",
        "On **Security**, confirm NTFS permissions for the same users."
      ]),
      NOS.task("share-printer", "Share a printer", "Settings > Bluetooth & devices > Printers & scanners", "Let others print.", [
        "Open **Printers & scanners** and select the printer.",
        "Click **Printer properties > Sharing**.",
        "Tick **Share this printer** and give it a share name."
      ]),
      NOS.task("fw-rule", "Allow an app through the firewall", "Windows Security > Firewall & network protection", "Open a firewall exception.", [
        "Open **Windows Security > Firewall & network protection**.",
        "Click **Allow an app through firewall**, then **Change settings**.",
        "Tick the app for **Private** and/or **Public**."
      ])
    ]
  });
})();
