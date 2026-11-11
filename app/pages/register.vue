<script setup lang="ts">
import { z } from "zod";

const roleItems = [
  { label: "Pembeli", value: "0", description: "Saya ingin membeli produk" },
  { label: "Petani", value: "1", description: "Saya ingin menjual hasil tani" },
];

const schema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
    role: z.enum(["0", "1"]),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

const state = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "0",
});

const toast = useToast();
const { fetch: refreshSession } = useUserSession();
const loading = ref(false);

async function onSubmit() {
  loading.value = true;
  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: {
        name: state.name,
        email: state.email,
        password: state.password,
        role: state.role === "1",
      },
    });
    await refreshSession();
    toast.add({ title: "Registrasi berhasil", color: "success" });
    await navigateTo("/dashboard");
  } catch (e: any) {
    toast.add({
      title: "Gagal registrasi",
      description: e?.data?.statusMessage || e?.statusMessage || "Terjadi kesalahan",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UContainer class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h1 class="font-semibold">Buat Akun</h1>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Nama" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" class="w-full" />
        </UFormField>

        <UFormField label="Daftar sebagai" name="role">
          <URadioGroup v-model="state.role" :items="roleItems" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>

        <UFormField label="Konfirmasi Password" name="confirmPassword">
          <UInput v-model="state.confirmPassword" type="password" class="w-full" />
        </UFormField>

        <UButton type="submit" block :loading="loading">Daftar</UButton>
      </UForm>

      <template #footer>
        <p class="text-sm text-center text-muted">
          Sudah punya akun?
          <NuxtLink to="/login" class="text-primary font-medium">Login</NuxtLink>
        </p>
      </template>
    </UCard>
  </UContainer>
</template>
