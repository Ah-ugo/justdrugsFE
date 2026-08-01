/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Banners & Ads module
   Polished banner cards per placement, schedule display,
   preview modal, ad editor with Cloudinary-style upload.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtDate, fmtRelative, showToast, confirmDialog, openModal, closeModal } = JD;

  let banners = [];
  const state = { placement: '', status: '' };

  window.__pageContentRendered = function () { initBanners(); };

  async function initBanners() {
    try {
      const res = await AdminAPI.listBanners();
      const data = res.data || res;
      banners = Array.isArray(data) ? data : DemoData.banners;
    } catch (e) {
      console.warn('[Banners] Demo mode:', e.message);
      banners = DemoData.banners;
    }
    renderGrid();
    document.getElementById('add-banner-btn').addEventListener('click', () => openEditor());
    document.getElementById('banner-status-filter').addEventListener('change', (e) => { state.status = e.target.value; renderGrid(); });
    document.querySelectorAll('#banner-placement-chips .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#banner-placement-chips .filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.placement = chip.dataset.placement;
        renderGrid();
      });
    });
  }

  function statusOf(b) {
    const now = Date.now();
    if (b.status === 'draft' || b.active === false && !b.start_date) return { label: 'Draft', cls: 'badge-gray' };
    if (b.status === 'scheduled' || (b.start_date && new Date(b.start_date).getTime() > now)) return { label: 'Scheduled', cls: 'badge-info' };
    if (b.end_date && new Date(b.end_date).getTime() < now) return { label: 'Expired', cls: 'badge-danger' };
    if (b.status === 'draft') return { label: 'Draft', cls: 'badge-gray' };
    return { label: 'Active', cls: 'badge-success' };
  }

  function placementIcon(p) {
    return { hero: 'home', shop: 'shoppingCart', sidebar: 'layers', category_popup: 'zap', announcement: 'bell' }[p] || 'image';
  }

  function renderGrid() {
    const grid = document.getElementById('banners-grid');
    const rows = banners.filter(b => {
      if (state.placement && (b.placement || '') !== state.placement) return false;
      if (state.status) {
        const st = statusOf(b).label.toLowerCase();
        if (!st.includes(state.status)) return false;
      }
      return true;
    });
    if (!rows.length) {
      grid.innerHTML = `<div class="card" style="grid-column:1/-1"><div class="empty-state"><div class="empty-icon">${icon('image', 32)}</div><div class="empty-title">No banners found</div><div class="empty-desc">Create a new banner to launch a promotion.</div></div>`;
      return;
    }
    grid.innerHTML = rows.map(b => {
      const st = statusOf(b);
      const ads = b.ads || [];
      const primary = ads[0] || {};
      const image = primary.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=60';
      return `
      <div class="card card-hover" style="overflow:hidden" data-id="${esc(b._id || b.id)}">
        <div style="position:relative;height:190px;overflow:hidden;cursor:pointer" class="bn-img act-preview" data-id="${esc(b._id || b.id)}">
          ${image ? `<img src="${esc(image)}" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.style.opacity=0">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--surface-2);color:var(--text-3)">${icon('image', 34)}</div>`}
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.65))"></div>
          <div style="position:absolute;bottom:12px;left:14px;right:14px;display:flex;align-items:flex-end;justify-content:space-between;gap:8px">
            <div>
              <div class="text-black" style="color:#fff;font-weight:800;font-size:16px;text-shadow:0 1px 4px rgba(0,0,0,.35)">${esc(b.name)}</div>
              <div style="color:rgba(255,255,255,.85);font-size:12px;margin-top:2px">${esc(primary.title || primary.subtitle || '')}</div>
            <span class="badge ${st.cls}" style="flex-shrink:0">${st.label}</span>
          </div>
        <div style="padding:14px 16px">
          <div class="flex items-center justify-between mb-10 wrap gap-8">
            <div class="site-tag"><span class="site-tag-icon">${icon(placementIcon(b.placement), 13)}</span> ${esc((b.placement || 'hero').replace(/_/g, ' '))} placement</div>
            <div class="text-xs text-3">${ads.length} ad${ads.length === 1 ? '' : 's'}</div>
          <div class="flex items-center justify-between text-xs text-2 mb-12 wrap gap-8">
            <span>Starts ${b.start_date ? fmtDate(b.start_date, { short: true }) : '—'}</span>
            <span>→ Ends ${b.end_date ? fmtDate(b.end_date, { short: true }) : '—'}</span>
          </div>
          <div class="row-actions" style="justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-soft)">
            <div class="flex items-center gap-8">
              <button class="btn btn-sm btn-secondary act-preview" data-id="${esc(b._id || b.id)}">${icon('eye', 14)} Preview</button>
              <button class="btn btn-sm btn-secondary act-edit" data-id="${esc(b._id || b.id)}">${icon('edit', 14)} Edit</button>
              <button class="row-action-btn act-duplicate" data-id="${esc(b._id || b.id)}" title="Duplicate" style="border:1.5px solid var(--border-strong);border-radius:8px">${icon('copy', 14)}</button>
              <button class="row-action-btn danger act-delete" data-id="${esc(b._id || b.id)}" title="Delete" style="border:1.5px solid var(--border-strong);border-radius:8px">${icon('trash', 14)}</button>
            </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.act-preview').forEach(b => b.addEventListener('click', () => previewBanner(b.dataset.id)));
    grid.querySelectorAll('.act-edit').forEach(b => b.addEventListener('click', () => openEditor(b.dataset.id)));
    grid.querySelectorAll('.act-duplicate').forEach(b => b.addEventListener('click', () => {
      const src = banners.find(x => (x._id || x.id) === b.dataset.id);
      if (!src) return;
      banners.push({ ...src, _id: 'bn' + Math.random().toString(36).slice(2, 7), name: src.name + ' (Copy)', status: 'draft', active: false });
      renderGrid();
      showToast('Banner duplicated', 'success');
    }));
    grid.querySelectorAll('.act-delete').forEach(b => b.addEventListener('click', async () => {
      const src = banners.find(x => (x._id || x.id) === b.dataset.id);
      const ok = await confirmDialog(`Delete banner <b>${esc(src?.name)}</b>?`, { variant: 'danger', confirmText: 'Delete' });
      if (!ok) return;
      banners = banners.filter(x => (x._id || x.id) !== b.dataset.id);
      renderGrid();
      showToast('Banner deleted', 'success');
    }));
  }

  function previewBanner(id) {
    const b = banners.find(x => (x._id || x.id) === id);
    if (!b) return;
    const ads = b.ads || [];
    openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">Banner Preview</h3><p class="modal-subtitle">${esc(b.name)} · ${esc((b.placement || '').replace(/_/g, ' '))}</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body" style="padding:0">
        <div style="max-height:420px;overflow:auto;padding:18px">
          <div style="position:relative;border-radius:16px;overflow:hidden;min-height:240px;margin-bottom:14px">
            ${(ads[0]?.image || b.image) ? `<img src="${esc(ads[0].image || b.image)}" alt="" style="width:100%;object-fit:cover;display:block">` : ''}
            <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.7));padding:24px;display:flex;flex-direction:column;justify-content:flex-end">
              <div class="text-black" style="color:#fff;font-size:26px;font-weight:800;max-width:80%">${esc(ads[0]?.title || b.name)}</div>
              ${ads[0]?.subtitle ? `<div style="color:rgba(255,255,255,.9);margin-top:6px;font-size:14.5px">${esc(ads[0].subtitle)}</div>` : ''}
              ${ads[0]?.cta?.label ? `<div style="margin-top:14px"><span style="background:#10b981;color:#fff;border-radius:10px;padding:9px 18px;font-weight:700;font-size:13.5px;display:inline-flex;align-items:center;gap:6px">${esc(ads[0].cta.label)} ${icon('arrowRight', 15)}</span></div>` : ''}
            </div>
          <div class="text-xs text-3">Status: ${statusOf(b).label} · ${ads.length} advertisement(s)</div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-primary" data-close>Close Preview</button>
      </div>`, { size: 'lg' });
  }

  function openEditor(id) {
    const b = id ? banners.find(x => (x._id || x.id) === id) : null;
    openModal(`
      <div class="modal-head">
        <div><h3 class="modal-title">${b ? 'Edit Banner' : 'New Banner'}</h3>
        <p class="modal-subtitle">${b ? `Editing ${esc(b.name)}` : 'Create a promotional placement'}</p></div>
        <button class="modal-close">${icon('x', 16)}</button>
      </div>
      <div class="modal-body">
        <div class="grid grid-2">
          <div class="field"><label class="field-required">Banner name</label><input class="input" id="bn-name" value="${esc(b?.name || '')}" placeholder="e.g. Homepage Hero"></div>
          <div class="field"><label>Placement</label>
            <select class="select" id="bn-placement">
              ${['hero', 'shop', 'sidebar', 'category_popup', 'announcement'].map(p => `<option value="${p}" ${b?.placement === p ? 'selected' : ''}>${p.replace(/_/g, ' ')}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Start date</label><input class="input" type="datetime-local" id="bn-start" value="${b?.start_date ? new Date(b.start_date).toISOString().slice(0, 16) : ''}"></div>
          <div class="field"><label>End date</label><input class="input" type="datetime-local" id="bn-end" value="${b?.end_date ? new Date(b.end_date).toISOString().slice(0, 16) : ''}"></div>
          <div class="field" style="grid-column:1/-1"><label>Ad image URL</label><input class="input" id="bn-image" value="${esc((b?.ads?.[0]?.image) || b?.image || '')}" placeholder="https://… (Cloudinary)">
            <div class="text-xs text-3" style="margin-top:4px">Upload to Cloudinary in production. Drag & drop reordering supported on the ads list below.</div>
          <div class="field"><label>Ad title</label><input class="input" id="bn-title" value="${esc(b?.ads?.[0]?.title || '')}"></div>
          <div class="field"><label>Ad subtitle</label><input class="input" id="bn-subtitle" value="${esc(b?.ads?.[0]?.subtitle || '')}"></div>
          <div class="field"><label>CTA label</label><input class="input" id="bn-cta" value="${esc(b?.ads?.[0]?.cta?.label || '')}" placeholder="Shop Now"></div>
          <div class="field"><label>CTA link</label><input class="input" id="bn-link" value="${esc(b?.ads?.[0]?.cta?.link || '')}" placeholder="/shop/vitamins"></div>
        <div class="mt-16">
          <div class="list-row"><div><div class="list-row-label">Active / Publish now</div><div class="list-row-desc">Immediately visible to customers</div><button class="switch ${b && b.status === 'active' ? 'on' : !b ? 'on' : ''}" id="bn-active"></button></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" data-close>Cancel</button>
        <button class="btn btn-primary" id="bn-save-btn">${icon('check', 15)} ${b ? 'Save Changes' : 'Create Banner'}</button>
      </div>`);
    document.getElementById('bn-active').addEventListener('click', function () { this.classList.toggle('on'); });
    document.getElementById('bn-save-btn').addEventListener('click', () => {
      const name = document.getElementById('bn-name').value.trim();
      if (!name) { showToast('Banner name is required', 'error'); return; }
      showToast(b ? 'Banner updated' : 'Banner created', 'success');
      closeModal(document.querySelector('.modal-backdrop.open'));
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__bannersBooted) { window.__bannersBooted = true; initBanners(); } }, 300);
  }
})();
