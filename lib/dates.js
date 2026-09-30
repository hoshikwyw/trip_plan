// Weekends she can pick, with Burmese labels.
// Dates are counted in Myanmar time so "today" is the same for her and for the server.

const MONTHS = [
  'ဇန်နဝါရီ',
  'ဖေဖော်ဝါရီ',
  'မတ်',
  'ဧပြီ',
  'မေ',
  'ဇွန်',
  'ဇူလိုင်',
  'သြဂုတ်',
  'စက်တင်ဘာ',
  'အောက်တိုဘာ',
  'နိုဝင်ဘာ',
  'ဒီဇင်ဘာ',
];
const DIGITS = '၀၁၂၃၄၅၆၇၈၉';
const DAY_MS = 24 * 60 * 60 * 1000;

export const myNumber = (n) => String(n).replace(/\d/g, (d) => DIGITS[d]);

const isoDate = (date) => date.toISOString().slice(0, 10);
const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

function todayInMyanmar() {
  // en-CA formats as YYYY-MM-DD
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yangon' }).format(new Date());
  return new Date(`${ymd}T00:00:00Z`);
}

export function describeWeekend(saturday) {
  const sunday = addDays(saturday, 1);
  const satMonth = MONTHS[saturday.getUTCMonth()];
  const sunMonth = MONTHS[sunday.getUTCMonth()];
  const satDay = myNumber(saturday.getUTCDate());
  const sunDay = myNumber(sunday.getUTCDate());
  const sameMonth = saturday.getUTCMonth() === sunday.getUTCMonth();

  return {
    id: isoDate(saturday),
    month: `${satMonth} ${myNumber(saturday.getUTCFullYear())}`,
    short: sameMonth ? `${satDay} – ${sunDay}` : `${satDay} – ${sunMonth} ${sunDay}`,
    crossesMonth: !sameMonth,
    label: `${satMonth} ${satDay} – ${sameMonth ? '' : `${sunMonth} `}${sunDay} ရက် (စနေ–တနင်္ဂနွေ)`,
  };
}

export function availableWeekends({ minDaysAhead, maxDaysAhead, blockedSaturdays = [] }) {
  const today = todayInMyanmar();
  const earliest = addDays(today, minDaysAhead);
  const latest = addDays(today, maxDaysAhead);
  const weekends = [];

  // First Saturday on or after the earliest day (Saturday is day 6).
  let saturday = addDays(earliest, (6 - earliest.getUTCDay() + 7) % 7);
  for (; saturday <= latest; saturday = addDays(saturday, 7)) {
    if (!blockedSaturdays.includes(isoDate(saturday))) weekends.push(describeWeekend(saturday));
  }
  return weekends;
}
