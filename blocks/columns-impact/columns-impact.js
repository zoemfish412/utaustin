import { createTag, groupButtons } from '../../scripts/shared.js';

/**
 * Columns Impact: tall image beside a heading, paragraph, CTA and a row of stats.
 * Content: one row, two cells (image | heading, text, button, stat paragraphs).
 * A stat is a paragraph that starts with bold text: "**#1** Public University in Texas".
 * @param {Element} block
 */

function isStat(el) {
  if (el.tagName !== 'P' || el.classList.contains('button-container')) return false;
  const first = el.firstElementChild;
  if (!first || first.tagName !== 'STRONG') return false;
  const before = el.firstChild === first || !el.firstChild.textContent.trim();
  const rest = el.textContent.replace(first.textContent, '').trim();
  return before && rest.length > 0;
}

function buildStat(p) {
  const strong = p.querySelector(':scope > strong');
  const value = createTag('span', { class: 'columns-impact-stat-value' });
  value.append(...strong.childNodes);
  strong.remove();
  const label = createTag('span', { class: 'columns-impact-stat-label' });
  label.append(...p.childNodes);
  label.innerHTML = label.innerHTML.replace(/^(\s|<br>)+/, '');
  const li = createTag('li', { class: 'columns-impact-stat' });
  li.append(value, label);
  return li;
}

function decorateContent(cell) {
  groupButtons(cell);
  let list = null;
  [...cell.children].forEach((el) => {
    if (!isStat(el)) {
      list = null;
      return;
    }
    if (!list) {
      list = createTag('ul', { class: 'columns-impact-stats' });
      el.before(list);
    }
    list.append(buildStat(el));
    el.remove();
  });
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-impact-row');
    [...row.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && !cell.textContent.trim();
      if (onlyPicture) {
        cell.classList.add('columns-impact-img-col');
        return;
      }
      cell.classList.add('columns-impact-content');
      decorateContent(cell);
    });
  });
}
