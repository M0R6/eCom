import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Hapus satu gambar produk (record DB + file di disk).
 */
export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const id = Number(getRouterParam(event, 'id'))
  const idGambar = Number(getRouterParam(event, 'idGambar'))

  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(idGambar) || idGambar <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })
  }

  const produk = await prisma.produk.findUnique({ where: { idProduk: id } })
  if (!produk || produk.idProfilPetani !== profil.idPetani) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }

  const gambar = await prisma.gambarproduk.findUnique({
    where: { idGambarProduk: idGambar },
  })
  if (!gambar || gambar.idProduk !== id) {
    throw createError({ statusCode: 404, statusMessage: 'Gambar tidak ditemukan' })
  }

  await prisma.gambarproduk.delete({ where: { idGambarProduk: idGambar } })

  // Hapus file fisik (best-effort: file mungkin sudah tidak ada)
  const filename = gambar.tautanGambar.split('/').pop()
  if (filename) {
    await unlink(join(process.cwd(), 'public', 'uploads', 'products', filename))
      .catch(() => undefined)
  }

  return { ok: true }
})
