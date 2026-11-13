<script setup lang="ts">
import { z } from "zod";

const roleItems = [
  { label: "Konsumen", value: "Konsumen", description: "Saya ingin membeli produk" },
  { label: "Petani", value: "Petani", description: "Saya ingin menjual hasil tani" },
];

const schema = z
  .object({
    nama: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    kataSandi: z.string().min(8, "Password minimal 8 karakter"),
    confirmKataSandi: z.string(),
    peran: z.enum(["Petani", "Konsumen"]),
  })
  .refine((v) => v.kataSandi === v.confirmKataSandi, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmKataSandi"],
  });

const state = reactive({
  nama: "",
  email: "",
  kataSandi: "",
  confirmKataSandi: "",
  peran: "Konsumen" as "Petani" | "Konsumen",
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
        nama: state.nama,
        email: state.email,
        kataSandi: state.kataSandi,
        peran: state.peran,
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
  <Header />
  <UContainer class="min-h-[calc(100dvh-var(--ui-header-height))] flex items-center justify-center">
    <UCard class="w-full max-w-fit">
      <template #header>
        <h1 class="font-semibold">Buat Akun</h1>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <div class="flex gap-3">
          <UFormField label="Nama" name="nama">
            <UInput v-model="state.nama" class="w-full" />
          </UFormField>

          <UFormField label="Email" name="email" class="">
            <UInput v-model="state.email" type="email" class="w-full" />
          </UFormField>
        </div>

        <div class="flex gap-3">
          <UFormField label="Password" name="kataSandi">
            <UInput v-model="state.kataSandi" type="password" class="w-full" />
          </UFormField>

          <UFormField label="Konfirmasi Password" name="confirmKataSandi">
            <UInput v-model="state.confirmKataSandi" type="password" class="w-full" />
          </UFormField>

        </div>
        <div class="flex justify-center">
          <UFormField label="Daftar sebagai" name="peran">
            <URadioGroup v-model="state.peran" :items="roleItems" orientation="horizontal" />
          </UFormField>
        </div>

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
