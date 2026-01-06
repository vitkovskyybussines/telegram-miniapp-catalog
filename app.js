const tg = window.Telegram.WebApp;
tg.expand();

let cart = [];

fetch('./products.json')
  .then(r => r.json())
  .then(products => {
    const container = document.getElementById('products');

    products.forEach(p => {
      const btn = document.createElement('button');
      btn.innerText = `${p.name} (${p.weight})`;
      btn.onclick = () => {
        cart.push(p);
        alert(`${p.name} додано`);
      };
      container.appendChild(btn);
    });
  });

document.getElementById('submit').onclick = () => {
  if (!cart.length) {
    alert('Кошик порожній');
    return;
  }

  tg.sendData(JSON.stringify({
    items: cart.map(i => ({
      name: i.name,
      weight: i.weight,
      qty: 1
    }))
  }));

  tg.close();
};
