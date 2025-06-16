<script lang="ts" module>
    import { twMerge } from "tailwind-merge";
    import type { ClassNameValue } from 'tailwind-merge';

    export type TabNavigationLink = {
      text: string;
      href: string;
      active: boolean;
    };
    
    export type TabNavigationProps = {
      links: TabNavigationLink[];
      preload?: boolean;
      reload?: boolean;
      divClasses?: ClassNameValue;
      class?: ClassNameValue;
    };

</script>

<script lang="ts">
    let { links, preload=true, reload=false, divClasses, ...props }: TabNavigationProps = $props();
</script>

<div class={twMerge("flex flex-row flex-wrap gap-4 justify-start xxxs:justify-center items-start py-2 px-4 mt-8 font-semibold", divClasses)}>
    {#each links as link}
    <a class={twMerge("px-4 py-1 hover:border-primary-secondary-500 hover:border-b-2 text-gray-900 bg-transparent hover:bg-transparent rounded-none", link.active ? "border-primary-600 border-b-2": "", props.class)}
        data-sveltekit-reload={reload} data-sveltekit-preload-data={preload ? 'hover' : false}
        href={link.href}>
        {link.text}
    </a>
    {/each}
</div>