// Website Ventures — Plumbing template adapter
// Managed by ChatGPT (OpenAI).
// Applies a loaded client config to the existing Plumbing flagship markup while
// preserving the hardcoded HTML as a full fallback when config loading fails.
(function () {
  'use strict';

  function q (selector) { return document.querySelector(selector); }
  function setText (selector, value) {
    const el = q(selector);
    if (el && value != null) el.textContent = String(value);
  }
  function safeHref (value) {
    if (typeof value !== 'string') return '';
    const href = value.trim();
    return /^(#|tel:|mailto:|https?:\/\/)/i.test(href) ? href : '';
  }
  function setLink (selector, label, href) {
    const el = q(selector);
    if (!el) return;
    if (label != null) el.textContent = String(label);
    const safe = safeHref(href);
    if (safe) el.setAttribute('href', safe);
  }
  function esc (value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function applyBrand (config) {
    const brand = config.brand || {};
    setText('.brand strong', brand.name);
    setText('.brand small', brand.subtitle);
    const footer = q('.footer span');
    if (footer && brand.footerNote != null) footer.textContent = String(brand.footerNote);
  }

  function applyHero (config) {
    const hero = config.hero || {};
    setText('.hero-copy .eyebrow', hero.eyebrow);
    const h1 = q('.hero-copy h1');
    if (h1 && (hero.headline != null || hero.headlineAccent != null)) {
      const before = hero.headline != null ? String(hero.headline) : '';
      const accent = hero.headlineAccent != null ? String(hero.headlineAccent) : '';
      h1.innerHTML = esc(before) + (accent ? ' <span>' + esc(accent) + '</span>' : '');
    }
    setText('.hero-lead', hero.lead);

    const contact = config.contact || {};
    setLink('.hero-actions .btn.primary', contact.primaryLabel, contact.primaryHref);
    setLink('.hero-actions .btn:not(.primary)', contact.secondaryLabel, contact.secondaryHref);
    setLink('.nav .call', contact.navLabel, contact.navHref);
  }

  function applyIntro (config) {
    const intro = config.intro || {};
    const quote = q('.intro blockquote');
    if (quote && (intro.before != null || intro.accent != null)) {
      const before = intro.before != null ? String(intro.before) : '';
      const accent = intro.accent != null ? String(intro.accent) : '';
      quote.innerHTML = esc(before) + (accent ? ' <em>' + esc(accent) + '</em>' : '');
    }
    setText('.intro blockquote + p', intro.body);
  }

  function applyServices (config) {
    const section = config.servicesSection || {};
    setText('.services .section-head h2', section.headline);
    setText('.services .section-head p', section.lead);

    const holder = q('.service-grid');
    if (!holder || !Array.isArray(config.services) || !config.services.length) return;
    holder.innerHTML = config.services.slice(0, 6).map(function (service, i) {
      const n = String(i + 1).padStart(2, '0');
      return '<article class="service"><div class="icon">' + n + '</div><div><h3>' + esc(service.title) + '</h3><p>' + esc(service.description) + '</p><small>' + esc(service.label || 'Meer informatie →') + '</small></div></article>';
    }).join('');
  }

  function applyFinal (config) {
    const final = config.final || {};
    setText('.final small', final.kicker);
    const h2 = q('.final h2');
    if (h2 && (final.headline != null || final.headlineSecond != null)) {
      const first = final.headline != null ? String(final.headline) : '';
      const second = final.headlineSecond != null ? String(final.headlineSecond) : '';
      h2.innerHTML = esc(first) + (second ? '<br>' + esc(second) : '');
    }
    setText('.final p', final.lead);
    setLink('.final .btn', final.ctaLabel, final.ctaHref);
  }

  function applyServiceArea (config) {
    if (!config.serviceArea) return;
    const bar = q('.demo-bar');
    if (!bar) return;
    let badge = bar.querySelector('[data-wv-service-area]');
    if (!badge) {
      badge = document.createElement('span');
      badge.dataset.wvServiceArea = '1';
      bar.appendChild(badge);
    }
    badge.textContent = '· ' + String(config.serviceArea);
  }

  function apply (config) {
    if (!config) return null;
    applyBrand(config);
    applyHero(config);
    applyIntro(config);
    applyServices(config);
    applyFinal(config);
    applyServiceArea(config);
    document.body.dataset.wvTemplate = 'plumbing-v1';
    document.body.dataset.wvTemplateState = 'configured';
    window.dispatchEvent(new CustomEvent('wv-plumbing-template-ready', { detail: config }));
    return config;
  }

  function boot () {
    if (!window.WVClientConfig || !window.WVClientConfig.ready) {
      document.body.dataset.wvTemplateState = 'fallback';
      return;
    }
    window.WVClientConfig.ready.then(function (config) {
      if (config) apply(config);
      else document.body.dataset.wvTemplateState = 'fallback';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.WVPlumbingTemplate = { apply: apply };
})();