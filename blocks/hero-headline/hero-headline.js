import { createTag, groupButtons } from '../../scripts/shared.js';

/**
 * Hero Headline: oversized headline set over a full-width background photo.
 * Content:
 * - row 1: background image
 * - row 2: heading (line breaks kept), optional paragraph, optional CTA link
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const contentRow = rows.find((r) => r.querySelector('h1, h2, h3'))
    || rows.find((r) => !r.querySelector('picture'));

  const background = createTag('div', { class: 'hero-headline-background' });
  const content = createTag('div', { class: 'hero-headline-content' });

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      if (row === contentRow) {
        content.append(...cell.children);
        return;
      }
      cell.querySelectorAll('picture').forEach((pic) => {
        if (!background.children.length) background.append(pic);
      });
    });
  });

  // a picture authored inside the content cell becomes the background when none was given
  content.querySelectorAll('picture').forEach((pic) => {
    const holder = pic.closest('p');
    if (!background.children.length) background.append(pic);
    if (holder && !holder.textContent.trim() && !holder.querySelector('picture')) holder.remove();
  });

  content.querySelector('h1, h2, h3')?.classList.add('hero-headline-title');
  groupButtons(content);

  const img = background.querySelector('img');
  if (img) {
    img.loading = 'eager';
    img.fetchPriority = 'high';
    img.alt = img.alt || '';
  }

  if (!background.children.length) block.classList.add('no-image');
  block.replaceChildren(...(background.children.length ? [background] : []), content);
}
