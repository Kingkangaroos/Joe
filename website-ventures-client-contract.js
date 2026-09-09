// Website Ventures client configuration contract
// Managed by ChatGPT (OpenAI), 2026-09-09.
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WVClientContract = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  const SAFE_SLUG = /^[a-z0-9-]{1,64}$/;
  const HEX = /^#[0-9a-f]{6}$/i;
  const REQUIRED_TEXT = [
    'id',
    'status',
    'brand.name',
    'brand.subtitle',
    'brand.footerNote',
    'seo.title',
    'hero.eyebrow',
    'hero.headline',
    'hero.lead',
    'contact.primaryLabel',
    'contact.secondaryLabel',
    'contact.navLabel',
    'intro.before',
    'intro.body',
    'servicesSection.headline',
    'servicesSection.lead',
    'final.kicker',
    'final.headline',
    'final.lead',
    'final.ctaLabel',
    'serviceArea'
  ];
  const STRING_FIELDS = [
    'hero.headlineAccent',
    'intro.accent',
    'final.headlineSecond'
  ];
  const THEME_FIELDS = ['paper', 'paper2', 'ink', 'muted', 'accent', 'accentDeep', 'chrome', 'night'];
  const HREF_FIELDS = ['contact.primaryHref', 'contact.secondaryHref', 'contact.navHref', 'final.ctaHref'];

  function object (value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function get (source, field) {
    return field.split('.').reduce(function (value, key) {
      return object(value) && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined;
    }, source);
  }

  function safeHref (value) {
    if (typeof value !== 'string') return false;
    const href = value.trim();
    if (/^#[a-z][a-z0-9_-]*$/i.test(href)) return true;
    if (/^tel:\+?[0-9][0-9() .-]{5,}$/i.test(href)) return true;
    if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(href)) return true;
    return /^https?:\/\/[^\s]+$/i.test(href);
  }

  function validate (config, expectedSlug) {
    const errors = [];
    if (!object(config)) return { ok: false, errors: ['config must be an object'] };
    if (config.schemaVersion !== 1) errors.push('schemaVersion must equal 1');

    REQUIRED_TEXT.forEach(function (field) {
      const value = get(config, field);
      if (typeof value !== 'string' || !value.trim()) errors.push(field + ' is required');
    });
    STRING_FIELDS.forEach(function (field) {
      if (typeof get(config, field) !== 'string') errors.push(field + ' must be a string');
    });

    if (!SAFE_SLUG.test(String(config.id || ''))) errors.push('id must be a safe slug');
    if (expectedSlug && config.id !== expectedSlug) errors.push('id must match requested slug');

    if (!object(config.theme)) errors.push('theme is required');
    else THEME_FIELDS.forEach(function (field) {
      if (!HEX.test(String(config.theme[field] || ''))) errors.push('theme.' + field + ' must be a 6-digit hex color');
    });

    HREF_FIELDS.forEach(function (field) {
      if (!safeHref(get(config, field))) errors.push(field + ' is not an allowed CTA link');
    });

    if (!Array.isArray(config.services) || config.services.length < 1 || config.services.length > 6) {
      errors.push('services must contain 1 to 6 items');
    } else {
      config.services.forEach(function (service, index) {
        if (!object(service)) {
          errors.push('services[' + index + '] must be an object');
          return;
        }
        ['title', 'description', 'label'].forEach(function (field) {
          if (typeof service[field] !== 'string' || !service[field].trim()) {
            errors.push('services[' + index + '].' + field + ' is required');
          }
        });
      });
    }

    return { ok: errors.length === 0, errors: errors };
  }

  return {
    validate: validate,
    safeHref: safeHref,
    validSlug: function (value) { return SAFE_SLUG.test(String(value || '')); }
  };
});
