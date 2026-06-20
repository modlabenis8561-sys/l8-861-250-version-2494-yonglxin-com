(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var current = 0;
            var timer = null;

            function show(index) {
                current = index;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle("is-active", itemIndex === current);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle("is-active", itemIndex === current);
                });
            }

            function next() {
                if (slides.length > 0) {
                    show((current + 1) % slides.length);
                }
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    if (timer) {
                        window.clearInterval(timer);
                    }
                    timer = window.setInterval(next, 5200);
                });
            });

            if (slides.length > 1) {
                timer = window.setInterval(next, 5200);
            }
        }

        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

            if (!input && !year) {
                return;
            }

            var queryInput = scope.querySelector("[data-query-input]");
            if (queryInput) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    queryInput.value = q;
                }
            }

            function filterCards() {
                var text = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var matchText = !text || haystack.indexOf(text) !== -1;
                    var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    card.hidden = !(matchText && matchYear);
                });
            }

            if (input) {
                input.addEventListener("input", filterCards);
            }

            if (year) {
                year.addEventListener("change", filterCards);
            }

            filterCards();
        });
    });
})();
