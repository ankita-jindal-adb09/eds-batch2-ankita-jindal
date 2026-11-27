import {
  CART_KEY, CART_UPDATED_EVENT, FREE_SHIPPING_THRESHOLD, clearCart, formatMoney as money,
  getCart, getCartTotals, setCartItemQuantity, unitPrice as linePrice,
} from '../../scripts/cart.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createStepper(item) {
  const group = el('div', 'cart-qty');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', `Quantity for ${item.name}`);

  const minus = el('button', '', '-');
  minus.type = 'button';
  minus.setAttribute('aria-label', `Decrease quantity of ${item.name}`);
  minus.disabled = item.quantity <= 1;
  minus.addEventListener('click', () => setCartItemQuantity(item.id, item.quantity - 1));

  const plus = el('button', '', '+');
  plus.type = 'button';
  plus.setAttribute('aria-label', `Increase quantity of ${item.name}`);
  plus.addEventListener('click', () => setCartItemQuantity(item.id, item.quantity + 1));

  const value = el('output', '', String(item.quantity));
  group.append(minus, value, plus);
  return group;
}

function createItem(item) {
  const row = el('li', 'cart-item');
  const href = `/capstone/product-details?id=${encodeURIComponent(item.id)}`;

  const media = el('a', 'cart-item-image');
  media.href = href;
  if (typeof item.image === 'string' && item.image.trim()) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.loading = 'lazy';
    img.addEventListener('error', () => media.classList.add('no-image'));
    media.append(img);
  }

  const info = el('div', 'cart-item-info');
  const name = el('a', 'cart-item-name', item.name);
  name.href = href;
  const unit = el('p', 'cart-item-unit', `${money(linePrice(item))} each`);
  const remove = el('button', 'cart-item-remove', 'Remove');
  remove.type = 'button';
  remove.addEventListener('click', () => setCartItemQuantity(item.id, 0));
  info.append(name, unit, remove);

  const total = el('p', 'cart-item-total', money(linePrice(item) * item.quantity));

  row.append(media, info, createStepper(item), total);
  return row;
}

function createSummary(cart) {
  const {
    count, subtotal, shipping, tax, total,
  } = getCartTotals(cart);

  const summary = el('aside', 'cart-summary');
  summary.append(el('h2', '', 'Order summary'));

  const rows = el('dl', 'cart-summary-rows');
  [
    [`Subtotal (${count} ${count === 1 ? 'item' : 'items'})`, money(subtotal)],
    ['Shipping', shipping === 0 ? 'FREE' : money(shipping)],
    ['Estimated tax', money(tax)],
  ].forEach(([label, amount]) => {
    const line = el('div', 'cart-summary-row');
    line.append(el('dt', '', label), el('dd', '', amount));
    rows.append(line);
  });
  const totalLine = el('div', 'cart-summary-row cart-summary-total');
  totalLine.append(el('dt', '', 'Total'), el('dd', '', money(total)));
  rows.append(totalLine);
  summary.append(rows);

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  summary.append(el(
    'p',
    'cart-shipping-note',
    remaining > 0
      ? `Add ${money(remaining)} more for free shipping`
      : 'You qualify for free shipping',
  ));

  const checkout = el('a', 'cart-checkout', 'Proceed to checkout');
  checkout.href = '/capstone/checkout';
  const continueLink = el('a', 'cart-continue', 'Continue shopping');
  continueLink.href = '/capstone/product-listing';
  summary.append(checkout, continueLink);
  return summary;
}

function renderEmpty() {
  const empty = el('div', 'cart-empty');
  empty.append(el('h2', '', 'Your cart is empty'), el('p', '', 'Discover a fragrance you will love.'));
  const link = el('a', 'cart-continue-primary', 'Start shopping');
  link.href = '/capstone/product-listing';
  empty.append(link);
  return empty;
}

function render(block) {
  const cart = getCart().filter((item) => item && item.quantity > 0);
  block.replaceChildren();

  const header = el('div', 'cart-header');
  header.append(el('h1', '', 'My Cart'));
  if (!cart.length) {
    block.append(header, renderEmpty());
    return;
  }

  const clear = el('button', 'cart-clear', 'Clear cart');
  clear.type = 'button';
  clear.addEventListener('click', clearCart);
  header.append(clear);

  const list = el('ul', 'cart-items');
  cart.forEach((item) => list.append(createItem(item)));

  const layout = el('div', 'cart-layout');
  layout.append(list, createSummary(cart));
  block.append(header, layout);
}

export default function decorate(block) {
  // Content comes from local storage; ignore authored cells
  const refresh = () => render(block);
  window.addEventListener(CART_UPDATED_EVENT, refresh);
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY) refresh();
  });
  refresh();
}
