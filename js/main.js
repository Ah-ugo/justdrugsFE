/**
 * Just Drugs — Main Application
 * Orchestrates UI: categories, products, search, filters, modals, carousel,
 * countdown timer, mobile menu, and all global helpers.
 */

// ─── Globals ─────────────────────────────────────────────────────────────────
let _allProducts   = [];
let _currentPage   = 1;
let _pageSize      = 12;
let _totalCount    = 0;
let _activeFilters = {};
let _activeSort    = 'newest';
let _wishlist      = new Set(JSON.parse(localStorage.getItem('jd_wishlist') || '[]'));

// ─── Utilities ───────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconName = type === 'success' ? 'check-circle'
                 : type === 'error' ? 'alert-circle'
                 : type === 'warning' ? 'alert-triangle' : 'info';

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon"><i data-feather="${iconName}"></i></span>
    <span class="toast-msg">${escapeHtml(message)}</span>`;

  container.appendChild(toast);
  feather.replace();
  requestAnimationFrame(() => toast.classList.add('visible'));

  const remove = () => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  };
  const timer = setTimeout(remove, duration);
  toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

// ─── Category icon map (Feather Icons) ────────────────────────────────────────
const CAT_ICONS = {
  'pain-relief': 'activity',
  'cold-flu': 'thermometer',
  'antimalarial': 'shield',
  'heart-care': 'heart',
  'diabetes': 'droplet',
  'baby-care': 'smile',
  'vitamins': 'sun',
  'first-aid': 'crosshair',
  'dental': 'smile',
  'eye-care': 'eye',
};

const CAT_COLORS = {
  'pain-relief': '#fee2e2',
  'cold-flu': '#e0f2fe',
  'antimalarial': '#fef9c3',
  'heart-care': '#fce7f3',
  'diabetes': '#ede9fe',
  'baby-care': '#fef3c7',
  'vitamins': '#d1fae5',
  'first-aid': '#ffedd5',
  'dental': '#e0f2fe',
  'eye-care': '#f0fdf4',
};

// ─── Product card builder ─────────────────────────────────────────────────────
function buildProductCard(p) {
  const id = p._id || p.product_id || p.id;
  const price = p.selling_price ?? p.price ?? 0;
  const origPrice = p.original_price ?? p.compare_at_price ?? null;
  const discount = origPrice && origPrice > price
    ? Math.round(((origPrice - price) / origPrice) * 100)
    : 0;
  const rating = p.rating ?? p.average_rating ?? 4.5;
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  const catIcon = CAT_ICONS[p.category_slug] || 'package';
  const inWishlist = _wishlist.has(id);

  const stockClass = p.stock_quantity <= 0 ? 'out-of-stock'
                   : p.stock_quantity <= 10 ? 'low-stock' : 'in-stock';
  const stockLabel = p.stock_quantity <= 0 ? 'Out of Stock'
                   : p.stock_quantity <= 10 ? 'Low Stock' : 'In Stock';

  const primaryImage = (p.images && p.images[0] && p.images[0].url) ? p.images[0].url : null;

  const imageHtml = primaryImage
    ? `<img src="${primaryImage}" alt="${escapeHtml(p.name)}" class="product-img-real" loading="lazy" />`
    : `<div class="product-icon-fallback" aria-hidden="true">
         <i data-feather="${catIcon}"></i>
         <span class="dosage-tag">${escapeHtml(p.dosage_form || 'Medicine')}</span>
       </div>`;

  return `
  <article class="product-card" data-id="${id}" role="listitem">
    <div class="product-card-inner">
      <!-- Badges -->
      <div class="product-badges">
        ${p.requires_prescription ? '<span class="badge badge-rx">Rx</span>' : ''}
        ${discount > 0 ? `<span class="badge badge-discount">-${discount}%</span>` : ''}
        ${p.is_new_arrival ? '<span class="badge badge-new">New</span>' : ''}
        ${p.is_best_seller ? '<span class="badge badge-best">Best Seller</span>' : ''}
      </div>

      <!-- Wishlist -->
      <button class="wishlist-btn ${inWishlist ? 'active' : ''}"
        data-product-id="${id}" aria-label="${inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}"
        aria-pressed="${inWishlist}">
        <svg viewBox="0 0 24 24" fill="${inWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <!-- Image area -->
      <div class="product-image" style="background:${CAT_COLORS[p.category_slug] || '#f0fdf4'}">
        ${imageHtml}
        <button class="quick-view-btn" data-product-id="${id}" aria-label="Quick view ${escapeHtml(p.name)}">
          Quick View
        </button>
      </div>

      <!-- Info -->
      <div class="product-info">
        <p class="product-brand">${escapeHtml(p.brand_name || p.brand || '')}</p>
        <h3 class="product-name">${escapeHtml(p.name)}</h3>
        ${p.generic_name ? `<p class="product-generic">${escapeHtml(p.generic_name)}</p>` : ''}
        ${p.strength || p.dosage_form ? `<p class="product-dosage">${escapeHtml([p.dosage_form, p.strength].filter(Boolean).join(' · '))}</p>` : ''}

        <div class="product-rating" aria-label="${rating} stars">
          <span class="stars" aria-hidden="true">${stars}</span>
          <span class="rating-count">(${p.review_count ?? p.rating_count ?? 12})</span>
        </div>

        <div class="product-pricing">
          <span class="product-price">₦${price.toLocaleString('en-NG')}</span>
          ${origPrice && discount > 0 ? `<span class="product-orig-price">₦${origPrice.toLocaleString('en-NG')}</span>` : ''}
        </div>

        <div class="product-stock ${stockClass}">
          <span class="stock-dot"></span> ${stockLabel}
        </div>
      </div>

      <!-- CTA -->
      <div class="product-cta">
        ${p.stock_quantity > 0 || p.stock_status !== 'OUT_OF_STOCK'
          ? `<button class="btn btn-primary btn-full add-to-cart-btn" data-product-id="${id}"
               ${p.requires_prescription ? 'data-requires-rx="true"' : ''}>
               <i data-feather="shopping-bag"></i> Add to Cart
             </button>`
          : `<button class="btn btn-outline btn-full" disabled>Out of Stock</button>`}
      </div>
    </div>
  </article>`;
}

// ─── Render products into a container ────────────────────────────────────────
function renderProductRow(containerId, products) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!products.length) { el.innerHTML = '<p class="no-products">No products found.</p>'; return; }
  el.innerHTML = products.map(buildProductCard).join('');
  feather.replace();
  attachProductEvents(el);
}

// ─── Attach card-level events ─────────────────────────────────────────────────
function attachProductEvents(container) {
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const pid = btn.dataset.productId;
      const product = _allProducts.find(p => (p._id || p.product_id || p.id) === pid)
        || { _id: pid, name: btn.closest('.product-card')?.querySelector('.product-name')?.textContent || 'Product' };
      if (btn.dataset.requiresRx) {
        showToast('This medicine requires a prescription. Please upload it.', 'warning');
        openPrescriptionModal();
        return;
      }
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Adding…';
      await Cart.addItem(product);
      btn.disabled = false;
      btn.innerHTML = `<i data-feather="shopping-bag"></i> Add to Cart`;
      feather.replace();
    });
  });

  container.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.dataset.productId;
      const product = _allProducts.find(p => (p._id || p.product_id || p.id) === pid);
      if (product) openQuickView(product);
    });
  });

  container.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.dataset.productId;
      if (_wishlist.has(pid)) {
        _wishlist.delete(pid);
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        showToast('Removed from wishlist', 'info');
      } else {
        _wishlist.add(pid);
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        showToast('Added to wishlist', 'success');
      }
      localStorage.setItem('jd_wishlist', JSON.stringify([..._wishlist]));
      updateWishlistCount();
    });
  });
}

function updateWishlistCount() {
  const el = document.getElementById('wishlist-count');
  if (!el) return;
  const n = _wishlist.size;
  el.textContent = n;
  el.hidden = n === 0;
}

// ─── Quick view modal ─────────────────────────────────────────────────────────
function openQuickView(p) {
  const price = p.selling_price ?? p.price ?? 0;
  const origPrice = p.original_price ?? null;
  const discount = origPrice && origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
  const catIcon = CAT_ICONS[p.category_slug] || 'package';
  const rating = p.rating ?? 4.5;
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  const primaryImage = (p.images && p.images[0] && p.images[0].url) ? p.images[0].url : null;
  const imageHtml = primaryImage
    ? `<img src="${primaryImage}" alt="${escapeHtml(p.name)}" class="qv-img-real" />`
    : `<div class="qv-icon-fallback"><i data-feather="${catIcon}"></i></div>`;

  const inner = document.getElementById('quickview-inner');
  if (!inner) return;
  inner.innerHTML = `
    <div class="qv-image" style="background:${CAT_COLORS[p.category_slug] || '#f0fdf4'}">
      ${imageHtml}
    </div>
    <div class="qv-details">
      <p class="product-brand">${escapeHtml(p.brand_name || p.brand || '')}</p>
      <h2 class="qv-name">${escapeHtml(p.name)}</h2>
      ${p.generic_name ? `<p class="product-generic">Generic: ${escapeHtml(p.generic_name)}</p>` : ''}
      ${p.strength || p.dosage_form ? `<p class="product-dosage">${escapeHtml([p.dosage_form, p.strength].filter(Boolean).join(' · '))}</p>` : ''}
      <div class="product-rating" aria-label="${rating} stars">
        <span class="stars">${stars}</span>
        <span class="rating-count">(${p.review_count ?? 12} reviews)</span>
      </div>
      <div class="qv-pricing">
        <span class="product-price">₦${price.toLocaleString('en-NG')}</span>
        ${origPrice && discount > 0 ? `<span class="product-orig-price">₦${origPrice.toLocaleString('en-NG')}</span><span class="badge badge-discount">-${discount}%</span>` : ''}
      </div>
      ${p.description ? `<p class="qv-desc">${escapeHtml(p.description)}</p>` : ''}
      ${p.requires_prescription ? '<div class="rx-warning"><i data-feather="alert-triangle"></i> Requires a valid prescription</div>' : ''}
      <div class="qv-cta">
        ${p.stock_quantity > 0 || p.stock_status !== 'OUT_OF_STOCK'
          ? `<button class="btn btn-primary btn-lg" id="qv-add-cart" data-product-id="${escapeHtml(p._id || p.id)}">
               <i data-feather="shopping-bag"></i> Add to Cart
             </button>`
          : `<button class="btn btn-outline btn-lg" disabled>Out of Stock</button>`}
        <button class="btn btn-ghost btn-lg" onclick="closeQuickView()">Continue Shopping</button>
      </div>
    </div>`;
  feather.replace();

  document.getElementById('qv-add-cart')?.addEventListener('click', async () => {
    if (p.requires_prescription) { openPrescriptionModal(); return; }
    await Cart.addItem(p);
    closeQuickView();
  });

  document.getElementById('quickview-modal').classList.add('open');
  document.getElementById('quickview-overlay').classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  document.getElementById('quickview-modal')?.classList.remove('open');
  document.getElementById('quickview-overlay')?.classList.remove('visible');
  document.body.style.overflow = '';
}

// ─── Prescription modal ───────────────────────────────────────────────────────
function openPrescriptionModal() {
  document.getElementById('rx-modal')?.classList.add('open');
  document.getElementById('rx-overlay')?.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closePrescriptionModal() {
  document.getElementById('rx-modal')?.classList.remove('open');
  document.getElementById('rx-overlay')?.classList.remove('visible');
  document.body.style.overflow = '';
}

// ─── Track order modal ────────────────────────────────────────────────────────
function openTrackModal() {
  document.getElementById('track-modal')?.classList.add('open');
  document.getElementById('track-overlay')?.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeTrackModal() {
  document.getElementById('track-modal')?.classList.remove('open');
  document.getElementById('track-overlay')?.classList.remove('visible');
  document.body.style.overflow = '';
}

// ─── Filter helpers ───────────────────────────────────────────────────────────
function applyFilter(queryString) {
  const params = Object.fromEntries(new URLSearchParams(queryString));
  _activeFilters = { ...params };
  _currentPage = 1;
  loadMainProducts();
  document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
  updateSubNav(queryString);
  updateActiveFilterStrip();
}

function clearAllFilters() {
  _activeFilters = {};
  _currentPage = 1;
  _activeSort = 'newest';
  const sortSel = document.getElementById('sort-select');
  if (sortSel) sortSel.value = 'newest';
  document.querySelectorAll('.rating-filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('input[name="rx-filter"]').forEach(r => { r.checked = r.value === ''; });
  const minInput = document.getElementById('price-min');
  const maxInput = document.getElementById('price-max');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';
  document.querySelectorAll('#category-filter-list input[type="checkbox"]').forEach(c => c.checked = false);
  document.querySelectorAll('#brand-filter-list input[type="checkbox"]').forEach(c => c.checked = false);
  updateSubNav('');
  updateActiveFilterStrip();
  loadMainProducts();
}

function updateSubNav(activeFilter) {
  document.querySelectorAll('.sub-nav-item').forEach(btn => {
    const f = btn.dataset.filter || (btn.dataset.catSlug ? `category_slug=${btn.dataset.catSlug}` : '');
    btn.classList.toggle('active', f === activeFilter);
  });
}

function updateActiveFilterStrip() {
  const strip = document.getElementById('active-filters-strip');
  if (!strip) return;
  strip.innerHTML = '';
  const labelMap = {
    category_slug: 'Category', featured: 'Featured', popular: 'Popular',
    new_arrival: 'New Arrivals', best_seller: 'Best Sellers',
    brand: 'Brand', min_price: 'Min ₦', max_price: 'Max ₦',
    requires_prescription: 'Prescription', min_rating: 'Rating ≥',
  };
  Object.entries(_activeFilters).forEach(([k, v]) => {
    if (!v || k === 'sort') return;
    const chip = document.createElement('span');
    chip.className = 'filter-chip';
    chip.innerHTML = `${labelMap[k] || k}: <strong>${escapeHtml(v)}</strong> <button aria-label="Remove ${k} filter">×</button>`;
    chip.querySelector('button').addEventListener('click', () => {
      delete _activeFilters[k];
      _currentPage = 1;
      updateActiveFilterStrip();
      loadMainProducts();
    });
    strip.appendChild(chip);
  });
}

// ─── Category grid ────────────────────────────────────────────────────────────
async function loadCategories() {
  const grid = document.getElementById('categories-grid');
  const filterList = document.getElementById('category-filter-list');
  try {
    const data = await CategoriesAPI.list();
    const cats = data.categories || data.data || data || [];

    if (grid) {
      grid.innerHTML = cats.map(c => {
        const icon = CAT_ICONS[c.slug] || 'crosshair';
        return `
        <button class="category-card" onclick="applyFilter('category_slug=${c.slug}')"
          style="--cat-color: ${CAT_COLORS[c.slug] || '#f0fdf4'}"
          aria-label="Browse ${escapeHtml(c.name)}">
          <div class="category-icon-box" aria-hidden="true">
            <i data-feather="${icon}"></i>
          </div>
          <span class="category-name">${escapeHtml(c.name)}</span>
          ${c.product_count ? `<span class="category-count">${c.product_count} items</span>` : ''}
        </button>`;
      }).join('');
      feather.replace();
    }

    if (filterList) {
      filterList.innerHTML = cats.map(c => `
        <label class="filter-checkbox-item">
          <input type="checkbox" value="${c.slug}" data-filter-type="category_slug">
          ${escapeHtml(c.name)}
        </label>`).join('');

      filterList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          const checked = [...filterList.querySelectorAll('input:checked')].map(i => i.value);
          if (checked.length === 1) _activeFilters.category_slug = checked[0];
          else delete _activeFilters.category_slug;
          _currentPage = 1;
          updateActiveFilterStrip();
          loadMainProducts();
        });
      });
    }
  } catch (err) {
    console.error('Failed to load categories', err);
  }
}

// ─── Products — homepage rows ─────────────────────────────────────────────────
async function loadHomepageProducts() {
  try {
    // Use the dedicated homepage endpoint for pre-segmented product arrays
    const res = await apiFetch('/homepage');
    const hd = res.data || {};

    const featured    = hd.featured_products   || [];
    const popular     = hd.popular_products    || [];
    const newArrivals = hd.new_arrivals        || [];
    const discounted  = hd.discounted_products || [];
    const allProds    = [...featured, ...popular, ...newArrivals, ...discounted];

    // Deduplicate into global cache
    _allProducts = [...new Map([..._allProducts, ...allProds].map(p => [(p._id || p.id), p])).values()];

    renderProductRow('featured-products-row', featured);
    renderProductRow('popular-products-row', popular);
    renderProductRow('new-arrivals-row', newArrivals);
    renderProductRow('discounted-products-row', discounted);
  } catch (err) {
    console.error('Failed to load homepage products', err);
  }
}

// ─── Products — main shop grid ────────────────────────────────────────────────
async function loadMainProducts(append = false) {
  const grid   = document.getElementById('products-grid');
  const count  = document.getElementById('product-count');
  const empty  = document.getElementById('empty-state');
  const more   = document.getElementById('load-more-container');

  if (!grid) return;

  if (!append) {
    grid.innerHTML = Array(6).fill(`
      <article class="product-card skeleton-card" aria-hidden="true">
        <div class="skeleton-img"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
      </article>`).join('');
  }

  try {
    const params = {
      ..._activeFilters,
      sort_by: _activeSort,
      page: _currentPage,
      limit: _pageSize,
    };
    const data = await ShopAPI.getProducts(params);
    // Response: { success, data: { products, banners, filters, settings }, meta: { total, page, limit, pages } }
    const products = (data.data && data.data.products) || data.products || [];
    _totalCount = (data.meta && data.meta.total) || data.total || products.length;

    products.forEach(p => {
      const id = p._id || p.id;
      if (!_allProducts.find(x => (x._id || x.id) === id)) _allProducts.push(p);
    });

    if (!append) grid.innerHTML = '';

    if (!products.length && !append) {
      if (empty) empty.hidden = false;
      if (more)  more.hidden = true;
      if (count) count.textContent = '0 products';
      return;
    }
    if (empty) empty.hidden = true;
    grid.insertAdjacentHTML('beforeend', products.map(buildProductCard).join(''));
    feather.replace();
    attachProductEvents(grid);

    const loaded = (_currentPage - 1) * _pageSize + products.length;
    if (count) count.textContent = `Showing ${loaded.toLocaleString()} of ${_totalCount.toLocaleString()} product${_totalCount !== 1 ? 's' : ''}`;
    if (more)  more.hidden = loaded >= _totalCount;
  } catch (err) {
    grid.innerHTML = `<p class="error-state">Failed to load products. Is the server running? <button class="btn btn-primary btn-sm" onclick="loadMainProducts()">Retry</button></p>`;
    console.error(err);
  }
}

// ─── Search autocomplete ──────────────────────────────────────────────────────
function initSearch() {
  const input       = document.getElementById('search-input');
  const suggestions = document.getElementById('search-suggestions');
  const resultsList = document.getElementById('results-list');
  const recentSec   = document.getElementById('suggestions-recent');
  const recentList  = document.getElementById('recent-list');
  const trendingSec = document.getElementById('suggestions-trending');
  const resultsSec  = document.getElementById('suggestions-results');

  let debounce;

  function showSuggestions() {
    if (suggestions) suggestions.hidden = false;
  }
  function hideSuggestions() {
    setTimeout(() => { if (suggestions) suggestions.hidden = true; }, 150);
  }

  function renderRecent() {
    const recent = JSON.parse(localStorage.getItem('jd_recent_searches') || '[]');
    if (recent.length && recentSec && recentList) {
      recentList.innerHTML = recent.slice(0, 5).map(q =>
        `<li class="suggestion-item" data-query="${escapeHtml(q)}">
           <i data-feather="clock"></i> ${escapeHtml(q)}
         </li>`).join('');
      recentSec.hidden = false;
      feather.replace();
    } else if (recentSec) {
      recentSec.hidden = true;
    }
  }

  function saveRecent(q) {
    let recent = JSON.parse(localStorage.getItem('jd_recent_searches') || '[]');
    recent = [q, ...recent.filter(r => r !== q)].slice(0, 10);
    localStorage.setItem('jd_recent_searches', JSON.stringify(recent));
  }

  function doSearch(query) {
    if (!query.trim()) return;
    saveRecent(query.trim());
    hideSuggestions();
    _activeFilters = { q: query.trim() };
    _currentPage = 1;
    updateActiveFilterStrip();
    loadMainProducts();
    document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  input?.addEventListener('focus', () => {
    renderRecent();
    if (trendingSec) trendingSec.hidden = !!input.value;
    if (resultsSec)  resultsSec.hidden = !input.value;
    showSuggestions();
  });

  input?.addEventListener('blur', hideSuggestions);

  input?.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim();
    if (!q) {
      if (trendingSec) trendingSec.hidden = false;
      if (resultsSec)  resultsSec.hidden = true;
      if (resultsList) resultsList.innerHTML = '';
      return;
    }
    if (trendingSec) trendingSec.hidden = true;
    debounce = setTimeout(async () => {
      try {
        const data = await ShopAPI.autocomplete(q);
        // Response: { success, data: [...products] }
        const hits = (Array.isArray(data.data) ? data.data : null) || data.suggestions || data.results || [];
        if (!hits.length) {
          if (resultsSec) resultsSec.hidden = true;
          return;
        }
        if (resultsSec)  resultsSec.hidden = false;
        if (resultsList) {
          resultsList.innerHTML = hits.map(s =>
            `<li class="suggestion-item" data-query="${escapeHtml(typeof s === 'string' ? s : s.name)}">
               <i data-feather="search"></i> ${escapeHtml(typeof s === 'string' ? s : s.name)}
             </li>`).join('');
          feather.replace();
        }
      } catch (_) { if (resultsSec) resultsSec.hidden = true; }
    }, 300);
  });

  suggestions?.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (!item) return;
    const q = item.dataset.query;
    input.value = q;
    doSearch(q);
  });

  document.getElementById('search-btn')?.addEventListener('click', () => doSearch(input.value));
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(input.value); });
}

// ─── Hero carousel ────────────────────────────────────────────────────────────
function initCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.carousel-dot');
  if (!slides.length) return;
  let current  = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    if (dots[current]) {
      dots[current].classList.remove('active');
      dots[current].setAttribute('aria-selected', 'false');
    }
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) {
      dots[current].classList.add('active');
      dots[current].setAttribute('aria-selected', 'true');
    }
  }

  function startAuto() { timer = setInterval(() => goTo(current + 1), 5000); }
  function stopAuto()  { clearInterval(timer); }

  document.getElementById('hero-prev')?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  document.getElementById('hero-next')?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));
  startAuto();
}

// ─── Flash sale countdown ─────────────────────────────────────────────────────
function initCountdown() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  function tick() {
    const now  = Date.now();
    const diff = Math.max(0, end - now);
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    const cdH = document.getElementById('cd-hours');
    const cdM = document.getElementById('cd-mins');
    const cdS = document.getElementById('cd-secs');
    if (cdH) cdH.textContent = h;
    if (cdM) cdM.textContent = m;
    if (cdS) cdS.textContent = s;
  }
  tick();
  setInterval(tick, 1000);
}

// ─── Filter sidebar ───────────────────────────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-group-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !open);
      if (body) body.hidden = open;
    });
  });

  document.getElementById('apply-price-btn')?.addEventListener('click', () => {
    const min = document.getElementById('price-min').value;
    const max = document.getElementById('price-max').value;
    if (min) _activeFilters.min_price = min;
    else delete _activeFilters.min_price;
    if (max) _activeFilters.max_price = max;
    else delete _activeFilters.max_price;
    _currentPage = 1;
    updateActiveFilterStrip();
    loadMainProducts();
  });

  document.querySelectorAll('.rating-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const active = btn.classList.contains('active');
      document.querySelectorAll('.rating-filter-btn').forEach(b => b.classList.remove('active'));
      if (!active) {
        btn.classList.add('active');
        _activeFilters.min_rating = btn.dataset.rating;
      } else {
        delete _activeFilters.min_rating;
      }
      _currentPage = 1;
      updateActiveFilterStrip();
      loadMainProducts();
    });
  });

  document.querySelectorAll('input[name="rx-filter"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === '') delete _activeFilters.requires_prescription;
      else _activeFilters.requires_prescription = radio.value;
      _currentPage = 1;
      updateActiveFilterStrip();
      loadMainProducts();
    });
  });

  document.getElementById('clear-filters-btn')?.addEventListener('click', clearAllFilters);

  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    _activeSort = e.target.value;
    _currentPage = 1;
    loadMainProducts();
  });

  document.getElementById('load-more-btn')?.addEventListener('click', () => {
    _currentPage++;
    loadMainProducts(true);
  });

  document.getElementById('grid-view-btn')?.addEventListener('click', () => {
    document.getElementById('products-grid')?.classList.remove('list-view');
    document.getElementById('grid-view-btn')?.classList.add('active');
    document.getElementById('list-view-btn')?.classList.remove('active');
  });
  document.getElementById('list-view-btn')?.addEventListener('click', () => {
    document.getElementById('products-grid')?.classList.add('list-view');
    document.getElementById('list-view-btn')?.classList.add('active');
    document.getElementById('grid-view-btn')?.classList.remove('active');
  });

  document.getElementById('filter-toggle-btn')?.addEventListener('click', () => {
    document.getElementById('filter-sidebar')?.classList.toggle('open');
  });

  document.querySelectorAll('.sub-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      const catSlug = btn.dataset.catSlug;
      if (catSlug) {
        applyFilter(`category_slug=${catSlug}`);
      } else if (f !== undefined) {
        applyFilter(f);
      }
    });
  });
}

// ─── Mobile menu ──────────────────────────────────────────────────────────────
function initMobileMenu() {
  const toggle  = document.getElementById('mobile-menu-toggle');
  const close   = document.getElementById('mobile-menu-close');
  const overlay = document.getElementById('mobile-menu-overlay');
  const menu    = document.getElementById('mobile-menu');

  function open() {
    menu?.classList.add('open');
    overlay?.classList.add('visible');
    document.body.style.overflow = 'hidden';
    toggle?.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    menu?.classList.remove('open');
    overlay?.classList.remove('visible');
    document.body.style.overflow = '';
    toggle?.setAttribute('aria-expanded', 'false');
  }

  toggle?.addEventListener('click', open);
  close?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
}

// ─── Sticky header scroll shadow ─────────────────────────────────────────────
function initScrollBehavior() {
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ─── Modal close events ───────────────────────────────────────────────────────
function initModals() {
  document.getElementById('quickview-close')?.addEventListener('click', closeQuickView);
  document.getElementById('quickview-overlay')?.addEventListener('click', closeQuickView);

  document.getElementById('rx-modal-close')?.addEventListener('click', closePrescriptionModal);
  document.getElementById('rx-overlay')?.addEventListener('click', closePrescriptionModal);

  document.getElementById('track-modal-close')?.addEventListener('click', closeTrackModal);
  document.getElementById('track-overlay')?.addEventListener('click', closeTrackModal);

  const dropZone  = document.getElementById('rx-drop-zone');
  const fileInput = document.getElementById('rx-file-input');
  const rxPreview = document.getElementById('rx-preview');
  const browseBtn = document.getElementById('rx-browse-btn');

  browseBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => handleRxFile(fileInput.files[0]));
  dropZone?.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleRxFile(e.dataTransfer.files[0]);
  });

  function handleRxFile(file) {
    if (!file) return;
    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) { showToast(`File too large. Max ${maxMB}MB`, 'error'); return; }
    if (!file.type.match(/image|pdf/i)) { showToast('Unsupported format. Use JPG, PNG, or PDF.', 'error'); return; }
    if (rxPreview) {
      rxPreview.hidden = false;
      rxPreview.innerHTML = file.type.includes('pdf')
        ? `<div class="rx-file-name"><i data-feather="file"></i> ${escapeHtml(file.name)}</div>`
        : `<img src="${URL.createObjectURL(file)}" alt="Prescription preview" class="rx-img-preview">`;
      feather.replace();
    }
    if (dropZone) dropZone.style.display = 'none';
  }

  document.getElementById('rx-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Prescription submitted! Our pharmacist will contact you within 30 minutes.', 'success', 6000);
    closePrescriptionModal();
  });

  document.getElementById('track-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = document.getElementById('track-input').value.trim();
    const result = document.getElementById('track-result');
    if (!result) return;
    result.hidden = false;
    result.innerHTML = '<div class="spinner-lg"></div>';
    try {
      const data = await OrdersAPI.track(q);
      result.innerHTML = `<div class="track-success">
        <p>Order found!</p>
        <strong>${escapeHtml(data.order_id || q)}</strong>
        <span class="order-status-badge">${escapeHtml(data.status || 'Processing')}</span>
      </div>`;
    } catch (_) {
      result.innerHTML = `<div class="track-error">Order not found. Check the number and try again.</div>`;
    }
  });

  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('You are subscribed! Welcome to the Just Drugs family.', 'success');
    e.target.reset();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeQuickView();
    closePrescriptionModal();
    closeTrackModal();
    Cart.close();
    Auth.closeModal();
  });
}

// ─── Brand filter loader ──────────────────────────────────────────────────────
async function loadBrandFilters() {
  const list = document.getElementById('brand-filter-list');
  if (!list) return;
  try {
    const data = await ShopAPI.getProducts({ limit: 100 });
    const products = data.products || data.data || [];
    const brands = [...new Set(products.map(p => p.brand_name || p.brand).filter(Boolean))];
    if (!brands.length) return;
    list.innerHTML = brands.map(b => `
      <label class="filter-checkbox-item">
        <input type="checkbox" value="${escapeHtml(b)}" data-filter-type="brand">
        ${escapeHtml(b)}
      </label>`).join('');
    list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = [...list.querySelectorAll('input:checked')].map(i => i.value);
        if (checked.length === 1) _activeFilters.brand = checked[0];
        else delete _activeFilters.brand;
        _currentPage = 1;
        updateActiveFilterStrip();
        loadMainProducts();
      });
    });
  } catch (_) {}
}

// ─── DOMContentLoaded ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof feather !== 'undefined') feather.replace();
  initScrollBehavior();
  initCarousel();
  initCountdown();
  initMobileMenu();
  initFilters();
  initModals();
  initSearch();
  updateWishlistCount();

  Cart.init();
  Auth.init();

  await Promise.allSettled([
    loadCategories(),
    loadHomepageProducts(),
    loadMainProducts(),
    loadBrandFilters(),
  ]);
});
