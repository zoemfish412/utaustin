import { createTag, groupButtons } from '../../scripts/shared.js';

/**
 * Hero Split Video: photo-background banner with a text column (heading, paragraph,
 * CTA, stats) and a looping, muted video in a side column.
 * Content:
 * - row 1: background image
 * - row 2: heading, paragraph, CTA link, stat paragraphs ("**$18B** label") and a link to
 *   the video file (.mp4/.webm). The video may also sit in its own cell, with an optional
 *   poster image next to the link. Link text is the video's accessible title.
 * @param {Element} block
 */

const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

function isStat(el) {
  if (el.tagName !== 'P' || el.classList.contains('button-container')) return false;
  const first = el.firstElementChild;
  if (!first || first.tagName !== 'STRONG') return false;
  const leading = el.firstChild === first || !el.firstChild.textContent.trim();
  return leading && el.textContent.replace(first.textContent, '').trim().length > 0;
}

function buildStats(content) {
  let list = null;
  [...content.children].forEach((el) => {
    if (!isStat(el)) {
      list = null;
      return;
    }
    if (!list) {
      list = createTag('ul', { class: 'hero-split-video-stats' });
      el.before(list);
    }
    const strong = el.querySelector(':scope > strong');
    const value = createTag('span', { class: 'hero-split-video-stat-value' });
    value.append(...strong.childNodes);
    strong.remove();
    const label = createTag('span', { class: 'hero-split-video-stat-label' });
    label.append(...el.childNodes);
    label.innerHTML = label.innerHTML.replace(/^(\s|<br>)+/, '');
    const li = createTag('li', { class: 'hero-split-video-stat' });
    li.append(value, label);
    list.append(li);
    el.remove();
  });
}

function buildVideo(link, poster) {
  const title = link.textContent.trim();
  const video = createTag('video', {
    class: 'hero-split-video-video',
    playsinline: '',
    loop: '',
    preload: 'none',
  });
  video.muted = true;
  if (title && title !== link.href) video.setAttribute('title', title);
  const posterImg = poster?.querySelector('img');
  if (posterImg) video.poster = posterImg.currentSrc || posterImg.src;

  const src = link.href;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    observer.disconnect();
    video.src = src;
    if (!reduceMotion) video.play().catch(() => {});
    else video.controls = true;
  }, { rootMargin: '200px' });
  observer.observe(video);
  return video;
}

function removeEmptyHolder(el) {
  const holder = el.closest('p');
  el.remove();
  if (holder && !holder.textContent.trim() && !holder.querySelector('picture')) holder.remove();
}

export default function decorate(block) {
  const rows = [...block.children];
  const contentRow = rows.find((r) => r.querySelector('h1, h2, h3'))
    || rows.find((r) => !r.querySelector('picture'));

  const background = createTag('div', { class: 'hero-split-video-background' });
  const content = createTag('div', { class: 'hero-split-video-content' });
  const media = createTag('div', { class: 'hero-split-video-media' });
  let videoLink = null;
  let videoPoster = null;

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      const link = [...cell.querySelectorAll('a[href]')].find((a) => VIDEO_RE.test(a.href));
      const isContent = row === contentRow && cell.querySelector('h1, h2, h3');
      if (link && !isContent) {
        videoLink = link;
        videoPoster = cell.querySelector('picture');
        return;
      }
      if (row === contentRow) {
        content.append(...cell.children);
        return;
      }
      const pic = cell.querySelector('picture');
      if (pic && !background.children.length) background.append(pic);
    });
  });

  if (!videoLink) {
    videoLink = [...content.querySelectorAll('a[href]')].find((a) => VIDEO_RE.test(a.href));
  }

  content.querySelectorAll('picture').forEach((pic) => {
    const holder = pic.closest('p');
    if (!background.children.length) background.append(pic);
    else if (!videoPoster) videoPoster = pic;
    if (holder && !holder.textContent.trim() && !holder.querySelector('picture')) holder.remove();
  });

  if (videoLink) {
    media.append(buildVideo(videoLink, videoPoster));
    if (content.contains(videoLink)) removeEmptyHolder(videoLink);
    if (videoPoster && content.contains(videoPoster)) removeEmptyHolder(videoPoster);
  }

  content.querySelector('h1, h2, h3')?.classList.add('hero-split-video-title');
  groupButtons(content);
  buildStats(content);

  const bgImg = background.querySelector('img');
  if (bgImg) bgImg.alt = bgImg.alt || '';

  const inner = createTag('div', { class: 'hero-split-video-inner' }, content);
  if (media.children.length) inner.append(media);
  else block.classList.add('no-video');

  block.replaceChildren(...(background.children.length ? [background] : []), inner);
}
