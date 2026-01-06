const tg = window.Telegram.WebApp;

let screen = 'catalog';
let selectedProduct = null;
let cart = {};

const products = [
  {
    id: 1,
    name: 'Сосиски молочні',
    weight: '400г',
    image: 'https://via.placeholder.com/600x400?text=Сосиски',
    description: 'Ніжні молочні сосиски',
    composition: 'Мʼясо, молоко'
  },
  {
    id: 2,
    name: 'Баварські сардельки',
    weight: '500г',
    image: 'https://via.placeholder.com/600x400?text=Сардельки',
    description: 'Соковиті баварські сардельки',
    composition: 'Свинина, спеції'
  },
  {
    id: 3,
    name: 'Бекон',
    weight: '100г',
    image: 'https://via.placeholder.com/600x400?text=Бекон',
    description: 'Копчений бекон',
    composition: 'Свинина'
  }
];

function render() {
  const title = document.getElementById('title');
  const content = document.getElementById('content');
  content.innerHTML = '';

  if (screen === 'catalog') {
    title.textContent = 'Зробити замовлення';

    products.forEach(product => {
      const row = document.createElement('div');
      row.className = 'product';

      const img = document.createElement('img');
      img.src = product.image;
      img.onclick = () => openProduct(product);

      const info = document.createElement('div');
      info.className = 'product-info';
      info.innerHTML = `
        <strong>${product.name}</strong><br>
        ${product.weight}
      `;
      info.onclick = () => openProduct(product);

      row.appendChild(img);
      row.appendChild(info);
      content.appendChild(row);
    });
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

        <div class="button" onclick="addToCart(${p.id})">
          Додати в кошик
        </div>

        <div class="button secondary" onclick="goBack()">
          Назад
        </div>
      </div>
    `;
  }
}

function openProduct(product) {
  selectedProduct = product;
  screen = 'product';
  render();
}

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  screen = 'catalog';
  render();
}

function goBack() {
  screen = 'catalog';
  render();
}

render();
