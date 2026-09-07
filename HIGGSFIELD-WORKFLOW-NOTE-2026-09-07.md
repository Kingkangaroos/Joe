# Higgsfield workflow note — 2026-09-07

## Active rule
- Unlimited exploration should happen on `higgsfield.ai` when the selected model is visibly covered by the account's Unlimited entitlement.
- Plugin/MCP/CLI/other direct integrations are treated as credit-spending paths unless Higgsfield explicitly reports otherwise.
- ChatGPT Work Cloud Browser may be able to operate the Higgsfield website UI, but this is not assumed to preserve Unlimited until verified empirically.

## One-generation Work proof test
After subscription activation:
1. record starting Higgsfield credit balance;
2. open Higgsfield in ChatGPT Work Cloud Browser and sign in;
3. choose Soul 2.0 (or another model that is visibly Unlimited on the account);
4. confirm the Unlimited toggle is visibly active in the Higgsfield website UI;
5. generate exactly one still through the website UI;
6. inspect Manage Account → Usage and the credit balance;
7. if zero credits were deducted, Work-browser generation is approved for Unlimited exploration; otherwise stop using Work for Unlimited and generate those iterations manually on higgsfield.ai.

## Spend guardrail
- Capture the post-purchase starting subscription credit balance as 100%.
- At or below 50% remaining, stop new paid generations and review winners, discarded generations, remaining asset queue, and which remaining tasks can move to Unlimited/manual website generation.
- Motion/video stays behind approved still/reference winners.

This note is internal production logic, not public agency copy.
