const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let site = null; // the /api/state response
let boxes = [];
let selected = null;

// ---------- Helpers ----------

function showScreen(name) {
  for (const el of document.querySelectorAll('.screen')) {
    el.classList.toggle('is-active', el.dataset.screen === name);
  }
  window.scrollTo({ top: 0 });
}

// Browsers break Burmese lines in the middle of words. Wrapping each space-separated
// phrase in an unbreakable span makes lines break only at the spaces.
// Very long phrases are left breakable so they can never overflow the screen.
function phrases(text) {
  return String(text)
    .split(/( +)/)
    .filter(Boolean)
    .map((part) =>
      part.trim() && part.length <= 30 ? Object.assign(document.createElement('span'), { className: 'phrase', textContent: part }) : part,
    );
}

function setText(el, text) {
  el.replaceChildren(...phrases(text));
}

// Builds an element. Text children are inserted as text, never as HTML.
function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    if (typeof child === 'string') el.append(...phrases(child));
    else el.append(child);
  }
  return el;
}

// Applies the same phrase wrapping to the text written in index.html.
function wrapStaticText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
  for (const node of nodes) node.replaceWith(...phrases(node.textContent));
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, reducedMotion ? 0 : ms));

const MYANMAR_DIGITS = '၀၁၂၃၄၅၆၇၈၉';
const myNumber = (n) => String(n).replace(/\d/g, (d) => MYANMAR_DIGITS[d]);

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => null);
  // A 409 that carries the saved pick or answer means "already done", which is not an error for the page.
  if (!data || (!res.ok && !(res.status === 409 && (data.pick || data.answer)))) {
    throw new Error(`Request failed: ${path} (${res.status})`);
  }
  return data;
}

function giftEl(wrap) {
  return h(
    'div',
    { class: `gift gift--${wrap}` },
    h('div', { class: 'gift-lid' }, h('span', { class: 'gift-bow' })),
    h('div', { class: 'gift-body' }),
  );
}

// ---------- Intro ----------

function renderIntro(intro) {
  document.getElementById('intro-gift').replaceChildren(giftEl('rose'));
  setText(document.getElementById('intro-title'), intro.title);
  document.getElementById('intro-lines').replaceChildren(...intro.lines.map((line) => h('p', {}, line)));

  const next = document.getElementById('intro-next');
  setText(next, intro.button);
  next.onclick = () => showScreen('boxes');
}

// ---------- Blind boxes ----------

function renderBoxes() {
  const gifts = boxes.map((box, index) =>
    h(
      'button',
      {
        class: 'gift-btn',
        type: 'button',
        'aria-pressed': 'false',
        'aria-label': `ဘူး ${myNumber(index + 1)}`,
        style: `--delay: ${index * -0.7}s`,
        onClick: () => selectBox(index),
      },
      giftEl(box.wrap),
      h('span', { class: 'gift-label' }, `ဘူး ${myNumber(index + 1)}`),
    ),
  );
  document.getElementById('gifts').replaceChildren(...gifts);
  document.getElementById('open-btn').onclick = openSelected;
}

function selectBox(index) {
  selected = index;
  const buttons = document.querySelectorAll('.gift-btn');
  buttons.forEach((btn, i) => btn.setAttribute('aria-pressed', String(i === index)));
  document.getElementById('gifts').classList.add('has-selection');

  const hint = document.getElementById('hint');
  hint.replaceChildren(h('strong', {}, `ဘူး ${myNumber(index + 1)}`), h('span', {}, boxes[index].hint));
  hint.classList.remove('is-pop');
  void hint.offsetWidth; // restart the pop animation
  hint.classList.add('is-pop');

  const openBtn = document.getElementById('open-btn');
  openBtn.disabled = false;
  setText(openBtn, `ဘူး ${myNumber(index + 1)} ကို ဖွင့်မယ် 🎁`);
}

