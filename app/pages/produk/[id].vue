<script setup lang="ts">
const route = useRoute()
const { data: product } = await useFetch(`/api/produk/${route.params.id}`)

const activeImage = ref(0)

interface ProdukRekomendasi {
  idProduk: number
  nama: string
  harga: number | string
  stok: number | null
  satuan: string | null
  status: 'Tersedia' | 'Habis' | null
  kategori: { nama: string } | null
  profilpetani: { idPetani: number, namaPertanian: string | null, alamat: string | null } | null
  gambarproduk: { tautanGambar: string }[]
}

interface ResponKatalog {
  items: ProdukRekomendasi[]
}

const toast = useToast()
const { loggedIn, user } = useUserSession()
const jumlahKeranjang = useState<number>('keranjang-count', () => 0)
const loadingTambah = ref<number | null>(null)
const produkRekomendasi = ref<ProdukRekomendasi[]>([])

const images = computed(() => {
  const productImages = product.value?.gambarproduk?.map(gambar => gambar.tautanGambar).filter(Boolean) ?? []
  return productImages.length
    ? productImages
    : ['https://placehold.co/600x400?text=Tanpa+Foto']
})

watch(product, () => {
  activeImage.value = 0
})

function previousImage() {
  activeImage.value = (activeImage.value - 1 + images.value.length) % images.value.length
}

function nextImage() {
  activeImage.value = (activeImage.value + 1) % images.value.length
}

async function muatRekomendasi() {
  const idPetani = product.value?.profilpetani?.idPetani
  if (!idPetani) {
    produkRekomendasi.value = []
    return
  }

  const respon = await $fetch<ResponKatalog>('/api/katalog', {
    query: { petani: idPetani, limit: 5 }
  })

  produkRekomendasi.value = respon.items
    .filter(item => item.idProduk !== Number(route.params.id))
    .slice(0, 4)
}

watch(product, muatRekomendasi, { immediate: true })

async function tambahKeKeranjang(produk: ProdukRekomendasi) {
  if (!loggedIn.value) {
    await navigateTo('/login?unauthorized=true')
    return
  }

  if (user.value?.peran !== 'Konsumen') {
    toast.add({
      id: 'bukan-konsumen',
      title: 'Hanya akun Konsumen',
      description: 'Akun Petani tidak bisa menambahkan produk ke keranjang.',
      color: 'warning'
    })
    return
  }

  loadingTambah.value = produk.idProduk
  try {
    await $fetch('/api/keranjang/item', {
      method: 'POST',
      body: { idProduk: produk.idProduk, jumlah: 1 }
    })

    const keranjang = await $fetch<{ itemkeranjang: { jumlah: number }[] }>('/api/keranjang')
    jumlahKeranjang.value = keranjang.itemkeranjang.reduce(
      (total, item) => total + item.jumlah,
      0
    )

    toast.add({
      id: `keranjang-${produk.idProduk}`,
      title: `${produk.nama} masuk keranjang`,
      color: 'success'
    })
  } catch (err) {
    toast.add({
      id: `keranjang-gagal-${produk.idProduk}`,
      title: 'Gagal menambah ke keranjang',
      description: (err as { data?: { statusMessage?: string } })?.data?.statusMessage,
      color: 'error'
    })
  } finally {
    loadingTambah.value = null
  }
}
</script>

<template>
  <div>
    <Header />
    <UContainer class="py-12">
      <div v-if="product" class="flex flex-col gap-6 md:flex-row">
        <div class="flex-1">
          <div class="relative overflow-hidden rounded-lg bg-muted">
            <img
              :src="images[activeImage]"
              :alt="`${product.nama} - gambar ${activeImage + 1}`"
              class="h-105 w-full object-cover"
            />

            <div
              v-if="images.length > 1"
              class="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between"
            >
              <UButton
                icon="i-heroicons-chevron-left"
                aria-label="Gambar sebelumnya"
                color="neutral"
                variant="solid"
                class="size-10 rounded-full justify-center bg-white/90 text-gray-900"
                @click="previousImage"
              />
              <UButton
                icon="i-heroicons-chevron-right"
                aria-label="Gambar berikutnya"
                color="neutral"
                variant="solid"
                class="size-10 rounded-full justify-center bg-white/90 text-gray-900"
                @click="nextImage"
              />
            </div>
          </div>

          <div v-if="images.length > 1" class="mt-3 grid grid-cols-5 gap-2">
            <button
              v-for="(image, index) in images"
              :key="image"
              type="button"
              :aria-label="`Tampilkan gambar ${index + 1}`"
              :aria-current="activeImage === index ? 'true' : undefined"
              class="overflow-hidden rounded-md border-2 transition"
              :class="activeImage === index ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'"
              @click="activeImage = index"
            >
              <img
                :src="image"
                alt=""
                class="h-20 w-full object-cover"
              />
            </button>
          </div>
        </div>
        <div class="flex-1">
         <h1 class="text-2xl font-bold mb-2">{{ product.nama }}</h1>
         <p class="text-lg text-muted flex items-center gap-2 my-1" icon="andrsrxn:farm">
           <UIcon name="andrsrxn:farm" class="size-10 text-muted" />
           Dikirim dari:
           {{ product.profilpetani?.namaPertanian || 'Petani' }}
           · {{ product.profilpetani?.alamat || 'Lokasi belum diisi' }}
         </p>
         <p class="text-muted mb-4">{{ product.deskripsi }}</p>
         <p class="text-lg font-semibold mb-4">Rp {{ product.harga }}</p>
         <UButton color="primary" to="/keranjang" icon="i-heroicons-shopping-cart">Tambah ke Keranjang</UButton>
        </div>
      </div>
      <div v-else class="text-center text-muted">
        Produk tidak ditemukan.
      </div>
      <section v-if="produkRekomendasi.length" class="mt-12">
        <div class="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold">
              Produk lain dari petani ini
            </h2>
          </div>
          <UButton
            v-if="product?.profilpetani?.idPetani"
            :to="`/katalog?petani=${product.profilpetani.idPetani}`"
            variant="ghost"
            color="neutral"
            size="sm"
          >
            Lihat semua
          </UButton>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProductCard
            v-for="produk in produkRekomendasi"
            :key="produk.idProduk"
            :produk="produk"
            :loading="loadingTambah === produk.idProduk"
            @tambah="tambahKeKeranjang"
          />
        </div>
      </section>
    </UContainer>
  </div>
</template>