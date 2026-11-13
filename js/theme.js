/* Light/dark theme: dark by default; the toggle switches and the choice is remembered.
   Loaded in <head> so the right theme is applied before the page paints (no flash). */
(function () {
  const KEY = 'changes.theme';
  const root = document.documentElement;
  const saved = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const apply = (t) => {
    root.dataset.theme = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = t === 'light' ? '#ece5d6' : '#0e1118';
    const btn = document.getElementById('theme-btn');
    if (btn) {
      const next = t === 'light' ? 'dark' : 'light';
      btn.title = `Switch to ${next} mode`;
      btn.setAttribute('aria-label', `Switch to ${next} mode`);
    }
  };
  apply(saved() || 'dark');
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.getElementById('theme-btn')?.addEventListener('click', () => {
      const t = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(KEY, t); } catch {}
      apply(t);
    });
  });
})();
