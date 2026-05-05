// 啡行咖 CAFIATOR - 白色飞机心形轨迹动画
(function() {
  const canvas = document.getElementById('planeTrailCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let width, height;
  let progress = 0;
  let trailPoints = [];
  
  // 心形参数方程
  function heartX(t) {
    return 16 * Math.pow(Math.sin(t), 3);
  }
  
  function heartY(t) {
    return -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
  }
  
  // 绘制白色飞机（简洁线条风格）
  function drawPlane(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // 白色发光效果
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 机身（椭圆形）
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 机头（尖锐）
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(25, 0);
    ctx.stroke();
    
    // 上机翼
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-12, -15);
    ctx.lineTo(-8, -15);
    ctx.lineTo(0, -3);
    ctx.closePath();
    ctx.fill();
    
    // 下机翼
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-12, 15);
    ctx.lineTo(-8, 15);
    ctx.lineTo(0, 3);
    ctx.closePath();
    ctx.fill();
    
    // 尾翼
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-22, -8);
    ctx.lineTo(-18, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-22, 8);
    ctx.lineTo(-18, 0);
    ctx.closePath();
    ctx.fill();
    
    // 窗户
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.ellipse(5, 0, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 绘制白色发光轨迹
  function drawTrail() {
    if (trailPoints.length < 2) return;
    
    // 外发光
    ctx.beginPath();
    ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
    for (let i = 1; i < trailPoints.length; i++) {
      ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
    }
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // 核心亮线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }
  
  // 绘制轨迹上的星星
  function drawStars() {
    for (let i = 0; i < trailPoints.length; i += 10) {
      const p = trailPoints[i];
      const twinkle = Math.sin(Date.now() * 0.003 + i * 0.3) * 0.4 + 0.6;
      const size = 2 + Math.sin(i * 0.2) * 1;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 5;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = 400;
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // 心形轨迹参数 - 居中显示
    const scale = Math.min(width, height) * 0.25;
    // 心形中心放在画布中央偏下
    const offsetX = width * 0.5;
    const offsetY = height * 0.6;
    
    // 慢慢增加进度
    progress += 0.008;
    const t = progress;
    
    // 当前飞机位置
    const planeX = offsetX + heartX(t) * scale;
    const planeY = offsetY + heartY(t) * scale;
    
    // 记录轨迹点
    if (trailPoints.length === 0 || 
        Math.hypot(planeX - trailPoints[trailPoints.length-1].x, planeY - trailPoints[trailPoints.length-1].y) > 3) {
      trailPoints.push({ x: planeX, y: planeY });
    }
    
    // 计算飞机朝向
    const dt = 0.15;
    const nextX = offsetX + heartX(t + dt) * scale;
    const nextY = offsetY + heartY(t + dt) * scale;
    const planeDir = Math.atan2(nextY - planeY, nextX - planeX);
    
    // 绘制轨迹和星星
    drawTrail();
    drawStars();
    
    // 绘制飞机
    drawPlane(planeX, planeY, planeDir);
    
    // 绕完一圈后停止
    if (progress >= Math.PI * 2) {
      drawTrail();
      drawStars();
      return;
    }
    
    requestAnimationFrame(animate);
  }
  
  // 事件监听
  window.addEventListener('resize', resize);
  
  // 启动
  resize();
  animate();
})();

// 啡行咖 CAFIATOR - 咖啡豆波浪效果
(function() {
  const canvas = document.getElementById('coffeeCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = 0, mouseY = 0;
  let time = 0;
  
  // 咖啡豆类
  class CoffeeBean {
    constructor(x, y, size, rotation, speed) {
      this.x = x;
      this.y = y;
      this.baseX = x;
      this.baseY = y;
      this.size = size;
      this.rotation = rotation;
      this.speed = speed;
      this.waveOffset = Math.random() * Math.PI * 2;
    }
    
    draw(alpha) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation + Math.sin(time * this.speed + this.waveOffset) * 0.2);
      
      // 咖啡豆主体
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(101, 67, 33, ${alpha})`;
      ctx.fill();
      
      // 咖啡豆中间那条缝
      ctx.beginPath();
      ctx.moveTo(0, -this.size * 0.5);
      ctx.quadraticCurveTo(this.size * 0.1, 0, 0, this.size * 0.5);
      ctx.strokeStyle = `rgba(60, 40, 20, ${alpha * 0.8})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 高光点
      ctx.beginPath();
      ctx.arc(-this.size * 0.3, -this.size * 0.2, this.size * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 180, ${alpha * 0.3})`;
      ctx.fill();
      
      ctx.restore();
    }
  }
  
  let beans = [];
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initBeans();
  }
  
  function initBeans() {
    beans = [];
    const count = Math.floor((width * height) / 7500);
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 15 + Math.random() * 20;
      const rotation = Math.random() * Math.PI;
      const speed = 0.5 + Math.random() * 1;
      beans.push(new CoffeeBean(x, y, size, rotation, speed));
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    time += 0.02;
    
    // 鼠标影响
    const centerX = width / 2;
    const centerY = height / 2;
    const mouseInfluence = Math.min(1, Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)) / (width * 0.6));
    
    beans.forEach((bean, i) => {
      // 基于时间和位置的波浪
      const waveX = Math.sin(time + bean.baseY * 0.01 + bean.waveOffset) * 15;
      const waveY = Math.cos(time * 0.7 + bean.baseX * 0.01 + bean.waveOffset) * 10;
      
      // 鼠标吸引效果（靠近鼠标的豆子会微微浮起）
      const dx = mouseX - bean.baseX;
      const dy = mouseY - bean.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mouseRadius = 200;
      
      let extraY = 0;
      if (dist < mouseRadius) {
        const force = (1 - dist / mouseRadius) * 30;
        extraY = -force * Math.sin(time * 2 + i);
      }
      
      bean.x = bean.baseX + waveX + dx * mouseInfluence * 0.1;
      bean.y = bean.baseY + waveY + extraY;
      
      // 透明度随距离鼠标远近变化
      const alpha = 0.4 + Math.sin(time + i * 0.5) * 0.2 + mouseInfluence * 0.3;
      bean.draw(Math.max(0.2, Math.min(1, alpha)));
    });
    
    requestAnimationFrame(animate);
  }
  
  // 事件监听
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // 启动
  resize();
  animate();
})();

// 啡行咖 CAFIATOR - iOS风格交互
document.addEventListener('DOMContentLoaded', () => {
  
  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // 导航栏滚动效果
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      navbar.style.background = 'rgba(11, 25, 41, 0.95)';
      navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.background = 'rgba(11, 25, 41, 0.8)';
      navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
  });

  // 产品卡片动画
  const productCards = document.querySelectorAll('.product-card');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  productCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    observer.observe(card);
  });

  // 加入购物车
  const addCartBtns = document.querySelectorAll('.add-cart-btn');
  addCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const name = card.querySelector('.product-name').textContent;
      
      // 动画反馈
      btn.style.transform = 'scale(0.9)';
      btn.textContent = '✓';
      btn.style.background = '#10B981';
      
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
        btn.textContent = '+';
        btn.style.background = '';
      }, 1500);
      
      console.log(`已加入购物车: ${name}`);
    });
  });

  // Hero区域入场动画
  const heroContent = document.querySelector('.hero-content');
  const heroVisual = document.querySelector('.hero-visual');
  
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(40px)';
    heroContent.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 200);
  }
  
  if (heroVisual) {
    heroVisual.style.opacity = '0';
    heroVisual.style.transform = 'translateX(40px)';
    heroVisual.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s';
    
    setTimeout(() => {
      heroVisual.style.opacity = '1';
      heroVisual.style.transform = 'translateX(0)';
    }, 400);
  }

  // 积分卡片动画
  const pointCards = document.querySelectorAll('.point-card');
  pointCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.5s ease ${0.2 + index * 0.1}s`;
    
    const pointObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.2 });
    
    pointObserver.observe(card);
  });

  // 品牌故事入场动画
  const storySection = document.querySelector('.story');
  const storyImage = storySection?.querySelector('.story-image');
  const storyText = storySection?.querySelector('.story-text');
  
  if (storyImage) {
    storyImage.style.opacity = '0';
    storyImage.style.transform = 'translateX(-40px)';
    storyImage.style.transition = 'all 0.8s ease';
  }
  
  if (storyText) {
    storyText.style.opacity = '0';
    storyText.style.transform = 'translateX(40px)';
    storyText.style.transition = 'all 0.8s ease 0.2s';
  }
  
  const storyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (storyImage) {
          storyImage.style.opacity = '1';
          storyImage.style.transform = 'translateX(0)';
        }
        if (storyText) {
          storyText.style.opacity = '1';
          storyText.style.transform = 'translateX(0)';
        }
      }
    });
  }, { threshold: 0.2 });
  
  if (storySection) {
    storyObserver.observe(storySection);
  }

  // 导航高亮
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (pageYOffset >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  console.log('✈ 啡行咖 CAFIATOR 已加载');

  // ============================================
  // 购物车功能
  // ============================================
  let cart = [];

  const cartIcon = document.getElementById('cartIcon');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const totalPrice = document.getElementById('totalPrice');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // 产品数据
  const products = {
    '机长珍藏': { price: 128, image: 'CAPTAIN MAGIC.png' },
    '塔台特调': { price: 118, image: 'atc.png' },
    '巡航配方': { price: 138, image: '巡航配方主图.jpg' },
    '加油时刻': { price: 148, image: '加油时刻主图.jpg' },
    '私人订制': { price: 528, image: 'CABINCREW.png' },
    '初航体验': { price: 268, image: '挂耳包.jpg' }
  };

  // 打开购物车
  function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // 关闭购物车
  function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  cartIcon.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // 更新购物车UI
  function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;

    if (cart.length === 0) {
      cartItems.innerHTML = '<div class="cart-empty">购物车是空的</div>';
      totalPrice.textContent = '¥0';
      return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      html += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">¥${item.price}</div>
            <div class="cart-item-controls">
              <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">−</button>
              <span class="cart-item-quantity">${item.quantity}</span>
              <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
              <button class="cart-item-remove" onclick="removeFromCart(${index})">×</button>
            </div>
          </div>
        </div>
      `;
    });

    cartItems.innerHTML = html;
    totalPrice.textContent = `¥${total}`;
  }

  // 添加到购物车
  function addToCart(name, price, image) {
    const existingIndex = cart.findIndex(item => item.name === name);

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ name, price, image, quantity: 1 });
    }

    updateCartUI();
    openCart();
  }

  // 修改数量
  window.changeQuantity = function(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    updateCartUI();
  };

  // 移除商品
  window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
  };

  // 结算按钮
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('购物车是空的');
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    alert(`订单总计：¥${total}\n感谢您的购买！`);
    cart = [];
    updateCartUI();
    closeCart();
  });

  // 绑定产品卡片加入购物车
  addCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const name = card.querySelector('.product-name').textContent.trim();

      // 从名称匹配产品数据
      let productKey = Object.keys(products).find(key => name.includes(key));
      if (productKey) {
        const product = products[productKey];

        // 动画反馈
        btn.style.transform = 'scale(0.9)';
        btn.textContent = '✓';
        btn.style.background = '#10B981';

        setTimeout(() => {
          btn.style.transform = 'scale(1)';
          btn.textContent = '+';
          btn.style.background = '';
        }, 1500);

        addToCart(productKey, product.price, product.image);
      }
    });
  });
});
