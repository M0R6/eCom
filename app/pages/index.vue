<script setup lang="ts">
const { loggedIn, user } = useUserSession()
const route = useRoute()
const toast = useToast()
const config = useRuntimeConfig()

const isPetani = computed(() => user.value?.peran === 'Petani')

onMounted(() => {
  if (route.query.notfarmer && user.value?.peran !== 'Petani') {
    toast.add({
      id: 'akses-ditolak-petani',
      title: 'Akses ke halaman ini ditolak',
      description: 'Halaman tersebut hanya dapat diakses oleh akun Petani.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'warning'
    })
  }

  if (route.query.notkonsumen && user.value?.peran !== 'Konsumen') {
    toast.add({
      id: 'akses-ditolak-konsumen',
      title: 'Akses ke halaman ini ditolak',
      description: 'Halaman tersebut hanya dapat diakses oleh akun Konsumen.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'warning'
    })
  }
})
</script>

<template>
  <div>
    <Header />
    <UContainer class="flex min-h-[calc(100dvh-var(--ui-header-height))] flex-col items-center justify-center py-12 text-center">
      <AppLogo class="mb-6 size-24" />
      <h1 class="mb-3 text-3xl font-bold sm:text-4xl">
        Selamat Datang di <span class="text-primary">{{ config.public.appName }}</span>
      </h1>
      <p class="mb-8 max-w-md text-base text-muted">
        Platform jual beli hasil panen langsung antara petani dan konsumen.
      </p>

      <div
        v-if="!loggedIn"
        class="flex flex-wrap items-center justify-center gap-3"
      >
        <UButton
          to="/login"
          color="primary"
          variant="solid"
          size="lg"
          class="min-h-11"
        >
          Masuk
        </UButton>
        <UButton
          to="/register"
          color="neutral"
          variant="outline"
          size="lg"
          class="min-h-11"
        >
          Daftar Akun
        </UButton>
      </div>

      <div
        v-else
        class="flex flex-wrap items-center justify-center gap-3"
      >
        <UButton
          v-if="isPetani"
          to="/farmer-dashboard/produk"
          color="primary"
          variant="solid"
          size="lg"
          icon="i-heroicons-shopping-bag"
          class="min-h-11"
        >
          Kelola Produk
        </UButton>
        <UButton
          to="/dashboard"
          :color="isPetani ? 'neutral' : 'primary'"
          :variant="isPetani ? 'outline' : 'solid'"
          size="lg"
          icon="i-heroicons-home"
          class="min-h-11"
        >
          Ke Dashboard
        </UButton>
        <UButton
          to="/profil"
          color="neutral"
          variant="outline"
          size="lg"
          icon="i-heroicons-user"
          class="min-h-11"
        >
          Profil Saya
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
