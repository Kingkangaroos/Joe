// ChatGPT/OpenAI — isolate Gamenfy Public browser auth from Joey's private app.
// Both apps live on the same Vercel origin and Supabase project, so without a
// custom storageKey Supabase's default localStorage session is shared.
(function isolateGamenfyPublicAuth() {
  'use strict';
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return;
  if (!/^\/public\/?$/.test(window.location.pathname) && window.location.pathname !== '/gamenfy-public.html') return;
  if (window.__gamenfyPublicAuthIsolationInstalled) return;
  window.__gamenfyPublicAuthIsolationInstalled = true;

  const originalCreateClient = window.supabase.createClient.bind(window.supabase);
  window.supabase.createClient = function(url, key, options) {
    const next = Object.assign({}, options || {});
    next.auth = Object.assign({}, next.auth || {}, {
      storageKey: 'gamenfy-public-auth-v1'
    });
    return originalCreateClient(url, key, next);
  };
})();
