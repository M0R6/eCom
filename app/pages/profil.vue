<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ middleware: 'auth' })

const { user } = useUserSession()
const toast = useToast()

interface Alamat {
  idAlamat: number
  namaPenerima: string | null
  nomorTelepon: string | null
  detailAlamat: string | null
  desa: string | null
  kecamatan: string | null
  kota: string | null
  provinsi: string | null
  kodePos: string | null
  alamatTersimpan: string | null
}

interface Rekening {
  idRekening: number
  namaBank: string | null
  nomorRekening: string | null
  pemilikRekening: string | null
}

interface ProfilData {
  nama: string
  email: string
  peran: 'Petani' | 'Konsumen'
  profilpetani: {
    namaPertanian: string | null
    nomorTelepon: string | null
    alamat: string | null
    deskripsi: string | null
    akunbank: Rekening[]
  } | null
  profilkonsumen: { nomorTelepon: string | null } | null
  alamat: Alamat[]
}

const { data: profil, refresh } = await useFetch<ProfilData>('/api/profil')
const isPetani = computed(() => user.value?.peran === 'Petani')


// ── Tab ───────────────────────────────────────────────────────────
const tabs = computed(() =>
  isPetani.value
    ? [
        { label: 'Data Diri', slot: 'data-diri' },
        { label: 'Alamat', slot: 'alamat' },
        { label: 'Rekening Bank', slot: 'rekening' },
      ]
    : [
        { label: 'Data Diri', slot: 'data-diri' },
        { label: 'Alamat', slot: 'alamat' },
      ],
)

// ── Data diri & profil ────────────────────────────────────────────
const profilSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  namaPertanian: z.string().optional(),
  nomorTelepon: z.string().max(20).optional(),
  alamatPertanian: z.string().optional(),
  deskripsi: z.string().optional(),
  nomorTeleponKonsumen: z.string().max(20).optional(),
})
type ProfilInput = z.infer<typeof profilSchema>

const profilState = reactive<ProfilInput>({
  nama: profil.value?.nama ?? '',
  namaPertanian: profil.value?.profilpetani?.namaPertanian ?? '',
  nomorTelepon: profil.value?.profilpetani?.nomorTelepon ?? '',
  alamatPertanian: profil.value?.profilpetani?.alamat ?? '',
  deskripsi: profil.value?.profilpetani?.deskripsi ?? '',
  nomorTeleponKonsumen: profil.value?.profilkonsumen?.nomorTelepon ?? '',
})

const savingProfil = ref(false)
async function simpanProfil(e: FormSubmitEvent<ProfilInput>) {
  savingProfil.value = true
  try {
    await $fetch('/api/profil', {
      method: 'PUT',
      body: {
        nama: e.data.nama,
        profilPetani: isPetani.value
          ? {
              namaPertanian: e.data.namaPertanian,
              nomorTelepon: e.data.nomorTelepon,
              alamat: e.data.alamatPertanian,
              deskripsi: e.data.deskripsi,
            }
          : undefined,
        profilKonsumen: !isPetani.value
          ? { nomorTelepon: e.data.nomorTeleponKonsumen }
          : undefined,
      },
    })
    toast.add({ id: 'profil-tersimpan', title: 'Profil tersimpan', color: 'success' })
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Gagal menyimpan', description: err?.statusMessage, color: 'error' })
  } finally {
    savingProfil.value = false
  }
}

// ── Alamat ────────────────────────────────────────────────────────
const alamatSchema = z.object({
  alamatTersimpan: z.string().min(1, 'Label wajib diisi').max(100),
  namaPenerima: z.string().min(1, 'Wajib diisi').max(100),
  nomorTelepon: z.string().min(5, 'Wajib diisi').max(20),
  detailAlamat: z.string().min(1, 'Wajib diisi'),
  desa: z.string().optional(),
  kecamatan: z.string().optional(),
  kota: z.string().optional(),
  provinsi: z.string().optional(),
  kodePos: z.string().optional(),
})
type AlamatInput = z.infer<typeof alamatSchema>

