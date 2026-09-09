# Website Ventures generated asset intake

Managed by ChatGPT (OpenAI). This folder is the landing zone for approved Website Ventures / Higgsfield outputs.

## Rules

1. **Do not dump every Higgsfield variant here.** Keep exploration in Higgsfield. Only upload selected candidates/winners that may actually be used.
2. File names start with the production job ID, lowercase and hyphenated, so prompts, review notes and website usage stay traceable.
3. Keep the original high-quality source. Website-optimized derivatives can be created later (`.webp`/`.avif`) without replacing the source master.
4. AI demo assets may support a showcase, but must never be presented as real completed customer work.
5. Plumbing working scenes must use the selected `PL-CHAR-001` technician identity consistently.
6. Batch 6 Fire Challenger is mandatory Unlimited exploration: two jobs, at most two variants each and four outputs total.
7. Select exactly one desktop winner across all Batch 5 + Batch 6 candidates. A losing fire direction remains reviewed and receives no finish spend.
8. Batch 11 4K images are final masters only; the agency master and Batch 7 mobile derivative must use the exact joint desktop winner as reference.

## Target folders

- `website-ventures-assets/agency/` — Joey's own Website Ventures / agency showroom.
- `website-ventures-assets/plumbing/` — Premium Plumbing showcase/customer-template world.

## Naming

Use these base names for the approved output from each job:

### Batch 5 — Agency Hero Round
- `agency/ag-hero-transform-001.png`
- `agency/ag-hero-product-001.png`
- `agency/ag-hero-material-001.png`

These three enter one joint winner pool with both Batch 6 Fire Challenger jobs.

### Batch 6 — Fire Challenger
- `agency/ag-hero-fire-glass-001.png`
- `agency/ag-hero-fire-veil-001.png`

Use the two manifest intake paths per job; never exceed four outputs across this round.

### Batch 7 — Mobile derivative
- `agency/ag-hero-mobile-001.png` — derived from the exact joint desktop winner.

### Batch 8 — Technician
- `plumbing/pl-char-001.png` — selected recurring technician master.

Do not upload all four candidates as final masters. If candidate comparison is useful, temporary files may use `pl-char-001-candidate-a.png` through `-d.png`, then retain the chosen master as `pl-char-001.png`.

### Batch 9 — Working scenes
- `plumbing/pl-story-diag-001.png`
- `plumbing/pl-story-sink-001.png`
- `plumbing/pl-story-trust-001.png`

### Batch 10 — Agency support visuals
- `agency/ag-support-transform-001.png`
- `agency/ag-support-process-001.png`
- `agency/ag-support-showcase-001.png`

### Batch 11 — 4K final masters
- `agency/ag-hero-master-001.png`
- `plumbing/pl-hero-master-001.png`

## Import workflow

Joey generates manually on higgsfield.ai → chooses the strongest output(s) → sends/uploads the winner(s) to ChatGPT → ChatGPT places them under the target paths above → creates optimized website derivatives where useful → integrates them into the exact showroom/Plumbing slot → mobile/desktop QA → records the final usage in the Visual Vault.

### Joint Batch 5 + Fire Challenger controlled promotion

ChatGPT first places the supplied desktop candidates in the unique `agency/intake/...-a.png`, `-b.png` or `-c.png` paths from `WEBSITE-VENTURES-ASSET-IMPORT-MANIFEST.json`. Promotion is then one validated command:

```bash
node scripts/website-ventures-promote-batch5.js --job AG-HERO-PRODUCT-001 --variant B --generation-id <Higgsfield URL or ID> --dry-run
node scripts/website-ventures-promote-batch5.js --job AG-HERO-PRODUCT-001 --variant B --generation-id <Higgsfield URL or ID>
```

The gate accepts all five joint desktop jobs, verifies provenance, the declared variant, a real PNG, the required 16:9 or 4:5 ratio, overwrite safety and the joint-desktop-before-mobile dependency. Mobile records the exact desktop candidate path and generation ID it references. Only after every check passes does it copy the approved candidate to its final path and update both the import manifest and Selected Assets registry. An existing selection requires the deliberate `--replace` flag. This command does not generate, optimize or delete media.

The active prompt queue is `WEBSITE-VENTURES-HIGGSFIELD-QUEUE.json` and the UI is `website-ventures-higgsfield-prompt-board.html`.
