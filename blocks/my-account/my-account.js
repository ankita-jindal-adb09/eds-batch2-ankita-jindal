import { formatMoney as money, unitPrice } from '../../scripts/cart.js';

const ORDERS_KEY = 'essence-orders';
const PROFILE_KEY = 'essence-profile';
const HOME_URL = '/capstone/';
const LISTING_URL = '/capstone/product-listing';
const DELIVERY_MIN_DAYS = 4;
const DELIVERY_MAX_DAYS = 5;
const CONFETTI_COLORS = ['#6c42a0', '#c9a227', '#e86a92', '#2bb673', '#9a6fd0', '#f2b84b'];

const ICONS = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 16.2-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7V6a5 5 0 0 1 10 0v1h3l1 15H3L4 7h3zm2 0h6V6a3 3 0 0 0-6 0v1z"/></svg>',
  box: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 9 4.5v11L12 22l-9-4.5v-11L12 2zm0 2.2L6.2 7 12 9.8 17.8 7 12 4.2zM5 8.6v7.7l6 3V11.6l-6-3zm14 0-6 3v7.7l6-3V8.6z"/></svg>',
  truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h11v9h1.5l1.8-4H21l1 3v4h-2a2.5 2.5 0 0 1-5 0H9.5a2.5 2.5 0 0 1-5 0H3V5zm4 13.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10.5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>',
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 12h3v8h5v-6h4v6h5v-8h3L12 3z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm11 8H6v10h12V10zM8 12h3v3H8v-3z"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.5.6 3.6a1 1 0 0 1-.3 1l-2.2 2.2z"/></svg>',
};

// Celebration illustration: smiling shopping bag with hearts and sparkles
const HAPPY_ART = `<svg viewBox="0 0 240 200" role="img" aria-label="Happy shopping bag celebrating your order">
  <defs>
    <linearGradient id="ma-bag" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8b5cc6"/><stop offset="1" stop-color="#4a2a6b"/>
    </linearGradient>
    <linearGradient id="ma-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6d77a"/><stop offset="1" stop-color="#c9a227"/>
    </linearGradient>
  </defs>
  <ellipse cx="120" cy="186" rx="70" ry="8" fill="#4a2a6b" opacity=".12"/>
  <path d="M92 62a28 28 0 0 1 56 0" fill="none" stroke="url(#ma-gold)" stroke-width="8" stroke-linecap="round"/>
  <rect x="62" y="58" width="116" height="122" rx="18" fill="url(#ma-bag)"/>
  <rect x="62" y="58" width="116" height="18" rx="9" fill="#fff" opacity=".12"/>
  <circle cx="100" cy="112" r="7" fill="#fff"/><circle cx="140" cy="112" r="7" fill="#fff"/>
  <circle cx="102" cy="110" r="2.5" fill="#2d1846"/><circle cx="142" cy="110" r="2.5" fill="#2d1846"/>
  <circle cx="88" cy="130" r="7" fill="#e86a92" opacity=".55"/><circle cx="152" cy="130" r="7" fill="#e86a92" opacity=".55"/>
  <path d="M104 132q16 18 32 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
  <path class="ma-float" d="M38 64c-6-8-18-2-12 8l12 12 12-12c6-10-6-16-12-8z" fill="#e86a92"/>
  <path class="ma-float ma-delay" d="M206 92c-4-6-13-1-9 6l9 9 9-9c4-7-5-12-9-6z" fill="#e86a92" opacity=".8"/>
  <path class="ma-twinkle" d="M196 30l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="url(#ma-gold)"/>
  <path class="ma-twinkle ma-delay" d="M44 128l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="url(#ma-gold)"/>
  <circle class="ma-twinkle" cx="170" cy="22" r="4" fill="#9a6fd0"/>
  <circle class="ma-twinkle ma-delay" cx="60" cy="30" r="3" fill="#2bb673"/>
</svg>`;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(name, className = 'account-icon') {
  const span = el('span', className);
  span.innerHTML = ICONS[name];
  return span;
}

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (e) {
    return fallback;
  }
}

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const formatDay = (date) => date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const formatFull = (date) => date.toLocaleDateString('en-IN', {
  day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
});

