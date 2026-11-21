<script setup lang="ts">
interface KategoriItem {
  idKategori: number
  nama: string
}

interface PetaniItem {
  idPetani: number
  namaPertanian: string | null
  alamat: string | null
}

const props = defineProps<{
  kategoriList: KategoriItem[]
  petaniList: PetaniItem[]
}>()

// Satu model per field → tidak ada objek reactive yang di-replace utuh.
const kategori = defineModel<number[]>('kategori', { required: true })
const min = defineModel<number | null>('min', { required: true })
const max = defineModel<number | null>('max', { required: true })
const petani = defineModel<number | null>('petani', { required: true })

const kategoriItems = computed(() =>
  props.kategoriList.map(k => ({ label: k.nama, value: k.idKategori })),
)

// "Semua" = model null + placeholder. TIDAK boleh ada item dengan value ''.
const petaniItems = computed(() =>
  props.petaniList.map(p => ({
    label: `${p.namaPertanian || 'Petani'} — ${p.alamat || 'Lokasi belum diisi'}`,
    value: p.idPetani,
  })),
)

function reset() {
  kategori.value = []
  min.value = null
  max.value = null
  petani.value = null
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="font-medium mb-2">
        Kategori
      </h3>
      <UCheckboxGroup
        v-model="kategori"
        :items="kategoriItems"
      />
    </div>

    <div>
      <h3 class="font-medium mb-2">
        Harga
      </h3>
      <div class="">
        <UInputNumber
          v-model="min"
          :min="0"
          placeholder="Min"
          class="w-full mb-2"
        />
        <UInputNumber
          v-model="max"
          :min="0"
          placeholder="Maks"
          class="w-full"
        />
      </div>
    </div>

    <div>
      <h3 class="font-medium mb-2">
        Petani
      </h3>
      <USelect
        v-model="petani"
        :items="petaniItems"
        placeholder="Semua petani"
        class="w-full"
      />
    </div>

    <UButton
      variant="ghost"
      icon="i-heroicons-arrow-path"
      block
      @click="reset"
    >
      Reset Filter
    </UButton>
  </div>
</template>