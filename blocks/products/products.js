import {
  getProducts, createProductBreadcrumbs, createProductPicture,
} from '../../scripts/products-data.js';

function createProductCard(product) {
  const item = document.createElement('li');
  item.className = 'product-item';

  const link = document.createElement('a');
  link.className = 'product-link';
  link.href = `/capstone/product-details?id=${encodeURIComponent(product.Name)}`;

  const figure = document.createElement('div');
  figure.className = 'product-image';

  if (typeof product.Image === 'string' && product.Image.trim()) {
    const picture = createProductPicture(product.Image, product.Name);
    picture.querySelector('img').addEventListener('error', () => figure.classList.add('no-image'));
    figure.append(picture);
  } else {
    figure.classList.add('no-image');
  }

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
const LISTING_BATCH_SIZE = 12;
const BESTSELLERS_COUNT = 8;
const BESTSELLERS = '__bestsellers__';
const BESTSELLERS_LABEL = 'Bestsellers';
const GENDER_ORDER = ['Women', 'Men', 'Unisex'];

function getCollections(product) {
  return typeof product.Collection === 'string'
    ? product.Collection.split(',').map((value) => value.trim()).filter(Boolean)
    : [];
}

function getTopRated(products) {
  return [...products]
    .sort((a, b) => (parseFloat(b.Rating) || 0) - (parseFloat(a.Rating) || 0))
    .slice(0, BESTSELLERS_COUNT);
}

const svg = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;

// Stroke icons (inherit the pill text colour) keyed by filter value
const FILTER_ICONS = {
  '': svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>'),
  [BESTSELLERS]: svg('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>'),
  Floral: svg('<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C10.5 7 10.5 4.5 12 3c1.5 1.5 1.5 4 0 6.5zM14.5 12c2.5-1.5 5-1.5 6.5 0-1.5 1.5-4 1.5-6.5 0zM12 14.5c1.5 2.5 1.5 5 0 6.5-1.5-1.5-1.5-4 0-6.5zM9.5 12C7 13.500 4.500 13.500 3 12c1.500-1.500 4-1.500 6.500 0z"/>'),
  'Fresh & Citrus': svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.500v17M3.500 12h17M6 6l12 12M18 6L6 18"/>'),
  'Oud & Oriental': svg('<path d="M12 3c3 3.500 5 6 5 9.500a5 5 0 0 1-10 0C7 9 9 6.500 12 3z"/><path d="M12 12c1.500 1.500 2 2.500 2 3.500a2 2 0 0 1-4 0c0-1 .5-2 2-3.500z"/>'),
  Women: svg('<circle cx="12" cy="9" r="5"/><path d="M12 14v8M8.500 18.500h7"/>'),
  Men: svg('<circle cx="10" cy="14" r="5"/><path d="M13.500 10.500L20 4M14.500 4H20v5.500"/>'),
  Unisex: svg('<circle cx="9" cy="12" r="5.500"/><circle cx="15" cy="12" r="5.500"/>'),
};

function createFilterButton(label, value, onSelect, filterType = 'category') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'product-filter';
  button.dataset[filterType] = value;
  if (FILTER_ICONS[value]) {
    const icon = document.createElement('span');
    icon.className = 'product-filter-icon';
    icon.dataset.icon = (value || 'all').replace(/[^a-z]/gi, '').toLowerCase();
    icon.innerHTML = FILTER_ICONS[value];
    button.append(icon);
  }
  const text = document.createElement('span');
  text.className = 'product-filter-label';
  text.textContent = label;
  button.append(text);
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
  const genders = GENDER_ORDER.filter((gender) => products
    .some((product) => product.Gender?.trim() === gender));
  const collections = [...new Set(products.flatMap(getCollections))];

  const filters = document.createElement('div');
  filters.className = 'product-filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Perfume filters');

  const heading = document.createElement('h2');

  const list = document.createElement('ul');
  list.className = 'product-list';

  const isListing = /\/product-listing(?:\.html)?\/?$/.test(window.location.pathname);
  const viewAll = document.createElement('a');
  viewAll.className = 'product-view-all';
  viewAll.textContent = 'View all';
  let loadObserver;
  let breadcrumbCurrent;

  const pagination = document.createElement('div');
  pagination.className = 'product-pagination';
  pagination.hidden = true;
  const loadMore = document.createElement('button');
  loadMore.type = 'button';
  loadMore.className = 'product-load-more';
  loadMore.textContent = 'Load more perfumes';
  const progress = document.createElement('p');
  progress.className = 'product-progress';
  progress.setAttribute('role', 'status');
  pagination.append(loadMore, progress);

  const showProducts = (category, collection = '') => {
    loadObserver?.disconnect();
    loadObserver = null;
    loadMore.onclick = null;
    const collectionProducts = collection
      ? products.filter((product) => getCollections(product).includes(collection))
      : products;
    const items = category === BESTSELLERS
      ? getTopRated(collectionProducts)
      : collectionProducts.filter((product) => !category || [product.Category, product.Gender]
        .some((value) => typeof value === 'string' && value.trim() === category));
    const categoryLabel = category === BESTSELLERS ? BESTSELLERS_LABEL : category;
    heading.textContent = [collection, categoryLabel].filter(Boolean).join(' - ') || 'All perfumes';
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = heading.textContent;
    const isAllPerfumes = isListing && !category && !collection;
    let rendered = Math.min(items.length, isAllPerfumes ? LISTING_BATCH_SIZE : items.length);
    list.replaceChildren(...(isListing ? items.slice(0, rendered) : items.slice(0, PREVIEW_COUNT))
      .map(createProductCard));
    pagination.hidden = !isAllPerfumes;
    if (isAllPerfumes) {
      const updateProgress = () => {
        loadMore.hidden = rendered >= items.length;
        progress.textContent = `Showing ${rendered} of ${items.length} perfumes`;
      };
      const appendNextBatch = () => {
        const next = items.slice(rendered, rendered + LISTING_BATCH_SIZE);
        list.append(...next.map(createProductCard));
        rendered += next.length;
        updateProgress();
        if (rendered >= items.length) {
          loadObserver?.disconnect();
          loadObserver = null;
        } else if (loadObserver) {
          loadObserver.unobserve(loadMore);
          loadObserver.observe(loadMore);
        }
      };
      updateProgress();
      loadMore.onclick = appendNextBatch;
      if (rendered < items.length && 'IntersectionObserver' in window) {
        loadObserver = new IntersectionObserver((entries, observer) => {
          if (observer === loadObserver && entries.some((entry) => entry.isIntersecting)) {
            appendNextBatch();
          }
        }, { rootMargin: '200px 0px' });
        loadObserver.observe(loadMore);
      }
    }
    viewAll.href = `/capstone/product-listing?category=${encodeURIComponent(category)}`;
    if (collection) viewAll.href += `&collection=${encodeURIComponent(collection)}`;
    viewAll.hidden = isListing || items.length <= PREVIEW_COUNT;
    if (isListing) {
      const url = new URL(window.location.href);
      if (category) url.searchParams.set('category', category);
      else url.searchParams.delete('category');
      if (collection) url.searchParams.set('collection', collection);
      else url.searchParams.delete('collection');
      window.history.replaceState(null, '', url);
    }
    filters.querySelectorAll('button').forEach((button) => {
      const selected = button.dataset.collection !== undefined
        ? button.dataset.collection === collection
        : !collection && button.dataset.category === category;
      button.setAttribute('aria-pressed', String(selected));
    });
  };

  filters.append(
    ...(isListing ? [createFilterButton('All perfumes', '', showProducts)] : []),
    createFilterButton(BESTSELLERS_LABEL, BESTSELLERS, showProducts),
    ...categories.map((category) => createFilterButton(category, category, showProducts)),
    ...genders.map((gender) => createFilterButton(gender, gender, showProducts)),
    ...(isListing ? collections.map((collection) => createFilterButton(
      collection,
      collection,
      (value) => showProducts('', value),
      'collection',
    )) : []),
  );

  block.textContent = '';
  if (isListing) {
    block.classList.add('is-listing');
    const hero = document.createElement('div');
    hero.className = 'product-hero';
    const breadcrumb = createProductBreadcrumbs([
      { label: 'Home', href: '/capstone/' },
      { label: 'All perfumes' },
    ]);
    breadcrumbCurrent = breadcrumb.querySelector('.product-breadcrumb-current');
    const title = document.createElement('h1');
    title.textContent = 'Shop all perfumes';
    const tagline = document.createElement('p');
    tagline.textContent = 'Discover iconic fragrances from the world\u2019s finest houses.';
    hero.append(title, tagline);
    block.append(breadcrumb, hero);
  }
  block.append(filters, heading, list, viewAll);
  if (isListing) block.append(pagination);
  const params = new URLSearchParams(window.location.search);
  showProducts(
    isListing ? params.get('category') || '' : BESTSELLERS,
    isListing ? params.get('collection') || '' : '',
  );
}
