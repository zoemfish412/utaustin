import { groupButtons } from '../../scripts/shared.js';

/**
 * Columns Promo: inset panel with an image beside a heading, paragraph and CTA.
 * Content: one row, two cells (image | heading, text, button).
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-promo-row');
    [...row.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && !cell.textContent.trim();
      if (onlyPicture) {
        cell.classList.add('columns-promo-img-col');
        return;
      }
      cell.classList.add('columns-promo-content');
      groupButtons(cell);
    });
  });
}
