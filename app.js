const tg = window.Telegram.WebApp;

let screen = 'catalog';
let category = 'Вся продукція';
let selectedProduct = null;

let cart = {};
let comment = '';

const categories = [
  'Вся продукція',
  'Сосиски та сардельки',
  'Варені ковбаси',
  'Напівкопчені ковбаси',
  'Мʼясні делікатеси'
];

const products = [
  { id: 1, name: 'Баварські сардельки', weight: '500г', category: 'Сосиски та сардельки', image: 'https://via.placeholder.com/400x300', description: 'Соковиті сардельки', composition: 'Свинина, спеції' },
  { id: 2, name: 'Сосиски молочні', weight: '400г', category: 'Сосиски та сардельки', image: 'https://via.placeholder.com/400x300', description: 'Ніжні сосиски', composition: 'Мʼясо, молоко' },

  { id: 3, name: 'Докторська', weight: '700г', category: 'Варені ковбаси', image: 'https://via.placeholder.com/400x300', description: 'Класична ковбаса', composition: 'Свинина, яловичина' },
  { id: 4, name: 'Молочна ковбаса', weight: '600г', category: 'Варені ковбаси', image: 'https://via.placeholder.com/400x300', description: 'Мʼякий смак', composition: 'Мʼясо, молоко' },

  { id: 5, name: 'Краківська', weight: '600г', category: 'Напівкопчені ковбаси', image: 'https://via.placeholder.com/400x300', description: 'Ароматна', composition: 'Спеції, мʼясо' },

  { id: 6, name: 'Бекон', weight: '100г', category: 'Мʼясні делікатеси', image: 'https://via.placeholder.com/400x300', description: 'Копчений бекон', composition: 'Свинина' }
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

        const info = document.createElement('div');
        info.className = 'product-info';
        info.innerHTML = `<strong>${p.name}</strong>${p.weight}`;
        info.onclick = () => {
          selectedProduct = p;
          screen = 'product';
          render();
        };

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
        row.append(info, controls);
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
        <img class="product-img" src="${p.image}">
        <p><strong>${p.weight}</strong></p>
        <p>${p.description}</p>
        <p><small>${p.composition}</small></p>

        <div class="action primary" onclick="addProduct(${p.id})">
          Додати в кошик
        </div>

        <div class="action secondary" onclick="backToCatalog()">
          Повернутись до каталогу
        </div>
      </div>
    `;
  }

  if (screen === 'cart') {
    title.textContent = 'Кошик';

    Object.entries(cart).forEach(([id, qty]) => {
      if (qty === 0) return;
      const p = products.find(x => x.id == id);

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div>
          <strong>${p.name}</strong><br>${p.weight}
        </div>
        <button class="delete" onclick="removeItem(${id})">
          Видалити позицію
        </button>
      `;
      content.appendChild(row);
    });

    const ta = document.createElement('textarea');
    ta.placeholder = 'Коментар до замовлення (необовʼязково)';
    ta.value = comment;
    ta.oninput = e => comment = e.target.value;
    content.appendChild(ta);

    const send = document.createElement('div');
    send.className = 'action primary';
    send.textContent = 'Оформити замовлення';
    send.onclick = sendOrder;

    const back = document.createElement('div');
    back.className = 'action secondary';
    back.textContent = 'Повернутись до каталогу';
    back.onclick = () => {
      screen = 'catalog';
      render();
    };

    content.append(send, back);
  }
}

function addProduct(id) {
  cart[id] = (cart[id] || 0) + 1;
  screen = 'catalog';
  render();
}

function backToCatalog() {
  screen = 'catalog';
  render();
}

function removeItem(id) {
  delete cart[id];
  render();
}

function sendOrder() {
  const items = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([id, q]) => {
      const p = products.find(x => x.id == id);
      return `${p.name} (${p.weight}) × ${q}`;
    });

  tg.sendData(JSON.stringify({
    items,
    comment
  }));

  cart = {};
  comment = '';
  screen = 'catalog';
  render();
}

render();
