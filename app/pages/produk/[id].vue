<script setup lang="ts">
const route = useRoute()
const { data: product } = await useFetch(`/api/produk/${route.params.id}`)

const activeImage = ref(0)

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
         <p class="text-xs text-muted flex items-center gap-2 my-1" icon="andrsrxn:farm">
           <UIcon name="andrsrxn:farm" class="size-5 text-muted" />
           {{ product.profilpetani?.namaPertanian || 'Petani' }}
           · {{ product.profilpetani?.alamat || 'Lokasi belum diisi' }}
         </p>
         <p class="text-muted mb-4">{{ product.deskripsi }}</p>
         <p class="text-lg font-semibold mb-4">Rp {{ product.harga }}</p>
         <UButton color="primary" to="/keranjang">Tambah ke Keranjang</UButton>
        </div>
      </div>
      <div v-else class="text-center text-muted">
        Produk tidak ditemukan.
      </div>
    </UContainer>
  </div>
</template>