// All the words on the page live here. Edit this file to change what she reads.
// This file stays on the server: she only sees a box's trip after she picks it.
// Lines only wrap at spaces, so put a space between phrases like normal Burmese writing.

// Opening screen.
export const intro = {
  title: 'မင်းအတွက် လက်ဆောင်လေး 🎁',
  lines: [
    'ခရီးလေး တစ်ခု အတူတူ သွားချင်လို့ ပြင်ထားတာ။',
    'ဘူးလေးတွေထဲမှာ ခရီးစဉ်တွေ ဝှက်ထားတယ်။ မကြည့်ရဘူးနော် 🙈',
    'တစ်ဘူးပဲ ရွေးလို့ရတယ်၊ ရွေးပြီးရင် ပြန်ပြောင်းလို့ မရတော့ဘူး။',
  ],
  button: 'ဘူးလေးတွေ ကြည့်မယ်',
};

// Shown on every trip after it is revealed.
export const promises = [
  { icon: '🚫🦐', text: 'ပင်လယ်စာ လုံးဝ မပါဘူး၊ မှတ်ထားတယ် 😊' },
  { icon: '🛏️', text: 'အခန်း သီးသန့်စီ ယူမယ်' },
  { icon: '🏠', text: 'တနင်္ဂနွေ ညနေ အိမ်ပြန်ရောက်အောင် ပို့ပေးမယ်' },
];

export const closing = 'ကျန်တာအကုန် ကိုယ် စီစဉ်ထားမယ်။ မင်းက လိုက်ခဲ့ရုံပဲ 💕';

// The blind boxes.
// - hint: shown on the wrapped box BEFORE she picks, so never put the place name here.
// - wrap: box color, one of 'rose' | 'gold' | 'sky' | 'mint'.
// - trip: revealed only after she picks this box.
//   - plan: optional. Leave it as [] until you know the details; the section is hidden when empty.
//     Example: [{ day: 'စနေ', items: ['မနက် ရထားစီးမယ်', 'ညနေ ဘုရားဖူးမယ်'] }]
//   - note: your personal line to her about why this trip is for her.
export const boxes = [
  {
    id: 'bago',
    wrap: 'rose',
    hint: 'ရထားလေးစီးပြီး ရှေးဟောင်း ပုံပြင်တွေဆီ 🚆',
    trip: {
      emoji: '🏯',
      title: 'ပဲခူးမြို့ ခရီး',
      mood: 'အတူတူ လျှောက်ကြည့်မယ်၊ စားမယ်၊ ဘုရားဖူးမယ်',
      plan: [],
      note: 'မင်း ရထားစီးချင်တယ်ဆိုလို့ ဒီခရီးကို ရွေးထားတာ 🚆',
    },
  },
  {
    id: 'resort',
    wrap: 'mint',
    hint: 'ဘာမှမလောဘဲ အေးအေးဆေးဆေး နေရမယ့်နေရာ 🌿',
    trip: {
      emoji: '🏡',
      title: 'ပဲခူးနား Resort လေး',
      mood: 'ဘာမှ မလုပ်ဘဲ အတူတူ အနားယူမယ်',
      plan: [],
      note: 'ရထားလေးစီးပြီး အေးအေးဆေးဆေး အနားယူကြမယ်နော် 🌿',
    },
  },
  {
    id: 'beach',
    wrap: 'sky',
    hint: 'လှိုင်းသံလေး ကြားရမယ့်နေရာ 🌊',
    trip: {
      emoji: '🏖️',
      title: 'ပင်လယ်ကမ်းခြေ',
      mood: 'နေဝင်ချိန် ကမ်းခြေမှာ အတူတူ လမ်းလျှောက်မယ်',
      plan: [],
      note: 'ပင်လယ်ကို မင်းနဲ့အတူ ကြည့်ချင်လို့ 🌅',
    },
  },
];

// Which weekends she can choose (Saturday to Sunday, counted in Myanmar time).
// blockedSaturdays: weekends you can't go, as the Saturday date, e.g. ['2026-11-14'].
export const dates = {
  minDaysAhead: 14,
  maxDaysAhead: 90,
  maxChoices: 3,
  blockedSaturdays: [],
};

// The answer screen and the thank-you screen after she answers.
// If you change dates.maxChoices, update the (၃) in subtitle and tooMany too.
export const answerCopy = {
  next: 'ရက်ရွေးမယ် 📅',
  title: 'ဘယ်တော့ သွားကြမလဲ? 📅',
  subtitle: 'အဆင်ပြေမယ့် စနေ၊ တနင်္ဂနွေ (၃) ပတ်အထိ ရွေးလို့ရတယ်',
  tooMany: '(၃) ပတ်အထိပဲ ရွေးလို့ရတယ်နော်',
  later: 'ရက်ကို နောက်မှ ပြောမယ်',
  needDate: "ရက်လေး ရွေးပေးပါဦး၊ ဒါမှမဟုတ် 'ရက်ကို နောက်မှ ပြောမယ်' ကို နှိပ်ပါ",
  messageLabel: 'ပြောချင်တာလေး ရှိရင် ရေးခဲ့ပါ (မရေးလည်း ရတယ်)',
  yes: 'သွားမယ် 💕',
  talk: 'အရင် စကားပြောကြရအောင်',
  done: {
    yes: { emoji: '🥹', title: 'ယေး! ပျော်လိုက်တာ 💕', text: 'ကျန်တာ ကိုယ် စီစဉ်ပြီး ပြန်ပြောမယ်နော်' },
    talk: { emoji: '😊', title: 'ရပါတယ်', text: 'စကားပြောကြမယ်နော်။ ဘာမှ စိတ်မပူနဲ့' },
  },
  summaryTitle: 'မင်းအဖြေ ရောက်ပြီ 💌',
};

export function findBox(id) {
  return boxes.find((box) => box.id === id);
}

// What the page gets before a pick: only hints, never the trips.
export function publicBoxes() {
  return boxes.map(({ id, wrap, hint }) => ({ id, wrap, hint }));
}

// What the page gets for the picked box.
export function revealedTrip(id) {
  const box = findBox(id);
  if (!box) return null;
  return { ...box.trip, promises, closing };
}
