/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-stories.
 * Source: .university-stories (lead story + stacked secondary stories).
 * Contract: one row per story, two cells: image | headline linked to the story page.
 * The first row is the lead (featured) story.
 */
export default function parse(element, { document }) {
  // Each story is an anchor wrapping one .card; the lead (.card.prominent) goes first.
  const stories = [...element.querySelectorAll('a.university-stories__linked-box')];
  const ordered = [
    ...stories.filter((a) => a.querySelector('.card.prominent')),
    ...stories.filter((a) => !a.querySelector('.card.prominent')),
  ];

  const cells = [];
  ordered.forEach((link) => {
    const img = link.querySelector('.image-wrapper img') || link.querySelector('img');
    const headlineEl = link.querySelector('.headline');
    const text = headlineEl ? headlineEl.textContent.replace(/\s+/g, ' ').trim() : '';

    const textCell = [];
    if (text) {
      const h3 = document.createElement('h3');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = text;
      h3.append(a);
      textCell.push(h3);
    }

    cells.push([img ? [img] : '', textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stories', cells });

  // The "UT News" / "Texas Today Calendar" action links are default content
  // (authoring-analysis s4-2): keep them on the page, right after the block.
  const actionLinks = element.querySelector('.action-links');
  if (actionLinks && actionLinks.querySelector('a[href]')) {
    const p = document.createElement('p');
    [...actionLinks.querySelectorAll('a[href]')].forEach((a, i) => {
      if (i > 0) p.append(document.createTextNode(' '));
      p.append(a);
    });
    element.after(p);
  }

  element.replaceWith(block);
}
