import { getProducts } from '../../scripts/products-data.js';

function createProductCard(product) {
  const item = document.createElement('li');
  item.className = 'product-item';

  const link = document.createElement('a');
  link.className = 'product-link';
  link.href = `/capstone/product-details?id=${encodeURIComponent(product.Name)}`;

  const figure = document.createElement('div');
  figure.className = 'product-image';

  const img = document.createElement('img');
  img.src = product.Image;
  img.alt = product.Name;
  img.loading = 'lazy';
  img.addEventListener('error', () => figure.classList.add('no-image'));
  figure.append(img);

  const body = document.createElement('div');
  body.className = 'product-body';

  const category = document.createElement('p');
  category.className = 'product-category';
  category.textContent = product.Category;

  const name = document.createElement('h3');
  name.className = 'product-name';
  name.textContent = product.Name;

  const meta = document.createElement('div');
  meta.className = 'product-meta';

  const rating = document.createElement('span');
  rating.className = 'product-rating';
  rating.textContent = `★ ${product.Rating}`;

  const price = document.createElement('strong');
  price.className = 'product-price';
  price.textContent = `$${product['Price ($)']}`;

  meta.append(rating, price);
  body.append(category, name, meta);
  link.append(figure, body);
  const shopNow = document.createElement('a');
  shopNow.className = 'product-shop-now';
  shopNow.href = link.href;
  shopNow.textContent = 'Shop now';
  item.append(link, shopNow);

  return item;
}

const PREVIEW_COUNT = 4;
const BESTSELLERS_COUNT = 8;
const BESTSELLERS = '__bestsellers__';
const BESTSELLERS_LABEL = 'Bestsellers';

function getTopRated(products) {
  return [...products]
    .sort((a, b) => (parseFloat(b.Rating) || 0) - (parseFloat(a.Rating) || 0))
    .slice(0, BESTSELLERS_COUNT);
}

function createFilterButton(label, value, onSelect) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'product-filter';
  button.textContent = label;
  button.dataset.category = value;
  button.addEventListener('click', () => onSelect(value));
  return button;
}

export default async function decorate(block) {
  let products;
  try {
    products = await getProducts();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Product catalog loading failed', error);
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = 'We could not load the perfumes. Please refresh the page to try again.';
    block.replaceChildren(message);
    return;
  }
  const categories = [...new Set(products.map((product) => product.Category)
    .filter((category) => typeof category === 'string' && category.trim())
    .map((category) => category.trim()))];

  const filters = document.createElement('div');
  filters.className = 'product-filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Perfume categories');

  const heading = document.createElement('h2');

  const list = document.createElement('ul');
  list.className = 'product-list';

  const isListing = /\/product-listing(?:\.html)?\/?$/.test(window.location.pathname);
  const viewAll = document.createElement('a');
  viewAll.className = 'product-view-all';
  viewAll.textContent = 'View all';
  let count;

  const showProducts = (category) => {
    const items = category === BESTSELLERS
      ? getTopRated(products)
      : products.filter((product) => !category || (typeof product.Category === 'string'
        && product.Category.trim() === category));
    heading.textContent = category === BESTSELLERS ? BESTSELLERS_LABEL : category || 'All perfumes';
    list.replaceChildren(...(isListing ? items : items.slice(0, PREVIEW_COUNT))
      .map(createProductCard));
    viewAll.href = `/capstone/product-listing?category=${encodeURIComponent(category)}`;
    viewAll.hidden = isListing || items.length <= PREVIEW_COUNT;
    if (count) count.textContent = `${items.length} ${items.length === 1 ? 'perfume' : 'perfumes'}`;
    if (isListing) {
      const url = new URL(window.location.href);
      if (category) url.searchParams.set('category', category);
      else url.searchParams.delete('category');
      window.history.replaceState(null, '', url);
    }
    filters.querySelectorAll('button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.category === category));
    });
  };

  filters.append(
    ...(isListing ? [createFilterButton('All perfumes', '', showProducts)] : []),
    createFilterButton(BESTSELLERS_LABEL, BESTSELLERS, showProducts),
    ...categories.map((category) => createFilterButton(category, category, showProducts)),
  );

  block.textContent = '';
  if (isListing) {
    block.classList.add('is-listing');
    const hero = document.createElement('div');
    hero.className = 'product-hero';
    const home = document.createElement('a');
    home.className = 'product-home';
    home.href = '/';
    home.textContent = '\u2190 Home';
    const title = document.createElement('h1');
    title.textContent = 'Shop all perfumes';
    const tagline = document.createElement('p');
    tagline.textContent = 'Discover iconic fragrances from the world\u2019s finest houses.';
    count = document.createElement('span');
    count.className = 'product-count';
    hero.append(home, title, tagline, count);
    block.append(hero);
  }
  block.append(filters, heading, list, viewAll);
  showProducts(isListing ? new URLSearchParams(window.location.search).get('category') || '' : BESTSELLERS);
}
