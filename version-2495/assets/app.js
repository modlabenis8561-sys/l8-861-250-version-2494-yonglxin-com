(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    function normalize(text) {
        return String(text || '').trim().toLowerCase();
    }

    function applyFilters(scope) {
        var root = scope || document;
        var input = root.querySelector('[data-search-input]');
        var yearSelect = root.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
        var empty = root.querySelector('[data-empty-state]');
        var query = input ? normalize(input.value) : '';
        var year = yearSelect ? normalize(yearSelect.value) : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var matchesText = !query || haystack.indexOf(query) !== -1;
            var matchesYear = !year || cardYear.indexOf(year) !== -1;
            var shouldShow = matchesText && matchesYear;
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-query-init]')).forEach(function (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
        }
    });

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input], [data-filter-year]'));

    filterInputs.forEach(function (control) {
        control.addEventListener('input', function () {
            applyFilters(document);
        });
        control.addEventListener('change', function () {
            applyFilters(document);
        });
    });

    if (filterInputs.length) {
        applyFilters(document);
    }

    function startPlayer(player) {
        var video = player.querySelector('video');
        var streamUrl = player.getAttribute('data-stream');

        if (!video || !streamUrl) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = streamUrl;
            }
        } else if (window.Hls && window.Hls.isSupported()) {
            if (!video.hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            }
        } else if (!video.src) {
            video.src = streamUrl;
        }

        player.classList.add('is-playing');
        video.controls = true;

        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-play]'));
        var video = player.querySelector('video');

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                startPlayer(player);
            });
        });

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayer(player);
                }
            });
        }
    });
})();
