/* Module 1 - Lessons 1 & 2: What's new in Windows 11, setup, install, activation */
(() => {
  const { note, Q, task } = NOS;
  NOS.addChapter({
    id: "m1", num: 1, title: "Windows 11 Overview, Setup & Installation",
    summary: "New features, hardware requirements, install media, activation, dual boot",
    notes: [
      note("new", "What's new in Windows 11", "core", [
        "Windows 11 brings a **redesigned Start menu and taskbar**, **Snap Layouts** for window management, integrated **Microsoft Teams**, **Widgets** for personalized content, and gaming features such as **Auto HDR** and **DirectStorage**.",
        "The look is the **Fluent Design System**: rounded corners, new animations, improved touch, pen and voice input, and enhanced virtual desktops."
      ]),
      note("cloud", "Cloud, web and Store", "core", [
        "Windows 11 is tied to the cloud:",
        "- **Microsoft Edge** integration",
        "- **OneDrive** cloud storage and backup",
        "- Cloud-based user profiles and **settings sync**",
        "- **Azure AD** support for enterprise users",
        "The redesigned **Microsoft Store** supports **Win32, .NET, UWP and Android apps**, with curated content and developer-friendly policies."
      ]),
      note("security", "Built-in security and hardware", "admin", [
        "Security is hardware based: **TPM 2.0**, **Secure Boot** and virtualization-based security, plus **Windows Hello** (biometric sign-in) and enhanced ransomware protection.",
        "Windows 11 is optimized for newer CPUs and GPUs, high refresh rate displays, better laptop battery life, and supports **ARM-based devices**."
      ]),
      note("backup", "Backing up data and settings", "files", [
        "Backup options are **OneDrive backup**, **File History**, **System Image Backup**, settings sync across devices, and **recovery options and restore points**."
      ]),
      note("install", "Downloading and installing", "core", [
        "Get Windows 11 from Microsoft using the **Media Creation Tool**, the **Installation Assistant**, or an **ISO file**. You can do a **clean install** or an **upgrade** (in-place upgrade from Windows 10, with rollback options).",
        "**Minimum hardware requirements:**",
        "- 1 GHz CPU with 2 or more cores",
        "- 4 GB RAM and 64 GB storage",
        "- **TPM 2.0**, **Secure Boot** and a **DirectX 12** GPU"
      ]),
      note("activate", "Activation and dual booting", "core", [
        "Activation uses a **digital license** or a **product key**, and can be linked to a **Microsoft account**.",
        "**Dual boot** with Windows 10 or Linux relies on **disk partitioning** and a **boot manager**."
      ])
    ],
    glossary: [
      ["Snap Layouts", "Predefined window arrangements for multitasking.", "Hover the maximize button"],
      ["Widgets", "Personalized content panel in Windows 11.", ""],
      ["Fluent Design System", "Windows 11 visual style: rounded corners, animations.", ""],
      ["TPM 2.0", "Trusted Platform Module; hardware security chip required for Windows 11.", ""],
      ["Secure Boot", "Firmware feature that only allows trusted boot software.", ""],
      ["Windows Hello", "Biometric or PIN sign-in.", ""],
      ["Media Creation Tool", "Microsoft tool for making install media or upgrading.", ""],
      ["In-place upgrade", "Upgrade that keeps files, apps and settings, with rollback.", ""],
      ["Digital license", "Activation tied to the device or Microsoft account instead of a key.", ""]
    ],
    cards: [
      ["Windows 11 minimum RAM and storage?", "4 GB RAM, 64 GB storage."],
      ["Windows 11 minimum CPU?", "1 GHz, 2 or more cores."],
      ["Which security chip and boot feature are required?", "TPM 2.0 and Secure Boot (plus a DirectX 12 GPU)."],
      ["Ways to download or install Windows 11?", "Media Creation Tool, Installation Assistant, ISO file."],
      ["Which app types does the new Store support?", "Win32, .NET, UWP and Android apps."],
      ["Two gaming features new in Windows 11?", "Auto HDR and DirectStorage."],
      ["What does dual booting rely on?", "Disk partitioning and a boot manager."],
      ["Activation methods?", "Digital license or product key, linked to a Microsoft account."]
    ],
    quiz: [
      Q("What is the minimum RAM for Windows 11?", "4 GB", "Minimum is 4 GB RAM and 64 GB of storage.", "2 GB", "8 GB", "16 GB"),
      Q("Which hardware security chip does Windows 11 require?", "TPM 2.0", "TPM 2.0 and Secure Boot are required.", "TPM 1.0", "HDMI 2.1", "BitLocker"),
      Q("Which feature arranges windows into predefined configurations?", "Snap Layouts", "Snap Layouts help with multitasking.", "Widgets", "Focus Assist", "Live Tiles"),
      Q("Which tool can download an ISO and create install media?", "Media Creation Tool", "Media Creation Tool and Installation Assistant are the official options.", "Disk Cleanup", "Device Manager", "File History"),
      Q("Which GPU API is required for Windows 11?", "DirectX 12", "Minimum is a DirectX 12 capable GPU.", "DirectX 9", "OpenGL 1.1", "Vulkan only"),
      Q("What lets you run Windows 11 beside Linux on one PC?", "Dual boot with partitions and a boot manager", "Dual boot needs disk partitioning and a boot manager.", "Snap Layouts", "A Microsoft account", "Quick Settings"),
      Q("Which Windows 11 feature offers hardware-accelerated game asset loading?", "DirectStorage", "DirectStorage and Auto HDR are gaming features.", "Fluent Design", "Widgets", "Azure AD")
    ],
    commands: [
      { name: "winver", shell: "CMD / Run", desc: "Show the installed Windows version and build.", syntax: "winver", examples: ["winver"] },
      { name: "systeminfo", shell: "CMD", desc: "Show OS version, hardware and hotfix information.", syntax: "systeminfo", examples: ["systeminfo | findstr /B /C:\"OS\""] },
      { name: "slmgr /xpr", shell: "CMD (admin)", desc: "Show the activation expiration status.", syntax: "slmgr /xpr", examples: ["slmgr /xpr"] }
    ],
    tasks: [
      NOS.task("check-req", "Check if a PC meets Windows 11 requirements", "Settings > System > About, and tpm.msc", "Confirm CPU, RAM, storage and TPM.", [
        "Open **Settings > System > About** and read **Processor** and **Installed RAM**.",
        "Open **Settings > System > Storage** to check total storage (64 GB or more).",
        "Press **Win + R**, type `tpm.msc` and press Enter. The status should say the TPM is ready and the Specification Version is 2.0.",
        "To check Secure Boot, run `msinfo32` and look at **Secure Boot State** (On)."
      ]),
      NOS.task("clean-install", "Create install media and do a clean install", "Media Creation Tool", "Build a bootable USB drive.", [
        "Download the **Media Creation Tool** from Microsoft and run it.",
        "Choose **USB flash drive** (8 GB or larger) or **ISO file** as the media.",
        "Boot the target PC from the USB drive (boot menu key varies by vendor).",
        "Choose **Custom: Install Windows only** for a clean install and pick the destination partition."
      ], "A clean install erases the target partition. Back up first."),
      NOS.task("activate", "Check and activate Windows", "Settings > System > Activation", "See the activation state or enter a key.", [
        "Open **Settings > System > Activation**.",
        "Read the **Activation state**. A linked Microsoft account shows as a digital license.",
        "Choose **Change product key** to enter a key, or sign in to the Microsoft account the license is linked to."
      ])
    ]
  });
})();