async function openSelected() {
  if (selected == null) return;
  document.getElementById('open-btn').disabled = true;

  const box = boxes[selected];
  const stage = document.getElementById('opening-gift');
  stage.className = 'stage-gift is-shaking';
  stage.replaceChildren(giftEl(box.wrap));
  document.getElementById('burst').replaceChildren();
  showScreen('opening');

  // Save the pick while the box shakes.
  const request = api('/api/pick', { method: 'POST', body: JSON.stringify({ boxId: box.id }) });
  await wait(1400);
  const result = await request;

  stage.className = 'stage-gift is-open';
  burst(document.getElementById('burst'));
  document.getElementById('opening-text').textContent = '✨';
  await wait(1300);

  renderReveal(result.pick, { fresh: !result.alreadyPicked });
  showScreen('reveal');
}

function burst(container) {
  const pieces = ['💖', '✨', '🌸', '💕', '⭐', '🎀'];
  for (let i = 0; i < 26; i++) {
    const angle = (Math.PI * 2 * i) / 26 + Math.random() * 0.4;
    const distance = 90 + Math.random() * 90;
    container.append(
      h(
        'span',
        {
          class: 'burst-piece',
          style: [
            `--dx: ${Math.cos(angle) * distance}px`,
            `--dy: ${Math.sin(angle) * distance - 40}px`,
            `--rot: ${Math.random() * 360 - 180}deg`,
            `--delay: ${Math.random() * 0.15}s`,
          ].join(';'),
        },
        pieces[i % pieces.length],
      ),
    );
  }
}

// ---------- Revealed trip ----------

function renderReveal(pick, { fresh }) {
  const trip = pick.trip;

  const plan = trip.plan?.length
    ? h(
        'section',
        { class: 'reveal-section' },
        h('h3', {}, 'ခရီးစဉ်'),
        trip.plan.map((day) =>
          h('div', { class: 'plan-day' }, h('h4', {}, day.day), h('ul', {}, day.items.map((item) => h('li', {}, item)))),
        ),
      )
    : null;

  const parts = [
    h('div', { class: 'reveal-emoji', 'aria-hidden': 'true' }, trip.emoji),
    h('p', { class: 'reveal-label' }, fresh ? 'မင်းရွေးလိုက်တဲ့ ခရီးက…' : 'မင်းရွေးထားတဲ့ ခရီး'),
    h('h1', { class: 'reveal-title' }, trip.title),
    h('p', { class: 'reveal-mood' }, trip.mood),
    trip.note ? h('blockquote', { class: 'reveal-note' }, trip.note) : null,
    plan,
    h(
      'ul',
      { class: 'promises' },
      trip.promises.map((p) => h('li', {}, h('span', { class: 'promise-icon', 'aria-hidden': 'true' }, p.icon), h('span', {}, p.text))),
    ),
    h('p', { class: 'reveal-closing' }, trip.closing),
  ];
  document.getElementById('reveal').replaceChildren(...parts.filter(Boolean));

  const actions = document.getElementById('reveal-actions');
  if (site.answer) {
    actions.replaceChildren(h('div', { class: 'card summary' }, summaryParts(site.answer)));
  } else {
    actions.replaceChildren(
      h('button', { class: 'btn btn-primary btn-wide', type: 'button', onClick: () => showScreen('answer') }, site.answerCopy.next),
    );
  }
}

// ---------- Answer ----------

const chosenWeekends = new Set();

function renderAnswer() {
  const copy = site.answerCopy;
  setText(document.getElementById('answer-title'), copy.title);
  setText(document.getElementById('answer-subtitle'), copy.subtitle);
  setText(document.getElementById('later-label'), copy.later);
  setText(document.getElementById('message-label'), copy.messageLabel);
  setText(document.getElementById('answer-yes'), copy.yes);
  setText(document.getElementById('answer-talk'), copy.talk);

  const byMonth = new Map();
  for (const w of site.weekends) byMonth.set(w.month, [...(byMonth.get(w.month) ?? []), w]);
  const groups = [...byMonth].map(([month, weekends]) =>
    h(
      'div',
      { class: 'weekend-group' },
      h('h3', { class: 'weekend-month' }, month),
      h(
        'div',
        { class: 'weekend-chips' },
        weekends.map((w) =>
          h(
            'button',
            { class: w.crossesMonth ? 'chip chip--wide' : 'chip', type: 'button', 'aria-pressed': 'false', 'data-id': w.id, onClick: toggleWeekend },
            w.short,
          ),
        ),
      ),
    ),
  );
  document.getElementById('weekends').replaceChildren(...groups);

  document.getElementById('later').onchange = (event) => {
    if (event.target.checked) {
      chosenWeekends.clear();
      syncChips();
    }
    setNote('');
  };
  document.getElementById('answer-yes').onclick = () => submitAnswer('yes');
  document.getElementById('answer-talk').onclick = () => submitAnswer('talk');
}

