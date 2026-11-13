<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { user, clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <Header />
  <UContainer class="py-10 space-y-4">
    <h1 class="text-xl font-semibold">Halo, {{ user?.nama }} <span class="text-sm text-gray-400" >({{ user?.peran === "Petani" ? "Petani" : "Konsumen" }})</span></h1>
    <UButton color="neutral" variant="outline" to="/profil">Lihat profil</UButton>
    <UButton color="neutral" variant="outline" @click="logout">Logout</UButton>
  </UContainer>
</template>