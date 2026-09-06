// Gamenfy — Builder Needs Input push desired-state Edge Function
// ChatGPT (OpenAI), 2026-09-06
//
// IMPORTANT: repository contract only. Do not deploy until the required Edge
// environment values exist. This source intentionally contains no private key,
// request secret, owner id, subscription endpoint or AI-provider credential.
import webpush from 'npm:web-push@3.6.7';

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`missing required environment value: ${name}`);
  return value;
}

const SB_URL = requiredEnv('SUPABASE_URL');
const SB_KEY = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
const PUSH_SECRET = requiredEnv('GAMENFY_PUSH_REQUEST_SECRET');
const VAPID_PUBLIC = requiredEnv('GAMENFY_VAPID_PUBLIC_KEY');
const VAPID_PRIVATE = requiredEnv('GAMENFY_VAPID_PRIVATE_KEY');

webpush.setVapidDetails('mailto:claudia@gamenfy.app', VAPID_PUBLIC, VAPID_PRIVATE);

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const APP_STATE_HEADERS = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
};

type PushSub = { endpoint?: string; keys?: Record<string, string> } & Record<string, unknown>;

type SubscriptionStore = {
  ownerId: string;
  subs: PushSub[];
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function validRequestId(value: unknown): string | null {
  const id = typeof value === 'string' ? value.trim() : '';
  return /^[A-Za-z0-9._:-]{8,120}$/.test(id) ? id : null;
}

function cleanReason(value: unknown): string | null {
  const text = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  if (!text) return null;
  return text.slice(0, 180);
}

async function getSubscriptionStore(): Promise<SubscriptionStore> {
  const response = await fetch(
    `${SB_URL}/rest/v1/app_state?key=eq.push_subscriptions&select=user_id,data`,
    { headers: APP_STATE_HEADERS },
  );
  if (!response.ok) throw new Error('push subscription lookup failed');
  const rows = await response.json();

  // Current Gamenfy storage is intentionally single-owner. Fail closed rather
  // than guess if a future owner migration ever produces more than one store.
  if (!Array.isArray(rows) || rows.length !== 1 || !rows[0]?.user_id) {
    throw new Error('expected exactly one push subscription owner');
  }
  const subs = Array.isArray(rows[0]?.data?.subs) ? rows[0].data.subs : [];
  return { ownerId: String(rows[0].user_id), subs };
}

async function getState(ownerId: string): Promise<any> {
  const response = await fetch(
    `${SB_URL}/rest/v1/app_state?key=eq.builder_input_push_state&user_id=eq.${encodeURIComponent(ownerId)}&select=data`,
    { headers: APP_STATE_HEADERS },
  );
  if (!response.ok) throw new Error('builder push state lookup failed');
  const rows = await response.json();
  return Array.isArray(rows) && rows.length ? (rows[0].data || {}) : {};
}

async function putRow(ownerId: string, key: string, data: unknown): Promise<void> {
  const response = await fetch(`${SB_URL}/rest/v1/app_state`, {
    method: 'POST',
    headers: { ...APP_STATE_HEADERS, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ key, user_id: ownerId, data, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(`app_state write failed for ${key}`);
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  if (req.headers.get('x-push-secret') !== PUSH_SECRET) return json({ error: 'forbidden' }, 403);

  let body: any;
  try { body = await req.json(); } catch (_) { return json({ error: 'invalid json' }, 400); }
  if (body?.mode !== 'builder_input') return json({ error: 'unsupported mode' }, 400);

  const requestId = validRequestId(body?.requestId);
  const reason = cleanReason(body?.reason);
  if (!requestId || !reason) return json({ error: 'invalid builder input request' }, 400);

  let store: SubscriptionStore;
  try { store = await getSubscriptionStore(); }
  catch (error) { return json({ error: String(error) }, 503); }

  if (!store.subs.length) return json({ sent: 0, reason: 'no subscriptions' });

  try {
    const state = await getState(store.ownerId);
    if (state?.lastRequestId === requestId) {
      return json({ sent: 0, reason: 'already sent', requestId });
    }
  } catch (error) {
    return json({ error: String(error) }, 503);
  }

  const payload = JSON.stringify({
    type: 'builder_input',
    title: 'Gamenfy heeft je nodig',
    body: reason,
    url: '/lab.html#builder-input',
    requestId,
  });

  const alive: PushSub[] = [];
  let sent = 0;
  for (const sub of store.subs) {
    try {
      await webpush.sendNotification(sub as any, payload);
      alive.push(sub);
      sent += 1;
    } catch (error: any) {
      const code = Number(error?.statusCode || 0);
      if (code === 404 || code === 410) continue;
      alive.push(sub);
    }
  }

  try {
    if (alive.length !== store.subs.length) {
      await putRow(store.ownerId, 'push_subscriptions', { subs: alive });
    }
    await putRow(store.ownerId, 'builder_input_push_state', {
      lastRequestId: requestId,
      sentAt: new Date().toISOString(),
      deliveredTo: sent,
    });
  } catch (error) {
    // Notification delivery already happened. Return a server error so a caller
    // does not falsely treat missing dedupe persistence as healthy.
    return json({ error: String(error), sent }, 503);
  }

  return json({ sent, mode: 'builder_input', requestId });
});
