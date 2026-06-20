(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-filter-input]");
        var year = panel.querySelector("[data-filter-year]");
        var type = panel.querySelector("[data-filter-type]");
        var category = panel.querySelector("[data-filter-category]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query && input) {
            input.value = query;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var selectedYear = year ? year.value : "";
            var selectedType = type ? type.value : "";
            var selectedCategory = category ? category.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var cardCategory = card.getAttribute("data-category") || "";
                var ok = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    ok = false;
                }
                if (selectedType && cardType.indexOf(selectedType) === -1) {
                    ok = false;
                }
                if (selectedCategory && cardCategory !== selectedCategory) {
                    ok = false;
                }

                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, year, type, category].forEach(function (element) {
            if (!element) {
                return;
            }
            element.addEventListener("input", apply);
            element.addEventListener("change", apply);
        });
        apply();
    }

    onReady(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
