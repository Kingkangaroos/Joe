# Gamenfy Money Lab · prepared 12 November 2026

Joey asked which investment platforms have APIs and requested preparatory work for his app. This is an isolated, buildless Lab experiment prepared against `Kingkangaroos/Joe` main commit `060a56f74553f59af916fd3bc84a76f9fe6cd5d8`. It is a proposal branch, not a production rollout or broker connection.

## Working prototype

Open `investment-lab.html` using the existing static hosting model. It uses the existing automatic Paper Quest / Midnight Observatory theme. No dependency installation, generated artwork, AI-provider call or new paid service is required.

- Three transparent rule sets: monthly investing, holding new contributions until a 10% drawdown, and a six-month trend filter.
- Three explicitly synthetic 36-month price paths; these are scenarios, not historical prices or backtests.
- Equal capital and contributions, fixed per-order fees and adverse price assumptions. Exact results in an accessible table alongside the SVG chart.
- Monthly decisions use only preceding closes. Trades use the current synthetic close. Cashflow-adjusted drawdown chains returns before and after each contribution so deposits cannot disguise investment losses.
- A separate €10,000 local paper portfolio can buy/sell only WORLD DEMO, with insufficient-cash and uncovered-sale rejection. It resets on page reload.
- Research notes save only after an explicit click, in `gamenfy_investment_lab_research_v1`. JSON export includes configuration, synthetic results, current paper ledger and notes.
- API platform comparison with links to primary documentation. No account-eligibility claim is implied by API availability.
- Additive Lab card and a release-feed entry with `home` and `lab` surfaces, as required by the current Builder contract. No Home layout changes.

## API findings

| Platform | Documented capabilities | Integration implications |
| --- | --- | --- |
| Trading 212 | Invest/Stocks ISA API, account summary, positions, orders, separate demo/live endpoints. Beta. Main account currency only. Basic authentication with key and secret. | Technically a comparatively small REST proof of concept. Confirm Joey's account/entity permissions and available instruments. Do not treat ISA as a Dutch account product. Respect endpoint rate limits; account summary is 1 request / 5 seconds. |
| Interactive Brokers | Web API/TWS API with account, position, market-data and trading services; paper environment. The retail Web API start guide specifies Client Portal Gateway. | More infrastructure than the existing static frontend. Verify current retail authentication, funded-account/paper prerequisites, market-data entitlements and gateway-session renewal before committing to a design. General OAuth documentation is not proof a retail account can use unattended OAuth. |
| Saxo | OpenAPI, simulation and live environments; live access requires permissions and testing. Some reporting and market data unavailable in SIM. | OAuth backend and application registration. Keep SIM and LIVE keys separate. API access for the specific Dutch account needs verification. |
| Alpaca | Globally available Paper Only accounts, paper Trading API; IEX data for paper-only accounts. | Useful for an API development exercise. Netherlands live retail eligibility is not confirmed by the paper documentation or by EEA institutional passporting. |

Technical assessment: Trading 212 Demo and Alpaca Paper are practical candidates for an initial development exercise. This is not a recommendation to open/fund a brokerage account. Broker costs, instrument availability, tax handling and suitability have not been compared.

## Prepared connector boundary

`investment-lab-connectors.mjs` is an unconnected **server-only** module exposing `createDemoReader({provider,key,secret,fetchImpl}).snapshot()`.

- Trading 212: `GET https://demo.trading212.com/api/v0/equity/account/summary` and `/equity/positions`.
- Alpaca: `GET https://paper-api.alpaca.markets/v2/account` and `/v2/positions`.
- Fixed endpoint allowlist; no custom URLs, live host, order endpoint, mutation method or request on import.
- Credentials are constructor inputs from server secret storage. Never put credentials in this repository, HTML, frontend state, chat, analytics or localStorage.
- Redirects fail closed. Bounded timeouts. Errors expose status codes only and never raw response bodies or request headers.
- Return contract: `{provider, mode:'broker-demo-readonly', fetchedAt, account, positions}`. `fetchedAt` is the retrieval timestamp, not proof that quotes are current.
- Unit tests inject mock responses. No external broker API call, account login or paper order has been performed.

Do not import this module into the static browser page. It is deliberately not an exposed HTTP endpoint. Before connecting a real read path, add an authenticated server route and per-owner account binding, server-only secret storage, CSRF protections where applicable, rate-limit-aware per-user caching, response normalization and source/currency timestamps. Use the existing account ownership model; never accept a browser-supplied arbitrary account identifier as authorization. A hosted backend with secrets is a separate integration step.

## Next implementation steps

1. Joey chooses an existing broker or a paper-only account and identifies desired instruments, horizon and budget. No funding needed for the current prototype.
2. Add an authenticated, read-only demo connection with server-held credentials; show connection status, environment, currency, retrieval time and market-data limitations. Never imply data is connected when showing fixtures.
3. Normalize account and positions into an explicit snapshot. Keep deposited principal, market profit, fees, FX and income separate. For actual performance, obtain transaction history and corporate actions; holdings alone cannot produce reliable money-weighted or time-weighted historical returns.
4. Replace synthetic paths with documented, adjusted historical datasets for meaningful backtesting. Include dividends, instrument inception/delisting, fees/spread, execution assumptions and out-of-sample evaluation. Compare against the same cash-flow benchmark. Do not optimize on the displayed test period.
5. Add research summaries and scheduled informational reports only after defining actual data access and freshness. Broker-native alerts are better suited to realtime price triggers than periodic chat checks.

Real order placement, autonomous decisions on real funds, fund transfers, live broker authentication and production financial-data writes are outside this preparation. The ChatGPT assistant's financial-action boundary is distinct from what broker APIs technically expose. No agent tool should receive a live execution capability from this prototype.

## Verification and rollback

Run `node tests/investment-lab-smoke.js`. Twelve grouped checks passed: capital/fee accounting, cashflow-adjusted drawdown, past-data decisions, input validation, paper-order constraints, demo GET allowlisting, sanitized connector errors and additive Lab discovery. Node syntax checks and HTML ID/local-asset checks passed. Additional jsdom interaction checks passed for scenario changes, buy/sell, rejected sales, month limit, reset, note save/reload/clear, safe text handling and the export trigger, with no script errors.

Browser layout QA could not run: the managed preview daemon was occupied by another preview. That preview was left running. Responsive CSS has been prepared, but rendered desktop/iPhone layout and an actual Safari download remain unverified. Existing app-wide regression tests have not been claimed to pass from this partial source workspace.

No data migration or existing Finance/Supabase/RPG state writer is added. Reverting this proposal's files, Lab card and release entry removes the feature. Research localStorage is separate; removal of the module does not delete notes automatically.

## Primary sources checked on 12 November 2026

- Trading 212 general documentation: https://docs.trading212.com/api
- Trading 212 account summary: https://docs.trading212.com/api/accounts/getaccountsummary.md
- Trading 212 positions: https://docs.trading212.com/api/positions/getpositions.md
- IBKR retail Web API guide: https://www.interactivebrokers.com/docs/web-api/getting-started
- IBKR TWS paper limitations: https://www.interactivebrokers.com/docs/tws-api/doc/notes-limitations/tws-api-limitations
- Saxo environments: https://www.developer.saxo/openapi/learn/environments
- Alpaca paper trading: https://docs.alpaca.markets/us/docs/paper-trading
- Alpaca account endpoint: https://docs.alpaca.markets/us/reference/getaccount-1
- Alpaca positions endpoint: https://docs.alpaca.markets/us/reference/getallopenpositions
- Alpaca live eligibility remains an account-specific check: https://alpaca.markets/support/countries-alpaca-is-available
