/* Installable-app support: service worker + "Install" button. */
(function () {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  const btn = document.getElementById('install-btn');
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone) return; // already running as an app

  // Chrome, Edge, Android: the browser offers a real install prompt
  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    btn.hidden = false;
  });
  window.addEventListener('appinstalled', () => { btn.hidden = true; deferred = null; });

  // iPhone/iPad Safari has no prompt, so explain the Share → Add to Home Screen steps
  const ua = navigator.userAgent;
  // Every iPhone browser (Safari, Chrome, Edge, Firefox) can add to the Home Screen on iOS 16.4+,
  // but the Share button lives in a different place in each, so show steps for this browser.
  const iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const browser = /CriOS/.test(ua) ? 'Chrome' : /EdgiOS/.test(ua) ? 'Edge' : /FxiOS/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : null;
  const share = '<b>Share</b> <svg viewBox="0 0 24 24" aria-hidden="true" class="share-i"><path d="M12 3v12M8 7l4-4 4 4M6 11H5v10h14V11h-1" /></svg>';
  const STEPS = {
    Safari: [`Tap the ${share} button in Safari's toolbar.`, 'Scroll down and tap <b>Add to Home Screen</b> (you may need <b>View More</b> first).'],
    Chrome: [`Tap the ${share} button at the right end of Chrome's address bar.`, 'Scroll down and tap <b>Add to Home Screen</b>.'],
    Edge: ['Tap the <b>⋯</b> menu at the bottom of the screen, then <b>Share</b>.', 'Tap <b>Add to Home Screen</b>.'],
    Firefox: ['Tap the <b>☰</b> menu, then <b>Share</b>.', 'Tap <b>Add to Home Screen</b>.'],
  };
  if (iOS) {
    btn.hidden = false;
    const steps = STEPS[browser] || [`Open your browser's ${share} menu.`, 'Tap <b>Add to Home Screen</b>.'];
    document.getElementById('ios-steps').innerHTML = [...steps, 'Tap <b>Add</b>. Changes opens full-screen and works offline.'].map((s) => `<li>${s}</li>`).join('');
    document.getElementById('ios-note').innerHTML = browser === 'Safari'
      ? ''
      : `Don't see <b>Add to Home Screen</b>? Update iOS and ${browser || 'your browser'} to the latest version, or open chordchanges.app in Safari.`;
  }

  btn.addEventListener('click', async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      btn.hidden = true;
    } else {
      document.getElementById('ios-dialog').showModal();
    }
  });
})();
