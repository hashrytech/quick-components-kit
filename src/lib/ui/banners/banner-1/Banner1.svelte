<script lang="ts" module>
    import type { ClassNameValue } from 'tailwind-merge';
    
    export type Banner1Props = {
        mainText: string;
        subText?: string;
        image?: string;
        primaryButtonText?: string;
        primaryButtonLink?: string;
        secondaryButtonText?: string;
        secondaryButtonLink?: string;
        class?: ClassNameValue;
    };

</script>

<script lang="ts">
	import { twMerge } from "tailwind-merge";

  let { mainText, subText, image, primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink, ...restProps }: Banner1Props = $props();
  let style = image ? "background-image: url('" + image + "');" : "";

</script>

<section class={twMerge("lg:grid", restProps.class)} {style}>
  <div class="mx-auto w-screen max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
    <div class="mx-auto max-w-prose text-center">
      <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl">{@html mainText}</h1>
      <p class="mt-4 text-base text-pretty text-gray-700 sm:text-lg/relaxed dark:text-gray-200">{subText}</p>

      {#if primaryButtonText || secondaryButtonText}
      <div class="mt-4 flex justify-center gap-4 sm:mt-6">
        {#if primaryButtonText && primaryButtonLink}
        <a class="inline-block rounded-primary bg-primary-button px-5 py-3 font-medium text-white shadow-primary transition-colors hover:bg-primary-button-hover"
          href={primaryButtonLink}>{primaryButtonText}</a>
        {/if}

        {#if secondaryButtonText && secondaryButtonLink}
        <a class="inline-block bg-white rounded-primary border border-gray-200 px-5 py-3 font-medium text-gray-700 shadow-primary transition-colors 
            hover:bg-gray-50 hover:text-gray-900" href={secondaryButtonLink}>
          {secondaryButtonText}</a>
        {/if}
      </div>
      {/if}
    </div>
  </div>
</section>
