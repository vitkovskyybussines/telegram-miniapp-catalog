const tg = window.Telegram.WebApp;
tg.expand();

let products = [];
let categories = [];
let activeCategory = 'all';
const cart = {};

fetch('./products.json')
  .then(r => r.json())
  .then(data => {
    products = data.products;
    categories = data.categories;
    renderCategories();
    renderProducts();
    renderCart();
  });

function renderCategories() {
  const root = document.getElementById('categories');
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
            <input type="number" min="0" placeholder="0" value="${qty}">
            <button>+</button>
          </div>
        </div>
      `;

      const minus = el.querySelectorAll('button')[0];
      const input = el.querySelector('input');
      const plus = el.querySelectorAll('button')[1];

      minus.onclick = () => {
        if (!cart[p.id]) return;
        cart[p.id]--;
        if (cart[p.id] <= 0) delete cart[p.id];
        renderProducts();
        renderCart();
      };

      plus.onclick = () => {
        cart[p.id] = (cart[p.id] || 0) + 1;
        renderProducts();
        renderCart();
      };

      input.onchange = () => {
        const value = Number(input.value);
        if (!value || value <= 0) {
          delete cart[p.id];
        } else {
          cart[p.id] = value;
        }
        renderProducts();
        renderCart();
      };

      root.appendChild(el);
    });
}

function renderCart() {
  const root = document.getElementById('cart-items');
  const items = Object.entries(cart);

  if (!items.length) {
    root.innerText = 'Кошик порожній';
    return;
  }

  root.innerHTML = items
    .map(([id, qty]) => {
      const p = products.find(x => x.id == id);
      return `• ${p.name} (${p.weight}) × ${qty}`;
    })
    .join('<br>');
}

document.getElementById('submit').onclick = () => {
  const items = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id == id);
    return {
      name: p.name,
      weight: p.weight,
      qty
    };
  });

  if (!items.length) {
    alert('Кошик порожній');
    return;
  }

  const comment = document.getElementById('comment').value.trim();

  tg.sendData(JSON.stringify({
    initData: tg.initData,
    items,
    comment
  }));

  tg.close();
};
