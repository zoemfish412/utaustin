import { createOptimizedPicture } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/**
 * Cards Stories: linked news stories — one prominent lead card beside a stack of
 * horizontal cards. The first row is the lead story.
 * Content: one row per story, two cells (image | headline linked to the detail page).
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = createTag('ul', { class: 'cards-stories-list' });

  [...block.children].forEach((row, idx) => {
    const li = createTag('li', { class: 'cards-stories-card' });
    if (idx === 0) li.classList.add('cards-stories-lead');

    [...row.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && !cell.textContent.trim();
      cell.className = onlyPicture ? 'cards-stories-image' : 'cards-stories-body';
      li.append(cell);
    });

    li.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
    li.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));

    const primary = li.querySelector('.cards-stories-body :is(h2, h3, h4) a[href]')
      || li.querySelector('.cards-stories-body a[href]')
      || li.querySelector('a[href]');
    if (primary) {
      primary.classList.add('cards-stories-link');
      li.classList.add('cards-stories-linked');
    }
    if (!li.querySelector('.cards-stories-image')) li.classList.add('cards-stories-text-only');

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const lead = img.closest('.cards-stories-lead');
    const width = lead ? '1200' : '750';
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width }]));
  });

  block.replaceChildren(ul);
}
