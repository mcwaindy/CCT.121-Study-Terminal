/* Module 5 - Lesson 9: File Explorer */
(() => {
  const { note, Q, task } = NOS;
  NOS.addChapter({
    id: "m5", num: 5, title: "File Explorer, Search & Recovery",
    summary: "Navigation, search and indexing, OneDrive, Recycle Bin, file recovery",
    notes: [
      note("fe", "File Explorer basics", "files", [
        "**File Explorer** (open with **Win + E**) has a **navigation pane**, **Quick access** for pinned and recent folders, and **This PC** for drives. Use the **View** menu to change layouts, show **file extensions** and **hidden items**, and use the **preview pane**."
      ]),
      note("search", "Search and indexing", "files", [
        "The search box finds files by name, content, type or date. The **Windows Search index** speeds up searching. Manage it in **Indexing Options** by choosing which locations are indexed.",
        "Search filters include `kind:`, `size:` and `datemodified:`, and wildcards like `*.docx`."
      ]),
      note("onedrive", "OneDrive integration", "files", [
        "**OneDrive** syncs folders to the cloud. **Files On-Demand** shows cloud files as placeholders that download when opened. Status icons show cloud only, synced or syncing. OneDrive keeps **version history** and lets you share files by link."
      ]),
      note("recycle", "Deleting and the Recycle Bin", "files", [
        "Deleted files go to the **Recycle Bin**, where they can be **restored**. Use **Shift + Delete** to bypass it (permanent). You can set the Recycle Bin size and have **Storage Sense** empty it automatically."
      ]),
      note("recover", "Recovering files", "files", [
        "Recovery options: **Recycle Bin**, **Previous Versions** (right-click > Properties), **File History**, **OneDrive version history and recycle bin**, and **Windows File Recovery** (`winfr`) for permanently deleted files."
      ])
    ],
    glossary: [
      ["Quick access", "File Explorer home with pinned and recent folders.", ""],
      ["Indexing", "Background catalog of files that speeds up search.", ""],
      ["Files On-Demand", "OneDrive feature showing cloud placeholders without using disk space.", ""],
      ["Recycle Bin", "Holding area for deleted files before permanent removal.", ""],
      ["Previous Versions", "Restore older versions of files from restore points or File History.", ""],
      ["winfr", "Windows File Recovery command-line tool.", ""]
    ],
    cards: [
      ["Shortcut to open File Explorer?", "Win + E."],
      ["Where do you manage which folders are indexed?", "Indexing Options."],
      ["What is OneDrive Files On-Demand?", "Cloud files appear as placeholders and download when opened."],
      ["How do you permanently delete bypassing Recycle Bin?", "Shift + Delete."],
      ["Command-line tool to recover deleted files?", "winfr (Windows File Recovery)."],
      ["Where do you restore an older file version?", "Right-click > Properties > Previous Versions."]
    ],
    quiz: [
      Q("Which shortcut opens File Explorer?", "Win + E", "Win + E opens File Explorer.", "Win + R", "Win + L", "Win + D"),
      Q("What speeds up Windows file search?", "The search index", "Indexing catalogs files in advance.", "Defragmentation", "BitLocker", "Focus Assist"),
      Q("What does Files On-Demand do?", "Shows cloud files as placeholders", "Files download when opened.", "Encrypts the drive", "Moves files to the Recycle Bin", "Blocks sync"),
      Q("How do you delete a file without sending it to the Recycle Bin?", "Shift + Delete", "That bypasses the bin.", "Ctrl + Delete", "Alt + Delete", "Win + Delete"),
      Q("Which tool recovers permanently deleted files from the command line?", "winfr", "Windows File Recovery.", "chkdsk", "winget", "robocopy"),
      Q("Where do you choose indexed locations?", "Indexing Options", "Control Panel > Indexing Options.", "Device Manager", "Task Scheduler", "Services")
    ],
    commands: [
      { name: "explorer", shell: "CMD / Run", desc: "Open File Explorer, optionally at a path.", syntax: "explorer [path]", examples: ["explorer C:\\Users"] },
      { name: "winfr", shell: "CMD (admin)", desc: "Recover deleted files.", syntax: "winfr <source>: <dest>: /regular /n <path>", examples: ["winfr C: D: /regular /n \\Users\\Me\\Documents\\"] },
      { name: "robocopy", shell: "CMD", desc: "Robust file copy.", syntax: "robocopy <src> <dst> [/E] [/MIR]", examples: ["robocopy C:\\Data D:\\Backup /E"] },
      { name: "dir", shell: "CMD", desc: "List files and folders.", syntax: "dir [/a] [/s] [/b]", examples: ["dir /s /b *.docx"] },
      { name: "Get-ChildItem", shell: "PowerShell", desc: "List files (alias: ls, dir).", syntax: "Get-ChildItem [-Recurse] [-Filter]", examples: ["Get-ChildItem -Recurse -Filter *.docx"] }
    ],
    tasks: [
      NOS.task("ext", "Show file extensions and hidden items", "File Explorer > View", "Make file types visible.", [
        "Open File Explorer.",
        "Click **View > Show**.",
        "Tick **File name extensions** and **Hidden items**."
      ]),
      NOS.task("index", "Change which folders are indexed", "Control Panel > Indexing Options", "Tune search.", [
        "Open **Control Panel > Indexing Options**.",
        "Click **Modify** and tick the locations to index.",
        "Click **OK**. Use **Advanced > Rebuild** if results look wrong."
      ]),
      NOS.task("prev", "Restore a previous version of a file", "File Properties", "Roll back changes.", [
        "Right-click the file and choose **Properties**.",
        "Open **Previous Versions**.",
        "Select a version and click **Restore**."
      ]),
      NOS.task("recycle", "Restore a deleted file", "Recycle Bin", "Undo a delete.", [
        "Open the **Recycle Bin** on the desktop.",
        "Right-click the file and choose **Restore**."
      ])
    ]
  });
})();
