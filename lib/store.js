// Saves her pick and answer.
// On Vercel it uses Upstash Redis (free tier), so the pick is remembered on every
// phone and browser. Locally, without Redis settings, it uses .data/state.json.

import fs from 'node:fs/promises';
import path from 'node:path';

const PREFIX = 'tripbox:';
const localFile = path.join(process.cwd(), '.data', 'state.json');

function redisConfig() {
  // Upstash sets UPSTASH_*; the Vercel marketplace integration may set KV_* instead.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

async function redis(command) {
  const { url, token } = redisConfig();
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(`Redis error: ${data.error || res.status}`);
  return data.result;
}

async function readLocal() {
  try {
    return JSON.parse(await fs.readFile(localFile, 'utf8'));
  } catch {
    return {};
  }
}

async function writeLocal(state) {
  await fs.mkdir(path.dirname(localFile), { recursive: true });
  await fs.writeFile(localFile, JSON.stringify(state, null, 2));
}

function assertLocalAllowed() {
  // Vercel's disk is temporary, so a pick saved there would be forgotten.
  if (process.env.VERCEL) {
    throw new Error('Storage is not configured: add Upstash Redis to the Vercel project.');
  }
}

export async function get(key) {
  if (redisConfig()) {
    const value = await redis(['GET', PREFIX + key]);
    return value == null ? null : JSON.parse(value);
  }
  assertLocalAllowed();
  return (await readLocal())[key] ?? null;
}

// Saves only if nothing is saved yet. Returns true if saved, false if a value already existed.
// Redis does this in one step, so two quick taps can never both win.
export async function setIfAbsent(key, value) {
  if (redisConfig()) {
    return (await redis(['SET', PREFIX + key, JSON.stringify(value), 'NX'])) === 'OK';
  }
  assertLocalAllowed();
  const state = await readLocal();
  if (state[key] != null) return false;
  state[key] = value;
  await writeLocal(state);
  return true;
}

export async function remove(...keys) {
  if (redisConfig()) {
    await redis(['DEL', ...keys.map((key) => PREFIX + key)]);
    return;
  }
  assertLocalAllowed();
  const state = await readLocal();
  for (const key of keys) delete state[key];
  await writeLocal(state);
}
