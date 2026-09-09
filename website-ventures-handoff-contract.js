// Website Ventures customer handoff contract
// Managed by ChatGPT (OpenAI), 2026-09-09.
(function (root, factory) {
  'use strict';
  const clientContract = root && root.WVClientContract
    ? root.WVClientContract
    : (typeof module === 'object' && module.exports ? require('./website-ventures-client-contract.js') : null);
  const deliveryEvidence = root && root.WVDeliveryEvidence
    ? root.WVDeliveryEvidence
    : (typeof module === 'object' && module.exports ? require('./website-ventures-delivery-evidence.js') : null);
  const api = factory(clientContract, deliveryEvidence);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WVHandoffContract = api;
})(typeof window !== 'undefined' ? window : null, function (clientContract, deliveryEvidence) {
  'use strict';

  const DELIVERY_CHECKS = [
    'intake-approved',
    'scope-visible',
    'factory-config',
    'real-proof',
    'contact-tested',
    'desktop-qa',
    'mobile-qa',
    'selected-assets',
    'domain-owner',
    'hosting-commercial',
    'dns-ssl',
    'handoff'
  ];

  function text (value) {
    return typeof value === 'string' && !!value.trim();
  }

  function decided (value) {
    return text(value) && value.trim().toLowerCase() !== 'nog afspreken';
  }

  function detailsEvidence (details) {
    const errors = [];
    details = details && typeof details === 'object' ? details : {};
    if (typeof details.liveUrl !== 'string' || !/^https:\/\/[^\s]+$/i.test(details.liveUrl.trim())) {
      errors.push('Live URL moet een volledige HTTPS-link zijn.');
    }
    if (!text(details.domainOwner)) errors.push('Domein/account-eigenaar ontbreekt.');
    if (!decided(details.hosting)) errors.push('Hostingverantwoordelijkheid is nog niet gekozen.');
    if (!decided(details.support)) errors.push('Support/onderhoud is nog niet gekozen.');
    const used = Number(details.revisionsUsed);
    if (!Number.isInteger(used) || used < 0) errors.push('Gebruikte revisies moeten een geheel getal van 0 of hoger zijn.');
    return { ok: errors.length === 0, errors: errors };
  }

  function checklistEvidence (checks) {
    checks = checks && typeof checks === 'object' ? checks : {};
    const open = DELIVERY_CHECKS.filter(function (id) { return checks[id] !== true; });
    return {
      ok: open.length === 0,
      done: DELIVERY_CHECKS.length - open.length,
      total: DELIVERY_CHECKS.length,
      open: open
    };
  }

  function assess (intake, config, checks, details, expectedSlug) {
    const evidence = deliveryEvidence && typeof deliveryEvidence.assess === 'function'
      ? deliveryEvidence.assess(intake, config, expectedSlug)
      : {
          intake: { ok: false, errors: ['Delivery-evidencecontract is niet beschikbaar.'] },
          scope: { ok: false, errors: ['Delivery-evidencecontract is niet beschikbaar.'] },
          config: { ok: false, errors: ['Delivery-evidencecontract is niet beschikbaar.'] }
        };
    const currentEvidence = Object.keys(evidence).every(function (key) { return evidence[key].ok; });
    const delivery = checklistEvidence(checks);
    const detailsResult = detailsEvidence(details);
    return {
      ready: currentEvidence && delivery.ok && detailsResult.ok,
      evidence: evidence,
      currentEvidence: currentEvidence,
      delivery: delivery,
      details: detailsResult
    };
  }

  return {
    assess: assess,
    detailsEvidence: detailsEvidence,
    checklistEvidence: checklistEvidence,
    deliveryChecks: DELIVERY_CHECKS.slice(),
    safeLiveUrl: function (value) {
      return !!clientContract && typeof value === 'string' && /^https:\/\/[^\s]+$/i.test(value.trim());
    }
  };
});
