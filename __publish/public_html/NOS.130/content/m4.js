/* Module 4 - Lesson 8: Managing local and cloud storage */
(() => {
  const { note, Q, task } = NOS;
  NOS.addChapter({
    id: "m4", num: 4, title: "Managing Local & Cloud Storage",
    summary: "Format, CHKDSK, BitLocker, backups, VHD/VHDX, Disk Management",
    notes: [
      note("overview", "Disk management and virtualization", "files", [
        "Disk management covers **formatting, repairing file systems, encrypting disks and backing up data**. **Virtualization** creates virtual versions of physical resources, and **virtual hard disks** give portable, easily backed-up storage."
      ]),
      note("format", "Formatting a disk", "files", [
        "Formatting **erases data** and sets up a **file system** (such as **NTFS** or **FAT32**).",
        "A **quick format** removes file pointers. A **full format** also checks for **bad sectors**. Always back up first."
      ]),
      note("chkdsk", "Scanning and repairing file system errors", "files", [
        "Errors come from **improper shutdowns, malware and hardware failure**. **CHKDSK** scans disk integrity and fixes logical file system issues."
      ]),
      note("bitlocker", "Encrypting a disk (BitLocker)", "admin", [
        "**BitLocker** is Windows' built-in drive encryption. Data is unreadable without the key. It protects lost or stolen laptops and portable drives, but needs **key management** and can affect performance."
      ]),
      note("backup", "Backing up files", "files", [
        "Use **File History** or **Backup and Restore** to schedule backups to an external drive or the cloud.",
        "- **Full** backup: everything",
        "- **Incremental**: changes since the last backup of any kind",
        "- **Differential**: changes since the last full backup",
        "Best practice: keep multiple copies, automate, and verify backups."
      ]),
      note("vhd", "Virtual hard disks (VHD/VHDX)", "files", [
        "A **VHD** is a **file that represents a physical disk**. VHDs can be **fixed** or **dynamically expanding**, in **VHD or VHDX** format, and are used by virtualization platforms such as **Hyper-V**.",
        "Create and attach them with **Disk Management** or **PowerShell**. Advantages: easy backup (copy the file), **portable VMs**, and **isolated testing** environments."
      ])
    ],
    glossary: [
      ["NTFS", "Default Windows file system with permissions, journaling and encryption.", ""],
      ["FAT32", "Older file system with wide compatibility and a 4 GB file limit.", ""],
      ["Quick format", "Removes file pointers without scanning for bad sectors.", ""],
      ["CHKDSK", "Scans and repairs file system errors.", "chkdsk C: /f"],
      ["BitLocker", "Built-in full-disk encryption.", ""],
      ["VHD / VHDX", "Virtual hard disk file formats.", ""],
      ["Hyper-V", "Windows virtualization platform.", ""],
      ["Differential backup", "Backs up changes since the last full backup.", ""],
      ["Incremental backup", "Backs up changes since the last backup.", ""]
    ],
    cards: [
      ["Quick format vs full format?", "Quick removes file pointers; full also checks for bad sectors."],
      ["What does CHKDSK do?", "Scans and fixes file system errors."],
      ["Built-in Windows disk encryption?", "BitLocker."],
      ["Incremental vs differential?", "Incremental = since last backup; differential = since last full backup."],
      ["What is a VHD?", "A file that represents a physical hard disk as a virtual disk."],
      ["Two VHD types?", "Fixed and dynamically expanding."],
      ["Two VHD formats?", "VHD and VHDX."],
      ["Tools to create a VHD?", "Disk Management and PowerShell."]
    ],
    quiz: [
      Q("Which format type checks for bad sectors?", "Full format", "Quick format only removes file pointers.", "Quick format", "Both only on FAT32", "Neither"),
      Q("Which tool scans and repairs file system errors?", "CHKDSK", "CHKDSK fixes logical errors.", "BitLocker", "winget", "Task Manager"),
      Q("Which built-in feature encrypts a drive?", "BitLocker", "BitLocker provides full-disk encryption.", "File History", "Disk Cleanup", "Snap Layouts"),
      Q("What does a differential backup copy?", "Changes since the last full backup", "Differential = since last full.", "Changes since the last backup of any type", "Everything every time", "Only deleted files"),
      Q("What is a VHD?", "A file that acts as a virtual hard disk", "VHDs are disk images used by VMs.", "A video format", "A physical drive type", "A network share"),
      Q("Which platform commonly uses VHDX files?", "Hyper-V", "Hyper-V uses VHD/VHDX disks.", "Task Manager", "AutoPlay", "Windows Hello"),
      Q("Which are the two VHD allocation types?", "Fixed and dynamically expanding", "Fixed size or grows as needed.", "Quick and full", "Primary and logical", "Basic and dynamic")
    ],
    commands: [
      { name: "chkdsk", shell: "CMD (admin)", desc: "Check a disk and repair errors.", syntax: "chkdsk <drive>: [/f] [/r]", examples: ["chkdsk C: /f"] },
      { name: "diskpart", shell: "CMD (admin)", desc: "Disk partitioning utility.", syntax: "diskpart", examples: ["list disk", "select disk 1", "create vdisk file=C:\\vm.vhdx maximum=10240 type=expandable"] },
      { name: "format", shell: "CMD (admin)", desc: "Format a volume.", syntax: "format <drive>: /fs:ntfs [/q]", examples: ["format E: /fs:ntfs /q"] },
      { name: "manage-bde", shell: "CMD (admin)", desc: "Manage BitLocker.", syntax: "manage-bde -status", examples: ["manage-bde -status"] },
      { name: "New-VHD", shell: "PowerShell (admin)", desc: "Create a virtual hard disk (Hyper-V module).", syntax: "New-VHD -Path <file> -SizeBytes <n> -Dynamic", examples: ["New-VHD -Path C:\\vm.vhdx -SizeBytes 10GB -Dynamic"] },
      { name: "Get-Disk", shell: "PowerShell", desc: "List disks.", syntax: "Get-Disk", examples: ["Get-Disk"] },
      { name: "Get-Volume", shell: "PowerShell", desc: "List volumes and free space.", syntax: "Get-Volume", examples: ["Get-Volume"] }
    ],
    tasks: [
      NOS.task("vhd-create", "Create and mount a VHD", "Disk Management", "Create a virtual disk.", [
        "Right-click **Start** and choose **Disk Management** (or run `diskmgmt.msc`).",
        "Choose **Action > Create VHD**.",
        "Enter a **location** and **size**, pick **VHDX** and **Fixed size** or **Dynamically expanding**, then click **OK**.",
        "Right-click the new disk (shown Not Initialized) and choose **Initialize Disk**, choosing **GPT**.",
        "Right-click the unallocated space and choose **New Simple Volume**, then follow the wizard and format as **NTFS**."
      ]),
      NOS.task("format", "Format a drive", "File Explorer or Disk Management", "Erase and set up a file system.", [
        "**Back up** anything you need first.",
        "In File Explorer, right-click the drive and choose **Format**.",
        "Pick the **File system** (NTFS or FAT32) and tick **Quick Format** (untick for a full format).",
        "Click **Start**."
      ]),
      NOS.task("bitlocker", "Turn on BitLocker", "Control Panel > BitLocker Drive Encryption", "Encrypt a drive.", [
        "Search for **Manage BitLocker** and open it.",
        "Click **Turn on BitLocker** for the drive.",
        "Choose how to unlock it (password or smart card) and **save the recovery key**.",
        "Choose encrypt used space only or the entire drive and click **Start encrypting**."
      ], "BitLocker needs Windows Pro or Enterprise."),
      NOS.task("backup", "Set up File History", "Control Panel > File History", "Back up files to an external drive.", [
        "Connect an external drive.",
        "Open **Control Panel > System and Security > File History**.",
        "Select the drive and click **Turn on**."
      ])
    ]
  });
})();
