<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const colorMode = useColorMode();
const { loggedIn, user, clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}

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

import type { DropdownMenuItem } from '@nuxt/ui'

const itemsDrop = computed<DropdownMenuItem[][]>(() => {
  if (user.value?.peran === "Petani") return [
    [
      {
        label: user.value?.nama,
        avatar: {
          icon: 'i-lucide-user',
          loading: 'lazy'
        },
        type: 'label'
      }
    ],
    [
      {
        label: 'Profile',
        icon: 'i-lucide-user',
        onSelect: () => {
          navigateTo("/profil");
        },
        active: route.path.startsWith("/profil"),
      },
      {
        label: 'Dashboard',
        icon: 'coolicons:dashboard-duocolor',
        children: [
          {
            label: 'Statistik',
            icon: 'i-lucide-bar-chart-2',
            onSelect: () => {
              navigateTo("/farmer-dashboard");
            },
            active: route.path.startsWith("/farmer-dashboard"),

          },
          {
            label: 'Produk',
            icon: 'i-lucide-package',
            onSelect: () => {
              navigateTo("/farmer-dashboard/produk");
            },
            active: route.path.startsWith("/farmer-dashboard/produk"),
          },
          {
            label: 'Pesanan',
            icon: 'i-lucide-shopping-cart',
            onSelect: () => {
              navigateTo("/farmer-dashboard/pesanan");
            },
            active: route.path.startsWith("/farmer-dashboard/pesanan"),
          }
        ]
      },
    ],
    [
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        color: 'error',
        onSelect: () => {
          logoutModal.value = true;
        },
      }
    ]
  ];

  else return [
    [
      {
        label: user.value?.nama,
        avatar: {
          icon: 'i-lucide-user',
          loading: 'lazy'
        },
        type: 'label'
      }
    ],
    [
      {
        label: 'Profile',
        icon: 'i-lucide-user',
        onSelect: () => {
          navigateTo("/profil");
        },
        active: route.path.startsWith("/profil"),
      },
    ],
    [
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        color: 'error',
        onSelect: () => {
          logoutModal.value = true;
        },
      }
    ]
  ];
})

const logoutModal = ref(false);
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
      <UDropdownMenu v-if="loggedIn" :items="itemsDrop">
        <UButton icon="i-lucide-user" color="neutral" variant="outline" />
      </UDropdownMenu>
      
      <UDropdownMenu :items="iconItems" :popper="{ placement: 'bottom-start' }">
        <UTooltip text="Change color mode" placement="bottom">
          <UButton color="neutral" variant="ghost" :icon="currentIcon" />
        </UTooltip>
      </UDropdownMenu>

      <UTooltip text="Login" placement="bottom">
        <UButton to="/login" variant="solid" v-if="route.path !== '/login' && route.path !== '/register' && !loggedIn">Login</UButton>
      </UTooltip>

      <UModal 
        v-model:open="logoutModal"
        title="Are you sure want to logout?"
        :close="{
          color: 'primary',
          variant: 'outline',
          class: 'rounded-full'
        }"
        :ui="{ footer: 'justify-end' }"
      >
        <!-- <UTooltip text="Logout" placement="bottom">
          <UButton variant="solid" color="error" v-if="loggedIn" @click="logoutModal = true">Logout</UButton>
        </UTooltip> -->

        <template #footer>
          <UButton label="Close" color="neutral" variant="outline" @click="logoutModal = false" />
          <UButton label="Confirm" color="error" variant="outline" @click="logout()" />
        </template>
      </UModal>
    </template>

    <UNavigationMenu :items="items" />

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
