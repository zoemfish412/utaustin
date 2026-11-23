/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for www.utexas.edu.
 * Removes non-authorable site chrome (header, footer, flyout, share widgets)
 * and technical noise. Selectors taken from migration-work/cleaned.html.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Global header: mobile + desktop menus, search form, utility links.
    WebImporter.DOMUtils.remove(element, [
      '#coretheme-header',
      '#coretheme-mainmenu-wrapper',
      'a.visually-hidden.focusable[href="#main-content"]',
      // Fixed "Be a Longhorn" flyout inside the content region.
      '#block-coretheme-homepagewhatstartshereflyout',
      // Footer.
      'footer.ut-footer',
      // AddToAny social share widget.
      '#addtoany',
      '#drupal-live-announce',
    ]);

    // Empty spacer region (div.container-xl > ... > .region-highlighted).
    element.querySelectorAll('div.container-xl').forEach((el) => {
      if (el.querySelector('.region-highlighted') && !el.textContent.trim()
        && !el.querySelector('img, video, picture, iframe')) {
        el.remove();
      }
    });
  }

  if (hookName === 'afterTransform') {
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
      'form',
      'button',
    ]);

    // Decorative diagonal-lines pattern behind the orange intro band: it is part of the
    // section style (CSS), not authorable content, so drop it before background images
    // are turned into <img> elements.
    const DECORATIVE_BG = /section_2_diagonals\.svg/i;
    element.querySelectorAll('[style]').forEach((el) => {
      if (DECORATIVE_BG.test(el.getAttribute('style'))) {
        el.style.removeProperty('background-image');
        el.style.removeProperty('background');
        if (DECORATIVE_BG.test(el.getAttribute('style') || '')) el.removeAttribute('style');
      }
    });
    element.querySelectorAll('img').forEach((img) => {
      if (DECORATIVE_BG.test(img.getAttribute('src') || '')) {
        (img.closest('picture') || img).remove();
      }
    });

    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (n.startsWith('data-') && n !== 'data-excat-section-id') el.removeAttribute(n);
        else if (n.startsWith('on')) el.removeAttribute(n);
      });
    });
  }
}
