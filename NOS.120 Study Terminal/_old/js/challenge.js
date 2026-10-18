// Command Challenge controller: tasks run in a sandboxed simulated shell; success is checked against shell state.
(function () {
    const C = {
        list: [], idx: 0, solved: false,
        done: new Set(JSON.parse(localStorage.getItem('nos120.challenges') || '[]')),
        $: id => document.getElementById(id),

        init() {
            this.sh = window.ChallengeShell;
            this.sh.init();
            this.sh.onRun = () => this.evaluate();
            this.$('challengeModule').addEventListener('change', () => this.rebuild());
            this.$('challengeHideDone').addEventListener('change', () => this.rebuild());
            this.$('challengeHintBtn').addEventListener('click', () => { this.$('challengeHint').classList.toggle('hidden'); });
            this.$('challengeRestartBtn').addEventListener('click', () => this.load());
            this.$('challengeSkipBtn').addEventListener('click', () => this.step(1));
            this.$('challengeNextBtn').addEventListener('click', () => this.step(1));
            this.rebuild();
        },
        id(c) { return c.m + ':' + c.t; },
        rebuild() {
            const m = this.$('challengeModule').value, hide = this.$('challengeHideDone').checked;
            this.list = window.CHALLENGES.filter(c => (!m || String(c.m) === m) && (!hide || !this.done.has(this.id(c))));
            this.idx = 0; this.load();
        },
        step(d) { if (this.list.length) { this.idx = (this.idx + d + this.list.length) % this.list.length; this.load(); } },
        score() {
            this.$('challengeScore').textContent = `Completed ${window.CHALLENGES.filter(c => this.done.has(this.id(c))).length} / ${window.CHALLENGES.length}`;
        },
        load() {
            this.score();
            const res = this.$('challengeResult'); res.className = 'result-box hidden';
            this.$('challengeHint').classList.add('hidden');
            this.$('challengeNextBtn').classList.add('hidden');
            this.solved = false;
            const c = this.list[this.idx];
            if (!c) { this.$('challengeTitle').textContent = 'No tasks'; this.$('challengeTask').textContent = 'Nothing matches the current filter.'; return; }
            this.$('challengeTitle').textContent = `Module ${c.m} · Task ${this.idx + 1} of ${this.list.length}: ${c.t}`;
            this.$('challengeTask').textContent = c.task;
            this.$('challengeHint').textContent = 'Hint: ' + c.hint;
            this.sh.reset(true);
            (c.setup || []).forEach(s => this.sh.runSilent(s));
            this.sh.hist.length = 0; this.sh.hpos = 0;
            this.sh.input.focus();
        },
        evaluate() {
            const c = this.list[this.idx]; if (!c || this.solved) return;
            let ok = false; try { ok = !!c.check(this.sh); } catch { }
            if (!ok) return;
            this.solved = true; this.done.add(this.id(c));
            localStorage.setItem('nos120.challenges', JSON.stringify([...this.done]));
            const res = this.$('challengeResult');
            res.className = 'result-box visible success';
            res.innerHTML = '<strong>✓ Task complete.</strong> You can keep experimenting here, or move on.';
            this.$('challengeNextBtn').classList.remove('hidden');
            this.score();
        }
    };
    window.Challenges = C;
})();
