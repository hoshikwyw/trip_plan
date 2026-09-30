// Emails you when she picks a box and when she answers.
// Uses your Gmail with an App Password (GMAIL_USER, GMAIL_APP_PASSWORD).
// Without those settings (e.g. local testing) the email is printed to the console instead.

import nodemailer from 'nodemailer';
import { findBox } from './content.js';

function gmailConfig() {
  const user = process.env.GMAIL_USER;
  // Google shows the App Password with spaces ("abcd efgh ijkl mnop"); they are not part of it.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
  return user && pass ? { user, pass, to: process.env.NOTIFY_TO || user } : null;
}

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const myanmarTime = (iso) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Yangon', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) +
  ' (Myanmar time)';

// rows: [label, value][] -> a simple table that reads well in Gmail on a phone.
function layout(heading, rows, footer = '') {
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#7a6570;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:8px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
  const html =
    `<div style="font-family:'Noto Sans Myanmar',Arial,sans-serif;font-size:15px;line-height:1.8;color:#3a2a33;max-width:520px">` +
    `<h2 style="color:#d9577a;margin:0 0 12px">${escapeHtml(heading)}</h2>` +
    `<table style="border-collapse:collapse">${htmlRows}</table>` +
    (footer ? `<p style="color:#7a6570;margin-top:16px">${escapeHtml(footer)}</p>` : '') +
    `</div>`;
  const text = [heading, '', ...rows.map(([label, value]) => `${label}: ${value}`), footer && `\n${footer}`]
    .filter((line) => line !== '')
    .join('\n');
  return { html, text };
}

export function pickEmail(pick) {
  const trip = findBox(pick.boxId)?.trip;
  return {
    subject: `🎁 She picked a box: ${trip?.title ?? pick.boxId}`,
    ...layout(
      'She opened a blind box! 🎁',
      [
        ['Trip', `${trip?.emoji ?? ''} ${trip?.title ?? pick.boxId}`.trim()],
        ['Box id', pick.boxId],
        ['Picked at', myanmarTime(pick.pickedAt)],
      ],
      'She is choosing dates now. You will get another email when she answers.',
    ),
  };
}

export function answerEmail(pick, answer) {
  const trip = findBox(pick?.boxId)?.trip;
  const yes = answer.choice === 'yes';
  const dates = answer.later
    ? 'She will tell you the date later'
    : answer.weekends.length
      ? answer.weekends.map((w) => `• ${w.label} — Sat ${w.id}`).join('\n')
      : 'No dates chosen';

  return {
    subject: yes ? `💕 She said YES: ${trip?.title ?? ''}`.trim() : "💬 She wants to talk first",
    ...layout(yes ? 'She said YES! 💕' : 'She wants to talk first 💬', [
      ['Answer', yes ? 'Yes, let’s go (သွားမယ်)' : 'Let’s talk first (အရင် စကားပြောကြရအောင်)'],
      ['Trip', `${trip?.emoji ?? ''} ${trip?.title ?? '-'}`.trim()],
      ['Weekends', dates],
      ['Her message', answer.message || '(no message)'],
      ['Answered at', myanmarTime(answer.answeredAt)],
    ]),
  };
}

// Never throws: a failed email must not stop her pick or answer from being saved.
export async function notify({ subject, html, text }) {
  const gmail = gmailConfig();
  if (!gmail) {
    console.log(`\n[email not configured — would send]\nSubject: ${subject}\n${text}\n`);
    return;
  }

  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmail.user, pass: gmail.pass },
      // Fail fast instead of keeping her waiting if Gmail is slow to respond.
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
    await transport.sendMail({ from: `"Trip Blind Box" <${gmail.user}>`, to: gmail.to, subject, html, text });
  } catch (err) {
    console.error('Email failed:', err);
  }
}
