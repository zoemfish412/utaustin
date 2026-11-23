/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-impact.
 * Source: .block-coresite-impact-1/2/3 (differentiator panels on www.utexas.edu).
 * Contract: one row, two cells:
 *   image | heading + paragraph + CTA + stat paragraphs.
 * Each stat is a paragraph starting with its bold value: <p><strong>#1</strong> Public University in Texas</p>
 */

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

/** Text of an element with <br> treated as a space ("EXPENDITURES<br>IN" -> "EXPENDITURES IN"). */
function textOf(el) {
  const copy = el.cloneNode(true);
  copy.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  return clean(copy.textContent);
}

/**
 * Final displayed value of an animated counter. The scraped DOM may hold a
 * mid-animation number, so prefer the screen-reader text ("122 thousand",
 * "1.37 billion dollars") when the counter reads 0, and re-add the prefixes /
 * suffixes the source CSS draws with ::before / ::after.
 */
function counterValue(counter, stat) {
  let num = clean(counter.textContent).replace(/,/g, '');
  const sr = stat.querySelector('.sr-only, .visually-hidden');
  const srNum = sr ? (clean(sr.textContent).match(/[\d.,]+/) || [])[0] : '';
  if ((!num || Number(num) === 0) && srNum) num = srNum.replace(/,/g, '');

  const cls = counter.classList;
  if (/^\d{4,}$/.test(num)) num = Number(num).toLocaleString('en-US');

  let prefix = '';
  let suffix = '';
  if (cls.contains('dollars')) prefix = '$';
  if (cls.contains('billions')) suffix = 'B';
  else if (cls.contains('millions')) suffix = 'M';
  else if (cls.contains('thousands')) suffix = 'K';
  if (cls.contains('plus')) suffix += '+';
  // The first panel's rankings render as "#1" / "#8".
  if (!prefix && !suffix && counter.closest('.diff-one')) prefix = '#';
  return `${prefix}${num}${suffix}`;
}

function buildStat(stat, document) {
  const counter = stat.querySelector('.counter');
  if (!counter) return null;
  // Label = the stat's text without the counter and screen-reader duplicates.
  const copy = stat.cloneNode(true);
  copy.querySelectorAll('.counter, .sr-only, .visually-hidden').forEach((s) => s.remove());
  const label = textOf(copy);
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = counterValue(counter, stat);
  p.append(strong);
  if (label) p.append(document.createTextNode(` ${label}`));
  return p;
}

export default function parse(element, { document, params }) {
  const base = (params && params.originalURL) || 'https://www.utexas.edu/';
  const img = element.querySelector('.image-wrapper img') || element.querySelector('img');
  if (img && img.getAttribute('src')) {
    try {
      img.src = new URL(img.getAttribute('src'), base).href;
    } catch (e) { /* keep original src */ }
  }

  const content = element.querySelector('.content-wrapper') || element;

  const textCell = [];
  const heading = content.querySelector('h1, h2, h3');
  if (heading) textCell.push(heading);

  [...content.querySelectorAll(':scope > p')].forEach((p) => {
    if (clean(p.textContent)) textCell.push(p);
  });

  const cta = content.querySelector('.differentiator-link-wrapper a[href]');
  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = clean(cta.textContent);
    p.append(a);
    textCell.push(p);
  }

  content.querySelectorAll('.stats > div').forEach((stat) => {
    const p = buildStat(stat, document);
    if (p) textCell.push(p);
  });

  const cells = [[img ? [img] : '', textCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-impact', cells });
  element.replaceWith(block);
}
