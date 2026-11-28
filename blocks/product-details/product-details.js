import {
  getProducts, createAddToCartButton, createProductBreadcrumbs, createProductPicture,
} from '../../scripts/products-data.js';
import { FREE_SHIPPING_THRESHOLD } from '../../scripts/cart.js';

const LISTING_URL = '/capstone/product-listing';

function createBackLink() {
  const link = document.createElement('a');
  link.className = 'product-details-back';
  link.href = LISTING_URL;
  if (document.referrer) {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin
      && /\/capstone\/product-listing(?:\.html)?\/?$/.test(referrer.pathname)) {
      link.href = `${referrer.pathname}${referrer.search}${referrer.hash}`;
    }
  }
  link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m10 6-6 6 6 6M4 12h16"/></svg>';
  const label = document.createElement('span');
  label.textContent = 'Back to products';
  link.append(label);
  return link;
}

function createTextSection(title, text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  const section = document.createElement('section');
  section.className = 'product-details-section';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const description = document.createElement('p');
  description.className = 'product-details-description';
  description.textContent = text.trim();
  section.append(heading, description);
  return section;
}

function createSpecifications(product) {
  const fields = [
    ['Brand', 'Brand'],
    ['Gender', 'For'],
    ['Category', 'Fragrance family'],
    ['Size', 'Size'],
    ['Collection', 'Collections'],
    ['Concentration', 'Concentration'],
    ['Top Notes', 'Top notes'],
    ['Heart Notes', 'Heart notes'],
    ['Base Notes', 'Base notes'],
  ].filter(([field]) => typeof product[field] === 'string' && product[field].trim());
  if (!fields.length) return null;
  const section = document.createElement('section');
  section.className = 'product-details-section';
  const heading = document.createElement('h3');
  heading.textContent = 'Product details';
  const list = document.createElement('dl');
  list.className = 'product-details-specifications';
  fields.forEach(([field, label]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = label;
    const value = document.createElement('dd');
    value.textContent = product[field].trim();
    row.append(term, value);
    list.append(row);
  });
  section.append(heading, list);
  return section;
}

function createPurchaseControls(product) {
  let quantity = 1;
  const controls = document.createElement('div');
  controls.className = 'product-details-purchase';

  const selector = document.createElement('div');
  selector.className = 'product-details-quantity';
  selector.setAttribute('role', 'group');
  selector.setAttribute('aria-label', 'Quantity');

  const decrease = document.createElement('button');
  decrease.type = 'button';
  decrease.textContent = '-';
  decrease.setAttribute('aria-label', 'Decrease quantity');

  const value = document.createElement('output');
  value.setAttribute('aria-label', 'Quantity');
  value.setAttribute('aria-live', 'polite');

  const increase = document.createElement('button');
  increase.type = 'button';
  increase.textContent = '+';
  increase.setAttribute('aria-label', 'Increase quantity');

  const updateQuantity = (change) => {
    quantity = Math.max(1, quantity + change);
    value.value = String(quantity);
    decrease.disabled = quantity === 1;
  };
  decrease.addEventListener('click', () => updateQuantity(-1));
  increase.addEventListener('click', () => updateQuantity(1));
  updateQuantity(0);

  const addButton = createAddToCartButton(product, () => quantity);
  addButton.addEventListener('click', () => {
    quantity = 1;
    updateQuantity(0);
  });

  selector.append(decrease, value, increase);
  controls.append(selector, addButton);
  return controls;
}

function renderProduct(product) {
  const layout = document.createElement('div');
  layout.className = 'product-details-layout';

  const figure = document.createElement('div');
  figure.className = 'product-details-image';

  if (typeof product.Image === 'string' && product.Image.trim()) {
    const picture = createProductPicture(product.Image, product.Name, true, [
      { media: '(min-width: 900px)', width: '1200' }, { width: '750' },
    ]);
    picture.querySelector('img').addEventListener('error', () => figure.classList.add('no-image'));
    figure.append(picture);
  } else {
    const placeholder = document.createElement('p');
    placeholder.className = 'product-details-image-placeholder';
    placeholder.textContent = 'Image unavailable';
    figure.append(placeholder);
  }

  const info = document.createElement('div');
  info.className = 'product-details-info';

  const category = document.createElement('p');
  category.className = 'product-category';
  category.textContent = product.Category;

  const name = document.createElement('h2');
  name.className = 'product-details-name';
  name.textContent = product.Name;

  const price = document.createElement('p');
  price.className = 'product-details-price';
  price.textContent = `$${product['Price ($)']}`;

  info.append(category, name);
  const ratingValue = Number.parseFloat(product.Rating);
  if (Number.isFinite(ratingValue) && ratingValue >= 0 && ratingValue <= 5) {
    const rating = document.createElement('p');
    rating.className = 'product-rating';
    rating.textContent = `\u2605 ${ratingValue} / 5`;
    rating.setAttribute('aria-label', `Rated ${ratingValue} out of 5`);
    info.append(rating);
  }
  if (typeof product.Size === 'string' && product.Size.trim()) {
    const size = document.createElement('p');
    size.className = 'product-details-size';
    size.textContent = `Size: ${product.Size.trim()}`;
    info.append(size);
  }
  info.append(price);

  const highlights = typeof product['Product Highlights'] === 'string'
    ? product['Product Highlights'].split(',').map((value) => value.trim()).filter(Boolean)
    : [];
  if (highlights.length) {
    const list = document.createElement('ul');
    list.className = 'product-details-highlights';
    list.setAttribute('aria-label', 'Product highlights');
    highlights.forEach((highlight) => {
      const item = document.createElement('li');
      item.textContent = highlight;
      list.append(item);
    });
    info.append(list);
  }

  info.append(createPurchaseControls(product));
  const shipping = document.createElement('p');
  shipping.className = 'product-details-shipping';
  shipping.textContent = `Complimentary shipping on orders of $${FREE_SHIPPING_THRESHOLD} or more.`;
  info.append(shipping);

  const descriptionText = [product['Extended Description'], product.Description]
    .find((value) => typeof value === 'string' && value.trim());
  [
    createTextSection('About this fragrance', descriptionText),
    createSpecifications(product),
    createTextSection('Ingredients', product.Ingredients),
    createTextSection('How to use', product['How to Use']),
  ].filter(Boolean).forEach((section) => info.append(section));
  info.append(createBackLink());
  layout.append(figure, info);
  return layout;
}

function renderNotFound() {
  const message = document.createElement('div');
  message.className = 'product-details-not-found';

  const text = document.createElement('p');
  text.textContent = 'Sorry, we could not find that product.';

  message.append(text, createBackLink());
  return message;
}

export default async function decorate(block) {
  const id = new URLSearchParams(window.location.search).get('id');
  block.textContent = '';
  const breadcrumb = createProductBreadcrumbs([
    { label: 'Home', href: '/capstone/' },
    { label: 'Perfumes', href: LISTING_URL },
    { label: 'Product details' },
  ]);
  block.append(breadcrumb);
  if (!id) {
    block.append(renderNotFound());
    return;
  }

  try {
    const products = await getProducts();
    const product = products.find((item) => item.Name === id);
    if (product) breadcrumb.querySelector('.product-breadcrumb-current').textContent = product.Name;
    block.append(product ? renderProduct(product) : renderNotFound());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Product details loading failed', error);
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = 'We could not load this perfume. Please refresh the page to try again.';
    block.append(message, createBackLink());
  }
}
