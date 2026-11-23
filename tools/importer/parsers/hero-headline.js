/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-headline.
 * Source: .block-coresite-homepagehero ("What Starts Here Changes The World").
 * Contract:
 *  - row 1: background image
 *  - row 2: heading (h2, words stacked with line breaks), optional paragraph, optional CTA
 */
export default function parse(element, { document }) {
  const bgImg = element.querySelector('.homepage-hero__background img') || element.querySelector('img');
  const sourceHeading = element.querySelector('.homepage-hero__headline') || element.querySelector('h1, h2, h3');

  const contentCell = [];
  if (sourceHeading) {
    // Rebuild the heading, keeping the <br> line breaks between the stacked words.
    const lines = sourceHeading.innerHTML
      .split(/<br\s*\/?>/i)
      .map((part) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = part;
        return tmp.textContent.replace(/\s+/g, ' ').trim();
      })
      .filter(Boolean);
    const h2 = document.createElement('h2');
    lines.forEach((line, i) => {
      if (i > 0) h2.append(document.createElement('br'));
      h2.append(document.createTextNode(line));
    });
    contentCell.push(h2);
  }

  // Optional paragraph / CTA (not present on the current source, kept for other instances).
  element.querySelectorAll(':scope p').forEach((p) => {
    if (p.closest('.homepage-hero__background')) return;
    if (p.textContent.trim()) contentCell.push(p);
  });

  const cells = [
    [bgImg ? [bgImg] : ''],
    [contentCell],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-headline', cells });
  element.replaceWith(block);
}
