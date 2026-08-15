// UWC Nav — theme toggle, link filter, favicon fallback.
(function () {
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      const current = document.documentElement.dataset.theme
        ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      window.localStorage.setItem("owu-theme", next);
    });
  }

  const filter = document.getElementById("filter");
  if (filter) {
    filter.addEventListener("input", function () {
      const query = filter.value.trim().toLowerCase();
      const categories = document.querySelectorAll(".category");
      categories.forEach(function (category) {
        let visible = 0;
        const tiles = category.querySelectorAll(".tile");
        tiles.forEach(function (tile) {
          const match = !query || tile.textContent.toLowerCase().includes(query);
          tile.classList.toggle("hidden", !match);
          if (match) visible++;
        });
        category.classList.toggle("hidden", visible === 0);
      });
    });
  }

  // Favicon fallback: when a site has no icon, show its first letter.
  document.addEventListener("error", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    const icon = target.closest(".tile-icon, .pinned-icon");
    if (!icon) return;
    const link = icon.closest("a");
    const name = link ? link.textContent.trim() : "";
    icon.classList.add("fallback");
    icon.dataset.letter = name.charAt(0).toUpperCase() || "?";
    target.style.display = "none";
  }, true);
})();
