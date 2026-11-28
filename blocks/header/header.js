import { getMetadata } from '../../scripts/aem.js';
import {
  CART_KEY, CART_UPDATED_EVENT, FREE_SHIPPING_THRESHOLD, getCartCount,
} from '../../scripts/cart.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

const NAV_PATH = '/capstone/nav';
const HOME_URL = '/capstone/';
const ACCOUNT_URL = '/capstone/my-account';

// Monogram: gold-capped perfume bottle inside a gold ring
const LOGO_MARK = `<svg class="nav-logo-mark" viewBox="0 0 48 48" aria-hidden="true">
  <defs>
    <linearGradient id="nav-logo-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6d77a"/><stop offset=".55" stop-color="#c9a227"/><stop offset="1" stop-color="#8a6a12"/>
    </linearGradient>
    <linearGradient id="nav-logo-glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8b5cc6"/><stop offset="1" stop-color="#3a1f57"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="22.5" fill="none" stroke="url(#nav-logo-gold)" stroke-width="1.5"/>
  <rect x="19.5" y="7.5" width="9" height="6" rx="1.5" fill="url(#nav-logo-gold)"/>
  <rect x="21.5" y="13.5" width="5" height="3.5" fill="url(#nav-logo-gold)"/>
  <rect x="13" y="17" width="22" height="23" rx="6" fill="url(#nav-logo-glass)"/>
  <path d="M16.5 21v6" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round"/>
  <text x="24.5" y="34" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="11" font-style="italic" fill="url(#nav-logo-gold)">EL</text>
</svg>`;

const ACCOUNT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';

const LISTING_URL = '/capstone/product-listing';

// Nav labels map to spreadsheet filters; unmatched labels show all perfumes.
const NAV_CATEGORIES = {
  women: 'Women',
  men: 'Men',
  'unisex & shared scents': 'Unisex',
  floral: 'Floral',
  'oud & oriental': 'Oud & Oriental',
  'fresh & citrus': 'Fresh & Citrus',
  'best sellers': '__bestsellers__',
};

const NAV_COLLECTIONS = {
  'new arrivals': 'New Arrival',
  'new arrival': 'New Arrival',
  'seasonal edits': 'Seasonal Edition',
  'seasonal edition': 'Seasonal Edition',
};

function linkNavToListing(navSections) {
  navSections?.querySelectorAll('a').forEach((link) => {
    const label = link.textContent.trim().toLowerCase();
    const collection = NAV_COLLECTIONS[label];
    if (collection) {
      link.href = `${LISTING_URL}?collection=${encodeURIComponent(collection)}`;
      return;
    }
    const category = NAV_CATEGORIES[label];
    link.href = category ? `${LISTING_URL}?category=${encodeURIComponent(category)}` : LISTING_URL;
  });
}

function decorateBrand(navBrand) {
  if (!navBrand) return;
  // Keep the authored brand name but drop emoji/decorative characters
  const name = navBrand.textContent.replace(/[^\p{L}\p{N}\s&'-]/gu, '').replace(/\s+/g, ' ').trim() || 'Essence Luxe';
  const logo = document.createElement('a');
  logo.className = 'nav-logo';
  logo.href = HOME_URL;
  logo.setAttribute('aria-label', `${name} home`);
  logo.innerHTML = `${LOGO_MARK}<span class="nav-logo-text"><span class="nav-logo-name"></span><span class="nav-logo-tagline">Parfums de Luxe</span></span>`;
  logo.querySelector('.nav-logo-name').textContent = name;
  navBrand.replaceChildren(logo);
}

function createAccountLink() {
  const account = document.createElement('a');
  account.className = 'nav-account';
  account.href = ACCOUNT_URL;
  account.setAttribute('aria-label', 'My account');
  account.innerHTML = `${ACCOUNT_ICON}<span class="nav-account-label">Account</span>`;
  return account;
}

function createAnnouncement() {
  const bar = document.createElement('div');
  bar.className = 'nav-announcement';
  bar.innerHTML = `<p class="nav-announcement-text"><span>Complimentary shipping on orders over $${FREE_SHIPPING_THRESHOLD}</span>
    <span class="nav-announcement-extra">Luxury gift wrapping on every order</span></p>`;
  return bar;
}

/**
 * Closes the open nav dropdown (desktop) or the nav menu (mobile) on Escape
 * @param {KeyboardEvent} e keydown event
 */
function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

/**
 * Closes the open nav dropdown (desktop) or the nav menu (mobile) when focus leaves the nav
 * @param {FocusEvent} e focusout event
 */
function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean|string} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-drop > button').forEach((button) => {
    button.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  // the desktop nav is always expanded, so aria-expanded only applies to the mobile menu
  if (isDesktop.matches) nav.removeAttribute('aria-expanded');
  else nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : NAV_PATH;
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  const navBlock = fragment.querySelector('.nav');
  if (navBlock) {
    // authored as a "nav" block table: each row becomes brand / sections / tools
    [...navBlock.children].forEach((row) => {
      const section = document.createElement('div');
      const wrapper = document.createElement('div');
      wrapper.className = 'default-content-wrapper';
      wrapper.append(...(row.firstElementChild?.childNodes || []));
      section.append(wrapper);
      nav.append(section);
    });
    // tools are built in code (account, cart), so drop authored emoji links
    nav.children[2]?.querySelector('.default-content-wrapper')?.replaceChildren();
  } else {
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  }

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const cartLink = document.createElement('a');
    cartLink.className = 'nav-cart';
    cartLink.href = '/capstone/cart';
    cartLink.innerHTML = '<img src="/icons/cart.svg" alt="" width="24" height="24"><span class="nav-cart-count"></span>';
    const badge = cartLink.querySelector('.nav-cart-count');
    const renderCartCount = (count) => {
      badge.textContent = count || '';
      cartLink.setAttribute('aria-label', `Cart, ${count} item${count === 1 ? '' : 's'}`);
    };
    renderCartCount(getCartCount());
    window.addEventListener(CART_UPDATED_EVENT, (e) => renderCartCount(e.detail));
    window.addEventListener('storage', (e) => {
      if (e.key === CART_KEY) renderCartCount(getCartCount());
    });
    navTools.append(createAccountLink(), cartLink);
  }

  decorateBrand(nav.querySelector('.nav-brand'));

  const navSections = nav.querySelector('.nav-sections');
  linkNavToListing(navSections);
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      const subList = navSection.querySelector(':scope > ul');
      if (!subList) return;
      navSection.classList.add('nav-drop');
      // wrap the dropdown label in a button so it is announced as expandable
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-expanded', false);
      [...navSection.childNodes].forEach((node) => {
        if (node !== subList) button.append(node);
      });
      navSection.prepend(button);
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        if (isDesktop.matches) {
          button.focus();
          toggleAllNavSections(navSections);
        }
        button.setAttribute('aria-expanded', !expanded);
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(createAnnouncement(), nav);
  block.append(navWrapper);

  const onScroll = () => navWrapper.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
