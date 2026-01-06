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

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id == id);
    return sum + p.price * qty;
  }, 0);
}

function formatPrice(v) {
  return v.toLocaleString('uk-UA') + ' UZS';
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
   RENDER
===================== */

function render() {
  document.getElementById('catalog-screen').style.display =
    screen === 'catalog' ? 'block' : 'none';
  document.getElementById('cart-screen').style.display =
    screen === 'cart' ? 'block' : 'none';

  renderCategories();
  renderProducts();
  renderBottomButton();
  renderCartScreen();
}

/* =====================
   CATALOG
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
        <img src="${p.image}" />
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-weight">${p.weight}</div>
          <div class="product-price">${formatPrice(p.price)}</div>
          <div class="controls">
            <button>-</button>
            <input type="number" min="0" value="${qty}">
            <button>+</button>
          </div>
        </div>
      `;

      const [minus, plus] = el.querySelectorAll('button');
      const input = el.querySelector('input');

      minus.onclick = () => updateQty(p.id, (cart[p.id] || 0) - 1);
      plus.onclick = () => updateQty(p.id, (cart[p.id] || 0) + 1);
      input.onchange = () => updateQty(p.id, Number(input.value));

      root.appendChild(el);
    });
}

/* =====================
   BOTTOM BUTTON
===================== */

function renderBottomButton() {
  const btn = document.getElementById('go-cart');
  const count = cartItemsCount();

  if (screen === 'catalog' && count > 0) {
    btn.style.display = 'block';
    btn.innerText = `Перейти до замовлення — ${count} позицій • ${formatPrice(cartTotal())}`;
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
      <b>${p.name}</b> (${p.weight})<br>
      ${formatPrice(p.price)} × ${qty} = <b>${formatPrice(p.price * qty)}</b>
      <div class="controls">
        <button>-</button>
        <input type="number" min="0" value="${qty}">
        <button>+</button>
        <button class="remove">✕</button>
      </div>
    `;

    const [minus, plus, remove] = row.querySelectorAll('button');
    const input = row.querySelector('input');

    minus.onclick = () => updateQty(id, qty - 1);
    plus.onclick = () => updateQty(id, qty + 1);
    remove.onclick = () => {
      delete cart[id];
      saveCart();
      render();
    };
    input.onchange = () => updateQty(id, Number(input.value));

    list.appendChild(row);
  });

  document.getElementById('cart-total').innerText =
    'Разом: ' + formatPrice(cartTotal());
}

/* =====================
   ACTIONS
===================== */

document.getElementById('back').onclick = () => {
  screen = 'catalog';
  render();
};

document.getElementById('submit').onclick = () => {
  const items = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id == id);
    return {
      name: p.name,
      qty,
      price: p.price
    };
  });

  tg.sendData(JSON.stringify({
    initData: tg.initData,
    items,
    total: cartTotal()
  }));

  clearCart();
  tg.close();
};
