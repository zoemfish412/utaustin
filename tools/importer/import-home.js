/* eslint-disable */
/* global WebImporter */

import columnsAnnouncementParser from './parsers/columns-announcement.js';
import videoBgLoopParser from './parsers/video-bg-loop.js';
import heroHeadlineParser from './parsers/hero-headline.js';
import cardsStoriesParser from './parsers/cards-stories.js';
import columnsPromoParser from './parsers/columns-promo.js';
import columnsImpactParser from './parsers/columns-impact.js';
import heroSplitVideoParser from './parsers/hero-split-video.js';
import cleanupTransformer from './transformers/utaustin-cleanup.js';
import sectionsTransformer from './transformers/utaustin-sections.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.utexas.edu/"
  ],
  "representativeUrl": "https://www.utexas.edu/",
  "description": "University homepage: announcement bar, hero video, headline hero, stories, promo, impact rows and outro",
  "blocks": [
    {
      "name": "columns-announcement",
      "instances": [
        ".block-coresite-news-alert",
        "#block-coretheme-homepagecriticalnewsalert"
      ]
    },
    {
      "name": "video-bg-loop",
      "instances": [
        ".block-bundle-utexas-hero-video",
        "#block-coretheme-theuniversityoftexasataustin"
      ]
    },
    {
      "name": "hero-headline",
      "instances": [
        ".block-coresite-homepagehero",
        "#block-coretheme-homepagehomepagehero"
      ]
    },
    {
      "name": "cards-stories",
      "instances": [
        ".university-stories",
        "#block-coretheme-homepageuniversitystories .university-stories"
      ]
    },
    {
      "name": "columns-promo",
      "instances": [
        "#block-coretheme-homepagemidpagepromo"
      ]
    },
    {
      "name": "columns-impact",
      "instances": [
        ".block-coresite-impact-1",
        ".block-coresite-impact-2",
        ".block-coresite-impact-3"
      ]
    },
    {
      "name": "hero-split-video",
      "instances": [
        ".block-homepage-outro",
        "#block-coretheme-homepageoutro"
      ]
    }
  ],
  "urlPattern": "/",
  "sections": [
    {
      "id": "section-1",
      "name": "Longhorn Lights announcement bar",
      "selector": [
        ".region-site-announcement",
        "#block-coretheme-homepagecriticalnewsalert"
      ],
      "style": "dark",
      "blocks": [
        "columns-announcement"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Hero video",
      "selector": [
        "#block-coretheme-theuniversityoftexasataustin"
      ],
      "style": null,
      "blocks": [
        "video-bg-loop"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "What Starts Here hero",
      "selector": [
        "#block-coretheme-homepagehomepagehero"
      ],
      "style": null,
      "blocks": [
        "hero-headline"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "University stories",
      "selector": [
        "#block-coretheme-homepageuniversitystories"
      ],
      "style": null,
      "blocks": [
        "cards-stories"
      ],
      "defaultContent": [
        "#block-coretheme-homepageuniversitystories .action-links"
      ]
    },
    {
      "id": "section-5",
      "name": "Core curriculum promo",
      "selector": [
        "#block-coretheme-homepagemidpagepromo"
      ],
      "style": "beige",
      "blocks": [
        "columns-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-6",
      "name": "Boundless Ambition intro",
      "selector": [
        "#block-coretheme-homepageimpactintro",
        ".block-coresite-impact-0"
      ],
      "style": "orange, centered",
      "blocks": [],
      "defaultContent": [
        "#boundless-ambition-with-texas-roots",
        "#ut-intro .row.justify-content-center"
      ]
    },
    {
      "id": "section-7",
      "name": "The Longhorn Experience impact",
      "selector": [
        "#block-coretheme-homepageimpact1",
        ".block-coresite-impact-1"
      ],
      "style": "light-grey-gradient",
      "blocks": [
        "columns-impact"
      ],
      "defaultContent": []
    },
    {
      "id": "section-8",
      "name": "Big Ideas. Bigger Impact. impact",
      "selector": [
        "#block-coretheme-homepageimpact2",
        ".block-coresite-impact-2"
      ],
      "style": "light-grey-gradient",
      "blocks": [
        "columns-impact"
      ],
      "defaultContent": []
    },
    {
      "id": "section-9",
      "name": "Learning With Purpose impact",
      "selector": [
        "#block-coretheme-homepageimpact3",
        ".block-coresite-impact-3"
      ],
      "style": "light-grey-gradient",
      "blocks": [
        "columns-impact"
      ],
      "defaultContent": []
    },
    {
      "id": "section-10",
      "name": "For Texas, For the Future outro",
      "selector": [
        "#block-coretheme-homepageoutro",
        ".block-homepage-outro"
      ],
      "style": null,
      "blocks": [
        "hero-split-video"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'columns-announcement': columnsAnnouncementParser,
  'video-bg-loop': videoBgLoopParser,
  'hero-headline': heroHeadlineParser,
  'cards-stories': cardsStoriesParser,
  'columns-promo': columnsPromoParser,
  'columns-impact': columnsImpactParser,
  'hero-split-video': heroSplitVideoParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
// Page corrections ({sitename}-page-corrections.js, when it exists) run last.
const correctionTransformers = [];
const transformers = [cleanupTransformer, ...lateTransformers, ...correctionTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
