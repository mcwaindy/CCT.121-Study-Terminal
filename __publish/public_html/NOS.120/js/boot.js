/* Loads content/manifest.js, then each chapter file it lists. A missing chapter file is skipped, not fatal. */
(async () => {
  const load = src => new Promise(res => {
    const s = document.createElement("script");
    s.src = src; s.onload = () => res(true);
    s.onerror = () => { console.warn("Could not load", src); NOS.failed.push(src); res(false); };
    document.head.appendChild(s);
  });
  await NOS.store.init();
  await load("content/manifest.js");
  for (const f of NOS.manifest) await load("content/" + f);
  NOS.start();
})();
