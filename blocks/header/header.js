import { getMetadata } from '../../scripts/aem.js';
import { createTag } from '../../scripts/shared.js';

/*
 * Header (UT Austin): orange utility bar + white main bar with megamenus.
 * Content lives in nav.plain.html; this file only reads and arranges it.
 * Sections: 1 audience links, 2 utility links + CTAs + search link, 3 logo,
 * 4 main navigation, then one section per megamenu feature card whose
 * heading names the menu it belongs to.
 */

const DESKTOP = window.matchMedia('(width >= 1200px)');

/**
 * Fetch the nav fragment: /content first (local aem up), then the site root (DA/EDS).
 * @returns {Promise<Element|null>} wrapper holding the fragment sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // relative image paths are relative to the fragment, not to the current page
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return wrapper;
}

const norm = (text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase();

/** Own text of a list item, without its nested list. */
function ownText(li) {
  return [...li.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && !n.matches('ul, ol')))
    .map((n) => n.textContent)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Move decorative images authored next to a link into the link (icon before/after text).
 * @param {Element} container
 */
function attachIcons(container) {
  container.querySelectorAll('img').forEach((img) => {
    const parent = img.parentElement;
    const link = parent.querySelector(':scope > a');
    if (!link || link.contains(img)) return;
    img.classList.add('nav-icon');
    if (!img.alt) img.setAttribute('aria-hidden', 'true');
    const before = img.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING;
    if (before) link.prepend(img);
    else link.append(img);
  });
}

/**
 * Plain list of links (keeps authored anchors).
 * @param {Element} ul
 * @param {string} [cls]
 * @returns {HTMLUListElement}
 */
function buildLinkList(ul, cls) {
  const list = createTag('ul', cls ? { class: cls } : {});
  ul.querySelectorAll(':scope > li').forEach((li) => {
    attachIcons(li);
    const item = createTag('li');
    item.append(...li.childNodes);
    list.append(item);
  });
  return list;
}

/**
 * Link group as a labelled navigation landmark.
 * @param {Element} ul authored list
 * @param {string} cls
 * @param {string} label accessible name
 * @returns {HTMLElement}
 */
function buildLinkGroup(ul, cls, label) {
  return createTag('nav', { class: cls, 'aria-label': label }, buildLinkList(ul));
}

/**
 * Search form built from the authored search link: the link target is the form action, its
 * first query parameter names the field and its text is the label/placeholder.
 * @param {HTMLAnchorElement} link
 * @returns {HTMLFormElement}
 */
function buildSearch(link) {
  const url = new URL(link.href);
  const field = [...url.searchParams.keys()][0] || 'q';
  const label = link.textContent.trim();
  const form = createTag('form', {
    class: 'nav-search', role: 'search', action: `${url.origin}${url.pathname}`, method: 'get',
  });
  const id = 'nav-search-input';
  const input = createTag('input', {
    id, type: 'search', name: field, placeholder: label, autocomplete: 'off',
  });
  form.append(
    createTag('label', { for: id, class: 'nav-visually-hidden' }, label),
    input,
    createTag('button', { type: 'submit', class: 'nav-search-submit', 'aria-label': label }),
  );
  return form;
}

/**
 * Feature card (image + headline + text + CTA) from a feature section.
 * @param {Element} section
 * @returns {HTMLDivElement}
 */
function buildFeature(section) {
  const feature = createTag('div', { class: 'nav-feature' });
  const img = section.querySelector('img');
  if (img) {
    img.loading = 'lazy';
    feature.append(createTag('div', { class: 'nav-feature-image' }, img));
  }
  const text = createTag('div', { class: 'nav-feature-text' });
  [...section.children].forEach((el) => {
    if (el.matches('h2') || !el.textContent.trim()) return;
    const onlyLink = el.matches('p') && el.children.length === 1
      && el.firstElementChild.matches('a') && el.textContent.trim() === el.firstElementChild.textContent.trim();
    if (onlyLink) el.classList.add('nav-feature-cta');
    text.append(el);
  });
  feature.append(text);
  return feature;
}

