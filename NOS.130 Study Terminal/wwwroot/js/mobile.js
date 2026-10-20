/* Mobile nav drawer: toggles a class only; CSS decides whether it has any effect. */
(() => {
  const body = document.body;
  const bd = document.createElement("div");
  bd.id = "backdrop";
  body.appendChild(bd);
  const close = () => body.classList.remove("nav-open");
  document.getElementById("menuBtn").addEventListener("click", () => body.classList.toggle("nav-open"));
  bd.addEventListener("click", close);
  document.getElementById("sidebar").addEventListener("click", e => { if (e.target.closest("a")) close(); });
  window.addEventListener("hashchange", close);
  window.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 800) close(); });
})();
