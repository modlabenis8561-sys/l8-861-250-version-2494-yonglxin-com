(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    var input = document.querySelector(".js-search-input");
    var region = document.querySelector(".js-region-filter");
    var type = document.querySelector(".js-type-filter");
    var cards = selectAll(".movie-card");
    var q = normalize(input && input.value);
    var r = normalize(region && region.value);
    var t = normalize(type && type.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardType = normalize(card.getAttribute("data-type"));
      var matched = (!q || text.indexOf(q) !== -1) && (!r || cardRegion === r) && (!t || cardType === t);
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    selectAll(".no-results").forEach(function (node) {
      node.hidden = visible !== 0;
    });
  }

  function prepareSearchFromQuery() {
    var input = document.querySelector(".js-search-input");
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (q) {
      input.value = q;
      applyFilters();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initFilters() {
    selectAll(".js-search-input, .js-region-filter, .js-type-filter").forEach(function (node) {
      node.addEventListener("input", applyFilters);
      node.addEventListener("change", applyFilters);
    });
    prepareSearchFromQuery();
  }

  function initHero() {
    var hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function attachStream(video, stream) {
    if (!video || !stream) {
      return;
    }
    if (video.getAttribute("data-ready") === "true") {
      return;
    }
    video.setAttribute("data-ready", "true");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }

    video.src = stream;
  }

  window.initMoviePlayer = function (videoId, layerId, buttonId, stream) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var button = document.getElementById(buttonId);

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      attachStream(video, stream);
      if (layer) {
        layer.classList.add("is-hidden");
      }
      if (video) {
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (layer) {
      layer.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        attachStream(video, stream);
      });
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initFilters();
    initHero();
  });
})();
