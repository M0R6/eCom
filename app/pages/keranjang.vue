<script setup lang="ts">
definePageMeta({ middleware: 'konsumen' })

interface ItemKeranjang {
  idItemKeranjang: number
  jumlah: number
  produk: {
    idProduk: number
    nama: string
    harga: string | number
    stok: number | null
    satuan: string | null
    status: string
    gambarproduk: { tautanGambar: string }[]
  }
}

interface Keranjang {
  idKeranjang: number
  itemkeranjang: ItemKeranjang[]
}

interface Alamat {
  idAlamat: number
  alamatTersimpan: string | null
  namaPenerima: string | null
  detailAlamat: string | null
  kota: string | null
}

const toast = useToast()
const { data: keranjang, refresh, status: statusMuat, error } = await useFetch<Keranjang>('/api/keranjang')
const { data: daftarAlamat } = await useFetch<Alamat[]>('/api/alamat')

const loadingId = ref<number | null>(null)
const hapusId = ref<number | null>(null)
const checkoutOpen = ref(false)
const idAlamatDipilih = ref<number | null>(null)
const checkoutLoading = ref(false)

const harga = (v: string | number) => Number(v)

const total = computed(() =>
  keranjang.value?.itemkeranjang.reduce((s, i) => s + harga(i.produk.harga) * i.jumlah, 0) ?? 0
)

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

async function ubahJumlah(item: ItemKeranjang, delta: number) {
  const jumlahBaru = item.jumlah + delta
  if (jumlahBaru < 1) return
  if (item.produk.stok !== null && jumlahBaru > item.produk.stok) {
    toast.add({ id: 'stok-max', title: 'Stok tidak mencukupi', color: 'warning' })
    return
  }
  loadingId.value = item.idItemKeranjang
  try {
    await $fetch(`/api/keranjang/${item.idItemKeranjang}`, {
      method: 'PUT',
      body: { jumlah: jumlahBaru }
    })
    await refresh()
  } catch (err: any) {
    toast.add({
      id: `err-${item.idItemKeranjang}`,
      title: 'Gagal mengubah jumlah',
      description: err?.data?.statusMessage,
      color: 'error'
    })
  } finally {
    loadingId.value = null
  }
}

async function hapusItem() {
  if (hapusId.value === null) return
  const id = hapusId.value
  hapusId.value = null
  loadingId.value = id
  try {
    await $fetch(`/api/keranjang/${id}`, { method: 'DELETE' })
    toast.add({ id: `hapus-${id}`, title: 'Item dihapus dari keranjang', color: 'success' })
    await refresh()
  } catch (err: any) {
    toast.add({
      id: `err-hapus-${id}`,
      title: 'Gagal menghapus item',
      description: err?.data?.statusMessage,
      color: 'error'
    })
  } finally {
    loadingId.value = null
  }
}

const gambar = (item: ItemKeranjang) =>
  item.produk.gambarproduk?.[0]?.tautanGambar ?? ''

const labelAlamat = (a: Alamat) =>
  a.alamatTersimpan || [a.namaPenerima, a.kota].filter(Boolean).join(', ') || `Alamat #${a.idAlamat}`

async function checkout() {
  if (!idAlamatDipilih.value) {
    toast.add({ id: 'alamat-wajib', title: 'Pilih alamat pengiriman', color: 'warning' })
    return
  }
  checkoutLoading.value = true
  try {
    await $fetch('/api/keranjang/checkout', {
      method: 'POST',
      body: { idAlamat: idAlamatDipilih.value }
    })
    toast.add({ id: 'checkout-ok', title: 'Pesanan berhasil dibuat!', color: 'success' })
    checkoutOpen.value = false
    idAlamatDipilih.value = null
    await refresh()
  } catch (err: any) {
    toast.add({
      id: 'checkout-err',
      title: 'Checkout gagal',
      description: err?.data?.statusMessage,
      color: 'error'
    })
  } finally {
    checkoutLoading.value = false
  }
}
</script>

