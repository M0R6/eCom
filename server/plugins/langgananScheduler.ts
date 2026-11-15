const INTERVAL_MS = 60 * 60 * 1000
const globalScheduler = globalThis as unknown as { langgananScheduler?: NodeJS.Timeout }

// Memakai setInterval karena nitro.experimental.tasks butuh perubahan nuxt.config.ts (berkas bersama).
// Hanya cocok untuk server Node yang hidup terus, bukan serverless.
export default defineNitroPlugin(() => {
  if (globalScheduler.langgananScheduler) clearInterval(globalScheduler.langgananScheduler)

  const jalankan = async () => {
    try {
      const hasil = await prosesLanggananJatuhTempo()
      if (hasil.langganan > 0) console.info('[langganan] selesai', hasil)
    } catch (err) {
      console.error('[langganan] scheduler gagal', err)
    }
  }

  setTimeout(jalankan, 30_000)
  globalScheduler.langgananScheduler = setInterval(jalankan, INTERVAL_MS)
})
