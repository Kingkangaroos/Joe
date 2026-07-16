# Fitbit → Gamenfy (voorbereid, wachtend op het device)

Doel: dagelijkse pull van stappen, slaap, hartslag-in-rust en (waar aanwezig)
gewicht uit Fitbit → `app_state.health_fitbit` → Body-tab + Jarvis-context.
Route: **Fitbit Web API met OAuth 2.0 PKCE** (gratis, geen Google-Premium nodig).

## UPDATE juli 2026: twee routes (geverifieerd)
Google lanceerde eind mei de **Google Health API** (health.googleapis.com/v4,
registratie via Google Cloud Console, Google OAuth 2.0) als opvolger van de
Fitbit Web API. De oude API **stopt eind september 2026** maar werkt tot dan
gewoon naast de nieuwe. Strategie: **Route A (dev.fitbit.com) NU** — 15 min,
scaffold ligt klaar, data stroomt vandaag; **Route B (Google Health API) in
augustus** — Claudia herschrijft fitbit-sync naar de v4-endpoints + Google
OAuth vóór de september-deadline. Let op bij B: alle scopes zijn "Restricted";
voor persoonlijk gebruik draait de app in Testing-mode (jezelf als testuser),
mogelijk met periodieke her-consent — Claudia vangt dat af in de sync.

## Realiteit per mei 2026 (geverifieerd)
De Fitbit-app bestaat inderdaad niet meer — hij heet nu de **Google Health app**
(iOS 16.4+). De Fitbit Air koppel je dáárin met je Google-account. De
developer-API op dev.fitbit.com blijft gewoon werken (Strava/MFP draaien erop);
je logt daar in met je Google-account. Ons plan verandert dus niet.

## Joey's stappen (±15 min)
0. Installeer de **Google Health** app uit de App Store, log in met je
   Google-account en koppel de Fitbit Air volgens de app-instructies.
1. Ga naar https://dev.fitbit.com/apps → log in met je Fitbit/Google-account →
   **Register an app**.
2. Vul in:
   - Application name: `Gamenfy` · Description/website: je Vercel-URL
   - OAuth 2.0 Application Type: **Personal**  ← belangrijk (geeft intraday + alleen jouw data)
   - Redirect URL: `https://ttxjsoahmtennnufgeqx.supabase.co/functions/v1/fitbit-sync?cb=1`
   - Access: Read Only
3. Na opslaan zie je **Client ID** en **Client Secret** → plak die twee in de chat
   bij Claudia. Meer is er niet.

## Wat Claudia daarna doet (voorbereid in `server/fitbit-sync/index.ts`)
1. Vult client id/secret in, deployt de functie.
2. Stuurt je één autorisatie-link → jij tikt "Toestaan" op je telefoon.
3. Functie wisselt de code om, bewaart tokens in `app_state.fitbit_tokens`
   (server-side rij, buiten de device-sync), en ververst ze automatisch.
4. Een dagelijkse cron (Supabase scheduled function, zelfde patroon als
   send-daily-push) pullt gisteren+vandaag → `app_state.health_fitbit`.
5. Body-tab leest die rij (read-only fetch zoals de Hevy-widget), Jarvis krijgt
   de kerncijfers in zijn context.

## Scopes
`activity heartrate sleep weight profile` — read-only.
