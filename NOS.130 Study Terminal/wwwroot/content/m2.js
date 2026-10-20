/* Module 2 - Lesson 3: Using Windows 11 */
(() => {
  const { note, Q, task } = NOS;
  NOS.addChapter({
    id: "m2", num: 2, title: "Using Windows 11",
    summary: "Start menu, taskbar, Quick Settings, notifications, Snap Layouts, virtual desktops",
    notes: [
      note("start", "Start menu essentials", "core", [
        "The Start menu is **centered on the taskbar** by default. Open it with the icon, the **Windows key**, or **Ctrl + Esc**. It provides quick access to **pinned apps, recommended files and system settings**.",
        "You can **pin any app or folder** to Start. Typing after pressing the Windows key uses the integrated **search**, which finds apps, files, settings and web results."
      ]),
      note("taskbar", "Taskbar and Quick Settings", "core", [
        "You can change **taskbar alignment** (left or center), **add or remove icons**, and choose which **system tray icons** appear.",
        "**Quick Settings** gives fast access to **volume, Wi-Fi and brightness**. Open it by clicking the network, volume or battery icons."
      ]),
      note("notif", "Notifications and Focus Assist", "core", [
        "Notifications appear in the **Notification Center**, opened from the taskbar **date and time**. Manage them per app in **Settings > System > Notifications**.",
        "**Focus Assist** limits notifications. Modes include **Priority only** and **Alarms only**, and it can be toggled from Quick Settings. It suits meetings, presentations and focused work."
      ]),
      note("productivity", "Snap Layouts and virtual desktops", "core", [
        "**Snap Layouts** arrange windows into predefined configurations. **Virtual desktops** give separate desktops (such as work and personal), and you can **rename** them."
      ]),
      note("access", "Accessibility tools", "core", [
        "**Voice input** dictates text and runs commands with a microphone. The **on-screen keyboard** is an alternative input method for touch devices or when no physical keyboard is available."
      ])
    ],
    glossary: [
      ["Quick Settings", "Panel with volume, Wi-Fi and brightness controls.", "Click network/volume/battery icons"],
      ["Notification Center", "Where notifications collect; opened from the date and time.", ""],
      ["Focus Assist", "Feature that reduces notifications (Priority only, Alarms only).", ""],
      ["Virtual desktop", "A separate desktop for organizing tasks.", "Win + Tab"],
      ["Pinned apps", "Apps fixed to Start or the taskbar for quick access.", ""],
      ["On-screen keyboard", "Touch keyboard shown on screen.", ""]
    ],
    cards: [
      ["Keyboard shortcut to open Start (besides the Windows key)?", "Ctrl + Esc."],
      ["Where do you open the Notification Center?", "Click the date and time on the taskbar."],
      ["Where do you turn off notifications for one app?", "Settings > System > Notifications."],
      ["Two Focus Assist modes?", "Priority only, Alarms only."],
      ["What does Quick Settings control?", "Volume, Wi-Fi, brightness (and other common toggles)."],
      ["Can virtual desktops be renamed?", "Yes."],
      ["Default taskbar alignment?", "Centered (can be changed to left)."]
    ],
    quiz: [
      Q("Which shortcut opens the Start menu in addition to the Windows key?", "Ctrl + Esc", "Ctrl + Esc opens Start.", "Alt + F4", "Ctrl + Shift + Esc", "Win + L"),
      Q("Where is the Notification Center opened from?", "The taskbar date and time", "Click the date and time on the taskbar.", "The Start menu power button", "Device Manager", "The Run dialog"),
      Q("Which feature reduces interruptions during a presentation?", "Focus Assist", "Focus Assist limits notifications.", "Snap Layouts", "Widgets", "Quick Access"),
      Q("What lets you separate work and personal windows?", "Virtual desktops", "Virtual desktops create separate workspaces.", "Quick Settings", "Libraries", "File History"),
      Q("Where do you quickly change brightness and Wi-Fi?", "Quick Settings", "Quick Settings consolidates common controls.", "Task Manager", "Control Panel > Programs", "Event Viewer"),
      Q("Where can you manage notifications per app?", "Settings > System > Notifications", "That page controls notifications per app.", "Settings > Privacy > Camera", "Computer Management", "Services"),
      Q("Which tool helps users who cannot use a physical keyboard?", "On-screen keyboard", "It is an alternative input method.", "Focus Assist", "Snap Layouts", "Widgets")
    ],
    commands: [
      { name: "Win + Tab", shell: "Shortcut", desc: "Open Task View and virtual desktops.", syntax: "Win + Tab", examples: [] },
      { name: "Win + L", shell: "Shortcut", desc: "Lock the workstation.", syntax: "Win + L", examples: [] },
      { name: "osk", shell: "Run / CMD", desc: "Open the on-screen keyboard.", syntax: "osk", examples: ["osk"] }
    ],
    tasks: [
      NOS.task("align-taskbar", "Move the taskbar icons to the left", "Settings > Personalization > Taskbar", "Change alignment.", [
        "Right-click the taskbar and choose **Taskbar settings**.",
        "Expand **Taskbar behaviors**.",
        "Set **Taskbar alignment** to **Left**."
      ]),
      NOS.task("focus", "Turn on Focus Assist for a meeting", "Quick Settings / Settings > System", "Limit notifications.", [
        "Click the **network, volume or battery** icons to open Quick Settings.",
        "Toggle **Focus Assist** (or open **Settings > System > Focus**) and choose **Priority only** or **Alarms only**."
      ]),
      NOS.task("vdesktop", "Create and rename a virtual desktop", "Task View", "Separate work and personal.", [
        "Press **Win + Tab** or click the **Task View** button.",
        "Click **New desktop**.",
        "Right-click the desktop thumbnail, choose **Rename** and type a name."
      ])
    ]
  });
})();
