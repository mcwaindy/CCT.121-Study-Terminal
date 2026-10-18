using NOS._120_Study_Terminal.Models;

namespace NOS._120_Study_Terminal.Services;

/// <summary>Lesson-derived command reference and quiz bank for NOS.120 Modules 1-6 and 8.</summary>
public static class StudyContent
{
    private static LinuxCommand C(int m, string name, string desc, string syntax, string[] examples, string[] flags, params string[] concepts) => new()
    {
        Module = "Module" + m,
        Name = name,
        Description = desc,
        Syntax = syntax,
        Examples = examples.ToList(),
        CommonFlags = flags.ToList(),
        RelatedConcepts = concepts.ToList()
    };

    private static QuizQuestion MC(string text, string correct, string explanation, params string[] wrong)
    {
        var options = wrong.ToList();
        options.Insert(Math.Abs(text.Length) % (wrong.Length + 1), correct);
        return new QuizQuestion { Text = text, Type = "multiple-choice", Options = options, CorrectAnswer = correct, Explanation = explanation };
    }

    private static QuizQuestion TF(string text, bool answer, string explanation) => new()
    {
        Text = text,
        Type = "true-false",
        Options = new() { "True", "False" },
        CorrectAnswer = answer ? "True" : "False",
        Explanation = explanation
    };

    private static string[] A(params string[] items) => items;

