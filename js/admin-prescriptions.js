/* ═══════════════════════════════════════════════════════════
   JUST DRUGS — Prescriptions module
   Pharmacist review cards with zoomable image drawer and
   Approve / Reject / Need-better-image actions.
═══════════════════════════════════════════════════════════ */
(function () {
  requireAuth();
  const JD = window.JustDrugs;
  const { icon, DemoData, esc, fmtDate, fmtRelative, showToast, openDrawer, closeDrawer, confirmDialog } = JD;

  let prescriptions = [];
  const state = { query: '', status: '' };

  window.__pageContentRendered = function () { initRx(); };

  async function initRx() {
    try {
      const res = await AdminAPI.listPrescriptions();
      const data = res.data || res;
      prescriptions = Array.isArray(data) ? data : DemoData.prescriptions;
    } catch (e) {
      console.warn('[Prescriptions] Demo mode:', e.message);
      prescriptions = DemoData.prescriptions;
    }
    renderCards();
    document.querySelectorAll('#rx-status-chips .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#rx-status-chips .filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.status = chip.dataset.status;
        renderCards();
      });
    });
    document.getElementById('rx-search').addEventListener('input', JD.debounce((e) => { state.query = e.target.value; renderCards(); }, 300));
    document.getElementById('rx-export-btn').addEventListener('click', () => showToast('Prescriptions exported', 'success'));
  }

  function applied() {
    const q = state.query.toLowerCase();
    return prescriptions.filter(rx => {
      if (state.status && (rx.status || '').toLowerCase() !== state.status.toLowerCase()) return false;
      if (q && !((rx.patient_name || '') + ' ' + (rx.prescription_number || '') + ' ' + (rx.medicine || '')).toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function rxBadge(status) {
    return JD.rxStatusBadge(status);
  }

  function renderCards() {
    const grid = document.getElementById('rx-grid');
    const rows = applied();
    if (!rows.length) {
      grid.innerHTML = `<div class="card" style="grid-column:1/-1">
        <div class="empty-state"><div class="empty-icon">${icon('file', 32)}</div><div class="empty-title">No prescriptions</div><div class="empty-desc">Nothing matches your filter.</div></div>
      </div>`;
      return;
    }
    grid.innerHTML = rows.map(rx => {
      const image = rx.file_url || rx.image || (rx.files && rx.files[0]?.url) || 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=60';
      return `
      <div class="card card-hover" style="overflow:hidden">
        <div style="height:168px;background:linear-gradient(135deg,var(--brand-50),var(--info-50));display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative" class="rx-image-zoom" data-rx="${esc(rx.prescription_number || rx._id)}">
          <img src="${esc(image)}" alt="Prescription" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.opacity=0">
          <span style="position:absolute;right:10px;top:10px;background:rgba(0,0,0,.55);color:#fff;border-radius:8px;padding:5px 9px;font-size:12px;display:flex;align-items:center;gap:5px;backdrop-filter:blur(4px)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg> Zoom</span>
        </div>
        <div style="padding:16px">
          <div class="flex items-center justify-between mb-10">
            <code class="mono font-bold" style="color:var(--brand-600);font-size:12.5px">${esc(rx.prescription_number || rx._id)}</code>
            ${rxBadge(rx.status)}
          </div>
          <div class="font-bold text-md">${esc(rx.patient_name || rx.patient?.name || 'Patient')}</div>
          <div class="text-sm text-2 mt-2">${esc(rx.patient_phone || rx.patient?.phone || '—')}</div>
          <div class="text-sm text-2 mt-2"><b>Medicine:</b> ${esc(rx.medicine || rx.medicines?.join(', ') || '—')}</div>
          <div class="text-xs text-3 mt-2">Submitted ${fmtRelative(rx.created_at)}${rx.doctor ? ` · Dr. ${esc(rx.doctor)}` : ''}</div>
          ${rx.pharmacist_notes ? `<div style="margin-top:10px;padding:8px 10px;background:var(--surface-2);border-radius:8px;font-size:12px" class="text-2">${icon('message', 12)} ${esc(rx.pharmacist_notes)}</div>` : ''}
          <div class="flex gap-8 mt-14 wrap">
            ${rx.status === 'pending' ? `
              <button class="btn btn-sm btn-success btn-flex rx-approve" data-id="${esc(rx._id)}" style="flex:1">${icon('check', 14)} Approve</button>
              <button class="btn btn-sm btn-danger btn-flex rx-reject" data-id="${esc(rx._id)}" style="flex:1">${icon('x', 14)} Reject</button>
              <button class="btn btn-sm btn-secondary rx-better" data-id="${esc(rx._id)}">${icon('camera', 14)} Better Image</button>
            ` : `
              <button class="btn btn-sm btn-secondary btn-flex rx-view" data-id="${esc(rx._id)}" style="flex:1">${icon('eye', 14)} View</button>
              ${rx.status === 'need_better_image' ? `<button class="btn btn-sm btn-primary rx-approve" data-id="${esc(rx._id)}" style="flex:1">${icon('check', 14)} Re-approve</button>` : ''}
            `}
          </div>
        </div>
      </div>`;
    }).join('');

    grid.querySelectorAll('.rx-approve').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); quickStatus(b.dataset.id, 'approved'); }));
    grid.querySelectorAll('.rx-reject').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); openReview(b.dataset.id, 'reject'); }));
    grid.querySelectorAll('.rx-better').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); openReview(b.dataset.id, 'better'); }));
    grid.querySelectorAll('.rx-view').forEach(b => b.addEventListener('click', () => openReview(b.dataset.id, 'view')));
    grid.querySelectorAll('.rx-image-zoom').forEach(el => el.addEventListener('click', () => {
      const rx = prescriptions.find(x => (x.prescription_number || x._id) === el.dataset.rx);
      if (rx) openReview(rx._id, 'view', { zoom: true });
    }));
  }

  function quickStatus(id, status) {
    const rx = prescriptions.find(x => x._id === id);
    if (!rx) return;
    rx.status = status;
    showToast(`${(rx.prescription_number)} marked ${status}`, 'success');
    renderCards();
  }

  function openReview(id, mode, opts = {}) {
    const rx = prescriptions.find(x => x._id === id);
    if (!rx) return;
    const image = rx.file_url || rx.image || (rx.files && rx.files[0]?.url) || 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=60';
    const editable = mode === 'reject' || mode === 'better';

    const { drawer } = openDrawer(`
      <div class="drawer-head">
        <div><div class="drawer-title">${esc(rx.prescription_number)}</div>
        <div style="font-size:12.5px;color:var(--text-3);margin-top:2px;">${fmtDate(rx.created_at, { time: true })}</div></div>
        <button class="modal-close drawer-close">${icon('x', 16)}</button>
      </div>
      <div class="drawer-body">
        <div class="flex items-center justify-between mb-12">
          <div class="flex items-center gap-8">${rxBadge(rx.status)}</div>
          <button class="btn btn-xs btn-secondary" id="rx-zoom-btn">${icon('zoomIn', 13)} Zoom</button>
        </div>
        <div style="border:1px solid var(--border-soft);border-radius:14px;overflow:hidden;margin-bottom:16px;background:var(--surface-2)">
          <img src="${esc(image)}" id="rx-preview-img" alt="Prescription" style="width:100%;max-height:340px;object-fit:contain;display:block">
        </div>

        <div class="grid grid-2 mb-8">
          <div class="field"><label>Patient</label><div class="text-sm font-semibold">${esc(rx.patient_name || rx.patient?.name || '—')}</div></div>
          <div class="field"><label>Phone</label><div class="text-sm font-semibold">${esc(rx.patient_phone || rx.patient?.phone || '—')}</div></div>
          <div class="field"><label>Doctor</label><div class="text-sm font-semibold">${esc(rx.doctor || 'Not provided')}</div></div>
          <div class="field"><label>Medicine</label><div class="text-sm font-semibold">${esc(rx.medicine || rx.medicines?.join(', ') || '—')}</div></div>
        </div>

        <h4 style="font-size:13px;font-weight:800;margin:14px 0 10px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)">Pharmacist Notes</h4>
        <textarea class="textarea" id="rx-notes" rows="3" placeholder="Add a note for the patient (sent by email)…">${editable ? '' : esc(rx.pharmacist_notes || '')}</textarea>

        ${mode === 'reject' || mode === 'better' ? `
        <div style="margin-top:12px">
          <label class="field-required">Reason</label>
          <select class="select" id="rx-reason" style="margin-top:6px">
            ${mode === 'reject'
              ? '<option>Illegible / unclear scan</option><option>Prescription expired</option><option>Incomplete details</option><option>Controlled substance — requires physical check</option><option>Forgery suspicion</option><option>Other</option>'
              : '<option>Image too blurry</option><option>Image cropped / incomplete</option><option>Need clearer photo</option><option>Other</option>'}
          </select>
        </div>` : ''}
      </div>
      <div class="drawer-foot">
        ${rx.status === 'pending' && mode !== 'reject' && mode !== 'better' ? `
          <button class="btn btn-secondary" id="rx-better-btn">${icon('camera', 15)} Need Better Image</button>
          <button class="btn btn-danger" id="rx-reject-btn">${icon('x', 15)} Reject</button>
          <button class="btn btn-success" id="rx-approve-btn">${icon('check', 15)} Approve</button>`
        : (editable ? `
          <button class="btn btn-secondary" data-close>Cancel</button>
          <button class="btn btn-primary" id="rx-submit-btn">${icon('send', 15)} ${mode === 'reject' ? 'Reject Prescription' : 'Request Better Image'}</button>` :
          `<button class="btn btn-secondary" data-close>Close</button>`)}
      </div>`, {});
    const drawerEl = drawer;

    drawerEl.querySelector('.drawer-close').addEventListener('click', () => closeDrawer(drawerEl));
    drawerEl.querySelector('#rx-zoom-btn').addEventListener('click', () => {
      const img = drawerEl.querySelector('#rx-preview-img');
      if (img) {
        const zoomed = img.style.maxHeight === 'none';
        img.style.maxHeight = zoomed ? '340px' : 'none';
        img.style.cursor = 'zoom-out';
      }
    });
    drawerEl.querySelector('#rx-approve-btn')?.addEventListener('click', () => {
      rx.status = 'approved';
      rx.pharmacist_notes = drawerEl.querySelector('#rx-notes')?.value || '';
      closeDrawer(drawerEl);
      renderCards();
      showToast('Prescription approved — patient notified', 'success');
    });
    drawerEl.querySelector('#rx-reject-btn')?.addEventListener('click', async () => {
      const ok = await confirmDialog('Reject this prescription? The patient will be notified.', { variant: 'danger', confirmText: 'Reject' });
      if (!ok) return;
      rx.status = 'rejected';
      closeDrawer(drawerEl);
      renderCards();
      showToast('Prescription rejected', 'info');
    });
    drawerEl.querySelector('#rx-better-btn')?.addEventListener('click', () => {
      rx.status = 'need_better_image';
      closeDrawer(drawerEl);
      renderCards();
      showToast('Better image requested from patient', 'warning');
    });
    drawerEl.querySelector('#rx-submit-btn')?.addEventListener('click', () => {
      rx.status = mode === 'reject' ? 'rejected' : 'need_better_image';
      rx.pharmacist_notes = drawerEl.querySelector('#rx-notes')?.value || '';
      rx.rejection_reason = drawerEl.querySelector('#rx-reason')?.value;
      closeDrawer(drawerEl);
      renderCards();
      showToast(mode === 'reject' ? 'Prescription rejected' : 'Better image requested', 'warning');
    });
    drawerEl.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeDrawer(drawerEl)));
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { if (!window.__rxBooted) { window.__rxBooted = true; initRx(); } }, 300);
  }
})();

