<script setup lang="ts">
interface PercakapanChat {
  idPercakapanChat: number
  idPengguna: number
  judul: string | null
  dibuatPada: string | null
  diperbaruiPada: string | null
}

interface PesanChat {
  idPesanChat: number
  idPercakapan: number
  peran: 'User' | 'Bot' | 'Admin'
  konten: string
  dibuatPada: string | null
}

interface KirimPesanResponse {
  pesanUser: PesanChat
  pesanBot: PesanChat
}

const { loggedIn } = useUserSession()
const toast = useToast()

const isOpen = ref(false)
const loadingPercakapan = ref(false)
const loadingPesan = ref(false)
const creatingPercakapan = ref(false)
const sendingPesan = ref(false)
const errorPercakapan = ref<string | null>(null)

const percakapanList = ref<PercakapanChat[]>([])
const selectedPercakapanId = ref<number | undefined>(undefined)
const pesanList = ref<PesanChat[]>([])
const pesanInput = ref('')
const areaPesanRef = ref<HTMLElement | null>(null)

const percakapanItems = computed(() =>
  percakapanList.value.map(item => ({
    label: item.judul || `Percakapan #${item.idPercakapanChat}`,
    value: item.idPercakapanChat
  }))
)

async function scrollKeBawah() {
  await nextTick()
  if (areaPesanRef.value) {
    areaPesanRef.value.scrollTop = areaPesanRef.value.scrollHeight
  }
}

async function muatDaftarPercakapanSaja() {
  const data = await $fetch<PercakapanChat[]>('/api/chat/percakapan')
  percakapanList.value = data
  return data
}

async function muatPesan(idPercakapan: number) {
  if (!loggedIn.value) return

  loadingPesan.value = true
  try {
    const data = await $fetch<PesanChat[]>(`/api/chat/percakapan/${idPercakapan}`)
    if (selectedPercakapanId.value === idPercakapan) {
      pesanList.value = data
      await scrollKeBawah()
    }
  } catch (err: any) {
    toast.add({
      id: 'chat-pesan-muat-gagal',
      title: 'Gagal memuat riwayat pesan',
      description: err?.data?.statusMessage || err?.statusMessage || 'Terjadi kesalahan saat mengambil pesan.',
      color: 'error'
    })
  } finally {
    loadingPesan.value = false
  }
}

async function muatPercakapan() {
  if (!loggedIn.value) return

  loadingPercakapan.value = true
  errorPercakapan.value = null
  try {
    const data = await muatDaftarPercakapanSaja()

    if (data.length === 0) {
      selectedPercakapanId.value = undefined
      pesanList.value = []
      return
    }

    const masihAda = data.some(item => item.idPercakapanChat === selectedPercakapanId.value)
    if (!masihAda) {
      selectedPercakapanId.value = data[0]?.idPercakapanChat
    }

    if (selectedPercakapanId.value) {
      await muatPesan(selectedPercakapanId.value)
    }
  } catch (err: any) {
    errorPercakapan.value = err?.data?.statusMessage || err?.statusMessage || 'Gagal memuat daftar percakapan.'
    toast.add({
      id: 'chat-muat-gagal',
      title: 'Gagal memuat percakapan',
      description: errorPercakapan.value ?? undefined,
      color: 'error'
    })
  } finally {
    loadingPercakapan.value = false
  }
}

async function buatPercakapanBaru() {
  if (!loggedIn.value || creatingPercakapan.value) return

  creatingPercakapan.value = true
  try {
    const percakapanBaru = await $fetch<PercakapanChat>('/api/chat/percakapan', {
      method: 'POST',
      body: {}
    })

    selectedPercakapanId.value = percakapanBaru.idPercakapanChat
    pesanList.value = []
    await muatDaftarPercakapanSaja()

    toast.add({
      id: 'chat-percakapan-dibuat',
      title: 'Percakapan baru dibuat',
      color: 'success'
    })
  } catch (err: any) {
    toast.add({
      id: 'chat-percakapan-gagal',
      title: 'Gagal membuat percakapan',
      description: err?.data?.statusMessage || err?.statusMessage || 'Terjadi kesalahan.',
      color: 'error'
    })
  } finally {
    creatingPercakapan.value = false
  }
}