function toggleWeekend(event) {
  const id = event.currentTarget.dataset.id;
  const later = document.getElementById('later');
  setNote('');

  if (chosenWeekends.has(id)) {
    chosenWeekends.delete(id);
  } else if (chosenWeekends.size >= site.maxChoices) {
    setNote(site.answerCopy.tooMany);
    return;
  } else {
    chosenWeekends.add(id);
    later.checked = false;
  }
  syncChips();
}

function syncChips() {
  for (const chip of document.querySelectorAll('.chip')) {
    chip.setAttribute('aria-pressed', String(chosenWeekends.has(chip.dataset.id)));
  }
}

function setNote(text) {
  setText(document.getElementById('answer-note'), text);
}

async function submitAnswer(choice) {
  const later = document.getElementById('later').checked;
  if (choice === 'yes' && !later && chosenWeekends.size === 0) {
    setNote(site.answerCopy.needDate);
    return;
  }

  const buttons = [document.getElementById('answer-yes'), document.getElementById('answer-talk')];
  buttons.forEach((btn) => (btn.disabled = true));
  setNote('');

  try {
    const result = await api('/api/answer', {
      method: 'POST',
      body: JSON.stringify({
        choice,
        later,
        // Keep them in date order, not tap order.
        weekends: site.weekends.map((w) => w.id).filter((id) => chosenWeekends.has(id)),
        message: document.getElementById('message').value,
      }),
    });
    site.answer = result.answer;
    renderDone();
    showScreen('done');
  } catch (err) {
    console.error(err);
    setNote('တစ်ခုခု မှားသွားတယ်၊ ထပ်နှိပ်ကြည့်ပါဦး 🥲');
    buttons.forEach((btn) => (btn.disabled = false));
  }
}

function summaryParts(answer) {
  const copy = site.answerCopy;
  const dates = answer.later
    ? h('p', {}, `📅 ${copy.later}`)
    : answer.weekends.length
      ? h('ul', { class: 'summary-dates' }, answer.weekends.map((w) => h('li', {}, `📅 ${w.label}`)))
      : null;

  return [
    h('h3', {}, copy.summaryTitle),
    h('p', { class: 'summary-choice' }, answer.choice === 'yes' ? copy.yes : copy.talk),
    dates,
    // Her own words: plain text so long lines can wrap anywhere.
    answer.message ? h('blockquote', { class: 'summary-message' }, document.createTextNode(answer.message)) : null,
  ];
}

function renderDone() {
  const done = site.answerCopy.done[site.answer.choice];
  document.getElementById('done-emoji').textContent = done.emoji;
  setText(document.getElementById('done-title'), done.title);
  setText(document.getElementById('done-text'), done.text);
  document.getElementById('done-summary').replaceChildren(...summaryParts(site.answer).filter(Boolean));
}

// ---------- Start ----------

async function start() {
  const data = await api('/api/state');
  site = data;
  renderAnswer();

  if (data.pick) {
    renderReveal(data.pick, { fresh: false });
    showScreen('reveal');
    return;
  }

  boxes = data.boxes;
  renderIntro(data.intro);
  renderBoxes();
  showScreen('intro');
}

window.addEventListener('unhandledrejection', (event) => {
  console.error(event.reason);
  showScreen('error');
});

// iOS Safari only shows :active (the pressed look) when a touch listener exists.
document.addEventListener('touchstart', () => {}, { passive: true });

wrapStaticText(document.getElementById('app'));
start();
