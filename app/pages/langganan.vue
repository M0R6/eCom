<script setup lang="ts">
definePageMeta({ middleware: 'konsumen' })

type StatusLangganan = 'Aktif' | 'Jeda' | 'Berhenti'

interface Langganan {
  idLangganan: number
  status: StatusLangganan | null
  frekuensi: 'Harian' | 'Mingguan' | 'Bulanan'
  tanggalPengirimanBerikutnya: string
  alamat: { alamatTersimpan: string | null, namaPenerima: string | null, detailAlamat: string | null }
  itemlangganan: { idItemLangganan: number, jumlah: number, produk: { nama: string, satuan: string | null } }[]
}

const WARNA = { Aktif: 'success', Jeda: 'neutral', Berhenti: 'neutral' } as const

const toast = useToast()
const { data: daftar, refresh, status: statusMuat, error } = await useFetch<Langganan[]>('/api/langganan')

const loadingId = ref<number | null>(null)
const idBerhenti = ref<number | null>(null)

const tanggal = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long', timeZone: 'UTC' })

async function ubah(id: number, status: StatusLangganan) {
  loadingId.value = id
  try {
    await $fetch(`/api/langganan/${id}`, { method: 'PUT', body: { status } })
    toast.add({
      id: `langganan-${id}`,
      title: status === 'Aktif' ? 'Langganan dilanjutkan' : status === 'Jeda' ? 'Langganan dijeda' : 'Langganan dihentikan',
      color: 'success'
    })
    await refresh()
  } catch (err: any) {
    toast.add({
      id: `langganan-gagal-${id}`,
      title: 'Gagal mengubah langganan',
      description: err?.data?.statusMessage || err?.statusMessage,
      color: 'error'
    })
  } finally {
    loadingId.value = null
  }
}

async function konfirmasiBerhenti() {
  if (idBerhenti.value === null) return
  const id = idBerhenti.value
  idBerhenti.value = null
  await ubah(id, 'Berhenti')
}
</script>

<template>
  <div>
    <Header />
    <UContainer class="max-w-3xl py-8">
      <h1 class="mb-6 text-2xl font-semibold">
        Langganan Rutin
      </h1>

      <div
        v-if="statusMuat === 'pending'"
        class="py-12 text-center text-muted"
      >
        Memuat langganan…
      </div>

      <div
        v-else-if="error"
        class="py-12 text-center"
      >
        <p class="mb-3 text-error">
          {{ error.data?.statusMessage || 'Langganan gagal dimuat.' }}
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
        class="space-y-4"
      >
        <UCard
          v-for="l in daftar"
          :key="l.idLangganan"
          variant="outline"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-medium">
                Langganan #{{ l.idLangganan }} · {{ l.frekuensi }}
              </p>
              <p class="text-sm text-muted">
                Pengiriman berikutnya: {{ tanggal(l.tanggalPengirimanBerikutnya) }}
              </p>
            </div>
            <UBadge
              :label="l.status ?? 'Aktif'"
              :color="WARNA[l.status ?? 'Aktif']"
              variant="subtle"
            />
          </div>

          <ul class="mt-3 space-y-1 text-sm">
            <li
              v-for="i in l.itemlangganan"
              :key="i.idItemLangganan"
            >
              {{ i.jumlah }}× {{ i.produk.nama }}<span v-if="i.produk.satuan"> ({{ i.produk.satuan }})</span>
            </li>
          </ul>

          <p class="mt-3 text-sm text-muted">
            Kirim ke: {{ l.alamat.alamatTersimpan || 'Alamat' }}, {{ l.alamat.detailAlamat }}
          </p>

          <template
            v-if="l.status !== 'Berhenti'"
            #footer
          >
            <div class="flex items-center justify-between gap-3">
              <USwitch
                :model-value="l.status === 'Aktif'"
                :label="l.status === 'Aktif' ? 'Aktif' : 'Dijeda'"
                :disabled="loadingId === l.idLangganan"
                @update:model-value="(v: boolean) => ubah(l.idLangganan, v ? 'Aktif' : 'Jeda')"
              />
              <UButton
                icon="i-heroicons-stop-circle"
                color="error"
                variant="ghost"
                class="min-h-11"
                :disabled="loadingId === l.idLangganan"
                @click="idBerhenti = l.idLangganan"
              >
                Berhenti
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <UEmpty
        v-else
        icon="i-heroicons-arrow-path"
        description="Belum ada langganan. Buka halaman sebuah produk untuk mulai berlangganan."
      />

      <UModal
        :open="idBerhenti !== null"
        title="Hentikan langganan?"
        description="Langganan yang dihentikan tidak bisa diaktifkan lagi. Kamu perlu membuat langganan baru."
        @update:open="(v: boolean) => { if (!v) idBerhenti = null }"
      >
        <template #footer>
          <div class="flex w-full justify-end gap-2">
            <UButton
              color="neutral"
              variant="outline"
              class="min-h-11"
              @click="idBerhenti = null"
            >
              Kembali
            </UButton>
            <UButton
              color="error"
              class="min-h-11"
              @click="konfirmasiBerhenti"
            >
              Hentikan
            </UButton>
          </div>
        </template>
      </UModal>
    </UContainer>
  </div>
</template>