async function pilihPercakapan(id: number | undefined) {
  selectedPercakapanId.value = id
  if (!id) {
    pesanList.value = []
    return
  }

  await muatPesan(id)
}

async function kirimPesan() {
  if (sendingPesan.value) return

  const isiPesan = pesanInput.value.trim()
  if (!isiPesan) {
    toast.add({
      id: 'chat-pesan-kosong',
      title: 'Pesan masih kosong',
      description: 'Tulis pertanyaan terlebih dahulu sebelum mengirim.',
      color: 'warning'
    })
    return
  }

  if (!loggedIn.value) return

  sendingPesan.value = true
  try {
    let idPercakapanAktif = selectedPercakapanId.value

    if (!idPercakapanAktif) {
      const percakapanBaru = await $fetch<PercakapanChat>('/api/chat/percakapan', {
        method: 'POST',
        body: {}
      })
      idPercakapanAktif = percakapanBaru.idPercakapanChat
      selectedPercakapanId.value = idPercakapanAktif
      pesanList.value = []
    }

    const hasil = await $fetch<KirimPesanResponse>('/api/chat/kirim', {
      method: 'POST',
      body: {
        idPercakapan: idPercakapanAktif,
        konten: isiPesan
      }
    })

    pesanList.value.push(hasil.pesanUser, hasil.pesanBot)
    pesanInput.value = ''
    await scrollKeBawah()
    await muatDaftarPercakapanSaja().catch(() => undefined)
  } catch (err: any) {
    toast.add({
      id: 'chat-kirim-gagal',
      title: 'Gagal mengirim pesan',
      description: err?.data?.statusMessage || err?.statusMessage || 'Terjadi kesalahan saat mengirim pesan.',
      color: 'error'
    })
  } finally {
    sendingPesan.value = false
  }
}

function bukaWidget() {
  isOpen.value = true
  if (loggedIn.value) {
    muatPercakapan()
  }
  scrollKeBawah()
}

function tutupWidget() {
  isOpen.value = false
}

function toggleWidget() {
  if (isOpen.value) {
    tutupWidget()
  } else {
    bukaWidget()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    tutupWidget()
  }
}

