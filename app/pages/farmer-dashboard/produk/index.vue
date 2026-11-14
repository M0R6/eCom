<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

definePageMeta({ middleware: 'petani' })

interface Produk {
  idProduk: number
  nama: string
  harga: number | string   
  stok: number | null
  satuan: string | null
  status: 'Tersedia' | 'Habis' | 'Disembunyikan' | null
  kategori: { nama: string } | null
  gambarproduk: { tautanGambar: string }[]
}

const toast = useToast()
const { data: produkList, refresh, status } = await useFetch<Produk[]>('/api/produk')

const statusColor = { Tersedia: 'success', Habis: 'warning', Disembunyikan: 'neutral' } as const
const loadingHapus = ref<number | null>(null)

async function hapus(id: number) {
  loadingHapus.value = id
  try {
    const res = await $fetch<{ disembunyikan: boolean }>(`/api/produk/${id}`, { method: 'DELETE' })
    toast.add({
      id: `produk-hapus-${id}`,
      title: res.disembunyikan ? 'Produk disembunyikan' : 'Produk dihapus',
      description: res.disembunyikan
        ? 'Produk pernah dibeli, jadi hanya disembunyikan dari katalog.'
        : undefined,
      color: 'success',
    })
    await refresh()
  } catch (err: any) {
    toast.add({ id: `produk-hapus-gagal-${id}`, title: 'Gagal menghapus', description: err?.statusMessage, color: 'error' })
  } finally {
    loadingHapus.value = null
  }
}
</script>

<template>
  <div>
    <Header />
    <UContainer class="py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">Produk Saya</h1>
        <UButton to="/farmer-dashboard/produk/baru" icon="i-heroicons-plus">
          Posting Produk
        </UButton>
      </div>

      <div v-if="status === 'pending'" class="text-muted py-12 text-center">Memuat…</div>

      <div v-else-if="produkList?.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="p in produkList" :key="p.idProduk" variant="outline">
          <template #header>
            <img
              :src="p.gambarproduk?.[0]?.tautanGambar || 'https://placehold.co/600x400?text=Tanpa+Foto'"
              :alt="p.nama"
              class="w-full h-40 object-cover rounded"
            />
          </template>

          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-medium">{{ p.nama }}</p>
              <p class="text-sm text-muted">{{ p.kategori?.nama ?? 'Tanpa kategori' }}</p>
            </div>
            <UBadge :label="p.stok < 10 ? 'Habis' : 'Tersedia'" :color="statusColor[p.status ?? 'Tersedia']" variant="subtle" />
          </div>

          <p class="mt-2 font-semibold">
            Rp{{ Number(p.harga).toLocaleString('id-ID') }}
            <span class="text-sm font-normal text-muted">/ {{ p.satuan }}</span>
          </p>
          <p class="text-sm text-muted">Stok: {{ p.stok ?? 0 }}</p>

          <template #footer>
            <div class="flex justify-between gap-2">
              <UButton
                :to="`/farmer-dashboard/produk/${p.idProduk}/edit`"
                icon="i-heroicons-pencil"
                variant="soft"
                size="sm"
              >Edit</UButton>
              <UButton
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                size="sm"
                :loading="loadingHapus === p.idProduk"
                @click="hapus(p.idProduk)"
              >Hapus</UButton>
            </div>
          </template>
        </UCard>
      </div>

      <UEmpty
        v-else
        icon="i-heroicons-shopping-basket"
        description="Belum ada hasil panen. Klik 'Posting Panen' untuk mulai berjualan."
      />
    </UContainer>
  </div>
</template>