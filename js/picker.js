/* Custom dropdowns. Every <select> gets an app-styled button that opens a bottom sheet (phones)
   or a small menu (larger screens). The real <select> stays in the page, hidden: it still holds the
   value and fires 'change', so the code that uses it doesn't need to know about any of this.
   Options can carry data-c="<color>" for a family dot; a select with data-grid="6" shows a grid. */
(function () {
  const phone = () => window.matchMedia('(max-width: 700px)').matches;
  const CHECK = '<svg class="pk-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  let open = null; // { sel, btn, layer }

  const titleOf = (sel) => sel.dataset.title || sel.getAttribute('aria-label') || '';
  const labelHTML = (opt) => opt
    ? `${opt.dataset.c ? `<i class="pk-dot" style="--c:${opt.dataset.c}"></i>` : ''}<span class="pk-text">${opt.innerHTML}</span>`
    : '';

  function sync(sel) {
    const btn = sel && sel._pk;
    if (!btn) return;
    const opt = sel.options[sel.selectedIndex];
    btn.querySelector('.pk-val').innerHTML = labelHTML(opt);
    btn.setAttribute('aria-label', `${titleOf(sel)}: ${opt ? opt.textContent : ''}`);
  }

  function enhance(sel) {
    if (sel._pk || sel.hasAttribute('data-native')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `${sel.className} pk-btn`; // keeps the select's own sizing and layout rules
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="pk-val"></span>';
    sel.after(btn);
    sel.classList.add('pk-native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    sel._pk = btn;
    btn.addEventListener('click', () => (open && open.sel === sel ? close() : show(sel, btn)));
    sel.addEventListener('change', () => sync(sel));
    new MutationObserver(() => sync(sel)).observe(sel, { childList: true, subtree: true, attributes: true, characterData: true });
    sync(sel);
  }

  function show(sel, btn) {
    close(true);
    const sheet = phone();
    const grid = sel.dataset.grid;
    const cur = sel.selectedIndex;
    const layer = document.createElement('div');
    layer.className = `pk-layer ${sheet ? 'pk-sheet' : 'pk-pop'}`;
    layer.innerHTML = `<div class="pk-backdrop"></div>
      <div class="pk-panel">
        ${sheet ? `<div class="pk-grab" aria-hidden="true"></div><div class="pk-title">${titleOf(sel)}</div>` : ''}
        <div class="pk-list${grid ? ' pk-grid' : ''}" role="listbox" aria-label="${titleOf(sel)}" ${grid ? `style="--cols:${grid}"` : ''}>
          ${[...sel.options].map((o, i) => `<button type="button" role="option" class="pk-opt${i === cur ? ' on' : ''}" aria-selected="${i === cur}" data-i="${i}">${labelHTML(o)}${i === cur && !grid ? CHECK : ''}</button>`).join('')}
        </div>
      </div>`;
    document.body.appendChild(layer);
    const panel = layer.querySelector('.pk-panel');
    const list = layer.querySelector('.pk-list');

    if (!sheet) {
      const r = btn.getBoundingClientRect();
      panel.style.minWidth = r.width + 'px';
      panel.style.left = Math.max(8, Math.min(r.left, innerWidth - panel.offsetWidth - 8)) + 'px';
      const below = innerHeight - r.bottom - 12;
      if (below >= Math.min(panel.offsetHeight, 240) || below > r.top) {
        panel.style.top = r.bottom + 6 + 'px';
        panel.style.maxHeight = Math.max(160, below) + 'px';
      } else {
        panel.style.bottom = innerHeight - r.top + 6 + 'px';
        panel.style.maxHeight = r.top - 12 + 'px';
      }
    }
    const on = list.querySelector('.pk-opt.on');
    if (on) list.scrollTop = on.offsetTop - list.clientHeight / 2 + on.offsetHeight / 2;

    open = { sel, btn, layer };
    btn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => layer.classList.add('in'));
    (on || list.querySelector('.pk-opt'))?.focus({ preventScroll: true });

    layer.addEventListener('click', (e) => {
      const o = e.target.closest('.pk-opt');
      if (o) return choose(+o.dataset.i);
      if (e.target.classList.contains('pk-backdrop')) close();
    });
    layer.addEventListener('keydown', (e) => {
      const opts = [...list.querySelectorAll('.pk-opt')];
      const i = opts.indexOf(document.activeElement);
      const step = grid && (e.key === 'ArrowDown' || e.key === 'ArrowUp') ? +grid : 1;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); opts[Math.min(opts.length - 1, i + step)]?.focus(); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); opts[Math.max(0, i - step)]?.focus(); }
      else if (e.key === 'Home') { e.preventDefault(); opts[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); opts[opts.length - 1].focus(); }
      else if (e.key === 'Tab') { e.preventDefault(); close(); }
    });
  }

  function choose(i) {
    const { sel } = open;
    window.Native?.tap();
    close();
    if (sel.selectedIndex !== i) {
      sel.selectedIndex = i;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    sync(sel);
  }

  function close(instant) {
    if (!open) return;
    const { btn, layer } = open;
    open = null;
    btn.setAttribute('aria-expanded', 'false');
    if (instant) layer.remove();
    else { layer.classList.remove('in'); setTimeout(() => layer.remove(), 260); }
    if (btn.isConnected) btn.focus({ preventScroll: true });
  }

  // a menu (not a sheet) belongs to its button: close it if the page moves underneath
  window.addEventListener('resize', () => close(true));
  window.addEventListener('scroll', () => { if (open && !open.layer.classList.contains('pk-sheet')) close(true); }, { passive: true });

  // enhance every select, including ones added later (Learn and Library re-render theirs)
  const scan = (root) => root.querySelectorAll('select').forEach(enhance);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    if (n.tagName === 'SELECT') enhance(n); else scan(n);
  }))).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(document));
  else scan(document);

  window.Picker = { sync, close };
})();
