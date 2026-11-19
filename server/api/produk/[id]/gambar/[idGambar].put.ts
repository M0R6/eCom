/**
 * Jadikan gambar tertentu sebagai gambar utama (urutanTampil = 1).
 * Gambar lain digeser satu urutan ke belakang.
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

  return await prisma.$transaction(async (tx) => {
    await tx.gambarproduk.updateMany({
      where: { idProduk: id },
      data: { urutanTampil: { increment: 1 } },
    })

    return tx.gambarproduk.update({
      where: { idGambarProduk: idGambar },
      data: { urutanTampil: 1 },
    })
  })
})
