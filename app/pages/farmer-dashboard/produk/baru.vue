<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'petani' })

const toast = useToast()

const schema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter').max(150),
  deskripsi: z.string().optional(),
  harga: z.number({ message: 'Harga wajib diisi' }).positive('Harga harus lebih dari 0'),
  stok: z.number({ message: 'Stok wajib diisi' }).int().min(0, 'Stok tidak boleh minus'),
  satuan: z.string().min(1, 'Satuan wajib diisi').max(20),
  idKategori: z.number().optional(),
  status: z.enum(['Tersedia', 'Habis', 'Disembunyikan'], { message: 'Status wajib dipilih' }),
})
type Input = z.infer<typeof schema>

const { data: kategoriList } = await useFetch<{ idKategori: number, nama: string }[]>('/api/kategori')
const kategoriItems = computed(() =>
  (kategoriList.value ?? []).map(k => ({ label: k.nama, value: k.idKategori })),
)

const state = reactive<Input>({
  nama: '',
  deskripsi: '',
  harga: 0,
  stok: 0,
  satuan: 'kg',
  idKategori: undefined,
  status: 'Tersedia',
})

const loading = ref(false)
const gambar = ref<File | null>(null)
const gambarPreview = ref<string | null>(null)

function pilihGambar(event: Event) {
  const input = event.target as HTMLInputElement
  gambar.value = input.files?.[0] ?? null
  gambarPreview.value = gambar.value ? URL.createObjectURL(gambar.value) : null
}

async function onSubmit(e: FormSubmitEvent<Input>) {
  loading.value = true
  try {
    const body = new FormData()
    body.append('nama', e.data.nama)
    body.append('deskripsi', e.data.deskripsi ?? '')
    body.append('harga', String(e.data.harga))
    body.append('stok', String(e.data.stok))
    body.append('satuan', e.data.satuan)
    if (e.data.idKategori !== undefined) body.append('idKategori', String(e.data.idKategori))
    if (gambar.value) body.append('gambar', gambar.value)

    await $fetch('/api/produk', { method: 'POST', body })
    toast.add({ id: 'produk-dibuat', title: 'Hasil panen berhasil diposting!', color: 'success' })
    await navigateTo('/farmer-dashboard/produk')
  } catch (err: any) {
    toast.add({ id: 'produk-gagal', title: 'Gagal menyimpan', description: err?.statusMessage, color: 'error' })
  } finally {
    loading.value = false
  }
}

async function fetchKategori() {
  try {
    const res = await $fetch<{ idKategori: number, nama: string }[]>('/api/kategori')
    kategoriList.value = res
  } catch (err: any) {
    toast.add({ id: 'kategori-gagal', title: 'Gagal memuat kategori', description: err?.statusMessage, color: 'error' })
  }
}

fetchKategori()

import type { RadioGroupItem } from '@nuxt/ui'

const items = ref<RadioGroupItem[]>([
  {
    label: 'Publikasikan',
    value: state.stok > 0 ? 'Tersedia' : 'Habis',
  },
  {
    label: 'Draft',
    value: 'Disembunyikan'
  }
])
</script>

<template>
  <div>
    <Header />
    <UContainer class="py-8 max-w-2xl">
      <h1 class="text-2xl font-semibold mb-6">Posting Hasil Panen</h1>

      <UCard>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Nama Produk" name="nama">
            <UInput v-model="state.nama" placeholder="cth: Bayam Hijau" class="w-full" />
          </UFormField>

          <UFormField label="Kategori" name="idKategori">
            <USelect
              v-model="state.idKategori"
              :items="kategoriItems"
              placeholder="Pilih kategori"
              class="w-full"
            />
          </UFormField>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Harga (Rp)" name="harga">
                <UInputNumber v-model="state.harga" :min="0" class="w-full" />
              </UFormField>
              <UFormField label="Stok" name="stok">
                <UInputNumber v-model="state.stok" :min="0" class="w-full" />
              </UFormField>
              <UFormField label="Satuan" name="satuan" class="col-span-2">
                <USelect
                  v-model="state.satuan"
                  :items="['kg', 'ikat', 'buah', 'porsian', 'karung']"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="Foto Produk">
              <UInput type="file" accept="image/*" class="w-full" @change="pilihGambar" />
              <img
                v-if="gambarPreview"
                :src="gambarPreview"
                alt="Pratinjau foto produk"
                class="mt-3 h-32 w-full rounded object-cover"
              >
              <p class="mt-2 text-xs text-muted">Format gambar, maksimal 5 MB.</p>
            </UFormField>
          </div>
          
          <UFormField label="Deskripsi" name="deskripsi">
            <UTextarea v-model="state.deskripsi" :rows="3" class="w-full"
              placeholder="Ceritakan kualitas panenmu…" />
          </UFormField>
          
          <UFormField label="Status" name="status">
            <URadioGroup orientation="horizontal" v-model="state.status" :items="items" class="flex gap-4"  />
          </UFormField>

          <UButton type="submit" block :loading="loading">Posting</UButton>
        </UForm>
      </UCard>
    </UContainer>
  </div>
</template>