/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for www.utexas.edu.
 * beforeTransform: inserts <hr> section breaks (marked for styled sections).
 * afterTransform: adds Section Metadata blocks for styled sections.
 */
const MARKER = 'data-excat-section-id';

function findSection(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    if (selectors[i]) {
      const el = root.querySelector(selectors[i]);
      if (el) return el;
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSection(element, section);
      if (el && el.parentNode) {
        if (i > 0 || section.style) {
          const hr = doc.createElement('hr');
          if (section.style) hr.setAttribute(MARKER, section.id);
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (section.style) {
        const meta = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        if (marker) {
          // Section Metadata goes at the end of the section: right before the next <hr> in
          // document order (sections can live in different wrappers, e.g. the announcement
          // region sits outside <main>), or at the very end when it is the last section.
          const nextHr = [...element.querySelectorAll('hr')].find(
            // eslint-disable-next-line no-bitwise
            (hr) => hr !== marker && (marker.compareDocumentPosition(hr) & 4),
          );
          if (nextHr) nextHr.before(meta);
          else element.append(meta);
        } else {
          const el = findSection(element, section);
          if (el) el.after(meta);
        }
      }
      if (marker) {
        if (i === 0) marker.remove();
        else marker.removeAttribute(MARKER);
      }
    }
  }
}
