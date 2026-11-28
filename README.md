# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--eds-batch2-ankita-jindal--ankita-jindal-adb09.aem.page/
- Live: https://main--eds-batch2-ankita-jindal--ankita-jindal-adb09.aem.live/

## Documentation

Before using the aem-boilerplate, we recommend you to go through the documentation on https://www.aem.live/docs/ and more specifically:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

Product images and card content link to
`/capstone/product-details?id=Chanel%20No.%205`. The catalog currently has no ID
column, so the `id` parameter uses the product's exact `Name`, matching the cart's
product identifier. The details block reads this parameter and looks up the
matching entry in `/capstone/products.json`. The page supports direct visits and refresh;
missing or unknown IDs show a product-not-found message. Cards have a `Shop now`
link that opens the selected product's details. Add-to-cart remains on the
details page.

The details page uses `Home icon > Perfumes > Product name` breadcrumbs above
the product layout. Home opens `/capstone/` and Perfumes opens the listing.
The styled `Back to products` link returns to the referring listing, preserving
its filters, when the referrer is a same-origin listing URL. Direct visits and
visits from other pages return to `/capstone/product-listing`, rather than leaving
the site via browser history. Navigation remains available for missing products
and catalog errors.

The details page quantity selector starts at one and cannot go below one.
Changing it does not modify the cart until `Add to cart` is clicked. Adding
uses the selected quantity (then resets it to one), combines units for an
existing product, and updates the header badge to the total units across all
cart products. The cart persists in local storage.

Author the DA.live page at `/capstone/product-details` with a `Product Details`
block. For existing pages authored with a `Products` block, auto-blocking converts
that block to `Product Details` on the `product-details` route before block loading.
The catalog remains unchanged on index pages. The details route renders only the
product identified by `id`, never the complete catalog.

The homepage and details page share the `/capstone/products.json` catalog.
This preview endpoint contains the populated `Image` column; `/products.json`
is a separate catalog and is not used.

Category filters contain only unique, nonblank `Category` values from the current
spreadsheet, with surrounding whitespace trimmed. The first filter, "Bestsellers",
is selected by default and shows the eight top-rated perfumes; it is not a
`Category` value.

Each category initially shows at most four cards. When more are available,
`View all` links to `/capstone/product-listing?category=...`, which uses the same
`Products` block to display all matching cards without a preview limit.
The selected category survives refresh. Visiting the listing without a category
shows all perfumes. Bestsellers retains its eight top-rated products.

On the listing, `All perfumes` renders 12 cards initially and appends up to 12
more when the load-more control approaches the viewport. The control also works
by click or keyboard, including in browsers without `IntersectionObserver`.
Loading stops at the end of the catalog; the progress message below the cards
shows how many cards are displayed out of the catalog total. Switching filters resets
batch loading. Categories and collections still render all their matching cards,
and the homepage still uses four-card previews. Card images use native lazy loading.
The listing has a breadcrumb above the banner: an accessible Home icon linking
to `/capstone/`, a chevron, and the current filter label. The icon uses a discreet,
borderless style with a 44px hit target. The banner contains only the title and
tagline, without a count badge.

The Collections navigation maps `New Arrivals` to
`/capstone/product-listing?collection=New%20Arrival` and `Seasonal Edition`
(or `Seasonal Edits`) to
`/capstone/product-listing?collection=Seasonal%20Edition`.
Use the spreadsheet's `Collection` column for these values. A product can belong
to both with `New Arrival, Seasonal Edition`; comma-separated values are trimmed
and matched exactly, and missing or blank cells belong to neither collection.
The listing shows all matching products and preserves the collection on refresh.
Collection filter buttons are derived from the spreadsheet. Selecting a category,
gender, Bestsellers, or All perfumes clears the collection selection; selecting
a collection clears the category selection.

The details page displays `Size`, comma-separated `Product Highlights` as badges,
and `Extended Description` (falling back to the older `Description` column).
Purchase controls appear before longer descriptions. Product specifications show
`Gender`, `Category`, `Size`, and `Collection`. Optional spreadsheet columns
`Brand`, `Concentration`, `Top Notes`, `Heart Notes`, and `Base Notes` add
specification rows; `Ingredients` and `How to Use` add their own sections.
Populate these fields with verified product information; no descriptions, notes,
review counts, stock claims, or delivery estimates are generated automatically.
The shipping note uses the shared cart free-shipping threshold.
Missing or blank optional fields are omitted. Keep an `Image` column with each
product's image URL to display photos; the details page shows "Image unavailable"
when it is absent.

Preview the spreadsheet served at `/capstone/products.json` in DA.live to expose these
columns on the preview feed (used by local development), and publish the sheet
for the live site.

1. Create a new repository based on the `aem-boilerplate` template
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `eds-batch2-ankita-jindal` directory in your favorite IDE and start coding :)
