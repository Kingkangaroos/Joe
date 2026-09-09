// Website Ventures delivery evidence contract
// Managed by ChatGPT (OpenAI), 2026-09-09.
(function (root, factory) {
  'use strict';
  const contract = root && root.WVClientContract
    ? root.WVClientContract
    : (typeof module === 'object' && module.exports ? require('./website-ventures-client-contract.js') : null);
  const api = factory(contract);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WVDeliveryEvidence = api;
})(typeof window !== 'undefined' ? window : null, function (clientContract) {
  'use strict';

  function object (value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function text (value) {
    return typeof value === 'string' && !!value.trim();
  }

  function same (left, right) {
    return String(left || '').trim() === String(right || '').trim();
  }

  function intakeEvidence (intake, expectedSlug) {
    const errors = [];
    if (!object(intake)) return { ok: false, errors: ['Geen opgeslagen Intake gevonden.'] };
    if (intake.schemaVersion !== 1) errors.push('Intake schemaVersion moet 1 zijn.');
    if (!clientContract || typeof clientContract.validSlug !== 'function') {
      errors.push('Clientcontract is niet beschikbaar.');
    } else if (!clientContract.validSlug(intake.client && intake.client.slug)) {
      errors.push('Intake heeft geen veilige client-slug.');
    }
    if (expectedSlug && (!intake.client || intake.client.slug !== expectedSlug)) {
      errors.push('Intake hoort niet bij de actieve client.');
    }
    [
      ['client.businessName', intake.client && intake.client.businessName],
      ['client.primaryContact', intake.client && intake.client.primaryContact],
      ['client.serviceArea', intake.client && intake.client.serviceArea],
      ['offer.primaryOutcome', intake.offer && intake.offer.primaryOutcome],
      ['offer.primaryCtaLabel', intake.offer && intake.offer.primaryCtaLabel],
      ['domain.state', intake.domain && intake.domain.state],
      ['scope.template', intake.scope && intake.scope.template]
    ].forEach(function (entry) {
      if (!text(entry[1])) errors.push(entry[0] + ' ontbreekt.');
    });
    if (!clientContract || typeof clientContract.safeHref !== 'function' ||
        !clientContract.safeHref(intake.offer && intake.offer.primaryCtaHref)) {
      errors.push('offer.primaryCtaHref is geen toegestane CTA-link.');
    }
    if (!Array.isArray(intake.services) || !intake.services.length) {
      errors.push('Minimaal één Intake-dienst is vereist.');
    } else {
      intake.services.forEach(function (service, index) {
        if (!object(service) || !text(service.title) || !text(service.description)) {
          errors.push('Intake-dienst ' + (index + 1) + ' mist titel of omschrijving.');
        }
      });
    }
    const revisions = intake.scope && intake.scope.revisionRounds;
    if (!Number.isInteger(revisions) || revisions < 0 || revisions > 5) {
      errors.push('scope.revisionRounds moet een geheel getal van 0 t/m 5 zijn.');
    }
    return { ok: errors.length === 0, errors: errors };
  }

  function scopeEvidence (intake) {
    const errors = [];
    const scope = intake && intake.scope;
    if (!object(scope)) return { ok: false, errors: ['Geen opgeslagen scope gevonden.'] };
    if (!text(scope.template)) errors.push('Scope-template ontbreekt.');
    if (!Number.isInteger(scope.revisionRounds) || scope.revisionRounds < 0 || scope.revisionRounds > 5) {
      errors.push('Revisierondes moeten expliciet 0 t/m 5 zijn.');
    }
    if (!Array.isArray(scope.included) || !scope.included.some(text)) {
      errors.push('Inbegrepen scope ontbreekt.');
    }
    if (!Array.isArray(scope.excluded) || !scope.excluded.some(text)) {
      errors.push('Uitgesloten scope ontbreekt.');
    }
    return { ok: errors.length === 0, errors: errors };
  }

  function configEvidence (intake, config, expectedSlug) {
    const errors = [];
    if (!object(config)) return { ok: false, errors: ['Geen opgeslagen Factory-config gevonden.'] };
    if (!clientContract || typeof clientContract.validate !== 'function') {
      return { ok: false, errors: ['Clientcontract is niet beschikbaar.'] };
    }
    const validation = clientContract.validate(config, expectedSlug);
    validation.errors.forEach(function (error) { errors.push('Config: ' + error + '.'); });
    if (!object(intake)) errors.push('Intake ontbreekt voor de Factory-vergelijking.');
    else {
      if (!same(config.brand && config.brand.name, intake.client && intake.client.businessName)) {
        errors.push('Factory-bedrijfsnaam wijkt af van de Intake.');
      }
      if (!same(config.serviceArea, intake.client && intake.client.serviceArea)) {
        errors.push('Factory-servicegebied wijkt af van de Intake.');
      }
      const href = intake.offer && intake.offer.primaryCtaHref;
      ['primaryHref', 'navHref'].forEach(function (field) {
        if (!same(config.contact && config.contact[field], href)) {
          errors.push('Factory contact.' + field + ' wijkt af van de primaire Intake-CTA.');
        }
      });
      if (!same(config.final && config.final.ctaHref, href)) {
        errors.push('Factory final.ctaHref wijkt af van de primaire Intake-CTA.');
      }
      const label = intake.offer && intake.offer.primaryCtaLabel;
      ['primaryLabel', 'navLabel'].forEach(function (field) {
        if (!same(config.contact && config.contact[field], label)) {
          errors.push('Factory contact.' + field + ' wijkt af van het primaire Intake-CTA-label.');
        }
      });
      if (!same(config.final && config.final.ctaLabel, label)) {
        errors.push('Factory final.ctaLabel wijkt af van het primaire Intake-CTA-label.');
      }
      const intakeServices = Array.isArray(intake.services) ? intake.services.slice(0, 6) : [];
      const configServices = Array.isArray(config.services) ? config.services : [];
      if (intakeServices.length !== configServices.length || intakeServices.some(function (service, index) {
        return !same(service && service.title, configServices[index] && configServices[index].title);
      })) errors.push('Factory-diensten komen niet overeen met de Intake.');
    }
    return { ok: errors.length === 0, errors: errors };
  }

  function assess (intake, config, expectedSlug) {
    return {
      intake: intakeEvidence(intake, expectedSlug),
      scope: scopeEvidence(intake),
      config: configEvidence(intake, config, expectedSlug)
    };
  }

  return {
    assess: assess,
    intakeEvidence: intakeEvidence,
    scopeEvidence: scopeEvidence,
    configEvidence: configEvidence
  };
});
