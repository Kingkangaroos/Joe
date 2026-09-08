// Website Ventures — reusable client configuration loader
// Managed by ChatGPT (OpenAI).
// Purpose: keep customer identity/content/theme outside template markup.
// Usage: <body data-wv-client="plumbing-demo"> or ?wvclient=plumbing-demo
(function () {
  'use strict';

  const SAFE_SLUG = /^[a-z0-9-]{1,64}$/;
  const CONFIG_ROOT = 'website-ventures-client-configs/';

  function esc (value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function get (obj, path) {
    return String(path || '').split('.').reduce(function (v, key) {
      return v && Object.prototype.hasOwnProperty.call(v, key) ? v[key] : undefined;
    }, obj);
  }

  function chooseSlug () {
    const query = new URLSearchParams(location.search).get('wvclient');
    const bodyDefault = document.body && document.body.dataset ? document.body.dataset.wvClient : '';
    const slug = query || bodyDefault || '';
    return SAFE_SLUG.test(slug) ? slug : '';
  }

  function setTheme (config) {
    const theme = config.theme || {};
    const allowed = {
      paper: '--paper',
      paper2: '--paper-2',
      ink: '--ink',
      muted: '--muted',
      accent: '--red',
      accentDeep: '--red-deep',
      chrome: '--chrome',
      night: '--night'
    };
    Object.keys(allowed).forEach(function (key) {
      const value = theme[key];
      if (typeof value === 'string' && value.trim()) {
        document.documentElement.style.setProperty(allowed[key], value.trim());
      }
    });
  }

  function bindText (config) {
    document.querySelectorAll('[data-wv-bind]').forEach(function (el) {
      const value = get(config, el.dataset.wvBind);
      if (value == null) return;
      el.textContent = String(value);
    });
  }

  function bindHref (config) {
    document.querySelectorAll('[data-wv-href]').forEach(function (el) {
      const value = get(config, el.dataset.wvHref);
      if (typeof value !== 'string' || !value.trim()) return;
      const href = value.trim();
      if (/^(#|tel:|mailto:|https?:\/\/)/i.test(href)) el.setAttribute('href', href);
    });
  }

  function renderServices (config) {
    const holder = document.querySelector('[data-wv-services]');
    if (!holder || !Array.isArray(config.services) || !config.services.length) return;
    holder.innerHTML = config.services.slice(0, 6).map(function (service, i) {
      const n = String(i + 1).padStart(2, '0');
      return '<article class="service"><div class="icon">' + n + '</div><div><h3>' + esc(service.title) + '</h3><p>' + esc(service.description) + '</p><small>' + esc(service.label || 'Meer informatie →') + '</small></div></article>';
    }).join('');
  }

  function apply (config, slug) {
    setTheme(config);
    bindText(config);
    bindHref(config);
    renderServices(config);
    if (config.seo && typeof config.seo.title === 'string' && config.seo.title.trim()) {
      document.title = config.seo.title.trim();
    }
    document.body.dataset.wvClientActive = slug;
    document.body.dataset.wvClientState = 'ready';
    window.dispatchEvent(new CustomEvent('wv-client-config-ready', { detail: { slug: slug, config: config } }));
    return config;
  }

  const ready = new Promise(function (resolve) {
    function boot () {
      const slug = chooseSlug();
      if (!slug) {
        document.body.dataset.wvClientState = 'fallback';
        resolve(null);
        return;
      }
      fetch(CONFIG_ROOT + slug + '.json', { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error('Client config not found');
          return r.json();
        })
        .then(function (config) { resolve(apply(config, slug)); })
        .catch(function (err) {
          console.warn('[Website Ventures] client config unavailable; hardcoded template fallback retained.', err);
          document.body.dataset.wvClientState = 'fallback';
          resolve(null);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
  });

  window.WVClientConfig = { ready: ready, apply: apply };
})();