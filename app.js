const tg = window.Telegram.WebApp;
tg.expand();

let products = [];
let categories = [];
let activeCategory = 'all';

const CART_KEY = 'cart';
const COMMENT_KEY = 'comment';

let cart = {};
let confirmMode = false;

fetch('./products.json')
  .then(r => r.json())
  .then(data => {
    products = data.products;
    categories = data.categories;
    loadCart();
    renderCategories();
    renderProducts();
    renderCart();
  });

/* =====================
   Storage
===================== */

function loadCart() {
  try {
    const savedCart = localStorage.getItem(CART_KEY);
    const savedComment = localStorage.getItem(COMMENT_KEY);

    if (savedCart) cart = JSON.parse(savedCart);
    if (savedComment) {
      document.getElementById('comment').value = savedComment;
    }
  } catch {
    cart = {};
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  localStorage.setItem(
    COMMENT_KEY,
    document.getElementById('comment').value || ''
  );
}

function clearCart() {
  cart = {};
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(COMMENT_KEY);
}

/* =====================
   UI
===================== */

function renderCategories() {
  if (confirmMode) return;

  const root = document.getElementById('categories');
  root.style.display = 'flex';
  root.innerHTML = '';

  categories.forEach(c => {
    const el = document.createElement('div');
    el.className = 'category' + (c.id === activeCategory ? ' active' : '');
    el.innerText = c.name;
    el.onclick = () => {
      activeCategory = c.id;
      renderCategories();
      renderProducts();
    };
    root.appendChild(el);
  });
}

function renderProducts() {
  const root = document.getElementById('products');
  root.innerHTML = '';

  if (confirmMode) return;

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
          <div class="controls">
            <button>-</button>
            <input type="number" min="0" value="${qty}" placeholder="0">
            <button>+</button>
          </div>
        </div>
      `;

      const minus = el.querySelectorAll('button')[0];
      const input = el.querySelector('input');
      const plus = el.querySelectorAll('button')[1];

      minus.onclick = () => updateQty(p.id, (cart[p.id] || 0) - 1);
      plus.onclick = () => updateQty(p.id, (cart[p.id] || 0) + 1);
      input.onchange = () => updateQty(p.id, Number(input.value));

      root.appendChild(el);
    });
}

function renderCart() {
  const root = document.getElementById('cart-items');
  root.innerHTML = '';

  const items = Object.entries(cart);

  if (!items.length) {
    root.innerText = 'Кошик порожній';
    return;
  }

  items.forEach(([id, qty]) => {
    const p = products.find(x => x.id == id);

    const row = document.createElement('div');
    row.style.marginBottom = '6px';

    row.innerHTML = `
      <div><b>${p.name}</b> (${p.weight})</div>
      <div class="controls">
        <button>-</button>
        <input type="number" min="0" value="${qty}">
        <button>+</button>
        <button style="background:#d9534f">✕</button>
      </div>
    `;

    const buttons = row.querySelectorAll('button');
    const input = row.querySelector('input');

    buttons[0].onclick = () => updateQty(id, qty - 1);
    buttons[1].onclick = () => updateQty(id, qty + 1);
    buttons[2].onclick = () => removeItem(id);
    input.onchange = () => updateQty(id, Number(input.value));

    root.appendChild(row);
  });
}

/* =====================
   Logic
===================== */

function updateQty(id, value) {
  if (!value || value <= 0) {
    delete cart[id];
  } else {
    cart[id] = value;
  }
  saveCart();
  renderProducts();
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  saveCart();
  renderProducts();
  renderCart();
}

/* =====================
   Submit & Confirm
===================== */

document.getElementById('comment').oninput = saveCart;

document.getElementById('submit').onclick = () => {
  const entries = Object.entries(cart);
  if (!entries.length) {
    alert('Кошик порожній');
    return;
  }

  // 1️⃣ Перехід у режим підтвердження
  if (!confirmMode) {
    confirmMode = true;

    document.getElementById('categories').style.display = 'none';

    document.getElementById('products').innerHTML = `
      <div style="padding:10px">
        <h3>Підтвердження замовлення</h3>
        ${entries.map(([id, qty]) => {
          const p = products.find(x => x.id == id);
          return `<div>• ${p.name} (${p.weight}) × ${qty}</div>`;
        }).join('')}
        ${document.getElementById('comment').value
          ? `<br><b>Коментар:</b><br>${document.getElementById('comment').value}`
          : ''}
        <br><br>
        <button id="edit" style="width:100%;margin-bottom:8px">⬅️ Редагувати</button>
      </div>
    `;

    document.getElementById('submit').innerText = '✅ Підтвердити';

    document.getElementById('edit').onclick = () => {
      confirmMode = false;
      document.getElementById('submit').innerText = 'Оформити замовлення';
      renderCategories();
      renderProducts();
      renderCart();
    };

    return;
  }

  // 2️⃣ Підтверджено — відправка
  const payloadItems = entries.map(([id, qty]) => {
    const p = products.find(x => x.id == id);
    return {
      name: p.name,
      weight: p.weight,
      qty
    };
  });

  tg.sendData(JSON.stringify({
    initData: tg.initData,
    items: payloadItems,
    comment: document.getElementById('comment').value.trim()
  }));

  clearCart();
  tg.close();
};
