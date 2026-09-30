// GET /api/state
// Everything the page needs on load: the intro, the box hints, her pick and answer if she already made them,
// and the weekends she can choose from.

import { answerCopy, dates, intro, publicBoxes, revealedTrip } from '../lib/content.js';
import { availableWeekends } from '../lib/dates.js';
import { get } from '../lib/store.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [pick, answer] = await Promise.all([get('pick'), get('answer')]);
    res.status(200).json({
      intro,
      boxes: publicBoxes(),
      pick: pick ? { ...pick, trip: revealedTrip(pick.boxId) } : null,
      answer,
      answerCopy,
      maxChoices: dates.maxChoices,
      weekends: availableWeekends(dates),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
