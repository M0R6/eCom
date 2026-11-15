import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

const FOLDER_UPLOAD = join(process.cwd(), 'public', 'uploads', 'products')

export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID produk tidak valid' })
  }

  const produk = await prisma.produk.findUnique({
    where: { idProduk: id },
    include: { gambarproduk: true }
  })
  if (!produk || produk.idProfilPetani !== profil.idPetani) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }

  // Riwayat pesanan harus utuh, dan hapus produk akan menghapus itemlangganan karena FK cascade
  const [pernahDipesan, dipakaiLangganan] = await Promise.all([
    prisma.barangpesanan.count({ where: { idProduk: id } }),
    prisma.itemlangganan.count({
      where: { idProduk: id, langganan: { status: { in: ['Aktif', 'Jeda'] } } }
    })
  ])

  if (pernahDipesan > 0 || dipakaiLangganan > 0) {
    await prisma.produk.update({
      where: { idProduk: id },
      data: { status: 'Disembunyikan', diperbaruiPada: new Date() }
    })
    return { ok: true, disembunyikan: true }
  }

  await prisma.produk.delete({ where: { idProduk: id } })

  for (const g of produk.gambarproduk) {
    if (!g.tautanGambar.startsWith('/uploads/products/')) continue
    const path = join(process.cwd(), 'public', g.tautanGambar)
    if (!path.startsWith(FOLDER_UPLOAD)) continue
    await unlink(path).catch(() => undefined)
  }

  return { ok: true, disembunyikan: false }
})
