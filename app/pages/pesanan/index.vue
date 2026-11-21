<script setup lang="ts">
definePageMeta({ middleware: 'konsumen' })

type StatusPesanan = 'Menunggu_Pembayaran' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan'

interface Pesanan {
  idPesanan: number
  status: StatusPesanan
  jumlahTotal: number
  dibuatPada: string | null
  barang: { namaProduk: string | null, jumlah: number, subtotal: number }[]
}

const LABEL: Record<StatusPesanan, string> = {
  Menunggu_Pembayaran: 'Menunggu Pembayaran',
  Diproses: 'Diproses',
  Dikirim: 'Dikirim',
  Selesai: 'Selesai',
  Dibatalkan: 'Dibatalkan'
}
const WARNA = {
  Menunggu_Pembayaran: 'warning',
  Diproses: 'info',
  Dikirim: 'info',
  Selesai: 'success',
  Dibatalkan: 'error'
} as const

const { data: daftar, status: statusMuat, error, refresh } = await useFetch<Pesanan[]>('/api/pesanan')

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`
const tanggal = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'
</script>

<template>
  <div>
    <Header />
    <UContainer class="max-w-3xl py-8">
      <h1 class="mb-6 text-2xl font-semibold">
        Pesanan Saya
      </h1>

      <div
        v-if="statusMuat === 'pending'"
        class="py-12 text-center text-muted"
      >
        Memuat pesanan…
      </div>
      <div
        v-else-if="error"
        class="py-12 text-center"
      >
        <p class="mb-3 text-error">
          {{ error.statusMessage || 'Pesanan gagal dimuat.' }}
        </p>
        <UButton
          color="neutral"
          variant="outline"
          class="min-h-11"
          @click="refresh()"
        >
          Coba lagi
        </UButton>
      </div>

      <div
        v-else-if="daftar?.length"
        class="space-y-3"
      >
        <UCard
          v-for="p in daftar"
          :key="p.idPesanan"
          variant="outline"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold">#{{ p.idPesanan }}</span>
                <UBadge
                  :label="LABEL[p.status]"
                  :color="WARNA[p.status]"
                  variant="subtle"
                  size="sm"
                />
              </div>
              <p class="mt-1 text-sm text-muted truncate">
                {{ p.barang.map(b => `${b.jumlah}× ${b.namaProduk ?? 'Produk'}`).join(', ') }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ tanggal(p.dibuatPada) }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="font-semibold">
                {{ rupiah(p.jumlahTotal) }}
              </p>
              <UButton
                :to="`/pesanan/${p.idPesanan}`"
                color="neutral"
                variant="outline"
                size="xs"
                class="mt-2"
              >
                Lihat
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <div
        v-else
        class="py-12 text-center"
      >
        <UEmpty
          icon="i-lucide-package"
          description="Belum ada pesanan. Yuk belanja dulu."
        />
        <UButton
          to="/katalog"
          class="mt-4 min-h-11"
        >
          Ke Katalog
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
