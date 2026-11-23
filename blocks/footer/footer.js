import { createTag } from '../../scripts/shared.js';

/**
 * Fetches the footer fragment. Metadata-independent on purpose: `/content/footer.plain.html`
 * is served by the local dev server, `/footer.plain.html` by DA/EDS preview and live.
 * @returns {Promise<{ root: HTMLElement, base: string } | null>}
 */
async function fetchFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const root = document.createElement('div');
  root.innerHTML = await resp.text();
  return { root, base: resp.url };
}

/**
 * Makes relative media paths resolve against the fragment, not the page that shows the footer.
 * @param {HTMLElement} root
 * @param {string} base
 */
function resolveMedia(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  root.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), base).href;
  });
}

/** True when every list item is a link holding only an image (an icon row). */
const isIconList = (ul) => {
  const items = [...ul.children];
  return items.length > 0 && items.every((li) => li.querySelector('a') && li.querySelector('img')
    && !li.textContent.trim());
};

/**
 * Icon row: each image becomes a masked glyph so it takes the link colour,
 * the image's alt text becomes the link's (visually hidden) name.
 * @param {HTMLUListElement} ul
 */
function buildIconList(ul) {
  const list = createTag('ul', { class: 'footer-social' });
  [...ul.children].forEach((li) => {
    const a = li.querySelector('a');
    const img = li.querySelector('img');
    const glyph = createTag('span', { class: 'footer-social-glyph', 'aria-hidden': 'true' });
    glyph.style.setProperty('--footer-icon', `url("${img.src}")`);
    const link = createTag('a', { href: a.getAttribute('href'), class: 'footer-social-link' }, [
      glyph,
      createTag('span', { class: 'visually-hidden' }, img.alt.trim()),
    ]);
    list.append(createTag('li', {}, link));
  });
  return list;
}

/**
 * A paragraph holding a single text-only link (optionally bold/italic) is a call to action.
 * @param {HTMLParagraphElement} p
 */
function isCtaParagraph(p) {
  const links = p.querySelectorAll('a');
  return links.length === 1 && !p.querySelector('img, picture')
    && links[0].textContent.trim() === p.textContent.trim();
}

/** @param {HTMLParagraphElement} p */
function buildCta(p) {
  const a = p.querySelector('a');
  const cta = createTag('a', { href: a.getAttribute('href'), class: 'footer-cta' }, a.textContent.trim());
  return createTag('p', { class: 'footer-cta-wrapper' }, cta);
}

/**
 * Decorates one column: icon lists, CTA links, image links and plain link lists.
 * @param {HTMLElement} section
 * @returns {HTMLElement}
 */
function buildColumn(section) {
  const col = createTag('div', { class: 'footer-col' });
  const onlyList = section.children.length === 1 && section.firstElementChild.matches('ul');
  [...section.children].forEach((child) => {
    if (child.matches('ul') && isIconList(child)) {
      col.append(buildIconList(child));
    } else if (child.matches('ul')) {
      child.classList.add('footer-link-list');
      col.append(child);
    } else if (child.matches('p') && isCtaParagraph(child)) {
      col.append(buildCta(child));
    } else {
      if (child.matches('p') && child.querySelector('a img, a picture')) child.classList.add('footer-image-link');
      col.append(child);
    }
  });
  if (onlyList) {
    col.classList.add('footer-col-links');
    const inner = createTag('div', { class: 'footer-col-inner' });
    inner.append(...col.childNodes);
    col.append(inner);
  }
  return col;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  block.textContent = '';
  if (!fragment) return;
  const { root, base } = fragment;
  resolveMedia(root, base);
  root.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'lazy'));

  const sections = [...root.children].filter((el) => el.matches('div'));
  const bottomSection = sections.length > 1 ? sections.pop() : null;

  const container = createTag('div', { class: 'footer-container' });
  const main = createTag('div', { class: 'footer-main' });
  sections.forEach((section) => main.append(buildColumn(section)));
  container.append(main);

  if (bottomSection) {
    const bottom = createTag('div', { class: 'footer-bottom' });
    bottom.append(...bottomSection.childNodes);
    container.append(bottom);
  }
  block.append(container);
}
