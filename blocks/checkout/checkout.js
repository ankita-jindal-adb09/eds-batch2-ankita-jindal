import {
  clearCart, formatMoney as money, getCart, getCartTotals, unitPrice,
} from '../../scripts/cart.js';

const ORDERS_KEY = 'essence-orders';
const PROFILE_KEY = 'essence-profile';
const ACCOUNT_URL = '/capstone/my-account';
const LISTING_URL = '/capstone/product-listing';
const CART_URL = '/capstone/cart';

const ICONS = {
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v13h14V9h-2zm-8-2a3 3 0 0 1 6 0v2H9V7zm4 10.7V19h-2v-1.3a2 2 0 1 1 2 0z"/></svg>',
  truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h11v9h1.5l1.8-4H21l1 3v4h-2a2.5 2.5 0 0 1-5 0H9.5a2.5 2.5 0 0 1-5 0H3V5zm4 13.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10.5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>',
  card: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm2 2h16V6H4v2zm0 3v7h16v-7H4zm2 4h5v2H6v-2z"/></svg>',
  upi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 3v13h10V5H7zm4 14.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0zM9 8h6v2H9V8zm0 4h4v2H9v-2z"/></svg>',
  cash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6h20v12H2V6zm2 2v8h16V8H4zm8 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM5 9h2v2H5V9zm12 4h2v2h-2v-2z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3z"/></svg>',
  return: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 16.2-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
};

