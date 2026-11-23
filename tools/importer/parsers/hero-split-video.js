/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-split-video.
 * Source: .block-homepage-outro ("For Texas, For the Future" outro).
 * Contract:
 *  - row 1: background image
 *  - row 2: heading, paragraph, CTA, stat paragraphs (<p><strong>$18B</strong> label</p>)
 *  - row 3: link to the side video (.mp4), optional .vtt track link
 */

// Background drawn by the source CSS: #ut-outro { background-image: url(...) }.
const FALLBACK_BG = '/modules/coresite/coresite_homepage/assets/forTexas-bkgd.jpg';

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

function textOf(el) {
  const copy = el.cloneNode(true);
  copy.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clean(copy.textContent);
}

function abs(url, base) {
  try {
    return new URL(url, base).href;
  } catch (e) {
    return url;
  }
}

function backgroundUrl(el, document) {
  const inline = el.getAttribute('style') || '';
  let m = inline.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
  if (m) return m[1];
  const view = document.defaultView;
  if (view && view.getComputedStyle) {
    const bg = view.getComputedStyle(el).backgroundImage || '';
    m = bg.match(/url\(["']?([^"')]+)["']?\)/i);
    if (m) return m[1];
  }
  return '';
}

/** Final counter value: fall back to the sr-only text when the counter is mid-animation (0). */
function counterValue(counter, stat) {
  let num = clean(counter.textContent).replace(/,/g, '');
  const sr = stat.querySelector('.sr-only, .visually-hidden');
  const srNum = sr ? (clean(sr.textContent).match(/[\d.,]+/) || [])[0] : '';
  if ((!num || Number(num) === 0) && srNum) num = srNum.replace(/,/g, '');
  if (/^\d{4,}$/.test(num)) num = Number(num).toLocaleString('en-US');

  const cls = counter.classList;
  const prefix = cls.contains('dollars') ? '$' : '';
  let suffix = '';
  if (cls.contains('billions')) suffix = 'B';
  else if (cls.contains('millions')) suffix = 'M';
  else if (cls.contains('thousands')) suffix = 'K';
  if (cls.contains('plus')) suffix += '+';
  return `${prefix}${num}${suffix}`;
}

function buildStat(stat, document) {
  const counter = stat.querySelector('.counter');
  if (!counter) return null;
  const label = [...stat.querySelectorAll(':scope > span')]
    .filter((s) => s !== counter && !s.matches('.sr-only, .visually-hidden'))
    .map((s) => textOf(s))
    .filter(Boolean)
    .join(' ');
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = counterValue(counter, stat);
  p.append(strong);
  if (label) p.append(document.createTextNode(` ${label}`));
  return p;
}

function linkPara(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  p.append(a);
  return p;
}

export default function parse(element, { document, params }) {
  const base = (params && params.originalURL) || 'https://www.utexas.edu/';
  const outro = element.querySelector('#ut-outro, .utexas-ut-outro') || element;

  // Row 1: background image.
  let bgImg = outro.querySelector(':scope > img');
  if (!bgImg) {
    const src = backgroundUrl(outro, document) || FALLBACK_BG;
    bgImg = document.createElement('img');
    bgImg.src = abs(src, base);
    bgImg.alt = '';
  } else if (bgImg.getAttribute('src')) {
    bgImg.src = abs(bgImg.getAttribute('src'), base);
  }

  // Row 2: text column.
  const textCol = outro.querySelector('.row > .col-md-7') || outro;
  const textCell = [];
  const heading = textCol.querySelector('h1, h2, h3');
  if (heading) {
    const lines = heading.innerHTML
      .split(/<br\s*\/?>/i)
      .map((part) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = part;
        return clean(tmp.textContent);
      })
      .filter(Boolean);
    const h2 = document.createElement('h2');
    lines.forEach((line, i) => {
      if (i > 0) h2.append(document.createElement('br'));
      h2.append(document.createTextNode(line));
    });
    textCell.push(h2);
  }
  [...textCol.querySelectorAll(':scope > p')].forEach((p) => {
    if (clean(p.textContent)) textCell.push(p);
  });
  const cta = textCol.querySelector('.btn-wrapper a[href]');
  if (cta) textCell.push(linkPara(document, cta.getAttribute('href'), clean(cta.textContent)));
  textCol.querySelectorAll('.stats > div').forEach((stat) => {
    const p = buildStat(stat, document);
    if (p) textCell.push(p);
  });

  const cells = [[[bgImg]], [textCell]];

  // Row 3: side video (+ optional poster and description track).
  const video = outro.querySelector('.ut-outro-img video, video');
  const videoSrc = video && (video.getAttribute('src')
    || (video.querySelector('source[src]') && video.querySelector('source[src]').getAttribute('src')));
  if (videoSrc) {
    const videoCell = [];
    const poster = video.getAttribute('poster');
    if (poster) {
      const img = document.createElement('img');
      img.src = abs(poster, base);
      img.alt = '';
      videoCell.push(img);
    }
    const href = abs(videoSrc, base);
    // The block does not consume a .vtt track, so only the video link is authored.
    videoCell.push(linkPara(document, href, video.getAttribute('title') || href));
    cells.push([videoCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-split-video', cells });
  element.replaceWith(block);
}
