<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, clear } = useUserSession()
const isPetani = computed(() => user.value?.peran === 'Petani')

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}

const config = useRuntimeConfig()
</script>

<template>
  <div>
    <Header />
    <UContainer class="space-y-6 py-10">
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-2xl font-semibold">
            Halo, {{ user?.nama }}
          </h1>
          <UBadge
            :label="isPetani ? 'Petani' : 'Konsumen'"
            color="neutral"
            variant="subtle"
          />
        </div>
        <p class="text-sm text-muted">
          {{
            isPetani
              ? 'Kelola hasil panen, informasi pertanian, dan rekening pencairan dana Anda.'
              : `Kelola data diri, alamat pengiriman, atau gunakan Tanya ${ config.public.appName } di pojok kanan bawah untuk bantuan.`
          }}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UCard v-if="isPetani">
          <template #header>
            <h2 class="font-semibold">
              Dashboard Petani
            </h2>
          </template>
          <p class="mb-4 text-sm text-muted">
            Lihat daftar hasil panen yang dijual atau tambahkan produk pertanian baru.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              to="/farmer-dashboard/produk"
              color="primary"
              variant="solid"
              icon="i-heroicons-shopping-bag"
              class="min-h-11"
            >
              Kelola Produk
            </UButton>
            <UButton
              to="/farmer-dashboard/produk/baru"
              color="neutral"
              variant="outline"
              icon="i-heroicons-plus"
              class="min-h-11"
            >
              Posting Produk
            </UButton>
            <UButton
              to="/farmer-dashboard/pesanan"
              color="neutral"
              variant="outline"
              icon="i-heroicons-inbox"
              class="min-h-11"
            >
              Pesanan Masuk
            </UButton>
          </div>
        </UCard>

        <UCard v-else>
          <template #header>
            <h2 class="font-semibold">
              Akses Konsumen
            </h2>
          </template>
          <p class="mb-4 text-sm text-muted">
            Atur nomor telepon dan alamat drop point pengiriman Anda, lalu pantau langganan rutin yang sedang berjalan.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              to="/profil"
              color="primary"
              variant="solid"
              icon="i-heroicons-map-pin"
              class="min-h-11"
            >
              Profil dan Alamat
            </UButton>
            <UButton
              to="/langganan"
              color="neutral"
              variant="outline"
              icon="i-heroicons-arrow-path"
              class="min-h-11"
            >
              Langganan Saya
            </UButton>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Pengaturan Akun
            </h2>
          </template>
          <p class="mb-4 text-sm text-muted">
            {{
              isPetani
                ? 'Perbarui data diri, profil pertanian, alamat, dan rekening bank pencairan.'
                : 'Perbarui informasi akun dan daftar alamat tersimpan Anda.'
            }}
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              to="/profil"
              color="neutral"
              variant="outline"
              icon="i-heroicons-user"
              class="min-h-11"
            >
              Lihat Profil
            </UButton>
            <UButton
              color="error"
              variant="soft"
              icon="i-heroicons-arrow-right-on-rectangle"
              class="min-h-11"
              @click="logout"
            >
              Logout
            </UButton>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
