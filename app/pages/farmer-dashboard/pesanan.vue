<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

definePageMeta({ middleware: 'petani' })

type StatusPesanan = 'Menunggu_Pembayaran' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan'

interface PesananMasuk {
  idPesanan: number
  status: StatusPesanan
  namaKonsumen: string
  alamatPengiriman: string
  dibuatPada: string | null
  barang: { idBarangPesanan: number, namaProduk: string | null, jumlah: number, satuan: string | null, subtotal: number }[]
  totalBagianku: number
  transisi: StatusPesanan[]
}

interface Ringkasan {
  pesananBaru: number
  perluDikirim: number
  omzetBulanIni: number
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

const filterItems = [
  { label: 'Semua', value: 'semua' },
  { label: 'Menunggu', value: 'Menunggu_Pembayaran' },
  { label: 'Diproses', value: 'Diproses' },
  { label: 'Dikirim', value: 'Dikirim' },
  { label: 'Selesai', value: 'Selesai' },
  { label: 'Dibatalkan', value: 'Dibatalkan' }
]

const toast = useToast()
const filter = ref('semua')

const { data: pesanan, refresh, status: statusMuat, error } = await useFetch<PesananMasuk[]>('/api/petani/pesanan', {
  query: { status: computed(() => (filter.value === 'semua' ? undefined : filter.value)) }
})
const { data: ringkasan, refresh: refreshRingkasan } = await useFetch<Ringkasan>('/api/petani/pesanan/ringkasan')

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`
const tanggal = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'

const loadingId = ref<number | null>(null)

async function ubahStatus(id: number, status: StatusPesanan, catatan?: string) {
  loadingId.value = id
  try {
    await $fetch(`/api/petani/pesanan/${id}/status`, { method: 'PUT', body: { status, catatan } })
    toast.add({ id: `pesanan-status-${id}`, title: `Pesanan #${id} ${LABEL[status].toLowerCase()}`, color: 'success' })
    await Promise.all([refresh(), refreshRingkasan()])
  } catch (err: any) {
    toast.add({
      id: `pesanan-status-gagal-${id}`,
      title: 'Gagal mengubah status',
      description: err?.data?.statusMessage || err?.statusMessage,
      color: 'error'
    })
  } finally {
    loadingId.value = null
  }
}

function menuStatus(p: PesananMasuk): DropdownMenuItem[] {
  return p.transisi.map(s => ({
    label: s === 'Dibatalkan' ? 'Batalkan pesanan' : `Tandai ${LABEL[s].toLowerCase()}`,
    icon: s === 'Dibatalkan' ? 'i-heroicons-x-circle' : 'i-heroicons-check-circle',
    color: s === 'Dibatalkan' ? 'error' : undefined,
    onSelect: () => (s === 'Dibatalkan' ? bukaBatal(p.idPesanan) : ubahStatus(p.idPesanan, s))
  }))
}

// Pembatalan butuh alasan, disimpan ke kolom catatan riwayat
const modalBatal = ref(false)
const idBatal = ref<number | null>(null)
const alasanBatal = ref('')

function bukaBatal(id: number) {
  idBatal.value = id
  alasanBatal.value = ''
  modalBatal.value = true
}

async function konfirmasiBatal() {
  if (idBatal.value === null || !alasanBatal.value.trim()) return
  const id = idBatal.value
  modalBatal.value = false
  await ubahStatus(id, 'Dibatalkan', alasanBatal.value.trim())
}
</script>

<template>
  <div>
    <Header />
    <UContainer class="py-8">
      <h1 class="mb-6 text-2xl font-semibold">
        Pesanan Masuk
      </h1>

      <div class="mb-6 grid gap-4 sm:grid-cols-3">
        <UCard variant="outline">
          <p class="text-sm text-muted">
            Menunggu pembayaran
          </p>
          <p class="text-2xl font-semibold">
            {{ ringkasan?.pesananBaru ?? 0 }}
          </p>
        </UCard>
        <UCard variant="outline">
          <p class="text-sm text-muted">
            Perlu dikirim
          </p>
          <p class="text-2xl font-semibold">
            {{ ringkasan?.perluDikirim ?? 0 }}
          </p>
        </UCard>
        <UCard variant="outline">
          <p class="text-sm text-muted">
            Omzet bulan ini (pesanan selesai)
          </p>
          <p class="text-2xl font-semibold">
            {{ rupiah(ringkasan?.omzetBulanIni ?? 0) }}
          </p>
        </UCard>
      </div>

      <UTabs
        v-model="filter"
        :items="filterItems"
        :content="false"
        class="mb-6"
      />

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
          {{ 'Pesanan gagal dimuat.' }}
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
        v-else-if="pesanan?.length"
        class="space-y-4"
      >
        <UCard
          v-for="p in pesanan"
          :key="p.idPesanan"
          variant="outline"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-medium">
                #{{ p.idPesanan }} · {{ p.namaKonsumen }}
              </p>
              <p class="text-sm text-muted">
                {{ tanggal(p.dibuatPada) }}
              </p>
            </div>
            <UBadge
              :label="LABEL[p.status]"
              :color="WARNA[p.status]"
              variant="subtle"
            />
          </div>

          <ul class="mt-3 space-y-1 text-sm">
            <li
              v-for="b in p.barang"
              :key="b.idBarangPesanan"
              class="flex justify-between gap-4"
            >
              <span>{{ b.jumlah }}× {{ b.namaProduk }}<span v-if="b.satuan"> ({{ b.satuan }})</span></span>
              <span>{{ rupiah(b.subtotal) }}</span>
            </li>
          </ul>

          <p class="mt-3 text-sm text-muted">
            Kirim ke: {{ p.alamatPengiriman }}
          </p>

          <template #footer>
            <div class="flex items-center justify-between gap-3">
              <p class="font-semibold">
                {{ rupiah(p.totalBagianku) }}
              </p>
              <UDropdownMenu
                v-if="p.transisi.length"
                :items="menuStatus(p)"
              >
                <UButton
                  trailing-icon="i-heroicons-chevron-down"
                  color="neutral"
                  variant="outline"
                  class="min-h-11"
                  :loading="loadingId === p.idPesanan"
                >
                  Ubah status
                </UButton>
              </UDropdownMenu>
            </div>
          </template>
        </UCard>
      </div>

      <UEmpty
        v-else
        icon="i-heroicons-inbox"
        description="Belum ada pesanan pada filter ini."
      />

      <UModal
        v-model:open="modalBatal"
        title="Batalkan pesanan"
      >
        <template #body>
          <UFormField
            label="Alasan pembatalan"
            hint="Dicatat di riwayat pesanan"
          >
            <UTextarea
              v-model="alasanBatal"
              :rows="3"
              class="w-full"
              placeholder="Contoh: stok panen gagal"
            />
          </UFormField>
        </template>
        <template #footer>
          <div class="flex w-full justify-end gap-2">
            <UButton
              color="neutral"
              variant="outline"
              class="min-h-11"
              @click="modalBatal = false"
            >
              Kembali
            </UButton>
            <UButton
              color="error"
              class="min-h-11"
              :disabled="!alasanBatal.trim()"
              @click="konfirmasiBatal"
            >
              Batalkan pesanan
            </UButton>
          </div>
        </template>
      </UModal>
    </UContainer>
  </div>
</template>
