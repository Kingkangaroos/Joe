# Fitbit Air → Gamenfy via de Google Health API

## Huidige productie — 4 september 2026

De actieve health-bron is uitsluitend `app_state.health_fitbit`, gevuld door de gedeployde `fitbit-sync` Edge Function via Google Health API v4.

Actief contract:
- `fitbit-sync` = huidige ingest;
- Europe/Amsterdam kalenderdagen;
- Walking Daily Mission = 10.000 stappen;
- Sleep Daily Mission = 420 minuten / 7 uur;
- Daily Mission-thresholds worden niet door ingest geschreven maar door `autohabit-reconcile.js` toegepast na veilige RPG cloud/local convergentie;
- `health_fitbit` blijft health-source authority; Fitbit-cron herschrijft nooit direct de whole-row `app_state.rpg`.

Legacy/inert:
- `fitbit-intraday` bestaat nog als JWT-protected Edge Function-object maar retourneert alleen HTTP 410;
- `health-sync` bestaat nog als JWT-protected Edge Function-object maar retourneert alleen HTTP 410;
- de oude `app_state.health_fitbit_intraday`-rij is historische data en wordt niet door actieve clientcode, cronjobs of databasefuncties gebruikt;
- die legacy-row hoeft niet destructief verwijderd te worden om de huidige integratie correct te laten werken.

Regression: actieve `.js`, `.html` en `.ts` broncode mag de legacy app-state key of oude function-routes niet opnieuw introduceren; zie `tests/deprecated-health-source-smoke.js`.

## Oorspronkelijke Google Health setup

**Status juli 2026:** dev.fitbit.com accepteert geen nieuwe app-registraties
meer (Joey bevestigde dit; nieuwe integraties moeten naar de Google Health
API, live sinds eind mei op health.googleapis.com/v4). Joey's setup — vers
Google-account + Fitbit Air in de Google Health app — is precies wat de
nieuwe API vereist. Route A (legacy) is vervallen; dit is nu het plan.

## Joey's stappen (~15 min, eenmalig) — Google Cloud Console
1. Ga naar https://console.cloud.google.com → log in met het Google-account
   waar je Fitbit Air aan hangt → "Create project" → naam: `Gamenfy`.
2. Menu → **APIs & Services → Library** → zoek **"Google Health API"** →
   **Enable**.
3. Menu → **APIs & Services → OAuth consent screen**:
   - User type: **External** → Create
   - App name `Gamenfy`, support-email = je eigen mail → opslaan
   - Publishing status laten op **Testing** en jezelf toevoegen als
     **Test user** (jouw Gmail). Geen verificatie nodig zolang alleen jij
     de gebruiker bent.
4. Menu → **APIs & Services → Credentials** → **Create credentials →
   OAuth client ID** → type **Web application**:
   - Name: `gamenfy-sync`
   - Authorized redirect URI (exact):
     `https://ttxjsoahmtennnufgeqx.supabase.co/functions/v1/fitbit-sync`
5. Kopieer de **Client ID** en **Client Secret** → plak beide in de chat
   bij Claudia.

## Wat Claudia daarna doet
1. Herschrijft `server/fitbit-sync/index.ts`: Google OAuth 2.0
   (accounts.google.com authorize + oauth2.googleapis.com token) i.p.v.
   Fitbit OAuth, en data-pull van **health.googleapis.com/v4** (bundles:
   activity/steps, sleep, heart rate/RHR, body/weight).
2. Deployt, stuurt Joey één autorisatie-link → "Toestaan" op je telefoon.
3. Dagelijkse pull → `app_state.health_fitbit` → Body-tab + Jarvis-context.

## Let op bij het credentials-formulier
- **Authorised JavaScript origins: LEEG laten** (dat veld is voor browser-apps;
  een URL met pad geeft daar "Invalid origin").
- De URL hoort bij **Authorised redirect URIs** (het veld eronder), zonder
  querytekens — de functie herkent de callback aan Google's eigen ?code=.

## Bekende kanttekening
Testing-mode met restricted scopes kan periodieke her-consent vragen
(Google verloopt refresh tokens van test-apps soms na 7 dagen). De sync
detecteert dat en meldt het; werkt het storend, dan is app-verificatie
of een andere bron het vervolg — eerst kijken hoe het zich gedraagt.

## Archief — eerdere situatie (mei 2026, vervallen)
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
   - Redirect URL: `https://ttxjsoahmtennnufgeqx.supabase.co/functions/v1/fitbit-sync`
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
