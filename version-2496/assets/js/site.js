(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var keyword = input ? input.value.trim() : "";
        var base = form.getAttribute("data-base") || "";
        if (keyword) {
          window.location.href = base + "search.html?q=" + encodeURIComponent(keyword);
        } else {
          window.location.href = base + "search.html";
        }
      });
    });

    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        var opened = !menu.hasAttribute("hidden");
        if (opened) {
          menu.setAttribute("hidden", "");
        } else {
          menu.removeAttribute("hidden");
        }
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function schedule() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          schedule();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          schedule();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          schedule();
        });
      }

      show(0);
      schedule();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var region = scope.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

      function apply() {
        var keyword = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var matched = (!keyword || text.indexOf(keyword) !== -1) &&
            (!typeValue || cardType === typeValue) &&
            (!yearValue || cardYear === yearValue) &&
            (!regionValue || cardRegion === regionValue);
          card.hidden = !matched;
        });
      }

      [input, type, year, region].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });

      apply();
    });
  });
})();
