(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav-links]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  selectAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  });

  selectAll('.search-scope').forEach(function (scope) {
    var input = scope.querySelector('[data-card-search]');
    var chips = selectAll('[data-filter-value]', scope);
    var cards = selectAll('[data-movie-card]', scope);
    var activeValue = '';

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        var filterMatch = !activeValue || text.indexOf(activeValue.toLowerCase()) !== -1;
        card.classList.toggle('is-hidden', !(keywordMatch && filterMatch));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip, chipIndex) {
      chip.classList.toggle('active', chipIndex === 0);
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeValue = chip.getAttribute('data-filter-value') || '';
        apply();
      });
    });
  });
})();

function initPlayer(url) {
  var video = document.getElementById('movieVideo');
  var cover = document.getElementById('playCover');
  if (!video || !url) {
    return;
  }

  var loaded = false;

  function load() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = url;
    }
  }

  function play() {
    load();
    if (cover) {
      cover.classList.add('hidden');
    }
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('hidden');
    }
  });

  video.addEventListener('loadedmetadata', function () {
    if (video.paused && cover) {
      cover.classList.remove('hidden');
    }
  });
}
