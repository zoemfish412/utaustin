import { createTag } from '../../scripts/shared.js';

/**
 * Video Bg Loop: full-bleed, muted, looping background video with a pause/play toggle.
 * Content:
 * - row 1: poster image + link to the video file (.mp4/.webm); optional link to a .vtt
 *   description track. The video link text is the video's accessible title.
 * - row 2 (optional): pause label | play label for the toggle button.
 * @param {Element} block
 */

const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
const TRACK_RE = /\.vtt(\?|#|$)/i;

function cleanupHolder(el) {
  const holder = el.closest('p');
  el.remove();
  if (holder && !holder.textContent.trim() && !holder.querySelector('picture')) holder.remove();
}

export default function decorate(block) {
  const rows = [...block.children];
  const links = [...block.querySelectorAll('a[href]')];
  const videoLink = links.find((a) => VIDEO_RE.test(a.href));
  const trackLink = links.find((a) => TRACK_RE.test(a.href));
  const picture = block.querySelector('picture');

  const labelRow = rows.find((row) => row !== rows[0] && !row.querySelector('a, picture'));
  const [pauseLabel, playLabel] = labelRow
    ? [...labelRow.children].map((c) => c.textContent.trim()) : [];

  const media = createTag('div', { class: 'video-bg-loop-media' });
  if (picture) {
    const poster = createTag('div', { class: 'video-bg-loop-poster' }, picture);
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
      img.alt = img.alt || '';
    }
    media.append(poster);
  }

  if (!videoLink) {
    block.replaceChildren(media);
    return;
  }

  const title = videoLink.textContent.trim();
  const src = videoLink.href;
  const video = createTag('video', {
    class: 'video-bg-loop-video',
    playsinline: '',
    loop: '',
    preload: 'none',
  });
  video.muted = true;
  if (title && title !== src) video.setAttribute('title', title);
  const posterImg = picture?.querySelector('img');
  if (posterImg) video.poster = posterImg.currentSrc || posterImg.src;

  if (trackLink) {
    video.append(createTag('track', {
      kind: 'descriptions',
      src: trackLink.href,
      srclang: document.documentElement.lang || 'en',
      label: trackLink.textContent.trim(),
    }));
    cleanupHolder(trackLink);
  }
  cleanupHolder(videoLink);
  media.append(video);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle = createTag('button', { type: 'button', class: 'video-bg-loop-toggle' });
  const setState = (playing) => {
    block.classList.toggle('is-playing', playing);
    if (pauseLabel && playLabel) {
      toggle.setAttribute('aria-label', playing ? pauseLabel : playLabel);
    } else {
      if (title) toggle.setAttribute('aria-label', title);
      toggle.setAttribute('aria-pressed', String(playing));
    }
  };
  setState(false);

  toggle.addEventListener('click', () => {
    if (!video.src) video.src = src;
    if (video.paused) video.play().catch(() => setState(false));
    else video.pause();
  });
  video.addEventListener('play', () => {
    block.classList.remove('is-paused');
    setState(true);
  });
  video.addEventListener('pause', () => {
    block.classList.add('is-paused');
    setState(false);
  });

  // like the source, the video only plays from 1200px up; smaller screens keep the poster
  const desktop = window.matchMedia('(width >= 1200px)');
  const start = () => {
    if (!video.src) video.src = src;
    if (!reduceMotion) video.play().catch(() => setState(false));
  };
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      if (desktop.matches) start();
      else desktop.addEventListener('change', (e) => { if (e.matches) start(); }, { once: true });
    }
  });
  observer.observe(block);

  block.replaceChildren(media, toggle);
}
