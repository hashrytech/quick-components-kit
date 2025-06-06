# quick-components-kit
A Svelte component library and toolkit

## Install

You can install the library via npm.

```bash
npm install @hashrytech/quick-components-kit
```

or via yarn:

```bash
yarn add @hashrytech/quick-components-kit
```

## Configurations
Set default theme values for primary and secondary variables:
- Color gradient
- Shadow
- Border radius

## Default Theme

``` 
@theme {

    --breakpoint-xs: 480px;
    --breakpoint-xxs: 400px;
    --breakpoint-xxxs: 360px;
    --breakpoint-xxxxs: 320px;

    --color-primary-50: oklch(0.967 0.07 95.38);
    --color-primary-100: oklch(0.933 0.094 95.47);
    --color-primary-200: oklch(0.864 0.128 95.3);
    --color-primary-300: oklch(0.767 0.165 95.31);
    --color-primary-400: oklch(0.678 0.19 95.1);
    --color-primary-500: oklch(0.608 0.2 94.82);
    --color-primary-600: oklch(0.496 0.17 94.91);
    --color-primary-700: oklch(0.397 0.145 94.53);
    --color-primary-800: oklch(0.326 0.123 94.55);
    --color-primary-900: oklch(0.282 0.106 94.7);
    --color-primary-950: oklch(0.161 0.081 94.91);

    --color-secondary-50: oklch(0.972 0.037 19.87);
    --color-secondary-100: oklch(0.945 0.046 19.95);
    --color-secondary-200: oklch(0.868 0.092 19.81);
    --color-secondary-300: oklch(0.749 0.158 20.04);
    --color-secondary-400: oklch(0.618 0.226 20.19);
    --color-secondary-500: oklch(0.519 0.26 20.31);
    --color-secondary-600: oklch(0.437 0.229 20.44);
    --color-secondary-700: oklch(0.352 0.197 20.45);
    --color-secondary-800: oklch(0.293 0.172 20.38);
    --color-secondary-900: oklch(0.252 0.15 20.25);
    --color-secondary-950: oklch(0.131 0.098 19.98);

    --shadow-primary: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-secondary: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

    --radius-primary: 0.5rem;
    --radius-secondary: 0.375rem;
}
```