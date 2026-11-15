/* Native iPhone app touches (Capacitor). On the website this does nothing: window.Native's
   functions are harmless no-ops, so the rest of the app can call them unconditionally. */
(function () {
  const C = window.Capacitor;
  const native = !!(C && C.isNativePlatform && C.isNativePlatform());
  const P = native ? C.Plugins : {};
  const safe = (fn) => { try { const r = fn(); if (r && r.catch) r.catch(() => {}); } catch {} };

  window.Native = {
    isApp: native,
    /** light tap: flipping a card, revealing a chord */
    tap() { if (P.Haptics) safe(() => P.Haptics.impact({ style: 'LIGHT' })); },
    /** answer graded: success or error buzz */
    result(ok) { if (P.Haptics) safe(() => P.Haptics.notification({ type: ok ? 'SUCCESS' : 'ERROR' })); },
  };
  if (!native) return;

  document.documentElement.classList.add('native-app');

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
