export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const produk = await prisma.produk.findUnique({
    where: { idProduk: id },
    include: {
      gambarproduk: { orderBy: { urutanTampil: 'asc' } },
      kategori: true,
      profilpetani: {
        select: { idPetani: true, namaPertanian: true, alamat: true }
      }
    }
  })
  if (!produk) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }
  return produk
})
