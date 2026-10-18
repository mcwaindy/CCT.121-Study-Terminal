// Notes reader: topic list on the left, one topic at a time on the right.
(function () {
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
    const V = {
        topics: [], current: null,
        build() {
            this.topics = [];
            window.NOTES.forEach(mod => mod.sections.forEach(s => this.topics.push({ m: mod.m, mt: mod.title, ...s, text: (s.t + ' ' + s.b.join(' ')).toLowerCase() })));
        },
        bullet(b) {
            return `<p>${fmt(b)}</p>`;
        },
        render() {
            if (!this.topics.length) this.build();
            const host = document.getElementById('notesContainer');
            const q = document.getElementById('notesSearch').value.trim().toLowerCase();
            const mod = document.getElementById('moduleSelect').value.replace('Module', '');
            const vis = this.topics.filter(t => (!mod || String(t.m) === mod) && (!q || t.text.includes(q)));
            if (!vis.includes(this.current)) this.current = vis[0] || null;

            let list = '', last = null;
            vis.forEach(t => {
                if (t.m !== last) { list += `<div class="topic-module">Module ${t.m}: ${esc(t.mt)}</div>`; last = t.m; }
                list += `<button class="topic-btn ${t === this.current ? 'active' : ''}" data-i="${this.topics.indexOf(t)}">${esc(t.t)}</button>`;
            });
            const i = vis.indexOf(this.current);
            const body = this.current
                ? `<div class="topic-head"><span class="topic-tag">Module ${this.current.m}</span><h3>${esc(this.current.t)}</h3></div>
                   <div class="topic-prose">${this.current.b.map(b => this.bullet(b)).join('')}</div>
                   <div class="topic-nav"><button class="btn-secondary btn-sm" data-step="-1" ${i <= 0 ? 'disabled' : ''}>← Previous topic</button><span>${i + 1} / ${vis.length}</span><button class="btn-secondary btn-sm" data-step="1" ${i >= vis.length - 1 ? 'disabled' : ''}>Next topic →</button></div>`
                : '<p class="muted">No topics match.</p>';
            host.innerHTML = `<div class="notes-layout"><nav class="topic-index">${list}</nav><article class="topic-view">${body}</article></div>`;

            host.querySelectorAll('.topic-btn').forEach(b => b.addEventListener('click', () => { this.current = this.topics[+b.dataset.i]; this.render(); host.querySelector('.topic-view').scrollIntoView({ block: 'nearest' }); }));
            host.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { this.current = vis[i + +b.dataset.step]; this.render(); window.scrollTo(0, 0); }));
        }
    };
    window.NotesView = V;
})();