function closeAll(nav, except) {
  nav.querySelectorAll('.nav-drop-label[aria-expanded="true"]').forEach((btn) => {
    if (btn !== except) btn.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Main navigation: plain links and megamenu triggers (items with a nested list).
 * @param {Element} section main nav section
 * @param {Element[]} featureSections
 * @param {Element} nav
 * @returns {HTMLDivElement}
 */
function buildMainNav(section, featureSections, nav, label) {
  const wrap = createTag('nav', { class: 'nav-main', 'aria-label': label });
  const list = createTag('ul');
  const top = section?.querySelector('ul');
  let dropIndex = 0;
  [...(top?.children || [])].forEach((li, i) => {
    const sub = li.querySelector(':scope > ul');
    const item = createTag('li');
    if (!sub) {
      attachIcons(li);
      item.append(...li.childNodes);
      list.append(item);
      return;
    }
    const label = ownText(li);
    const panelId = `nav-panel-${i}`;
    item.classList.add('nav-drop');
    const btn = createTag('button', {
      type: 'button', class: 'nav-drop-label', 'aria-expanded': 'false', 'aria-controls': panelId,
    }, label);
    const panel = createTag('div', { class: 'nav-panel', id: panelId });
    const inner = createTag('div', { class: 'nav-panel-inner' });
    const featureSection = featureSections.find((s) => norm(s.querySelector('h2')?.textContent) === norm(label))
      || featureSections[dropIndex];
    dropIndex += 1;
    if (featureSection) inner.append(buildFeature(featureSection));
    const links = buildLinkList(sub, 'nav-sub');
    const rows = Math.ceil(links.children.length / 2);
    links.style.setProperty('--nav-sub-rows', rows);
    [...links.children].forEach((sublink, n) => {
      if ((n + 1) % rows === 0 || n === links.children.length - 1) sublink.classList.add('nav-sub-last');
    });
    inner.append(links);
    panel.append(inner);
    item.append(btn, panel);

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      closeAll(nav, btn);
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    item.addEventListener('mouseenter', () => {
      if (!DESKTOP.matches) return;
      closeAll(nav, btn);
      btn.setAttribute('aria-expanded', 'true');
    });
    item.addEventListener('mouseleave', () => {
      if (DESKTOP.matches) btn.setAttribute('aria-expanded', 'false');
    });
    list.append(item);
  });
  wrap.append(list);
  return wrap;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;
  const [audienceSec, toolsSec, brandSec, mainSec, ...featureSecs] = [...fragment.querySelectorAll(':scope > div')];

  block.textContent = '';
  const wrapper = createTag('div', { class: 'nav-wrapper' });
  const label = (key, fallback) => getMetadata(key) || fallback;
  const nav = createTag('div', { class: 'nav', id: 'nav' });

  /* logo + menu button (menu button is mobile only). The home link text names the logo. */
  const bar = createTag('div', { class: 'nav-bar' });
  const brandLink = brandSec?.querySelector('a');
  if (brandLink) {
    const logo = brandSec.querySelector('img');
    const name = brandLink.textContent.trim() || logo?.alt || '';
    brandLink.textContent = '';
    if (logo) {
      logo.alt = '';
      brandLink.append(logo);
    }
    brandLink.append(createTag('span', { class: 'nav-visually-hidden' }, name));
    brandLink.classList.add('nav-brand');
    bar.append(brandLink);
  }
  const menuLabel = label('nav-menu-label', 'Menu');
  const hamburger = createTag('button', {
    type: 'button', class: 'nav-hamburger', 'aria-controls': 'nav-drawer', 'aria-expanded': 'false', 'aria-label': menuLabel,
  });
  bar.append(hamburger);

  /* drawer: on desktop its parts lay out as the orange bar and the main menu */
  const drawer = createTag('div', { class: 'nav-drawer', id: 'nav-drawer' });
  const topBar = createTag('div', { class: 'nav-top' });
  const topInner = createTag('div', { class: 'nav-top-inner' });
  const audience = audienceSec?.querySelector('ul');
  if (audience) topInner.append(buildLinkGroup(audience, 'nav-audience', label('nav-audience-label', 'Audiences')));

  const tools = createTag('div', { class: 'nav-tools' });
  const utility = toolsSec?.querySelector('ul');
  if (utility) tools.append(buildLinkGroup(utility, 'nav-utility', label('nav-utility-label', 'Utility links')));
  const ctas = createTag('div', { class: 'nav-ctas' });
  const paragraphs = [...(toolsSec?.querySelectorAll(':scope > p') || [])];
  const searchP = paragraphs.length > 0 ? paragraphs[paragraphs.length - 1] : null;
  paragraphs.forEach((p) => {
    const a = p.querySelector('a');
    if (!a) return;
    if (p === searchP) {
      tools.append(buildSearch(a));
      return;
    }
    attachIcons(p);
    a.classList.add('nav-cta');
    ctas.append(a);
  });
  tools.append(ctas);
  topInner.append(tools);
  topBar.append(topInner);

  drawer.append(topBar, buildMainNav(mainSec, featureSecs, nav, label('nav-main-label', 'Main Menu')));
  nav.append(bar, drawer);
  wrapper.append(nav);
  block.append(wrapper);

  /* mobile drawer */
  const setDrawer = (open) => {
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('is-open', open);
  };
  hamburger.addEventListener('click', () => setDrawer(hamburger.getAttribute('aria-expanded') !== 'true'));

  /* close menus on outside click and Escape */
  document.addEventListener('click', (e) => {
    if (DESKTOP.matches && !nav.contains(e.target)) closeAll(nav);
  });
  nav.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = nav.querySelector('.nav-drop-label[aria-expanded="true"]');
    if (open) {
      closeAll(nav);
      open.focus();
    } else if (!DESKTOP.matches && nav.classList.contains('is-open')) {
      setDrawer(false);
      hamburger.focus();
    }
  });

  /* crossing the breakpoint resets everything */
  DESKTOP.addEventListener('change', () => {
    closeAll(nav);
    setDrawer(false);
  });
}