const alamatState = reactive<AlamatInput>({
  alamatTersimpan: '',
  namaPenerima: '',
  nomorTelepon: '',
  detailAlamat: '',
  desa: '',
  kecamatan: '',
  kota: '',
  provinsi: '',
  kodePos: '',
})

const modalAlamat = ref(false)
const editAlamatId = ref<number | null>(null)
const savingAlamat = ref(false)

function bukaTambahAlamat() {
  editAlamatId.value = null
  Object.assign(alamatState, {
    alamatTersimpan: '', namaPenerima: '', nomorTelepon: '',
    detailAlamat: '', desa: '', kecamatan: '', kota: '', provinsi: '', kodePos: '',
  })
  modalAlamat.value = true
}

function bukaEditAlamat(a: Alamat) {
  editAlamatId.value = a.idAlamat
  Object.assign(alamatState, {
    alamatTersimpan: a.alamatTersimpan ?? '',
    namaPenerima: a.namaPenerima ?? '',
    nomorTelepon: a.nomorTelepon ?? '',
    detailAlamat: a.detailAlamat ?? '',
    desa: a.desa ?? '',
    kecamatan: a.kecamatan ?? '',
    kota: a.kota ?? '',
    provinsi: a.provinsi ?? '',
    kodePos: a.kodePos ?? '',
  })
  modalAlamat.value = true
}

async function simpanAlamat(e: FormSubmitEvent<AlamatInput>) {
  savingAlamat.value = true
  try {
    if (editAlamatId.value) {
      await $fetch(`/api/alamat/${editAlamatId.value}`, { method: 'PUT', body: e.data })
    } else {
      await $fetch('/api/alamat', { method: 'POST', body: e.data })
    }
    toast.add({ id: 'alamat-tersimpan', title: 'Alamat tersimpan', color: 'success' })
    modalAlamat.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Gagal menyimpan', description: err?.statusMessage, color: 'error' })
  } finally {
    savingAlamat.value = false
  }
}

async function hapusAlamat(id: number) {
  try {
    await $fetch(`/api/alamat/${id}`, { method: 'DELETE' })
    toast.add({ id: 'alamat-dihapus', title: 'Alamat dihapus', color: 'success' })
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Gagal menghapus', description: err?.statusMessage, color: 'error' })
  }
}

// ── Rekening (Petani) ─────────────────────────────────────────────
const rekeningSchema = z.object({
  namaBank: z.string().min(1, 'Wajib diisi').max(50),
  nomorRekening: z.string().min(5, 'Wajib diisi').max(50),
  pemilikRekening: z.string().min(1, 'Wajib diisi').max(100),
})
type RekeningInput = z.infer<typeof rekeningSchema>

const rekeningState = reactive<RekeningInput>({
  namaBank: '',
  nomorRekening: '',
  pemilikRekening: '',
})

const modalRekening = ref(false)
const editRekeningId = ref<number | null>(null)
const savingRekening = ref(false)

function bukaTambahRekening() {
  editRekeningId.value = null
  Object.assign(rekeningState, { namaBank: '', nomorRekening: '', pemilikRekening: '' })
  modalRekening.value = true
}

function bukaEditRekening(r: Rekening) {
  editRekeningId.value = r.idRekening
  Object.assign(rekeningState, {
    namaBank: r.namaBank ?? '',
    nomorRekening: r.nomorRekening ?? '',
    pemilikRekening: r.pemilikRekening ?? '',
  })
  modalRekening.value = true
}

