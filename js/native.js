/* Native iPhone app touches (Capacitor). On the website this does nothing: window.Native's
   functions are harmless no-ops, so the rest of the app can call them unconditionally. */
(function () {
  const C = window.Capacitor;
  const native = !!(C && C.isNativePlatform && C.isNativePlatform());
  const P = native ? C.Plugins : {};
  // the app's progress copy isn't written until any needed restore has happened (see below)
  let restored = !native, pending = {};
  const safe = (fn) => { try { const r = fn(); if (r && r.catch) r.catch(() => {}); } catch {} };

  window.Native = {
    isApp: native,
    /** light tap: flipping a card, revealing a chord */
    tap() { if (P.Haptics) safe(() => P.Haptics.impact({ style: 'LIGHT' })); },
    /** answer graded: success or error buzz */
    result(ok) { if (P.Haptics) safe(() => P.Haptics.notification({ type: ok ? 'SUCCESS' : 'ERROR' })); },
    /** Keep a copy of saved progress in the app's own storage (iOS never clears it, and it's
       included in the phone's iCloud/computer backups). Website: nothing to do. */
    backup(key, value) {
      if (!P.Preferences) return;
      if (!restored) { pending[key] = value; return; }
      safe(() => P.Preferences.set({ key, value }));
    },
  };

  // The website asks the browser to keep its saved data (it may still clear it under storage pressure).
  if (!native) {
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist().catch(() => {}); } catch {}
    return;
  }

  /* If iOS cleared the app's web storage (rare, when the phone is very low on space), put the
     progress back from the app's own copy and reload. Until that check is done, nothing is
     written to the copy, so a fresh, empty start can't overwrite real progress. */
  const STORE = 'changes.v1';
  let hadLocal = true;
  try { hadLocal = localStorage.getItem(STORE) != null; } catch {}
  const finish = () => {
    restored = true;
    Object.keys(pending).forEach((k) => window.Native.backup(k, pending[k]));
    pending = {};
  };
  if (P.Preferences) {
    P.Preferences.get({ key: STORE }).then(({ value }) => {
      if (!hadLocal && value) {
        try { localStorage.setItem(STORE, value); location.reload(); return; } catch {}
      }
      finish();
    }).catch(finish);
  }

  document.documentElement.classList.add('native-app');

  // an app shouldn't pinch-zoom: it's easy to do by accident and hard to undo. (The website keeps
  // zoom for accessibility; in the app, text size follows the iPhone's own settings.)
  const vp = document.querySelector('meta[name="viewport"]');
  if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');

  // status bar text follows the theme (light text on the dark theme, dark text on the light one)
  const syncBar = () => {
    if (!P.StatusBar) return;
    safe(() => P.StatusBar.setStyle({ style: document.documentElement.dataset.theme === 'light' ? 'LIGHT' : 'DARK' }));
  };
  syncBar();
  new MutationObserver(syncBar).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // keep the launch screen up until the fonts are in and the first card has painted
  const hide = () => { if (P.SplashScreen) safe(() => P.SplashScreen.hide({ fadeOutDuration: 200 })); };
  const waitFonts = () => {
    if (!document.documentElement.classList.contains('fonts-loading')) return requestAnimationFrame(() => requestAnimationFrame(hide));
    setTimeout(waitFonts, 30);
  };
  if (document.readyState === 'complete') waitFonts();
  else window.addEventListener('load', waitFonts);
  setTimeout(hide, 2500); // never leave the launch screen stuck
})();
