<script setup lang="ts">
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Wajib diisi"),
});

const state = reactive({ email: "", password: "" });
const toast = useToast();
const { fetch: refreshSession } = useUserSession();
const loading = ref(false);

async function onSubmit() {
  loading.value = true;
  try {
    await $fetch("/api/auth/login", { method: "POST", body: state });
    await refreshSession();
    await navigateTo("/dashboard");
  } catch (e: any) {
    toast.add({ title: "Gagal login", description: e.statusMessage, color: "error" });
  } finally {
    loading.value = false;
  }
}

const route = useRoute()

if (route.query.unauthorized) {
  toast.add({
    title: 'Anda belum login!',
    description: 'Lakukan autentikasi terlebih dahulu!',
    icon: 'i-heroicons-exclamation-triangle',
    color: 'warning',
  })
}
</script>

<template>
   <Header />
  <UContainer class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-sm">
      <template #header><h1 class="font-semibold">Login</h1></template>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" class="w-full" />
        </UFormField>
        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>
        <UButton type="submit" block :loading="loading">Masuk</UButton>
      </UForm>
      <template #footer>
         <p class="text-sm text-center text-muted">
         Belum punya akun?
         <NuxtLink to="/register" class="text-primary font-medium">Daftar</NuxtLink>
         </p>
      </template>
    </UCard>
  </UContainer>
</template>
