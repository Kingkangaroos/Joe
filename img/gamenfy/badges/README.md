# Gamenfy badge intake

This is the canonical destination for Joey's already-created badge originals after review.

No badge artwork was generated or copied into this folder during the 2026-09-10 Operations Hub pass. The current registry is intentionally empty because the original files are not present in the repository.

## Import contract

1. Preserve the supplied original outside the live path until its meaning is mapped.
2. Give the accepted app asset a stable lowercase slug: `<badge-id>.webp`.
3. Add exactly one matching record to `GAMENFY-BADGE-REGISTRY.json`.
4. Record the original filename, canonical trigger source, exact condition, privacy class, presentation states, placements and accessible description.
5. Run `node scripts/gamenfy-validate-assets.js` and the complete smoke suite before deployment.

Do not infer badge meaning from appearance alone. Do not create a second locked-state image; use a CSS treatment unless the approved source contract explicitly requires otherwise.
