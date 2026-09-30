// GET /api/state
// Everything the page needs on load: the intro, the box hints, and her pick if she already made one.

import { intro, publicBoxes, revealedTrip } from '../lib/content.js';
import { get } from '../lib/store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const pick = await get('pick');
    res.status(200).json({
      intro,
      boxes: publicBoxes(),
      pick: pick ? { ...pick, trip: revealedTrip(pick.boxId) } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
