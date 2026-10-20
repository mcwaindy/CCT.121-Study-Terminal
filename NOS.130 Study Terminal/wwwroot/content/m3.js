/* Module 3 - Lesson 5: Installing and configuring applications */
(() => {
  const { note, Q, task } = NOS;
  NOS.addChapter({
    id: "m3", num: 3, title: "Installing & Configuring Applications",
    summary: "Microsoft Store, desktop vs UWP, winget, startup apps, default apps, Windows features",
    notes: [
      note("store", "The Microsoft Store", "core", [
        "The Store is a **centralized hub** for downloading apps. Apps are **verified** for security, you can browse categories, read reviews and manage updates, and it **integrates with Windows** more simply than traditional installers."
      ]),
      note("types", "Desktop apps vs UWP apps", "core", [
        "**Desktop (Win32) apps** are installed with executables and have **full system access**, which increases security risk.",
        "**UWP apps** are **sandboxed**, Store-based, lightweight, secure and compatible across many Windows devices. **Sandboxing** isolates an app and restricts its access to system and user data."
      ]),
      note("manage", "Viewing, uninstalling and installing apps", "files", [
        "View apps in **Settings > Apps > Installed apps**. Quick uninstall: **right-click the app in Start > Uninstall**.",
        "**winget** (Windows Package Manager) installs and manages apps from the command line on Windows 10 and 11 and lets IT staff automate installs and upgrades with scripts."
      ]),
      note("maint", "Repair, startup apps and Task Manager", "files", [
        "The **Repair** option fixes an app **without uninstalling** and keeps user data and settings. **Task Manager** shows running apps and background processes.",
        "**Too many startup apps** slow boot by using memory and CPU. Enable or disable them in **Task Manager > Startup**.",
        "The **App history** tab tracks **CPU time and network usage** per app over time."
      ]),
      note("defaults", "Default apps and Windows features", "files", [
        "Pick default apps for file types and protocols in **Settings > Apps > Default apps**, and **reset** them to Microsoft recommended defaults if needed.",
        "Open **Turn Windows features on or off** from **Optional features**. A **restart** is often required. Removing features can cause **loss of functionality or instability**."
      ]),
      note("autoplay", "AutoPlay and app updates", "admin", [
        "**AutoPlay** launches an action when media such as a USB drive is inserted. It is convenient but a **security risk** because it can run unwanted apps, so you can **disable it for all devices**.",
        "Keep apps updated for **security patches**, **new features** and better performance. **Automatic updates** keep the system current."
      ])
    ],
    glossary: [
      ["Sandboxing", "Isolating an app to limit its access to system and user data.", ""],
      ["UWP", "Universal Windows Platform app: sandboxed, Store-based.", ""],
      ["Win32 / Desktop app", "Traditional installed program with full system access.", ""],
      ["winget", "Windows Package Manager for command-line app install and upgrade.", "winget install <id>"],
      ["AutoPlay", "Automatic action when removable media is inserted.", ""],
      ["App history", "Task Manager tab with CPU and network usage over time.", ""],
      ["Startup apps", "Apps that launch at sign-in; managed in Task Manager.", ""]
    ],
    cards: [
      ["Why are UWP apps considered more secure?", "They run in a sandbox with restricted access."],
      ["Where do you view installed apps?", "Settings > Apps > Installed apps."],
      ["What does winget stand for / do?", "Windows Package Manager; installs and manages apps from the command line."],
      ["Where do you disable startup apps?", "Task Manager > Startup tab."],
      ["What does Repair do?", "Fixes an app without uninstalling, keeping data and settings."],
      ["Risk of AutoPlay?", "It can run unwanted or malicious apps from inserted media."],
      ["Where are default apps set?", "Settings > Apps > Default apps."],
      ["What does the App history tab track?", "CPU time, network usage and other resource metrics."]
    ],
    quiz: [
      Q("Which app type runs in a sandbox?", "UWP", "UWP apps are sandboxed.", "Win32 desktop", "Portable executables", "Batch files"),
      Q("Which command-line tool installs apps on Windows 11?", "winget", "Windows Package Manager.", "apt", "chkdsk", "msinfo32"),
      Q("Where do you stop apps from starting at sign-in?", "Task Manager > Startup", "Startup apps are managed in Task Manager.", "Device Manager", "Disk Cleanup", "Event Viewer"),
      Q("What does the Repair option preserve?", "User data and settings", "Repair fixes the app without uninstalling.", "Nothing", "Only the license", "Only the registry"),
      Q("Why might you disable AutoPlay?", "It can run malicious apps automatically", "AutoPlay is a security risk.", "It slows down the display", "It blocks Wi-Fi", "It deletes USB files"),
      Q("Which Task Manager tab shows CPU and network use over time per app?", "App history", "App history tracks resource use over time.", "Performance", "Users", "Services"),
      Q("What is a likely result of removing a Windows feature?", "Loss of functionality or instability", "Features can be critical to other components.", "Faster updates", "More RAM", "A new Start menu")
    ],
    commands: [
      { name: "winget install", shell: "CMD / PowerShell", desc: "Install an app from the winget repository.", syntax: "winget install <id|name>", examples: ["winget install Mozilla.Firefox"] },
      { name: "winget upgrade", shell: "CMD / PowerShell", desc: "List or install available updates.", syntax: "winget upgrade [--all]", examples: ["winget upgrade --all"] },
      { name: "winget uninstall", shell: "CMD / PowerShell", desc: "Remove an installed app.", syntax: "winget uninstall <id|name>", examples: ["winget uninstall Mozilla.Firefox"] },
      { name: "winget search", shell: "CMD / PowerShell", desc: "Search for apps.", syntax: "winget search <text>", examples: ["winget search vlc"] },
      { name: "taskmgr", shell: "Run / CMD", desc: "Open Task Manager.", syntax: "taskmgr", examples: ["taskmgr"] },
      { name: "optionalfeatures", shell: "Run / CMD", desc: "Open Turn Windows features on or off.", syntax: "optionalfeatures", examples: ["optionalfeatures"] }
    ],
    tasks: [
      NOS.task("uninstall", "Uninstall an app", "Settings > Apps > Installed apps", "Remove an app two ways.", [
        "Open **Settings > Apps > Installed apps**, click the **...** next to the app, then choose **Uninstall**.",
        "Or in **Start**, right-click the app and choose **Uninstall**."
      ]),
      NOS.task("startup", "Disable a startup app", "Task Manager > Startup", "Speed up sign-in.", [
        "Press **Ctrl + Shift + Esc** to open Task Manager.",
        "Open the **Startup apps** tab and sort by **Startup impact**.",
        "Select an app and click **Disable**."
      ]),
      NOS.task("autoplay-off", "Disable AutoPlay", "Settings > Bluetooth & devices > AutoPlay", "Prevent automatic media actions.", [
        "Open **Settings > Bluetooth & devices > AutoPlay**.",
        "Turn **Use AutoPlay for all media and devices** to **Off**."
      ]),
      NOS.task("features", "Turn a Windows feature on or off", "Optional features", "Enable or disable a feature.", [
        "Search for **Turn Windows features on or off** or run `optionalfeatures`.",
        "Tick or untick the feature and click **OK**.",
        "Restart if prompted."
      ], "Disabling critical features can cause instability.")
    ]
  });
})();
