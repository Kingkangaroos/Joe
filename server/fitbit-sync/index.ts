// Gamenfy — fitbit-sync (SCAFFOLD, deploy zodra Joey's client id/secret er zijn)
// Eén functie, drie modes:
//   ?auth=1 → redirect naar Fitbit authorize (PKCE)
//   ?cb=1   → OAuth callback: code → tokens → app_state.fitbit_tokens
//   (geen)  → daily pull (cron of handmatig): stappen/slaap/RHR/gewicht
//             van gisteren+vandaag → app_state.health_fitbit
const CLIENT_ID = 'REPLACE_ME';
const CLIENT_SECRET = 'REPLACE_ME';
const REDIRECT = 'https://ttxjsoahmtennnufgeqx.supabase.co/functions/v1/fitbit-sync';
const SCOPES = 'activity heartrate sleep weight profile';
const SB_URL = Deno.env.get('SUPABASE_URL')!;
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function getRow(key: string): Promise<any | null> {
  const r = await fetch(`${SB_URL}/rest/v1/app_state?key=eq.${key}&select=data`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows.length ? rows[0].data : null;
}
async function putRow(key: string, data: unknown) {
  await fetch(`${SB_URL}/rest/v1/app_state`, { method: 'POST',
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ key, data, updated_at: new Date().toISOString() }) });
}
const b64 = (s: string) => btoa(s);
async function tokenCall(body: URLSearchParams) {
  const r = await fetch('https://api.fitbit.com/oauth2/token', { method: 'POST',
    headers: { Authorization: 'Basic ' + b64(`${CLIENT_ID}:${CLIENT_SECRET}`),
      'Content-Type': 'application/x-www-form-urlencoded' }, body });
  return r.ok ? await r.json() : null;
}
async function freshToken(): Promise<string | null> {
  const t = await getRow('fitbit_tokens');
  if (!t?.refresh_token) return null;
  if (t.expires_at && Date.now() < t.expires_at - 60_000) return t.access_token;
  const n = await tokenCall(new URLSearchParams({ grant_type: 'refresh_token', refresh_token: t.refresh_token }));
  if (!n) return null;
  await putRow('fitbit_tokens', { ...n, expires_at: Date.now() + (n.expires_in ?? 28800) * 1000 });
  return n.access_token;
}
function day(offset = 0) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' })
    .format(new Date(Date.now() + offset * 86400000));
}
async function fb(path: string, tok: string) {
  const r = await fetch('https://api.fitbit.com' + path, { headers: { Authorization: 'Bearer ' + tok } });
  return r.ok ? await r.json() : null;
}

Deno.serve(async (req) => {
  const u = new URL(req.url);
  if (u.searchParams.has('auth')) {
    const a = new URL('https://www.fitbit.com/oauth2/authorize');
    a.searchParams.set('response_type', 'code');
    a.searchParams.set('client_id', CLIENT_ID);
    a.searchParams.set('redirect_uri', REDIRECT);
    a.searchParams.set('scope', SCOPES);
    return Response.redirect(a.toString(), 302);
  }
  if (u.searchParams.has('code')) {
    const code = u.searchParams.get('code') ?? '';
    const t = await tokenCall(new URLSearchParams({
      grant_type: 'authorization_code', code, redirect_uri: REDIRECT, client_id: CLIENT_ID }));
    if (!t) return new Response('Token exchange failed', { status: 400 });
    await putRow('fitbit_tokens', { ...t, expires_at: Date.now() + (t.expires_in ?? 28800) * 1000 });
    return new Response('Fitbit gekoppeld ✓ — je kunt dit venster sluiten.',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  const tok = await freshToken();
  if (!tok) return new Response(JSON.stringify({ error: 'not_authorized — open ?auth=1 first' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } });
  const [dY, dT] = [day(-1), day(0)];
  const out: Record<string, unknown> = { updated: new Date().toISOString() };
  for (const d of [dY, dT]) {
    const [act, sleep, hr, wt] = await Promise.all([
      fb(`/1/user/-/activities/date/${d}.json`, tok),
      fb(`/1.2/user/-/sleep/date/${d}.json`, tok),
      fb(`/1/user/-/activities/heart/date/${d}/1d.json`, tok),
      fb(`/1/user/-/body/log/weight/date/${d}.json`, tok),
    ]);
    out[d] = {
      steps: act?.summary?.steps ?? null,
      activeMinutes: (act?.summary?.fairlyActiveMinutes ?? 0) + (act?.summary?.veryActiveMinutes ?? 0),
      sleepMinutes: sleep?.summary?.totalMinutesAsleep ?? null,
      restingHR: hr?.['activities-heart']?.[0]?.value?.restingHeartRate ?? null,
      weightKg: wt?.weight?.[0]?.weight ?? null,
    };
  }
  await putRow('health_fitbit', out);
  return new Response(JSON.stringify({ ok: true, days: [dY, dT] }),
    { headers: { 'Content-Type': 'application/json' } });
});
