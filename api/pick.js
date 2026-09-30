// POST /api/pick  { boxId }
// Saves her pick. Only the first pick ever counts; after that it always returns the saved one.

import { findBox, revealedTrip } from '../lib/content.js';
import { get, setIfAbsent } from '../lib/store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const boxId = body?.boxId;
  if (typeof boxId !== 'string' || !findBox(boxId)) {
    return res.status(400).json({ error: 'Unknown box' });
  }

  try {
    const pick = { boxId, pickedAt: new Date().toISOString() };
    const saved = await setIfAbsent('pick', pick);
    const current = saved ? pick : await get('pick');

    res.status(saved ? 201 : 409).json({
      alreadyPicked: !saved,
      pick: { ...current, trip: revealedTrip(current.boxId) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
