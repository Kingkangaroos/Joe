// Website Ventures fulfilment measurement contract
// Managed by ChatGPT (OpenAI), 2026-09-09.
(function (root, factory) {
  'use strict';
  const deliveryEvidence = root && root.WVDeliveryEvidence
    ? root.WVDeliveryEvidence
    : (typeof module === 'object' && module.exports ? require('./website-ventures-delivery-evidence.js') : null);
  const api = factory(deliveryEvidence);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WVFulfilmentContract = api;
})(typeof window !== 'undefined' ? window : null, function (deliveryEvidence) {
  'use strict';

  const PHASE_IDS = ['intake', 'content', 'config', 'visuals', 'desktop', 'mobile', 'domain', 'launch', 'handoff'];
  const DELIVERY_CHECK_IDS = [
    'intake-approved', 'scope-visible', 'factory-config', 'real-proof', 'contact-tested', 'desktop-qa',
    'mobile-qa', 'selected-assets', 'domain-owner', 'hosting-commercial', 'dns-ssl', 'handoff'
  ];

  function object (value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function assessFoundation (intake, expectedSlug) {
    if (!deliveryEvidence) {
      return { ok: false, errors: ['Delivery-evidencecontract is niet beschikbaar.'] };
    }
    const intakeResult = deliveryEvidence.intakeEvidence(intake, expectedSlug);
    const scopeResult = deliveryEvidence.scopeEvidence(intake);
    return {
      ok: intakeResult.ok && scopeResult.ok,
      errors: intakeResult.errors.concat(scopeResult.errors),
      intake: intakeResult,
      scope: scopeResult
    };
  }

  function progress (source, ids, resolver) {
    const open = ids.filter(function (id) { return !resolver(source, id); });
    return { ok: open.length === 0, done: ids.length - open.length, total: ids.length, open: open };
  }

  function assessLaunch (run, intake, config, checks, expectedSlug) {
    const errors = [];
    const evidence = deliveryEvidence && typeof deliveryEvidence.assess === 'function'
      ? deliveryEvidence.assess(intake, config, expectedSlug)
      : {
          intake: { ok: false, errors: ['Delivery-evidencecontract is niet beschikbaar.'] },
          scope: { ok: false, errors: ['Delivery-evidencecontract is niet beschikbaar.'] },
          config: { ok: false, errors: ['Delivery-evidencecontract is niet beschikbaar.'] }
        };
    const currentEvidence = Object.keys(evidence).every(function (key) { return evidence[key].ok; });
    if (!currentEvidence) errors.push('Actuele Intake/scope/Factory-evidence is niet compleet.');

    if (!object(run)) errors.push('Fulfilment run ontbreekt.');
    else {
      if (run.slug !== expectedSlug) errors.push('Run hoort niet bij de actieve client.');
      if (!Number.isInteger(run.runNo) || run.runNo < 1 || run.runNo > 10) {
        errors.push('Run nummer moet 1 t/m 10 zijn.');
      }
    }
    const phases = progress(run && run.phases, PHASE_IDS, function (items, id) {
      return object(items) && object(items[id]) && items[id].done === true;
    });
    if (!phases.ok) errors.push(phases.open.length + ' fulfilmentfase(s) zijn nog niet afgerond.');

    const delivery = progress(checks, DELIVERY_CHECK_IDS, function (items, id) {
      return object(items) && items[id] === true;
    });
    if (!delivery.ok) errors.push(delivery.open.length + ' Delivery Gate-check(s) zijn nog open.');

    return {
      ok: errors.length === 0,
      errors: errors,
      evidence: evidence,
      currentEvidence: currentEvidence,
      phases: phases,
      delivery: delivery
    };
  }

  return {
    assessFoundation: assessFoundation,
    assessLaunch: assessLaunch,
    phaseIds: PHASE_IDS.slice(),
    deliveryCheckIds: DELIVERY_CHECK_IDS.slice()
  };
});
