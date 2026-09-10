# Gamenfy Asset Operations

Current operational source: `GAMENFY-ASSET-OPERATIONS.json`

Badge source: `GAMENFY-BADGE-REGISTRY.json`

Operator UI: `gamenfy-asset-operations.html`

## Current decision

Do not make another broad visual pack. The live Daily Mission system is complete: 13 approved identities with 10 distinct WebP levels each, plus the 10-stage Daily Score Joey / King set. Those 140 evolution frames already have a product job and must remain intact.

Joey reports that a badge collection has been created, but no standalone badge originals are present in the current repository or recent character-assets import branch. The registry therefore remains deliberately empty until those originals are attached or their exact location is provided. Missing input must not be converted into invented art, names or triggers.

## Product placement strategy

Badges should not become a second Daily Mission level system.

1. Character · Trophy Case is the proposed canonical collection.
2. A one-time unlock moment reinforces the exact persisted achievement.
3. Home may show one latest or featured badge, never the full collection.

Mission companions continue to show reversible daily consistency. Badges show durable milestones. The separation makes both systems easier to understand.

## Workflow

`Original → intake/provenance → meaning/trigger contract → privacy review → visual review → wiring → regression tests → production QA`

An original does not move beyond intake until its stable ID, exact data trigger, privacy class, locked/unlocked rule, deliberate placement and accessible explanation are known. Locked presentation normally uses CSS treatment of the accepted original rather than a second asset.

Run the deterministic audit with:

```bash
node scripts/gamenfy-validate-assets.js
```

The audit checks all 130 mission WebPs, all 10 Daily Score WebPs, mission membership, duplicate IDs, badge paths, registry coverage, privacy metadata and the zero-generation/zero-credit policy.

## White / red direction

The Operations Hub is the first coded `Warm White + Oxblood` preview. This does not migrate the rest of Gamenfy. White remains dominant; oxblood creates hierarchy; bright red stays rare; existing green success and amber warning semantics remain intact. A shared-token migration requires Joey's visual approval plus installed-iPhone QA.

## AI capability strategy

Use stronger coding/reasoning capability for audits, cross-surface contracts, privacy, exact-once unlock behavior and production verification. Do not treat a model name as permission to create more assets or as a replacement for manifests, tests and Joey's visual judgment.
