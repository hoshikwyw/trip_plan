// POST /api/answer  { choice: 'yes' | 'talk', weekends: ['YYYY-MM-DD', ...], later: boolean, message: string }
// Saves her answer. Like the pick, only the first answer counts.

import { dates } from '../lib/content.js';
import { availableWeekends } from '../lib/dates.js';
import { answerEmail, notify } from '../lib/notify.js';
import { get, setIfAbsent } from '../lib/store.js';

const MAX_MESSAGE_LENGTH = 1000;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) ?? {};
  const { choice, later = false } = body;
  const weekendIds = Array.isArray(body.weekends) ? [...new Set(body.weekends)] : [];
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : '';

  // Keeps date order, whatever order they were sent in.
  const weekends = availableWeekends(dates).filter((w) => weekendIds.includes(w.id));

  if (choice !== 'yes' && choice !== 'talk') return res.status(400).json({ error: 'Unknown choice' });
  if (typeof later !== 'boolean') return res.status(400).json({ error: 'Invalid later flag' });
  if (weekends.length !== weekendIds.length) return res.status(400).json({ error: 'Unknown weekend' });
  if (weekends.length > dates.maxChoices) return res.status(400).json({ error: 'Too many weekends' });
  if (choice === 'yes' && !later && weekends.length === 0) {
    return res.status(400).json({ error: 'Pick a weekend or choose later' });
  }

  try {
    const pick = await get('pick');
    if (!pick) return res.status(409).json({ error: 'No box picked yet' });

    const answer = {
      choice,
      weekends: later ? [] : weekends,
      later,
      message,
      answeredAt: new Date().toISOString(),
    };
    const saved = await setIfAbsent('answer', answer);
    // Awaited before responding: Vercel may stop the function once the response is sent.
    if (saved) await notify(answerEmail(pick, answer));

    res.status(saved ? 201 : 409).json({
      alreadyAnswered: !saved,
      answer: saved ? answer : await get('answer'),
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
