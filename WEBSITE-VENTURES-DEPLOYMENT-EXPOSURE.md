# Website Ventures — Deployment Exposure Boundary

Last checked: **2026-09-08 · ChatGPT (OpenAI)**

## Current exposure

The current Vercel project `joe` serves the repository root as the production site. Therefore files such as:

- Website Ventures Operator Hub;
- Higgsfield prompt board / queue JSON;
- Review / selected-asset tools;
- HQ and handoff documents;
- Client Factory / Intake / Delivery tooling;

are currently directly reachable as static production URLs if someone knows or discovers the filename.

Making the GitHub repository private later **does not by itself remove already-deployed static files from the public production domain**.

## Vercel protection constraint

Current project/team: Vercel Hobby.

Current Vercel documentation says:

- Vercel Authentication is available on Hobby;
- Standard Protection on Hobby protects preview/generated deployment URLs;
- the production domain remains publicly accessible on Hobby;
- protecting all URLs including production domains requires Pro or Enterprise;
- Password Protection is Enterprise or a paid Advanced Deployment Protection add-on for Pro.

Do not enable protection blindly on the existing Gamenfy production project because Fitbit/OAuth/PWA/mobile flows must be regression-tested first.

## Immediate operating rules

Until the architecture is changed:

1. **Do not store confidential customer intake, private customer messages, credentials, tokens or unpublished commercial secrets in public repo files.**
2. Client Intake, Offer, Fulfilment Run, Delivery Gate and Handoff state remains localStorage-only by default.
3. Repo client configs should contain only data intended for the actual public customer website.
4. Never place API secrets in client-side Website Ventures JavaScript or JSON.
5. Treat prompt/HQ files as currently exposed commercial IP, not protected storage.
6. Do not launch a paying client from this current Hobby production setup.

## Preferred future architecture

### Source

One **private standalone source repository** is still acceptable. A separate repository is not required purely for organization.

First detach `Kingkangaroos/Joe` from its public fork network, then make the standalone source private. See:

- `WEBSITE-VENTURES-IP-REPO-CUTOVER.md`

### Deployments

Separate what is public from what is internal at deployment level:

#### A. Public customer/agency output

Public deployment should contain only assets actually needed by public websites, for example:

- approved agency website;
- approved customer site output;
- web-optimized approved imagery;
- public runtime code required by those sites.

It should **not** contain:

- prompts;
- HQ docs;
- generation queues;
- review tools;
- internal Client Factory / Intake / Delivery tools;
- internal cost/time data.

#### B. Internal Website Ventures operator tooling

Internal tools should live in a deployment boundary that is actually protected server-side/platform-side.

Candidate route once the commercial hosting plan is locked:

- private source repository;
- dedicated internal Vercel project or other protected environment;
- Vercel Authentication / appropriate deployment protection;
- only Joey/approved operators get access.

Do not rely on a JavaScript-only password or hidden filename as security.

### Gamenfy personal app

Gamenfy can remain a separate product concern even if it shares source history. Before putting the entire existing Gamenfy project behind Vercel-level authentication, test:

- PWA install/reopen;
- private Supabase auth;
- Fitbit OAuth callback and sync;
- service worker/static asset loading;
- mobile deep links.

The Website Ventures IP problem should not be “solved” by casually breaking personal Gamenfy access.

## `.vercelignore`

Vercel supports `.vercelignore` to prevent files from being uploaded and served at all. This is useful once the public deployment boundary is explicit.

Do **not** add a broad `.vercelignore` to the current root project yet: Website Ventures internal tools currently depend on being served from this project, and an untested allowlist could also remove required Gamenfy files.

Later, prefer an allowlisted public-output project/deployment rather than an ever-growing blacklist of internal files.

## Approval gates

Requires Joey approval before any of the following:

- fork detachment;
- repository visibility change;
- creation/migration of a production Vercel project that changes existing URLs;
- Pro/paid protection purchase;
- removing existing internal routes from the current production deployment.

## Status

**Architecture documented; no destructive security migration executed.**

Current operational priority remains Higgsfield Batch 5 + Agency proof. Security cutover should happen before real paid-client data/workflows are trusted to this production environment.
