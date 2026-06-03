// Mobile nav
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const navMenu = document.getElementById('navMenu');
menuBtn?.addEventListener('click', () => navMenu.classList.add('open'));
closeBtn?.addEventListener('click', () => navMenu.classList.remove('open'));
document.querySelectorAll('.nav-link').forEach(l =>
  l.addEventListener('click', () => navMenu.classList.remove('open'))
);

// Testimonials slider
const track = document.getElementById('sliderTrack');
const slides = track ? track.children : [];
const dotsWrap = document.getElementById('dots');
const prev = document.getElementById('prevBtn');
const next = document.getElementById('nextBtn');

let perView = window.innerWidth <= 900 ? 1 : 3;
let index = 0;
const pages = () => Math.max(1, slides.length - perView + 1);

function render() {
  const offset = -(index * (100 / perView));
  track.style.transform = `translateX(${offset}%)`;
  [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === index));
}
function buildDots() {
  dotsWrap.innerHTML = '';
  for (let i = 0; i < pages(); i++) {
    const d = document.createElement('span');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => { index = i; render(); });
    dotsWrap.appendChild(d);
  }
}
if (track) {
  buildDots();
  render();
  prev.addEventListener('click', () => { index = (index - 1 + pages()) % pages(); render(); });
  next.addEventListener('click', () => { index = (index + 1) % pages(); render(); });
  setInterval(() => { index = (index + 1) % pages(); render(); }, 5000);
  window.addEventListener('resize', () => {
    const np = window.innerWidth <= 900 ? 1 : 3;
    if (np !== perView) { perView = np; index = 0; buildDots(); render(); }
  });
}

// Contact form
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  alert('Thanks! Your message has been sent.');
  e.target.reset();
});

// ===== Order menu + cart =====
const MENU_ITEMS = [
  { id:'h1', cat:'hot', name:'Espresso', desc:'Bold single shot with rich crema.', price:3.5, img:'images/hot-beverages.png' },
  { id:'h2', cat:'hot', name:'Cappuccino', desc:'Espresso topped with steamed milk foam.', price:4.5, img:'images/hot-beverages.png' },
  { id:'h3', cat:'hot', name:'Latte', desc:'Smooth espresso with velvety milk.', price:4.75, img:'images/hot-beverages.png' },
  { id:'c1', cat:'cold', name:'Iced Latte', desc:'Chilled espresso with cold milk and ice.', price:5.0, img:'images/cold-beverages.png' },
  { id:'c2', cat:'cold', name:'Cold Brew', desc:'Slow-steeped, naturally sweet and smooth.', price:5.25, img:'images/cold-beverages.png' },
  { id:'c3', cat:'cold', name:'Frappé', desc:'Creamy blended iced coffee treat.', price:5.5, img:'images/cold-beverages.png' },
  { id:'r1', cat:'refresh', name:'Strawberry Cooler', desc:'Icy strawberry refresher with mint.', price:4.25, img:'images/refreshment.png' },
  { id:'r2', cat:'refresh', name:'Lemon Mojito', desc:'Zesty lemon, mint, and sparkling water.', price:4.0, img:'images/refreshment.png' },
  { id:'d1', cat:'dessert', name:'Strawberry Sundae', desc:'Whipped cream and fresh strawberries.', price:6.0, img:'images/desserts.png' },
  { id:'d2', cat:'dessert', name:'Chocolate Brownie', desc:'Warm fudgy brownie with cocoa drizzle.', price:5.5, img:'images/desserts.png' },
  { id:'f1', cat:'food', name:'Classic Burger', desc:'Beef patty with cheese, lettuce, and fries.', price:8.5, img:'images/burger-frenchfries.png' },
  { id:'f2', cat:'food', name:'Special Combo', desc:'Burger, fries, and a drink of your choice.', price:11.0, img:'images/special-combo.png' },
];

const itemsGrid = document.getElementById('itemsGrid');
const tabs = document.querySelectorAll('#menuTabs .tab');
let activeCat = 'hot';

function renderItems() {
  if (!itemsGrid) return;
  const list = MENU_ITEMS.filter(i => i.cat === activeCat);
  itemsGrid.innerHTML = list.map(i => `
    <div class="item-card">
      <div class="item-img"><img src="${i.img}" alt="${i.name}"></div>
      <h4>${i.name}</h4>
      <p class="desc">${i.desc}</p>
      <div class="item-foot">
        <span class="price">$${i.price.toFixed(2)}</span>
        <button class="add-btn" data-id="${i.id}"><i class="fa-solid fa-plus"></i> Add</button>
      </div>
    </div>
  `).join('');
  itemsGrid.querySelectorAll('.add-btn').forEach(b =>
    b.addEventListener('click', () => addToCart(b.dataset.id, b))
  );
}
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  activeCat = t.dataset.cat;
  renderItems();
}));
renderItems();

// Cart state
const cart = new Map();
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const toast = document.getElementById('toast');

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove('show'), 1800);
}
function addToCart(id, btn) {
  const item = MENU_ITEMS.find(i => i.id === id);
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(`${item.name} added to cart`);
  if (btn) {
    btn.classList.add('added');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
    setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add'; }, 900);
  }
}
function changeQty(id, delta) {
  const next = (cart.get(id) || 0) + delta;
  if (next <= 0) cart.delete(id); else cart.set(id, next);
  renderCart();
}
function renderCart() {
  let count = 0, total = 0;
  cart.forEach((q, id) => { const it = MENU_ITEMS.find(x => x.id === id); count += q; total += q * it.price; });
  cartCountEl.textContent = count;
  cartTotalEl.textContent = `$${total.toFixed(2)}`;
  if (cart.size === 0) {
    cartItemsEl.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
    return;
  }
  cartItemsEl.innerHTML = [...cart.entries()].map(([id, q]) => {
    const it = MENU_ITEMS.find(x => x.id === id);
    return `
      <div class="cart-item">
        <img src="${it.img}" alt="">
        <div class="info"><h5>${it.name}</h5><div class="p">$${it.price.toFixed(2)}</div></div>
        <div class="qty">
          <button data-act="dec" data-id="${id}">−</button>
          <span>${q}</span>
          <button data-act="inc" data-id="${id}">+</button>
        </div>
      </div>`;
  }).join('');
  cartItemsEl.querySelectorAll('.qty button').forEach(b =>
    b.addEventListener('click', () => changeQty(b.dataset.id, b.dataset.act === 'inc' ? 1 : -1))
  );
}
function openCart() { cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); }
function closeCart() { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); }
cartBtn?.addEventListener('click', openCart);
cartClose?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  if (cart.size === 0) return showToast('Your cart is empty');
  showToast('Order placed! Thank you ☕');
  cart.clear(); renderCart(); closeCart();
});
renderCart();
