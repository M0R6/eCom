<script setup lang="ts">
definePageMeta({ middleware: 'konsumen' })

interface Alamat {
  idAlamat: number
  alamatTersimpan: string | null
  namaPenerima: string | null
  detailAlamat: string | null
  kota: string | null
  nomorTelepon: string | null
}

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

const toast = useToast()
const { data: keranjang, status: statusMuat, error } = await useFetch<Keranjang>('/api/keranjang')
const { data: daftarAlamat } = await useFetch<Alamat[]>('/api/alamat')

const idAlamatDipilih = ref<number | null>(null)
const checkoutLoading = ref(false)

watchEffect(() => {
  const pertama = daftarAlamat.value?.[0]
  if (pertama && !idAlamatDipilih.value) {
    idAlamatDipilih.value = pertama.idAlamat
  }
})

const harga = (v: string | number) => Number(v)

const total = computed(() =>
  keranjang.value?.itemkeranjang.reduce((s, i) => s + harga(i.produk.harga) * i.jumlah, 0) ?? 0
)

const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const adaItemTidakTersedia = computed(() =>
  keranjang.value?.itemkeranjang.some(i => i.produk.status !== 'Tersedia') ?? false
)

async function bayar() {
  if (!idAlamatDipilih.value) {
    toast.add({ id: 'alamat-wajib', title: 'Pilih alamat pengiriman', color: 'warning' })
    return
  }
  checkoutLoading.value = true
  try {
    const pesanan = await $fetch<{ idPesanan: number }>('/api/keranjang/checkout', {
      method: 'POST',
      body: { idAlamat: idAlamatDipilih.value }
    })
    toast.add({ id: 'checkout-ok', title: 'Pesanan berhasil dibuat!', color: 'success' })
    await navigateTo(`/pesanan/${pesanan.idPesanan}`)
  } catch (err) {
    toast.add({
      id: 'checkout-err',
      title: 'Checkout gagal',
      description: (err as { data?: { statusMessage?: string } })?.data?.statusMessage,
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
        Checkout
      </h1>

      <div
        v-if="statusMuat === 'pending'"
        class="py-12 text-center text-muted"
      >
        Memuat data…
      </div>

      <div
        v-else-if="error"
        class="py-12 text-center"
      >
        <p class="mb-3 text-error">
          Gagal memuat keranjang.
        </p>
        <UButton
          color="neutral"
          variant="outline"
          class="min-h-11"
          to="/keranjang"
        >
          Kembali ke Keranjang
        </UButton>
      </div>

      <div
        v-else-if="!keranjang?.itemkeranjang.length"
        class="py-12 text-center"
      >
        <UEmpty
          icon="i-lucide-shopping-cart"
          description="Keranjang kosong. Tidak ada yang bisa di-checkout."
        />
        <UButton
          color="neutral"
          variant="outline"
          class="mt-4 min-h-11"
          to="/keranjang"
        >
          Kembali ke Keranjang
        </UButton>
      </div>

      <div
        v-else
        class="space-y-6"
      >

        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-medium flex items-center gap-2">
              <UBadge
                label="1"
                variant="solid"
                size="sm"
              />
              Alamat Pengiriman
            </h2>
            <UButton
              to="/profil"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-plus"
            >
              Tambah Alamat
            </UButton>
          </div>

          <div
            v-if="daftarAlamat?.length"
            class="space-y-2"
          >
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
                  <div class="flex items-center gap-2">
                    <UBadge
                      v-if="a.alamatTersimpan"
                      :label="a.alamatTersimpan"
                      variant="subtle"
                      size="xs"
                    />
                    <span class="font-medium text-sm">{{ a.namaPenerima }}</span>
                    <span
                      v-if="a.nomorTelepon"
                      class="text-xs text-muted"
                    >
                      {{ a.nomorTelepon }}
                    </span>
                  </div>
                  <p
                    v-if="a.detailAlamat"
                    class="text-xs text-muted mt-0.5"
                  >
                    {{ a.detailAlamat }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>

          <UEmpty
            v-else
            icon="i-lucide-map-pin"
            description="Belum ada alamat. Tambahkan alamat di halaman profil."
          >
            <template #actions>
              <UButton
                to="/profil"
                color="neutral"
                variant="outline"
                size="sm"
              >
                Ke Profil
              </UButton>
            </template>
          </UEmpty>
        </div>

        <div>
          <h2 class="text-lg font-medium mb-3 flex items-center gap-2">
            <UBadge
              label="2"
              variant="solid"
              size="sm"
            />
            Ringkasan Pesanan
          </h2>

          <UCard variant="outline">
            <ul class="space-y-2 text-sm">
              <li
                v-for="item in keranjang.itemkeranjang"
                :key="item.idItemKeranjang"
                class="flex justify-between gap-4"
                :class="item.produk.status !== 'Tersedia' ? 'text-error' : ''"
              >
                <span>
                  {{ item.jumlah }}× {{ item.produk.nama }}
                  <span
                    v-if="item.produk.satuan"
                    class="text-muted"
                  >
                    ({{ item.produk.satuan }})
                  </span>
                  <span
                    v-if="item.produk.status !== 'Tersedia'"
                    class="text-xs"
                  >
                    — tidak tersedia
                  </span>
                </span>
                <span class="shrink-0 tabular-nums">
                  {{ rupiah(harga(item.produk.harga) * item.jumlah) }}
                </span>
              </li>
            </ul>

            <USeparator class="my-3" />

            <div class="flex justify-between font-semibold">
              <span>Total</span>
              <span class="text-lg">{{ rupiah(total) }}</span>
            </div>
          </UCard>
        </div>

        <div>
          <h2 class="text-lg font-medium mb-3 flex items-center gap-2">
            <UBadge
              label="3"
              variant="solid"
              size="sm"
            />
            Konfirmasi
          </h2>

          <UButton
            icon="i-lucide-credit-card"
            size="lg"
            block
            class="min-h-12"
            :loading="checkoutLoading"
            :disabled="!idAlamatDipilih || !daftarAlamat?.length || adaItemTidakTersedia"
            @click="bayar"
          >
            Bayar & Pesan Sekarang
          </UButton>

          <p
            v-if="adaItemTidakTersedia"
            class="text-sm text-error mt-2 text-center"
          >
            Ada produk yang tidak tersedia. Hapus dulu dari keranjang.
          </p>
        </div>
      </div>
    </UContainer>
  </div>
</template>
