const tg = window.Telegram.WebApp;
tg.expand();

const categories = [
  'Вся продукція',
  'Сосиски та сардельки',
  'Варені ковбаси',
  'Напівкопчені ковбаси',
  'Мʼясні делікатеси'
];

const products = [
  {
    id: 1,
    name: 'Баварські сардельки',
    weight: '500г',
    category: 'Сосиски та сардельки',
    image: 'https://via.placeholder.com/600x400?text=Баварські+сардельки',
    description: 'Соковиті сардельки з ніжним смаком.'
  },
  {
    id: 2,
    name: 'Сосиски молочні',
    weight: '400г',
    category: 'Сосиски та сардельки',
    image: 'https://via.placeholder.com/600x400?text=Сосиски+молочні',
    description: 'Класичні молочні сосиски.'
  },
  {
    id: 3,
    name: 'Докторська',
    weight: '700г',
    category: 'Варені ковбаси',
    image: 'https://via.placeholder.com/600x400?text=Докторська',
    description: 'Традиційна варена ковбаса.'
  },
  {
    id: 4,
    name: 'Бекон',
    weight: '100г',
    category: 'Мʼясні делікатеси',
    image: 'https://via.placeholder.com/600x400?text=Бекон',
    description: 'Ароматний мʼясний бекон.'
  }
];

let cart = {};
let screen = 'catalog';
let activeCategory = 'Вся продукція';
let currentProduct = null;
let comment = '';

const categoriesEl = document.getElementById('categories');
const contentEl = document.getElementById('content');
const footerEl = document.getElementById('footer');
const titleEl = document.getElementById('title');

function render() {
  categoriesEl.style.display = screen === 'catalog' ? 'flex' : 'none';
  footerEl.classList.remove('show');

  if (screen === 'catalog') renderCatalog();
  if (screen === 'product') renderProduct();
  if (screen === 'cart') renderCart();
}

function renderCatalog() {
  titleEl.textContent = 'Зробити замовлення';
  categoriesEl.innerHTML = '';
  contentEl.innerHTML = '';

  categories.forEach(c => {
    const el = document.createElement('div');
    el.className = 'category' + (c === activeCategory ? ' active' : '');
    el.textContent = c;
    el.onclick = () => {
      activeCategory = c;
      render();
    };
    categoriesEl.appendChild(el);
  });

  const list = activeCategory === 'Вся продукція'
    ? products
    : products.filter(p => p.category === activeCategory);

  list.forEach(p => {
    const qty = cart[p.id] || 0;

    const row = document.createElement('div');
    row.className = 'product';
    row.innerHTML = `
      <img src="${p.image}">
      <div class="product-info">
        <strong>${p.name}</strong><br>
        <small>${p.weight}</small>
      </div>
      <div class="controls">
        <button>-</button>
        <input type="number" min="0" value="${qty}">
        <button>+</button>
      </div>
    `;

    row.querySelector('img').onclick =
    row.querySelector('.product-info').onclick = () => {
      currentProduct = p;
      screen = 'product';
      render();
    };

    const [minus, input, plus] = row.querySelectorAll('.controls button, .controls input');
    minus.onclick = () => updateQty(p.id, qty - 1);
    plus.onclick = () => updateQty(p.id, qty + 1);
    input.onchange = e => updateQty(p.id, Number(e.target.value));

    contentEl.appendChild(row);
  });

  updateFooter();
}

function renderProduct() {
  titleEl.textContent = currentProduct.name;
  contentEl.innerHTML = `
    <div class="product-page">
      <img src="${currentProduct.image}">
      <div style="padding:16px">
        <h2>${currentProduct.name}</h2>
        <p><strong>${currentProduct.weight}</strong></p>
        <p>${currentProduct.description}</p>
      </div>
    </div>
  `;

  const qty = cart[currentProduct.id] || 0;

  const controls = document.createElement('div');
  controls.className = 'controls';
  controls.style.justifyContent = 'center';
  controls.innerHTML = `
    <button>-</button>
    <input type="number" min="0" value="${qty}">
    <button>+</button>
  `;

  const [minus, input, plus] = controls.querySelectorAll('button, input');
  minus.onclick = () => updateQty(currentProduct.id, qty - 1);
  plus.onclick = () => updateQty(currentProduct.id, qty + 1);
  input.onchange = e => updateQty(currentProduct.id, Number(e.target.value));

  contentEl.appendChild(controls);

  const addBtn = document.createElement('div');
  addBtn.className = 'button';
  addBtn.textContent = 'Додати в кошик';
  addBtn.onclick = () => {
    screen = 'catalog';
    render();
  };
  contentEl.appendChild(addBtn);

  const back = document.createElement('div');
  back.className = 'button back';
  back.textContent = 'Повернутись до каталогу';
  back.onclick = () => {
    screen = 'catalog';
    render();
  };
  contentEl.appendChild(back);
}

function renderCart() {
  titleEl.textContent = 'Кошик';
  contentEl.innerHTML = '';

  Object.keys(cart).forEach(id => {
    const p = products.find(x => x.id == id);
    const qty = cart[id];

    const row = document.createElement('div');
    row.className = 'product';
    row.innerHTML = `
      <div>
        <strong>${p.name}</strong><br>
        <small>${p.weight}</small>
      </div>
      <div class="controls">
        <button>-</button>
        <input type="number" min="1" value="${qty}">
        <button>+</button>
      </div>
    `;

    const [minus, input, plus] = row.querySelectorAll('button, input');
    minus.onclick = () => updateQty(p.id, qty - 1);
    plus.onclick = () => updateQty(p.id, qty + 1);
    input.onchange = e => updateQty(p.id, Number(e.target.value));

    contentEl.appendChild(row);
  });

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Коментар до замовлення (необовʼязково)';
  textarea.value = comment;
  textarea.onchange = e => comment = e.target.value;
  contentEl.appendChild(textarea);

  const submit = document.createElement('div');
  submit.className = 'button';
  submit.textContent = 'Оформити замовлення';
  submit.onclick = submitOrder;
  contentEl.appendChild(submit);

  const back = document.createElement('div');
  back.className = 'button back';
  back.textContent = 'Повернутись до каталогу';
  back.onclick = () => {
    screen = 'catalog';
    render();
  };
  contentEl.appendChild(back);
}

function updateQty(id, qty) {
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  render();
}

function updateFooter() {
  const count = Object.keys(cart).length;
  if (count === 0) return;

  footerEl.textContent = `Перейти до замовлення — ${count} позицій`;
  footerEl.classList.add('show');
  footerEl.onclick = () => {
    screen = 'cart';
    render();
  };
}

function submitOrder() {
  if (!confirm('Підтвердити замовлення?')) return;

  const items = Object.keys(cart).map(id => {
    const p = products.find(x => x.id == id);
    return { name: p.name, qty: cart[id], weight: p.weight };
  });

  tg.sendData(JSON.stringify({ items, comment }));
  cart = {};
  tg.close();
}

render();
