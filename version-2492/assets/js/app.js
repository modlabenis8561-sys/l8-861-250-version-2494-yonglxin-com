(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
      toggle.textContent = expanded ? '☰' : '×';
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var list = document.querySelector('[data-search-list]');
  var input = document.getElementById('search-input');
  var category = document.getElementById('category-filter');
  var year = document.getElementById('year-filter');

  if (list && (input || category || year)) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (input && q) {
      input.value = q;
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var categoryValue = category ? category.value : '';
      var yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okCategory = !categoryValue || card.dataset.category === categoryValue;
        var okYear = !yearValue || card.dataset.year === yearValue;
        card.hidden = !(okKeyword && okCategory && okYear);
      });
    }

    if (input) input.addEventListener('input', applyFilters);
    if (category) category.addEventListener('change', applyFilters);
    if (year) year.addEventListener('change', applyFilters);
    applyFilters();
  }
})();

function setupPlayer(src) {
  var video = document.getElementById('video-player');
  var layer = document.getElementById('player-layer');
  var button = document.getElementById('play-button');
  var hlsInstance = null;
  var ready = false;

  if (!video || !src) {
    return;
  }

  function attachStream() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }

    ready = true;
  }

  function play() {
    attachStream();
    if (layer) {
      layer.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (layer) {
    layer.addEventListener('click', play);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      play();
    });
  }

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      play();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
