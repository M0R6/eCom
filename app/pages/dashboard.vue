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
  <UContainer class="py-10 space-y-4">
    <h1 class="text-xl font-semibold">Halo, {{ user?.name }} <span class="text-sm text-gray-400" >({{ user?.role ? "Petani" : "Costumer" }})</span></h1>
    <UButton color="neutral" variant="outline" @click="logout">Logout</UButton>
  </UContainer>
</template>