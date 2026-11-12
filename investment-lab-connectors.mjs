// Server-side module only. No broker request is made on import.
// Fixed demo/paper GET endpoints; no custom URLs, live hosts or order endpoints.
const providers = Object.freeze({
  trading212: { base: 'https://demo.trading212.com/api/v0', paths: ['/equity/account/summary', '/equity/positions'] },
  alpaca: { base: 'https://paper-api.alpaca.markets', paths: ['/v2/account', '/v2/positions'] }
});
export function createDemoReader({ provider, key, secret, fetchImpl = globalThis.fetch }) {
  if (!Object.hasOwn(providers, provider)) throw new Error('Unsupported demo provider');
  if (typeof key !== 'string' || !key.trim() || typeof secret !== 'string' || !secret.trim()) throw new Error('Server credentials required');
  const spec = providers[provider];
  const headers = provider === 'alpaca'
    ? { 'APCA-API-KEY-ID': key, 'APCA-API-SECRET-KEY': secret, Accept: 'application/json' }
    : { Authorization: 'Basic ' + Buffer.from(key + ':' + secret).toString('base64'), Accept: 'application/json' };
  async function get(path) {
    let response;
    try { response = await fetchImpl(spec.base + path, { method: 'GET', headers, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(10000) }); }
    catch (_) { throw new Error('Demo provider unavailable'); }
    // Do not log or forward raw provider bodies, headers, or credentials.
    if (!response.ok) throw new Error('Demo provider returned HTTP ' + response.status);
    try { return await response.json(); } catch (_) { throw new Error('Demo provider returned invalid JSON'); }
  }
  return Object.freeze({
    async snapshot() {
      // Sequential, bounded reads. Host-specific cache and authentication belong to the backend.
      const account = await get(spec.paths[0]), positions = await get(spec.paths[1]);
      if (!account || typeof account !== 'object' || Array.isArray(account) || !Array.isArray(positions)) throw new Error('Unexpected demo snapshot shape');
      return { provider, mode: 'broker-demo-readonly', fetchedAt: new Date().toISOString(), account, positions };
    }
  });
}
