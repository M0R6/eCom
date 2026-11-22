<script setup lang="ts">
definePageMeta({ middleware: 'forbidpetani' })
interface KatalogItem {
  idProduk: number
  nama: string
  harga: number | string
  stok: number | null
  satuan: string | null
  status: 'Tersedia' | 'Habis' | 'Disembunyikan' | null
  kategori: { nama: string } | null
  profilpetani: { idPetani: number, namaPertanian: string | null, alamat: string | null } | null
  gambarproduk: { tautanGambar: string }[]
}

interface KatalogResponse {
  items: KatalogItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface FilterData {
  kategori: { idKategori: number, nama: string }[]
  petani: { idPetani: number, namaPertanian: string | null, alamat: string | null }[]
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { loggedIn, user } = useUserSession()

const limit = 9

/** Ambil angka > 0 dari query string, selain itu undefined */
function angkaQuery(nilai: unknown): number | undefined {
  const angka = Number(nilai)
  return Number.isFinite(angka) && angka > 0 ? angka : undefined
}

function idKategoriQuery(nilai: unknown): number[] {
  if (typeof nilai !== 'string' || !nilai) return []
  return nilai
    .split(',')
    .map(Number)
    .filter(angka => Number.isInteger(angka) && angka > 0)
}

// ── State filter (dipulihkan dari URL supaya link bisa di-share) ──
const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
const filter = reactive({
  kategori: idKategoriQuery(route.query.kategori),
  min: angkaQuery(route.query.min) ?? null,
  max: angkaQuery(route.query.max) ?? null,
  petaniId: angkaQuery(route.query.petani) ?? null,
})
const page = ref(angkaQuery(route.query.page) ?? 1)

// ── Pencarian dengan debounce ──────────────────────────────────────
let timer: ReturnType<typeof setTimeout> | undefined
const qDebounced = ref(q.value)

watch(q, (nilai) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    qDebounced.value = nilai.trim()
    page.value = 1
  }, 350)
})

// kalau URL berubah dari luar (misal search di header), input ikut menyesuaikan
watch(() => route.query.q, (nilai) => {
  const baru = typeof nilai === 'string' ? nilai : ''
  if (baru !== q.value.trim()) q.value = baru
})

// filter berubah → kembali ke halaman 1
watch(filter, () => {
  page.value = 1
}, { deep: true })

const query = computed(() => ({
  q: qDebounced.value || undefined,
  kategori: filter.kategori.length ? filter.kategori.join(',') : undefined,
  min: filter.min ?? undefined,
  max: filter.max ?? undefined,
  petani: filter.petaniId ?? undefined,
  page: page.value,
  limit,
}))

const { data, status } = await useFetch<KatalogResponse>('/api/katalog', { query })
const { data: filterData } = await useFetch<FilterData>('/api/katalog/filter')

// URL shareable: /?q=tomat&kategori=1,2&min=5000&petani=3&page=2
watch(query, (nilai) => {
  router.replace({
    query: {
      ...route.query,
      q: nilai.q,
      kategori: nilai.kategori,
      min: nilai.min,
      max: nilai.max,
      petani: nilai.petani,
      page: nilai.page > 1 ? nilai.page : undefined,
    },
  })
})

// ── Drawer filter (mobile) ─────────────────────────────────────────
const drawerFilter = ref(false)

// ── Keranjang (hook Bagian 7) ──────────────────────────────────────
const jumlahKeranjang = useState<number>('keranjang-count', () => 0)
const loadingTambah = ref<number | null>(null)

async function tambahKeKeranjang(produk: KatalogItem) {
  if (!loggedIn.value) return navigateTo('/login?unauthorized=true')

  if (user.value?.peran !== 'Konsumen') {
    toast.add({
      id: 'bukan-konsumen',
      title: 'Hanya akun Konsumen',
      description: 'Akun Petani tidak bisa menambahkan produk ke keranjang.',
      color: 'warning',
    })
    return
  }

  loadingTambah.value = produk.idProduk
  try {
    // ⚠️ endpoint ini baru ada di Bagian 7 (keranjang)
    await $fetch('/api/keranjang/item', {
      method: 'POST',
      body: { idProduk: produk.idProduk, jumlah: 1 },
    })
    const keranjang = await $fetch<{ itemkeranjang: { jumlah: number }[] }>('/api/keranjang')
    jumlahKeranjang.value = keranjang.itemkeranjang.reduce(
      (total, item) => total + item.jumlah,
      0,
    )
    toast.add({
      id: `keranjang-${produk.idProduk}`,
      title: `${produk.nama} masuk keranjang`,
      color: 'success',
    })
  } catch (err: any) {
    toast.add({
      id: `keranjang-gagal-${produk.idProduk}`,
      title: 'Gagal menambah ke keranjang',
      description: err?.data?.statusMessage || err?.statusMessage,
      color: 'error',
    })
  } finally {
    loadingTambah.value = null
  }
}

