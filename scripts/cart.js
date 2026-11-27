const CART_KEY = 'essence-cart';
export const CART_UPDATED_EVENT = 'cart:updated';

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: getCartCount() }));
}

/**
 * Adds the selected quantity to the cart and notifies listeners (e.g. the header badge)
 * @param {{id: string, name?: string, price?: number}} product the product to add
 * @param {number} quantity positive whole number of units to add
 */
export function addToCart(product, quantity = 1) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new RangeError('Cart quantity must be a positive whole number');
  }
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  saveCart(cart);
}

/**
 * Sets the exact quantity of a cart line; zero removes it
 * @param {string} id product id
 * @param {number} quantity non-negative whole number
 */
export function setCartItemQuantity(id, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new RangeError('Cart quantity must be a non-negative whole number');
  }
  const cart = getCart()
    .map((item) => (item.id === id ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_FEE = 9.99;
const TAX_RATE = 0.08;

export const unitPrice = (item) => (Number.isFinite(item.price) ? item.price : 0);
export const formatMoney = (value) => `$${value.toFixed(2)}`;

/**
 * Computes the order totals shared by the cart and checkout pages
 * @param {Array<{price?: number, quantity: number}>} cart cart lines
 */
export function getCartTotals(cart) {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  return {
    count, subtotal, shipping, tax, total: subtotal + shipping + tax,
  };
}

export { CART_KEY };