const PAYMENT_METHODS = [
  {
    id: 'card', label: 'Credit / Debit card', hint: 'Visa, Mastercard, RuPay, Amex', icon: 'card',
  },
  {
    id: 'upi', label: 'UPI', hint: 'Google Pay, PhonePe, Paytm', icon: 'upi',
  },
  {
    id: 'cod', label: 'Cash on delivery', hint: 'Pay when your order arrives', icon: 'cash',
  },
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(name, className = 'checkout-icon') {
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

function createField({
  name, label, type = 'text', autocomplete, placeholder, pattern, minLength, maxLength,
  inputMode, message, multiline, full,
}) {
  const wrapper = el('div', `checkout-field${full ? ' checkout-field-full' : ''}`);
  const id = `checkout-${name}`;
  const labelEl = el('label', '', label);
  labelEl.htmlFor = id;

  const input = document.createElement(multiline ? 'textarea' : 'input');
  input.id = id;
  input.name = name;
  input.required = true;
  if (multiline) input.rows = 3;
  else input.type = type;
  if (autocomplete) input.autocomplete = autocomplete;
  if (placeholder) input.placeholder = placeholder;
  if (pattern) input.pattern = pattern;
  if (minLength) input.minLength = minLength;
  if (maxLength) input.maxLength = maxLength;
  if (inputMode) input.inputMode = inputMode;

  const error = el('p', 'checkout-error');
  error.id = `${id}-error`;
  error.setAttribute('aria-live', 'polite');
  input.setAttribute('aria-describedby', error.id);
  input.dataset.message = message;

  wrapper.append(labelEl, input, error);
  return wrapper;
}

// textarea ignores the pattern attribute, so minLength is checked manually for it too
function isFieldValid(input) {
  if (input.disabled) return true;
  const value = input.value.trim();
  if (!value) return false;
  if (input.minLength > 0 && value.length < input.minLength) return false;
  return input.checkValidity();
}

function showError(input) {
  const field = input.closest('.checkout-field');
  const valid = isFieldValid(input);
  input.setAttribute('aria-invalid', String(!valid));
  field?.classList.toggle('is-invalid', !valid);
  const error = field?.querySelector('.checkout-error');
  if (error) error.textContent = valid ? '' : input.dataset.message;
  return valid;
}

function createSteps() {
  const steps = el('ol', 'checkout-steps');
  [['Cart', 'done'], ['Details', 'active'], ['Payment', 'active'], ['Confirmation', '']]
    .forEach(([label, state], index) => {
      const step = el('li', state ? `is-${state}` : '');
      const dot = el('span', 'checkout-step-dot');
      if (state === 'done') dot.append(icon('check', 'checkout-step-icon'));
      else dot.textContent = String(index + 1);
      step.append(dot, el('span', 'checkout-step-label', label));
      steps.append(step);
    });
  return steps;
}

function createCardHeading(iconName, text, step) {
  const heading = el('div', 'checkout-card-heading');
  heading.append(el('span', 'checkout-card-step', String(step)), el('h2', '', text), icon(iconName));
  return heading;
}

function createDeliveryCard(profile) {
  const card = el('section', 'checkout-card');
  const grid = el('div', 'checkout-fields');
  grid.append(
    createField({
      name: 'username',
      label: 'Full name',
      autocomplete: 'name',
      placeholder: 'e.g. Ankita Jindal',
      minLength: 2,
      maxLength: 60,
      pattern: "[A-Za-z][A-Za-z .'\\-]*",
      message: 'Please enter your full name (letters only).',
    }),
    createField({
      name: 'contact',
      label: 'Contact number',
      type: 'tel',
      autocomplete: 'tel-national',
      placeholder: '10-digit mobile number',
      pattern: '[0-9]{10}',
      inputMode: 'numeric',
      message: 'Enter a valid 10-digit mobile number.',
    }),
    createField({
      name: 'address',
      label: 'Address',
      autocomplete: 'street-address',
      placeholder: 'House no., building, street, area, city',
      minLength: 10,
      maxLength: 200,
      multiline: true,
      full: true,
      message: 'Please enter your complete address (at least 10 characters).',
    }),
    createField({
      name: 'pincode',
      label: 'Pincode',
      autocomplete: 'postal-code',
      placeholder: '6-digit pincode',
      pattern: '[1-9][0-9]{5}',
      inputMode: 'numeric',
      message: 'Enter a valid 6-digit pincode.',
    }),
  );

  grid.querySelectorAll('input, textarea').forEach((input) => {
    if (typeof profile[input.name] === 'string') input.value = profile[input.name];
  });

  card.append(createCardHeading('truck', 'Delivery details', 1), grid);
  return card;
}

function createPaymentDetails(method) {
  const details = el('div', 'checkout-payment-details');
  const grid = el('div', 'checkout-fields');
  if (method === 'card') {
    grid.append(
      createField({
        name: 'cardNumber',
        label: 'Card number',
        autocomplete: 'cc-number',
        placeholder: '1234 5678 9012 3456',
        pattern: '[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}',
        inputMode: 'numeric',
        full: true,
        message: 'Enter a valid 16-digit card number.',
      }),
      createField({
        name: 'cardExpiry',
        label: 'Expiry (MM/YY)',
        autocomplete: 'cc-exp',
        placeholder: 'MM/YY',
        pattern: '(0[1-9]|1[0-2])/[0-9]{2}',
        inputMode: 'numeric',
        message: 'Enter expiry as MM/YY.',
      }),
      createField({
        name: 'cardCvv',
        label: 'CVV',
        type: 'password',
        autocomplete: 'cc-csc',
        placeholder: '•••',
        pattern: '[0-9]{3,4}',
        inputMode: 'numeric',
        message: 'Enter the 3 or 4 digit CVV.',
      }),
    );
    details.append(grid);
  } else if (method === 'upi') {
    grid.append(createField({
      name: 'upiId',
      label: 'UPI ID',
      placeholder: 'yourname@bank',
      pattern: '[A-Za-z0-9._\\-]{2,}@[A-Za-z]{2,}',
      full: true,
      message: 'Enter a valid UPI ID, e.g. name@okbank.',
    }));
    details.append(grid);
  } else {
    details.append(el('p', 'checkout-note', 'Please keep the exact amount ready. Our delivery partner will collect payment at your doorstep.'));
  }
  return details;
}

function createPaymentCard() {
  const card = el('section', 'checkout-card');
  const options = el('div', 'checkout-methods');
  options.setAttribute('role', 'radiogroup');
  options.setAttribute('aria-label', 'Payment method');

  const panels = {};
  PAYMENT_METHODS.forEach((method, index) => {
    const option = el('label', 'checkout-method');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'payment';
    radio.value = method.id;
    radio.checked = index === 0;

    const text = el('span', 'checkout-method-text');
    text.append(el('strong', '', method.label), el('small', '', method.hint));
    option.append(radio, icon(method.icon, 'checkout-method-icon'), text);
    options.append(option);
    panels[method.id] = createPaymentDetails(method.id);
  });

  const panelWrap = el('div', 'checkout-payment-panel');
  const showPanel = (methodId) => {
    Object.entries(panels).forEach(([id, panel]) => {
      const active = id === methodId;
      panel.hidden = !active;
      // Hidden payment fields must not block submission
      panel.querySelectorAll('input').forEach((input) => { input.disabled = !active; });
    });
  };
  panelWrap.append(...Object.values(panels));
  options.addEventListener('change', (e) => showPanel(e.target.value));
  showPanel(PAYMENT_METHODS[0].id);

  card.append(createCardHeading('lock', 'Payment method', 2), options, panelWrap);
  return card;
}

function createSummary(cart, totals, banner) {
  const summary = el('aside', 'checkout-summary');
  if (banner) summary.append(banner);

  const head = el('div', 'checkout-summary-head');
  const edit = el('a', 'checkout-edit', 'Edit cart');
  edit.href = CART_URL;
  head.append(el('h2', '', 'Order summary'), edit);
  summary.append(head);

  const list = el('ul', 'checkout-items');
  cart.forEach((item) => {
    const row = el('li', 'checkout-item');
    const media = el('div', 'checkout-item-image');
    if (typeof item.image === 'string' && item.image.trim()) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name || '';
      img.loading = 'lazy';
      img.addEventListener('error', () => img.remove());
      media.append(img);
    }
    media.append(el('span', 'checkout-item-qty', String(item.quantity)));
    const info = el('div', 'checkout-item-info');
    info.append(
      el('p', 'checkout-item-name', item.name || 'Product'),
      el('p', 'checkout-item-unit', `${money(unitPrice(item))} × ${item.quantity}`),
    );
    row.append(media, info, el('p', 'checkout-item-total', money(unitPrice(item) * item.quantity)));
    list.append(row);
  });
  summary.append(list);

  const rows = el('dl', 'checkout-rows');
  [
    [`Subtotal (${totals.count} ${totals.count === 1 ? 'item' : 'items'})`, money(totals.subtotal)],
    ['Shipping', totals.shipping === 0 ? 'FREE' : money(totals.shipping)],
    ['Estimated tax', money(totals.tax)],
  ].forEach(([label, amount]) => {
    const line = el('div', 'checkout-row');
    line.append(el('dt', '', label), el('dd', '', amount));
    rows.append(line);
  });
  const totalLine = el('div', 'checkout-row checkout-row-total');
  totalLine.append(el('dt', '', 'Total'), el('dd', '', money(totals.total)));
  rows.append(totalLine);
  summary.append(rows);

  const pay = el('button', 'checkout-pay');
  pay.type = 'submit';
  pay.append(icon('lock', 'checkout-pay-icon'), el('span', 'checkout-pay-label', `Pay ${money(totals.total)}`));
  summary.append(pay);

  const trust = el('ul', 'checkout-trust');
  [['shield', 'Secure payments'], ['truck', 'Tracked delivery'], ['return', '7-day returns']]
    .forEach(([name, text]) => {
      const li = el('li');
      li.append(icon(name), el('span', '', text));
      trust.append(li);
    });
  summary.append(trust);
  return summary;
}

function renderEmpty(block) {
  const empty = el('div', 'checkout-empty');
  empty.append(
    el('h2', '', 'Your cart is empty'),
    el('p', '', 'Add a fragrance to your cart before checking out.'),
  );
  const link = el('a', 'checkout-primary-link', 'Start shopping');
  link.href = LISTING_URL;
  empty.append(link);
  block.append(empty);
}

function formatInputs(form) {
  const onInput = (name, format) => form.querySelector(`[name="${name}"]`)
    ?.addEventListener('input', (e) => { e.target.value = format(e.target.value.replace(/\D/g, '')); });
  onInput('contact', (d) => d.replace(/^(91(?=\d{10}$)|0(?=\d{10}$))/, '').slice(0, 10));
  onInput('pincode', (d) => d.slice(0, 6));
  onInput('cardCvv', (d) => d.slice(0, 4));
  onInput('cardNumber', (d) => d.slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '));
  onInput('cardExpiry', (d) => {
    const digits = d.slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  });
}

function placeOrder(form, cart, totals) {
  const data = new FormData(form);
  const profile = {
    username: data.get('username').trim(),
    contact: data.get('contact').trim(),
    address: data.get('address').trim(),
    pincode: data.get('pincode').trim(),
  };
  const method = PAYMENT_METHODS.find((m) => m.id === data.get('payment')) || PAYMENT_METHODS[0];
  const order = {
    id: `EL${Date.now().toString().slice(-8)}`,
    date: new Date().toISOString(),
    status: method.id === 'cod' ? 'Confirmed' : 'Paid',
    payment: method.label,
    customer: profile,
    items: cart.map(({
      id, name, price, image, quantity,
    }) => ({
      id, name, price, image, quantity,
    })),
    totals,
  };
  // Card and UPI details are intentionally never persisted
  const saved = readJSON(ORDERS_KEY, []);
  const orders = [order, ...(Array.isArray(saved) ? saved : [])];
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  clearCart();
  return order;
}

function showSuccess(block, order) {
  const overlay = el('div', 'checkout-success');
  overlay.setAttribute('role', 'status');
  const box = el('div', 'checkout-success-box');
  box.append(
    icon('check', 'checkout-success-icon'),
    el('h2', '', 'Payment successful!'),
    el('p', '', `Order #${order.id} has been placed.`),
    el('p', 'checkout-success-redirect', 'Taking you to My Account…'),
  );
  overlay.append(box);
  block.append(overlay);
}

export default function decorate(block) {
  // An optional authored picture becomes a promo banner in the summary
  const picture = block.querySelector('picture');
  let banner;
  if (picture) {
    banner = el('div', 'checkout-banner');
    banner.append(picture);
  }

  const cart = getCart().filter((item) => item && item.quantity > 0);
  block.replaceChildren();

  const header = el('div', 'checkout-header');
  const title = el('div', 'checkout-title');
  const secure = el('p', 'checkout-secure');
  secure.append(icon('shield'), el('span', '', '100% secure checkout'));
  title.append(el('h1', '', 'Checkout'), secure);
  header.append(title, createSteps());
  block.append(header);

  if (!cart.length) {
    renderEmpty(block);
    return;
  }

  const totals = getCartTotals(cart);
  const form = el('form', 'checkout-layout');
  form.noValidate = true;
  const main = el('div', 'checkout-main');
  main.append(createDeliveryCard(readJSON(PROFILE_KEY, {}) || {}), createPaymentCard());
  form.append(main, createSummary(cart, totals, banner));
  block.append(form);
  formatInputs(form);

  const fieldSelector = 'input:not([type="radio"]), textarea';
  form.addEventListener('focusout', (e) => {
    if (e.target.matches(fieldSelector) && e.target.value) showError(e.target);
  });
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') showError(e.target);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pay = form.querySelector('.checkout-pay');
    if (pay.disabled) return;

    const fields = [...form.querySelectorAll(fieldSelector)];
    const firstInvalid = fields.map((f) => [f, showError(f)]).find(([, ok]) => !ok)?.[0];
    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    pay.disabled = true;
    pay.classList.add('is-loading');
    pay.querySelector('.checkout-pay-label').textContent = 'Processing payment…';

    // Simulated payment gateway round-trip
    setTimeout(() => {
      const order = placeOrder(form, cart, totals);
      showSuccess(block, order);
      setTimeout(() => { window.location.href = ACCOUNT_URL; }, 1800);
    }, 1500);
  });
}
