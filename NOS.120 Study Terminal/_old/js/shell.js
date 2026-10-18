// Sandboxed bash-like shell simulator. Runs entirely in the browser on a virtual filesystem.
(function () {
    const DEFS = {
        pwd: 'Print the current working directory.', cd: 'Change the current directory (~ = home, .. = parent, - = previous).',
        ls: 'List directory contents. -a hidden, -l long, -R recursive, -F type markers, -i inodes.',
        mkdir: 'Create directories. -p creates parent directories as needed.', rmdir: 'Remove EMPTY directories.',
        touch: 'Create an empty file or update its timestamp.', rm: 'Remove files. -r recursive, -f no prompt (no recovery).',
        cp: 'Copy files. -r required for directories.', mv: 'Move or rename files and directories.',
        cat: 'Print file contents (-n numbers lines).', tac: 'Print file contents in reverse line order.',
        head: 'Show the first lines of a file (-n N, default 10).', tail: 'Show the last lines of a file (-n N, default 10).',
        echo: 'Print text. Combine with > (overwrite) or >> (append) to write files.',
        tree: 'Show the directory hierarchy as an indented tree.', find: 'Search live for files: find dir -name "pat" -type d|f.',
        grep: 'Print lines matching a pattern (-i ignore case, -v invert, -n numbers, -c count, -r recursive).',
        wc: 'Count lines, words, bytes (-l lines).', sort: 'Sort lines of text.', uniq: 'Collapse adjacent duplicate lines.',
        history: 'Show commands entered in this shell.', clear: 'Clear the terminal screen.',
        whoami: 'Print the current user name.', id: 'Print user and group IDs.', hostname: 'Print the system host name.',
        uname: 'Print system information (-a all, -r kernel release).', date: 'Print the system date and time.',
        chmod: 'Change permissions: symbolic (u+x, g=r) or numeric (755).', chown: 'Change file owner[:group].',
        ln: 'Create links. Hard link by default; -s creates a symbolic link.', stat: 'Show detailed inode information for a file.',
        file: 'Identify a file type from its contents.', which: 'Show the path of a command found in $PATH.',
        man: 'Display the manual page for a command.', help: 'List the commands this simulator supports.',
        umask: 'Show or set the default permission mask for new files.', df: 'Report filesystem space (-h human-readable).',
        du: 'Estimate file space usage (-h, -s).', lsblk: 'List block devices.', mount: 'Attach a filesystem to a directory.',
        export: 'Set an environment variable.', env: 'Print environment variables.', alias: 'Create command shortcuts.',
        su: 'Switch user (su - gives a full login environment).', sudo: 'Run a command as root.', passwd: 'Change a password.',
        ps: 'List processes.', exit: 'End the session (here: just clears the screen).',
        mkfs: 'Build a filesystem on a device.', fdisk: 'Partition a disk (MBR/GPT).', systemctl: 'Manage systemd units.',
        shutdown: 'Schedule a shutdown/reboot.', less: 'Page through a file with back/forward/search.', more: 'Page through a file forward-only.'
    };
    const NOOPS = ['df', 'du', 'lsblk', 'mount', 'ps', 'fdisk', 'mkfs', 'systemctl', 'shutdown', 'passwd', 'su', 'sudo', 'less', 'more'];

    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let inodeCounter = 100;

    const mkdir = (mode = 0o755) => ({ t: 'd', kids: {}, mode, ino: ++inodeCounter, mtime: new Date(), links: 1, owner: 'student' });
    const mkfile = (content = '', mode = 0o644) => ({ t: 'f', content, mode, ino: ++inodeCounter, mtime: new Date(), links: 1, owner: 'student' });

    function initialFs() {
        const root = mkdir();
        const add = (path, node) => {
            const parts = path.split('/').filter(Boolean); let d = root;
            parts.slice(0, -1).forEach(p => d = d.kids[p]);
            d.kids[parts[parts.length - 1]] = node;
        };
        ['home', 'home/student', 'home/student/Documents', 'home/student/Downloads', 'etc', 'var', 'var/log', 'tmp', 'usr', 'usr/bin', 'usr/local', 'root', 'bin', 'dev', 'mnt', 'media', 'opt', 'boot', 'proc', 'sys']
            .forEach(p => add(p, mkdir()));
        root.kids.tmp.mode = 0o1777; root.kids.root.mode = 0o700;
        add('home/student/notes.txt', mkfile('Linux is a kernel.\nThe shell interprets commands.\nUse man for help.\n'));
        add('home/student/Documents/todo.txt', mkfile('study permissions\nstudy LVM\nstudy systemd\n'));
        add('etc/hostname', mkfile('nos120\n'));
        add('etc/fstab', mkfile('UUID=1a2b-3c4d / ext4 defaults 1 1\nUUID=5e6f-7a8b /home ext4 defaults 1 2\n'));
        add('etc/passwd', mkfile('root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000::/home/student:/bin/bash\n'));
        add('var/log/messages', mkfile('Oct 13 08:00:01 nos120 kernel: Booting Linux\nOct 13 08:00:05 nos120 systemd[1]: Reached target Multi-User System.\n'));
        add('usr/bin/ls', mkfile('', 0o755));
        add('usr/bin/passwd', mkfile('', 0o4755));
        return root;
    }

    function make(p) {
    const S = {
        quiet: false, onRun: null,
        root: null,

        init() {
            this.out = document.getElementById(p + 'Output');
            this.input = document.getElementById(p + 'Input');
            this.reset(true);
            this.input.addEventListener('keydown', e => {
                if (e.key === 'Enter') { const v = this.input.value; this.input.value = ''; this.run(v); }
                else if (e.key === 'ArrowUp') { if (this.hpos > 0) this.input.value = this.hist[--this.hpos]; e.preventDefault(); }
                else if (e.key === 'ArrowDown') { this.hpos = Math.min(this.hpos + 1, this.hist.length); this.input.value = this.hist[this.hpos] || ''; e.preventDefault(); }
                else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); this.clearScreen(); }
            });
            const b = (id, f) => { const e = document.getElementById(id); if (e) e.addEventListener('click', f); };
            b('shellClearScreen', () => this.clearScreen());
            b('shellClearLog', () => this.clearLog());
            b('shellResetFs', () => this.reset(false));


            b(p + 'Terminal', () => this.input.focus());
        },

        reset(silent) {
            this.root = initialFs(); this.cwd = '/home/student'; this.oldcwd = this.cwd; this.umask = 0o022;
            this.env = { HOME: '/home/student', USER: 'student', SHELL: '/bin/bash', PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin', LANG: 'en_US.UTF-8' };
            this.aliases = {};
            this.clearLog(); this.clearScreen();
            if (!silent) this.print('Filesystem reset to defaults.');
        },
        clearScreen() { this.out.innerHTML = ''; },
        clearLog() { this.log = []; this.used = new Set(); this.hist = []; this.hpos = 0; this.renderSide(); },
        onLeave() { const e = document.getElementById('shellAutoClear'); if (e && e.checked) this.reset(true); },
        runSilent(line) {
            const n = this.log.length, h = this.hist.length, u = new Set(this.used);
            this.quiet = true; this.run(line); this.quiet = false;
            this.log.length = n; this.hist.length = h; this.hpos = h; this.used = u;
        },

        print(text, cls) {
            if (this.quiet) return;
            const d = document.createElement('div'); if (cls) d.className = cls;
            d.textContent = text; this.out.appendChild(d); this.out.scrollTop = this.out.scrollHeight;
        },
        prompt() { const p = this.cwd === this.env.HOME ? '~' : this.cwd; return `student@nos120:${p}$`; },

        renderSide() {
            if (!document.getElementById('shellDefs') || p !== 'shell') return;
            const names = [...this.used];
            document.getElementById('shellDefs').innerHTML = names.length
                ? names.map(n => `<div class="def-item"><code>${esc(n)}</code><span>${esc(DEFS[n] || 'Not covered by the simulator definition list.')}</span></div>`).join('')
                : '<p class="muted">Commands you run appear here with their definitions.</p>';
            document.getElementById('shellLog').innerHTML = this.log.length
                ? this.log.map((l, i) => `<div class="log-item"><span class="log-n">${i + 1}</span><code>${esc(l)}</code></div>`).join('')
                : '<p class="muted">No commands logged.</p>';
        },

        // ---------- path helpers ----------
        abs(p) {
            if (p === '~' || p.startsWith('~/')) p = this.env.HOME + p.slice(1);
            if (!p.startsWith('/')) p = this.cwd + '/' + p;
            const out = [];
            p.split('/').forEach(s => { if (!s || s === '.') return; if (s === '..') out.pop(); else out.push(s); });
            return '/' + out.join('/');
        },
        get(path, follow = true) {
            let n = this.root, depth = 0;
            const parts = this.abs(path).split('/').filter(Boolean);
            for (let i = 0; i < parts.length; i++) {
                if (n.t === 'l') n = this.get(n.target);
                if (!n || n.t !== 'd') return null;
                n = n.kids[parts[i]]; if (!n) return null;
            }
            while (follow && n && n.t === 'l' && depth++ < 10) n = this.get(n.target);
            return n;
        },
        split(path) { const a = this.abs(path); const i = a.lastIndexOf('/'); return [a.slice(0, i) || '/', a.slice(i + 1)]; },
        parent(path) { const [d, name] = this.split(path); const p = this.get(d); return [p && p.t === 'd' ? p : null, name]; },
        glob(arg) {
            if (!/[*?]/.test(arg)) return [arg];
            const i = arg.lastIndexOf('/'); const dir = i >= 0 ? arg.slice(0, i + 1) : ''; const pat = arg.slice(i + 1);
            const d = this.get(dir || '.'); if (!d || d.t !== 'd') return [arg];
            const re = new RegExp('^' + pat.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
            const m = Object.keys(d.kids).filter(k => re.test(k) && (pat.startsWith('.') || !k.startsWith('.'))).sort().map(k => dir + k);
            return m.length ? m : [arg];
        },

        // ---------- parsing ----------
        tokenize(line) {
            const toks = []; let cur = '', has = false, q = null, quoted = false;
            const push = () => { if (has) toks.push({ w: cur, quoted }); cur = ''; has = false; quoted = false; };
            for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (q) { if (c === q) q = null; else if (c === '$' && q === '"') { const m = /^\$(\w+)/.exec(line.slice(i)); if (m) { cur += this.env[m[1]] || ''; i += m[0].length - 1; } else cur += c; } else cur += c; continue; }
                if (c === '"' || c === "'") { q = c; has = true; quoted = true; }
                else if (c === '\\' && i + 1 < line.length) { cur += line[++i]; has = true; quoted = true; }
                else if (c === ' ' || c === '\t') push();
                else if (c === '|' || c === ';') { push(); toks.push({ op: c }); }
                else if (c === '>') { push(); if (line[i + 1] === '>') { toks.push({ op: '>>' }); i++; } else toks.push({ op: '>' }); }
                else if (c === '$') { const m = /^\$(\w+)/.exec(line.slice(i)); if (m) { cur += this.env[m[1]] || ''; i += m[0].length - 1; has = true; } else { cur += c; has = true; } }
                else { cur += c; has = true; }
            }
            push(); return toks;
        },

        run(line) {
            this.print(`${this.prompt()} ${line}`, 'cmd-line');
            if (!line.trim()) return;
            this.hist.push(line); this.hpos = this.hist.length; this.log.push(line);
            try {
                const toks = this.tokenize(line);
                let seq = [[]];
                toks.forEach(t => { if (t.op === ';') seq.push([]); else seq[seq.length - 1].push(t); });
                seq.forEach(s => s.length && this.runPipeline(s));
            } catch (e) { this.print('bash: ' + e.message); }
            this.renderSide();
            if (this.onRun && !this.quiet) this.onRun(line);
        },

        runPipeline(toks) {
            let redir = null;
            const stages = [[]];
            for (let i = 0; i < toks.length; i++) {
                const t = toks[i];
                if (t.op === '|') stages.push([]);
                else if (t.op === '>' || t.op === '>>') { redir = { mode: t.op, file: toks[++i] && toks[i].w }; }
                else stages[stages.length - 1].push(t);
            }
            let input = null, result = { out: '', err: '' };
            for (const st of stages) {
                if (!st.length) continue;
                let args = [];
                st.forEach(t => { (t.quoted ? [t.w] : this.glob(t.w)).forEach(a => args.push(a)); });
                if (this.aliases[args[0]]) args = this.tokenize(this.aliases[args[0]]).map(t => t.w).concat(args.slice(1));
                result = this.exec(args, input);
                if (result.err) this.print(result.err, 'err');
                input = result.out;
            }
            const out = result.out || '';
            if (redir) {
                if (!redir.file) return this.print('bash: syntax error near unexpected token `newline\'');
                const [p, name] = this.parent(redir.file);
                if (!p) return this.print(`bash: ${redir.file}: No such file or directory`);
                const ex = p.kids[name];
                if (ex && ex.t === 'd') return this.print(`bash: ${redir.file}: Is a directory`);
                if (ex) { ex.content = redir.mode === '>>' ? ex.content + out : out; ex.mtime = new Date(); }
                else p.kids[name] = mkfile(out, 0o666 & ~this.umask);
            } else if (out) this.print(out.replace(/\n$/, ''));
        },

        // ---------- commands ----------
        exec(args, stdin) {
            const cmd = args[0], a = args.slice(1);
            this.used.add(cmd);
            const flags = a.filter(x => /^-[A-Za-z]/.test(x)).join('').replace(/-/g, '');
            const files = a.filter(x => !/^-[A-Za-z]/.test(x));
            const E = m => ({ out: '', err: m });
            const O = s => ({ out: s });
            const C = this.cmds[cmd];
            if (C) return C.call(this, { a, flags, files, stdin, E, O });
            if (NOOPS.includes(cmd)) return O('');
            return E(`bash: ${cmd}: command not found`);
        },

        read(f, stdin, E) {
            if (!f) return { text: stdin || '' };
            const n = this.get(f);
            if (!n) return { err: `${f}: No such file or directory` };
            if (n.t === 'd') return { err: `${f}: Is a directory` };
            return { text: n.content };
        },
        modeStr(n) {
            const m = n.mode, c = n.t === 'd' ? 'd' : n.t === 'l' ? 'l' : '-';
            const r = (b, x, ch) => ((m >> b) & 4 ? 'r' : '-') + ((m >> b) & 2 ? 'w' : '-') + (((m >> b) & 1) ? (x ? ch : 'x') : (x ? ch.toUpperCase() : '-'));
            return c + r(6, m & 0o4000, 's') + r(3, m & 0o2000, 's') + r(0, m & 0o1000, 't');
        },
        sizeOf(n) { return n.t === 'd' ? 4096 : n.t === 'l' ? n.target.length : n.content.length; },
        fmtDate(d) { return d.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ''); },
        applyChmod(n, spec) {
            if (/^[0-7]{3,4}$/.test(spec)) { n.mode = parseInt(spec, 8); return true; }
            const m = /^([ugoa]*)([-+=])([rwxst]*)$/.exec(spec); if (!m) return false;
            const who = m[1] || 'a'; let bits = 0;
            [...who].forEach(w => {
                const sh = w === 'u' ? 6 : w === 'g' ? 3 : w === 'o' ? 0 : -1;
                const set = (s) => { let v = 0; if (m[3].includes('r')) v |= 4; if (m[3].includes('w')) v |= 2; if (m[3].includes('x')) v |= 1; return v << s; };
                const apply = s => { const b = set(s); if (m[2] === '+') n.mode |= b; else if (m[2] === '-') n.mode &= ~b; else { n.mode &= ~(7 << s); n.mode |= b; } };
                if (sh < 0) [6, 3, 0].forEach(apply); else apply(sh);
                if (m[3].includes('s')) { const b = w === 'u' ? 0o4000 : 0o2000; if (m[2] === '-') n.mode &= ~b; else n.mode |= b; }
                if (m[3].includes('t')) { if (m[2] === '-') n.mode &= ~0o1000; else n.mode |= 0o1000; }
            });
            return true;
        },
        treeLines(n, prefix, all, counts) {
            let lines = [];
            const names = Object.keys(n.kids).filter(k => all || !k.startsWith('.')).sort();
            names.forEach((k, i) => {
                const last = i === names.length - 1, c = n.kids[k];
                lines.push(prefix + (last ? '└── ' : '├── ') + k + (c.t === 'l' ? ' -> ' + c.target : ''));
                if (c.t === 'd') { counts.d++; lines = lines.concat(this.treeLines(c, prefix + (last ? '    ' : '│   '), all, counts)); } else counts.f++;
            });
            return lines;
        },
        copyNode(n) {
            if (n.t === 'd') { const d = mkdir(n.mode); Object.keys(n.kids).forEach(k => d.kids[k] = this.copyNode(n.kids[k])); return d; }
            if (n.t === 'l') return { ...n, ino: ++inodeCounter };
            return { ...n, ino: ++inodeCounter, links: 1, mtime: new Date() };
        },
        walk(path, fn) {
            const n = this.get(path, false); if (!n) return;
            fn(path, n);
            if (n.t === 'd') Object.keys(n.kids).sort().forEach(k => this.walk((path === '/' ? '' : path) + '/' + k, fn));
        },

        cmds: {
            pwd() { return { out: this.cwd + '\n' }; },
            cd({ files, E }) {
                let t = files[0] === undefined ? this.env.HOME : files[0] === '-' ? this.oldcwd : files[0];
                const n = this.get(t);
                if (!n) return E(`bash: cd: ${files[0]}: No such file or directory`);
                if (n.t !== 'd') return E(`bash: cd: ${files[0]}: Not a directory`);
                this.oldcwd = this.cwd; this.cwd = this.abs(t); return { out: '' };
            },
            ls({ flags, files, E }) {
                const targets = files.length ? files : ['.'];
                let out = '', err = '';
                const fmt = (name, n) => {
                    const suffix = flags.includes('F') ? (n.t === 'd' ? '/' : n.t === 'l' ? '@' : (n.mode & 0o111) ? '*' : '') : '';
                    if (flags.includes('l')) return `${flags.includes('i') ? n.ino + ' ' : ''}${this.modeStr(n)}${(n.mode & 0o7777) > 0o7777 ? '' : ''}${flags.includes('l') ? ' ' + n.links + ' ' + n.owner + ' ' + n.owner + ' ' + String(this.sizeOf(n)).padStart(5) + ' ' + this.fmtDate(n.mtime) + ' ' : ''}${name}${suffix}${n.t === 'l' ? ' -> ' + n.target : ''}`;
                    return (flags.includes('i') ? n.ino + ' ' : '') + name + suffix;
                };
                const list = (path, header) => {
                    const n = this.get(path);
                    if (!n) { err += `ls: cannot access '${path}': No such file or directory\n`; return; }
                    if (n.t !== 'd') { out += fmt(path, n) + '\n'; return; }
                    if (header) out += path + ':\n';
                    let names = Object.keys(n.kids).sort();
                    if (!flags.includes('a')) names = names.filter(k => !k.startsWith('.'));
                    const rows = names.map(k => fmt(k, n.kids[k]));
                    if (flags.includes('a')) { rows.unshift(fmt('..', n), fmt('.', n)); }
                    if (flags.includes('l')) out += `total ${names.length * 4}\n` + rows.join('\n') + '\n'; else out += rows.join('  ') + '\n';
                    if (flags.includes('R')) names.forEach(k => { if (n.kids[k].t === 'd') { out += '\n'; list((path === '/' ? '' : path) + '/' + k, true); } });
                };
                targets.forEach(t => list(t, targets.length > 1));
                return { out, err: err.trim() };
            },
            mkdir({ flags, files, E }) {
                if (!files.length) return E('mkdir: missing operand');
                for (const f of files) {
                    if (flags.includes('p')) {
                        let cur = '';
                        for (const part of this.abs(f).split('/').filter(Boolean)) {
                            cur += '/' + part; const n = this.get(cur);
                            if (!n) { const [p, nm] = this.parent(cur); p.kids[nm] = mkdir(0o777 & ~this.umask); } else if (n.t !== 'd') return E(`mkdir: cannot create directory '${f}': Not a directory`);
                        }
                        continue;
                    }
                    const [p, name] = this.parent(f);
                    if (!p) return E(`mkdir: cannot create directory '${f}': No such file or directory`);
                    if (p.kids[name]) return E(`mkdir: cannot create directory '${f}': File exists`);
                    p.kids[name] = mkdir(0o777 & ~this.umask);
                }
                return { out: '' };
            },
            rmdir({ files, E }) {
                for (const f of files) {
                    const n = this.get(f, false);
                    if (!n) return E(`rmdir: failed to remove '${f}': No such file or directory`);
                    if (n.t !== 'd') return E(`rmdir: failed to remove '${f}': Not a directory`);
                    if (Object.keys(n.kids).length) return E(`rmdir: failed to remove '${f}': Directory not empty`);
                    const [p, name] = this.parent(f); delete p.kids[name];
                }
                return { out: '' };
            },
            touch({ files, E }) {
                if (!files.length) return E('touch: missing file operand');
                for (const f of files) {
                    const [p, name] = this.parent(f);
                    if (!p) return E(`touch: cannot touch '${f}': No such file or directory`);
                    if (p.kids[name]) p.kids[name].mtime = new Date(); else p.kids[name] = mkfile('', 0o666 & ~this.umask);
                }
                return { out: '' };
            },
            rm({ flags, files, E }) {
                if (!files.length) return E('rm: missing operand');
                let err = '';
                for (const f of files) {
                    const n = this.get(f, false);
                    if (!n) { if (!flags.includes('f')) err += `rm: cannot remove '${f}': No such file or directory\n`; continue; }
                    if (n.t === 'd' && !/[rR]/.test(flags)) { err += `rm: cannot remove '${f}': Is a directory\n`; continue; }
                    const [p, name] = this.parent(f);
                    if (this.abs(f) === '/') { err += 'rm: it is dangerous to operate recursively on \'/\'\n'; continue; }
                    delete p.kids[name]; n.links = Math.max(0, n.links - 1);
                    if (this.abs(f) === this.cwd || this.cwd.startsWith(this.abs(f) + '/')) this.cwd = this.env.HOME;
                }
                return { out: '', err: err.trim() };
            },
            unlink(ctx) { return this.cmds.rm.call(this, ctx); },
            cp({ flags, files, E }) {
                if (files.length < 2) return E('cp: missing destination file operand');
                const dest = files[files.length - 1], dn = this.get(dest);
                for (const f of files.slice(0, -1)) {
                    const n = this.get(f);
                    if (!n) return E(`cp: cannot stat '${f}': No such file or directory`);
                    if (n.t === 'd' && !/[rR]/.test(flags)) return E(`cp: -r not specified; omitting directory '${f}'`);
                    let tp, tn;
                    if (dn && dn.t === 'd') { tp = dn; tn = this.split(f)[1]; } else { [tp, tn] = this.parent(dest); }
                    if (!tp) return E(`cp: cannot create regular file '${dest}': No such file or directory`);
                    tp.kids[tn] = this.copyNode(n);
                }
                return { out: '' };
            },
            mv({ files, E }) {
                if (files.length < 2) return E('mv: missing destination file operand');
                const dest = files[files.length - 1], dn = this.get(dest);
                for (const f of files.slice(0, -1)) {
                    const n = this.get(f, false);
                    if (!n) return E(`mv: cannot stat '${f}': No such file or directory`);
                    let tp, tn;
                    if (dn && dn.t === 'd') { tp = dn; tn = this.split(f)[1]; } else { [tp, tn] = this.parent(dest); }
                    if (!tp) return E(`mv: cannot move '${f}' to '${dest}': No such file or directory`);
                    const [sp, sn] = this.parent(f); delete sp.kids[sn]; tp.kids[tn] = n;
                }
                return { out: '' };
            },
            cat({ files, stdin, flags, E }) {
                if (!files.length) return { out: stdin || '' };
                let out = '';
                for (const f of files) { const r = this.read(f, null, E); if (r.err) return E('cat: ' + r.err); out += r.text; }
                if (flags.includes('n')) out = out.replace(/\n$/, '').split('\n').map((l, i) => String(i + 1).padStart(6) + '  ' + l).join('\n') + '\n';
                return { out };
            },
            tac({ files, stdin, E }) { const r = this.read(files[0], stdin, E); if (r.err) return E('tac: ' + r.err); return { out: r.text.replace(/\n$/, '').split('\n').reverse().join('\n') + '\n' }; },
            head({ a, files, stdin, E }) {
                const i = a.indexOf('-n'); const nn = i >= 0 ? parseInt(a[i + 1]) : (a.find(x => /^-\d+$/.test(x)) ? -parseInt(a.find(x => /^-\d+$/.test(x))) : 10);
                const f = files.filter(x => x !== a[i + 1] || i < 0).filter(x => !/^-\d+$/.test(x))[0];
                const r = this.read(f, stdin, E); if (r.err) return E('head: ' + r.err);
                return { out: r.text.split('\n').slice(0, nn).join('\n').replace(/\n?$/, '\n') };
            },
            tail({ a, files, stdin, E }) {
                const i = a.indexOf('-n'); const nn = i >= 0 ? parseInt(a[i + 1]) : 10;
                const f = files.filter(x => x !== a[i + 1] || i < 0)[0];
                const r = this.read(f, stdin, E); if (r.err) return E('tail: ' + r.err);
                const l = r.text.replace(/\n$/, '').split('\n'); return { out: l.slice(-nn).join('\n') + '\n' };
            },
            echo({ a }) { return { out: a.filter(x => x !== '-n' && x !== '-e').join(' ') + '\n' }; },
            tree({ flags, files, E }) {
                const p = files[0] || '.'; const n = this.get(p);
                if (!n) return E(`${p} [error opening dir]`);
                const c = { d: 0, f: 0 };
                const lines = this.treeLines(n.t === 'd' ? n : { kids: {} }, '', flags.includes('a'), c);
                return { out: [p === '.' ? '.' : p, ...lines].join('\n') + `\n\n${c.d} directories, ${c.f} files\n` };
            },
            find({ a, E }) {
                const start = a[0] && !a[0].startsWith('-') ? a[0] : '.';
                const ni = a.indexOf('-name'), ti = a.indexOf('-type');
                const re = ni >= 0 ? new RegExp('^' + a[ni + 1].replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$') : null;
                const type = ti >= 0 ? a[ti + 1] : null;
                if (!this.get(start)) return E(`find: '${start}': No such file or directory`);
                const base = this.abs(start); const res = [];
                this.walk(base, (p, n) => {
                    const nm = p.split('/').pop();
                    if (re && !re.test(nm)) return;
                    if (type && !((type === 'd' && n.t === 'd') || (type === 'f' && n.t === 'f') || (type === 'l' && n.t === 'l'))) return;
                    res.push(start === '.' ? '.' + p.slice(this.cwd.length === 1 ? 0 : this.cwd.length) : p);
                });
                return { out: res.join('\n') + (res.length ? '\n' : '') };
            },
            grep({ flags, files, a, stdin, E }) {
                if (!files.length) return E('Usage: grep [OPTION]... PATTERNS [FILE]...');
                let pat = files[0]; const fl = files.slice(1);
                let re; try { re = new RegExp(pat, flags.includes('i') ? 'i' : ''); } catch { return E('grep: Invalid regular expression'); }
                const results = [], multi = fl.length > 1 || flags.includes('r');
                const doText = (text, label) => {
                    text.replace(/\n$/, '').split('\n').forEach((l, i) => {
                        if (re.test(l) !== flags.includes('v')) results.push((multi ? label + ':' : '') + (flags.includes('n') ? (i + 1) + ':' : '') + l);
                    });
                };
                if (!fl.length && !flags.includes('r')) doText(stdin || '', '');
                else {
                    for (const f of (fl.length ? fl : ['.'])) {
                        if (flags.includes('r')) this.walk(this.abs(f), (p, n) => { if (n.t === 'f') doText(n.content, p); });
                        else { const r = this.read(f, null, E); if (r.err) return E('grep: ' + r.err); doText(r.text, f); }
                    }
                }
                if (flags.includes('c')) return { out: results.length + '\n' };
                return { out: results.join('\n') + (results.length ? '\n' : '') };
            },
            wc({ files, flags, stdin, E }) {
                const r = this.read(files[0], stdin, E); if (r.err) return E('wc: ' + r.err);
                const l = (r.text.match(/\n/g) || []).length, w = r.text.split(/\s+/).filter(Boolean).length;
                return { out: (flags.includes('l') ? l : `${l} ${w} ${r.text.length}`) + (files[0] ? ' ' + files[0] : '') + '\n' };
            },
            sort({ files, stdin, flags, E }) { const r = this.read(files[0], stdin, E); if (r.err) return E('sort: ' + r.err); let l = r.text.replace(/\n$/, '').split('\n').sort(); if (flags.includes('r')) l.reverse(); return { out: l.join('\n') + '\n' }; },
            uniq({ files, stdin, E }) { const r = this.read(files[0], stdin, E); if (r.err) return E('uniq: ' + r.err); return { out: r.text.replace(/\n$/, '').split('\n').filter((x, i, arr) => i === 0 || x !== arr[i - 1]).join('\n') + '\n' }; },
            history() { return { out: this.hist.map((h, i) => String(i + 1).padStart(5) + '  ' + h).join('\n') + '\n' }; },
            clear() { this.clearScreen(); return { out: '' }; },
            exit() { this.clearScreen(); return { out: '' }; },
            whoami() { return { out: 'student\n' }; },
            id() { return { out: 'uid=1000(student) gid=1000(student) groups=1000(student),10(wheel)\n' }; },
            groups() { return { out: 'student wheel\n' }; },
            hostname() { return { out: 'nos120\n' }; },
            uname({ flags }) { return { out: flags.includes('a') ? 'Linux nos120 6.5.0-nos120 #1 SMP x86_64 GNU/Linux\n' : flags.includes('r') ? '6.5.0-nos120\n' : 'Linux\n' }; },
            date() { return { out: new Date().toString() + '\n' }; },
            which({ files, E }) { const f = files[0]; if (!f) return { out: '' }; if (this.cmds[f] || DEFS[f]) return { out: '/usr/bin/' + f + '\n' }; return { out: '', err: '' }; },
            env() { return { out: Object.entries(this.env).map(([k, v]) => k + '=' + v).join('\n') + '\n' }; },
            export({ a }) { a.forEach(x => { const m = /^(\w+)=(.*)$/.exec(x); if (m) this.env[m[1]] = m[2]; }); return { out: '' }; },
            alias({ a }) {
                if (!a.length) return { out: Object.entries(this.aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n') + '\n' };
                a.forEach(x => { const m = /^(\w+)=(.*)$/.exec(x); if (m) this.aliases[m[1]] = m[2]; }); return { out: '' };
            },
            umask({ files }) {
                if (files[0]) { this.umask = parseInt(files[0], 8); return { out: '' }; }
                return { out: this.umask.toString(8).padStart(4, '0') + '\n' };
            },
            chmod({ files, E }) {
                if (files.length < 2) return E('chmod: missing operand');
                for (const f of files.slice(1)) {
                    const n = this.get(f); if (!n) return E(`chmod: cannot access '${f}': No such file or directory`);
                    if (!this.applyChmod(n, files[0])) return E(`chmod: invalid mode: '${files[0]}'`);
                }
                return { out: '' };
            },
            chown({ files, E }) {
                if (files.length < 2) return E('chown: missing operand');
                for (const f of files.slice(1)) { const n = this.get(f); if (!n) return E(`chown: cannot access '${f}': No such file or directory`); n.owner = files[0].split(/[:.]/)[0] || n.owner; }
                return { out: '' };
            },
            ln({ flags, files, E }) {
                if (files.length < 2) return E('ln: missing file operand');
                const [target, link] = files; const [p, name] = this.parent(link);
                if (!p) return E(`ln: failed to create link '${link}': No such file or directory`);
                if (p.kids[name]) return E(`ln: failed to create link '${link}': File exists`);
                if (flags.includes('s')) { p.kids[name] = { t: 'l', target, mode: 0o777, ino: ++inodeCounter, mtime: new Date(), links: 1, owner: 'student' }; return { out: '' }; }
                const n = this.get(target); if (!n) return E(`ln: failed to access '${target}': No such file or directory`);
                if (n.t === 'd') return E(`ln: ${target}: hard link not allowed for directory`);
                n.links++; p.kids[name] = n; return { out: '' };
            },
            stat({ files, E }) {
                const n = this.get(files[0], false); if (!n) return E(`stat: cannot statx '${files[0]}': No such file or directory`);
                return { out: `  File: ${files[0]}\n  Size: ${this.sizeOf(n)}\tInode: ${n.ino}\tLinks: ${n.links}\nAccess: (${(n.mode & 0o7777).toString(8).padStart(4, '0')}/${this.modeStr(n)})  Uid: ${n.owner}\nModify: ${n.mtime.toISOString()}\n` };
            },
            file({ files, E }) {
                const n = this.get(files[0], false); if (!n) return E(`${files[0]}: cannot open (No such file or directory)`);
                return { out: `${files[0]}: ${n.t === 'd' ? 'directory' : n.t === 'l' ? 'symbolic link to ' + n.target : n.content ? 'ASCII text' : 'empty'}\n` };
            },
            man({ files, E }) { const f = files[0]; if (!f) return E('What manual page do you want?'); return { out: DEFS[f] ? `${f.toUpperCase()}(1)\n\nNAME\n    ${f} - ${DEFS[f]}\n` : `No manual entry for ${f}\n` }; },
            whatis({ files }) { return { out: DEFS[files[0]] ? `${files[0]} (1) - ${DEFS[files[0]]}\n` : `${files[0]}: nothing appropriate.\n` }; },
            help() { return { out: 'Supported: ' + Object.keys(this.cmds).sort().join(' ') + '\nAlso accepted silently: ' + NOOPS.join(' ') + '\nSupports pipes (|), redirects (> >>), ; and * ? globs.\n' }; }
        }
    };

    return S;
    }
    window.Shell = make('shell');
    window.ChallengeShell = make('ch');
})();
