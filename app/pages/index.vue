<script setup lang="ts">
const { user } = useUserSession();
const route = useRoute()

if (route.query.notfarmer && user.value?.role !== true) {
  useToast().add({
    title: 'Akses ke halaman ini ditolak!',
    description: 'Role tidak sesuai',
    icon: 'i-heroicons-exclamation-triangle',
    color: 'warning',
  })
}
</script>
<template>
  <Header />
  <main class="flex flex-col items-center justify-center min-h-screen py-12">
    <AppLogo class="w-24 h-24 mb-6" />
    <h1 class="text-4xl font-bold mb-4">Welcome to Nuxt UI</h1>
    <p class="text-lg text-gray-600 mb-8 text-center">
      This is a starter template for building Nuxt 3 applications with Nuxt UI.
    </p>
    <div class="flex space-x-4">
      <NuxtLink
        to="/docs/getting-started"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Get Started
      </NuxtLink>
      <NuxtLink
        to="/docs/components"
        class="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
      >
        Explore Components
      </NuxtLink>
    </div>
  </main>
</template>

