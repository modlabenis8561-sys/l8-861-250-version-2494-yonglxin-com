(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.getElementById("mobileMenu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
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
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalized(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupSearchAndFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var count = document.querySelector("[data-result-count]");
    var globalForm = document.querySelector("[data-global-search]");
    var pageForm = document.querySelector("[data-page-search]");
    var queryInput = null;
    if (globalForm) {
      queryInput = globalForm.querySelector("input[type='search']");
    }
    if (!queryInput && pageForm) {
      queryInput = pageForm.querySelector("input[type='search']");
    }
    var params = new URLSearchParams(window.location.search);
    if (queryInput && params.get("q")) {
      queryInput.value = params.get("q");
    }
    function getFilter(name) {
      var select = document.querySelector("[data-filter='" + name + "']");
      return select ? normalized(select.value) : "";
    }
    function apply() {
      var query = normalized(queryInput ? queryInput.value : "");
      var region = getFilter("region");
      var type = getFilter("type");
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalized(card.getAttribute("data-keywords") || card.textContent);
        var regionValue = normalized(card.getAttribute("data-region"));
        var typeValue = normalized(card.getAttribute("data-type"));
        var ok = true;
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (region && regionValue !== region) {
          ok = false;
        }
        if (type && typeValue !== type) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });
      if (count) {
        count.textContent = "共 " + shown + " 部影片";
      }
    }
    if (globalForm) {
      globalForm.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    }
    if (pageForm) {
      pageForm.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    }
    if (queryInput) {
      queryInput.addEventListener("input", apply);
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-filter]")).forEach(function (select) {
      select.addEventListener("change", apply);
    });
    if (cards.length) {
      apply();
    }
  }

  function setupSorting() {
    var select = document.querySelector("[data-sort-select]");
    var container = document.querySelector("[data-sort-container]");
    if (!select || !container) {
      return;
    }
    function valueOf(card, key) {
      if (key === "rating") {
        return parseFloat(card.getAttribute("data-rating") || "0");
      }
      if (key === "views") {
        return parseInt(card.getAttribute("data-views") || "0", 10);
      }
      if (key === "year") {
        return parseInt((card.getAttribute("data-year") || "0").replace(/[^0-9]/g, ""), 10) || 0;
      }
      return Date.parse(card.getAttribute("data-date") || "1970-01-01") || 0;
    }
    function sortCards() {
      var key = select.value || "date";
      var cards = Array.prototype.slice.call(container.children);
      cards.sort(function (a, b) {
        return valueOf(b, key) - valueOf(a, key);
      });
      cards.forEach(function (card) {
        container.appendChild(card);
      });
    }
    select.addEventListener("change", sortCards);
    sortCards();
  }

  function initPlayer(playUrl) {
    ready(function () {
      var video = document.getElementById("movieVideo");
      var shell = document.getElementById("playerShell");
      var startButton = document.getElementById("playerStart");
      var playButton = document.getElementById("playerPlayToggle");
      var muteButton = document.getElementById("playerMuteToggle");
      var fullButton = document.getElementById("playerFullscreen");
      if (!video || !shell || !playUrl) {
        return;
      }
      var bound = false;
      var hlsInstance = null;
      function bind() {
        if (bound) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playUrl;
          bound = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(playUrl);
          hlsInstance.attachMedia(video);
          bound = true;
          return;
        }
        video.src = playUrl;
        bound = true;
      }
      function play() {
        bind();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      function toggle() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }
      video.addEventListener("click", toggle);
      if (startButton) {
        startButton.addEventListener("click", play);
      }
      if (playButton) {
        playButton.addEventListener("click", toggle);
      }
      if (muteButton) {
        muteButton.addEventListener("click", function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
      }
      if (fullButton) {
        fullButton.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (shell.requestFullscreen) {
            shell.requestFullscreen();
          }
        });
      }
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
        if (playButton) {
          playButton.textContent = "暂停";
        }
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
        if (playButton) {
          playButton.textContent = "播放";
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearchAndFilters();
    setupSorting();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
