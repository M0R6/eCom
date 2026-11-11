<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const colorMode = useColorMode();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Docs",
    to: "/docs/getting-started",
    icon: "i-lucide-book-open",
    active: route.path.startsWith("/docs/getting-started"),
  },
  {
    label: "Components",
    to: "/docs/components",
    icon: "i-lucide-box",
    active: route.path.startsWith("/docs/components"),
  },
  {
    label: "Figma",
    icon: "i-simple-icons-figma",
    to: "https://go.nuxt.com/figma-ui",
    target: "_blank",
  },
  {
    label: "Releases",
    icon: "i-lucide-rocket",
    to: "https://github.com/nuxt/ui/releases",
    target: "_blank",
  },
]);

const iconItems = [
  [
    {
      label: "Light",
      icon: "i-lucide-sun",
      onSelect: () => {
        colorMode.preference = "light";
      },
    },
    {
      label: "Dark",
      icon: "i-lucide-moon",
      onSelect: () => {
        colorMode.preference = "dark";
      },
    },
    {
      label: "System",
      icon: "i-lucide-monitor",
      onSelect: () => {
        colorMode.preference = "system";
      },
    },
  ],
];

// Mengubah ikon tombol utama secara dinamis berdasarkan preferensi saat ini
const currentIcon = computed(() => {
  if (colorMode.preference === "light") return "i-lucide-sun";
  if (colorMode.preference === "dark") return "i-lucide-moon";
  return "i-lucide-monitor"; // default untuk system
});
</script>

<template>
  <UHeader>
    <template #title>
      <!-- <UIcon name="streamline-freehand:e-commerce-cart-laptop" class="size-8" /> -->
      <AppLogo class="size-7" />
      <h1 class="align-middle text-center ml-2">eCommerce</h1>
    </template>

    <template #right>
      <!-- <UColorModeButton /> -->
      <UDropdownMenu :items="iconItems" :popper="{ placement: 'bottom-start' }">
        <UTooltip text="Change color mode" placement="bottom">
          <UButton color="neutral" variant="ghost" :icon="currentIcon" />
        </UTooltip>
      </UDropdownMenu>
    </template>

    <UNavigationMenu :items="items" />

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
