/* eslint-disable */
/* global WebImporter */

/**
 * Parser for video-bg-loop.
 * Source: .block-bundle-utexas-hero-video (looping hero video on www.utexas.edu).
 * Contract:
 *  - row 1: poster image (optional) + link to the video file (.mp4), optional link to a .vtt track
 *  - row 2: pause label | play label
 */
function toAbsolute(url, base) {
  if (!url) return '';
  try {
    return new URL(url, base).href;
  } catch (e) {
    return url;
  }
}

export default function parse(element, { document, params }) {
  const base = (params && params.originalURL) || 'https://www.utexas.edu/';
  const video = element.querySelector('video');
  const source = element.querySelector('video source[src]');
  const track = element.querySelector('video track[src]');

  const mainCell = [];

  // Poster image (optional): the video poster attribute, if present.
  const posterSrc = video && video.getAttribute('poster');
  if (posterSrc) {
    const img = document.createElement('img');
    img.src = toAbsolute(posterSrc, base);
    img.alt = '';
    mainCell.push(img);
  }

  const videoSrc = (source && source.getAttribute('src')) || (video && video.getAttribute('src'));
  if (videoSrc) {
    const href = toAbsolute(videoSrc, base);
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = (video && video.getAttribute('title')) || href;
    p.append(a);
    mainCell.push(p);
  }

  if (track) {
    const href = toAbsolute(track.getAttribute('src'), base);
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = track.getAttribute('label') || 'Video description';
    p.append(a);
    mainCell.push(p);
  }

  // Toggle labels: reuse the source button's hidden label ("Pause button") when present.
  // The source only renders the pause state, so the play label mirrors it.
  const btnLabel = element.querySelector('#play-pause .visually-hidden');
  const btnText = btnLabel ? btnLabel.textContent.replace(/\s+/g, ' ').trim() : '';
  const hasSourceLabel = /^pause\b/i.test(btnText);
  const pauseLabel = hasSourceLabel ? btnText : 'Pause';
  const playLabel = hasSourceLabel ? btnText.replace(/^pause/i, 'Play') : 'Play';

  const cells = [
    [mainCell, ''],
    [pauseLabel, playLabel],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'video-bg-loop', cells });
  element.replaceWith(block);
}
