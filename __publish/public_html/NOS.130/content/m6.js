/* Module 6 - Lesson 10: Accounts and access control */
(() => {
  const { note, Q, task } = NOS;
  NOS.addChapter({
    id: "m6", num: 6, title: "User Accounts & Access Control",
    summary: "Local, Microsoft and domain accounts, UAC, permissions, auditing, AppLocker",
    notes: [
      note("types", "Account types", "admin", [
        "- **Local account**: stored on the PC only, not tied to the cloud",
        "- **Microsoft account**: syncs settings and files via the cloud, works with OneDrive and the Store",
        "- **Domain account**: managed centrally by an administrator through Active Directory",
        "Account roles are **Administrator** (full control) and **Standard user** (limited changes)."
      ]),
      note("manage", "Creating and managing accounts", "admin", [
        "Manage accounts in **Settings > Accounts** (family and other users) or with **Computer Management > Local Users and Groups**. Standard users are safer for everyday use."
      ]),
      note("uac", "User Account Control (UAC)", "admin", [
        "**UAC** prompts for confirmation or admin credentials before changes that need elevation. It helps stop malware from making silent system changes. The **notification level** is adjustable, and the prompt is shown on the **secure desktop**."
      ]),
      note("access", "Access control and permissions", "admin", [
        "**NTFS permissions** control who can read, write, modify or fully control files and folders, using **ACLs**. Permissions are **inherited** from parent folders. Set them in **Properties > Security**.",
        "Principle of **least privilege**: grant only the access needed."
      ]),
      note("audit", "Auditing and AppLocker", "admin", [
        "**Auditing** records successful and failed access attempts in the **Security log** (Event Viewer). **AppLocker** controls which apps and scripts can run based on **publisher, path or file hash** rules. It is available in **Enterprise and Education** editions."
      ])
    ],
    glossary: [
      ["Local account", "Account stored only on one PC.", ""],
      ["Microsoft account", "Cloud-linked account that syncs settings.", ""],
      ["Domain account", "Account managed in Active Directory.", ""],
      ["UAC", "User Account Control; prompts before elevated actions.", ""],
      ["ACL", "Access control list defining permissions.", ""],
      ["NTFS permissions", "File and folder permissions on NTFS volumes.", ""],
      ["Least privilege", "Give only the access needed.", ""],
      ["AppLocker", "Policy that allows or blocks apps and scripts.", ""],
      ["Auditing", "Logging access attempts to the Security log.", ""]
    ],
    cards: [
      ["Three Windows account types?", "Local, Microsoft, domain."],
      ["What does UAC do?", "Prompts for approval before changes that need administrator rights."],
      ["Where do you set NTFS permissions?", "File/folder Properties > Security."],
      ["Where are audit events recorded?", "The Security log in Event Viewer."],
      ["What kind of rules does AppLocker use?", "Publisher, path and file hash."],
      ["What is least privilege?", "Granting only the minimum access required."],
      ["Which tool manages local users and groups?", "Computer Management > Local Users and Groups (lusrmgr.msc)."]
    ],
    quiz: [
      Q("Which account type is managed centrally by an administrator?", "Domain account", "Domain accounts use Active Directory.", "Local account", "Microsoft account", "Guest account"),
      Q("What does UAC protect against?", "Silent system changes by malware", "It prompts before elevation.", "Hard drive failure", "Slow boot", "Phishing emails"),
      Q("Where do you set NTFS permissions?", "Properties > Security", "That tab shows the ACL.", "Settings > Privacy", "Task Manager", "Disk Cleanup"),
      Q("Where does auditing write events?", "Security log", "View in Event Viewer.", "Setup log", "Application log only", "Registry"),
      Q("Which feature restricts which apps can run by publisher or hash?", "AppLocker", "AppLocker rules.", "SmartScreen", "BitLocker", "Quick Settings"),
      Q("What is the principle of least privilege?", "Grant only the access required", "Reduces damage from mistakes or malware.", "Give admins to everyone", "Disable all accounts", "Share passwords")
    ],
    commands: [
      { name: "net user", shell: "CMD (admin)", desc: "Create or manage local users.", syntax: "net user <name> <pwd> /add", examples: ["net user student P@ssw0rd /add", "net user student /delete"] },
      { name: "net localgroup", shell: "CMD (admin)", desc: "Manage local groups.", syntax: "net localgroup <group> <user> /add", examples: ["net localgroup Administrators student /add"] },
      { name: "whoami", shell: "CMD / PowerShell", desc: "Show current user, groups or privileges.", syntax: "whoami [/groups] [/priv]", examples: ["whoami /groups"] },
      { name: "icacls", shell: "CMD", desc: "View or change NTFS permissions.", syntax: "icacls <path> [/grant user:perm]", examples: ["icacls C:\\Data /grant student:(M)"] },
      { name: "New-LocalUser", shell: "PowerShell (admin)", desc: "Create a local user.", syntax: "New-LocalUser -Name <n> -Password <SecureString>", examples: ["New-LocalUser -Name student -NoPassword"] },
      { name: "lusrmgr.msc", shell: "Run", desc: "Local Users and Groups console.", syntax: "lusrmgr.msc", examples: [] }
    ],
    tasks: [
      NOS.task("new-user", "Create a local standard user", "Settings > Accounts > Other users", "Add an account.", [
        "Open **Settings > Accounts > Other users**.",
        "Click **Add account** and choose **I don't have this person's sign-in information**, then **Add a user without a Microsoft account**.",
        "Enter a name and password and security questions."
      ]),
      NOS.task("make-admin", "Change a user to Administrator", "Settings > Accounts > Other users", "Elevate a user.", [
        "Open **Settings > Accounts > Other users**.",
        "Select the account and click **Change account type**.",
        "Set **Administrator** and click **OK**."
      ]),
      NOS.task("uac", "Adjust UAC", "Control Panel > User Accounts", "Change the notification level.", [
        "Search for **Change User Account Control settings**.",
        "Move the slider to the desired level.",
        "Click **OK** and approve the prompt."
      ]),
      NOS.task("ntfs", "Set NTFS permissions on a folder", "Folder Properties > Security", "Control access.", [
        "Right-click the folder > **Properties > Security**.",
        "Click **Edit** and **Add** a user or group.",
        "Tick **Allow** or **Deny** boxes such as **Read** or **Modify**, then **OK**."
      ])
    ]
  });
})();
