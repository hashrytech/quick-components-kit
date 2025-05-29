<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant: 'primary' | 'secondary' | 'danger' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let className: string = ''; // Allow extra classes
</script>

<button
  type={type}
  class={`inline-flex items-center justify-center font-medium rounded-md
    ${variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
    ${variant === 'secondary' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}
    ${variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
    ${size === 'sm' ? 'px-2 py-1 text-sm' : ''}
    ${size === 'md' ? 'px-4 py-2 text-base' : ''}
    ${size === 'lg' ? 'px-6 py-3 text-lg' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}`}
  disabled={disabled}>
  <slot />
</button>
