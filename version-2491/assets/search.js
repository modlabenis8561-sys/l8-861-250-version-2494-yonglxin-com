import { MOVIES } from './search-data.js';

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');
const heading = document.querySelector('#search-heading');
const results = document.querySelector('#search-results');
const chips = document.querySelectorAll('[data-search]');

const params = new URLSearchParams(window.location.search);
const initialKeyword = params.get('q') || '';

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function card(movie) {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
<article class="movie-card">
  <a href="${escapeHtml(movie.href)}" aria-label="观看 ${escapeHtml(movie.title)}">
    <div class="movie-cover">
      <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
      <div class="movie-mask"><span>▶</span></div>
      <div class="movie-badges"><span>${escapeHtml(movie.type)}</span><span>${escapeHtml(movie.year)}</span></div>
    </div>
    <div class="movie-card-body">
      <h3>${escapeHtml(movie.title)}</h3>
      <p>${escapeHtml(movie.oneLine)}</p>
      <div class="movie-meta"><span>${escapeHtml(movie.region)}</span><span>${escapeHtml(movie.genre)}</span></div>
      <div class="tag-row">${tags}</div>
    </div>
  </a>
</article>`;
}

function render(keyword) {
  const value = keyword.trim().toLowerCase();

  if (!value) {
    heading.textContent = '输入关键词开始搜索';
    results.innerHTML = '';
    return;
  }

  const matched = MOVIES.filter((movie) => {
    const haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      movie.tags.join(' ')
    ].join(' ').toLowerCase();

    return haystack.includes(value);
  });

  heading.textContent = matched.length ? '搜索结果' : '未找到匹配内容';
  results.innerHTML = matched.slice(0, 240).map(card).join('');
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const keyword = input.value.trim();
  const url = new URL(window.location.href);

  if (keyword) {
    url.searchParams.set('q', keyword);
  } else {
    url.searchParams.delete('q');
  }

  history.replaceState(null, '', url);
  render(keyword);
});

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const keyword = chip.dataset.search || '';
    input.value = keyword;
    form?.requestSubmit();
  });
});

if (input) {
  input.value = initialKeyword;
  render(initialKeyword);
}
