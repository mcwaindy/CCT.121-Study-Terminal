// Command challenges. setup: commands run silently before the task. check(sh): true when the task is done.
(function () {
    const n = (sh, p) => sh.get(p, false);
    const txt = (sh, p) => { const x = n(sh, p); return x && x.t === 'f' ? x.content : null; };
    const perm = (sh, p) => { const x = n(sh, p); return x ? x.mode & 0o7777 : null; };
    const ran = (sh, re) => sh.hist.some(h => re.test(h));
    const dirEmpty = (sh, p) => { const x = n(sh, p); return x && x.t === 'd' && !Object.keys(x.kids).length; };

    window.CHALLENGES = [
        // Module 2
        { m: 2, t: 'Confirm your location', task: 'Print the directory you are currently in.', hint: 'pwd', check: s => ran(s, /^\s*pwd\b/) },
        { m: 2, t: 'Write to a file', task: 'Use echo and the > redirect to create ~/hello.txt containing: hello linux', hint: 'echo hello linux > hello.txt', check: s => (txt(s, '~/hello.txt') || '').trim() === 'hello linux' },
        { m: 2, t: 'Append', task: 'Append the line "second" to ~/notes.txt WITHOUT erasing its existing contents.', hint: 'echo second >> notes.txt', check: s => { const t = txt(s, '~/notes.txt') || ''; return t.includes('Linux is a kernel') && t.trim().endsWith('second'); } },
        { m: 2, t: 'Pipe into a pager-like filter', task: 'Count the lines in /etc/passwd using a pipe, and store the result in ~/count.txt.', hint: 'cat /etc/passwd | wc -l > count.txt', check: s => /^2\b/.test((txt(s, '~/count.txt') || '').trim()) },
        { m: 2, t: 'Sequential commands', task: 'On ONE line, create directory ~/lab and then create ~/lab/a.txt (use a semicolon).', hint: 'mkdir lab; touch lab/a.txt', check: s => !!n(s, '~/lab/a.txt') && ran(s, /;/) },
        { m: 2, t: 'Find help', task: 'Display the manual page for the ls command.', hint: 'man ls', check: s => ran(s, /^\s*man\s+ls\b/) },
        // Module 3
        { m: 3, t: 'Hidden files', task: 'List ALL files in your home directory including hidden ones, in long format.', hint: 'ls -la', check: s => ran(s, /^\s*ls\s+(-\w*a\w*l\w*|-\w*l\w*a\w*)\b/) || ran(s, /^\s*ls\s+-a\s+-l|^\s*ls\s+-l\s+-a/) },
        { m: 3, t: 'Relative navigation', task: 'Starting in ~, change into Documents, then go up one level using a relative path.', hint: 'cd Documents; cd ..', setup: ['cd ~'], check: s => s.cwd === '/home/student' && ran(s, /cd\s+\.\./) && ran(s, /cd\s+Documents/) },
        { m: 3, t: 'Absolute path', task: 'Change to /var/log using an absolute path.', hint: 'cd /var/log', check: s => s.cwd === '/var/log' },
        { m: 3, t: 'Last lines', task: 'Show only the last 1 line of /var/log/messages.', hint: 'tail -n 1 /var/log/messages', check: s => ran(s, /^\s*tail\s+.*(-n\s*1\b|-1\b).*messages/) },
        { m: 3, t: 'First line', task: 'Show only the first line of /etc/fstab.', hint: 'head -n 1 /etc/fstab', check: s => ran(s, /^\s*head\s+.*(-n\s*1\b|-1\b).*fstab/) },
        { m: 3, t: 'grep a pattern', task: 'Search ~/notes.txt for lines containing "shell" and save the matches to ~/match.txt.', hint: 'grep shell notes.txt > match.txt', check: s => (txt(s, '~/match.txt') || '').includes('shell interprets') },
        { m: 3, t: 'Invert match', task: 'Show every line of /etc/passwd that does NOT contain "root".', hint: 'grep -v root /etc/passwd', check: s => ran(s, /grep\s+.*-v.*root.*passwd|grep\s+.*-\w*v\w*\s+root/) },
        { m: 3, t: 'Count matches', task: 'Count how many lines in ~/Documents/todo.txt contain the word "study".', hint: 'grep -c study Documents/todo.txt', check: s => ran(s, /grep\s+.*-\w*c\w*.*study.*todo/) },
        { m: 3, t: 'Visualize the tree', task: 'Display the directory tree of your home directory.', hint: 'tree ~  (or: tree)', check: s => ran(s, /^\s*tree\b/) },
        { m: 3, t: 'File type', task: 'Identify the type of /home/student/notes.txt using the file command.', hint: 'file notes.txt', check: s => ran(s, /^\s*file\s+/) },
        // Module 4
        { m: 4, t: 'Build a structure', task: 'Create the nested directories ~/proj/src/lib in one command.', hint: 'mkdir -p proj/src/lib', check: s => { const x = n(s, '~/proj/src/lib'); return x && x.t === 'd'; } },
        { m: 4, t: 'Copy a file', task: 'Copy ~/notes.txt to ~/Documents/notes-backup.txt.', hint: 'cp notes.txt Documents/notes-backup.txt', check: s => txt(s, '~/Documents/notes-backup.txt') === txt(s, '~/notes.txt') && !!txt(s, '~/notes.txt') },
        { m: 4, t: 'Copy a directory', task: 'Copy the Documents directory to ~/Docs2 (it contains files).', hint: 'cp -r Documents Docs2', check: s => !!n(s, '~/Docs2/todo.txt') && !!n(s, '~/Documents/todo.txt') },
        { m: 4, t: 'Rename', task: 'Rename ~/notes.txt to ~/study.txt.', hint: 'mv notes.txt study.txt', check: s => !n(s, '~/notes.txt') && !!n(s, '~/study.txt') },
        { m: 4, t: 'Move into a directory', task: 'Move ~/notes.txt into ~/Downloads.', hint: 'mv notes.txt Downloads', check: s => !n(s, '~/notes.txt') && !!n(s, '~/Downloads/notes.txt') },
        { m: 4, t: 'Remove an empty directory', task: 'Remove the empty directory ~/empty using the safest command.', hint: 'rmdir empty', setup: ['mkdir ~/empty'], check: s => !n(s, '~/empty') && ran(s, /rmdir/) },
        { m: 4, t: 'Remove a directory tree', task: 'Delete ~/junk and everything inside it.', hint: 'rm -r junk  (rmdir fails: not empty)', setup: ['mkdir -p ~/junk/sub', 'touch ~/junk/sub/x'], check: s => !n(s, '~/junk') },
        { m: 4, t: 'Find by name', task: 'Find every file named todo.txt anywhere under /home and save the paths to ~/found.txt.', hint: 'find /home -name todo.txt > found.txt', check: s => (txt(s, '~/found.txt') || '').includes('/home/student/Documents/todo.txt') },
        { m: 4, t: 'Find directories', task: 'List only directories under ~ using find.', hint: 'find ~ -type d', check: s => ran(s, /find\s+.*-type\s+d/) },
        { m: 4, t: 'Hard link', task: 'Create a HARD link ~/hard.txt to ~/notes.txt.', hint: 'ln notes.txt hard.txt', check: s => { const a = n(s, '~/hard.txt'), b = n(s, '~/notes.txt'); return a && b && a === b; } },
        { m: 4, t: 'Symbolic link', task: 'Create a SYMBOLIC link ~/sym.txt pointing to ~/notes.txt.', hint: 'ln -s notes.txt sym.txt  (or the absolute path)', check: s => { const a = n(s, '~/sym.txt'); return a && a.t === 'l' && /notes\.txt$/.test(a.target); } },
        { m: 4, t: 'Inspect inodes', task: 'Show inode numbers in a long listing of ~ so you can compare links.', hint: 'ls -li', check: s => ran(s, /ls\s+.*-\w*i\w*/) && ran(s, /ls\s+.*-\w*l\w*/) },
        { m: 4, t: 'Make executable', task: 'Create ~/run.sh and give the owner execute permission only (add x for user).', hint: 'touch run.sh; chmod u+x run.sh', setup: ['touch ~/run.sh'], check: s => { const p = perm(s, '~/run.sh'); return p !== null && (p & 0o100) && !(p & 0o001) && !(p & 0o010); } },
        { m: 4, t: 'Numeric chmod', task: 'Set ~/secret.txt to rw-r----- using numeric notation.', hint: 'chmod 640 secret.txt', setup: ['touch ~/secret.txt'], check: s => perm(s, '~/secret.txt') === 0o640 },
        { m: 4, t: 'Private directory', task: 'Make ~/private accessible only to its owner (rwx------).', hint: 'chmod 700 private', setup: ['mkdir ~/private'], check: s => perm(s, '~/private') === 0o700 },
        { m: 4, t: 'Symbolic chmod', task: 'On ~/data.txt, remove write from group and others, and set group to read-only: use symbolic mode so the result is rw-r--r-- from rw-rw-rw-.', hint: 'chmod go-w data.txt', setup: ['touch ~/data.txt', 'chmod 666 ~/data.txt'], check: s => perm(s, '~/data.txt') === 0o644 },
        { m: 4, t: 'SUID', task: 'Set the SUID bit on ~/tool while keeping rwxr-xr-x (mode 4755).', hint: 'chmod 4755 tool', setup: ['touch ~/tool', 'chmod 755 ~/tool'], check: s => perm(s, '~/tool') === 0o4755 },
        { m: 4, t: 'Shared directory', task: 'Make ~/shared like /tmp: world-writable with the sticky bit (1777).', hint: 'chmod 1777 shared', setup: ['mkdir ~/shared'], check: s => perm(s, '~/shared') === 0o1777 },
        { m: 4, t: 'SGID directory', task: 'Set SGID on ~/team so new files inherit the group, keeping rwxrwxr-x (2775).', hint: 'chmod 2775 team', setup: ['mkdir ~/team'], check: s => perm(s, '~/team') === 0o2775 },
        { m: 4, t: 'umask', task: 'Set umask to 077, then create ~/private.txt. It should end up rw-------.', hint: 'umask 077; touch private.txt', check: s => perm(s, '~/private.txt') === 0o600 },
        { m: 4, t: 'Change owner', task: 'Change the owner of ~/notes.txt to root.', hint: 'chown root notes.txt', check: s => { const x = n(s, '~/notes.txt'); return x && x.owner === 'root'; } },
        // Module 5-8 (shell-visible concepts)
        { m: 5, t: 'Edit-free fstab view', task: 'Display /etc/fstab with line numbers.', hint: 'cat -n /etc/fstab', check: s => ran(s, /cat\s+-n\s+\/etc\/fstab/) },
        { m: 5, t: 'Mount point prep', task: 'Create the mount point /mnt/data (parent exists).', hint: 'mkdir /mnt/data', check: s => dirEmpty(s, '/mnt/data') },
        { m: 5, t: 'Mount point cleanup', task: 'Create /mnt/usb and /mnt/iso, then remove only /mnt/iso.', hint: 'mkdir /mnt/usb /mnt/iso; rmdir /mnt/iso', check: s => !!n(s, '/mnt/usb') && !n(s, '/mnt/iso') && ran(s, /mkdir/) },
        { m: 6, t: 'Device listing', task: 'List the contents of /dev in long format.', hint: 'ls -l /dev', check: s => ran(s, /ls\s+.*-\w*l.*\/dev/) },
        { m: 6, t: 'Log search', task: 'Find lines in /var/log/messages mentioning "systemd", ignoring case, with line numbers.', hint: 'grep -in systemd /var/log/messages', check: s => ran(s, /grep\s+(?=.*i)(?=.*n).*systemd.*messages/i) },
		// Module 7
		{ m: 7, t: 'Redirect and append', task: 'Create ~/log.txt containing "one", then append "two" so both lines remain.', hint: 'echo one > log.txt; echo two >> log.txt', check: s => (txt(s, '~/log.txt') || '').trim().split('\n').join(',') === 'one,two' },
		{ m: 7, t: 'Discard errors', task: 'Run ls on a nonexistent path /nope while sending the error to /dev/null.', hint: 'ls /nope 2>/dev/null', check: s => ran(s, /ls\s+\/nope\s+2>\s*\/dev\/null/) },
		{ m: 7, t: 'Pipe to count', task: 'Count the lines in /etc/passwd with a pipe and store the result in ~/lines.txt.', hint: 'cat /etc/passwd | wc -l > lines.txt', check: s => /^\d+/.test((txt(s, '~/lines.txt') || '').trim()) && ran(s, /\|\s*wc/) },
		{ m: 7, t: 'Replace text with sed', task: 'Pipe "hello world" through sed to turn it into "HELLO world" and save it to ~/sed.txt.', hint: 'echo hello world | sed s/hello/HELLO/ > sed.txt', check: s => (txt(s, '~/sed.txt') || '').trim() === 'HELLO world' },
		{ m: 7, t: 'User variable', task: 'Create a variable MYVAR set to hello, export it, and print it.', hint: 'MYVAR=hello; export MYVAR; echo $MYVAR', check: s => s.env.MYVAR === 'hello' && ran(s, /echo\s+\$MYVAR/) },
		{ m: 7, t: 'Alias two commands', task: 'Create an alias dw that runs date;who and then use it.', hint: 'alias dw="date;who"; dw', check: s => !!s.aliases.dw && ran(s, /^\s*dw\b/) },
		{ m: 7, t: 'Remove a variable', task: 'Create variable TEMPVAR=1, then remove it with unset.', hint: 'TEMPVAR=1; unset TEMPVAR', check: s => ran(s, /TEMPVAR=1/) && ran(s, /unset\s+TEMPVAR/) && s.env.TEMPVAR === undefined },
		{ m: 7, t: 'Make a script executable', task: 'Create ~/hello.sh containing echo hi, make it executable with chmod, and run it with ./hello.sh.', hint: 'echo "echo hi" > hello.sh; chmod a+x hello.sh; ./hello.sh', check: s => !!txt(s, '~/hello.sh') && ((perm(s, '~/hello.sh') || 0) & 0o111) !== 0 && ran(s, /\.\/hello\.sh/) },
        { m: 8, t: 'Environment', task: 'Set an environment variable LANG to en_GB.UTF-8, then print it.', hint: 'export LANG=en_GB.UTF-8; echo $LANG', check: s => s.env.LANG === 'en_GB.UTF-8' && ran(s, /echo\s+\$LANG/) },
        { m: 8, t: 'Alias', task: 'Create an alias named ll for ls -l and then use it.', hint: "alias ll='ls -l'; ll", check: s => s.aliases.ll && ran(s, /^\s*ll\b/) }
    ];
})();
