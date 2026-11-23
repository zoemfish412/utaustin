/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/columns-announcement.js
  function parse(element, { document: document2 }) {
    const barLink = element.querySelector("a.critical-news-alert--wrapper") || element.querySelector("a[href]");
    const img = element.querySelector(".critical-news-image img") || element.querySelector("img");
    const textEl = element.querySelector(".critical-news-headline p") || element.querySelector(".critical-news-headline");
    const imageCell = [];
    if (img) imageCell.push(img);
    const textCell = [];
    const text = textEl ? textEl.textContent.replace(/\s+/g, " ").trim() : "";
    if (text) {
      const p = document2.createElement("p");
      if (barLink && barLink.getAttribute("href")) {
        const a = document2.createElement("a");
        a.href = barLink.getAttribute("href");
        a.textContent = text;
        p.append(a);
      } else {
        p.textContent = text;
      }
      textCell.push(p);
    }
    const cells = [[imageCell, textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-announcement", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-bg-loop.js
  function toAbsolute(url, base) {
    if (!url) return "";
    try {
      return new URL(url, base).href;
    } catch (e) {
      return url;
    }
  }
  function parse2(element, { document: document2, params }) {
    const base = params && params.originalURL || "https://www.utexas.edu/";
    const video = element.querySelector("video");
    const source = element.querySelector("video source[src]");
    const track = element.querySelector("video track[src]");
    const mainCell = [];
    const posterSrc = video && video.getAttribute("poster");
    if (posterSrc) {
      const img = document2.createElement("img");
      img.src = toAbsolute(posterSrc, base);
      img.alt = "";
      mainCell.push(img);
    }
    const videoSrc = source && source.getAttribute("src") || video && video.getAttribute("src");
    if (videoSrc) {
      const href = toAbsolute(videoSrc, base);
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = video && video.getAttribute("title") || href;
      p.append(a);
      mainCell.push(p);
    }
    if (track) {
      const href = toAbsolute(track.getAttribute("src"), base);
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = track.getAttribute("label") || "Video description";
      p.append(a);
      mainCell.push(p);
    }
    const btnLabel = element.querySelector("#play-pause .visually-hidden");
    const btnText = btnLabel ? btnLabel.textContent.replace(/\s+/g, " ").trim() : "";
    const hasSourceLabel = /^pause\b/i.test(btnText);
    const pauseLabel = hasSourceLabel ? btnText : "Pause";
    const playLabel = hasSourceLabel ? btnText.replace(/^pause/i, "Play") : "Play";
    const cells = [
      [mainCell, ""],
      [pauseLabel, playLabel]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "video-bg-loop", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-headline.js
  function parse3(element, { document: document2 }) {
    const bgImg = element.querySelector(".homepage-hero__background img") || element.querySelector("img");
    const sourceHeading = element.querySelector(".homepage-hero__headline") || element.querySelector("h1, h2, h3");
    const contentCell = [];
    if (sourceHeading) {
      const lines = sourceHeading.innerHTML.split(/<br\s*\/?>/i).map((part) => {
        const tmp = document2.createElement("div");
        tmp.innerHTML = part;
        return tmp.textContent.replace(/\s+/g, " ").trim();
      }).filter(Boolean);
      const h2 = document2.createElement("h2");
      lines.forEach((line, i) => {
        if (i > 0) h2.append(document2.createElement("br"));
        h2.append(document2.createTextNode(line));
      });
      contentCell.push(h2);
    }
    element.querySelectorAll(":scope p").forEach((p) => {
      if (p.closest(".homepage-hero__background")) return;
      if (p.textContent.trim()) contentCell.push(p);
    });
    const cells = [
      [bgImg ? [bgImg] : ""],
      [contentCell]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-headline", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-stories.js
  function parse4(element, { document: document2 }) {
    const stories = [...element.querySelectorAll("a.university-stories__linked-box")];
    const ordered = [
      ...stories.filter((a) => a.querySelector(".card.prominent")),
      ...stories.filter((a) => !a.querySelector(".card.prominent"))
    ];
    const cells = [];
    ordered.forEach((link) => {
      const img = link.querySelector(".image-wrapper img") || link.querySelector("img");
      const headlineEl = link.querySelector(".headline");
      const text = headlineEl ? headlineEl.textContent.replace(/\s+/g, " ").trim() : "";
      const textCell = [];
      if (text) {
        const h3 = document2.createElement("h3");
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = text;
        h3.append(a);
        textCell.push(h3);
      }
      cells.push([img ? [img] : "", textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-stories", cells });
    const actionLinks = element.querySelector(".action-links");
    if (actionLinks && actionLinks.querySelector("a[href]")) {
      const p = document2.createElement("p");
      [...actionLinks.querySelectorAll("a[href]")].forEach((a, i) => {
        if (i > 0) p.append(document2.createTextNode(" "));
        p.append(a);
      });
      element.after(p);
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function parse5(element, { document: document2 }) {
    const cols = [...element.querySelectorAll('.mid-page-bkgd .row > [class*="col-"]')];
    const imageCol = cols.find((c) => c.querySelector("img") && !c.querySelector("h1, h2, h3, p")) || element;
    const textCol = cols.find((c) => c.querySelector("h1, h2, h3, p")) || element;
    const img = imageCol.querySelector("img");
    const imageCell = img ? [img] : [];
    const textCell = [];
    [...textCol.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > p")].forEach((el) => {
      const link = el.tagName === "P" ? el.querySelector("a[href]") : null;
      if (link && el.textContent.trim() === link.textContent.trim()) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.replace(/\s+/g, " ").trim();
        p.append(a);
        textCell.push(p);
      } else if (el.textContent.trim()) {
        textCell.push(el);
      }
    });
    const cells = [[imageCell, textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-impact.js
  var clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  function textOf(el) {
    const copy = el.cloneNode(true);
    copy.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clean(copy.textContent);
  }
  function counterValue(counter, stat) {
    let num = clean(counter.textContent).replace(/,/g, "");
    const sr = stat.querySelector(".sr-only, .visually-hidden");
    const srNum = sr ? (clean(sr.textContent).match(/[\d.,]+/) || [])[0] : "";
    if ((!num || Number(num) === 0) && srNum) num = srNum.replace(/,/g, "");
    const cls = counter.classList;
    if (/^\d{4,}$/.test(num)) num = Number(num).toLocaleString("en-US");
    let prefix = "";
    let suffix = "";
    if (cls.contains("dollars")) prefix = "$";
    if (cls.contains("billions")) suffix = "B";
    else if (cls.contains("millions")) suffix = "M";
    else if (cls.contains("thousands")) suffix = "K";
    if (cls.contains("plus")) suffix += "+";
    if (!prefix && !suffix && counter.closest(".diff-one")) prefix = "#";
    return `${prefix}${num}${suffix}`;
  }
  function buildStat(stat, document2) {
    const counter = stat.querySelector(".counter");
    if (!counter) return null;
    const copy = stat.cloneNode(true);
    copy.querySelectorAll(".counter, .sr-only, .visually-hidden").forEach((s) => s.remove());
    const label = textOf(copy);
    const p = document2.createElement("p");
    const strong = document2.createElement("strong");
    strong.textContent = counterValue(counter, stat);
    p.append(strong);
    if (label) p.append(document2.createTextNode(` ${label}`));
    return p;
  }
  function parse6(element, { document: document2, params }) {
    const base = params && params.originalURL || "https://www.utexas.edu/";
    const img = element.querySelector(".image-wrapper img") || element.querySelector("img");
    if (img && img.getAttribute("src")) {
      try {
        img.src = new URL(img.getAttribute("src"), base).href;
      } catch (e) {
      }
    }
    const content = element.querySelector(".content-wrapper") || element;
    const textCell = [];
    const heading = content.querySelector("h1, h2, h3");
    if (heading) textCell.push(heading);
    [...content.querySelectorAll(":scope > p")].forEach((p) => {
      if (clean(p.textContent)) textCell.push(p);
    });
    const cta = content.querySelector(".differentiator-link-wrapper a[href]");
    if (cta) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = clean(cta.textContent);
      p.append(a);
      textCell.push(p);
    }
    content.querySelectorAll(".stats > div").forEach((stat) => {
      const p = buildStat(stat, document2);
      if (p) textCell.push(p);
    });
    const cells = [[img ? [img] : "", textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-impact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-split-video.js
  var FALLBACK_BG = "/modules/coresite/coresite_homepage/assets/forTexas-bkgd.jpg";
  var clean2 = (s) => (s || "").replace(/\s+/g, " ").trim();
  function textOf2(el) {
    const copy = el.cloneNode(true);
    copy.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
    return clean2(copy.textContent);
  }
  function abs(url, base) {
    try {
      return new URL(url, base).href;
    } catch (e) {
      return url;
    }
  }
  function backgroundUrl(el, document2) {
    const inline = el.getAttribute("style") || "";
    let m = inline.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
    if (m) return m[1];
    const view = document2.defaultView;
    if (view && view.getComputedStyle) {
      const bg = view.getComputedStyle(el).backgroundImage || "";
      m = bg.match(/url\(["']?([^"')]+)["']?\)/i);
      if (m) return m[1];
    }
    return "";
  }
  function counterValue2(counter, stat) {
    let num = clean2(counter.textContent).replace(/,/g, "");
    const sr = stat.querySelector(".sr-only, .visually-hidden");
    const srNum = sr ? (clean2(sr.textContent).match(/[\d.,]+/) || [])[0] : "";
    if ((!num || Number(num) === 0) && srNum) num = srNum.replace(/,/g, "");
    if (/^\d{4,}$/.test(num)) num = Number(num).toLocaleString("en-US");
    const cls = counter.classList;
    const prefix = cls.contains("dollars") ? "$" : "";
    let suffix = "";
    if (cls.contains("billions")) suffix = "B";
    else if (cls.contains("millions")) suffix = "M";
    else if (cls.contains("thousands")) suffix = "K";
    if (cls.contains("plus")) suffix += "+";
    return `${prefix}${num}${suffix}`;
  }
  function buildStat2(stat, document2) {
    const counter = stat.querySelector(".counter");
    if (!counter) return null;
    const label = [...stat.querySelectorAll(":scope > span")].filter((s) => s !== counter && !s.matches(".sr-only, .visually-hidden")).map((s) => textOf2(s)).filter(Boolean).join(" ");
    const p = document2.createElement("p");
    const strong = document2.createElement("strong");
    strong.textContent = counterValue2(counter, stat);
    p.append(strong);
    if (label) p.append(document2.createTextNode(` ${label}`));
    return p;
  }
  function linkPara(document2, href, text) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.href = href;
    a.textContent = text;
    p.append(a);
    return p;
  }
  function parse7(element, { document: document2, params }) {
    const base = params && params.originalURL || "https://www.utexas.edu/";
    const outro = element.querySelector("#ut-outro, .utexas-ut-outro") || element;
    let bgImg = outro.querySelector(":scope > img");
    if (!bgImg) {
      const src = backgroundUrl(outro, document2) || FALLBACK_BG;
      bgImg = document2.createElement("img");
      bgImg.src = abs(src, base);
      bgImg.alt = "";
    } else if (bgImg.getAttribute("src")) {
      bgImg.src = abs(bgImg.getAttribute("src"), base);
    }
    const textCol = outro.querySelector(".row > .col-md-7") || outro;
    const textCell = [];
    const heading = textCol.querySelector("h1, h2, h3");
    if (heading) {
      const lines = heading.innerHTML.split(/<br\s*\/?>/i).map((part) => {
        const tmp = document2.createElement("div");
        tmp.innerHTML = part;
        return clean2(tmp.textContent);
      }).filter(Boolean);
      const h2 = document2.createElement("h2");
      lines.forEach((line, i) => {
        if (i > 0) h2.append(document2.createElement("br"));
        h2.append(document2.createTextNode(line));
      });
      textCell.push(h2);
    }
    [...textCol.querySelectorAll(":scope > p")].forEach((p) => {
      if (clean2(p.textContent)) textCell.push(p);
    });
    const cta = textCol.querySelector(".btn-wrapper a[href]");
    if (cta) textCell.push(linkPara(document2, cta.getAttribute("href"), clean2(cta.textContent)));
    textCol.querySelectorAll(".stats > div").forEach((stat) => {
      const p = buildStat2(stat, document2);
      if (p) textCell.push(p);
    });
    const cells = [[[bgImg]], [textCell]];
    const video = outro.querySelector(".ut-outro-img video, video");
    const videoSrc = video && (video.getAttribute("src") || video.querySelector("source[src]") && video.querySelector("source[src]").getAttribute("src"));
    if (videoSrc) {
      const videoCell = [];
      const poster = video.getAttribute("poster");
      if (poster) {
        const img = document2.createElement("img");
        img.src = abs(poster, base);
        img.alt = "";
        videoCell.push(img);
      }
      const href = abs(videoSrc, base);
      videoCell.push(linkPara(document2, href, video.getAttribute("title") || href));
      cells.push([videoCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-split-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/utaustin-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#coretheme-header",
        "#coretheme-mainmenu-wrapper",
        'a.visually-hidden.focusable[href="#main-content"]',
        // Fixed "Be a Longhorn" flyout inside the content region.
        "#block-coretheme-homepagewhatstartshereflyout",
        // Footer.
        "footer.ut-footer",
        // AddToAny social share widget.
        "#addtoany",
        "#drupal-live-announce"
      ]);
      element.querySelectorAll("div.container-xl").forEach((el) => {
        if (el.querySelector(".region-highlighted") && !el.textContent.trim() && !el.querySelector("img, video, picture, iframe")) {
          el.remove();
        }
      });
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        "iframe",
        "form",
        "button"
      ]);
      const DECORATIVE_BG = /section_2_diagonals\.svg/i;
      element.querySelectorAll("[style]").forEach((el) => {
        if (DECORATIVE_BG.test(el.getAttribute("style"))) {
          el.style.removeProperty("background-image");
          el.style.removeProperty("background");
          if (DECORATIVE_BG.test(el.getAttribute("style") || "")) el.removeAttribute("style");
        }
      });
      element.querySelectorAll("img").forEach((img) => {
        if (DECORATIVE_BG.test(img.getAttribute("src") || "")) {
          (img.closest("picture") || img).remove();
        }
      });
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name;
          if (n.startsWith("data-") && n !== "data-excat-section-id") el.removeAttribute(n);
          else if (n.startsWith("on")) el.removeAttribute(n);
        });
      });
    }
  }

  // tools/importer/transformers/utaustin-sections.js
  var MARKER = "data-excat-section-id";
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
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSection(element, section);
        if (el && el.parentNode) {
          if (i > 0 || section.style) {
            const hr = doc.createElement("hr");
            if (section.style) hr.setAttribute(MARKER, section.id);
            el.parentNode.insertBefore(hr, el);
          }
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (section.style) {
          const meta = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          if (marker) {
            const nextHr = [...element.querySelectorAll("hr")].find(
              // eslint-disable-next-line no-bitwise
              (hr) => hr !== marker && marker.compareDocumentPosition(hr) & 4
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

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "columns-announcement": parse,
    "video-bg-loop": parse2,
    "hero-headline": parse3,
    "cards-stories": parse4,
    "columns-promo": parse5,
    "columns-impact": parse6,
    "hero-split-video": parse7
  };
  var sectionTransformers = [transform2];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var correctionTransformers = [];
  var transformers = [transform, ...lateTransformers, ...correctionTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document2.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
  function markPageTargets(payload) {
    const { document: document2, params } = payload;
    executeTransformers("beforeTransform", document2.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document2, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document2.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_home_default = {
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document2.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document2);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_home_exports);
})();
