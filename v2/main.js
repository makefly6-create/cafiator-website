// ══════════════════════════════════════
//  CAFIATOR V2 — Main JS
// ══════════════════════════════════════

(function() {
  'use strict';

  // ── 导航栏滚动 ──
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ── 导航链接高亮 ──
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-section') === current);
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // ── 汉堡菜单 ──
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');
  if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinksEl.style.display === 'flex';
      navLinksEl.style.display = isOpen ? 'none' : 'flex';
      navLinksEl.style.flexDirection = 'column';
      navLinksEl.style.position = 'absolute';
      navLinksEl.style.top = '72px';
      navLinksEl.style.left = '0';
      navLinksEl.style.right = '0';
      navLinksEl.style.background = 'rgba(6,13,24,0.97)';
      navLinksEl.style.backdropFilter = 'blur(24px)';
      navLinksEl.style.padding = '12px 24px 24px';
      navLinksEl.style.gap = '4px';
      navLinksEl.style.borderBottom = isOpen ? 'none' : '1px solid rgba(255,255,255,0.04)';
    });
  }

  // ── 滚动进场动画 ──
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // 交错延迟
        const delay = entry.target.closest('.products-grid, .origin-stack, .rewards-grid, .philosophy-grid')
          ? Array.from(entry.target.parentNode.children).indexOf(entry.target) * 80
          : 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // ══════════════════════════
  //  购物车
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

  // 产品数据
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

  // 加入购物车按钮
  document.querySelectorAll('.prod-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.prod-card');
      const name = card.querySelector('.prod-name').textContent;
      addToCart(name);
      // 按钮反馈
      btn.textContent = '✓';
      btn.style.background = 'var(--gold-grad)';
      btn.style.color = 'var(--deep)';
      setTimeout(() => {
        btn.textContent = '+';
        btn.style.background = '';
        btn.style.color = '';
      }, 1200);
    });
  });

  function addToCart(name) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, qty: 1, ...products[name] });
    }
    renderCart();
    openCart();
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
  }

  function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    renderCart();
  }

  function renderCart() {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    cartCountEl.textContent = totalQty;
    totalPriceEl.textContent = '¥' + totalPrice;

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<div class="cart-drawer-empty">购物车是空的</div>';
      return;
    }

    cartItemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <img class="cart-item-image" src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">¥${item.price}</div>
          <div class="cart-item-controls">
            <button class="quantity-btn" onclick="window._changeQty(${i}, -1)">−</button>
            <span class="cart-item-quantity">${item.qty}</span>
            <button class="quantity-btn" onclick="window._changeQty(${i}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="window._removeFromCart(${i})">×</button>
      </div>
    `).join('');
  }

  // 全局暴露
  window._removeFromCart = removeFromCart;
  window._changeQty = changeQty;

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const names = cart.map(i => `${i.name} x${i.qty}`).join('、');
      alert(`订单确认\n\n${names}\n\n合计: ¥${total}\n\n功能开发中，敬请期待 ✈`);
    });
  }

})();
