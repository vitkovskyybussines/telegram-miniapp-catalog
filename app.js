const tg = window.Telegram.WebApp;
tg.expand();

/* =====================
   STATE
===================== */

let products = [];
let categories = [];
let activeCategory = 'all';

let cart = {};
let screen = 'catalog';
let currentProductId = null;

const CART_KEY = 'cart';

/* =====================
   INIT
===================== */

fetch('./products.json')
  .then(r => r.json())
  .then(data => {
    products = data.products;
    categories = data.categories;
    loadCart();

    if (Object.keys(cart).length === 0) {
      screen = 'catalog';
    }

    render();
  });

/* =====================
   STORAGE
===================== */

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) cart = JSON.parse(saved);
  } catch {
    cart = {};
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function clearCart() {
  cart = {};
  localStorage.removeItem(CART_KEY);
}

/* =====================
   HELPERS
===================== */

function cartItemsCount() {
  return Object.keys(cart).length;
}

function updateQty(id, value) {
  if (!value || value <= 0) {
    delete cart[id];
  } else {
    cart[id] = value;
  }
  saveCart();
  render();
}

/* =====================
   ROOT RENDER
===================== */

function render() {
  if (screen === 'cart' && cartItemsCount() === 0) {
    screen = 'catalog';
  }

  document.getElementById('catalog-screen').style.display =
    screen === 'catalog' ? 'block' : 'none';

  document.getElementById('product-screen').style.display =
    screen === 'product' ? 'block' : 'none';

  document.getElementById('cart-screen').style.display =
    screen === 'cart' ? 'block' : 'none';

  renderCategories();
  renderProducts();
  renderProductScreen();
  renderBottomButton();
  renderCartScreen();
}

/* =====================
   CATEGORIES
===================== */

function renderCategories() {
  if (screen !== 'catalog') return;

  const root = document.getElementById('categories');
  root.innerHTML = '';

  categories.forEach(c => {
    const el = document.createElement('div');
    el.className = 'category' + (c.id === activeCategory ? ' active' : '');
    el.innerText = c.name;
    el.onclick = () => {
      activeCategory = c.id;
      renderProducts();
    };
    root.appendChild(el);
  });
}

/* =====================
   PRODUCTS
===================== */

function renderProducts() {
  if (screen !== 'catalog') return;

  const root = document.getElementById('products');
  root.innerHTML = '';

  products
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .forEach(p => {
      const qty = cart[p.id] || '';

      const el = document.createElement('div');
      el.className = 'product';

      el.innerHTML = `
        <img src="${p.image}" class="clickable" />
        <div class="product-info clickable">
          <div class="product-name">${p.name}</div>
          <div class="product-weight">${p.weight}</div>
        </div>
        <div class="controls">
          <button>-</button>
          <input type="number" min="0" value="${qty}" placeholder="0">
          <button>+</button>
        </div>
      `;

      el.querySelectorAll('.clickable').forEach(elm => {
        elm.onclick = () => {
          currentProductId = p.id;
          screen = 'product';
          render();
        };
      });

      const minus = el.querySelectorAll('button')[0];
      const input = el.querySelector('input');
      const plus = el.querySelectorAll('button')[1];

      minus.onclick = e => {
        e.stopPropagation();
        updateQty(p.id, (cart[p.id] || 0) - 1);
      };

      plus.onclick = e => {
        e.stopPropagation();
        updateQty(p.id, (cart[p.id] || 0) + 1);
      };

      input.onchange = e => {
        e.stopPropagation();
        updateQty(p.id, Number(input.value));
      };

      root.appendChild(el);
    });
}

/* =====================
   PRODUCT SCREEN
===================== */

function renderProductScreen() {
  if (screen !== 'product') return;

  const p = products.find(x => x.id == currentProductId);
  if (!p) return;

  const qty = cart[p.id] || 0;

  document.getElementById('product-content').innerHTML = `
    <img src="${p.image}" class="product-image" />
    <h3>${p.name}</h3>
    <div>${p.weight}</div>
    <p>${p.description || ''}</p>

    <div class="controls">
      <button>-</button>
      <input type="number" min="0" value="${qty}">
      <button>+</button>
    </div>

    <button id="back-product">⬅️ Повернутись до каталогу</button>
  `;

  const buttons = document.querySelectorAll('#product-content .controls button');
  const input = document.querySelector('#product-content input');

  buttons[0].onclick = () => updateQty(p.id, qty - 1);
  buttons[1].onclick = () => updateQty(p.id, qty + 1);
  input.onchange = e => updateQty(p.id, Number(e.target.value));

  document.getElementById('back-product').onclick = () => {
    screen = 'catalog';
    render();
  };
}

/* =====================
   BOTTOM BUTTON
===================== */

function renderBottomButton() {
  const btn = document.getElementById('go-cart');
  const count = cartItemsCount();

  if (screen === 'catalog' && count > 0) {
    btn.style.display = 'block';
    btn.innerText = `Перейти до замовлення — ${count} позицій`;
    btn.onclick = () => {
      screen = 'cart';
      render();
    };
  } else {
    btn.style.display = 'none';
  }
}

/* =====================
   CART SCREEN
===================== */

function renderCartScreen() {
  if (screen !== 'cart') return;

  const list = document.getElementById('cart-items');
  list.innerHTML = '';

  Object.entries(cart).forEach(([id, qty]) => {
    const p = products.find(x => x.id == id);

    const row = document.createElement('div');
    row.className = 'cart-row';

    row.innerHTML = `
      <div class="cart-title">${p.name} (${p.weight})</div>

      <div class="cart-controls">
        <div class="controls">
          <button>-</button>
          <input type="number" min="0" value="${qty}">
          <button>+</button>
        </div>

        <button class="remove-btn">Видалити позицію</button>
      </div>
    `;

    const minus = row.querySelector('.controls button:nth-child(1)');
    const plus = row.querySelector('.controls button:nth-child(3)');
    const input = row.querySelector('.controls input');
    const removeBtn = row.querySelector('.remove-btn');

    minus.onclick = () => updateQty(id, qty - 1);
    plus.onclick = () => updateQty(id, qty + 1);
    input.onchange = e => updateQty(id, Number(e.target.value));

    removeBtn.onclick = () => {
      delete cart[id];
      saveCart();
      render();
    };

    list.appendChild(row);
  });
}

/* =====================
   ACTIONS
===================== */

document.getElementById('back').onclick = () => {
  screen = 'catalog';
  render();
};

document.getElementById('submit').onclick = () => {
  if (cartItemsCount() === 0) {
    alert('Кошик порожній');
    return;
  }

  const items = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id == id);
    return { name: p.name, weight: p.weight, qty };
  });

  tg.sendData(JSON.stringify({
    initData: tg.initData,
    items
  }));

  clearCart();
  tg.close();
};
