<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'

const route = useRoute()
const colorMode = useColorMode()
const { loggedIn, user, clear } = useUserSession()
const config = useRuntimeConfig()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}

// Menu atas mengikuti peran dan hanya menautkan halaman yang sudah ada.
const items = computed<NavigationMenuItem[]>(() => {
  if (!loggedIn.value) return []

  if (user.value?.peran === 'Petani') {
    return [
      {
        label: 'Produk',
        to: '/farmer-dashboard/produk',
        icon: 'i-lucide-package',
        active: route.path.startsWith('/farmer-dashboard/produk')
      },
      {
        label: 'Pesanan',
        to: '/farmer-dashboard/pesanan',
        icon: 'i-lucide-shopping-cart',
        active: route.path.startsWith('/farmer-dashboard/pesanan')
      }
    ]
  }

  return [
     {
      label: 'Keranjang',
      to: '/keranjang',
      icon: 'i-lucide-shopping-cart',
      active: route.path.startsWith('/keranjang')
    },
    {
      label: 'Langganan',
      to: '/langganan',
      icon: 'heroicons:arrow-path-rounded-square-20-solid',
      active: route.path.startsWith('/langganan')
    }
  ]
})

// Mengubah ikon tombol utama secara dinamis berdasarkan preferensi saat ini
const currentIcon = computed(() => {
  switch (colorMode.preference) {
    case 'light': return 'i-lucide-sun'
    case 'dark': return 'i-lucide-moon' 
  }
})

const itemsDrop = computed<DropdownMenuItem[][]>(() => {
  if (user.value?.peran === 'Petani') return [
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
          navigateTo('/profil')
        },
        active: route.path.startsWith('/profil')
      },
      {
        label: 'Dashboard',
        icon: 'coolicons:dashboard-duocolor',
        children: [
          {
            label: 'Produk',
            icon: 'i-lucide-package',
            onSelect: () => {
              navigateTo('/farmer-dashboard/produk')
            },
            active: route.path.startsWith('/farmer-dashboard/produk')
          },
          {
            label: 'Pesanan',
            icon: 'i-lucide-shopping-cart',
            onSelect: () => {
              navigateTo('/farmer-dashboard/pesanan')
            },
            active: route.path.startsWith('/farmer-dashboard/pesanan')
          }
        ]
      }
    ],
    [
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        color: 'error',
        onSelect: () => {
          logoutModal.value = true
        }
      }
    ]
  ]

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
          navigateTo('/profil')
        },
        active: route.path.startsWith('/profil')
      }
    ],
    [
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        color: 'error',
        onSelect: () => {
          logoutModal.value = true
        }
      }
    ]
  ]
})

const logoutModal = ref(false)
</script>

<template>
  <UHeader>
    <template #title>
      <!-- <UIcon name="streamline-freehand:e-commerce-cart-laptop" class="size-8" /> -->
      <div class="flex items-center gap-2">
        <AppLogo class="size-10" />
        <h1 class="align-middle text-center ml-2">{{ config.public.appName }}</h1>
      </div>
    </template>

    <template #right>
      <UTooltip text="Change color mode" placement="bottom">
        <UColorModeButton :icon="currentIcon" variant="outline" />
      </UTooltip>
      
      <UDropdownMenu v-if="loggedIn" :items="itemsDrop">
        <UButton icon="i-lucide-user" color="neutral" variant="outline" />
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
          <UButtonx
            label="Close"
            color="neutral"
            variant="outline"
            @click="logoutModal = false"
          />
          <UButton
            label="Confirm"
            color="error"
            variant="outline"
            @click="logout()"
          />
        </template>
      </UModal>
    </template>

    <UNavigationMenu
      v-if="items.length"
      :items="items"
    />

    <template #body>
      <UNavigationMenu
        v-if="items.length"
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
