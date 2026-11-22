<script setup lang="ts">
definePageMeta({ middleware: 'konsumen' })

type StatusPesanan = 'Menunggu_Pembayaran' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan'

interface Pesanan {
  idPesanan: number
  status: StatusPesanan
  jumlahTotal: number
  alamatPengiriman: string
  dibuatPada: string | null
  barang: { idBarangPesanan: number, namaProduk: string | null, harga: number, jumlah: number, subtotal: number }[]
  riwayat: { statusLama: string | null, statusBaru: string | null, catatan: string | null, dibuatPada: string | null }[]
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
const DOT = {
  Menunggu_Pembayaran: 'bg-warning',
  Diproses: 'bg-info',
  Dikirim: 'bg-info',
  Selesai: 'bg-success',
  Dibatalkan: 'bg-error'
} as const

const route = useRoute()
const toast = useToast()
const { data: pesanan, status: statusMuat, error, refresh } = await useFetch<Pesanan>(`/api/pesanan/${route.params.id}`)
const pembayaranLoading = ref(false)

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`
const tanggal = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'
const labelStatus = (s: string | null) => (s && LABEL[s as StatusPesanan]) || s || '-'
const dotStatus = (s: string | null) => (s ? DOT[s as StatusPesanan] : 'bg-elevated')

async function paid() {
  if (!pesanan.value || pembayaranLoading.value) return
  pembayaranLoading.value = true
  try {
    await $fetch(`/api/pesanan/bayar/${pesanan.value.idPesanan}`, { method: 'PUT' })
    await refresh()
    toast.add({ id: 'bayar-ok', title: 'Pembayaran berhasil!', color: 'success' })
  } catch (err) {
    toast.add({
      id: 'bayar-err',
      title: 'Gagal melakukan pembayaran',
      description: (err as { data?: { statusMessage?: string } })?.data?.statusMessage,
      color: 'error'
    })
  } finally {
    pembayaranLoading.value = false
  }
}
</script>

<template>
  <div>
    <Header />
    <UContainer class="max-w-3xl py-8">
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
          to="/pesanan"
          color="neutral"
          variant="outline"
          class="min-h-11"
        >
          Kembali ke Pesanan
        </UButton>
      </div>

      <template v-else-if="pesanan">
        <div class="mb-6 flex items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-2xl font-semibold">
                Pesanan #{{ pesanan.idPesanan }}
              </h1>
              <UBadge
                :label="LABEL[pesanan.status]"
                :color="WARNA[pesanan.status]"
                variant="subtle"
              />
            </div>
            <p class="mt-1 text-sm text-muted">
              Dibuat: {{ tanggal(pesanan.dibuatPada) }}
            </p>
          </div>
          <UButton
            to="/pesanan"
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-left"
            size="sm"
          >
            Riwayat
          </UButton>
        </div>

        <UCard
          variant="outline"
          class="mb-4"
        >
          <p class="text-xs text-muted mb-1">
            Kirim ke
          </p>
          <p class="text-sm">
            {{ pesanan.alamatPengiriman }}
          </p>
        </UCard>

        <h2 class="mb-3 text-lg font-medium">
          Barang
        </h2>
        <UCard
          variant="outline"
          class="mb-6"
        >
          <ul class="space-y-2 text-sm">
            <li
              v-for="b in pesanan.barang"
              :key="b.idBarangPesanan"
              class="flex justify-between gap-4"
            >
              <span>{{ b.jumlah }}× {{ b.namaProduk ?? 'Produk' }}</span>
              <span class="shrink-0 tabular-nums">{{ rupiah(b.subtotal) }}</span>
            </li>
          </ul>
          <USeparator class="my-3" />
          <div class="flex justify-between font-semibold">
            <span>Total</span>
            <span class="text-lg">{{ rupiah(pesanan.jumlahTotal) }}</span>
          </div>
        </UCard>

        <h2 class="mb-3 text-lg font-medium">
          Lacak Pesanan
        </h2>
        <UCard variant="outline">
          <ol
            v-if="pesanan.riwayat.length"
            class="relative border-l border-default ml-2 space-y-4"
          >
            <li
              v-for="(r, idx) in pesanan.riwayat"
              :key="idx"
              class="pl-4 relative"
            >
              <span
                class="absolute -left-1.25 top-1.5 size-2.5 rounded-full"
                :class="dotStatus(r.statusBaru)"
              />
              <p class="text-sm font-medium">
                {{ labelStatus(r.statusBaru) }}
              </p>
              <p
                v-if="r.catatan"
                class="text-xs text-muted"
              >
                {{ r.catatan }}
              </p>
              <p class="text-xs text-muted">
                {{ tanggal(r.dibuatPada) }}
              </p>
            </li>
          </ol>
          <p
            v-else
            class="text-sm text-muted"
          >
            Belum ada riwayat status.
          </p>
        </UCard>
        <UCard
          v-if="pesanan.status === 'Menunggu_Pembayaran'"
          variant="soft"
          class="mt-6 flex flex-col items-center gap-4 text-center"
        >
          <p class="text-sm text-muted mb-3 text-center">
            Silakan lakukan pembayaran untuk memproses pesanan ini.
          </p>
          <img src="/QRIS.png" alt="Pembayaran" class="w-sm h-auto" />
          <UButton
            :loading="pembayaranLoading"
            :disabled="pembayaranLoading"
            @click="paid()"
            class="min-h-11"
            variant="solid"
            color="info"
          >
            Sudah bayar? klik di sini!
          </UButton>
        </UCard>
      </template>
    </UContainer>
  </div>
</template>