// ── Pesan dari middleware (/?notfarmer=true, /?notkonsumen=true) ───
onMounted(() => {
  if (route.query.notfarmer && user.value?.peran !== 'Petani') {
    toast.add({
      id: 'akses-ditolak-petani',
      title: 'Akses ke halaman ini ditolak',
      description: 'Halaman tersebut hanya dapat diakses oleh akun Petani.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'warning',
    })
  }

  if (route.query.notkonsumen && user.value?.peran !== 'Konsumen') {
    toast.add({
      id: 'akses-ditolak-konsumen',
      title: 'Akses ke halaman ini ditolak',
      description: 'Halaman tersebut hanya dapat diakses oleh akun Konsumen.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'warning',
    })
  }
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div>
    <Header />

    <UContainer class="py-8">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold">
          Hasil panen segar langsung dari petani desa
        </h1>
        <p class="text-sm text-muted mt-1">
          Pesan langsung, tanpa perantara.
        </p>
      </div>

      <!-- Search + tombol filter (mobile) -->
      <div class="lg:hidden flex gap-2 mb-4">
        <UInput
          v-model="q"
          icon="i-heroicons-magnifying-glass"
          placeholder="Cari sayur…"
          class="flex-1"
        />
        <UButton
          icon="i-heroicons-funnel"
          variant="soft"
          @click="drawerFilter = true"
        >
          Filter
        </UButton>
      </div>

      <UDrawer v-model:open="drawerFilter" title="Filter Produk">
        <template #body>
          <FilterPanel
            v-model:kategori="filter.kategori"
            v-model:min="filter.min"
            v-model:max="filter.max"
            v-model:petani="filter.petaniId"
            :kategori-list="filterData?.kategori ?? []"
            :petani-list="filterData?.petani ?? []"
          />
        </template>
        <template #footer>
          <UButton
            block
            @click="drawerFilter = false"
          >
            Terapkan
          </UButton>
        </template>
      </UDrawer>

      <div class="grid lg:grid-cols-[240px_1fr] gap-8">
        <!-- Sidebar desktop -->
        <aside class="hidden lg:block">
          <UCard variant="subtle">
            <UInput
              v-model="q"
              icon="i-heroicons-magnifying-glass"
              placeholder="Cari sayur…"
              class="w-full mb-4"
            />
            <FilterPanel
              v-model:kategori="filter.kategori"
              v-model:min="filter.min"
              v-model:max="filter.max"
              v-model:petani="filter.petaniId"
              :kategori-list="filterData?.kategori ?? []"
              :petani-list="filterData?.petani ?? []"
            />
          </UCard>
        </aside>

        <!-- Grid produk -->
        <section>
          <p
            v-if="data?.total"
            class="text-sm text-muted mb-3"
          >
            {{ data.total }} produk ditemukan
          </p>

          <div
            v-if="status === 'pending'"
            class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <USkeleton
              v-for="i in 6"
              :key="i"
              class="h-72 rounded-lg"
            />
          </div>

          <div
            v-else-if="data?.items?.length"
            class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <ProductCard
              v-for="p in data.items"
              :key="p.idProduk"
              :produk="p"
              :loading="loadingTambah === p.idProduk"
              @tambah="tambahKeKeranjang"
            />
          </div>

          <UEmpty
            v-else
            icon="carbon:shopping-cart-clear"
            title="Produk tidak ditemukan"
            description="Coba ubah kata kunci atau reset filtermu."
          />

          <div
            v-if="(data?.totalPages ?? 1) > 1"
            class="flex justify-center mt-8"
          >
            <UPagination
              v-model:page="page"
              :total="data?.total ?? 0"
              :items-per-page="limit"
            />
          </div>
        </section>
      </div>
    </UContainer>
  </div>
</template>