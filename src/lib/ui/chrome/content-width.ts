/**
 * The storefront's content column.
 *
 * ONE definition, used by every header, every footer, and the page body the
 * renderer wraps. That is the whole point: a header bar spans the full page
 * while its logo and cart sit on this column, so they line up with the products
 * underneath at every viewport width.
 *
 * Capping matters more the wider the screen. Uncapped, a hero product image
 * takes half a 2200px monitor and renders about 1100px wide — the layout is
 * right and the scale is absurd.
 *
 * A plain string rather than a CSS variable so Tailwind can see the classes:
 * it scans source text, and a class assembled at runtime is never generated.
 */
export const STORE_CONTENT_WIDTH = 'mx-auto w-full max-w-7xl';
