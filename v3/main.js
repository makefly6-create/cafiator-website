// ══════════════════════════════════════
//  CAFIATOR V3 — Design Studio JS
// ══════════════════════════════════════
(function(){
  'use strict';

  // ── Nav scroll ──
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // ── Active link ──
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  function updateActive() {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === cur));
  }
  window.addEventListener('scroll', updateActive, { passive: true });

  // ── Hamburger ──
  const ham = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');
  if (ham && navLinksEl) {
    ham.addEventListener('click', () => {
      const open = navLinksEl.style.display === 'flex';
      Object.assign(navLinksEl.style, {
        display: open ? 'none' : 'flex',
        flexDirection: 'column',
        position: 'absolute', top: '56px', left: '0', right: '0',
        background: 'rgba(6,9,15,.97)',
        backdropFilter: 'blur(24px)',
        padding: '12px 24px 20px', gap: '2px',
        borderBottom: open ? 'none' : '1px solid rgba(255,255,255,.04)'
      });
    });
  }

  // ── Reveal on scroll ──
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const parent = e.target.closest('.collection-grid, .origin-features, .philosophy-grid, .prod-stack');
        const delay = parent ? [...parent.children].indexOf(e.target.closest('.reveal,.prod-tile,.origin-feat,.prod-stack') || e.target) * 60 : 0;
        setTimeout(() => e.target.classList.add('visible'), Math.min(delay, 300));
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  // ══════════════════════════
  //  CART
  // ══════════════════════════
  let cart = [];
  const cartIcon = document.getElementById('cartIcon');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsEl = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const totalPriceEl = document.getElementById('totalPrice');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const products = {
    '机长珍藏': { price: 128, img: 'CAPTAIN_MAGIC.jpg' },
    '塔台特调': { price: 118, img: 'atc.png' },
    '巡航配方': { price: 138, img: '巡航时刻.jpg' },
    '加油时刻': { price: 148, img: '加油时刻.png' },
    '私人订制': { price: 528, img: '私人定制.png' },
    '初航体验': { price: 268, img: '挂耳包.jpg' },
  };

  function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (cartIcon) cartIcon.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Add to cart
  document.querySelectorAll('.prod-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tile = btn.closest('.prod-tile');
      const name = tile.querySelector('.prod-tile-name').textContent;
      addToCart(name);
      btn.textContent = '已添加 ✓';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = '加入购物袋';
        btn.classList.remove('added');
      }, 1500);
    });
  });

  function addToCart(name) {
    const ex = cart.find(i => i.name === name);
    if (ex) ex.qty++;
    else cart.push({ name, qty: 1, ...products[name] });
    renderCart();
    openCart();
  }
  function removeFromCart(i) { cart.splice(i, 1); renderCart(); }
  function changeQty(i, d) { cart[i].qty += d; if (cart[i].qty <= 0) cart.splice(i, 1); renderCart(); }

  function renderCart() {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
    cartCountEl.textContent = totalQty;
    totalPriceEl.textContent = '¥' + totalPrice;

    if (!cart.length) {
      cartItemsEl.innerHTML = '<div class="cart-drawer-empty">购物袋是空的</div>';
      return;
    }
    cartItemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <img class="cart-item-image" src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">¥${item.price}</div>
          <div class="cart-item-controls">
            <button class="quantity-btn" onclick="window._cq(${i},-1)">−</button>
            <span class="cart-item-quantity">${item.qty}</span>
            <button class="quantity-btn" onclick="window._cq(${i},1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="window._cr(${i})">×</button>
      </div>
    `).join('');
  }

  window._cr = removeFromCart;
  window._cq = changeQty;

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (!cart.length) return;
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const items = cart.map(i => `${i.name} x${i.qty}`).join('、');
      alert(`订单确认\n\n${items}\n\n合计: ¥${total}\n\n功能开发中，敬请期待 ✈`);
    });
  }

})();