<template>
  <div>
    <Header />
    <UContainer class="max-w-3xl py-8">
      <h1 class="mb-6 text-2xl font-semibold">
        Keranjang Belanja
      </h1>
      <div v-if="statusMuat === 'pending'" class="py-12 text-center text-muted">
        Memuat keranjang…
      </div>
      <div v-else-if="error" class="py-12 text-center">
        <p class="mb-3 text-error">
          {{ error.data?.statusMessage || 'Keranjang gagal dimuat.' }}
        </p>
        <UButton color="neutral" variant="outline" class="min-h-11" @click="refresh()">
          Coba lagi
        </UButton>
      </div>

      <div v-else-if="keranjang?.itemkeranjang.length" class="space-y-4">
        <UCard
          v-for="item in keranjang.itemkeranjang"
          :key="item.idItemKeranjang"
          variant="outline"
        >
          <div class="flex gap-4">
            <img
              v-if="gambar(item)"
              :src="gambar(item)"
              :alt="item.produk.nama"
              class="size-20 rounded-lg object-cover shrink-0"
            >
            <div
              v-else
              class="size-20 rounded-lg bg-elevated flex items-center justify-center shrink-0"
            >
              <UIcon name="i-lucide-image-off" class="size-8 text-muted" />
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">
                {{ item.produk.nama }}
              </p>
              <p class="text-sm text-muted">
                {{ formatRupiah(harga(item.produk.harga)) }}<span v-if="item.produk.satuan"> / {{ item.produk.satuan }}</span>
              </p>
              <p v-if="item.produk.status === 'Habis'" class="text-sm text-error mt-1">
                Stok habis
              </p>

              <div class="flex items-center gap-2 mt-3">
                <UButton
                  icon="i-lucide-minus"
                  size="xs"
                  color="neutral"
                  variant="outline"
                  :disabled="item.jumlah <= 1 || loadingId === item.idItemKeranjang"
                  @click="ubahJumlah(item, -1)"
                />
                <span class="w-8 text-center text-sm font-medium tabular-nums">{{ item.jumlah }}</span>
                <UButton
                  icon="i-lucide-plus"
                  size="xs"
                  color="neutral"
                  variant="outline"
                  :disabled="loadingId === item.idItemKeranjang"
                  @click="ubahJumlah(item, 1)"
                />
              </div>
            </div>

            <div class="flex flex-col items-end justify-between shrink-0">
              <p class="font-semibold whitespace-nowrap">
                {{ formatRupiah(harga(item.produk.harga) * item.jumlah) }}
              </p>
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                :disabled="loadingId === item.idItemKeranjang"
                @click="hapusId = item.idItemKeranjang"
              />
            </div>
          </div>
        </UCard>

        <UCard variant="soft">
          <div class="flex items-center justify-between">
            <span class="text-lg font-medium">Total</span>
            <span class="text-xl font-bold">{{ formatRupiah(total) }}</span>
          </div>
        </UCard>

        <UButton
          icon="i-lucide-credit-card"
          size="lg"
          block
          class="min-h-11"
          :disabled="!keranjang?.itemkeranjang.length"
          @click="checkoutOpen = true"
        >
          Checkout
        </UButton>
      </div>

      <UEmpty
        v-else
        icon="i-lucide-shopping-cart"
        description="Keranjang kosong. Cari produk dan tambahkan ke keranjang."
      />

      <UModal
        :open="hapusId !== null"
        title="Hapus item dari keranjang?"
        description="Item ini akan dihapus dari keranjang belanja kamu."
        @update:open="(v: boolean) => { if (!v) hapusId = null }"
      >
        <template #footer>
          <div class="flex w-full justify-end gap-2">
            <UButton color="neutral" variant="outline" class="min-h-11" @click="hapusId = null">
              Batal
            </UButton>
            <UButton color="error" class="min-h-11" @click="hapusItem">
              Hapus
            </UButton>
          </div>
        </template>
      </UModal>

      <UModal
        v-model:open="checkoutOpen"
        title="Checkout"
        description="Pilih alamat pengiriman untuk menyelesaikan pesanan."
      >
        <template #default>
          <div class="p-4 space-y-4">
            <div v-if="daftarAlamat?.length">
              <label class="text-sm font-medium mb-2 block">Alamat Pengiriman</label>
              <div class="space-y-2">
                <UCard
                  v-for="a in daftarAlamat"
                  :key="a.idAlamat"
                  variant="outline"
                  class="cursor-pointer transition"
                  :class="idAlamatDipilih === a.idAlamat ? 'ring-2 ring-primary' : ''"
                  @click="idAlamatDipilih = a.idAlamat"
                >
                  <div class="flex items-center gap-3">
                    <UIcon
                      :name="idAlamatDipilih === a.idAlamat ? 'i-lucide-circle-check' : 'i-lucide-circle'"
                      class="size-5 shrink-0"
                      :class="idAlamatDipilih === a.idAlamat ? 'text-primary' : 'text-muted'"
                    />
                    <div>
                      <p class="font-medium text-sm">{{ labelAlamat(a) }}</p>
                      <p v-if="a.detailAlamat" class="text-xs text-muted">{{ a.detailAlamat }}</p>
                    </div>
                  </div>
                </UCard>
              </div>
            </div>
            <UEmpty
              v-else
              icon="i-lucide-map-pin"
              description="Belum ada alamat. Tambahkan alamat di halaman profil."
            />

            <UCard variant="soft">
              <div class="flex items-center justify-between">
                <span class="font-medium">Total Bayar</span>
                <span class="font-bold text-lg">{{ formatRupiah(total) }}</span>
              </div>
            </UCard>
          </div>
        </template>

        <template #footer>
          <div class="flex w-full justify-end gap-2">
            <UButton color="neutral" variant="outline" class="min-h-11" @click="checkoutOpen = false">
              Batal
            </UButton>
            <UButton
              icon="i-lucide-check"
              class="min-h-11"
              :loading="checkoutLoading"
              :disabled="!idAlamatDipilih || !daftarAlamat?.length"
              @click="checkout"
            >
              Buat Pesanan
            </UButton>
          </div>
        </template>
      </UModal>
    </UContainer>
  </div>
</template>
