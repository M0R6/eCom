export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const id = Number(getRouterParam(event, 'id'))

  const produk = await prisma.produk.findUnique({
    where: { idProduk: id },
    include: { gambarproduk: { orderBy: { urutanTampil: 'asc' } } },
  })
  if (!produk || produk.idProfilPetani !== profil.idPetani) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }
  return produk
})