import { addToCart } from './cart.js';

const PRODUCTS_PATH = '/capstone/products.json';

export async function getProducts() {
  const response = await fetch(PRODUCTS_PATH);
  if (!response.ok) throw new Error(`Product request failed for ${PRODUCTS_PATH}: ${response.status}`);
  const json = await response.json();
  if (!Array.isArray(json.data)) throw new Error(`Invalid product catalog response from ${PRODUCTS_PATH}`);
  return json.data;
}

export function createCartItem(product) {
  return {
    id: product.Name,
    name: product.Name,
    price: parseFloat(product['Price ($)']),
    image: product.Image,
  };
}

export function createAddToCartButton(product, getQuantity = () => 1) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'product-add-to-cart';
  button.textContent = 'Add to cart';
  button.addEventListener('click', () => {
    addToCart(createCartItem(product), getQuantity());
    button.textContent = 'Added \u2713';
    setTimeout(() => { button.textContent = 'Add to cart'; }, 1500);
  });
  return button;
}