function deliveryWindow(order) {
  const placed = toDate(order.date);
  return [addDays(placed, DELIVERY_MIN_DAYS), addDays(placed, DELIVERY_MAX_DAYS)];
}

function createConfetti() {
  const confetti = el('div', 'account-confetti');
  confetti.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 36; i += 1) {
    const piece = el('span');
    piece.style.setProperty('--x', `${Math.random() * 100}%`);
    piece.style.setProperty('--delay', `${(Math.random() * 1.5).toFixed(2)}s`);
    piece.style.setProperty('--duration', `${(2.6 + Math.random() * 1.8).toFixed(2)}s`);
    piece.style.setProperty('--rotate', `${Math.round(Math.random() * 360)}deg`);
    piece.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    confetti.append(piece);
  }
  return confetti;
}

function createHero(order, name, picture) {
  const hero = el('section', 'account-hero');
  hero.append(createConfetti());

  const art = el('div', 'account-hero-art');
  if (picture) art.append(picture);
  else art.innerHTML = HAPPY_ART;

  const text = el('div', 'account-hero-text');
  const badge = el('p', 'account-badge');
  badge.append(icon('check'), el('span', '', order.status === 'Paid' ? 'Payment successful' : 'Order confirmed'));
  const firstName = name ? name.split(' ')[0] : '';
  text.append(
    badge,
    el('h1', '', 'Thank you for shopping with us!'),
    el('p', 'account-hero-lead', `${firstName ? `${firstName}, your` : 'Your'} order has been placed and our perfumers are already wrapping it with love.`),
  );

  const meta = el('dl', 'account-hero-meta');
  [['Order ID', `#${order.id}`], ['Placed on', formatFull(toDate(order.date))], ['Payment', order.payment || '—']]
    .forEach(([label, value]) => {
      const item = el('div');
      item.append(el('dt', '', label), el('dd', '', value));
      meta.append(item);
    });

  const actions = el('div', 'account-actions');
  const home = el('a', 'account-btn account-btn-primary');
  home.href = HOME_URL;
  home.append(icon('home'), el('span', '', 'Back to home'));
  const shop = el('a', 'account-btn account-btn-ghost', 'Continue shopping');
  shop.href = LISTING_URL;
  actions.append(home, shop);

  text.append(meta, actions);
  hero.append(art, text);
  return hero;
}

function createDelivery(order) {
  const [from, to] = deliveryWindow(order);
  const card = el('section', 'account-card account-delivery');
  const heading = el('div', 'account-card-heading');
  heading.append(icon('truck'), el('h2', '', 'Delivery details'));

  const eta = el('div', 'account-eta');
  eta.append(
    icon('calendar', 'account-eta-icon'),
    el('p', 'account-eta-label', 'Estimated delivery'),
    el('p', 'account-eta-date', `${formatDay(from)} – ${formatDay(to)}`),
    el('p', 'account-eta-note', `Arrives in ${DELIVERY_MIN_DAYS}–${DELIVERY_MAX_DAYS} business days`),
  );

  const steps = el('ol', 'account-tracker');
  [
    ['check', 'Order placed', formatDay(toDate(order.date)), 'is-done'],
    ['box', 'Packed', 'Within 24 hrs', 'is-current'],
    ['truck', 'Shipped', formatDay(addDays(toDate(order.date), 2)), ''],
    ['home', 'Delivered', `By ${formatDay(to)}`, ''],
  ].forEach(([name, label, when, state]) => {
    const step = el('li', state);
    const text = el('div', 'account-tracker-text');
    text.append(el('strong', '', label), el('small', '', when));
    step.append(icon(name, 'account-tracker-dot'), text);
    steps.append(step);
  });

  const customer = order.customer || {};
  const address = el('div', 'account-address');
  [
    ['user', customer.username],
    ['phone', customer.contact ? `+91 ${customer.contact}` : ''],
    ['pin', [customer.address, customer.pincode].filter(Boolean).join(' – ')],
  ].filter(([, value]) => value).forEach(([name, value]) => {
    const line = el('p');
    line.append(icon(name), el('span', '', value));
    address.append(line);
  });

  card.append(heading, eta, steps);
  if (address.children.length) {
    card.append(el('h3', 'account-subheading', 'Shipping to'), address);
  }
  return card;
}

