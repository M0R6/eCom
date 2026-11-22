<script setup lang="ts">
interface ProdukKatalog {
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

const props = defineProps<{
  produk: ProdukKatalog
  loading?: boolean
}>()

const emit = defineEmits<{ tambah: [produk: ProdukKatalog] }>()
const { loggedIn } = useUserSession()

async function tambahKeranjang() {
  if (!loggedIn) {
    navigateTo('/login?unauthorized=true')
    return
  }

  emit('tambah', props.produk)
}

const habis = computed(
  () => props.produk.status === 'Habis' || (props.produk.stok ?? 0) <= 0,
)

const cover = computed(
  () => props.produk.gambarproduk?.[0]?.tautanGambar
    || 'https://placehold.co/600x400?text=Tanpa+Foto',
)
</script>

<template>
  <UCard variant="outline" class="flex flex-col">
    <template #header>
      <div class="overflow-hidden rounded">
        <img
          :src="cover"
          :alt="produk.nama"
          class="w-full h-40 object-cover transition duration-300 hover:scale-105"
          loading="lazy"
        >
      </div>
    </template>

    <div class="flex flex-1 flex-col gap-1">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-medium line-clamp-2">
          {{ produk.nama }}
        </h3>
        <UBadge
          :label="habis ? 'Habis' : 'Tersedia'"
          :color="habis ? 'warning' : 'success'"
          variant="subtle"
          size="sm"
          class="shrink-0"
        />
      </div>

      <p class="text-xs text-muted">
        {{ produk.kategori?.nama ?? 'Tanpa kategori' }}
      </p>

      <p class="font-semibold">
        Rp{{ Number(produk.harga).toLocaleString('id-ID') }}
        <span class="text-xs font-normal text-muted">/ {{ produk.satuan ?? 'pcs' }}</span>
      </p>

      <p
        class="text-xs text-muted flex items-center gap-2 my-1"
        icon="andrsrxn:farm">
        <UIcon
          name="andrsrxn:farm"
          class="size-5 text-muted"
        />
        {{ produk.profilpetani?.namaPertanian || 'Petani' }}
        · {{ produk.profilpetani?.alamat || 'Lokasi belum diisi' }}
      </p>

      <p class="text-xs text-muted">
        Stok: {{ produk.stok ?? 0 }}
      </p>
    </div>

    <template #footer>
      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-shopping-cart"
          size="sm"
          class="flex-1 justify-center"
          :disabled="habis"
          :loading="loading"
          @click="tambahKeranjang()"
        >
          {{ habis ? 'Stok Habis' : 'Keranjang' }}
        </UButton>

        <UButton
          :to="`/produk/${produk.idProduk}`"
          icon="i-heroicons-eye"
          size="sm"
          variant="soft"
          aria-label="Lihat detail produk"
        />
      </div>
    </template>
  </UCard>
</template>