/* Flashcards with simple Leitner boxes (0-4). Box >= 3 counts as mastered. */
NOS.addModule({
  id: "flashcards", title: "Flashcards", group: "Study", order: 2,
  render(el) {
    const boxes = NOS.store.get("fc", {});
    const cards = NOS.items("cards");
    const mastered = () => cards.filter(c => (boxes[c.id] || 0) >= 3).length;
    let queue = [], cur = null, flipped = false;

    const start = (onlyUnmastered) => {
      queue = NOS.shuffle(cards.filter(c => !onlyUnmastered || (boxes[c.id] || 0) < 3));
      next();
    };
    const menu = () => {
      el.innerHTML = `<h1>Flashcards</h1><div class="sub">Mastered ${mastered()} / ${cards.length} in this scope. "Got it" moves a card up a box; "Again" resets it.</div>
        <div class="row"><button class="btn pri" id="a">Study unmastered</button><button class="btn" id="b">Study all</button><button class="btn" id="r">Reset progress (scope)</button></div>`;
      NOS.$("#a", el).onclick = () => start(true);
      NOS.$("#b", el).onclick = () => start(false);
      NOS.$("#r", el).onclick = () => { if (confirm("Reset flashcard progress for this scope?")) { cards.forEach(c => delete boxes[c.id]); NOS.store.set("fc", boxes); menu(); } };
      if (!cards.length) NOS.$("#a", el).disabled = NOS.$("#b", el).disabled = true;
    };
    const next = () => {
      cur = queue.shift(); flipped = false;
      if (!cur) { el.innerHTML = `<h1>Done</h1><div class="card">Session complete. Mastered ${mastered()} / ${cards.length}.</div><button class="btn" id="m">Back</button>`; NOS.$("#m", el).onclick = menu; return; }
      draw();
    };
    const draw = () => {
      el.innerHTML = `<div class="sub">${queue.length + 1} left &middot; ${NOS.esc(NOS.chapterLabel(cur.chapter))} &middot; click card or press Space to flip</div>
        <div class="card flash ${flipped ? "back" : ""}" id="f">${NOS.esc(flipped ? cur.a : cur.q)}</div>
        <div class="row">${flipped ? `<button class="btn" id="no">Again</button><button class="btn pri" id="yes">Got it</button>` : `<button class="btn" id="fl">Flip</button>`}<button class="btn" id="m">End</button></div>`;
      const flip = () => { flipped = true; draw(); };
      NOS.$("#f", el).onclick = () => { if (!flipped) flip(); };
      if (flipped) {
        NOS.$("#yes", el).onclick = () => { boxes[cur.id] = Math.min(4, (boxes[cur.id] || 0) + 1); NOS.store.set("fc", boxes); next(); };
        NOS.$("#no", el).onclick = () => { boxes[cur.id] = 0; NOS.store.set("fc", boxes); queue.push(cur); next(); };
      } else NOS.$("#fl", el).onclick = flip;
      NOS.$("#m", el).onclick = menu;
    };
    const key = e => {
      if (!cur || /INPUT|SELECT/.test(document.activeElement.tagName)) return;
      if (e.code === "Space") { e.preventDefault(); if (!flipped) { flipped = true; draw(); } }
      else if (flipped && e.key === "1") NOS.$("#no", el).click();
      else if (flipped && e.key === "2") NOS.$("#yes", el).click();
    };
    document.addEventListener("keydown", key);
    menu();
    return () => document.removeEventListener("keydown", key);
  }
});
