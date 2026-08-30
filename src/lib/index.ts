// lib/index.js

export * from './components/icon/index.js';
export * from './components/text-input/index.js';
export * from './components/money-input/index.js';
export * from './components/text-area/index.js';
export * from './components/button/index.js';
export * from './components/link-button/index.js';
export * from './components/hamburger-menu/index.js';
export * from './components/drawer/index.js';
export * from './components/modal/index.js';
export * from './components/overlay/index.js';
export * from './components/overlay-inset-panel/index.js';
export * from './components/radio/index.js';
export * from './components/select/index.js';
export * from './components/segmented-control/index.js';
export * from './components/segmented-toolbar/index.js';
export * from './components/choice-cards/index.js';
export * from './components/icon-tile/index.js';
export * from './components/toggle-list/index.js';
export * from './components/master-checklist/index.js';
export * from './components/inline-sentence/index.js';
export * from './components/checkbox/index.js';
export * from './components/date-picker/index.js';
export * from './components/calendar/index.js';
export * from './components/tab-navigation/index.js';
export * from './components/portal/index.js';
export * from './components/table/index.js';
export * from './components/toast/index.js';

// Actions
export * from './actions/anchored-position.js';
export * from './actions/disable-scroll.js';
export * from './actions/disable-local-scroll.js';
export * from './actions/on-keydown.js';
export * from './actions/scroll-to.js';
export * from './actions/stop-interaction.js';

// Drag and Drop
export * from './components/drag-drop/index.js';
export * from './modules/drag-drop/index.js';

// Modules
export * from './modules/fetch-client.js';
export * from './modules/api-proxy.js';
export * from './modules/crypto.js';
export * from './modules/problem-details.js';
export * from './modules/navigation-state.js';
export * from './modules/money.js';

// Functions
export * from './functions/object-to-form-data.js';
export * from './functions/compare-objects.js';
export * from './functions/click-outside.js';

// UI Components — storefront sections, `<section>/<variant-N>`.
//
// Tier A: tenant-composable, each backed by a Web_Component record in the API
// (header_1, header_2, footer_1, footer_2, product_list_1, banner_1,
// featured_products_1).
export * from './ui/headers/header-1/index.js';
export * from './ui/headers/header-2/index.js';
export * from './ui/footers/footer-1/index.js';
export * from './ui/footers/footer-2/index.js';
export * from './ui/banners/banner-1/index.js';
export * from './ui/featured-products/featured-products-1/index.js';
export * from './ui/product-list/product-list-1/index.js';

// Tier B: application components for the fixed storefront routes (product
// detail, cart, checkout, confirmation). Same kit and theming, not
// tenant-pickable in v1 — promoting one later is just adding a record.
export * from './ui/price/price-1/index.js';
export * from './ui/availability-badge/availability-badge-1/index.js';
export * from './ui/quantity-stepper/quantity-stepper-1/index.js';
export * from './ui/product-card/product-card-1/index.js';
export * from './ui/variant-selector/variant-selector-1/index.js';
export * from './ui/product-detail/product-detail-1/index.js';
export * from './ui/cart-summary/cart-summary-1/index.js';
export * from './ui/empty-cart/empty-cart-1/index.js';
export * from './ui/totals-breakdown/totals-breakdown-1/index.js';
export * from './ui/contact-form/contact-form-1/index.js';
export * from './ui/address-form/address-form-1/index.js';
export * from './ui/order-type-selector/order-type-selector-1/index.js';
export * from './ui/location-picker/location-picker-1/index.js';
export * from './ui/order-confirmation/order-confirmation-1/index.js';
export * from './ui/resume-payment/resume-payment-1/index.js';
export * from './ui/alerts/alert-1/index.js';
export * from './ui/spinner/spinner-1/index.js';
export * from './ui/store-404/store-404-1/index.js';
export * from './ui/friendly-error/friendly-error-1/index.js';

// Preview metadata for the tenant-composable components — labels and sample
// props, so the admin builder can render each design live instead of shipping
// screenshots that go stale.
export * from './ui/component-previews.js';

// Previously built but never exported, so no consumer could import them.
export * from './ui/searchbox/index.js';
export * from './ui/breadcrumbs/breadcrumbs-1/index.js';
export * from './ui/order-product-line-item/order-product-line-item-1/index.js';
export * from './ui/product-list-navigation/product-list-navigation-1/index.js';
export * from './ui/product-filters/product-filter-1/index.js';

// Add more components here...
