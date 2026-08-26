# AI collaboration protocol

Claude/Claudia and ChatGPT/OpenAI both work on Gamenfy. This file exists to preserve continuity and make authorship obvious, not to give one assistant control over the other.

## Before changing anything

1. Read `GAMENFY-MASTER.md` and the recent commit history.
2. Check the live behavior or data relevant to the task; do not rely only on old documentation.
3. Preserve unrelated work and never rewrite another assistant's access or configuration unless Joey explicitly requests it.
4. Use a feature branch for non-trivial or risky changes. Do not experiment directly on production data.

## Attribution

Each AI-authored commit must identify the assistant in the commit body:

```text
Performed-by: ChatGPT (OpenAI)
```

or:

```text
Performed-by: Claude/Claudia (Anthropic)
```

For shared work, include both lines. Keep the normal descriptive commit title and explanation; attribution is additional metadata, not a replacement for a useful commit message.

## Handoff note

For a multi-step change, update the relevant source-of-truth section with:

- what changed;
- what was verified;
- what remains open;
- whether production data, database policies, secrets or deployments were touched.

Never claim a live fix was verified when only syntax or a preview was checked.

## Security-sensitive work

Follow `SECURITY.md`. Database policy changes, credential rotation and authentication migrations require a tested replacement route and rollback plan. Claude and ChatGPT must retain their normal development access unless Joey explicitly changes that decision.
