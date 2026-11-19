<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'petani' })
const route = useRoute()
const toast = useToast()

interface GambarProduk {
  idGambarProduk: number
  tautanGambar: string
  urutanTampil: number | null
}

interface ProdukDetail {
  idProduk: number
  idKategori: number | null
  nama: string
  deskripsi: string | null
  harga: number | string
  stok: number | null
  satuan: string | null
  status: 'Tersedia' | 'Habis' | 'Disembunyikan' | null
  gambarproduk: GambarProduk[]
}

const schema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter').max(150),
  deskripsi: z.string().optional(),
  harga: z.number({ message: 'Harga wajib diisi' }).positive('Harga harus lebih dari 0'),
  stok: z.number({ message: 'Stok wajib diisi' }).int('Stok harus bilangan bulat').min(0, 'Stok tidak boleh minus'),
  satuan: z.string().min(1, 'Satuan wajib diisi').max(20),
  status: z.enum(['Tersedia', 'Habis', 'Disembunyikan']),
  idKategori: z.number().optional(),
})
type Input = z.infer<typeof schema>

const { data: produk, error } = await useFetch<ProdukDetail>(`/api/produk/${route.params.id}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
}

const state = reactive<Input>({
  nama: produk.value?.nama ?? '',
  deskripsi: produk.value?.deskripsi ?? '',
  harga: Number(produk.value?.harga ?? 0),
  stok: produk.value?.stok ?? 0,
  satuan: produk.value?.satuan ?? 'kg',
  status: produk.value?.status ?? 'Tersedia',
  idKategori: produk.value?.idKategori ?? undefined,
})

// ── Kategori ──────────────────────────────────────────────────────
const { data: kategori } = await useFetch<{ idKategori: number, nama: string }[]>('/api/kategori')

const schemaKategori = computed(() =>
  (kategori.value ?? []).map(k => ({ label: k.nama, value: k.idKategori })),
)

// ── Gambar ────────────────────────────────────────────────────────
const gambarLama = ref<GambarProduk[]>(produk.value?.gambarproduk ?? [])
const gambarDihapus = ref<number[]>([])
const fileBaru = ref<{ file: File, preview: string }[]>([])
const inputFile = ref<HTMLInputElement | null>(null)
const loadingJadikanUtama = ref<number | null>(null)

function pilihFile(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      toast.add({
        id: `file-bukan-gambar-${file.name}`,
        title: 'Berkas bukan gambar',
        description: `${file.name} harus berupa JPG/PNG.`,
        color: 'error',
      })
      continue
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        id: `file-besar-${file.name}`,
        title: 'Gambar terlalu besar',
        description: `${file.name} melebihi 5 MB.`,
        color: 'error',
      })
      continue
    }

    fileBaru.value.push({ file, preview: URL.createObjectURL(file) })
  }

  // reset input supaya file yang sama bisa dipilih ulang
  if (inputFile.value) inputFile.value.value = ''
}

function hapusGambarLama(gambar: GambarProduk) {
  gambarLama.value = gambarLama.value.filter(g => g.idGambarProduk !== gambar.idGambarProduk)
  gambarDihapus.value.push(gambar.idGambarProduk)
}

function hapusFileBaru(index: number) {
  const item = fileBaru.value[index]

  if (!item) return

  URL.revokeObjectURL(item.preview)
  fileBaru.value.splice(index, 1)
}

async function jadikanUtama(gambar: GambarProduk) {
  loadingJadikanUtama.value = gambar.idGambarProduk
  try {
    await $fetch(`/api/produk/${route.params.id}/gambar/${gambar.idGambarProduk}`, {
      method: 'PUT',
    })
    gambarLama.value = [
      gambar,
      ...gambarLama.value.filter(g => g.idGambarProduk !== gambar.idGambarProduk),
    ]
    toast.add({ id: 'gambar-utama', title: 'Gambar utama diperbarui', color: 'success' })
  } catch (err: any) {
    toast.add({
      id: 'gambar-utama-gagal',
      title: 'Gagal mengubah gambar utama',
      description: err?.data?.statusMessage || err?.statusMessage,
      color: 'error',
    })
  } finally {
    loadingJadikanUtama.value = null
  }
}

// ── Submit ────────────────────────────────────────────────────────
const loading = ref(false)

async function onSubmit(e: FormSubmitEvent<Input>) {
  loading.value = true
  try {
    // 1) update data produk
    await $fetch(`/api/produk/${route.params.id}`, { method: 'PUT', body: { ...e.data, idKategori: e.data.idKategori ?? null } })

    // 2) hapus gambar yang ditandai
    for (const idGambar of gambarDihapus.value) {
      await $fetch(`/api/produk/${route.params.id}/gambar/${idGambar}`, { method: 'DELETE' })
    }

    // 3) upload gambar baru satu per satu
    for (const item of fileBaru.value) {
      const body = new FormData()
      body.append('gambar', item.file)
      await $fetch(`/api/produk/${route.params.id}/gambar`, { method: 'POST', body })
    }

    toast.add({ id: 'produk-diupdate', title: 'Perubahan tersimpan', color: 'success' })
    await navigateTo('/farmer-dashboard/produk')
  } catch (err: any) {
    toast.add({
      id: 'produk-update-gagal',
      title: 'Gagal menyimpan',
      description: err?.data?.statusMessage || err?.statusMessage || 'Terjadi kesalahan',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <Header />
    <UContainer class="py-8 max-w-2xl">
      <h1 class="text-2xl font-semibold mb-6">
        Edit Hasil Panen
      </h1>

      <UCard>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
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
              <USelect
                v-model="state.satuan"
                :items="['kg', 'ikat', 'buah', 'porsian', 'karung']"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Kategori" name="idKategori">
            <USelect
              v-model="state.idKategori"
              :items="schemaKategori"
              placeholder="Pilih kategori"
              class="w-full"
            />
          </UFormField>

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

          <UFormField label="Gambar Produk">
            <div class="space-y-3 w-full">
              <!-- Gambar lama -->
              <div v-if="gambarLama.length" class="grid grid-cols-3 gap-3">
                <div
                  v-for="(g, i) in gambarLama"
                  :key="g.idGambarProduk"
                  class="relative group"
                >
                  <img
                    :src="g.tautanGambar"
                    :alt="state.nama"
                    class="w-full h-28 object-cover rounded-lg border"
                  >
                  <UBadge
                    v-if="i === 0"
                    label="Utama"
                    color="success"
                    variant="solid"
                    size="sm"
                    class="absolute top-1 left-1"
                  />
                  <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <UButton
                      v-if="i !== 0"
                      icon="i-heroicons-star"
                      size="xs"
                      color="neutral"
                      :loading="loadingJadikanUtama === g.idGambarProduk"
                      title="Jadikan gambar utama"
                      @click="jadikanUtama(g)"
                    />
                    <UButton
                      icon="i-heroicons-trash"
                      size="xs"
                      color="error"
                      title="Hapus gambar"
                      @click="hapusGambarLama(g)"
                    />
                  </div>
                </div>
              </div>

              <!-- Preview file baru -->
              <div v-if="fileBaru.length" class="grid grid-cols-3 gap-3">
                <div
                  v-for="(f, i) in fileBaru"
                  :key="f.preview"
                  class="relative group"
                >
                  <img
                    :src="f.preview"
                    alt="Preview gambar baru"
                    class="w-full h-28 object-cover rounded-lg border-2 border-primary"
                  >
                  <UBadge label="Baru" size="sm" class="absolute top-1 left-1" />
                  <UButton
                    icon="i-heroicons-x-mark"
                    size="xs"
                    color="error"
                    class="absolute top-1 right-1"
                    title="Batalkan gambar ini"
                    @click="hapusFileBaru(i)"
                  />
                </div>
              </div>

              <UEmpty
                v-if="!gambarLama.length && !fileBaru.length"
                icon="i-heroicons-photo"
                description="Belum ada gambar. Tambahkan minimal satu foto panen."
              />

              <UButton
                icon="i-heroicons-arrow-up-tray"
                variant="soft"
                @click="inputFile?.click()"
              >
                Tambah Gambar
              </UButton>
              <input
                ref="inputFile"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="pilihFile"
              >
              <p class="text-xs text-muted">
                JPG/PNG maksimal 5 MB per gambar. Gambar pertama (bertanda "Utama") tampil di katalog.
              </p>
            </div>
          </UFormField>

          <UButton
            type="submit"
            block
            :loading="loading"
          >
            Simpan Perubahan
          </UButton>
        </UForm>
      </UCard>
    </UContainer>
  </div>
</template>
