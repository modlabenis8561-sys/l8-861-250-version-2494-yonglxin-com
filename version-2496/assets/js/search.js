(function () {
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function card(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3).join(" ") : "";
    return [
      "<article class=\"movie-card\">",
      "<a class=\"movie-link\" href=\"" + escapeHtml(movie.url) + "\">",
      "<div class=\"movie-poster\">",
      "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.remove()\">",
      "<span class=\"movie-badge\">" + escapeHtml(movie.year) + "</span>",
      "</div>",
      "<div class=\"movie-info\">",
      "<h3>" + escapeHtml(movie.title) + "</h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.category) + "</span></div>",
      "<div class=\"tag-row\"><span>" + escapeHtml(movie.genre) + "</span>" + (tags ? "<span>" + escapeHtml(tags) + "</span>" : "") + "</div>",
      "</div>",
      "</a>",
      "</article>"
    ].join("");
  }

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var form = document.querySelector("[data-search-page-form]");
    var grid = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var empty = document.querySelector("[data-search-empty]");
    if (!form || !grid || !window.MOVIES_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var input = form.querySelector("input[name='q']");
    var type = form.querySelector("select[name='type']");
    var year = form.querySelector("select[name='year']");
    if (input) {
      input.value = params.get("q") || "";
    }

    function render() {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var list = window.MOVIES_SEARCH_DATA.filter(function (movie) {
        var text = normalize([movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" "));
        return (!keyword || text.indexOf(keyword) !== -1) &&
          (!typeValue || normalize(movie.type) === typeValue) &&
          (!yearValue || normalize(movie.year) === yearValue);
      }).slice(0, 120);

      if (!keyword && !typeValue && !yearValue) {
        list = window.MOVIES_SEARCH_DATA.slice(0, 48);
      }

      if (title) {
        title.textContent = keyword ? "相关影片" : "精选影片";
      }
      grid.innerHTML = list.map(card).join("");
      if (empty) {
        empty.hidden = list.length !== 0;
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    [input, type, year].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", render);
      control.addEventListener("change", render);
    });
    render();
  });
})();
