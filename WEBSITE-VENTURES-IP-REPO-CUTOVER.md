# Website Ventures — Public Fork → Private IP Cutover

Last checked: **2026-09-08 · ChatGPT (OpenAI)**

## Why this exists

`Kingkangaroos/Joe` is currently:

- public;
- a fork of `RowanThistlebrooke/YTdashh1`;
- the source currently connected to the live Gamenfy / Website Ventures Vercel project.

That means internal Website Ventures prompts, production logic, HQ files and commercial workflows are exposed as long as they stay in this public repo.

## Important GitHub constraint

GitHub's current documentation says:

- public repository forks are public;
- private repository forks are private;
- **the visibility of a fork cannot be changed independently from its fork network**.

GitHub also now supports **Leave fork network** for eligible public forks. This converts the fork into a standalone repository. The action is permanent and can discard fork-network metadata such as issues/PRs/stars/watchers/comments while preserving Git commit metadata.

For this repository, the correct concept is therefore **not** “click Make private immediately.”

The safe concept is:

**public fork → detach/leave fork network → verify standalone repo + deployment → make standalone repo private → verify integrations again.**

## DO NOT execute automatically

This cutover is deliberately **approval-gated** because:

1. leaving the fork network is permanent;
2. GitHub warns that repository metadata can be lost;
3. the repo currently drives the live Vercel project;
4. private-repo access for the existing GitHub/Vercel/ChatGPT integrations must be confirmed before relying on it;
5. this connector currently exposes code/content writes but not the required repository Settings / Leave fork network / visibility mutations.

## Recommended cutover procedure

### Phase A — preflight, no destructive action

- Confirm production currently deploys from `Kingkangaroos/Joe` main.
- Keep a known-good production deployment ID/URL for rollback/reference.
- Confirm no important open PR/issue/wiki metadata needs preserving separately.
- Confirm GitHub account has permission to use private repositories.
- Confirm the Vercel GitHub integration has access to private repositories for Joey's account/team.
- Confirm ChatGPT's GitHub connection will be installed/authorized for the resulting private standalone repo.
- Do not upgrade Vercel or buy anything merely for this repository cutover without Joey approval.

### Phase B — detach the fork in GitHub UI

GitHub UI, on `Kingkangaroos/Joe`:

1. Settings.
2. General.
3. Danger Zone.
4. **Leave fork network**.
5. Read GitHub's warnings.
6. Confirm the repository name.
7. Wait until GitHub reports the repository as standalone.

Do not delete/recreate the repo as the first choice; GitHub's built-in Leave fork network is safer when available.

### Phase C — verify BEFORE changing visibility

After detaching but while still public:

- verify repo URL/name is still the expected source;
- verify `main` and latest Website Ventures commits exist;
- verify Vercel's Git link still resolves;
- trigger/observe one harmless deployment if needed;
- verify `https://joe-silk.vercel.app/` remains healthy;
- verify GitHub connector still reads/writes the repo.

If any integration broke here, repair it before making the repo private.

### Phase D — make the standalone repository private

Only after Phase C passes:

1. GitHub Settings → General → Danger Zone.
2. Change repository visibility.
3. Choose **Private**.
4. Confirm GitHub's warnings and repository name.

### Phase E — post-private smoke test

Verify:

- GitHub repo reports `private: true` / visibility private;
- Vercel can still read and deploy from main;
- stable production alias is healthy;
- ChatGPT GitHub connector can still fetch and commit;
- no public raw GitHub URL exposes current internal files;
- Website Ventures Operator Hub, Queue, Selected Assets, Client Factory and Gamenfy root still return successfully.

## Alternative if Leave fork network is unavailable

GitHub documents a manual standalone-repository method using a bare clone / new standalone repository / mirror push. That route is more disruptive because repository identity and integrations may need to be reconnected, so it is **fallback only**, not current recommendation.

## Longer-term architecture

Even after the main repo is private, the better commercial boundary may eventually become:

- private internal source / production logic;
- public deployed agency website output;
- separate customer deployments/projects when commercial hosting is locked;
- no prompt/model recipe/HQ operational logic exposed in public frontend assets.

Do not split repos merely for cleanliness before the current Agency + Plumbing workflow is proven; do it when it materially improves IP/security or customer deployment isolation.

## Current status

**BLOCKED ON EXPLICIT JOEY APPROVAL / MANUAL GITHUB SETTINGS ACTION.**

No detachment, deletion, visibility change, repository migration or Vercel reconnect has been performed by ChatGPT.
