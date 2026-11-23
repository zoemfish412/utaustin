/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-announcement.
 * Source: .block-coresite-news-alert (critical news alert bar on www.utexas.edu).
 * Contract: one row, two cells: logo image | one line of text wrapped in the bar's link.
 */
export default function parse(element, { document }) {
  const barLink = element.querySelector('a.critical-news-alert--wrapper') || element.querySelector('a[href]');
  const img = element.querySelector('.critical-news-image img') || element.querySelector('img');
  const textEl = element.querySelector('.critical-news-headline p')
    || element.querySelector('.critical-news-headline');

  const imageCell = [];
  if (img) imageCell.push(img);

  const textCell = [];
  const text = textEl ? textEl.textContent.replace(/\s+/g, ' ').trim() : '';
  if (text) {
    const p = document.createElement('p');
    if (barLink && barLink.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = barLink.getAttribute('href');
      a.textContent = text;
      p.append(a);
    } else {
      p.textContent = text;
    }
    textCell.push(p);
  }

  const cells = [[imageCell, textCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-announcement', cells });
  element.replaceWith(block);
}
