<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{ idProduk: number }>()
const emit = defineEmits<{ berhasil: [] }>()

interface Alamat {
  idAlamat: number
  alamatTersimpan: string | null
  namaPenerima: string | null
  detailAlamat: string | null
}

const { loggedIn, user } = useUserSession()
const toast = useToast()
const isKonsumen = computed(() => loggedIn.value && user.value?.peran === 'Konsumen')

const { data: alamatList } = await useFetch<Alamat[]>('/api/alamat', { immediate: isKonsumen.value })
const alamatItems = computed(() =>
  (alamatList.value ?? []).map(a => ({
    label: `${a.alamatTersimpan || 'Alamat'}: ${a.detailAlamat ?? ''}`,
    value: a.idAlamat
  }))
)

const frekuensiItems = [
  { label: 'Harian', value: 'Harian' },
  { label: 'Mingguan', value: 'Mingguan' },
  { label: 'Bulanan', value: 'Bulanan' }
]

const schema = z.object({
  jumlah: z.number({ message: 'Jumlah wajib diisi' }).int().min(1, 'Minimal 1'),
  frekuensi: z.enum(['Harian', 'Mingguan', 'Bulanan']),
  tanggalMulai: z.string().min(1, 'Pilih tanggal mulai'),
  idAlamat: z.number({ message: 'Pilih alamat pengiriman' })
})
type Input = z.infer<typeof schema>

const besok = new Date(Date.now() + 86_400_000).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
const state = reactive<Partial<Input>>({
  jumlah: 1,
  frekuensi: 'Mingguan',
  tanggalMulai: besok,
  idAlamat: undefined
})

const loading = ref(false)

async function onSubmit(e: FormSubmitEvent<Input>) {
  loading.value = true
  try {
    await $fetch('/api/langganan', {
      method: 'POST',
      body: {
        idAlamat: e.data.idAlamat,
        frekuensi: e.data.frekuensi,
        tanggalMulai: e.data.tanggalMulai,
        items: [{ idProduk: props.idProduk, jumlah: e.data.jumlah }]
      }
    })
    toast.add({
      id: 'langganan-dibuat',
      title: 'Langganan dibuat',
      description: 'Kelola jadwalnya di halaman Langganan.',
      color: 'success'
    })
    emit('berhasil')
  } catch (err: any) {
    toast.add({
      id: 'langganan-gagal',
      title: 'Gagal berlangganan',
      description: err?.data?.statusMessage || err?.statusMessage,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <h2 class="font-semibold">
        Berlangganan produk ini
      </h2>
    </template>

    <div
      v-if="!loggedIn"
      class="space-y-3"
    >
      <p class="text-sm text-muted">
        Masuk dengan akun Konsumen untuk berlangganan.
      </p>
      <UButton
        to="/login"
        class="min-h-11"
      >
        Masuk
      </UButton>
    </div>

    <p
      v-else-if="!isKonsumen"
      class="text-sm text-muted"
    >
      Langganan hanya tersedia untuk akun Konsumen.
    </p>

    <p
      v-else-if="!alamatItems.length"
      class="text-sm text-muted"
    >
      Kamu belum punya alamat pengiriman.
      <NuxtLink
        to="/profil"
        class="font-medium text-primary"
      >
        Tambah alamat di profil
      </NuxtLink>
    </p>

    <UForm
      v-else
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField
        label="Frekuensi"
        name="frekuensi"
      >
        <URadioGroup
          v-model="state.frekuensi"
          :items="frekuensiItems"
          orientation="horizontal"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          label="Jumlah per pengiriman"
          name="jumlah"
        >
          <UInputNumber
            v-model="state.jumlah"
            :min="1"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Mulai"
          name="tanggalMulai"
        >
          <UInput
            v-model="state.tanggalMulai"
            type="date"
            :min="besok"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField
        label="Alamat pengiriman"
        name="idAlamat"
      >
        <USelect
          v-model="state.idAlamat"
          :items="alamatItems"
          placeholder="Pilih alamat"
          class="w-full"
        />
      </UFormField>

      <UButton
        type="submit"
        block
        class="min-h-11"
        :loading="loading"
      >
        Langgankan
      </UButton>
    </UForm>
  </UCard>
</template>