    public static List<LinuxCommand> BuildCommands() => new()
    {
        // ---------- Module 1 ----------
        C(1, "uname", "Print kernel and system information", "uname [OPTIONS]", A("uname -r", "uname -a"), A("-r: kernel release (e.g. 5.15.16)", "-a: all information", "-m: machine architecture", "-s: kernel name"), "Kernel version", "Architectures"),
        C(1, "arch", "Print the machine hardware architecture", "arch", A("arch"), A(), "x86_64 / ARM64 / RISC-V"),
        C(1, "ps", "Show running processes (programs loaded into memory)", "ps [OPTIONS]", A("ps -ef", "ps aux"), A("-e: every process", "-f: full format", "aux: BSD-style all users"), "Processes", "Daemons"),
        C(1, "top", "Interactive real-time view of processes and resource use", "top", A("top"), A("q: quit"), "Processes"),
        C(1, "whoami", "Print the current username", "whoami", A("whoami"), A(), "Users"),
        C(1, "docker", "Run and manage containers that share the host kernel", "docker [COMMAND]", A("docker run -d nginx", "docker ps"), A("run: start a container", "ps: list containers"), "Containers", "Virtualization"),
        C(1, "dnf", "Red Hat family package manager (RPM packages)", "dnf [install|remove|update] PACKAGE", A("dnf install squid", "dnf update"), A("install", "remove", "update"), "RPM", "Package managers"),
        C(1, "apt", "Debian family package manager (DPM / .deb packages)", "apt [install|remove|update] PACKAGE", A("apt install squid", "apt update"), A("install", "remove", "update"), "DPM", "Package managers"),
        C(1, "tar", "Create or extract tarball archives", "tar [OPTIONS] ARCHIVE [FILES]", A("tar -czf backup.tar.gz /data", "tar -xzf backup.tar.gz"), A("-c: create", "-x: extract", "-z: gzip", "-f: archive file name", "-v: verbose"), "Tarball", "Package managers"),

        // ---------- Module 2 ----------
        C(2, "echo", "Print text or variable values to standard output", "echo [STRING]", A("echo $PATH", "echo \"Hello $USER\""), A("-e: interpret backslash escapes", "-n: no trailing newline"), "Variables", "Quoting"),
        C(2, "man", "Display the manual page for a command", "man [SECTION] COMMAND", A("man ls", "man 5 passwd"), A("-k: keyword search (same as apropos)", "Space: next page", "q: quit"), "Help systems"),
        C(2, "info", "Display GNU info documentation (more detailed than man)", "info COMMAND", A("info coreutils"), A(), "Help systems"),
        C(2, "apropos", "Search man page names and descriptions by keyword", "apropos KEYWORD", A("apropos partition"), A(), "Help systems"),
        C(2, "whatis", "Show a one-line description of a command", "whatis COMMAND", A("whatis ls"), A(), "Help systems"),
        C(2, "history", "List previously entered commands", "history [N]", A("history", "history 20", "!!  (repeat last command)", "!42 (run entry 42)"), A("-c: clear history"), "Shell history"),
        C(2, "alias", "Create a shortcut for a command", "alias NAME='COMMAND'", A("alias ll='ls -l'", "alias"), A("-p: print all aliases"), "Shell customization"),
        C(2, "unalias", "Remove an alias", "unalias NAME", A("unalias ll"), A("-a: remove all"), "Shell customization"),
        C(2, "export", "Make a shell variable available to child processes", "export NAME=VALUE", A("export EDITOR=vim", "export PATH=$PATH:/opt/bin"), A(), "Environment variables"),
        C(2, "env", "Display the environment variables", "env", A("env"), A(), "Environment variables"),
        C(2, "su", "Switch to another user account", "su [-] [USER]", A("su -", "su - user1"), A("-: start a login shell"), "Privilege"),
        C(2, "sudo", "Run a single command as root or another user", "sudo COMMAND", A("sudo dnf install vim"), A("-i: root login shell", "-u USER: run as USER"), "Privilege", "/etc/sudoers"),
        C(2, "ssh", "Open a secure remote shell", "ssh [USER@]HOST", A("ssh user1@192.168.1.10"), A("-p PORT: non-default port"), "Remote administration"),
        C(2, "shutdown", "Schedule a system halt, power-off, or reboot", "shutdown [OPTIONS] TIME [MESSAGE]", A("shutdown -h now", "shutdown -r +10 \"Rebooting\"", "shutdown -c"), A("-h: halt/power off", "-r: reboot", "-c: cancel pending shutdown"), "Shutdown"),
        C(2, "reboot", "Restart the system", "reboot", A("reboot"), A(), "Shutdown"),
        C(2, "poweroff", "Power the system off", "poweroff", A("poweroff"), A(), "Shutdown"),
        C(2, "wall", "Broadcast a message to all logged-in users", "wall MESSAGE", A("wall \"Maintenance at noon\""), A(), "Shutdown"),
        C(2, "free", "Show memory and swap usage", "free [OPTIONS]", A("free -h"), A("-h: human-readable", "-m: megabytes"), "Swap", "Memory"),

        // ---------- Module 3 ----------
        C(3, "pwd", "Print the current working directory", "pwd", A("pwd"), A(), "Paths"),
        C(3, "cd", "Change directory", "cd [DIRECTORY]", A("cd /etc", "cd ..", "cd ~", "cd -"), A(), "Absolute vs relative paths"),
        C(3, "ls", "List directory contents", "ls [OPTIONS] [PATH]", A("ls -la /etc", "ls -lh", "ls -F", "ls -R /var/log"), A("-l: long format", "-a: include hidden files", "-h: human-readable sizes", "-F: append type indicators", "-R: recursive", "-d: list directory itself"), "File types", "Hidden files"),
        C(3, "file", "Determine a file's type from its content", "file FILE", A("file /bin/ls", "file notes.txt"), A(), "File types"),
        C(3, "stat", "Show detailed file metadata (inode, size, times, permissions)", "stat FILE", A("stat /etc/passwd"), A(), "Inodes"),
        C(3, "cat", "Concatenate and display file contents", "cat [OPTIONS] FILE...", A("cat /etc/os-release", "cat -n file"), A("-n: number lines"), "Viewing files"),
        C(3, "tac", "Display a file with lines in reverse order", "tac FILE", A("tac log.txt"), A(), "Viewing files"),
        C(3, "head", "Display the first lines of a file", "head [-n N] FILE", A("head -n 5 /etc/passwd"), A("-n N: number of lines (default 10)"), "Viewing files"),
        C(3, "tail", "Display the last lines of a file", "tail [-n N] FILE", A("tail -n 20 /var/log/messages", "tail -f /var/log/messages"), A("-n N: number of lines", "-f: follow as file grows"), "Viewing files", "Logs"),
        C(3, "less", "Page through a file forward and backward", "less FILE", A("less /etc/services"), A("/text: search forward", "q: quit", "Space: next page"), "Viewing files"),
        C(3, "more", "Page through a file forward only", "more FILE", A("more /etc/services"), A(), "Viewing files"),
        C(3, "strings", "Print readable text from a binary file", "strings FILE", A("strings /bin/ls"), A(), "Viewing binary files"),
        C(3, "od", "Dump a file in octal or other formats", "od [OPTIONS] FILE", A("od -c file", "od -x file"), A("-c: characters", "-x: hexadecimal"), "Viewing binary files"),
        C(3, "wc", "Count lines, words, and bytes", "wc [OPTIONS] FILE", A("wc -l /etc/passwd"), A("-l: lines", "-w: words", "-c: bytes"), "Text filters"),
        C(3, "sort", "Sort lines of text", "sort [OPTIONS] FILE", A("sort names.txt", "sort -n -r nums.txt"), A("-n: numeric", "-r: reverse", "-u: unique"), "Text filters"),
        C(3, "cut", "Extract fields or columns from each line", "cut -d DELIM -f FIELDS FILE", A("cut -d: -f1 /etc/passwd"), A("-d: delimiter", "-f: field list"), "Text filters"),
        C(3, "diff", "Compare two files line by line", "diff FILE1 FILE2", A("diff old.conf new.conf"), A("-u: unified format"), "Text filters"),
        C(3, "grep", "Search text for lines matching a pattern (regex)", "grep [OPTIONS] PATTERN [FILE...]", A("grep root /etc/passwd", "grep -i error log", "grep -v '^#' conf", "grep -rn 'PATH' /etc"), A("-i: ignore case", "-v: invert match", "-r: recurse", "-n: line numbers", "-c: count", "-E: extended regex"), "Regular expressions"),
        C(3, "tee", "Write output to both a file and the screen", "COMMAND | tee FILE", A("ls | tee list.txt"), A("-a: append"), "Redirection"),
        C(3, "vi", "Modal text editor available on virtually every system", "vi FILE", A("vi /etc/hosts"), A("i: insert mode", "Esc: command mode", ":w save", ":q quit", ":wq save and quit", ":q! quit without saving", "dd delete line", "yy yank line", "p paste"), "Text editors"),
        C(3, "nano", "Simple beginner-friendly text editor", "nano FILE", A("nano notes.txt"), A("Ctrl+O: write out", "Ctrl+X: exit", "Ctrl+W: search"), "Text editors"),

        // ---------- Module 4 ----------
        C(4, "mkdir", "Create directories", "mkdir [OPTIONS] DIR", A("mkdir projects", "mkdir -p a/b/c"), A("-p: create parent directories"), "File management"),
        C(4, "rmdir", "Remove empty directories", "rmdir DIR", A("rmdir olddir"), A("-p: remove parents too"), "File management"),
        C(4, "touch", "Create an empty file or update timestamps", "touch FILE", A("touch notes.txt"), A(), "File management"),
        C(4, "cp", "Copy files and directories", "cp [OPTIONS] SOURCE DEST", A("cp a.txt b.txt", "cp -r dir1 dir2", "cp -p file /backup"), A("-r: recursive", "-p: preserve attributes", "-i: prompt before overwrite", "-a: archive"), "File management"),
        C(4, "mv", "Move or rename files", "mv [OPTIONS] SOURCE DEST", A("mv old.txt new.txt", "mv file /tmp"), A("-i: prompt before overwrite"), "File management"),
        C(4, "rm", "Remove files and directories", "rm [OPTIONS] FILE", A("rm file", "rm -r dir", "rm -i file"), A("-r: recursive", "-f: force", "-i: interactive"), "File management"),
        C(4, "unlink", "Remove a single file name", "unlink FILE", A("unlink oldlink"), A(), "File management", "Links"),
        C(4, "find", "Search the live filesystem by criteria", "find START [CRITERIA]", A("find /etc -name inittab", "find /etc -name \"host*\"", "find /var -type f -size +8192k"), A("-name: match file name", "-type d|f: directory or file", "-size +Nk: larger than N kilobytes"), "File searching"),
        C(4, "locate", "Fast file search using a prebuilt database", "locate PATTERN", A("locate passwd"), A("-i: ignore case"), "File searching", "updatedb"),
        C(4, "updatedb", "Rebuild the locate database", "updatedb", A("sudo updatedb"), A(), "File searching", "/etc/updatedb.conf"),
        C(4, "which", "Show the path of an executable found in $PATH (also aliases)", "which COMMAND", A("which ls"), A(), "File searching", "$PATH"),
        C(4, "type", "Show how the shell interprets a command (first match only)", "type COMMAND", A("type ls"), A(), "File searching"),
        C(4, "whereis", "Locate a command's binary, man pages, and info pages", "whereis COMMAND", A("whereis ls"), A(), "File searching"),
        C(4, "ln", "Create hard or symbolic links", "ln [-s] TARGET LINK", A("ln file1 file2", "ln -s file3 file4", "ls -li"), A("-s: symbolic link"), "Links", "Inodes"),
        C(4, "chmod", "Change permission mode (symbolic or octal)", "chmod MODE FILE", A("chmod 755 script.sh", "chmod u+x script.sh", "chmod go-w file", "chmod u+s file", "chmod +t /shared"), A("r=4 w=2 x=1", "u/g/o/a: user, group, other, all", "-R: recursive", "u+s: SUID  g+s: SGID  +t: sticky"), "Permissions", "SUID/SGID/Sticky"),
        C(4, "chown", "Change file owner and optionally group", "chown USER[:GROUP] FILE", A("chown user1 file", "chown user1:staff file", "chown -R user1 dir"), A("-R: recursive"), "Ownership"),
        C(4, "chgrp", "Change group ownership", "chgrp GROUP FILE", A("chgrp staff file"), A("-R: recursive"), "Ownership"),
        C(4, "groups", "List group memberships (primary group first)", "groups [USER]", A("groups"), A(), "Ownership"),
        C(4, "id", "Show UID, GID, and groups for a user", "id [USER]", A("id", "id user1"), A(), "Ownership"),
        C(4, "umask", "Show or set default permission mask for new files", "umask [MASK]", A("umask", "umask 022"), A("Default max: files 666, directories 777", "022 gives files 644, dirs 755"), "Permissions", "Defaults"),
        C(4, "getfacl", "Display access control lists", "getfacl FILE", A("getfacl file"), A(), "ACLs"),
        C(4, "setfacl", "Set access control lists for specific users/groups", "setfacl -m u:USER:PERMS FILE", A("setfacl -m u:user1:rw file", "setfacl -x u:user1 file"), A("-m: modify", "-x: remove entry", "-b: remove all"), "ACLs"),
        C(4, "lsattr", "List extended file attributes", "lsattr FILE", A("lsattr file"), A(), "File attributes"),
        C(4, "chattr", "Change extended file attributes", "chattr [+|-]ATTR FILE", A("chattr +i file", "chattr -i file"), A("+i: immutable", "+a: append only"), "File attributes"),

        // ---------- Module 5 ----------
        C(5, "lsblk", "List block devices and their mount points", "lsblk [OPTIONS]", A("lsblk", "lsblk -f"), A("-f: show filesystems, labels, UUIDs"), "Device files"),
        C(5, "blkid", "Show filesystem type, label, and UUID of block devices", "blkid [DEVICE]", A("blkid /dev/sda1"), A(), "UUIDs", "fstab"),
        C(5, "fdisk", "Interactive MBR/GPT partition editor", "fdisk DEVICE", A("fdisk /dev/sda", "fdisk -l"), A("m: help", "p: print", "n: new", "d: delete", "t: type", "w: write and exit", "-l: list"), "Partitioning"),
        C(5, "cfdisk", "Semi-graphical partition editor", "cfdisk DEVICE", A("cfdisk /dev/sdb"), A(), "Partitioning"),
        C(5, "gdisk", "GPT-only partition editor with fdisk-like interface", "gdisk DEVICE", A("gdisk /dev/sdb"), A(), "Partitioning", "GPT"),
        C(5, "parted", "GNU Parted partition tool for MBR and GPT", "parted DEVICE", A("parted /dev/sdb print"), A(), "Partitioning"),
        C(5, "partprobe", "Tell the kernel to re-read the partition table", "partprobe [DEVICE]", A("partprobe"), A(), "Partitioning"),
        C(5, "mkfs", "Create a filesystem on a partition", "mkfs -t TYPE DEVICE", A("mkfs -t ext4 /dev/sda5", "mkfs.xfs /dev/sda6"), A("-t: filesystem type", "-L: label (ext4 uses e2label)"), "Filesystems"),
        C(5, "mkswap", "Prepare a partition or file as swap space", "mkswap DEVICE", A("mkswap /dev/sda4"), A(), "Swap"),
        C(5, "swapon", "Activate swap space", "swapon DEVICE", A("swapon /dev/sda4", "swapon -s"), A("-s: summary"), "Swap"),
        C(5, "swapoff", "Deactivate swap space", "swapoff DEVICE", A("swapoff /dev/sda4"), A(), "Swap"),
        C(5, "mount", "Attach a filesystem to the directory tree", "mount [-t TYPE] [-o OPTS] DEVICE DIR", A("mount /dev/sda5 /data", "mount -r /dev/cdrom /media/CD", "mount -o loop sample.iso /mnt", "mount -a"), A("-t: filesystem type", "-o: options", "-r: read-only", "-a: mount everything in /etc/fstab"), "Mounting", "/etc/fstab"),
        C(5, "umount", "Detach a mounted filesystem", "umount DIR|DEVICE", A("umount /data"), A(), "Mounting"),
        C(5, "eject", "Unmount and eject removable media", "eject DEVICE", A("eject /dev/cdrom"), A(), "Removable media"),
        C(5, "mkisofs", "Create an ISO image from a directory", "mkisofs -RJ -o IMAGE DIR", A("mkisofs -RJ -o newimage.iso /data"), A("-R: Rock Ridge", "-J: Joliet", "-o: output file"), "Removable media"),
        C(5, "df", "Report filesystem space usage", "df [OPTIONS]", A("df -h", "df -i"), A("-h: human-readable", "-i: inode usage", "-T: show type"), "Monitoring"),
        C(5, "du", "Report directory space usage", "du [OPTIONS] PATH", A("du -sh /var", "du -h /home"), A("-s: summary", "-h: human-readable"), "Monitoring"),
        C(5, "fsck", "Check and repair a filesystem (unmounted only)", "fsck [OPTIONS] DEVICE", A("fsck /dev/sda5", "fsck -y /dev/sda5"), A("-y: answer yes to all repairs", "-n: check only"), "Filesystem repair"),
        C(5, "e2fsck", "Check and repair ext2/3/4 filesystems", "e2fsck DEVICE", A("e2fsck -f /dev/sda5"), A("-f: force check"), "Filesystem repair"),
        C(5, "xfs_repair", "Check and repair XFS filesystems", "xfs_repair DEVICE", A("xfs_repair /dev/sda6"), A(), "Filesystem repair"),
        C(5, "tune2fs", "Adjust ext filesystem parameters", "tune2fs [OPTIONS] DEVICE", A("tune2fs -l /dev/sda5"), A("-l: list superblock info", "-L: set label"), "Filesystem tuning"),
        C(5, "pvcreate", "Initialize a physical volume for LVM", "pvcreate DEVICE", A("pvcreate /dev/sdb1"), A(), "LVM"),
        C(5, "vgcreate", "Create a volume group from physical volumes", "vgcreate VG PV...", A("vgcreate vg1 /dev/sdb1"), A(), "LVM"),
        C(5, "lvcreate", "Create a logical volume", "lvcreate -L SIZE -n NAME VG", A("lvcreate -L 10G -n data vg1"), A("-L: size", "-n: name"), "LVM"),
        C(5, "lvextend", "Grow a logical volume", "lvextend -L +SIZE LV", A("lvextend -L +5G /dev/vg1/data"), A("-r: resize filesystem too"), "LVM"),
        C(5, "pvs / vgs / lvs", "Summarize physical volumes, volume groups, logical volumes", "pvs | vgs | lvs", A("pvs", "vgs", "lvs"), A("pvdisplay, vgdisplay, lvdisplay give detailed output"), "LVM"),
        C(5, "resize2fs", "Resize an ext2/3/4 filesystem", "resize2fs DEVICE", A("resize2fs /dev/vg1/data"), A(), "LVM", "Filesystems"),
        C(5, "xfs_growfs", "Grow a mounted XFS filesystem", "xfs_growfs MOUNTPOINT", A("xfs_growfs /data"), A(), "LVM", "Filesystems"),
        C(5, "quotacheck", "Scan a filesystem and build quota files", "quotacheck [OPTIONS] FS", A("quotacheck -cug /home"), A(), "Quotas"),
        C(5, "quotaon", "Enable disk quotas", "quotaon FS", A("quotaon /home"), A(), "Quotas"),
        C(5, "edquota", "Edit a user's disk quota", "edquota USER", A("edquota user1"), A(), "Quotas"),
        C(5, "repquota", "Report quota usage for a filesystem", "repquota FS", A("repquota /home"), A(), "Quotas"),
        C(5, "fuser", "Identify processes using a file or mount point", "fuser -m MOUNT", A("fuser -m /data"), A("-m: mounted filesystem", "-k: kill processes"), "Mounting", "Troubleshooting"),

        // ---------- Module 6 ----------
        C(6, "lscpu", "Display CPU information", "lscpu", A("lscpu"), A(), "Hardware verification", "Virtualization"),
        C(6, "lsmem", "List available memory ranges", "lsmem", A("lsmem"), A(), "Hardware verification"),
        C(6, "lspci", "List PCI devices", "lspci", A("lspci", "lspci -v"), A("-v: verbose"), "Hardware verification"),
        C(6, "lsusb", "List USB devices", "lsusb", A("lsusb"), A(), "Hardware verification"),
        C(6, "lsscsi", "List SCSI/SATA devices", "lsscsi", A("lsscsi"), A(), "Hardware verification"),
        C(6, "lshw", "Detailed hardware inventory", "lshw [-short]", A("sudo lshw -short"), A("-short: brief summary"), "Hardware verification"),
        C(6, "dmidecode", "Read system hardware data from the BIOS/DMI tables", "dmidecode [-t TYPE]", A("sudo dmidecode -t memory"), A("-t: table type"), "Hardware verification"),
        C(6, "dmesg", "Show kernel ring buffer messages", "dmesg", A("dmesg | less", "dmesg | grep -i usb"), A(), "Hardware verification", "Troubleshooting"),
        C(6, "mdadm", "Create and manage Linux software RAID arrays", "mdadm [OPTIONS] DEVICE", A("mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc", "mdadm --detail /dev/md0"), A("--create", "--level=N", "--detail"), "RAID"),
        C(6, "virsh", "Manage libvirt virtual machines from the CLI", "virsh COMMAND [VM]", A("virsh list --all", "virsh start vm1"), A("list --all", "start", "shutdown"), "KVM/QEMU", "Virtualization"),
        C(6, "zpool", "Manage ZFS storage pools", "zpool COMMAND", A("zpool create tank /dev/sdb /dev/sdc", "zpool status"), A("create", "status", "list"), "ZFS"),
        C(6, "zfs", "Manage ZFS datasets and snapshots", "zfs COMMAND", A("zfs create tank/data", "zfs snapshot tank/data@snap1"), A("create", "snapshot", "list"), "ZFS"),
        C(6, "btrfs", "Manage Btrfs filesystems and subvolumes", "btrfs COMMAND", A("btrfs subvolume create /data/sub1", "btrfs filesystem show"), A("subvolume", "filesystem", "snapshot"), "Btrfs"),
        C(6, "iscsiadm", "Discover and log in to iSCSI SAN targets", "iscsiadm -m MODE", A("iscsiadm -m discovery -t sendtargets -p 192.168.1.50"), A("-m: mode", "-t: discovery type", "-p: portal"), "SAN"),

        // ---------- Module 8 ----------
        C(8, "grub-install", "Reinstall GRUB to the boot disk", "grub-install DEVICE", A("grub-install /dev/sda"), A(), "GRUB"),
        C(8, "grub2-mkconfig", "Regenerate grub.cfg from /etc/default/grub and /etc/grub.d", "grub2-mkconfig -o FILE", A("grub2-mkconfig -o /boot/grub2/grub.cfg"), A("-o: output file"), "GRUB2", "grub.cfg"),
        C(8, "dracut", "Rebuild the initramfs image", "dracut [--force] [IMAGE] [KERNEL]", A("dracut --force"), A("--force: overwrite existing image"), "initramfs"),
        C(8, "runlevel", "Show the previous and current SysV runlevel", "runlevel", A("runlevel"), A(), "SysV init"),
        C(8, "telinit", "Change the SysV runlevel", "telinit LEVEL", A("telinit 3", "telinit 6"), A(), "SysV init"),
        C(8, "service", "Start, stop, or restart SysV daemons", "service DAEMON ACTION", A("service cron restart"), A("start", "stop", "restart", "status"), "SysV init"),
        C(8, "chkconfig", "Configure SysV daemon startup per runlevel", "chkconfig [--list] DAEMON on|off", A("chkconfig cron on", "chkconfig --list"), A("--list: show runlevel states"), "SysV init"),
        C(8, "systemctl", "Manage systemd units and targets", "systemctl ACTION [UNIT]", A("systemctl status sshd", "systemctl enable --now httpd", "systemctl isolate multi-user.target", "systemctl set-default graphical.target", "systemctl get-default"), A("start/stop/restart/reload", "enable/disable", "is-enabled", "list-units", "list-unit-files", "isolate", "get-default / set-default"), "Systemd", "Targets"),
        C(8, "systemd-analyze", "Analyze boot performance", "systemd-analyze [blame|critical-chain]", A("systemd-analyze", "systemd-analyze blame", "systemd-analyze critical-chain"), A("blame: slowest units first", "critical-chain: critical boot path"), "Systemd"),
        C(8, "journalctl", "Query the systemd journal", "journalctl [OPTIONS]", A("journalctl -b", "journalctl -u sshd"), A("-b: current boot", "-u: unit", "-f: follow"), "Systemd", "Logs"),
        C(8, "date", "Show or set the system date and time", "date [+FORMAT]", A("date", "date +%Y-%m-%d"), A("+FORMAT: custom output"), "Time"),
        C(8, "hwclock", "Read or set the hardware clock", "hwclock [OPTIONS]", A("hwclock --show", "hwclock --systohc"), A("--show: display RTC", "--systohc: system to RTC", "--hctosys: RTC to system"), "Time"),
        C(8, "timedatectl", "Show or set time, date, and time zone (systemd)", "timedatectl [COMMAND]", A("timedatectl", "timedatectl set-timezone America/Chicago", "timedatectl list-timezones"), A("set-time", "set-timezone", "set-ntp"), "Time", "Localization"),
        C(8, "locale", "Show current locale settings", "locale", A("locale", "locale -a"), A("-a: list available locales"), "Localization"),
        C(8, "localectl", "Show or set system locale and keyboard layout", "localectl [COMMAND]", A("localectl status", "localectl set-locale LANG=en_US.UTF-8"), A("status", "set-locale", "set-keymap"), "Localization"),
        C(8, "cal", "Display a calendar", "cal [MONTH] [YEAR]", A("cal", "cal 12 2025"), A(), "Time"),
        C(8, "startx", "Start the X Window System from a console", "startx", A("startx"), A(), "X Windows"),
        C(8, "xrandr", "Query and configure X display outputs", "xrandr", A("xrandr"), A(), "X Windows")
    };

