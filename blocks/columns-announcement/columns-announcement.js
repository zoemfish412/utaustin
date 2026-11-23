/**
 * Columns Announcement: slim linked bar — logo graphic beside one line of text.
 * Content: one row, two cells (logo image | text with link).
 * When the bar holds a single link, the whole bar becomes clickable.
 * @param {Element} block
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add('columns-announcement-row');

  [...row.children].forEach((cell) => {
    const onlyPicture = cell.querySelector('picture') && !cell.textContent.trim();
    cell.classList.add(onlyPicture ? 'columns-announcement-logo' : 'columns-announcement-text');
  });

  block.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
  block.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));

  const links = [...new Set([...block.querySelectorAll('a[href]')].map((a) => a.href))];
  if (links.length === 1) {
    const primary = block.querySelector('.columns-announcement-text a[href]') || block.querySelector('a[href]');
    primary.classList.add('columns-announcement-link');
    block.classList.add('columns-announcement-linked');
  }

  block.querySelectorAll('picture img').forEach((img) => {
    img.loading = 'eager';
  });
}
