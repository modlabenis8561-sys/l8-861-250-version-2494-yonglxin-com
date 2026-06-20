(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var previous = document.querySelector(".hero-control--prev");
    var next = document.querySelector(".hero-control--next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalizeText(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function applyInitialQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var input = document.querySelector("[data-filter-input]");
    if (q && input) {
      input.value = q;
    }
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
    if (!cards.length) {
      return;
    }

    function matches(card) {
      var query = normalizeText(input ? input.value : "");
      var wantedRegion = normalizeText(region ? region.value : "");
      var wantedType = normalizeText(type ? type.value : "");
      var wantedYear = normalizeText(year ? year.value : "");
      var cardSearch = normalizeText(card.getAttribute("data-search"));
      var cardRegion = normalizeText(card.getAttribute("data-region"));
      var cardType = normalizeText(card.getAttribute("data-type"));
      var cardYear = normalizeText(card.getAttribute("data-year"));
      return (!query || cardSearch.indexOf(query) !== -1)
        && (!wantedRegion || cardRegion.indexOf(wantedRegion) !== -1)
        && (!wantedType || cardType.indexOf(wantedType) !== -1)
        && (!wantedYear || cardYear === wantedYear);
    }

    function update() {
      cards.forEach(function (card) {
        card.classList.toggle("hidden-by-filter", !matches(card));
      });
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });
    update();
  }

  function attachStream(video, streamUrl) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.src !== streamUrl) {
        video.src = streamUrl;
      }
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video.__hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.__hlsInstance = hls;
      }
      return;
    }
    if (video.src !== streamUrl) {
      video.src = streamUrl;
    }
  }

  window.initMoviePlayer = function (config) {
    ready(function () {
      var video = document.getElementById(config.videoId);
      var overlay = document.getElementById(config.overlayId);
      var button = document.getElementById(config.playButtonId);
      if (!video || !config.streamUrl) {
        return;
      }

      function start(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        attachStream(video, config.streamUrl);
        video.controls = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  };

  ready(function () {
    applyInitialQuery();
    initMobileNav();
    initHeroCarousel();
    initFilters();
  });
})();