async function simpanRekening(e: FormSubmitEvent<RekeningInput>) {
  savingRekening.value = true
  try {
    if (editRekeningId.value) {
      await $fetch(`/api/rekening/${editRekeningId.value}`, { method: 'PUT', body: e.data })
    } else {
      await $fetch('/api/rekening', { method: 'POST', body: e.data })
    }
    toast.add({ id: 'rekening-tersimpan', title: 'Rekening tersimpan', color: 'success' })
    modalRekening.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Gagal menyimpan', description: err?.statusMessage, color: 'error' })
  } finally {
    savingRekening.value = false
  }
}

async function hapusRekening(id: number) {
  try {
    await $fetch(`/api/rekening/${id}`, { method: 'DELETE' })
    toast.add({ id: 'rekening-dihapus', title: 'Rekening dihapus', color: 'success' })
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Gagal menghapus', description: err?.statusMessage, color: 'error' })
  }
}
</script>

<template>
  <div>
    <Header />
    <UContainer class="py-8">
      <h1 class="text-2xl font-semibold mb-6">Profil Akun</h1>

      <UTabs :items="tabs">
        <!-- ── Tab Data Diri ── -->
        <template #data-diri>
          <UCard class="max-w-2xl">
            <UForm
              :schema="profilSchema"
              :state="profilState"
              class="space-y-4"
              @submit="simpanProfil"
            >
              <UFormField label="Nama" name="nama">
                <UInput v-model="profilState.nama" class="w-full" />
              </UFormField>

              <!-- Petani -->
              <template v-if="isPetani">
                <UFormField label="Nama Pertanian" name="namaPertanian">
                  <UInput v-model="profilState.namaPertanian" class="w-full" />
                </UFormField>
                <UFormField label="Nomor Telepon" name="nomorTelepon">
                  <UInput v-model="profilState.nomorTelepon" class="w-full" />
                </UFormField>
                <UFormField label="Alamat Pertanian" name="alamatPertanian">
                  <UTextarea v-model="profilState.alamatPertanian" class="w-full" :rows="2" />
                </UFormField>
                <UFormField label="Deskripsi" name="deskripsi">
                  <UTextarea v-model="profilState.deskripsi" class="w-full" :rows="3" />
                </UFormField>
              </template>

              <!-- Konsumen -->
              <template v-else>
                  <UFormField label="Nomor Telepon" name="nomorTeleponKonsumen">
                    <UInput v-model="profilState.nomorTeleponKonsumen" class="w-full" />
                  </UFormField>
              </template>

              <UButton type="submit" :loading="savingProfil">Simpan Perubahan</UButton>
            </UForm>
          </UCard>
        </template>

        <!-- ── Tab Alamat ── -->
        <template #alamat>
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="font-semibold">Daftar Alamat</h2>
                <UButton icon="i-heroicons-plus" size="sm" @click="bukaTambahAlamat">
                  Tambah Alamat
                </UButton>
              </div>
            </template>

            <div v-if="profil?.alamat?.length" class="space-y-4">
              <UCard
                v-for="a in profil.alamat"
                :key="a.idAlamat"
                variant="subtle"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <UBadge :label="a.alamatTersimpan || 'Alamat'" variant="subtle" class="mb-2" />
                    <p class="font-medium">{{ a.namaPenerima }} · {{ a.nomorTelepon }}</p>
                    <p class="text-sm text-muted">
                      {{ a.detailAlamat }}, {{ a.desa }}, {{ a.kecamatan }},
                      {{ a.kota }}, {{ a.provinsi }} {{ a.kodePos }}
                    </p>
                  </div>
                  <div class="flex gap-2 shrink-0">
                    <UButton icon="i-heroicons-pencil" size="sm" variant="ghost" @click="bukaEditAlamat(a)" />
                    <UButton icon="i-heroicons-trash" size="sm" variant="ghost" color="error" @click="hapusAlamat(a.idAlamat)" />
                  </div>
                </div>
              </UCard>
            </div>
            <UEmpty v-else description="Belum ada alamat tersimpan." />
          </UCard>
        </template>

        <!-- ── Tab Rekening (Petani) ── -->
        <template #rekening>
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="font-semibold">Rekening Bank</h2>
                <UButton icon="i-heroicons-plus" size="sm" @click="bukaTambahRekening">
                  Tambah Rekening
                </UButton>
              </div>
            </template>

            <div v-if="profil?.profilpetani?.akunbank?.length" class="space-y-4">
              <UCard v-for="r in profil.profilpetani.akunbank" :key="r.idRekening" variant="subtle">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="font-medium">{{ r.namaBank }}</p>
                    <p class="text-sm text-muted">
                      {{ r.nomorRekening }} — a.n. {{ r.pemilikRekening }}
                    </p>
                  </div>
                  <div class="flex gap-2 shrink-0">
                    <UButton icon="i-heroicons-pencil" size="sm" variant="ghost" @click="bukaEditRekening(r)" />
                    <UButton icon="i-heroicons-trash" size="sm" variant="ghost" color="error" @click="hapusRekening(r.idRekening)" />
                  </div>
                </div>
              </UCard>
            </div>
            <UEmpty v-else description="Belum ada rekening tersimpan." />
          </UCard>
        </template>
      </UTabs>

      <!-- ── Modal Alamat ── -->
      <UModal v-model:open="modalAlamat" title="Alamat Pengiriman">
        <template #body>
          <UForm
            :schema="alamatSchema"
            :state="alamatState"
            class="space-y-4"
            @submit="simpanAlamat"
          >
            <UFormField label="Label Alamat" name="alamatTersimpan">
              <UInput v-model="alamatState.alamatTersimpan" placeholder="Rumah / Kebun" class="w-full" />
            </UFormField>
            <UFormField label="Nama Penerima" name="namaPenerima">
              <UInput v-model="alamatState.namaPenerima" class="w-full" />
            </UFormField>
            <UFormField label="Nomor Telepon" name="nomorTelepon">
              <UInput v-model="alamatState.nomorTelepon" class="w-full" />
            </UFormField>
            <UFormField label="Detail Alamat" name="detailAlamat">
              <UTextarea v-model="alamatState.detailAlamat" class="w-full" :rows="2" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Desa" name="desa">
                <UInput v-model="alamatState.desa" class="w-full" />
              </UFormField>
              <UFormField label="Kecamatan" name="kecamatan">
                <UInput v-model="alamatState.kecamatan" class="w-full" />
              </UFormField>
              <UFormField label="Kota/Kabupaten" name="kota">
                <UInput v-model="alamatState.kota" class="w-full" />
              </UFormField>
              <UFormField label="Provinsi" name="provinsi">
                <UInput v-model="alamatState.provinsi" class="w-full" />
              </UFormField>
              <UFormField label="Kode Pos" name="kodePos">
                <UInput v-model="alamatState.kodePos" class="w-full" />
              </UFormField>
            </div>
            <UButton type="submit" block :loading="savingAlamat">Simpan Alamat</UButton>
          </UForm>
        </template>
      </UModal>

      <!-- ── Modal Rekening ── -->
      <UModal v-model:open="modalRekening" title="Rekening Bank">
        <template #body>
          <UForm
            :schema="rekeningSchema"
            :state="rekeningState"
            class="space-y-4"
            @submit="simpanRekening"
          >
            <UFormField label="Nama Bank" name="namaBank">
              <UInput v-model="rekeningState.namaBank" class="w-full" />
            </UFormField>
            <UFormField label="Nomor Rekening" name="nomorRekening">
              <UInput v-model="rekeningState.nomorRekening" class="w-full" />
            </UFormField>
            <UFormField label="Pemilik Rekening" name="pemilikRekening">
              <UInput v-model="rekeningState.pemilikRekening" class="w-full" />
            </UFormField>
            <UButton type="submit" block :loading="savingRekening">Simpan Rekening</UButton>
          </UForm>
        </template>
      </UModal>
    </UContainer>
  </div>
</template>
