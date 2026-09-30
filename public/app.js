// ---------- Screens ----------

function showScreen(name) {
  for (const el of document.querySelectorAll('.screen')) {
    el.classList.toggle('is-active', el.dataset.screen === name);
  }
  window.scrollTo({ top: 0 });
}

// ---------- Start ----------

async function start() {
  // Filled in by the next parts: load state from the server and show the right screen.
  showScreen('loading');
}

start().catch((err) => {
  console.error(err);
  showScreen('error');
});
