import { addToCart } from './cart.js';
import { createOptimizedPicture } from './aem.js';

const PRODUCTS_PATH = '/capstone/products.json';

export function createProductPicture(
  src,
  alt,
  eager = false,
  breakpoints = [{ media: '(min-width: 900px)', width: '600' }, { width: '750' }],
) {
  const url = new URL(src, window.location.href);
  const isAEMImage = url.origin === window.location.origin
    || /\.aem\.(page|live)$/.test(url.hostname);
  const picture = isAEMImage
    ? createOptimizedPicture(src, alt, eager, breakpoints)
    : document.createElement('picture');
  if (!isAEMImage) {
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    image.loading = eager ? 'eager' : 'lazy';
    picture.append(image);
  }
  const image = picture.querySelector('img');
  image.width = 600;
  image.height = 800;
  image.decoding = 'async';
  if (eager) image.fetchPriority = 'high';
  return picture;
}

const breadcrumbIcon = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;

export function createProductBreadcrumbs(items) {
  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'product-breadcrumbs';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');
  const trail = document.createElement('ol');
  items.forEach(({ label, href }, index) => {
    const item = document.createElement('li');
    if (index) {
      const separator = document.createElement('span');
      separator.className = 'product-breadcrumb-separator';
      separator.innerHTML = breadcrumbIcon('<path d="m9 5 7 7-7 7"/>');
      item.append(separator);
    }
    const content = document.createElement(href ? 'a' : 'span');
    if (href) {
      content.href = href;
      content.className = index ? 'product-breadcrumb-link' : 'product-home';
    } else {
      content.className = 'product-breadcrumb-current';
      content.setAttribute('aria-current', 'page');
    }
    if (!index && href) {
      content.setAttribute('aria-label', label);
      content.title = 'Back to home';
      content.innerHTML = breadcrumbIcon('<path d="m3 10 9-7 9 7"/><path d="M5 9v12h5v-7h4v7h5V9"/>');
    } else {
      content.textContent = label;
    }
    item.append(content);
    trail.append(item);
  });
  breadcrumb.append(trail);
  return breadcrumb;
}

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
