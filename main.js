// =============================================
// 啡行咖 CAFIATOR - 完整版 main.js
// 集成: 认证 | 商品API | 购物车 | 订单 | 积分
// =============================================

(function() {
  'use strict';

  // ========== 配置 ==========
  const API_BASE = '/api/v1';
  const TOKEN_KEY = 'cafiator_token';
  const USER_KEY = 'cafiator_user';
  const CART_KEY = 'cafiator_cart';

  // ========== 工具函数 ==========
  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function removeToken() { localStorage.removeItem(TOKEN_KEY); }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  }
  function setUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }
  function removeUser() { localStorage.removeItem(USER_KEY); }

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
  }
  function saveCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); }

  async function apiFetch(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(API_BASE + path, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
    if (res.status === 401) {
      logout();
      showToast('请重新登录', 'error');
      return null;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: '请求失败' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  function showToast(msg, type = 'info') {
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast-container toast-${type}`;
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed', top: '80px', right: '20px', zIndex: '9999',
      padding: '12px 24px', borderRadius: '12px', fontSize: '14px',
      fontWeight: '500', maxWidth: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      animation: 'toastIn 0.3s ease'
    });
    if (type === 'success') toast.style.background = '#10B981';
    else if (type === 'error') toast.style.background = '#EF4444';
    else toast.style.background = 'rgba(15,33,51,0.95)';
    toast.style.color = '#fff';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========== 导航滚动效果 ==========
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      navbar.style.background = 'rgba(11,25,41,0.95)';
      navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.3)';
    } else {
      navbar.style.background = 'rgba(11,25,41,0.8)';
      navbar.style.boxShadow = 'none';
    }
    lastScroll = currentScroll;
  });

  // 移动端菜单
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      mobileToggle.classList.toggle('active');
    });
  }

  // ========== 产品动画 ==========
  const productCards = document.querySelectorAll('.product-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  productCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`;
    observer.observe(card);
  });

  // ========== Hero入场动画 ==========
  const heroContent = document.querySelector('.hero-content');
  const heroVisual = document.querySelector('.hero-visual');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(40px)';
    heroContent.style.transition = 'all 0.8s cubic-bezier(0.4,0,0.2,1)';
    setTimeout(() => { heroContent.style.opacity = '1'; heroContent.style.transform = 'translateY(0)'; }, 200);
  }
  if (heroVisual) {
    heroVisual.style.opacity = '0';
    heroVisual.style.transform = 'translateX(40px)';
    heroVisual.style.transition = 'all 0.8s cubic-bezier(0.4,0,0.2,1) 0.3s';
    setTimeout(() => { heroVisual.style.opacity = '1'; heroVisual.style.transform = 'translateX(0)'; }, 400);
  }

  // 积分卡片动画
  document.querySelectorAll('.point-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.5s ease ${0.2 + i * 0.1}s`;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } });
    }, { threshold: 0.2 });
    obs.observe(card);
  });

  // ========== 品牌故事动画 ==========
  const storySection = document.querySelector('.story');
  if (storySection) {
    const heroEl = storySection.querySelector('.story-hero');
    const featEl = storySection.querySelector('.story-features');
    if (heroEl) { heroEl.style.opacity = '0'; heroEl.style.transform = 'translateY(30px)'; heroEl.style.transition = 'all 0.8s ease'; }
    if (featEl) { featEl.style.opacity = '0'; featEl.style.transform = 'translateY(30px)'; featEl.style.transition = 'all 0.8s ease 0.3s'; }
    const sObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (heroEl) { heroEl.style.opacity = '1'; heroEl.style.transform = 'translateY(0)'; }
          if (featEl) { featEl.style.opacity = '1'; featEl.style.transform = 'translateY(0)'; }
        }
      });
    }, { threshold: 0.15 });
    sObs.observe(storySection);
  }

  // 导航高亮
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.pageYOffset >= sec.offsetTop - 200) current = sec.getAttribute('id');
    });
    navLinksAll.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
  });

  // ========== 状态管理 ==========
  let currentUser = getUser();
  let cart = getCart();

  // ========== 用户状态UI ==========
  function updateUserUI() {
    const userNav = document.querySelector('.user-nav');
    if (!userNav) return;
    if (currentUser) {
      userNav.innerHTML = `
        <div class="user-dropdown" id="userDropdown">
          <button class="user-btn user-name-btn" id="userNameBtn">
            <span class="user-avatar">${currentUser.username[0].toUpperCase()}</span>
            <span class="user-name">${currentUser.username}</span>
            ${currentUser.points ? `<span class="user-points">${currentUser.points}积分</span>` : ''}
          </button>
          <div class="user-dropdown-menu" id="userDropdownMenu">
            <a href="#" onclick="showOrders()">我的订单</a>
            <a href="#" onclick="showPoints()">我的积分</a>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:4px 0">
            <a href="#" onclick="logout()" style="color:#EF4444">退出登录</a>
          </div>
        </div>
      `;
      document.getElementById('userNameBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('userDropdownMenu').classList.toggle('show');
      });
      document.addEventListener('click', () => {
        document.getElementById('userDropdownMenu')?.classList.remove('show');
      });
    } else {
      userNav.innerHTML = `
        <a href="#" class="user-btn" id="loginBtn">登录</a>
        <a href="#" class="user-btn register-btn" id="registerBtn">注册</a>
      `;
      document.getElementById('loginBtn').addEventListener('click', (e) => { e.preventDefault(); showLoginModal(); });
      document.getElementById('registerBtn').addEventListener('click', (e) => { e.preventDefault(); showRegisterModal(); });
    }
  }

  // ========== 模态框 ==========
  function createModal(id, title, content, wide = false) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = id;
    overlay.innerHTML = `
      <div class="modal-box" style="${wide ? 'max-width:680px' : 'max-width:440px'}">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="closeModal('${id}')">×</button>
        </div>
        <div class="modal-body">${content}</div>
      </div>
    `;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(id); });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));
    return overlay;
  }

  window.closeModal = function(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('active'); setTimeout(() => m.remove(), 300); }
  };

  // ========== 登录 ==========
  function showLoginModal() {
    createModal('loginModal', '登录', `
      <form id="loginForm" onsubmit="handleLogin(event)">
        <div class="form-group">
          <label>用户名</label>
          <input type="text" name="username" required placeholder="请输入用户名" autocomplete="username">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" name="password" required placeholder="请输入密码" autocomplete="current-password">
        </div>
        <div class="form-error" id="loginError" style="color:#EF4444;font-size:13px;margin-bottom:12px;display:none"></div>
        <button type="submit" class="btn-primary-full">登 录</button>
      </form>
    `);
  }

  window.handleLogin = async function(e) {
    e.preventDefault();
    const form = e.target;
    const errEl = document.getElementById('loginError');
    const fd = new FormData(form);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!data) return;
      setToken(data.access_token);
      const user = await apiFetch('/auth/me');
      if (user) { setUser(user); currentUser = user; }
      updateUserUI();
      updateCartBadge();
      closeModal('loginModal');
      showToast(`欢迎回来，${currentUser.username}！`, 'success');
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  };

  // ========== 注册 ==========
  function showRegisterModal() {
    createModal('registerModal', '注册', `
      <form id="registerForm" onsubmit="handleRegister(event)">
        <div class="form-group">
          <label>用户名</label>
          <input type="text" name="username" required minlength="3" maxlength="50" placeholder="3-50位字母或数字">
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input type="email" name="email" required placeholder="用于找回密码">
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" name="password" required minlength="6" placeholder="至少6位">
        </div>
        <div class="form-group">
          <label>手机（选填）</label>
          <input type="tel" name="phone" placeholder="用于接收订单通知">
        </div>
        <div class="form-group">
          <label>昵称（选填）</label>
          <input type="text" name="full_name" placeholder="显示名称">
        </div>
        <div class="form-error" id="regError" style="color:#EF4444;font-size:13px;margin-bottom:12px;display:none"></div>
        <button type="submit" class="btn-primary-full">注 册</button>
      </form>
    `);
  }

  window.handleRegister = async function(e) {
    e.preventDefault();
    const form = e.target;
    const errEl = document.getElementById('regError');
    const fd = new FormData(form);
    const payload = {
      username: fd.get('username'),
      email: fd.get('email'),
      password: fd.get('password')
    };
    if (fd.get('phone')) payload.phone = fd.get('phone');
    if (fd.get('full_name')) payload.full_name = fd.get('full_name');
    try {
      await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      closeModal('registerModal');
      showToast('注册成功！请登录', 'success');
      setTimeout(showLoginModal, 500);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  };

  // ========== 登出 ==========
  window.logout = function() {
    removeToken();
    removeUser();
    currentUser = null;
    cart = [];
    saveCart([]);
    updateUserUI();
    updateCartBadge();
    showToast('已退出登录');
  };

  // ========== 积分 ==========
  window.showPoints = function() {
    if (!currentUser) { showLoginModal(); return; }
    createModal('pointsModal', '我的积分', `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:48px;font-weight:700;background:var(--gold-grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">${currentUser.points || 0}</div>
        <div style="color:var(--w50);font-size:13px;margin-top:8px">可用积分（10积分=1元可抵扣订单）</div>
        <div style="margin-top:24px;padding:16px;background:rgba(255,255,255,0.05);border-radius:12px;text-align:left;font-size:13px;color:var(--w70);line-height:1.8">
          <strong style="color:var(--gold-light)">积分规则</strong><br>
          · 分享链接给好友，好友点击并停留5秒，分享者得 +20积分<br>
          · 好友点击链接并停留5秒，点击者得 +50积分<br>
          · 10积分 = 1元，可直接抵扣订单，可直接抵扣订单
        </div>
        <button class="btn-outline-full" style="margin-top:20px" onclick="generateShare()">生成分享链接</button>
        <div id="shareResult" style="margin-top:16px;display:none">
          <div style="padding:12px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;font-size:13px;color:#10B981" id="shareLink"></div>
          <button class="btn-primary-full" style="margin-top:10px" onclick="copyShare()">复制链接</button>
        </div>
      </div>
    `, true);
  };

  window.generateShare = async function() {
    try {
      const data = await apiFetch('/shares', { method: 'POST' });
      if (!data) return;
      const link = `${window.location.origin}/?share_code=${data.share_code}`;
      document.getElementById('shareLink').textContent = link;
      document.getElementById('shareResult').style.display = 'block';
    } catch (err) {
      showToast('生成分享链接失败: ' + err.message, 'error');
    }
  };

  window.copyShare = function() {
    const text = document.getElementById('shareLink').textContent;
    navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板', 'success'));
  };

  // ========== 我的订单 ==========
  window.showOrders = async function() {
    if (!currentUser) { showLoginModal(); return; }
    const modal = createModal('ordersModal', '我的订单', `
      <div class="orders-loading" style="padding:40px;text-align:center;color:var(--w50)">加载中...</div>
    `, true);

    try {
      const data = await apiFetch('/orders');
      const el = modal.querySelector('.modal-body');
      if (!data || !data.items || data.items.length === 0) {
        el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--w50)">暂无订单，<a href="#products" onclick="closeModal(\'ordersModal\')" style="color:var(--gold-light)">去逛逛</a></div>';
        return;
      }
      const statusMap = {
        pending: { text: '待支付', color: '#F59E0B' },
        paid: { text: '已支付', color: '#3B82F6' },
        processing: { text: '处理中', color: '#8B5CF6' },
        shipped: { text: '已发货', color: '#06B6D4' },
        delivered: { text: '已送达', color: '#10B981' },
        cancelled: { text: '已取消', color: '#EF4444' }
      };
      el.innerHTML = `
        <div class="orders-list" style="max-height:500px;overflow-y:auto">
          ${data.items.map(order => `
            <div style="border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:12px;background:rgba(255,255,255,0.03)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <span style="font-size:12px;color:var(--w50)">${order.order_no}</span>
                <span style="font-size:12px;font-weight:600;color:${statusMap[order.status]?.color || '#fff'}">${statusMap[order.status]?.text || order.status}</span>
              </div>
              <div style="font-size:13px;color:var(--w70);margin-bottom:8px">收货人: ${order.recipient_name} · ${order.recipient_phone}</div>
              ${order.items.map(item => `
                <div style="display:flex;gap:10px;padding:8px 0;border-top:1px solid rgba(255,255,255,0.05);font-size:13px">
                  <span style="flex:1;color:var(--w85)">${item.product_name} × ${item.quantity}</span>
                  <span style="color:var(--gold-light)">¥${item.subtotal}</span>
                </div>
              `).join('')}
              <div style="text-align:right;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05)">
                <span style="color:var(--w50);font-size:12px">实付 </span>
                <span style="font-weight:700;font-size:16px;background:var(--gold-grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">¥${order.final_amount}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      modal.querySelector('.modal-body').innerHTML = `<div style="padding:40px;text-align:center;color:#EF4444">加载失败: ${err.message}</div>`;
    }
  };

  // ========== 商品加载 (API) ==========
  async function loadProducts() {
    try {
      const data = await apiFetch('/products?page_size=20');
      if (!data || !data.items) return;
      renderProducts(data.items);
    } catch (err) {
      console.error('商品加载失败:', err);
    }
  }

  // 本地图片映射（根据商品slug匹配）
  const localImageMap = {
    'cafiator-mug': '啡行咖LOGO.png',
    'pour-over-kit': '挂耳包.jpg',
    'huila': 'atc.png',
    'yirgacheffe': 'CAPTAIN_MAGIC.jpg',
    'coffee-storage-jar': '加油时刻.png',
    'coffee-grinder': '个人收藏.jpg',
    'brazil': '巡航时刻.jpg'
  };

  // slug→中文名映射（用于匹配HTML里的产品卡片）
  const slugNameMap = {
    'cafiator-mug': '啡行咖马克杯',
    'pour-over-kit': '手冲咖啡套装',
    'huila': '哥伦比亚惠兰',
    'yirgacheffe': '埃塞俄比亚耶加雪菲',
    'coffee-storage-jar': '咖啡豆储存罐',
    'coffee-grinder': '家用咖啡研磨机',
    'brazil': '巴西咖啡豆'
  };

  function getProductImage(product) {
    // 优先用API返回的图片
    if (product.image_url) return product.image_url;
    // fallback到本地图片
    return localImageMap[product.slug] || 'CAPTAIN_MAGIC.jpg';
  }

  function renderProducts(products) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    grid.innerHTML = products.map(p => `
      <div class="product-card glass-card" data-product-id="${p.id}" data-slug="${p.slug}">
        <div class="product-image-wrap">
          <img src="${getProductImage(p)}" alt="${p.name}" class="product-image" onerror="this.src='CAPTAIN_MAGIC.jpg'">
        </div>
        <div class="product-info">
          <span class="product-tag roast-dark">${p.unit || '件'}</span>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.description || ''}</p>
          <div class="product-footer">
            <span class="product-price">¥${p.price}${p.original_price ? `<span style="text-decoration:line-through;color:var(--w30);font-size:12px;margin-left:6px">¥${p.original_price}</span>` : ''} <span style="font-size:12px;color:var(--w50)">/ ${p.unit || '件'}</span></span>
            <button class="add-cart-btn" aria-label="加入购物车" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${getProductImage(p)}">+</button>
          </div>
        </div>
      </div>
    `).join('');

    // 重新绑定动画
    const newCards = grid.querySelectorAll('.product-card');
    newCards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = `all 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`;
      observer.observe(card);
    });

    // 绑定加入购物车
    grid.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { id, name, price, image } = btn.dataset;
        addToCart({ id: parseInt(id), name, price: parseFloat(price), image, quantity: 1 });
        btn.style.transform = 'scale(0.9)';
        btn.textContent = '✓';
        btn.style.background = '#10B981';
        setTimeout(() => { btn.style.transform = 'scale(1)'; btn.textContent = '+'; btn.style.background = ''; }, 1500);
      });
    });
  }

  // ========== 购物车 ==========
  function updateCartBadge() {
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);
  }

  function addToCart(item) {
    const idx = cart.findIndex(i => i.id === item.id);
    if (idx >= 0) cart[idx].quantity += 1;
    else cart.push({ ...item });
    saveCart(cart);
    updateCartBadge();
    openCart();
    showToast(`「${item.name}」已加入购物车`, 'success');
  }

  window.addToCartFromBtn = function(btn) {
    const card = btn.closest('.product-card');
    const name = card.querySelector('.product-name').textContent.trim();
    const price = card.querySelector('.product-price').textContent.replace('¥', '').split('/')[0].trim();
    const img = card.querySelector('.product-image').src;
    const id = card.dataset.productId;
    if (!id) return;
    addToCart({ id: parseInt(id), name, price: parseFloat(price), image: img, quantity: 1 });
    btn.style.transform = 'scale(0.9)';
    btn.textContent = '✓';
    btn.style.background = '#10B981';
    setTimeout(() => { btn.style.transform = 'scale(1)'; btn.textContent = '+'; btn.style.background = ''; }, 1500);
  };

  function openCart() {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('show');
    document.body.style.overflow = 'hidden';
    renderCart();
  }

  function closeCart() {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('show');
    document.body.style.overflow = '';
  }

  function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    const totalEl = document.getElementById('totalPrice');
    if (!cartItemsEl) return;
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    document.getElementById('cartCount').textContent = count;
    if (totalEl) totalEl.textContent = `¥${total}`;

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<div class="cart-empty">购物车是空的</div>';
      return;
    }
    cartItemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='CAPTAIN_MAGIC.jpg'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">¥${item.price}</div>
          <div class="cart-item-controls">
            <button class="quantity-btn" onclick="changeQty(${i}, -1)">−</button>
            <span class="cart-item-quantity">${item.quantity}</span>
            <button class="quantity-btn" onclick="changeQty(${i}, 1)">+</button>
            <button class="cart-item-remove" onclick="removeItem(${i})">×</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.changeQty = function(idx, delta) {
    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    saveCart(cart);
    updateCartBadge();
    renderCart();
  };

  window.removeItem = function(idx) {
    cart.splice(idx, 1);
    saveCart(cart);
    updateCartBadge();
    renderCart();
  };

  // 结算
  document.getElementById('checkoutBtn')?.addEventListener('click', handleCheckout);
  document.getElementById('cartIcon')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

  async function handleCheckout() {
    if (cart.length === 0) { showToast('购物车是空的', 'error'); return; }
    if (!currentUser) { closeCart(); showLoginModal(); return; }
    closeCart();
    showCheckoutModal();
  }

  function showCheckoutModal() {
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    createModal('checkoutModal', '确认订单', `
      <form id="checkoutForm" onsubmit="submitOrder(event)">
        <div style="margin-bottom:16px;padding:12px;background:rgba(255,255,255,0.04);border-radius:8px">
          <div style="font-size:12px;color:var(--w50);margin-bottom:8px">订单商品</div>
          ${cart.map(i => `<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${i.name} × ${i.quantity}</span><span>¥${i.price * i.quantity}</span></div>`).join('')}
          <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:8px;padding-top:8px;text-align:right;font-weight:700;font-size:15px">合计: <span style="background:var(--gold-grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">¥${total}</span></div>
        </div>
        <div class="form-group">
          <label>收货人姓名 *</label>
          <input type="text" name="recipient_name" required placeholder="请输入收货人姓名" value="${currentUser?.full_name || ''}">
        </div>
        <div class="form-group">
          <label>联系电话 *</label>
          <input type="tel" name="recipient_phone" required placeholder="请输入手机号" value="${currentUser?.phone || ''}">
        </div>
        <div class="form-group">
          <label>收货地址 *</label>
          <input type="text" name="recipient_address" required placeholder="省/市/区+详细地址" value="${currentUser?.address || ''}">
        </div>
        <div class="form-group">
          <label>备注（选填）</label>
          <input type="text" name="remark" placeholder="特殊要求等">
        </div>
        <div class="form-error" id="orderError" style="color:#EF4444;font-size:13px;margin-bottom:12px;display:none"></div>
        <button type="submit" class="btn-primary-full">提交订单</button>
      </form>
    `, true);
  }

  window.submitOrder = async function(e) {
    e.preventDefault();
    const form = e.target;
    const errEl = document.getElementById('orderError');
    const fd = new FormData(form);
    const payload = {
      items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
      recipient_name: fd.get('recipient_name'),
      recipient_phone: fd.get('recipient_phone'),
      recipient_address: fd.get('recipient_address'),
      remark: fd.get('remark') || undefined
    };
    try {
      const order = await apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
      if (!order) return;
      cart = [];
      saveCart([]);
      updateCartBadge();
      closeModal('checkoutModal');
      showToast(`订单提交成功！订单号: ${order.order_no}`, 'success');
      setTimeout(() => showOrders(), 800);
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  };

  // ========== 分享码处理 ==========
  (function handleShareCode() {
    const params = new URLSearchParams(window.location.search);
    const shareCode = params.get('share_code');
    if (shareCode) {
      apiFetch('/shares/click', {
        method: 'POST',
        body: JSON.stringify({ share_code: shareCode, user_id: currentUser?.id })
      }).then(data => {
        if (data && data.rewards) {
          let msg = '';
          if (data.rewards.sharer) msg += `分享者获得${data.rewards.sharer}积分 `;
          if (data.rewards.clicker) msg += `点击者获得${data.rewards.clicker}积分 `;
          if (msg) showToast(msg, 'success');
        }
      }).catch(() => {});
      // 清理URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  })();

  // ========== 初始化 ==========
  updateUserUI();
  updateCartBadge();
  loadProducts();

  console.log('✈ 啡行咖 CAFIATOR 已加载');

})();

// ========== 样式补充 ==========
const style = document.createElement('style');
style.textContent = `
@keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateX(20px); } }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9998; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.3s; }
.modal-overlay.active { opacity: 1; }
.modal-box { background: #0B1929; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 28px; animation: modalIn 0.3s ease; }
@keyframes modalIn { from { transform: scale(0.95) translateY(20px); } to { transform: scale(1) translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal-header h3 { font-size: 18px; font-weight: 600; color: #fff; }
.modal-close { background: none; border: none; color: #888; font-size: 24px; cursor: pointer; padding: 0; line-height: 1; }
.modal-close:hover { color: #fff; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 6px; font-weight: 500; }
.form-group input, .form-group textarea { width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-group input:focus, .form-group textarea:focus { border-color: rgba(212,175,55,0.5); }
.form-group input::placeholder { color: rgba(255,255,255,0.3); }
.btn-primary-full { width: 100%; padding: 13px; background: var(--gold-grad); border: none; border-radius: 999px; color: #0B1929; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.btn-primary-full:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(212,175,55,0.35); }
.btn-outline-full { width: 100%; padding: 13px; background: transparent; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 999px; color: rgba(255,255,255,0.8); font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.btn-outline-full:hover { border-color: rgba(212,175,55,0.5); color: var(--gold-light); }
.user-dropdown { position: relative; }
.user-btn.user-name-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; }
.user-btn.user-name-btn:hover { border-color: rgba(212,175,55,0.4); }
.user-avatar { width: 28px; height: 28px; background: var(--gold-grad); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #0B1929; }
.user-name { font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500; }
.user-points { font-size: 11px; background: rgba(212,175,55,0.15); color: var(--gold-light); padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(212,175,55,0.25); }
.user-dropdown-menu { position: absolute; top: calc(100% + 8px); right: 0; min-width: 160px; background: rgba(11,25,41,0.98); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 8px; display: none; box-shadow: 0 12px 40px rgba(0,0,0,0.4); z-index: 100; }
.user-dropdown-menu.show { display: block; }
.user-dropdown-menu a { display: block; padding: 10px 14px; font-size: 13px; color: rgba(255,255,255,0.75); border-radius: 8px; text-decoration: none; transition: background 0.2s; }
.user-dropdown-menu a:hover { background: rgba(255,255,255,0.06); }
`;
document.head.appendChild(style);
