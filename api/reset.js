// GET /api/reset?key=ADMIN_KEY
// For you only: clears her pick and answer so you can test again.
// Disabled when ADMIN_KEY is not set.

import crypto from 'node:crypto';
import { remove } from '../lib/store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || !sameText(String(req.query.key ?? ''), adminKey)) {
    return res.status(403).send('Forbidden');
  }

  try {
    await remove('pick', 'answer');
    res.status(200).send('Reset done. The boxes are ready to pick again.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

// Compares in constant time so the key can't be guessed from response timing.
function sameText(a, b) {
  const hash = (text) => crypto.createHash('sha256').update(text).digest();
  return crypto.timingSafeEqual(hash(a), hash(b));
}
