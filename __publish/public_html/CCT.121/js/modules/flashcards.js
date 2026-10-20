/* Flashcards with simple Leitner boxes (0-4). Box >= 3 counts as mastered. */
CCT.addModule({
  id: "flashcards", title: "Flashcards", group: "Study", order: 2,
  render(el) {
    const boxes = CCT.store.get("fc", {});
    const cards = CCT.items("cards");
    const mastered = () => cards.filter(c => (boxes[c.id] || 0) >= 3).length;
    let queue = [], cur = null, flipped = false;

    const start = (onlyUnmastered) => {
      queue = CCT.shuffle(cards.filter(c => !onlyUnmastered || (boxes[c.id] || 0) < 3));
      next();
    };
    const menu = () => {
      el.innerHTML = `<h1>Flashcards</h1><div class="sub">Mastered ${mastered()} / ${cards.length} in this scope. "Got it" moves a card up a box; "Again" resets it.</div>
        <div class="row"><button class="btn pri" id="a">Study unmastered</button><button class="btn" id="b">Study all</button><button class="btn" id="r">Reset progress (scope)</button></div>`;
      CCT.$("#a", el).onclick = () => start(true);
      CCT.$("#b", el).onclick = () => start(false);
      CCT.$("#r", el).onclick = () => { if (confirm("Reset flashcard progress for this scope?")) { cards.forEach(c => delete boxes[c.id]); CCT.store.set("fc", boxes); menu(); } };
      if (!cards.length) CCT.$("#a", el).disabled = CCT.$("#b", el).disabled = true;
    };
    const next = () => {
      cur = queue.shift(); flipped = false;
      if (!cur) { el.innerHTML = `<h1>Done</h1><div class="card">Session complete. Mastered ${mastered()} / ${cards.length}.</div><button class="btn" id="m">Back</button>`; CCT.$("#m", el).onclick = menu; return; }
      draw();
    };
    const draw = () => {
      el.innerHTML = `<div class="sub">${queue.length + 1} left &middot; ${CCT.esc(CCT.chapterLabel(cur.chapter))} &middot; click card or press Space to flip</div>
        <div class="card flash ${flipped ? "back" : ""}" id="f">${CCT.esc(flipped ? cur.a : cur.q)}</div>
        <div class="row">${flipped ? `<button class="btn" id="no">Again</button><button class="btn pri" id="yes">Got it</button>` : `<button class="btn" id="fl">Flip</button>`}<button class="btn" id="m">End</button></div>`;
      const flip = () => { flipped = true; draw(); };
      CCT.$("#f", el).onclick = () => { if (!flipped) flip(); };
      if (flipped) {
        CCT.$("#yes", el).onclick = () => { boxes[cur.id] = Math.min(4, (boxes[cur.id] || 0) + 1); CCT.store.set("fc", boxes); next(); };
        CCT.$("#no", el).onclick = () => { boxes[cur.id] = 0; CCT.store.set("fc", boxes); queue.push(cur); next(); };
      } else CCT.$("#fl", el).onclick = flip;
      CCT.$("#m", el).onclick = menu;
    };
    const key = e => {
      if (!cur || /INPUT|SELECT/.test(document.activeElement.tagName)) return;
      if (e.code === "Space") { e.preventDefault(); if (!flipped) { flipped = true; draw(); } }
      else if (flipped && e.key === "1") CCT.$("#no", el).click();
      else if (flipped && e.key === "2") CCT.$("#yes", el).click();
    };
    document.addEventListener("keydown", key);
    menu();
    return () => document.removeEventListener("keydown", key);
  }
});
