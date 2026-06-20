document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const willOpen = mobileMenu.hasAttribute('hidden');
      mobileMenu.toggleAttribute('hidden', !willOpen);
      menuButton.setAttribute('aria-expanded', String(willOpen));
      menuButton.textContent = willOpen ? '×' : '☰';
    });
  }

  const backToTop = document.querySelector('.back-to-top');

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-hero]').forEach((hero) => {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const previous = hero.querySelector('.hero-prev');
    const next = hero.querySelector('.hero-next');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    previous?.addEventListener('click', () => {
      show(index - 1);
      start();
    });

    next?.addEventListener('click', () => {
      show(index + 1);
      start();
    });

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('.js-grid-filter').forEach((input) => {
    const section = input.closest('section') || document;
    const cards = Array.from(section.querySelectorAll('.movie-card'));

    input.addEventListener('input', () => {
      const keyword = input.value.trim().toLowerCase();

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region
        ].join(' ').toLowerCase();

        card.hidden = keyword.length > 0 && !haystack.includes(keyword);
      });
    });
  });
});
