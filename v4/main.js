/* ═══════════════════════════════════════════
   CAFIATOR V4 — Main JS
   ═══════════════════════════════════════════ */

// ── Navigation scroll effect ──
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  nav.classList.toggle('scrolled', scroll > 80);
  lastScroll = scroll;
});

// ── Active nav link tracking ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

const observerNav = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => observerNav.observe(s));

// ── Scroll reveal ──
const reveals = document.querySelectorAll('.reveal');
const observerReveal = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observerReveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => observerReveal.observe(el));

// ── Mobile hamburger ──
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinksEl.classList.toggle('mobile-open');
});

// Close mobile menu on link click
navLinksEl.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('mobile-open');
  });
});

// ── Shopping Cart ──
let cart = [];

const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const totalPriceEl = document.getElementById('totalPrice');

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

cartIcon.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<div class="cart-empty">购物袋是空的</div>';
    totalPriceEl.textContent = '¥0';
    cartCountEl.classList.remove('show');
    return;
  }

  cartCountEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.classList.add('show');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  totalPriceEl.textContent = '¥' + total;

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">¥${item.price} × ${item.qty}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${cart.indexOf(item)})">✕</button>
    </div>
  `).join('');
}

function addToCart(name, price, img) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, img, qty: 1 });
  }
  renderCart();
  openCart();
}

function removeFromCart(index) {
  if (index > -1) cart.splice(index, 1);
  renderCart();
}

// ── Add to cart buttons ──
document.querySelectorAll('.btn-add').forEach(btn => {
  btn.addEventListener('click', function() {
    const product = this.closest('[data-name]') || this.closest('.product-hero, .product-half');
    const name = product.dataset.name;
    const priceText = product.querySelector('.product-price').textContent;
    const price = parseInt(priceText.replace('¥', ''));
    const img = product.querySelector('img').src.split('/').pop();
    addToCart(name, price, img);

    // Button feedback
    this.textContent = '已添加 ✓';
    setTimeout(() => { this.textContent = '加入购物袋'; }, 1500);
  });
});

// ── Checkout button ──
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) return;
  alert('感谢您的选购！\n\n' + cart.map(i => `${i.name} × ${i.qty}  ¥${i.price * i.qty}`).join('\n') + '\n\n合计：¥' + cart.reduce((s, i) => s + i.price * i.qty, 0));
});

// ── Smooth scroll for nav links ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
