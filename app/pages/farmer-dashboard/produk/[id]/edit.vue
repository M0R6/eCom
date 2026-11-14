<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'petani' })
const route = useRoute()
const toast = useToast()

const schema = z.object({
  nama: z.string().min(3).max(150),
  deskripsi: z.string().optional(),
  harga: z.number().positive(),
  stok: z.number().int().min(0),
  satuan: z.string().min(1).max(20),
  status: z.enum(['Tersedia', 'Habis', 'Disembunyikan']),
  idKategori: z.number().nullable(),
})
type Input = z.infer<typeof schema>

const { data: produk, error } = await useFetch(`/api/produk/${route.params.id}`)

if (error.value) throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })

const state = reactive<Input>({
  nama: produk.value?.nama ?? '',
  deskripsi: produk.value?.deskripsi ?? '',
  harga: Number(produk.value?.harga ?? 0),
  stok: produk.value?.stok ?? 0,
  satuan: produk.value?.satuan ?? 'kg',
  status: produk.value?.status ?? 'Tersedia',
  idKategori: produk.value?.idKategori ?? null,
})

const loading = ref(false)

async function onSubmit(e: FormSubmitEvent<Input>) {
  loading.value = true
  try {
    await $fetch(`/api/produk/${route.params.id}` as string, { method: 'PUT', body: e.data })
    toast.add({ id: 'produk-diupdate', title: 'Perubahan tersimpan', color: 'success' })
    await navigateTo('/farmer-dashboard/produk')
  } catch (err: any) {
    toast.add({ id: 'produk-update-gagal', title: 'Gagal menyimpan', description: err?.statusMessage, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <Header />
    <UContainer class="py-8 max-w-2xl">
      <h1 class="text-2xl font-semibold mb-6">Edit Hasil Panen</h1>

      <UCard>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Nama Produk" name="nama">
            <UInput v-model="state.nama" class="w-full" />
          </UFormField>

          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Harga (Rp)" name="harga">
              <UInputNumber v-model="state.harga" :min="0" class="w-full" />
            </UFormField>
            <UFormField label="Stok" name="stok">
              <UInputNumber v-model="state.stok" :min="0" class="w-full" />
            </UFormField>
            <UFormField label="Satuan" name="satuan">
              <USelect v-model="state.satuan" :items="['kg', 'ikat', 'buah', 'porsian', 'karung']" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Status Tampil" name="status">
            <USelect
              v-model="state.status"
              :items="[
                { label: 'Tersedia (tampil di katalog)', value: 'Tersedia' },
                { label: 'Habis', value: 'Habis' },
                { label: 'Draft/arsip', value: 'Disembunyikan' },
              ]"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Deskripsi" name="deskripsi">
            <UTextarea v-model="state.deskripsi" :rows="3" class="w-full" />
          </UFormField>

          <UButton type="submit" block :loading="loading">Simpan Perubahan</UButton>
        </UForm>
      </UCard>
    </UContainer>
  </div>
</template>