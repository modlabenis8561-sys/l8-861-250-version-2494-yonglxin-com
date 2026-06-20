import { H as Hls } from './hls.js';

export function setupPlayer(options) {
  const video = document.querySelector(options.selector);
  const overlay = document.querySelector(options.overlaySelector);
  const source = options.source;

  if (!video || !source) {
    return;
  }

  let hls = null;

  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  }

  const play = () => {
    video.play().catch(() => {});
  };

  overlay?.addEventListener('click', play);

  video.addEventListener('play', () => {
    overlay?.classList.add('is-hidden');
  });

  video.addEventListener('pause', () => {
    if (video.currentTime === 0 || video.ended) {
      overlay?.classList.remove('is-hidden');
    }
  });

  video.addEventListener('ended', () => {
    overlay?.classList.remove('is-hidden');
  });

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
    }
  });
}
