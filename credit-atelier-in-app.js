(function () {
  'use strict';
  const panel = document.getElementById('creditAppPanel');
  const mount = document.getElementById('creditAppMount');
  const close = document.getElementById('creditAppClose');
  if (!panel || !mount || !close) return;
  let opener = null;
  const worlds = ['agency', 'plumbing', 'renovation', 'performance', 'product', 'gamenfy'];
  const destinations = {
    '/website-ventures-credit-rescue-lab.html': { file: 'website-ventures-credit-rescue-lab.html', title: 'Credit Atelier · beelden, video’s en Gamenfy-proef', heading: 'Credit Atelier · in je app' },
    '/website-ventures-portfolio-book-lab.html': { file: 'website-ventures-portfolio-book-lab.html', title: 'Portfolio Book · interactieve websiteproef', heading: 'Portfolio Book · in je app' }
  };
  function announceHeight() {
    if (window.parent === window) return;
    try { window.parent.postMessage({ type: 'gamenfy:ventures-height', height: document.documentElement.scrollHeight }, location.origin); } catch (_) {}
  }
  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || (event.button !== undefined && event.button !== 0)) return;
    const anchor = event.target.closest && event.target.closest('a[href]');
    if (!anchor) return;
    let url;
    try { url = new URL(anchor.href, location.href); } catch (_) { return; }
    const destination = destinations[url.pathname];
    if (url.origin !== location.origin || !destination) return;
    event.preventDefault();
    if (opener) opener.setAttribute('aria-expanded', 'false');
    opener = anchor; opener.setAttribute('aria-expanded', 'true'); opener.setAttribute('aria-controls', 'creditAppPanel');
    const world = url.searchParams.get('world');
    const target = new URL(destination.file, location.href);
    target.searchParams.set('embed', '1');
    if (destination.file === 'website-ventures-credit-rescue-lab.html' && worlds.includes(world)) target.searchParams.set('world', world);
    const heading = document.getElementById('creditAppHeading');
    if (heading) heading.textContent = destination.heading;
    const existing = mount.querySelector('iframe');
    if (!existing || existing.src !== target.href) {
      mount.replaceChildren();
      const frame = document.createElement('iframe');
      frame.title = destination.title;
      frame.allow = 'clipboard-write; fullscreen';
      frame.addEventListener('load', announceHeight);
      frame.src = target.href; mount.append(frame);
    }
    panel.hidden = false; close.focus(); panel.scrollIntoView({ block: 'start' }); announceHeight();
  });
  close.addEventListener('click', function () {
    // Remove the frame: stop media and release its memory, including session-only review.
    mount.replaceChildren(); panel.hidden = true; announceHeight();
    if (opener) { opener.setAttribute('aria-expanded', 'false'); opener.focus(); }
  });
}());