watch(loggedIn, (isLoggedIn) => {
  if (!isLoggedIn) {
    percakapanList.value = []
    selectedPercakapanId.value = undefined
    pesanList.value = []
    errorPercakapan.value = null
  } else if (isOpen.value) {
    muatPercakapan()
  }
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div>
    <!-- Panel Chatbot -->
    <section
      v-if="isOpen"
      aria-label="Panel Tanya eCom"
      class="fixed bottom-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-default bg-default shadow-lg"
    >
      <!-- Header Panel -->
      <div class="flex items-center justify-between border-b border-default bg-elevated px-4 py-3">
        <div>
          <h2 class="text-base font-semibold text-default">
            Tanya eCom
          </h2>
          <p class="text-xs text-muted">
            Bantuan informasi produk dan pesanan
          </p>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          aria-label="Tutup panel Tanya eCom"
          color="neutral"
          variant="ghost"
          size="sm"
          class="min-h-11 min-w-11 justify-center"
          @click="tutupWidget"
        />
      </div>

      <!-- Konten jika belum login -->
      <div
        v-if="!loggedIn"
        class="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center"
      >
        <p class="text-sm text-muted">
          Silakan masuk ke akun Anda terlebih dahulu untuk melihat dan membuat percakapan.
        </p>
        <UButton
          to="/login"
          label="Masuk ke Akun"
          color="primary"
          variant="solid"
          size="sm"
          class="min-h-11"
          @click="tutupWidget"
        />
      </div>

      <!-- Konten jika sudah login -->
      <template v-else>
        <!-- Pilihan & Tombol Percakapan Baru -->
        <div class="flex items-center gap-2 border-b border-default bg-muted/40 px-3 py-2.5">
          <USelect
            v-model="selectedPercakapanId"
            :items="percakapanItems"
            placeholder="Pilih percakapan"
            aria-label="Pilih percakapan"
            size="sm"
            :disabled="loadingPercakapan || percakapanItems.length === 0"
            class="min-w-0 flex-1"
            @update:model-value="pilihPercakapan"
          />
          <UButton
            icon="i-heroicons-plus"
            label="Baru"
            color="neutral"
            variant="outline"
            size="sm"
            :loading="creatingPercakapan"
            class="min-h-11 shrink-0"
            @click="buatPercakapanBaru"
          />
        </div>

        <!-- Area Riwayat Pesan -->
        <div
          ref="areaPesanRef"
          class="flex h-72 flex-col gap-3 overflow-y-auto px-4 py-3"
        >
          <div
            v-if="loadingPercakapan"
            class="my-auto text-center text-sm text-muted"
          >
            Memuat daftar percakapan...
          </div>

          <div
            v-else-if="errorPercakapan"
            class="my-auto text-center"
          >
            <p class="text-sm text-error">
              {{ errorPercakapan }}
            </p>
            <UButton
              label="Coba Lagi"
              color="neutral"
              variant="outline"
              size="sm"
              class="mt-2 min-h-11"
              @click="muatPercakapan"
            />
          </div>

          <UEmpty
            v-else-if="percakapanList.length === 0"
            icon="i-heroicons-chat-bubble-left-right"
            description="Belum ada percakapan. Klik tombol Baru untuk memulai percakapan."
            class="my-auto"
          />

          <div
            v-else-if="loadingPesan"
            class="my-auto text-center text-sm text-muted"
          >
            Memuat riwayat pesan...
          </div>

          <UEmpty
            v-else-if="pesanList.length === 0"
            icon="i-heroicons-chat-bubble-bottom-center-text"
            description="Belum ada pesan pada percakapan ini. Tulis pesan di bawah untuk mulai bertanya."
            class="my-auto"
          />

          <template v-else>
            <div
              v-for="pesan in pesanList"
              :key="pesan.idPesanChat"
              class="flex max-w-[85%] flex-col"
              :class="pesan.peran === 'User' ? 'ml-auto items-end' : 'mr-auto items-start'"
            >
              <span
                v-if="pesan.peran === 'Admin'"
                class="mb-1 text-xs font-medium text-warning"
              >
                Admin
              </span>
              <span
                v-else-if="pesan.peran === 'Bot'"
                class="mb-1 text-xs font-medium text-muted"
              >
                Bot
              </span>

              <div
                class="rounded-lg px-3 py-2 text-sm break-words whitespace-pre-wrap"
                :class="{
                  'bg-primary text-inverted': pesan.peran === 'User',
                  'bg-muted text-default': pesan.peran === 'Bot',
                  'border border-warning/40 bg-warning/10 text-default': pesan.peran === 'Admin'
                }"
              >
                {{ pesan.konten }}
              </div>
            </div>
          </template>
        </div>

        <!-- Form Kirim Pesan -->
        <form
          class="flex items-end gap-2 border-t border-default bg-default p-3"
          @submit.prevent="kirimPesan"
        >
          <UTextarea
            v-model="pesanInput"
            :rows="2"
            placeholder="Tulis pesan..."
            aria-label="Tulis pesan"
            :disabled="sendingPesan"
            class="min-w-0 flex-1"
            @keydown.enter.exact.prevent="kirimPesan"
          />
          <UButton
            type="submit"
            icon="i-heroicons-paper-airplane"
            label="Kirim"
            color="primary"
            variant="solid"
            size="sm"
            :loading="sendingPesan"
            :disabled="sendingPesan || !pesanInput.trim()"
            class="min-h-11 shrink-0"
          />
        </form>
      </template>
    </section>

    <!-- Floating Button Pojok Kanan Bawah -->
    <UButton
      :icon="isOpen ? 'i-heroicons-x-mark' : 'i-heroicons-chat-bubble-left-right'"
      :aria-label="isOpen ? 'Tutup Tanya eCom' : 'Buka Tanya eCom'"
      :aria-expanded="isOpen"
      color="primary"
      variant="solid"
      size="lg"
      class="fixed bottom-4 right-4 z-50 min-h-11 min-w-11 justify-center rounded-full shadow-md"
      @click="toggleWidget"
    />
  </div>
</template>
