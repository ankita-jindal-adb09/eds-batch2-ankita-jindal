import { getProducts, createAddToCartButton } from '../../scripts/products-data.js';

function createBackButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'product-details-back';
  button.textContent = '← Back to products';
  button.addEventListener('click', () => window.history.back());
  return button;
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
    const img = document.createElement('img');
    img.src = product.Image;
    img.alt = product.Name;
    img.addEventListener('error', () => figure.classList.add('no-image'));
    figure.append(img);
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

  const rating = document.createElement('p');
  rating.className = 'product-rating';
  rating.textContent = `★ ${product.Rating}`;

  const price = document.createElement('p');
  price.className = 'product-details-price';
  price.textContent = `$${product['Price ($)']}`;

  info.append(category, name, rating);
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

  const descriptionText = [product['Extended Description'], product.Description]
    .find((value) => typeof value === 'string' && value.trim());
  if (descriptionText) {
    const description = document.createElement('p');
    description.className = 'product-details-description';
    description.textContent = descriptionText.trim();
    info.append(description);
  }
  info.append(createPurchaseControls(product), createBackButton());
  layout.append(figure, info);
  return layout;
}

function renderNotFound() {
  const message = document.createElement('div');
  message.className = 'product-details-not-found';

  const text = document.createElement('p');
  text.textContent = 'Sorry, we could not find that product.';

  message.append(text, createBackButton());
  return message;
}

export default async function decorate(block) {
  const id = new URLSearchParams(window.location.search).get('id');
  block.textContent = '';
  if (!id) {
    block.append(renderNotFound());
    return;
  }

  try {
    const products = await getProducts();
    const product = products.find((item) => item.Name === id);
    block.append(product ? renderProduct(product) : renderNotFound());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Product details loading failed', error);
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = 'We could not load this perfume. Please refresh the page to try again.';
    block.append(message, createBackButton());
  }
}
