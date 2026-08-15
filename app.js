// UWC Nav — theme toggle + link filter.
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
        const links = category.querySelectorAll(".link-list a");
        links.forEach(function (link) {
          const match = !query || link.textContent.toLowerCase().includes(query);
          link.closest("li").classList.toggle("hidden", !match);
          if (match) visible++;
        });
        category.classList.toggle("hidden", visible === 0);
      });
    });
  }
})();