function createItems(order) {
  const card = el('section', 'account-card account-items-card');
  const heading = el('div', 'account-card-heading');
  heading.append(icon('bag'), el('h2', '', 'Order summary'));

  const list = el('ul', 'account-items');
  (order.items || []).forEach((item) => {
    const row = el('li', 'account-item');
    const media = el('div', 'account-item-image');
    if (typeof item.image === 'string' && item.image.trim()) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name || '';
      img.loading = 'lazy';
      img.addEventListener('error', () => img.remove());
      media.append(img);
    }
    const info = el('div', 'account-item-info');
    info.append(
      el('p', 'account-item-name', item.name || 'Product'),
      el('p', 'account-item-unit', `Qty ${item.quantity} · ${money(unitPrice(item))} each`),
    );
    row.append(media, info, el('p', 'account-item-total', money(unitPrice(item) * item.quantity)));
    list.append(row);
  });

  const totals = order.totals || {};
  const rows = el('dl', 'account-rows');
  [
    ['Subtotal', money(totals.subtotal || 0)],
    ['Shipping', totals.shipping === 0 ? 'FREE' : money(totals.shipping || 0)],
    ['Tax', money(totals.tax || 0)],
  ].forEach(([label, value]) => {
    const line = el('div', 'account-row');
    line.append(el('dt', '', label), el('dd', '', value));
    rows.append(line);
  });
  const total = el('div', 'account-row account-row-total');
  total.append(el('dt', '', order.status === 'Paid' ? 'Total paid' : 'Total payable'), el('dd', '', money(totals.total || 0)));
  rows.append(total);

  card.append(heading, list, rows);
  return card;
}

function createHistory(orders) {
  const section = el('section', 'account-card account-history');
  const heading = el('div', 'account-card-heading');
  heading.append(icon('box'), el('h2', '', 'Your previous orders'));
  const list = el('ul', 'account-history-list');
  orders.forEach((order) => {
    const [, to] = deliveryWindow(order);
    const delivered = to < new Date();
    const row = el('li', 'account-history-item');
    const info = el('div');
    const count = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
    info.append(
      el('strong', '', `#${order.id}`),
      el('small', '', `${formatDay(toDate(order.date))} · ${count} ${count === 1 ? 'item' : 'items'}`),
    );
    row.append(
      info,
      el('span', `account-pill${delivered ? ' is-delivered' : ''}`, delivered ? 'Delivered' : `Arriving by ${formatDay(to)}`),
      el('strong', 'account-history-total', money(order.totals?.total || 0)),
    );
    list.append(row);
  });
  section.append(heading, list);
  return section;
}

function renderEmpty(block, profile) {
  const empty = el('section', 'account-empty');
  const art = el('div', 'account-hero-art');
  art.innerHTML = HAPPY_ART;
  const home = el('a', 'account-btn account-btn-primary');
  home.href = HOME_URL;
  home.append(icon('home'), el('span', '', 'Back to home'));
  const shop = el('a', 'account-btn account-btn-ghost', 'Start shopping');
  shop.href = LISTING_URL;
  const actions = el('div', 'account-actions');
  actions.append(home, shop);
  empty.append(
    art,
    el('h1', '', profile.username ? `Hello, ${profile.username.split(' ')[0]}!` : 'My Account'),
    el('p', '', 'You have no orders yet. Find a fragrance you will love.'),
    actions,
  );
  block.append(empty);
}

export default function decorate(block) {
  // An optional authored picture replaces the default celebration illustration
  const picture = block.querySelector('picture');
  block.replaceChildren();

  const savedOrders = readJSON(ORDERS_KEY, []);
  const orders = Array.isArray(savedOrders) ? savedOrders.filter((o) => o && o.id) : [];
  const profile = readJSON(PROFILE_KEY, {}) || {};

  if (!orders.length) {
    renderEmpty(block, profile);
    return;
  }

  const [latest, ...previous] = orders;
  const name = latest.customer?.username || profile.username || '';
  block.append(createHero(latest, name, picture));

  const grid = el('div', 'account-grid');
  grid.append(createDelivery(latest), createItems(latest));
  block.append(grid);
  if (previous.length) block.append(createHistory(previous));
}
