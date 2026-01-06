const tg = window.Telegram.WebApp;

let screen = 'catalog';
let category = 'Вся продукція';
let selectedProduct = null;

let cart = {};

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
    name: 'Сосиски молочні',
    weight: '400г',
    category: 'Сосиски та сардельки',
    image: 'https://via.placeholder.com/300x200',
    description: 'Ніжні сосиски',
    composition: 'Мʼясо, молоко'
  },
  {
    id: 2,
    name: 'Баварські сардельки',
    weight: '500г',
    category: 'Сосиски та сардельки',
    image: 'https://via.placeholder.com/300x200',
    description: 'Соковиті',
    composition: 'Свинина, спеції'
  },
  {
    id: 3,
    name: 'Докторська',
    weight: '700г',
    category: 'Варені ковбаси',
    image: 'https://via.placeholder.com/300x200',
    description: 'Класика',
    composition: 'Свинина, яловичина'
  },
  {
    id: 4,
    name: 'Бекон',
    weight: '100г',
    category: 'Мʼясні делікатеси',
    image: 'https://via.placeholder.com/300x200',
    description: 'Копчений бекон',
    composition: 'Свинина'
  }
];

function render() {
  const title = document.getElementById('title');
  const content = document.getElementById('content');
  const footer = document.getElementById('footer');

  content.innerHTML = '';
  footer.classList.add('hidden');

  if (screen === 'catalog') {
    title.textContent = 'Зробити замовлення';

    const tabs = document.createElement('div');
    tabs.className = 'tabs';

    categories.forEach(c => {
      const t = document.createElement('div');
      t.className = 'tab' + (c === category ? ' active' : '');
      t.textContent = c;
      t.onclick = () => {
        category = c;
        render();
      };
      tabs.appendChild(t);
    });

    content.appendChild(tabs);

    products
      .filter(p => category === 'Вся продукція' || p.category === category)
      .forEach(p => {
        const row = document.createElement('div');
        row.className = 'product';

        const img = document.createElement('img');
        img.src = p.image;
        img.onclick = () => openProduct(p);

        const info = document.createElement('div');
        info.className = 'product-info';
        info.innerHTML = `<strong>${p.name}</strong>${p.weight}`;
        info.onclick = () => openProduct(p);

        const controls = document.createElement('div');
        controls.className = 'controls';

        const minus = document.createElement('button');
        minus.className = 'btn';
        minus.textContent = '−';
        minus.onclick = () => {
          cart[p.id] = Math.max(0, (cart[p.id] || 0) - 1);
          render();
        };

        const count = document.createElement('div');
        count.className = 'count';
        count.textContent = cart[p.id] || 0;

        const plus = document.createElement('button');
        plus.className = 'btn';
        plus.textContent = '+';
        plus.onclick = () => {
          cart[p.id] = (cart[p.id] || 0) + 1;
          render();
        };

        controls.append(minus, count, plus);
        row.append(img, info, controls);
        content.appendChild(row);
      });

    const total = Object.values(cart).reduce((a, b) => a + b, 0);
    if (total > 0) {
      footer.textContent = `Перейти до замовлення — ${total} позицій`;
      footer.onclick = () => {
        screen = 'cart';
        render();
      };
      footer.classList.remove('hidden');
    }
  }

  if (screen === 'product') {
    const p = selectedProduct;
    title.textContent = p.name;

    content.innerHTML = `
      <div class="screen">
        <img class="product-img-large" src="${p.image}">
        <p><strong>${p.weight}</strong></p>
        <p>${p.description}</p>
        <p><small>${p.composition}</small></p>

        <div class="add-row">
          <div class="controls">
            <button class="btn" onclick="changeQty(${p.id}, -1)">−</button>
            <div class="count">${cart[p.id] || 0}</div>
            <button class="btn" onclick="changeQty(${p.id}, 1)">+</button>
          </div>

          <button class="add-btn" onclick="addFromProduct(${p.id})">
            Додати в кошик
          </button>
        </div>

        <div class="action secondary" onclick="backToCatalog()">
          Повернутись до каталогу
        </div>
      </div>
    `;
  }
}

function openProduct(p) {
  selectedProduct = p;
  screen = 'product';
  render();
}

function changeQty(id, delta) {
  cart[id] = Math.max(0, (cart[id] || 0) + delta);
  render();
}

function addFromProduct(id) {
  cart[id] = (cart[id] || 0) + 1;
  screen = 'catalog';
  render();
}

function backToCatalog() {
  screen = 'catalog';
  render();
}

render();