    public static List<Quiz> BuildQuizzes()
    {
        var modules = new List<Quiz>
        {
            new()
            {
                Module = "Module1", Title = "Module 1 Quiz - Linux Fundamentals",
                Questions = new()
                {
                    MC("What does the shared Linux kernel define?", "Linux itself; the software layered on top differentiates distros", "The kernel is common to all distros; distributions differ by the software layered on it.", "A specific desktop environment", "The package manager used", "The shell syntax"),
                    MC("In kernel version 5.15.16, which number is the minor version?", "15", "Format is major.minor.revision.", "5", "16", "5.15"),
                    TF("A development kernel is identified by an -rc (release candidate) suffix.", true, "Production kernels have no suffix; development kernels carry -rc."),
                    MC("Who wrote the first UNIX in 1969?", "Ken Thompson", "Ken Thompson wrote UNIX on a DEC PDP-7; Ritchie later invented C.", "Linus Torvalds", "Richard Stallman", "Dennis Ritchie"),
                    MC("Which license is a copyleft license requiring derivatives to remain open?", "GPL", "GPL from the FSF is copyleft; permissive licenses have fewer restrictions.", "Freeware", "Shareware", "Permissive"),
                    MC("Which package format is used by Debian, Ubuntu, and Mint?", "DPM (.deb)", "RPM is the Red Hat family; Debian-derived distros use .deb.", "RPM (.rpm)", "Tarball (.tar.gz)", "Snap only"),
                    TF("A tarball installation updates the package manager's software database.", false, "Tarballs require manual installation and do not update the database."),
                    MC("How do containers differ from virtual machines?", "Containers share the host kernel", "No separate guest kernel makes containers lighter than VMs.", "Containers need a hypervisor per instance", "Containers each run their own kernel", "Containers only run on bare metal"),
                    MC("In a Beowulf cluster, which framework handles inter-node communication?", "MPI", "Message Passing Interface, e.g. OpenMPI.", "NAT", "SIEM", "NFS"),
                    MC("What is the correct CI/CD order?", "Push, CI, orchestration, build automation, CD", "Developer push, review/tests, retrieve/compile, image build, deploy.", "CD, CI, push, build, orchestration", "Build, push, CI, CD, orchestration", "Orchestration, push, CD, CI, build"),
                    MC("Which tool is the common Linux proxy server that also caches?", "Squid", "Squid maintains a NAT table and caches resources.", "iptables", "OSSIM", "Podman")
                }
            },
            new()
            {
                Module = "Module2", Title = "Module 2 Quiz - Installation & Shell Fundamentals",
                Questions = new()
                {
                    MC("Which command shows a manual page?", "man", "man displays manual pages; info shows GNU info docs.", "apropos", "whatis", "history"),
                    MC("Which command searches manual page descriptions by keyword?", "apropos", "man -k is equivalent.", "whatis", "info", "type"),
                    TF("The command history can be re-run with !! to repeat the last command.", true, "!! repeats the previous command; !N runs entry N."),
                    MC("What does single quoting do in Bash?", "Prevents all expansion", "Single quotes are literal; double quotes still allow variable expansion.", "Allows variable expansion", "Runs the command in the background", "Escapes only the dollar sign"),
                    MC("Which command makes a variable available to child processes?", "export", "Without export the variable stays local to the current shell.", "alias", "set -n", "source"),
                    MC("Which command cancels a pending shutdown?", "shutdown -c", "-c cancels a scheduled shutdown.", "shutdown -r", "shutdown -h now", "wall"),
                    MC("What does su - do differently from plain su?", "Starts a login shell with the target user's environment", "The dash gives a full login environment.", "Runs a single command", "Locks the account", "Edits /etc/sudoers"),
                    MC("Which command shows memory and swap usage?", "free", "free -h gives human-readable output.", "df", "du", "top -s"),
                    TF("An alias created at the prompt persists across logins unless added to a startup file.", false, "Aliases last for the session unless placed in a shell startup file."),
                    MC("What does $PATH contain?", "Colon-delimited directories searched for executables", "The shell searches them in order.", "The current directory only", "The user's home directory", "A list of aliases"),
                    MC("Which remote shell tool provides encrypted access?", "ssh", "ssh replaces insecure telnet.", "telnet", "wall", "rsh")
                }
            },
            new()
            {
                Module = "Module3", Title = "Module 3 Quiz - The Linux Filesystem",
                Questions = new()
                {
                    MC("What does FHS stand for?", "Filesystem Hierarchy Standard", "FHS defines the directory layout.", "File Hierarchy System", "Fast Hardware System", "Flexible File Setup"),
                    MC("Which directory holds system configuration files?", "/etc", "Configuration lives in /etc.", "/bin", "/var", "/home"),
                    MC("Which command prints the first lines of a file?", "head", "head shows 10 lines by default.", "tail", "tac", "cat -r"),
                    MC("Which option follows a growing log file?", "tail -f", "-f follows new lines.", "head -f", "less -n", "cat -f"),
                    MC("Which command shows a file in reverse line order?", "tac", "tac is cat spelled backwards.", "rev", "sort -r", "head -r"),
                    MC("Which command prints readable text from a binary?", "strings", "Useful for inspecting executables.", "od", "cat", "file"),
                    MC("What does grep -v do?", "Inverts the match", "Shows lines that do not match.", "Counts matches", "Ignores case", "Recurses directories"),
                    TF("Hidden files in Linux begin with a dot.", true, "ls -a is needed to display them."),
                    MC("Which vi command saves and quits?", ":wq", ":q! quits without saving.", ":q!", ":w only", "dd"),
                    MC("Which command displays inode, size, and timestamps?", "stat", "stat gives detailed metadata.", "file", "ls -F", "wc"),
                    MC("Which ls option appends type indicators like / and @?", "-F", "A slash marks directories; @ marks symlinks.", "-R", "-d", "-h")
                }
            },
            new()
            {
                Module = "Module4", Title = "Module 4 Quiz - File Management, Permissions & Links",
                Questions = new()
                {
                    MC("What does chmod 755 grant?", "owner rwx, group r-x, other r-x", "7=rwx, 5=r-x.", "owner rw-, group r--, other r--", "all users rwx", "owner r-x only"),
                    MC("With umask 022, what are default new-file permissions?", "644", "Files start at 666; directories at 777.", "755", "666", "600"),
                    MC("Which find command finds files larger than 8192 KB under /var?", "find /var -type f -size +8192k", "-size +Nk matches larger than N kilobytes.", "find /var -size 8192", "find -size /var +8192", "locate -s 8192k"),
                    MC("Which search tool uses a prebuilt database?", "locate", "updatedb refreshes it.", "find", "which", "grep"),
                    MC("Which command shows only executables in $PATH and aliases?", "which", "which is fast but only searches $PATH.", "find", "locate", "stat"),
                    MC("What do hard links share?", "The same inode", "Hard links cannot cross filesystems.", "Different inodes with the same data", "A path name only", "Nothing"),
                    TF("A symbolic link can cross filesystem boundaries.", true, "Symlinks have their own inode and store a target path."),
                    MC("What happens to a symlink if its target is deleted?", "It becomes a dangling link", "The data is not preserved for symlinks.", "It becomes a hard link", "It is deleted too", "It points to the parent"),
                    MC("What does the sticky bit on a directory do?", "Only owners can delete their own files", "Common on /tmp.", "Runs files as the owner", "Inherits group ownership", "Makes files immutable"),
                    MC("Which command sets owner and group together?", "chown user1:staff file", "Colon or dot separator, no spaces.", "chgrp user1 staff file", "chmod user1:staff file", "umask user1:staff"),
                    MC("Which command makes a file immutable?", "chattr +i", "lsattr shows attributes.", "chmod +i", "setfacl -i", "chown +i")
                }
            },
            new()
            {
                Module = "Module5", Title = "Module 5 Quiz - Filesystem Administration",
                Questions = new()
                {
                    MC("What is the maximum disk size and primary partitions with MBR?", "2 TB and 4 primary partitions", "GPT supports larger disks and up to 128 partitions.", "8 TB and 8 partitions", "16 TB and 128 partitions", "2 TB and 128 partitions"),
                    MC("What is /dev/nvme0n1p1?", "Partition 1 on namespace 1 of NVMe device 0", "NVMe uses a namespace model.", "First SATA partition", "A USB partition", "A swap file"),
                    MC("Which tool is GPT-only?", "gdisk", "fdisk, cfdisk, and parted handle both.", "fdisk", "cfdisk", "parted"),
                    MC("After editing the partition table of the OS disk, which command informs the kernel without rebooting?", "partprobe", "Otherwise a reboot is required.", "mount -a", "fsck", "udevadm halt"),
                    MC("Which sequence prepares and activates swap?", "mkswap then swapon", "swapoff deactivates.", "swapon then mkswap", "mkfs then mount", "fdisk then fsck"),
                    MC("Which file defines mounts that occur at boot?", "/etc/fstab", "mount -a processes it.", "/etc/mtab only", "/boot/grub.cfg", "/etc/hosts"),
                    MC("What does mount -o loop sample.iso /mnt do?", "Mounts an ISO image as a loopback device", "mkisofs -RJ creates ISOs.", "Burns the ISO to disc", "Extracts the ISO to /mnt", "Formats the ISO"),
                    MC("What is the LVM stack, bottom to top?", "PV, VG, LV", "Physical volumes feed volume groups which host logical volumes.", "LV, VG, PV", "VG, PV, LV", "PV, LV, VG"),
                    TF("fsck should be run on a mounted filesystem.", false, "Unmount first or risk corruption."),
                    MC("Which command shows inode usage?", "df -i", "du reports directory usage.", "du -i", "lsblk -i", "stat -i"),
                    MC("Where does a desktop environment auto-mount removable media?", "/run/media/username/label", "Servers mount manually.", "/mnt/usb", "/media/cdrom only", "/dev/media")
                }
            },
            new()
            {
                Module = "Module6", Title = "Module 6 Quiz - Server Administration Fundamentals",
                Questions = new()
                {
                    MC("How tall is 1U in a server rack?", "1.75 inches", "1U is the minimum rackmount height.", "1 inch", "3.5 inches", "2 inches"),
                    MC("Which hypervisor type runs directly on hardware?", "Type I", "Examples: ESXi, Hyper-V, KVM/QEMU, Xen.", "Type II", "Type III", "Container runtime"),
                    MC("Which is a Type II hypervisor?", "VirtualBox", "Type II runs as an application on a host OS.", "ESXi", "Xen", "Hyper-V"),
                    MC("Which CPU feature must be enabled for hardware virtualization on Intel?", "VT-x", "AMD uses AMD-V.", "SSE", "NX bit", "Hyper-Threading"),
                    MC("What file extension does VMware use for virtual disks?", ".vmdk", "Hyper-V uses .vhdx; KVM/QEMU uses .qcow2.", ".vhdx", ".qcow2", ".iso"),
                    MC("Which provisioning type allocates space as the VM writes data?", "Thin", "Thick reserves the full disk up front.", "Thick", "Static", "Linked"),
                    MC("What does a hypervisor snapshot do?", "Creates a second VHD recording changes after the snapshot", "The original VHD is preserved.", "Copies the whole VM to another host", "Pauses the VM permanently", "Deletes the old VHD"),
                    MC("Which RAID level mirrors data across two disks?", "RAID 1", "RAID 0 stripes with no redundancy.", "RAID 0", "RAID 5", "RAID 6"),
                    MC("Which command shows the kernel ring buffer?", "dmesg", "Useful for hardware troubleshooting.", "lspci", "lsusb", "journalctl -u"),
                    MC("Which command lists PCI devices?", "lspci", "lsusb lists USB devices.", "lsusb", "lsscsi", "lsmem"),
                    MC("What is a SAN?", "Shared large storage provided to rack servers", "Often via iSCSI or Fibre Channel.", "A type of hypervisor", "A backup battery", "A kernel module")
                }
            },
            new()
            {
                Module = "Module8", Title = "Module 8 Quiz - System Initialization, X Windows & Localization",
                Questions = new()
                {
                    MC("What runs first when power is applied?", "BIOS/UEFI POST", "POST verifies core hardware.", "The init daemon", "The kernel", "The display manager"),
                    MC("Which GRUB2 file is NOT meant to be edited manually?", "grub.cfg", "It is generated from /etc/default/grub and /etc/grub.d.", "/etc/default/grub", "/etc/grub.d scripts", "grubenv"),
                    MC("Which command regenerates the GRUB2 configuration?", "grub2-mkconfig -o /boot/grub2/grub.cfg", "Run after editing the source files.", "grub-install", "update-rc.d", "dracut"),
                    MC("How does GRUB2 number partitions?", "One-indexed with msdos or gpt prefix", "Example: hd0,gpt2. GRUB Legacy was zero-indexed.", "Zero-indexed", "By UUID only", "Alphabetically"),
                    MC("What is initramfs?", "A RAM-loaded image of kernel modules needed at boot", "Rebuilt with dracut.", "A disk partition", "A systemd unit", "A boot password"),
                    MC("Which systemd target equals SysV runlevel 5?", "graphical.target", "It loads multi-user.target first.", "multi-user.target", "rescue.target", "reboot.target"),
                    MC("Which command sets the default boot target?", "systemctl set-default", "get-default shows it.", "systemctl isolate", "telinit 5", "chkconfig --default"),
                    TF("systemctl enable starts a unit immediately.", false, "enable only configures boot start; use start or enable --now."),
                    MC("Which command shows the slowest units during boot?", "systemd-analyze blame", "critical-chain shows the critical path.", "systemctl status", "journalctl -b", "runlevel"),
                    MC("Which command configures SysV daemon startup per runlevel?", "chkconfig", "Example: chkconfig cron on.", "systemctl", "service", "telinit"),
                    MC("Which command sets the system time zone with systemd?", "timedatectl set-timezone", "localectl handles locale and keymap.", "hwclock --systohc", "locale -a", "cal")
                }
            }
        };

        var full = new Quiz
        {
            Module = "Module1",
            Title = "Full Practice Test - Modules 1-8",
            IsFullTest = true,
            TimeLimit = 40,
            Questions = modules.SelectMany(q => q.Questions.Take(4)).ToList()
        };

        modules.Add(full);
        return modules;
    }
}
