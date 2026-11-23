/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-promo.
 * Source: #block-coretheme-homepagemidpagepromo (mid-page core curriculum promo).
 * Contract: one row, two cells: image | heading + text + CTA button.
 */
export default function parse(element, { document }) {
  const cols = [...element.querySelectorAll('.mid-page-bkgd .row > [class*="col-"]')];
  const imageCol = cols.find((c) => c.querySelector('img') && !c.querySelector('h1, h2, h3, p'))
    || element;
  const textCol = cols.find((c) => c.querySelector('h1, h2, h3, p')) || element;

  const img = imageCol.querySelector('img');
  const imageCell = img ? [img] : [];

  const textCell = [];
  [...textCol.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > p')].forEach((el) => {
    const link = el.tagName === 'P' ? el.querySelector('a[href]') : null;
    if (link && el.textContent.trim() === link.textContent.trim()) {
      // CTA button: a paragraph holding a single link.
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.replace(/\s+/g, ' ').trim();
      p.append(a);
      textCell.push(p);
    } else if (el.textContent.trim()) {
      textCell.push(el);
    }
  });

  const cells = [[imageCell, textCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
